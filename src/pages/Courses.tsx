import { 
  Plus, 
  MapPin, 
  Clock, 
  User,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
  import { Badge, Card, Tooltip, Spinner } from '../components/Common';
import { TeacherDashboardPanel } from '../components/TeacherDashboardPanel';
import { getCourses } from '../lib/apis/courses/courses';
import { useEffect, useState } from 'react';
import { getInstitutionUsers } from '../lib/apis/auth/getInstitutionUsers';
import { useAuth } from '../context/AuthContext';

export const Courses = () => {
  const { profile } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [lecturers, setLecturers] = useState<any[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<any[]>([]);
  const [showMyCourses, setShowMyCourses] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(true)
  // Helper function to get next session based on current day/time
  const getNextSession = (schedule: any[]) => {
    if (!schedule || schedule.length === 0) return null;
    
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date().getDay();
    const now = new Date();
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

    // Filter active schedules
    const activeSchedule = schedule.filter(s => s.active);
    if (activeSchedule.length === 0) return null;

    // Check for class today after current time
    const todayClass = activeSchedule.find(slot => slot.day === today && slot.start > currentTime);
    if (todayClass) {
      return { day: days[todayClass.day], time: todayClass.start, isToday: true };
    }

    // Find next day with a class
    for (let i = 0; i < 7; i++) {
      const nextDay = (today + i + 1) % 7;
      const nextClass = activeSchedule.find(slot => slot.day === nextDay);
      if (nextClass) {
        return { day: days[nextClass.day], time: nextClass.start, isToday: false };
      }
    }

    return null;
  };

  // Helper function to format schedule display
  const getScheduleDisplay = (schedule: any[]) => {
    const nextSession = getNextSession(schedule);
    if (!nextSession) return 'No schedule';
    return `${nextSession.day} ${nextSession.time}`;
  };

  useEffect(() => {
    const fetchCourses = async () =>{
      try {
        setLoadingCourses(true)
        const courses = await getCourses();
        setCourses(courses);
      } catch (error) {
        console.log('Error fetching courses', error)
      } finally {
        setLoadingCourses(false)
      }
    }
    fetchCourses();

    const fetchStudents = async () =>{
      const students = await getInstitutionUsers();
      setLecturers(students);
    }
    fetchStudents();

  }, []);

  const getUserAssignedCourses = (userId: string) => {
    return courses.filter((course) => {
      const teacherIds = Array.isArray(course.teachers) ? course.teachers : [];
      return (
        teacherIds.includes(userId) ||
        course.teacher_id === userId ||
        course.teacherId === userId
      );
    });
  };

  // Filter courses based on current user role and toggle
  useEffect(() => {
    if (!profile || !courses) {
      setFilteredCourses(courses);
      return;
    }

    const isLecturer = profile.role === 'Lecturer';
    const isAdmin = profile.role === 'Admin';
    const assignedCourses = profile.documentId ? getUserAssignedCourses(profile.documentId) : [];
    const shouldShowMyCourses = isLecturer || (isAdmin && showMyCourses);

    setFilteredCourses(shouldShowMyCourses ? assignedCourses : courses);
  }, [profile, courses, showMyCourses]);

  const isLecturer = profile?.role === 'Lecturer';
  const isAdmin = profile?.role === 'Admin';
  const assignedCourses = profile?.documentId ? getUserAssignedCourses(profile.documentId) : [];
  const hasAssignedCourses = assignedCourses.length > 0;
  const showMyCoursesToggle = isAdmin && hasAssignedCourses;
  const showDashboard = Boolean(profile && (isLecturer || (isAdmin && showMyCourses)) && filteredCourses.length > 0);
  const pageTitle = isLecturer ? 'My Courses' : 'Courses';
  const pageBadge = isLecturer ? 'Lecturer Portal' : 'Academic Administration';

  
  return (
    <div className="space-y-8 animate-in pb-20">
      {/* Header & Primary Actions */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
           <Badge variant="indigo" className='mb-2'>{pageBadge}</Badge>
           <h1 className="text-3xl font-bold text-white tracking-tight italic leading-none uppercase">{pageTitle}</h1>
           <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2 italic">Academic Year 2023-24 &middot; Showing {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''}</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {showMyCoursesToggle && (
            <button
              onClick={() => setShowMyCourses(!showMyCourses)}
              className={`h-11 px-6 rounded-xl text-xs font-black uppercase tracking-tighter italic transition-all flex items-center gap-2 ${
                showMyCourses
                  ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-900/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {showMyCourses ? 'All Courses' : 'My Courses'}
            </button>
          )}
          {isAdmin && (
            <Link to="/admin/courses/new" className="h-11 px-6 bg-indigo-600 rounded-xl text-xs font-black text-white hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-900/20 flex items-center gap-2 uppercase tracking-tighter italic">
                <Plus size={16} /> Create Course
            </Link>
          )}
        </div>
      </div>

      {showDashboard && profile && (
        <TeacherDashboardPanel teacherName={profile.name || 'Teacher'} courses={filteredCourses} />
      )}
      
      {loadingCourses ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-12 flex items-center justify-center gap-3">
          <Spinner />
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Loading courses...</p>
        </div>
      ) : filteredCourses.length === 0 && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-8 text-slate-400">
          {isLecturer
            ? 'You have no assigned courses yet.'
            : 'No courses are available at the moment.'}
        </div>
      )}

      {/* Grid Iteration */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course, i) => {
          const teacherId = course.teacher_id || (Array.isArray(course.teachers) ? course.teachers[0] : undefined);
          const teacher = lecturers.find(t => t.id === teacherId);
          const courseLink = isAdmin ? `/admin/courses/${course.$id}` : `/teacher/class/${course.$id}`;
          
          return (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={course.id || course.$id || i}
            >
              <Link to={courseLink} className="block h-full">
                <Card className="p-6 group hover:border-indigo-500/30 transition-all cursor-pointer relative overflow-hidden flex flex-col h-full">
                  {/* Top Row: Subject & Attendance */}
                  <div className="flex justify-between items-start mb-6"> 
                    <Badge variant="indigo" className="uppercase text-[9px] font-black italic tracking-widest px-3 py-1">
                      {course.code}
                    </Badge>
                  </div>

                  {/* Main Identity */}
                  <div className="mb-6 flex-1">
                    <h3 className="text-xl font-bold text-white italic tracking-tight mb-2 group-hover:text-indigo-400 transition-colors">{course.title}</h3>
                    <p className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5 italic">
                      <User size={12} className="text-slate-500" /> {teacher?.name || 'Unassigned'}
                    </p>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <Tooltip content={course.venue}>
                      <div className="flex items-center gap-2 min-w-0">
                        <MapPin size={14} className="text-indigo-500/70 flex-shrink-0" />
                        <span className="text-[11px] font-bold text-slate-300 italic truncate">{course.venue}</span>
                      </div>
                    </Tooltip>
                    <div className="flex items-center gap-2 text-right justify-end">
                      <Clock size={14} className="text-indigo-500/70" />
                      <span className="text-[11px] font-bold text-slate-300 italic">{getScheduleDisplay(course.schedule)}</span>
                    </div>
                  </div>

                  {/* Bottom Row: Avatars & Count */}
                  <div className="flex justify-between items-center pt-4 border-t border-slate-800/50">
                    <div className="flex -space-x-2">
                      <div className="w-7 h-7 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-[8px] font-black text-indigo-300 z-30">JD</div>
                      <div className="w-7 h-7 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-[8px] font-black text-emerald-300 z-20">AK</div>
                      <div className="w-7 h-7 rounded-full bg-indigo-500/10 border-2 border-slate-900 flex items-center justify-center text-[8px] font-black text-indigo-400 z-10 italic">
                        +{(course.student_count - 2) || 0}
                      </div>
                    </div>
                    
                    <Badge variant="indigo" className="bg-slate-900 text-indigo-300 border-0 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 italic">
                      {course.student_count} Students
                    </Badge>
                  </div>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Paginator */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 pt-8 border-t border-slate-800/50">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">
          Showing <span className="text-white">6</span> of <span className="text-white">42</span> total courses
        </p>
        
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 flex items-center justify-center bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <ChevronLeft size={14} />
          </button>
          
          <button className="w-8 h-8 flex items-center justify-center bg-indigo-600 border border-indigo-500 text-white rounded-lg font-black text-[10px] shadow-lg shadow-indigo-900/20 italic">
            1
          </button>
          <button className="w-8 h-8 flex items-center justify-center bg-slate-900 border border-slate-800 rounded-lg text-slate-400 font-bold text-[10px] hover:text-white hover:bg-slate-800 transition-colors italic">
            2
          </button>
          <button className="w-8 h-8 flex items-center justify-center bg-slate-900 border border-slate-800 rounded-lg text-slate-400 font-bold text-[10px] hover:text-white hover:bg-slate-800 transition-colors italic">
            3
          </button>
          
          <button className="w-8 h-8 flex items-center justify-center bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
