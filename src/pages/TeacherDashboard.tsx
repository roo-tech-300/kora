import { 
  Users, 
  Zap, 
  Clock, 
  Plus, 
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { DUMMY_STUDENTS, DUMMY_CLASSES } from '../data/dummy';
import { Badge, Card, StatCard, cn, Tooltip } from '../components/Common';

export const TeacherDashboard = () => (
  <div className="space-y-10 animate-in">
    {/* Header Section */}
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div>
         <h1 className="text-3xl font-bold text-white tracking-tight italic">Good morning, Prof. Sarah</h1>
         <p className="text-slate-500 mt-1.5 font-medium uppercase tracking-widest text-xs italic">Physics Department • Lab 402-A</p>
      </div>
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2.5 px-6 py-3 bg-indigo-600 rounded-xl text-xs font-black text-white hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-900/20 uppercase tracking-tighter italic">
          <Plus size={16} />
          New Module
        </button>
      </div>
    </div>

    {/* Stats Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard label="Live Presence" value="24/28" trend="+2 since 8:00 AM" icon={Users} variant="indigo" />
        <StatCard label="Session Health" value="98%" trend="Optimal network" icon={Zap} variant="green" />
        <StatCard label="Next Session" value="44m" trend="Quantum Mechanics" icon={Clock} variant="purple" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Real-time Manifest */}
      <Card 
        className="lg:col-span-8" 
        title="Live Session Manifest" 
        subtitle="Robotics Lab 4 • Biometric Mesh active"
        action={<button className="text-indigo-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:text-white transition-all italic">Full Manifest <ArrowRight size={14} /></button>}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {DUMMY_STUDENTS.slice(0, 4).map((student, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: i * 0.05 }} 
              key={student.id} 
              className="flex justify-between items-center p-4 bg-slate-900/50 rounded-2xl border border-slate-800/50 hover:border-indigo-500/30 transition-all group relative overflow-hidden"
            >
               <div className="flex items-center gap-4 relative">
                  <div className="relative">
                     <img src={student.photo} className="w-12 h-12 rounded-xl object-cover ring-2 ring-indigo-500/10 group-hover:scale-110 transition-transform" alt="" />
                     <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                  </div>
                   <div className="min-w-0">
                     <Tooltip content={student.name} className="min-w-0">
                       <p className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors leading-tight truncate italic">{student.name}</p>
                     </Tooltip>
                     <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-1 italic">Verified check-in</p>
                   </div>
                </div>
                <Badge variant="success">IN LAB</Badge>
             </motion.div>
           ))}
        </div>
      </Card>

      <div className="lg:col-span-4 space-y-8">
        {/* Verification Status */}
        <Card title="Module Pipeline" subtitle="Homework decryption progress">
           <div className="space-y-4 mt-4">
              {['Neural Networks', 'Logic Circuits'].map(hw => (
                <div key={hw} className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 shadow-xl group hover:border-indigo-500/40 transition-all">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-3">
                       <BookOpen size={16} className="text-indigo-400" />
                       <span className="text-xs font-black text-white italic tracking-tight truncate">{hw}</span>
                    </div>
                    <span className="text-[10px] font-black text-indigo-400">82%</span>
                  </div>
                  <div className="h-1 bg-slate-950 rounded-full overflow-hidden shadow-inner">
                    <div className="h-full bg-indigo-500 w-[82%] shadow-[0_0_10px_rgba(99,102,241,0.3)]"></div>
                  </div>
                </div>
              ))}
           </div>
        </Card>

        {/* Schedule Index */}
        <Card title="Today's Schedule" subtitle="Assigned Logic Nodes">
           <div className="space-y-4 mt-4">
              {DUMMY_CLASSES.slice(0, 3).map((cls, idx) => (
                  <div key={cls.id} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-900/40 transition-all group cursor-pointer border border-transparent hover:border-slate-800">
                    <div className={cn(
                        "w-1 h-10 rounded-full",
                        idx === 0 ? "bg-indigo-500 shadow-[0_0_8px_#4f46e5]" : "bg-slate-800"
                    )}></div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                            <p className="text-sm font-bold text-white italic uppercase tracking-tighter truncate group-hover:text-indigo-400 transition-colors">{cls.name}</p>
                            <span className="text-[9px] font-black text-slate-600 uppercase italic shrink-0">{idx === 0 ? 'ACTIVE' : '12:30'}</span>
                        </div>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest truncate italic">{cls.room}</p>
                    </div>
                  </div>
              ))}
           </div>
        </Card>
      </div>
    </div>
  </div>
);
