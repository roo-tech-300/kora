import { 
  Users, 
  BookOpen, 
  Bell, 
  Calendar, 
  UserCheck, 
  ArrowRight,
  Clock
} from 'lucide-react';
import { DUMMY_STUDENTS, DUMMY_COURSES, DUMMY_TEACHERS, DUMMY_SESSIONS, DUMMY_ATTENDANCE } from '../data/dummy';
import { Badge, Card, StatCard, Tooltip } from '../components/Common';
import { useAuth } from '../context/AuthContext';

export const AdminDashboard = () => {
  const { profile } = useAuth();
  const adminName = profile?.name || 'Admin';

  return (
    <div className="space-y-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <h1 className="text-3xl font-bold text-white tracking-tight italic">Good morning, {adminName}</h1>
           <p className="text-slate-500 mt-1.5 font-medium uppercase tracking-widest text-xs italic">Institutional overview for April 7, 2026</p>
        </div>
        <button className="flex items-center gap-2.5 px-6 py-3 bg-slate-900 border border-slate-800 rounded-xl text-xs font-black text-slate-300 hover:bg-slate-800 transition-all shadow-xl shadow-black/20 uppercase tracking-tighter italic">
          <Calendar size={16} className="text-indigo-400" />
          Academic Calendar
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label="Total Students" value="847" trend="12 new" icon={Users} variant="indigo" />
          <StatCard label="Courses Today" value="12" trend="Next: Physics 11C" icon={BookOpen} variant="purple" />
          <StatCard label="Active Sessions" value="3" trend="Concurrent streams" icon={UserCheck} variant="green" />
          <StatCard label="Absence Alerts" value="7" trend="Needs review" icon={Bell} variant="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Sessions and Spotlight */}
        <div className="lg:col-span-2 space-y-8">
          <Card 
            title="Today's Sessions" 
            action={<button className="text-indigo-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:text-white transition-all italic">View All <ArrowRight size={14} /></button>}
          >
            <div className="mt-4 space-y-1">
              <div className="grid grid-cols-5 gap-4 px-4 pb-4 text-left border-b border-slate-800/50">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic">Course</span>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic">Instructor</span>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic">Time</span>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic">Status</span>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic text-right">Attendance</span>
              </div>
              
              <div className="divide-y divide-slate-800/30">
                {DUMMY_SESSIONS.map((session, i) => {
                  const course = DUMMY_COURSES.find(c => c.id === session.course_id);
                  const teacher = DUMMY_TEACHERS.find(t => t.id === course?.teacher_id);
                  return (
                    <div key={i} className="group grid grid-cols-5 gap-4 items-center px-4 py-4 rounded-xl hover:bg-slate-800/20 transition-all cursor-pointer">
                      <div className="min-w-0">
                        <Tooltip content={course?.name || ''} className="min-w-0">
                          <p className="font-bold text-white group-hover:text-indigo-400 transition-colors italic truncate">{course?.name}</p>
                        </Tooltip>
                        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest italic truncate">{course?.room}</p>
                      </div>
                      <div className="min-w-0">
                        <Tooltip content={teacher?.name || ''} className="min-w-0">
                          <p className="text-sm font-semibold text-slate-400 italic truncate">{teacher?.name}</p>
                        </Tooltip>
                      </div>
                      <div className="text-sm font-semibold text-slate-500 italic">8:00 AM</div>
                      <div>
                        <Badge variant={session.status === 'active' ? 'indigo' : 'info'} className="text-[9px]">
                          {session.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 justify-end">
                        <div className="hidden sm:block flex-1 h-1 w-16 bg-slate-800 rounded-full overflow-hidden shadow-inner translate-y-0.5">
                          <div className="h-full bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.4)]" style={{ width: '85%' }}></div>
                        </div>
                        <span className="text-[11px] font-black text-slate-400 italic">26/28</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>

          {/* Spotlight Banner */}
          <div className="relative overflow-hidden bg-slate-900 border border-slate-800 rounded-3xl p-10 flex items-center justify-between group min-h-[300px] shadow-2xl">
             <div className="absolute top-0 right-0 w-1/2 h-full">
                <img 
                  src="https://images.unsplash.com/photo-1524178232363-1fb28f74b0cd?w=800&h=600&fit=crop" 
                  alt="Teaching" 
                  className="w-full h-full object-cover opacity-40 mix-blend-overlay group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-linear-to-r from-slate-900 via-slate-900/40 to-transparent"></div>
             </div>
             <div className="relative z-10 max-w-sm">
                <Badge variant="purple">Institutional Spotlight</Badge>
                <h2 className="text-4xl font-black text-white mt-8 mb-6 tracking-tighter italic leading-none">Excellence in <br/>Pedagogy</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest leading-relaxed mb-10 italic">
                  Recognition for Dr. Sarah Connor for achieving 100% biometric check-in accuracy over the last 30 days.
                </p>
                <button className="flex items-center gap-3 text-white text-[10px] font-black uppercase tracking-[0.3em] group/btn italic">
                  Read Case Study <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform text-indigo-400" />
                </button>
             </div>
          </div>
        </div>

        {/* Right Column: Recent Activity */}
        <div className="lg:col-span-1">
          <Card title="Recent Activity" action={<button className="text-slate-600 hover:text-white transition-colors"><Clock size={20} /></button>}>
            <div className="space-y-10 mt-6 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-px before:bg-slate-800/60">
              {DUMMY_ATTENDANCE.map((record, i) => {
                const student = DUMMY_STUDENTS.find(s => s.id === record.student_id);
                const session = DUMMY_SESSIONS.find(s => s.id === record.session_id);
                const course = DUMMY_COURSES.find(c => c.id === session?.course_id);
                return (
                  <div key={i} className="flex gap-5 relative group/item">
                    <img src={student?.photo} alt={student?.name} className="w-10 h-10 rounded-full border border-slate-800 shadow-xl relative z-10 group-hover/item:scale-110 transition-transform" />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <p className="text-sm font-bold text-white leading-none truncate italic">{student?.name}</p>
                        <Badge variant="success">PRESENT</Badge>
                      </div>
                      <p className="text-[10px] font-bold text-slate-500 mt-2 uppercase tracking-wide truncate italic">{course?.name} check-in</p>
                      <div className="flex items-center gap-2 mt-2 text-[9px] font-black text-slate-600 uppercase tracking-widest italic">
                         <span className="text-indigo-400/80">8:02 AM</span>
                         <span className="w-1 h-1 bg-slate-800 rounded-full"></span>
                         <span>Biometric Verify</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              <div className="flex gap-5 relative opacity-40 grayscale">
                <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700/50 flex items-center justify-center text-slate-600 relative z-10 transition-colors">
                   <UserCheck size={18} />
                </div>
                <div className="flex-1">
                   <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] italic mt-1">End of local buffer</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
