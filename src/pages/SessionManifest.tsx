import { 
  MapPin, 
  ChevronRight, 
  MoreVertical, 
  Zap, 
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DUMMY_STUDENTS, DUMMY_COURSES } from '../data/dummy';
import { Badge, Card, cn, Tooltip } from '../components/Common';

export const SessionManifest = () => {
    return (
        <div className="space-y-10 animate-in">
            <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                <div>
                   <Badge variant="indigo">Departmental Intelligence</Badge>
                   <h2 className="text-3xl font-bold text-white tracking-tight mt-2 italic leading-tight uppercase">Session <span className="text-indigo-400">Manifests</span></h2>
                   <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1.5 italic">Real-time attendance node allocation</p>
                </div>
                <div className="flex gap-4">
                   <div className="group relative w-72">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" size={18} />
                      <input type="text" placeholder="Search nodes..." className="w-full h-11 bg-slate-900/50 border border-slate-800 rounded-xl pl-12 pr-4 text-white font-medium text-sm outline-none focus:border-indigo-500 focus:bg-slate-900 transition-all shadow-xl" />
                   </div>
                   <button className="flex items-center gap-2.5 px-6 py-3 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-900/20 active:scale-95 italic">
                      <Zap size={16} /> Sync All
                   </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
                {DUMMY_COURSES.map((course) => (
                    <Card key={course.id} className="hover:border-indigo-500/30 group relative overflow-hidden transition-all duration-500">
                        <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/5 blur-[80px] rounded-full group-hover:bg-indigo-500/10 transition-colors"></div>
                        
                        <div className="flex justify-between items-start mb-8 relative z-10">
                            <div>
                               <div className="flex items-center gap-4">
                                  <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl shadow-xl group-hover:scale-110 transition-transform"><Zap size={24} /></div>
                                  <div>
                                     <h3 className="text-xl font-bold text-white italic tracking-tight group-hover:text-indigo-400 transition-all">{course.name}</h3>
                                     <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1 italic flex items-center gap-1.5">
                                        <MapPin size={12} className="text-indigo-500" /> {course.room}
                                     </p>
                                  </div>
                               </div>
                            </div>
                            <div className="text-right">
                               <p className="text-2xl font-black text-white italic tracking-tighter leading-none">{course.student_count}</p>
                               <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic mt-1">Total Nodes</p>
                            </div>
                        </div>

                        <div className="space-y-4 pt-6 border-t border-slate-800/50 relative z-10">
                            <AnimatePresence>
                                {DUMMY_STUDENTS.slice(0, 3).map((student, idx) => (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} key={student.id} className="flex justify-between items-center p-4 bg-slate-950/20 rounded-2xl border border-slate-900 group/item hover:border-indigo-500/30 transition-all shadow-xl">
                                        <div className="flex items-center gap-4 min-w-0">
                                           <img src={student.photo} className="w-11 h-11 rounded-xl object-cover ring-2 ring-indigo-500/5 group-hover/item:scale-105 transition-transform shadow-2xl" alt="" />
                                           <div className="min-w-0">
                                              <Tooltip content={student.name} className="min-w-0">
                                                 <p className="text-sm font-bold text-white italic group-hover/item:text-indigo-300 transition-colors truncate leading-none">{student.name}</p>
                                              </Tooltip>
                                              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-2 italic">Institutional Verify</p>
                                           </div>
                                        </div>
                                        <div className="flex items-center gap-5">
                                            <div className="text-right">
                                               <p className="text-[11px] font-black text-white italic leading-none">{student.attendance_rate}%</p>
                                               <div className="w-12 bg-slate-950 h-1 rounded-full overflow-hidden mt-1.5 shadow-inner">
                                                  <div className={cn(
                                                    "h-full rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(99,102,241,0.3)]",
                                                    student.attendance_rate > 90 ? "bg-indigo-500" :
                                                    student.attendance_rate > 70 ? "bg-purple-500" : "bg-rose-500"
                                                  )} style={{ width: `${student.attendance_rate}%` }} />
                                               </div>
                                            </div>
                                            <button className="text-slate-700 hover:text-white transition-colors"><MoreVertical size={18} /></button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                        
                        <div className="mt-8 flex justify-between items-center relative z-10">
                            <div className="flex items-center gap-3">
                               <div className="flex -space-x-3">
                                  {DUMMY_STUDENTS.slice(3, 7).map((s, i) => (
                                     <img key={i} src={s.photo} className="w-8 h-8 rounded-lg object-cover border-2 border-slate-950 shadow-lg ring-1 ring-slate-800/50" alt="" />
                                  ))}
                               </div>
                               <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest italic">{course.student_count - 4} more nodes</span>
                            </div>
                            <button className="flex items-center gap-2 text-[10px] font-black text-indigo-400 hover:text-white uppercase tracking-widest transition-all group italic underline-offset-4 hover:underline">
                                EXPAND MANIFEST <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};
