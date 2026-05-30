import { Link } from 'react-router-dom';
import { Clock, TrendingUp } from 'lucide-react';
import { Badge, cn } from './Common';

type TeacherDashboardPanelProps = {
  teacherName: string;
  courses: any[];
};

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const getNextSession = (schedule: any[]) => {
  if (!schedule || schedule.length === 0) return null;

  const now = new Date();
  const currentDay = now.getDay();
  const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

  const activeSchedule = schedule.filter((slot) => slot.active);
  if (activeSchedule.length === 0) return null;

  const todayClass = activeSchedule.find((slot) => slot.day === currentDay && slot.start > currentTime);
  if (todayClass) {
    return { day: days[todayClass.day], time: todayClass.start, isToday: true };
  }

  for (let i = 1; i < 7; i += 1) {
    const nextDay = (currentDay + i) % 7;
    const nextClass = activeSchedule.find((slot) => slot.day === nextDay);
    if (nextClass) {
      return { day: days[nextClass.day], time: nextClass.start, isToday: false };
    }
  }

  return null;
};

export const TeacherDashboardPanel = ({ teacherName, courses }: TeacherDashboardPanelProps) => {
  const summaryCourses = courses.slice(0, 4);
  const courseCount = courses.length;

  return (
    <div className="space-y-8 animate-in pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight italic">Good morning, {teacherName}</h1>
          <p className="text-slate-500 mt-1.5 font-medium uppercase tracking-widest text-xs italic">
            You have {courseCount} course{courseCount !== 1 ? 's' : ''} assigned
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="flex justify-between items-end shrink-0">
            <h2 className="text-xl font-bold text-white tracking-tight italic">Today's Classes</h2>
            <button className="text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:text-white transition-colors italic">
              See All
            </button>
          </div>

          <div className="space-y-4 shrink-0">
            {summaryCourses.length === 0 ? (
              <div className="glass-card p-6 text-slate-400">No assigned classes available right now.</div>
            ) : (
              summaryCourses.map((course: any, index: number) => {
                const nextSession = getNextSession(course.schedule || []);
                const status = index === 1 ? 'ACTIVE' : index === 0 ? 'COMPLETED' : 'Open Session';
                const variant = index === 1 ? 'success' : index === 0 ? 'indigo' : 'slate';

                return (
                  <Link
                    key={course.$id || course.id || index}
                    to={`/teacher/class/${course.$id || course.id}`}
                    className={cn(
                      'glass-card flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-4 transition-all cursor-pointer',
                      index === 1 ? 'bg-indigo-500/2 border-indigo-500/20 hover:border-indigo-500/40' : 'hover:border-indigo-500/30'
                    )}
                  >
                    <div className="flex items-center gap-6">
                      <div>
                        <h3 className="text-lg font-bold text-white italic transition-colors group-hover:text-indigo-300">
                          {course.title || 'Untitled Course'}
                        </h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                            <Clock size={12} /> {nextSession?.time ?? 'TBD'}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                            {nextSession ? `${nextSession.day}` : 'No schedule'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge variant={variant} className="px-4 py-2 shadow-none">
                      {status.toUpperCase()}
                    </Badge>
                  </Link>
                );
              })
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
            <div className="glass-card p-8 bg-slate-950 border border-slate-800/60 shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic mb-4">Attendance Average</p>
              <h4 className="text-5xl font-black text-white tracking-tighter italic mb-4">94.2%</h4>
              <p className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 italic"><TrendingUp size={14} /> 2.1% from last week</p>
            </div>

            <div className="glass-card p-8 bg-indigo-950/30 border border-indigo-500/20 relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
              <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none"></div>
              <p className="text-[10px] font-black text-indigo-300/70 uppercase tracking-widest italic mb-4 relative z-10">Grading Progress</p>
              <h4 className="text-5xl font-black text-white tracking-tighter italic mb-4 relative z-10">88%</h4>
              <p className="text-xs font-bold text-indigo-200 flex items-center gap-1.5 italic relative z-10">12 papers remaining</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6 h-full">
          <div className="glass-card p-6 border-indigo-500/30 bg-indigo-500/20 relative overflow-hidden shrink-0 shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
            <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/10 blur-[50px] pointer-events-none"></div>
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest italic mb-3">Next Class In</p>
            <div className="flex items-end gap-3 mb-2">
              <h3 className="text-5xl font-black text-white italic tracking-tighter leading-none">44m</h3>
            </div>
            <p className="text-sm font-bold text-slate-400 italic">{summaryCourses[0]?.title || 'No upcoming class'}</p>
          </div>

          <div className="glass-card p-6 flex flex-col min-h-0 flex-1 shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
            <div className="flex justify-between items-end mb-6 shrink-0">
              <div>
                <h3 className="text-xl font-bold text-white italic tracking-tight">Attendance Ranking</h3>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic mt-1">Top Attendance Performers in your classes</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
              {[
                { name: 'Chidi Nwachukwu', rate: 100 },
                { name: 'Amara Obi', rate: 98 },
                { name: 'Kofi Mensah', rate: 96 },
                { name: 'Zainab Ali', rate: 95 },
                { name: 'Adeyemi John', rate: 92 }
              ].map((student, i) => (
                <div key={student.name} className="flex items-center gap-4 bg-slate-900/40 p-4 rounded-2xl border border-slate-800/50 hover:border-indigo-500/30 transition-all hover:bg-slate-900/80">
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 italic shadow-md',
                    i === 0 ? 'bg-emerald-500 text-white shadow-emerald-500/20' :
                      i === 1 ? 'bg-amber-500 text-white shadow-amber-500/20' :
                        i === 2 ? 'bg-slate-400 text-white shadow-slate-400/20' : 'bg-slate-800 text-slate-400 border border-slate-700'
                  )}>{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate italic">{student.name}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <div className="flex-1 h-1 bg-slate-950 rounded-full overflow-hidden shadow-inner">
                        <div className={cn('h-full rounded-full transition-all duration-1000', i === 0 ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : i < 3 ? 'bg-indigo-400' : 'bg-slate-500')} style={{ width: `${student.rate}%` }} />
                      </div>
                      <span className="text-[9px] font-black text-slate-400 uppercase italic shrink-0 w-8">{student.rate}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
