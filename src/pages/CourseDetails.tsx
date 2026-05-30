import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Loader } from 'lucide-react';
import { cn, Card, Badge } from '../components/Common';
import { useAuth } from '../context/AuthContext';
import { getCourseById, updateCourse, replaceCourseTimetable } from '../lib/apis/courses/courses';
import { findExistingClassInstances } from '../lib/apis/courses/classes';
import { getInstitutionUsers } from '../lib/apis/auth/getInstitutionUsers';

// Modular components
import { CourseHeader } from '../components/course-details/CourseHeader';
import { CourseNavigation, type CourseTab } from '../components/course-details/CourseNavigation';
import { UpcomingClasses } from '../components/course-details/UpcomingClasses';
import { RecentSessions } from '../components/course-details/RecentSessions';
import { CourseInfo } from '../components/course-details/CourseInfo';
import { EditCourseModal } from '../components/course-details/EditCourseModal';
import { FullSessionLogModal } from '../components/course-details/FullSessionLogModal';
import { ActionModal } from '../components/course-details/ActionModal';
import { AttendanceBar } from '../components/course-details/AttendanceBar';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKLY_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const createDefaultWeeklySchedule = () => WEEKLY_DAYS.map(day => ({ day, active: false, start: '08:00', end: '10:00', startDate: '', endDate: '' }));

