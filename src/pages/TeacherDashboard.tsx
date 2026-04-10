import {
  Users,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge, cn } from '../components/Common';

export const TeacherDashboard = () => (
  <div className="space-y-8 animate-in pb-10">
    {/* Header Section */}
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight italic">Good morning, Prof. Sarah</h1>
        <p className="text-slate-500 mt-1.5 font-medium uppercase tracking-widest text-xs italic">You have 3 classes scheduled for today</p>
      </div>
    </div>

    {/* Main Grid */}
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

      {/* Left Column (span 8) */}
      <div className="lg:col-span-8 flex flex-col gap-6">

        {/* Today's Classes Header */}
        <div className="flex justify-between items-end shrink-0">
          <h2 className="text-xl font-bold text-white tracking-tight italic">Today's Classes</h2>
          <button className="text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:text-white transition-colors italic">See All</button>
        </div>

        {/* Classes List */}
        <div className="space-y-4 shrink-0">
          {/* Card 1: Completed */}
          <Link to="/teacher/class/math-10a" className="glass-card flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-4 hover:border-indigo-500/30 transition-all cursor-pointer">
            <div className="flex items-center gap-6">
              <div>
                <h3 className="text-lg font-bold text-white italic group-hover:text-indigo-300 transition-colors">Math 10A</h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><Clock size={12} /> 8:00 AM</span>
                  <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><Users size={12} /> 26/28 Nodes</span>
                </div>
              </div>
            </div>
            <Badge variant="indigo" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 shadow-none px-4 py-2">COMPLETED</Badge>
          </Link>

          {/* Card 2: Active */}
          <Link to="/teacher/class/physics-11c" className="glass-card bg-indigo-500/2 border-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-4 relative overflow-hidden hover:border-indigo-500/40 transition-all cursor-pointer">
            <div className="absolute left-0 top-0 bottom-0 w-1 flex justify-center before:content-[''] before:w-1 before:h-8 before:bg-indigo-500 before:shadow-[0_0_15px_rgba(99,102,241,0.8)] before:rounded-full before:my-auto"></div>
            <div className="flex items-center gap-6 relative z-10">
              <div>
                <h3 className="text-lg font-bold text-white italic">Physics 11C</h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><Clock size={12} /> 10:00 AM</span>
                  <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><Users size={12} /> 18/24 Nodes</span>
                </div>
              </div>
            </div>
            <Badge variant="success" className="px-4 py-2 shadow-[0_0_15px_rgba(16,185,129,0.15)] relative z-10"><span className="w-1.5 h-1.5 inline-block rounded-full bg-emerald-400 mr-2 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>ACTIVE</Badge>
          </Link>

          {/* Card 3: Coming Up */}
          <Link to="/teacher/class/english-9b" className="glass-card flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-4 opacity-80 hover:opacity-100 transition-opacity hover:border-indigo-500/30 cursor-pointer">
            <div className="flex items-center gap-6">
              <div>
                <h3 className="text-lg font-bold text-white italic">English 9B</h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><Clock size={12} /> 1:00 PM</span>
                  <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                  <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest">Starts in 2h</span>
                </div>
              </div>
            </div>
            <Badge variant="slate" className="bg-slate-800/80 text-slate-300 border-slate-700/80 px-4 py-2">Open Session</Badge>
          </Link>


          {/* Card 4: Coming Up */}
          <Link to="/teacher/class/economics-10b" className="glass-card flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-4 opacity-80 hover:opacity-100 transition-opacity hover:border-indigo-500/30 cursor-pointer">
            <div className="flex items-center gap-6">
              <div>
                <h3 className="text-lg font-bold text-white italic">Economics 10B</h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><Clock size={12} /> 1:00 PM</span>
                  <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                  <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest">Starts in 2h</span>
                </div>
              </div>
            </div>
            <Badge variant="slate" className="bg-slate-800/80 text-slate-300 border-slate-700/80 px-4 py-2">Open Session</Badge>
          </Link>
        </div>

        {/* Stat Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
          {/* Attendance Stat */}
          <div className="glass-card p-8 bg-slate-950 border border-slate-800/60 shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic mb-4">Attendance Average</p>
            <h4 className="text-5xl font-black text-white tracking-tighter italic mb-4">94.2%</h4>
            <p className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 italic"><TrendingUp size={14} /> 2.1% from last week</p>
          </div>

          {/* Grading Progress Stat */}
          <div className="glass-card p-8 bg-indigo-950/30 border border-indigo-500/20 relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none"></div>
            <p className="text-[10px] font-black text-indigo-300/70 uppercase tracking-widest italic mb-4 relative z-10">Grading Progress</p>
            <h4 className="text-5xl font-black text-white tracking-tighter italic mb-4 relative z-10">88%</h4>
            <p className="text-xs font-bold text-indigo-200 flex items-center gap-1.5 italic relative z-10">12 papers remaining</p>
          </div>
        </div>

      </div>

      {/* Right Column (span 4) */}
      <div className="lg:col-span-4 flex flex-col gap-6 h-full">

        {/* Next Class Card (Replaces Absence Alerts) */}
        <div className="glass-card p-6 border-indigo-500/30 bg-indigo-500/20 relative overflow-hidden shrink-0 shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
          <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/10 blur-[50px] pointer-events-none"></div>
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest italic mb-3">Next Class In</p>
          <div className="flex items-end gap-3 mb-2">
            <h3 className="text-5xl font-black text-white italic tracking-tighter leading-none">44m</h3>
          </div>
          <p className="text-sm font-bold text-slate-400 italic">Quantum Mechanics</p>
        </div>

        {/* Hierarchy Leaderboard (Replaces Verification Chart) */}
        <div className="glass-card p-6 flex flex-col min-h-0 flex-1 shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
          <div className="flex justify-between items-end mb-6 shrink-0">
            <div>
              <h3 className="text-xl font-bold text-white italic tracking-tight">Attendance Ranking</h3>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic mt-1">Top Attendance Performers in all your classes</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
            {[
              { name: "Chidi Nwachukwu", rate: 100, streak: "24 Days" },
              { name: "Amara Obi", rate: 98, streak: "18 Days" },
              { name: "Kofi Mensah", rate: 96, streak: "12 Days" },
              { name: "Zainab Ali", rate: 95, streak: "10 Days" },
              { name: "Adeyemi John", rate: 92, streak: "8 Days" }
            ].map((student, i) => (
              <div key={student.name} className="flex items-center gap-4 bg-slate-900/40 p-4 rounded-2xl border border-slate-800/50 hover:border-indigo-500/30 transition-all hover:bg-slate-900/80">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 italic shadow-md",
                  i === 0 ? "bg-emerald-500 text-white shadow-emerald-500/20" :
                    i === 1 ? "bg-amber-500 text-white shadow-amber-500/20" :
                      i === 2 ? "bg-slate-400 text-white shadow-slate-400/20" : "bg-slate-800 text-slate-400 border border-slate-700"
                )}>{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate italic">{student.name}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <div className="flex-1 h-1 bg-slate-950 rounded-full overflow-hidden shadow-inner">
                      <div className={cn("h-full rounded-full transition-all duration-1000", i === 0 ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" : i < 3 ? "bg-indigo-400" : "bg-slate-500")} style={{ width: `${student.rate}%` }}></div>
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
