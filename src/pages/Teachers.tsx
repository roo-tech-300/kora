import { 
  Users, 
  ShieldCheck, 
  Zap, 
  Plus, 
  MoreVertical, 
  Mail,
  BookOpen,
  Award
} from 'lucide-react';
import { motion } from 'framer-motion';
import { DUMMY_TEACHERS } from '../data/dummy';
import { Badge, Card, StatCard, Tooltip } from '../components/Common';

export const Teachers = () => {
  return (
    <div className="space-y-10 animate-in">
      {/* Header & Primary Actions */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
           <Badge variant="indigo">Staff Infrastructure</Badge>
           <h1 className="text-3xl font-bold text-white tracking-tight mt-2 italic leading-none uppercase">Lecturers</h1>
           <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1.5 italic">Institutional Technical Lead Management</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="h-11 px-6 bg-indigo-600 rounded-xl text-xs font-black text-white hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-900/20 flex items-center gap-2 uppercase tracking-tighter italic">
              <Plus size={16} /> New Lecturer
          </button>
        </div>
      </div>

    

      {/* Main Inventory Table */}
      <Card title="Department Overview" className="overflow-hidden">
        <div className="overflow-x-auto -mx-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800/50 bg-slate-900/20">
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Identity</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Expertise</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Courses Assigned</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Status</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/30">
              {DUMMY_TEACHERS.map((teacher, i) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 5 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: i * 0.05 }}
                  key={teacher.id} 
                  className="group hover:bg-slate-900/40 transition-colors"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img src={teacher.photo} className="w-11 h-11 rounded-xl object-cover ring-2 ring-indigo-500/5 group-hover:scale-105 transition-transform shadow-2xl" alt="" />
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full shadow-[0_0_8px_#10b981]"></div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <Tooltip content={teacher.name} className="min-w-0">
                          <p className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors italic leading-none truncate">{teacher.name}</p>
                        </Tooltip>
                        <p className="text-[10px] font-bold text-slate-500 mt-1.5 uppercase tracking-widest italic flex items-center gap-1.5 line-clamp-1">
                          <Mail size={10} className="text-indigo-500" /> {teacher.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-wrap gap-2">
                      {teacher.subjects?.map(sub => (
                        <Badge key={sub} variant="indigo" className="text-[9px] px-2 py-0.5">{sub}</Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-center gap-3 text-[11px] font-black text-white italic tracking-tighter uppercase whitespace-nowrap">
                        {teacher.assigned_courses.length}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <Badge variant="success">IN HUB</Badge>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3 justify-end">
                      <button className="p-2 text-slate-600 hover:text-indigo-400 transition-colors bg-slate-950/40 rounded-lg hover:border-indigo-500/30 border border-transparent">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