export const CourseDetails = () => {
  const { id } = useParams();
  const { profile } = useAuth();
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
  const [pastSessionStatuses, setPastSessionStatuses] = useState<any[]>([]);
  const [isFullLogOpen, setIsFullLogOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionModalType, setActionModalType] = useState<'report' | 'upload' | null>(null);
  const [selectedSession, setSelectedSession] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<CourseTab>('overview');

  const isTeacher = profile?.role === 'Lecturer';
  const isAdmin = profile?.role === 'Admin';
  const backHref = isTeacher ? '/teacher' : '/admin/courses';
  const backLabel = isTeacher ? 'Dashboard' : 'Courses';
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

  const toggleTeacher = (teacher: any) => {
    if (selectedTeachers.find((t) => t.$id === teacher.$id)) {
      setSelectedTeachers(selectedTeachers.filter((t) => t.$id !== teacher.$id));
    } else {
      setSelectedTeachers([...selectedTeachers, teacher]);
    }
  };

  const normalizeWeeklySchedule = (scheduleRows: any[]) => {
    const normalized = createDefaultWeeklySchedule();
    if (!Array.isArray(scheduleRows)) return normalized;

    scheduleRows.forEach((slot: any) => {
      const dayIndex = typeof slot.day === 'number'
        ? slot.day
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

  const getNextWeekdayDate = (dayIndex: number, fromDate: Date) => {
    const next = new Date(fromDate);
    next.setHours(0, 0, 0, 0);
    const offset = (dayIndex - next.getDay() + 7) % 7;
    next.setDate(next.getDate() + offset);
    return next;
  };

  const getScheduledInstances = (scheduleRows: any[]) => {
    if (!Array.isArray(scheduleRows)) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return scheduleRows.flatMap((slot: any) => {
      const dayIndex = typeof slot.day === 'number'
        ? slot.day
        : WEEKLY_DAYS.findIndex((name) => name.toLowerCase() === String(slot.day).toLowerCase());

      const active = slot.active === 'True' || slot.active === true;
      if (!active || dayIndex < 0 || dayIndex > 6) return [];

      const rawStart = parseIsoDate(slot.startDate) || getNextWeekdayDate(dayIndex, today);
      const rawEnd = parseIsoDate(slot.endDate) || today;
      const startDate = new Date(rawStart);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(rawEnd);
      endDate.setHours(0, 0, 0, 0);
      const targetEnd = endDate < today ? endDate : today;
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

  const getActiveScheduleForSave = () => schedule
    .filter((slot) => slot.active)
    .map((slot) => ({
      day: slot.day,
      start: slot.start,
      end: slot.end,
      startDate: slot.startDate || '',
      endDate: slot.endDate || '',
      active: true,
    }));

  const toggleDay = (index: number) => {
    const updated = [...schedule];
    updated[index] = { ...updated[index], active: !updated[index].active };
    setSchedule(updated);
  };

  const updateTime = (index: number, field: 'start' | 'end', value: string) => {
    const updated = [...schedule];
    updated[index] = { ...updated[index], [field]: value };
    setSchedule(updated);
  };

  useEffect(() => {
    if (!course) return;
    setEditTitle(course.title || '');
    setEditCode(course.code || '');
    setEditVenue(course.venue || '');
    setEditUnit(String(course.unit ?? ''));
    setSchedule(normalizeWeeklySchedule(course.schedule));
  }, [course]);

  useEffect(() => {
    if (!course || !Array.isArray(course.schedule)) {
      setPastSessionStatuses([]);
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const pastInstances = getScheduledInstances(course.schedule)
      .filter((instance) => instance.date.getTime() < today.getTime())
      .map((instance) => ({
        course: course.$id,
        timetable: String(instance.timetable || ''),
        date: instance.dateIso,
        start: instance.start,
        end: instance.end,
      }));

    const loadPastStatuses = async () => {
      try {
        const records = await findExistingClassInstances(course.$id, pastInstances);
        const recordMap = new Map(records.map((record) => [`${record.course}::${record.timetable}::${record.date}`, record]));

        setPastSessionStatuses(pastInstances.map((instance) => {
          const key = `${instance.course}::${instance.timetable}::${instance.date}`;
          const record = recordMap.get(key) as any;
          const status = record
            ? (record.occurred === false || String(record.occurred).toLowerCase() === 'false' ? 'MISSED' : 'RECORDED')
            : 'PENDING';
          return {
            ...instance,
            status,
          };
        }));
      } catch (err) {
        console.error('Failed to verify past class instances', err);
        setPastSessionStatuses(pastInstances.map((instance) => ({ ...instance, status: 'PENDING' })));
      }
    };

    loadPastStatuses();
  }, [course]);

  const handleSaveDetails = async () => {
    if (!course) return;
    setSaveError(null);
    setIsSaving(true);

    try {
      const parsedUnit = Number(editUnit);
      await updateCourse(course.$id, {
        title: editTitle,
        code: editCode,
        venue: editVenue,
        unit: Number.isNaN(parsedUnit) ? undefined : parsedUnit,
        teachers: selectedTeachers.map(t => t.documentId || t.$id),
      });

      const activeSchedule = getActiveScheduleForSave();
      await replaceCourseTimetable(course.$id, activeSchedule);

      const updatedCourse = await getCourseById(course.$id);
      setCourse(updatedCourse);
      setIsEditOpen(false);
    } catch (err) {
      setSaveError('Failed to update course details.');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

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

  // Resolve assigned teachers
  const assignedTeachers = lecturers.filter(l =>
    course.teachers && course.teachers.includes(l.documentId || l.$id)
  );
  const teacherNames = assignedTeachers.map(t => t.name).join(', ') || 'Unassigned';

  // Next session helper
  const getNextSession = (schedule: any[]) => {
    if (!schedule || schedule.length === 0) return null;
    const today = new Date().getDay();
    const now = new Date();
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    const active = schedule.filter(s => s.active === 'True' || s.active === true);
    if (!active.length) return null;
    const todayClass = active.find(s => s.day === today && s.start > currentTime);
    if (todayClass) return { label: `Today ${todayClass.start}`, isToday: true };
    for (let i = 1; i <= 7; i++) {
      const next = (today + i) % 7;
      const found = active.find(s => s.day === next);
      if (found) return { label: `${DAYS[found.day]} ${found.start}`, isToday: false };
    }
    return null;
  };

  const getUpcomingClasses = (scheduleRows: any[]) => {
    if (!Array.isArray(scheduleRows)) return [];

    const now = new Date();
    const today = now.getDay();
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

    const normalized = scheduleRows
      .map((slot: any) => {
        const dayIndex = typeof slot.day === 'number'
          ? slot.day
          : WEEKLY_DAYS.findIndex((name) => name.toLowerCase() === String(slot.day).toLowerCase());

        if (dayIndex < 0 || dayIndex > 6) return null;

        return {
          ...slot,
          dayIndex,
          active: slot.active === 'True' || slot.active === true,
          start: slot.start || '00:00',
          end: slot.end || '00:00',
        };
      })
      .filter((slot) => slot && slot.active) as any[];

    const upcoming = normalized.filter((slot) => {
      if (slot.dayIndex < today) return false;
      if (slot.dayIndex === today && slot.end <= currentTime) return false;
      return true;
    });

    upcoming.sort((a, b) => {
      if (a.dayIndex !== b.dayIndex) return a.dayIndex - b.dayIndex;
      return a.start.localeCompare(b.start);
    });

    return upcoming;
  };

  const nextSession = getNextSession(course.schedule);
  const upcomingClasses = getUpcomingClasses(course.schedule);
  const scheduledInstances = getScheduledInstances(course.schedule || []);

  const sortedPastSessions = [...pastSessionStatuses].sort((a, b) => {
    const dateA = parseIsoDate(a.date) || new Date(a.date);
    const dateB = parseIsoDate(b.date) || new Date(b.date);
    return dateB.getTime() - dateA.getTime();
  });
  const previewSessions = sortedPastSessions.slice(0, 3);
  const hasMoreSessions = sortedPastSessions.length > 3;

  const recentSessions = previewSessions.map((instance) => ({
    date: formatFriendlyDate(parseIsoDate(instance.date) || new Date(instance.date)),
    title: `${instance.start} - ${instance.end}`,
    attendance: instance.status === 'RECORDED' ? 'Recorded' : instance.status === 'MISSED' ? 'Missed' : 'Pending',
    status: instance.status,
  }));

  const allSessionItems = sortedPastSessions.map((instance) => ({
    date: formatFriendlyDate(parseIsoDate(instance.date) || new Date(instance.date)),
    title: `${instance.start} - ${instance.end}`,
    attendance: instance.status === 'RECORDED' ? 'Recorded' : instance.status === 'MISSED' ? 'Missed' : 'Pending',
    status: instance.status,
  }));

  const selectedSessionLabel = selectedSession
    ? `${selectedSession.date} · ${selectedSession.title}`
    : '';

  return (
    <div className={cn('space-y-8 animate-in', isTeacher ? 'pb-36' : 'pb-20')}>
      <CourseHeader
        course={course}
        sessionName={sessionName}
        teacherNames={teacherNames}
        isActive={isActive}
        setIsEditOpen={setIsEditOpen}
        nextSession={nextSession}
        isTeacher={isTeacher}
        isAdmin={isAdmin}
        backHref={backHref}
        backLabel={backLabel}
      />

      <CourseNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Tab Contents */}
      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <UpcomingClasses
              upcomingClasses={upcomingClasses}
              daysOfWeek={DAYS}
              className="lg:col-span-5"
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
          <div className="mt-4 p-6 bg-slate-900/40 border border-slate-800/50 rounded-2xl text-slate-400 italic text-sm">
            Student list view placeholder. Integrate student enrolment table/APIs here.
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

      {/* Modals */}
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

      {/* Bottom Attendance Toolbar */}
      <AttendanceBar isTeacher={isTeacher} />
    </div>
  );
};
