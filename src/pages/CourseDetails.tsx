import { useParams } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import { Loader } from 'lucide-react';
import { cn, Card, Badge } from '../components/Common';
import { useAuth } from '../context/AuthContext';
import { getCourseById, updateCourse, replaceCourseTimetable } from '../lib/apis/courses/courses';
import { getClassRecordsForCourse, createClassRecord, updateClassRecord } from '../lib/apis/courses/classes';
import { databases, ID } from '../lib/appwrite';
import { getInstitutionUsers } from '../lib/apis/auth/getInstitutionUsers';
import { getStudentsInCourse } from '../lib/apis/students/students';
import { getZonedCurrentMinutes, getZonedDateIso, getZonedDayIndex, getZonedCurrentTime } from '../lib/time/sessionClock';
import { useOffline } from '../context/OfflineContext';

// Modular components
import { CourseHeader } from '../components/course-details/CourseHeader';
import { CourseNavigation, type CourseTab } from '../components/course-details/CourseNavigation';
import { LiveSessionCard } from '../components/course-details/LiveSessionCard';
import { RecentSessions } from '../components/course-details/RecentSessions';
import { CourseInfo } from '../components/course-details/CourseInfo';
import { EditCourseModal } from '../components/course-details/EditCourseModal';
import { FullSessionLogModal } from '../components/course-details/FullSessionLogModal';
import { ActionModal } from '../components/course-details/ActionModal';

const WEEKLY_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const createDefaultWeeklySchedule = () => WEEKLY_DAYS.map(day => ({ day, active: false, start: '08:00', end: '10:00', startDate: '', endDate: '' }));

const normalizeWeeklySchedule = (scheduleRows: any[]) => {
  const normalized = createDefaultWeeklySchedule();
  if (!Array.isArray(scheduleRows)) return normalized;

  scheduleRows.forEach((slot: any) => {
    const dayIndex = typeof slot.day === 'number'
      ? slot.day
      : (typeof slot.day === 'string' && /^\d+$/.test(slot.day))
        ? Number(slot.day)
        : WEEKLY_DAYS.findIndex((name) => name.toLowerCase() === String(slot.day).toLowerCase());

    if (dayIndex < 0 || dayIndex >= WEEKLY_DAYS.length) return;

    normalized[dayIndex] = {
      day: WEEKLY_DAYS[dayIndex],
      active: slot.active === 'True' || slot.active === true,
      start: slot.start || '08:00',
      end: slot.end || '10:00',
      startDate: slot.startDate || '',
      endDate: slot.endDate || '',
    };
  });

  return normalized;
};

const parseIsoDate = (value: string) => {
  if (!value) return null;
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
};

const formatFriendlyDate = (date: Date) => {
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
};

const parseTimeToMinutes = (value: string) => {
  const raw = String(value || '').trim();
  if (!raw) return 0;

  const [hoursPart, minutesPart = '0'] = raw.split(':');
  let hours = Number(hoursPart);
  const minutes = Number(minutesPart);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) return 0;

  if (hours >= 1 && hours <= 12 && raw.length <= 2) {
    // Treat bare numbers like "4" as 4 PM for timetable entries.
    hours += 12;
  }

  if (hours === 12 && raw.length <= 2) {
    hours = 12;
  }

  return (hours * 60) + minutes;
};

const getNextWeekdayDate = (dayIndex: number, fromDate: Date) => {
  const next = new Date(fromDate);
  next.setHours(0, 0, 0, 0);
  const offset = (dayIndex - next.getDay() + 7) % 7;
  next.setDate(next.getDate() + offset);
  return next;
};

