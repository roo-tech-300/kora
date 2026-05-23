import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  ChevronRight,
  User,
  MapPin,
  Clock,
  Pencil,
  Download,
  Activity,
  Eye,
  CalendarDays,
  MoreVertical,
  Loader,
  X,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, Badge, Card, Spinner } from '../components/Common';
import { useAuth } from '../context/AuthContext';
import { getCourseById, updateCourse, replaceCourseTimetable } from '../lib/apis/courses/courses';
import { getInstitutionUsers } from '../lib/apis/auth/getInstitutionUsers';

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
  const [isActive, setIsActive] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editCode, setEditCode] = useState('');
  const [editVenue, setEditVenue] = useState('');
  const [editUnit, setEditUnit] = useState<string>('');
  const [schedule, setSchedule] = useState<any[]>(createDefaultWeeklySchedule());
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [acknowledgedClasses] = useState<{ dateIso: string; status: 'missed' | 'recorded' }[]>([]);

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
        instances.push({
          dayIndex,
          date: new Date(nextDate),
          dateIso: nextDate.toISOString().slice(0, 10),
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
      endDate: slot.endDate || ''
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
        teachers: selectedTeachers.map(t => t.$id),
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

  const recentSessions = (() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return scheduledInstances
      .filter((instance) => instance.date.getTime() < today.getTime())
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 3)
      .map((instance) => {
        const record = acknowledgedClasses.find((record) => record.dateIso === instance.dateIso);
        const status = record ? (record.status === 'missed' ? 'MISSED' : 'RECORDED') : 'PENDING';
        return {
          date: formatFriendlyDate(instance.date),
          title: `${instance.start} - ${instance.end}`,
          attendance: status === 'RECORDED' ? 'Recorded' : status === 'MISSED' ? 'Missed' : 'Pending',
          status,
        };
      });
  })();

  return (
    <div className={cn('space-y-8 animate-in', isTeacher ? 'pb-36' : 'pb-20')}>
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest italic">
        <Link to={backHref} className="text-slate-500 hover:text-indigo-400 transition-colors">{backLabel}</Link>
        <ChevronRight size={12} className="text-slate-600" />
        <span className="text-white">{sessionName}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <Badge variant="indigo" className="mb-3 uppercase text-[9px] font-black italic tracking-widest px-3 py-1">
            {course.code}
          </Badge>
          <h1 className="text-4xl font-bold text-white tracking-tight italic leading-none">{sessionName}</h1>
          <div className="flex flex-wrap items-center gap-6 mt-4 text-[11px] font-bold text-slate-400 italic">
            <div className="flex items-center gap-2">
              <User size={14} className="text-indigo-500/70" />
              <span>{teacherNames}</span>
            </div>
            {course.venue && (
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-indigo-500/70" />
                <span className="uppercase">{course.venue}</span>
              </div>
            )}
            {isTeacher && (
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-indigo-500/70" />
                <span className="uppercase">{isActive ? 'End Time: 11:30 AM' : 'Start Time: 10:00 AM'}</span>
              </div>
            )}
            {nextSession && (
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-indigo-500/70" />
                <span>{nextSession.label}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {isAdmin && (
              <button onClick={() => setIsEditOpen(true)} className="h-10 px-5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-black text-slate-300 hover:text-white hover:bg-slate-800 transition-all flex items-center gap-2 uppercase tracking-tighter italic">
                <Pencil size={14} /> Edit Details
              </button>
            )}

            {isTeacher && (
              <button className="h-10 px-5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-black text-slate-300 hover:text-white hover:bg-slate-800 transition-all flex items-center gap-2 uppercase tracking-tighter italic shadow-xl">
                <Download size={14} /> Import CSV
              </button>
            )}

            {isTeacher && (
              <button
                onClick={() => setIsActive(!isActive)}
                className={cn(
                  'h-10 px-5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-[0_10px_30px_rgba(0,0,0,0.15)] active:scale-95 italic flex items-center gap-2',
                  isActive ? 'bg-rose-500 hover:bg-rose-600 text-white' : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                )}
              >
                {isActive ? 'Close Session' : <><Activity size={16} /> Start Session</>}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-8 border-b border-slate-800/50 pb-px">
        {['Overview', 'Students', 'Schedule', 'Attendance'].map((tab, i) => (
          <button
            key={tab}
            className={cn(
              "pb-4 text-xs font-black uppercase tracking-widest italic transition-colors relative",
              i === 0 ? "text-indigo-400" : "text-slate-500 hover:text-slate-300"
            )}
          >
            {tab}
            {i === 0 && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-t-full shadow-[0_-2px_8px_rgba(99,102,241,0.5)]" />
            )}
          </button>
        ))}
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Schedule Card */}
        <Card className="lg:col-span-4 p-6 flex flex-col group relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-colors" />
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic mb-4">Upcoming Classes</h3>
          {upcomingClasses.length > 0 ? (
            <div className="space-y-2">
              {upcomingClasses.map((slot: any, i: number) => (
                <div key={`${slot.dayIndex}-${slot.start}-${i}`} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-800/50">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest italic w-8">{DAYS[slot.dayIndex]}</span>
                    <span className="text-[11px] font-bold text-white italic">{slot.start} – {slot.end}</span>
                  </div>
                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">{slot.dayIndex === new Date().getDay() ? 'Today' : 'Upcoming'}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[10px] font-bold text-slate-600 italic mt-2">No lectures for the rest of the week</p>
          )}
        </Card>

        {/* Teachers Card */}
        <Card className="lg:col-span-3 p-6 flex flex-col group">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic mb-4">Assigned Teachers</h3>
          {assignedTeachers.length > 0 ? (
            <div className="space-y-3">
              {assignedTeachers.map((t, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-[9px] font-black text-indigo-400 uppercase">
                    {t.name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white italic">{t.name}</p>
                    <p className="text-[9px] text-slate-500">{t.email}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[10px] font-bold text-slate-600 italic mt-2">No teachers assigned</p>
          )}
        </Card>

        {/* Recent Session History */}
        <Card className="lg:col-span-5 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-white tracking-tight italic">Recent Sessions</h3>
            <button className="text-[10px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest transition-colors flex items-center gap-1 italic">
              View Full Log <ChevronRight size={12} />
            </button>
          </div>
          <div className="space-y-3">
            {recentSessions.length > 0 ? (
              recentSessions.map((session, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-900/50 border border-slate-800/50 rounded-xl hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700 text-slate-400">
                      <CalendarDays size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white italic">{session.date}</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{session.title}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-xs font-black text-white italic">{session.attendance}</p>
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-0.5">Status</p>
                    </div>
                    <Badge
                      variant={session.status === 'RECORDED' ? 'success' : session.status === 'MISSED' ? 'danger' : 'info'}
                      className="text-[9px] w-24 flex justify-center py-1.5 shadow-inner"
                    >
                      {session.status}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-[10px] font-bold text-slate-600 italic mt-2">No past sessions available yet</p>
            )}
          </div>
        </Card>
      </div>

      <AnimatePresence>
        {isEditOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsEditOpen(false)}
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/70 p-4 pt-24 md:pt-28"
          >
            <motion.div
              initial={{ y: 20, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.98 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[calc(100vh-9rem)] rounded-3xl border border-slate-800/70 bg-slate-950/90 shadow-2xl shadow-black/50 p-8 overflow-y-auto overflow-x-hidden custom-scrollbar modal-scrollbar"
            >
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight italic">Edit Course Details</h2>
                  <p className="text-sm text-slate-500 uppercase tracking-widest italic mt-1">Update title, code, venue, and units</p>
                </div>
                <button onClick={() => setIsEditOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Course Title</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full h-12 bg-slate-900/70 border border-slate-800 rounded-xl px-4 text-white outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Course Code</label>
                  <input
                    type="text"
                    value={editCode}
                    onChange={(e) => setEditCode(e.target.value)}
                    className="w-full h-12 bg-slate-900/70 border border-slate-800 rounded-xl px-4 text-white outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Venue</label>
                  <input
                    type="text"
                    value={editVenue}
                    onChange={(e) => setEditVenue(e.target.value)}
                    className="w-full h-12 bg-slate-900/70 border border-slate-800 rounded-xl px-4 text-white outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Units</label>
                  <input
                    type="number"
                    min={0}
                    value={editUnit}
                    onChange={(e) => setEditUnit(e.target.value)}
                    className="w-full h-12 bg-slate-900/70 border border-slate-800 rounded-xl px-4 text-white outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              {/* Lecturer Picker */}
              <div className="mb-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-1">Select Lecturers</label>
                  <div className="flex flex-wrap gap-3 mt-3">
                    {lecturers.map((teacher) => {
                      const isSelected = !!selectedTeachers.find(t => t.$id === teacher.$id);
                      return (
                        <button
                          key={teacher.$id}
                          onClick={() => toggleTeacher(teacher)}
                          className={cn(
                            "w-14 h-14 rounded-2xl overflow-hidden border-2 transition-all p-0.5 relative",
                            isSelected ? "border-indigo-500 scale-110 shadow-lg shadow-indigo-500/20" : "border-transparent opacity-60 hover:opacity-100"
                          )}
                        >
                          <div className="w-full h-full bg-slate-800 flex items-center justify-center rounded-xl text-sm font-black text-indigo-300 italic">
                            {teacher.name ? teacher.name.slice(0, 2).toUpperCase() : 'U'}
                          </div>
                          {isSelected && (
                            <div className="absolute inset-0 bg-indigo-600/20 flex items-center justify-center">
                              <div className="bg-indigo-500 rounded-full p-0.5">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                              </div>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-1">Assigned Lecturers ({selectedTeachers.length})</label>
                  <div className="space-y-4 mt-3">
                    <AnimatePresence>
                      {selectedTeachers.map((teacher) => (
                        <motion.div
                          key={teacher.$id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="p-3 bg-slate-900/50 border border-slate-800 rounded-4xl relative overflow-hidden"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-800 shadow-xl shrink-0 bg-slate-800 flex items-center justify-center text-sm font-black text-indigo-300 italic">
                              {teacher.name ? teacher.name.slice(0, 2).toUpperCase() : 'U'}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="text-sm font-bold text-white italic truncate">{`${teacher.title || ''} ${teacher.name || ''}`}</h4>
                                  <p className="text-[10px] text-slate-500 mt-0.5 truncate">{teacher.email}</p>
                                </div>
                                <button onClick={() => toggleTeacher(teacher)} className="p-1.5 text-slate-600 hover:text-rose-500 transition-colors">
                                  <X size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <Card className="p-8">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <CalendarDays size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-white tracking-tight italic">Weekly Schedule</h3>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                    {schedule.map((slot, index) => (
                      <div key={slot.day} className={cn(
                        "flex flex-col items-start p-4 rounded-2xl border transition-all gap-4",
                        slot.active ? "bg-slate-900/30 border-slate-700/50" : "bg-transparent border-slate-800/30 opacity-60 hover:opacity-100"
                      )}>
                        <div className="flex items-center gap-3 w-full">
                          <button
                            onClick={() => toggleDay(index)}
                            className={cn(
                              "w-6 h-6 rounded-lg flex items-center justify-center border transition-all",
                              slot.active ? "bg-indigo-500 border-indigo-500 text-white" : "bg-slate-800 border-slate-700 text-transparent"
                            )}
                          >
                            <Check size={12} />
                          </button>
                          <span className="text-[12px] font-bold text-white italic uppercase tracking-wide">
                            {slot.day}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 gap-3 w-full">
                          <div className="flex items-center gap-2 bg-slate-950/40 px-3 py-2 rounded-2xl border border-slate-800/50">
                            <Clock size={14} className="text-indigo-400" />
                            <div>
                              <p className="text-[8px] uppercase text-slate-500 tracking-widest">Start</p>
                              <input
                                type="time"
                                value={slot.start}
                                onChange={(e) => updateTime(index, 'start', e.target.value)}
                                disabled={!slot.active}
                                className="bg-transparent border-none p-0 text-[11px] font-bold text-white outline-none disabled:opacity-50 w-full selection:bg-indigo-500/30 focus:ring-0 leading-none"
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-2 bg-slate-950/40 px-3 py-2 rounded-2xl border border-slate-800/50">
                            <Clock size={14} className="text-indigo-400" />
                            <div>
                              <p className="text-[8px] uppercase text-slate-500 tracking-widest">End</p>
                              <input
                                type="time"
                                value={slot.end}
                                onChange={(e) => updateTime(index, 'end', e.target.value)}
                                disabled={!slot.active}
                                className="bg-transparent border-none p-0 text-[11px] font-bold text-white outline-none disabled:opacity-50 w-full selection:bg-indigo-500/30 focus:ring-0 leading-none"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {saveError && <p className="text-sm text-rose-400 mb-4">{saveError}</p>}

              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <button
                  onClick={() => setIsEditOpen(false)}
                  className="h-12 px-5 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:border-slate-600 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveDetails}
                  disabled={isSaving}
                  className="h-11 px-8 bg-indigo-600 rounded-xl text-xs font-black text-white hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-900/20 flex items-center gap-2 uppercase tracking-tighter italic disabled:opacity-50"
                >
                  {isSaving ? <Spinner /> : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Course Info Table */}
      <Card className="p-0 overflow-hidden">
        <div className="p-6 flex justify-between items-center border-b border-slate-800/50">
          <h3 className="text-lg font-bold text-white tracking-tight italic">Course Information</h3>
          <button className="w-8 h-8 flex items-center justify-center hover:text-white transition-colors bg-slate-900 border border-slate-800 rounded-lg text-slate-400">
            <MoreVertical size={14} />
          </button>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { label: 'Course Title', value: course.title },
            { label: 'Course Code', value: course.code },
            { label: 'Units', value: course.unit ?? '—' },
            { label: 'Venue', value: course.venue || '—' },
            { label: 'Total Sessions', value: course.schedule?.length ?? 0 },
            { label: 'Scheduled Dates', value: scheduledInstances.length },
            { label: 'Assigned Teachers', value: assignedTeachers.length },
            { label: 'Course ID', value: course.$id },
          ].map(({ label, value }) => (
            <div key={label} className="p-4 bg-slate-900/40 rounded-xl border border-slate-800/50">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic mb-1">{label}</p>
              <p className="text-sm font-bold text-white italic truncate">{value}</p>
            </div>
          ))}
        </div>
      </Card>

      {isTeacher && (
        <div className="fixed bottom-0 left-0 right-0 bg-slate-950/90 backdrop-blur-2xl border-t border-slate-800 z-30 px-8 py-3 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-10">
            <div>
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest italic mb-0.5">Attendance Status</p>
              <p className="text-sm font-bold text-white italic"><span className="text-xl font-black text-emerald-400 tracking-tighter">18/24</span> Present</p>
            </div>
            <div className="hidden sm:block w-px h-8 bg-slate-800"></div>
            <div>
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest italic mb-0.5">Awaiting</p>
              <p className="text-sm font-bold text-white italic"><span className="text-xl font-black text-amber-500 tracking-tighter">6</span> Absent</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="h-9 px-4 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 italic">
              <Download size={12} /> Export CSV
            </button>
            <button className="h-9 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 italic shadow-lg">
              <Activity size={12} /> Manual Override
            </button>
            <button className="h-9 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 italic shadow-[0_5px_15px_rgba(99,102,241,0.3)]">
              <Eye size={12} /> Kiosk View
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
