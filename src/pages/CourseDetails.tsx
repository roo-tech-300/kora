import { useParams, Link } from 'react-router-dom';
import {
  ChevronRight,
  User,
  MapPin,
  Clock,
  Pencil,
  Download,
  CalendarDays,
  MoreVertical
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn, Badge, Card } from '../components/Common';
import { DUMMY_COURSES, DUMMY_STUDENTS, DUMMY_TEACHERS } from '../data/dummy';

export const CourseDetails = () => {
  const { id } = useParams();
  const course = DUMMY_COURSES.find(c => c.id === id);

  if (!course) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-slate-400">Course not found</p>
      </div>
    );
  }

  const teacher = DUMMY_TEACHERS.find(t => t.id === course.teacher_id);
  const enrolledStudents = DUMMY_STUDENTS.filter(s => s.course_id === course.id);

  // Static recent sessions for Demo
  const recentSessions = [
    { date: 'Friday, Oct 27', title: 'Algebraic Foundations II', attendance: '26/28', status: 'COMPLETED' },
    { date: 'Wednesday, Oct 25', title: 'Introduction to Functions', attendance: '24/28', status: 'COMPLETED' },
    { date: 'Monday, Oct 23', title: 'Weekly Assessment', attendance: '28/28', status: 'ARCHIVED' },
  ];

  return (
    <div className="space-y-8 animate-in pb-20">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest italic">
        <Link to="/admin/courses" className="text-slate-500 hover:text-indigo-400 transition-colors">Courses</Link>
        <ChevronRight size={12} className="text-slate-600" />
        <span className="text-white">{course.name}</span>
      </div>

      {/* Header section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight italic leading-none">{course.name}</h1>
          <div className="flex flex-wrap items-center gap-6 mt-4 text-[11px] font-bold text-slate-400 italic">
            <div className="flex items-center gap-2">
              <User size={14} className="text-indigo-500/70" />
              <span>{teacher?.name || 'Unassigned'}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-indigo-500/70" />
              <span className="uppercase">{course.room}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-indigo-500/70" />
              <span>{course.schedule}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="h-10 px-5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-black text-slate-300 hover:text-white hover:bg-slate-800 transition-all flex items-center gap-2 uppercase tracking-tighter italic">
            <Pencil size={14} /> Edit Details
          </button>
          <button className="h-10 px-5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-black text-slate-300 hover:text-white hover:bg-slate-800 transition-all flex items-center gap-2 uppercase tracking-tighter italic shadow-xl">
            <Download size={14} /> Export
          </button>
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

      {/* Bento Grid Top Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Enrolled Students Card */}
        <Card className="lg:col-span-3 p-6 flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors"></div>
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic mb-4">Enrolled Students</h3>
          <div className="flex items-end gap-3 mb-6">
            <span className="text-5xl font-black text-white tracking-tighter italic leading-none">{course.student_count}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 italic">Total Active</span>
          </div>

          <div className="flex -space-x-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center overflow-hidden z-10">
                <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="avatar" className="w-full h-full object-cover" />
              </div>
            ))}
            <div className="w-8 h-8 rounded-full bg-indigo-500/10 border-2 border-slate-900 flex items-center justify-center text-[9px] font-black text-indigo-400 z-0 italic">
              +{Math.max(0, course.student_count - 4)}
            </div>
          </div>
        </Card>

        {/* Attendance Rate */}
        <Card className="lg:col-span-3 p-6 flex flex-col items-center justify-center text-center group">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic mb-6 w-full text-left">Attendance Rate</h3>

          <div className="relative w-32 h-32 mb-6">
            <svg className="w-full h-full transform -rotate-90 pointer-events-none">
              <circle cx="64" cy="64" r="56" className="stroke-slate-800/50" strokeWidth="12" fill="none" />
              <circle
                cx="64"
                cy="64"
                r="56"
                className="stroke-indigo-500 transition-all duration-1000 ease-out"
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 56}`}
                strokeDashoffset={`${2 * Math.PI * 56 * (1 - course.attendance_rate / 100)}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-white tracking-tighter italic">{course.attendance_rate}%</span>
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest italic">Average</span>
            </div>
          </div>

          <p className="text-[10px] font-bold text-emerald-400 italic">Above Institutional average (82%)</p>
        </Card>

        {/* Recent Session History */}
        <Card className="lg:col-span-6 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-white tracking-tight italic">Recent Session History</h3>
            <button className="text-[10px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest transition-colors flex items-center gap-1 italic">
              View Full Log <ChevronRight size={12} />
            </button>
          </div>

          <div className="space-y-3">
            {recentSessions.map((session, i) => (
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
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-0.5">Present</p>
                  </div>
                  <Badge variant={session.status === 'COMPLETED' ? 'indigo' : 'info'} className="text-[9px] w-24 flex justify-center py-1.5 shadow-inner">
                    {session.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Student Performance Table */}
      <Card className="p-0 overflow-hidden">
        <div className="p-6 flex justify-between items-center border-b border-slate-800/50">
          <h3 className="text-lg font-bold text-white tracking-tight italic">Student Performance Preview</h3>
          <div className="flex items-center gap-2 text-slate-400">
            <button className="w-8 h-8 flex items-center justify-center hover:text-white transition-colors bg-slate-900 border border-slate-800 rounded-lg"><ChevronRight size={14} className="rotate-90" /></button>
            <button className="w-8 h-8 flex items-center justify-center hover:text-white transition-colors bg-slate-900 border border-slate-800 rounded-lg"><MoreVertical size={14} /></button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800/50 bg-slate-900/30">
                <th className="py-4 px-6 text-[9px] font-black text-slate-500 uppercase tracking-widest italic w-1/4">Student Name</th>
                <th className="py-4 px-6 text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Student ID</th>
                <th className="py-4 px-6 text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Last Attended</th>
                <th className="py-4 px-6 text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Attendance Rate</th>
                <th className="py-4 px-6 text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Status</th>
                <th className="py-4 px-6 text-[9px] font-black text-slate-500 uppercase tracking-widest italic text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {enrolledStudents.map((student, i) => (
                <tr key={student.id} className="hover:bg-slate-800/20 transition-colors group">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <img src={student.photo || `https://i.pravatar.cc/100?img=${i + 20}`} alt={student.name} className="w-8 h-8 rounded-full border border-slate-700 bg-slate-800" />
                      <div>
                        <p className="text-xs font-bold text-white italic group-hover:text-indigo-400 transition-colors">{student.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-[11px] font-bold text-slate-400 italic">#STU-2024-{student.id.padStart(3, '0')}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-[11px] font-bold text-slate-300 italic">Oct 27, 2023</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3 w-32">
                      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]",
                            student.attendance_rate < 50 ? "bg-rose-500" : student.attendance_rate < 80 ? "bg-amber-500" : "bg-indigo-500"
                          )}
                          style={{ width: `${student.attendance_rate}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-black text-white italic">{student.attendance_rate}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <Badge
                      variant={student.attendance_rate < 50 ? 'danger' : student.attendance_rate < 80 ? 'warning' : 'success'}
                      className="text-[8px] py-1 px-2.5 shadow-inner"
                    >
                      {student.attendance_rate < 50 ? 'AT RISK' : student.attendance_rate < 80 ? 'CONSISTENT' : 'EXCELLENT'}
                    </Badge>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button className="text-slate-500 hover:text-white transition-colors p-1">
                      <ChevronRight size={16} />
                    </button>
                  </td>
                </tr>
              ))}

              {/* Optional Empty State if no students */}
              {enrolledStudents.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 text-xs italic">
                    No students enrolled yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
};