const getScheduledInstances = (scheduleRows: any[]) => {
  if (!Array.isArray(scheduleRows)) return [];
  const today = getZonedDateIso();
  const todayDate = new Date(today);

  return scheduleRows.flatMap((slot: any) => {
    const dayIndex = typeof slot.day === 'number'
      ? slot.day
      : (typeof slot.day === 'string' && /^\d+$/.test(slot.day))
        ? Number(slot.day)
        : WEEKLY_DAYS.findIndex((name) => name.toLowerCase() === String(slot.day).toLowerCase());

    const active = slot.active === 'True' || slot.active === true;
    if (!active || dayIndex < 0 || dayIndex > 6) return [];

    const rawStart = parseIsoDate(slot.startDate) || getNextWeekdayDate(dayIndex, todayDate);
    const rawEnd = parseIsoDate(slot.endDate) || todayDate;
    const startDate = new Date(rawStart);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(rawEnd);
    endDate.setHours(0, 0, 0, 0);
    const targetEnd = endDate < todayDate ? endDate : todayDate;
    if (startDate > targetEnd) return [];

    const instances: any[] = [];
    const nextDate = new Date(startDate);
    while (nextDate.getDay() !== dayIndex) {
      nextDate.setDate(nextDate.getDate() + 1);
    }

    while (nextDate <= targetEnd) {
      const year = nextDate.getFullYear();
      const month = String(nextDate.getMonth() + 1).padStart(2, '0');
      const day = String(nextDate.getDate()).padStart(2, '0');
      const dateIso = `${year}-${month}-${day}`;
      instances.push({
        dayIndex,
        timetable: slot.$id || '',
        date: new Date(nextDate),
        dateIso,
        start: slot.start || '08:00',
        end: slot.end || '10:00',
      });
      nextDate.setDate(nextDate.getDate() + 7);
    }

    return instances;
  }).sort((a, b) => a.date.getTime() - b.date.getTime());
};

const getNextSession = (schedule: any[]) => {
  if (!schedule || schedule.length === 0) return null;

  const currentDay = getZonedDayIndex();
  const currentTime = getZonedCurrentTime();

  const activeSchedule = schedule.filter((slot) => slot.active === 'True' || slot.active === true);
  if (activeSchedule.length === 0) return null;

  // Day indices are 0-6 (Sun-Sat)
  const todayClass = activeSchedule.find((slot) => {
    const dayIndex = typeof slot.day === 'number' ? slot.day : WEEKLY_DAYS.findIndex(d => d.toLowerCase() === String(slot.day).toLowerCase());
    return dayIndex === currentDay && slot.start > currentTime;
  });

  if (todayClass) {
    return { label: `Today ${todayClass.start}`, isToday: true };
  }

  for (let i = 1; i < 7; i += 1) {
    const nextDay = (currentDay + i) % 7;
    const nextClass = activeSchedule.find((slot) => {
      const dayIndex = typeof slot.day === 'number' ? slot.day : WEEKLY_DAYS.findIndex(d => d.toLowerCase() === String(slot.day).toLowerCase());
      return dayIndex === nextDay;
    });
    if (nextClass) {
      return { label: `${WEEKLY_DAYS[nextDay]} ${nextClass.start}`, isToday: false };
    }
  }

  return null;
};

const getCurrentSession = (schedule: any[], allRecords: any[]) => {
  if (!schedule || schedule.length === 0) return null;

  const currentDay = getZonedDayIndex();
  const currentMinutes = getZonedCurrentMinutes();
  const todayIso = getZonedDateIso();

  const activeSchedule = schedule.filter((slot) => slot.active === 'True' || slot.active === true);

  // Check for currently running scheduled session
  const scheduledSession = activeSchedule.find((slot) => {
    const dayIndex = typeof slot.day === 'number' ? slot.day : WEEKLY_DAYS.findIndex(d => d.toLowerCase() === String(slot.day).toLowerCase());
    if (dayIndex !== currentDay) return false;

    const startMinutes = parseTimeToMinutes(slot.start);
    const endMinutes = parseTimeToMinutes(slot.end);

    // Give a 15-minute buffer before and after
    return currentMinutes >= (startMinutes - 15) && currentMinutes <= (endMinutes + 15);
  });

  if (scheduledSession) {
    // Check if this specific instance is already "Done"
    const isDone = allRecords.some(r => r.timetable === scheduledSession.$id && r.date === todayIso && r.status === 'Done');
    if (!isDone) {
      return {
        ...scheduledSession,
        date: todayIso,
        title: `${scheduledSession.start} - ${scheduledSession.end}`,
        isScheduled: true,
      };
    }
  }

  // Check for active unscheduled session (Pending)
  const activeUnscheduled = allRecords.find(r => !r.timetable && r.date === todayIso && r.status === 'Pending');
  if (activeUnscheduled) {
    return {
      ...activeUnscheduled,
      start: activeUnscheduled.time,
      title: `${activeUnscheduled.time} - (Unscheduled)`,
      isScheduled: false,
    };
  }

  return null;
};

