import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Fingerprint, 
  Search, 
  Plus, 
  MoreVertical, 
  ArrowRight,
  ShieldCheck,
  Zap,
  TrendingUp
} from 'lucide-react';
import { DUMMY_STUDENTS } from '../data/dummy';
import { Badge, Card, StatCard, cn, Tooltip } from '../components/Common';
import { motion } from 'framer-motion';

export const Students = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('All');

  const filteredStudents = DUMMY_STUDENTS.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         student.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === 'All' || student.level === filterLevel;
    return matchesSearch && matchesLevel;
  });

  const enrolledCount = DUMMY_STUDENTS.filter(s => s.fingerprint_enrolled).length;
  const coveragePercent = Math.round((enrolledCount / DUMMY_STUDENTS.length) * 100);

  return (
    <div className="space-y-10 animate-in">
      {/* Header & Primary Actions */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
           <Badge variant="indigo">Management Portal</Badge>
           <h1 className="text-3xl font-bold text-white tracking-tight mt-2 italic leading-none uppercase">Students</h1>
           <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1.5 italic">Institutional Biometric Node Management</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or Matric..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-11 bg-slate-900/50 border border-slate-800 rounded-xl pl-12 pr-4 text-white font-medium text-sm outline-none focus:border-indigo-500/50 focus:bg-slate-900 transition-all shadow-xl"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <select 
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="h-11 px-4 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 text-xs font-bold focus:border-indigo-500 outline-none transition-all cursor-pointer appearance-none"
            >
              <option value="All">All Levels</option>
              <option value="100">100 Level</option>
              <option value="200">200 Level</option>
              <option value="300">300 Level</option>
              <option value="400">400 Level</option>
              <option value="500">500 Level</option>
            </select>
            <Link to="/admin/students/new" className="h-11 px-6 bg-indigo-600 rounded-xl text-xs font-black text-white hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-900/20 flex items-center gap-2 uppercase tracking-tighter italic">
                <Plus size={16} /> Add Student
            </Link>
          </div>
        </div>
      </div>

      {/* Stats HUD */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <StatCard label="Total Inventory" value={DUMMY_STUDENTS.length.toString()} trend="+2 this week" icon={Users} variant="indigo" />
         <StatCard label="Biometric Coverage" value={`${coveragePercent}%`} trend="Target: 100%" icon={Fingerprint} variant="purple" />
         <StatCard label="Active Nodes" value="14" trend="Optimal Ping" icon={Zap} variant="green" />
         <StatCard label="Mesh Sensitivity" value="98.2%" trend="Stable" icon={ShieldCheck} variant="indigo" />
      </div>

      {/* Main Inventory Table */}
      <Card title="Student Manifest" subtitle="Full scale biometric registry" className="overflow-hidden">
        <div className="overflow-x-auto -mx-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800/50 bg-slate-900/20">
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Identity</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Biometrics</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Attendance Rate</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Nodes</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/30">
              {filteredStudents.map((student, i) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 5 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: i * 0.05 }}
                  key={student.id} 
                  className="group hover:bg-slate-900/40 transition-colors"
                >
                  <td className="px-6 py-5">
                    <Link to={`/admin/students/${student.id}`} className="flex items-center gap-4 group/item">
                      <div className="relative">
                        <img src={student.photo} className="w-11 h-11 rounded-xl object-cover ring-2 ring-indigo-500/5 group-hover/item:scale-105 transition-transform shadow-2xl" alt="" />
                        <div className={cn(
                          "absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-slate-950 rounded-full",
                          student.active ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-slate-700"
                        )}></div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <Tooltip content={student.name} className="min-w-0">
                          <p className="text-sm font-bold text-white group-hover/item:text-indigo-400 transition-colors italic leading-none truncate">{student.name}</p>
                        </Tooltip>
                        <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest italic group-hover/item:text-indigo-400/50">MATRIC: {student.id}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-white italic">{student.level} Level</span>
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">Course ID {student.course_id}</p>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    {student.fingerprint_enrolled ? (
                      <Badge variant="success" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">ENROLLED</Badge>
                    ) : (
                      <Badge variant="warning" className="bg-amber-500/10 text-amber-500 border-amber-500/20">PENDING</Badge>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                       <div className="flex-1 w-24 h-1 bg-slate-950 rounded-full overflow-hidden shadow-inner">
                          <div className={cn(
                            "h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(99,102,241,0.3)]",
                            student.attendance_rate > 90 ? "bg-indigo-500" :
                            student.attendance_rate > 70 ? "bg-purple-500" : "bg-rose-500"
                          )} style={{ width: `${student.attendance_rate}%` }} />
                       </div>
                       <span className="text-[11px] font-black text-white italic">{student.attendance_rate}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                     <div className="flex items-center gap-1.5 text-slate-500 group-hover:text-indigo-400 transition-colors">
                        <TrendingUp size={14} />
                        <span className="text-[10px] font-bold">Stable</span>
                     </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button className="p-2 text-slate-700 hover:text-white transition-colors">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Dummy */}
        <div className="mt-8 flex justify-between items-center px-2">
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest italic">Showing 1 - {filteredStudents.length} of {DUMMY_STUDENTS.length} nodes</span>
            <div className="flex items-center gap-4">
                <button className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic disabled:opacity-30 cursor-not-allowed">Previous</button>
                <div className="flex gap-2">
                    <div className="w-6 h-6 rounded-lg bg-indigo-500 flex items-center justify-center text-[10px] font-black text-white">1</div>
                    <div className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-[10px] font-black text-slate-400 hover:text-white transition-all cursor-pointer">2</div>
                </div>
                <button className="text-[10px] font-black text-indigo-400 uppercase tracking-widest italic flex items-center gap-1 group">Next <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" /></button>
            </div>
        </div>
      </Card>
    </div>
  );
};