export const CourseDetails = () => {
  const { id } = useParams();
  // const navigate = useNavigate();
  const { profile } = useAuth();
  const { offline } = useOffline();
  const [course, setCourse] = useState<any>(null);
  const [lecturers, setLecturers] = useState<any[]>([]);
  const [selectedTeachers, setSelectedTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isActive] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editCode, setEditCode] = useState('');
  const [editVenue, setEditVenue] = useState('');
  const [editUnit, setEditUnit] = useState<string>('');
  const [schedule, setSchedule] = useState<any[]>(createDefaultWeeklySchedule());
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [allRecords, setAllRecords] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<CourseTab>('overview');

  // Modal states
  const [isFullLogOpen, setIsFullLogOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionModalType, setActionModalType] = useState<'report' | 'upload' | null>(null);
  const [selectedSession, setSelectedSession] = useState<any>(null);

  // Student states
  const [courseStudents, setCourseStudents] = useState<any[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState<string | null>(null);

  const isAdmin = profile?.role === 'Admin';
  const sessionName = course?.title || 'Course Details';

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      getCourseById(id),
      getInstitutionUsers(),
    ])
      .then(([courseData, users]) => {
        setCourse(courseData);
        setLecturers(users);
        // pre-select assigned teachers for edit
        const assigned = users.filter(u => (courseData as any).teachers && (courseData as any).teachers.includes(u.documentId || u.$id));
        setSelectedTeachers(assigned);
      })
      .catch(() => setError('Failed to load course.'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!course) return;
    const loadRecords = async () => {
      try {
        const records = await getClassRecordsForCourse(course.$id);
        setAllRecords(records);
      } catch (err) {
        console.error('Failed to load class records', err);
      }
    };
    loadRecords();
  }, [course]);

  // Sync edit form when course or modal state changes
  useEffect(() => {
    if (isEditOpen && course) {
      setEditTitle(course.title || '');
      setEditCode(course.code || '');
      setEditVenue(course.venue || '');
      setEditUnit(String(course.unit || ''));
      setSchedule(normalizeWeeklySchedule(course.schedule));
      
      const assigned = lecturers.filter(u => course.teachers && course.teachers.includes(u.documentId || u.$id));
      setSelectedTeachers(assigned);
    }
  }, [isEditOpen, course, lecturers]);

  // Load students
  useEffect(() => {
    if (!course?.$id) return;
    const loadStudents = async () => {
      try {
        setStudentsLoading(true);
        const data = await getStudentsInCourse(course.$id);
        setCourseStudents(data);
      } catch (err) {
        setStudentsError('Failed to load students');
      } finally {
        setStudentsLoading(false);
      }
    };
    loadStudents();
  }, [course]);

  const toggleDay = (index: number) => {
    setSchedule(prev => {
      const next = [...prev];
      next[index] = { ...next[index], active: !next[index].active };
      return next;
    });
  };

  const updateTime = (index: number, field: 'start' | 'end', value: string) => {
    setSchedule(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const toggleTeacher = (teacher: any) => {
    setSelectedTeachers(prev => {
      const isSelected = prev.some(t => (t.documentId || t.$id) === (teacher.documentId || teacher.$id));
      if (isSelected) {
        return prev.filter(t => (t.documentId || t.$id) !== (teacher.documentId || teacher.$id));
      } else {
        return [...prev, teacher];
      }
    });
  };

  const handleSaveDetails = async () => {
    if (!course) return;
    try {
      setIsSaving(true);
      setSaveError(null);

      const activeSlots = schedule.filter(s => s.active);

      await updateCourse(course.$id, {
        title: editTitle,
        code: editCode,
        venue: editVenue,
        unit: Number(editUnit) || 0,
        teachers: selectedTeachers.map(t => t.documentId || t.$id),
      });

      await replaceCourseTimetable(course.$id, activeSlots);

      const updated = await getCourseById(course.$id);
      setCourse(updated);
      setIsEditOpen(false);
    } catch (err) {
      setSaveError('Failed to save changes.');
    } finally {
      setIsSaving(false);
    }
  };

  const pastSessionStatuses = useMemo(() => {
    if (!course || !Array.isArray(course.schedule)) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const scheduledInstances = getScheduledInstances(course.schedule)
      .filter((instance) => instance.date.getTime() < today.getTime())
      .map((instance) => ({
        course: course.$id,
        timetable: String(instance.timetable || ''),
        date: instance.dateIso,
        time: instance.start || '00:00',
        end: instance.end || '00:00',
        isScheduled: true,
      }));

    const recordMap = new Map(allRecords.map((record) => [`${record.course}::${record.timetable || ''}::${record.date}`, record]));

    // Identify scheduled instances and their status
    const scheduledWithStatus = scheduledInstances.map((instance) => {
      const key = `${instance.course}::${instance.timetable}::${instance.date}`;
      const record = recordMap.get(key) as any;
      
      let status = 'PENDING';
      if (record) {
        if (record.status === 'Done') status = 'RECORDED';
        else if (record.status === 'Undone') status = 'MISSED';
        else status = 'PENDING';
      }
      
      return {
        ...instance,
        status,
      };
    });

    // Identify unscheduled records (those not in scheduledInstances)
    const scheduledKeys = new Set(scheduledInstances.map(i => `${i.course}::${i.timetable}::${i.date}`));
    const unscheduledSessions = allRecords
      .filter(record => !scheduledKeys.has(`${record.course}::${record.timetable || ''}::${record.date}`))
      .map(record => ({
        course: record.course,
        timetable: record.timetable || '',
        date: record.date,
        time: record.time || '00:00',
        status: 'RECORDED',
        isScheduled: false,
        title: record.time ? `${record.time} - (Unscheduled)` : 'Unscheduled Session'
      }));

    return [...scheduledWithStatus, ...unscheduledSessions];
  }, [course, allRecords]);

  const handleStartUnscheduledSession = async () => {
    if (!course) return;
    const dateIso = getZonedDateIso();
    const time = getZonedCurrentTime();

    const previousRecords = [...allRecords];
    const optimisticRecord = {
      $id: `temp-${Date.now()}`,
      course: course.$id,
      timetable: '',
      date: dateIso,
      time: time,
      status: 'Pending',
    };

    setAllRecords(prev => [...prev, optimisticRecord]);

    try {
      await createClassRecord({
        course: course.$id,
        timetable: '',
        date: dateIso,
        time: time,
      });
      const records = await getClassRecordsForCourse(course.$id);
      setAllRecords(records);
    } catch (err) {
      console.error('Failed to start unscheduled session', err);
      setAllRecords(previousRecords);
    }
  };

  const handleEndSession = async () => {
    if (!currentSession) return;
    const previousRecords = [...allRecords];

    setAllRecords(prev => {
      if (currentSession.$id) {
        return prev.map(r => r.$id === currentSession.$id ? { ...r, status: 'Done' } : r);
      } else {
        const newRecord = {
          $id: `temp-end-${Date.now()}`,
          course: currentSession.course,
          timetable: currentSession.timetable,
          date: currentSession.date,
          time: currentSession.start,
          status: 'Done',
        };
        return [...prev, newRecord];
      }
    });

    try {
      if (currentSession.$id) {
        await updateClassRecord(currentSession.$id, { status: 'Done' });
      } else if (currentSession.timetable) {
        await databases.createRow(
          import.meta.env.VITE_APPWRITE_DATABASE_ID,
          import.meta.env.VITE_APPWRITE_CLASSES_TABLE_ID,
          ID.unique(),
          {
            course: currentSession.course,
            timetable: currentSession.timetable,
            date: currentSession.date,
            time: currentSession.start,
            status: 'Done',
          }
        );
      }
      const records = await getClassRecordsForCourse(course.$id);
      setAllRecords(records);
    } catch (err) {
      console.error('Failed to end session', err);
      setAllRecords(previousRecords);
    }
  };

  // ── All derived/memoized values — must stay above early returns ──
  const assignedTeachers = useMemo(() =>
    lecturers.filter(l => course?.teachers && course.teachers.includes(l.documentId || l.$id)),
    [lecturers, course]
  );

  const currentUserId = profile?.documentId;
  const isCourseTeacher = Boolean(
    currentUserId && assignedTeachers.some(t => (t.documentId || t.$id) === currentUserId)
  );
  const canManageAttendance = isCourseTeacher || isAdmin;
  const backHref = canManageAttendance ? '/teacher' : '/admin/courses';
  const backLabel = canManageAttendance ? 'Dashboard' : 'Courses';
  const teacherNames = assignedTeachers.map(t => t.name).join(', ') || 'Unassigned';

  const nextSession = useMemo(() => getNextSession(course?.schedule || []), [course, allRecords]);
  const currentSession = useMemo(() => getCurrentSession(course?.schedule || [], allRecords), [course, allRecords]);
  const scheduledInstances = useMemo(() => getScheduledInstances(course?.schedule || []), [course]);

  const sortedPastSessions = useMemo(() => {
    return [...pastSessionStatuses].sort((a, b) => {
      const dateA = parseIsoDate(a.date) || new Date(a.date);
      const dateB = parseIsoDate(b.date) || new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });
  }, [pastSessionStatuses]);

  const previewSessions = useMemo(() => sortedPastSessions.slice(0, 3), [sortedPastSessions]);
  const hasMoreSessions = sortedPastSessions.length > 3;

  const recentSessions = useMemo(() => previewSessions.map((instance: any) => ({
    date: formatFriendlyDate(parseIsoDate(instance.date) || new Date(instance.date)),
    title: instance.title || `${instance.start || instance.time} - ${instance.end || 'TBD'}`,
    attendance: instance.status === 'RECORDED' ? 'Recorded' : instance.status === 'MISSED' ? 'Missed' : 'Pending',
    status: instance.status,
  })), [previewSessions]);

  const allSessionItems = useMemo(() => sortedPastSessions.map((instance: any) => ({
    date: formatFriendlyDate(parseIsoDate(instance.date) || new Date(instance.date)),
    title: instance.title || `${instance.start || instance.time} - ${instance.end || 'TBD'}`,
    attendance: instance.status === 'RECORDED' ? 'Recorded' : instance.status === 'MISSED' ? 'Missed' : 'Pending',
    status: instance.status,
  })), [sortedPastSessions]);

  const selectedSessionLabel = selectedSession
    ? `${selectedSession.date} - ${selectedSession.title}`
    : '';

  // ── Early returns — must come AFTER all hooks ──
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size={28} className="text-indigo-400 animate-spin" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-400 italic text-sm">{error || 'Course not found'}</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-8 animate-in', canManageAttendance ? 'pb-20' : 'pb-20')}>
      <CourseHeader
        course={course}
        sessionName={sessionName}
        teacherNames={teacherNames}
        isActive={isActive}
        setIsEditOpen={setIsEditOpen}
        onStartSession={handleStartUnscheduledSession}
        onEndSession={handleEndSession}
        isLive={Boolean(currentSession)}
        nextSession={nextSession}
        isTeacher={canManageAttendance}
        isAdmin={isAdmin}
        backHref={backHref}
        backLabel={backLabel}
      />

      <CourseNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <LiveSessionCard
              session={currentSession}
              scheduleRows={course.schedule}
              className="lg:col-span-5"
              onTakeAttendance={() => {
                if (currentSession) {
                  setActiveTab('attendance');
                  setSelectedSession({
                    date: currentSession.date,
                    title: currentSession.title,
                  });
                }
              }}
            />
            <RecentSessions
              recentSessions={recentSessions}
              hasMoreSessions={hasMoreSessions}
              setIsFullLogOpen={setIsFullLogOpen}
              setSelectedSession={setSelectedSession}
              setActionModalType={setActionModalType}
              setIsActionModalOpen={setIsActionModalOpen}
              className="lg:col-span-7"
            />
          </div>
          <CourseInfo
            course={course}
            assignedTeachersCount={assignedTeachers.length}
            scheduledInstancesCount={scheduledInstances.length}
          />
        </>
      )}

      {activeTab === 'students' && (
        <Card className="p-6">
          <h3 className="text-sm font-bold text-white tracking-tight italic mb-4">Enrolled Students</h3>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest italic">
            List of students currently enrolled in this course
          </p>
          <div className="mt-4">
            {studentsLoading ? (
              <div className="p-6 bg-slate-900/40 border border-slate-800/50 rounded-2xl text-slate-400 italic text-sm">
                Loading enrolled students...
              </div>
            ) : studentsError ? (
              <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-200 italic text-sm">
                {studentsError}
              </div>
            ) : courseStudents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courseStudents.map((student) => (
                  <div key={student.$id} className="p-4 bg-slate-900/40 border border-slate-800/50 rounded-2xl flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-white italic truncate">{student.name}</h4>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                        {student.matric_number || 'No matric number'}
                      </p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                        {student.department || 'No department'}
                      </p>
                    </div>
                    <Badge variant="success" className="text-[9px] px-3 py-1.5">
                      Enrolled
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 p-6 bg-slate-900/40 border border-slate-800/50 rounded-2xl text-slate-400 italic text-sm">
                {offline ? 'Offline data not available yet.' : 'No students are enrolled in this course yet.'}
              </div>
            )}
          </div>
        </Card>
      )}

      {activeTab === 'schedule' && (
        <Card className="p-6">
          <h3 className="text-sm font-bold text-white tracking-tight italic mb-4">Weekly Timetable Schedule</h3>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest italic mb-6">
            Active class timings and venue parameters
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {normalizeWeeklySchedule(course.schedule)
              .filter((slot) => slot.active)
              .map((slot) => (
                <div key={slot.day} className="p-4 bg-slate-900/40 border border-slate-800/50 rounded-2xl flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-wider italic">{slot.day}</h4>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                      {slot.start} - {slot.end}
                    </p>
                  </div>
                  <Badge variant="indigo">Active</Badge>
                </div>
              ))}
          </div>
        </Card>
      )}

      {activeTab === 'attendance' && (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight italic">Attendance Session History</h3>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest italic">
                Timeline list of all past class sessions
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {allSessionItems.length > 0 ? (
              allSessionItems.map((session, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-slate-900/50 border border-slate-800/50 rounded-xl gap-3">
                  <div>
                    <p className="text-xs font-bold text-white italic">{session.date}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{session.title}</p>
                  </div>
                  {session.status === 'PENDING' ? (
                    <div className="flex flex-wrap gap-2 justify-end">
                      <button
                        onClick={() => {
                          setSelectedSession(session);
                          setActionModalType('report');
                          setIsActionModalOpen(true);
                        }}
                        className="h-9 px-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
                      >
                        Report Missed
                      </button>
                      <button
                        onClick={() => {
                          setSelectedSession(session);
                          setActionModalType('upload');
                          setIsActionModalOpen(true);
                        }}
                        className="h-9 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
                      >
                        Upload CSV
                      </button>
                    </div>
                  ) : (
                    <Badge
                      variant={session.status === 'RECORDED' ? 'success' : 'danger'}
                      className="text-[9px] w-24 flex justify-center py-1.5 shadow-inner"
                    >
                      {session.status}
                    </Badge>
                  )}
                </div>
              ))
            ) : (
              <p className="text-[10px] font-bold text-slate-600 italic mt-2">No past sessions available yet.</p>
            )}
          </div>
        </Card>
      )}

      <EditCourseModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        lecturers={lecturers}
        selectedTeachers={selectedTeachers}
        toggleTeacher={toggleTeacher}
        editTitle={editTitle}
        setEditTitle={setEditTitle}
        editCode={editCode}
        setEditCode={setEditCode}
        editVenue={editVenue}
        setEditVenue={setEditVenue}
        editUnit={editUnit}
        setEditUnit={setEditUnit}
        schedule={schedule}
        toggleDay={toggleDay}
        updateTime={updateTime}
        isSaving={isSaving}
        saveError={saveError}
        handleSaveDetails={handleSaveDetails}
      />

      <FullSessionLogModal
        isOpen={isFullLogOpen}
        onClose={() => setIsFullLogOpen(false)}
        allSessionItems={allSessionItems}
        setSelectedSession={setSelectedSession}
        setActionModalType={setActionModalType}
        setIsActionModalOpen={setIsActionModalOpen}
      />

      <ActionModal
        isOpen={isActionModalOpen}
        onClose={() => {
          setIsActionModalOpen(false);
          setActionModalType(null);
          setSelectedSession(null);
        }}
        actionModalType={actionModalType}
        selectedSessionLabel={selectedSessionLabel}
      />
    </div>
  );
};
