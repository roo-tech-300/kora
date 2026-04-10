import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Fingerprint, 
  Mail, 
  Phone, 
  Calendar, 
  ChevronRight,
  Zap
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip 
} from 'recharts';
import { motion } from 'framer-motion';
import { DUMMY_STUDENTS, DUMMY_COURSES } from '../data/dummy';
import { Badge, Card } from '../components/Common';

const ATTENDANCE_HISTORY = [
  { name: 'W1', rate: 85 },
  { name: 'W2', rate: 92 },
  { name: 'W3', rate: 88 },
  { name: 'W4', rate: 94 },
  { name: 'W5', rate: 90 },
  { name: 'W6', rate: 95 },
  { name: 'W7', rate: 89 },
  { name: 'W8', rate: 91 },
];

const RECENT_SESSIONS = [
  { course: 'Math 10A', date: 'May 24, 2024', status: 'present', method: 'Fingerprint' },
  { course: 'Physics 11C', date: 'May 23, 2024', status: 'present', method: 'Fingerprint' },
  { course: 'Math 10A', date: 'May 22, 2024', status: 'absent', method: '—' },
  { course: 'Literature 09', date: 'May 21, 2024', status: 'present', method: 'Fingerprint' },
  { course: 'Chemistry 10B', date: 'May 20, 2024', status: 'present', method: 'Manual' },
];

export const StudentProfile = () => {
  const { id } = useParams();
  const student = DUMMY_STUDENTS.find(s => s.id === id) || DUMMY_STUDENTS[0];
  const course = DUMMY_COURSES.find(c => c.id === student.course_id);

  const initials = student.name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div className="space-y-8 animate-in pb-20">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link to="/admin/students" className="flex items-center gap-2 text-slate-500 hover:text-white font-bold uppercase tracking-widest text-[10px] transition-all group italic">
           <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Directory
        </Link>
        <div className="flex items-center gap-3">
          <button className="bg-slate-900 border border-slate-800 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 italic">Edit Profile</button>
          <Link to={`/admin/students/${student.id}/enroll`} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-900/20 active:scale-95 flex items-center gap-2 italic">
            <Fingerprint size={14} /> Re-enroll Biometrics
          </Link>
        </div>
      </div>

      {/* Profile Header HUD */}
      <div className="flex flex-col md:flex-row items-center gap-8 bg-slate-900/20 border border-slate-800/50 p-8 rounded-[2.5rem] relative overflow-hidden group">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full group-hover:bg-indigo-500/10 transition-colors"></div>
        
        <div className="relative">
          {student.photo ? (
            <img src={student.photo} className="w-32 h-32 rounded-4xl object-cover border-4 border-slate-900 shadow-2xl ring-2 ring-indigo-500/20" alt="" />
          ) : (
            <div className="w-32 h-32 rounded-4xl bg-slate-900 border-4 border-slate-800 flex items-center justify-center text-3xl font-black text-indigo-400 italic shadow-2xl ring-2 ring-indigo-500/20">
              {initials}
            </div>
          )}
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 border-4 border-slate-950 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)] flex items-center justify-center">
            <Zap size={14} className="text-white" />
          </div>
        </div>

        <div className="flex-1 text-center md:text-left relative z-10">
          <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
            <h1 className="text-4xl font-bold text-white tracking-tight italic leading-none truncate">{student.name}</h1>
            <Badge variant="success" className="uppercase tracking-widest text-[9px]">ENROLLED</Badge>
          </div>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 text-slate-500 font-bold uppercase tracking-widest text-[10px] italic">
            <span className="flex items-center gap-2">Level {student.level}</span>
            <span className="w-1.5 h-1.5 bg-slate-800 rounded-full"></span>
            <span className="flex items-center gap-2">{course?.name}</span>
            <span className="w-1.5 h-1.5 bg-slate-800 rounded-full"></span>
            <span className="flex items-center gap-2">ID: {student.id.padStart(4, '0')}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Sidebar: Meta Info */}
        <div className="lg:col-span-4 space-y-8">
          <Card title="Contact & Registration" subtitle="Institutional metadata registry">
             <div className="space-y-6 mt-4">
                <div className="group transition-all">
                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic mb-1">Guardian Identity</p>
                  <p className="text-white font-bold italic truncate flex items-center gap-2">
                    <Mail size={14} className="text-indigo-400" /> {student.guardian_email || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic mb-1">Emergency Frequency</p>
                  <p className="text-white font-bold italic flex items-center gap-2">
                    <Phone size={14} className="text-indigo-400" /> {student.emergency_contact || 'N/A'}
                  </p>
                </div>
                <div className="pt-6 border-t border-slate-800/50">
                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic mb-1">Enrolled Since</p>
                  <p className="text-white font-bold italic flex items-center gap-2">
                    <Calendar size={14} className="text-indigo-400" /> {student.enrollment_date || 'N/A'}
                  </p>
                </div>
             </div>
          </Card>

          <Card title="Biometric Status" subtitle="Hardware authentication node">
             <div className="mt-4 p-4 bg-slate-950/50 border border-slate-900 rounded-2xl group hover:border-indigo-500/30 transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 shadow-xl group-hover:scale-110 transition-transform">
                    <Fingerprint size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-white italic uppercase tracking-tighter">Primary Biometric Active</p>
                    <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mt-1 italic leading-none">Last sync: 2h ago</p>
                  </div>
                </div>
             </div>
          </Card>
        </div>

        {/* Right Content: Analytics & logs */}
        <div className="lg:col-span-8 space-y-8">
          <Card 
            title="Attendance Summary" 
            subtitle="Deep-learning presence persistence visualization"
            action={<span className="text-2xl font-black text-indigo-400 italic tracking-tighter">{student.attendance_rate}% <span className="text-[10px] text-slate-600 uppercase tracking-widest block text-right mt-1">Institutional Rate</span></span>}
          >
            <div className="h-[280px] mt-8">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ATTENDANCE_HISTORY}>
                  <defs>
                    <linearGradient id="rateGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="#1e293b" opacity={0.3} />
                  <XAxis dataKey="name" stroke="#475569" axisLine={false} tickLine={false} style={{ fontSize: '10px', fontWeight: 'bold' }} dy={10} />
                  <YAxis hide domain={[0, 100]} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '1rem', color: '#fff' }}
                    itemStyle={{ display: 'none' }}
                    labelStyle={{ fontSize: '10px', fontWeight: 'black', textTransform: 'uppercase', color: '#6366f1' }}
                  />
                  <Area type="monotone" dataKey="rate" stroke="#6366f1" strokeWidth={3} fill="url(#rateGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-3 gap-8 mt-8 border-t border-slate-800/50 pt-8 text-center">
               <div>
                  <p className="text-2xl font-black text-white italic">42</p>
                  <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-1 italic">Total Nodes</p>
               </div>
               <div>
                  <p className="text-2xl font-black text-emerald-500 italic">38</p>
                  <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-1 italic">Present</p>
               </div>
               <div>
                  <p className="text-2xl font-black text-rose-500 italic">4</p>
                  <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-1 italic">Absent</p>
               </div>
            </div>
          </Card>

          <Card 
            title="Recent Class Sessions" 
            subtitle="Raw biometric log decryption"
            action={<button className="text-[10px] font-black text-slate-500 hover:text-indigo-400 uppercase tracking-widest transition-all italic flex items-center gap-2">View Full Log <ChevronRight size={14} /></button>}
          >
            <div className="overflow-x-auto -mx-6 mt-6">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800/50 bg-slate-900/10">
                    <th className="px-6 py-4 text-[9px] font-black text-slate-600 uppercase tracking-widest italic">Course Identity</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-600 uppercase tracking-widest italic text-center">Protocol Date</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-600 uppercase tracking-widest italic text-center">Status</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-600 uppercase tracking-widest italic text-right">Method</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/30">
                  {RECENT_SESSIONS.map((session, i) => (
                    <motion.tr 
                      initial={{ opacity: 0, x: -10 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      transition={{ delay: i * 0.05 }}
                      key={i} 
                      className="group hover:bg-slate-900/40 transition-colors"
                    >
                      <td className="px-6 py-5">
                        <p className="text-sm font-bold text-white italic group-hover:text-indigo-400 transition-colors">{session.course}</p>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <p className="text-[10px] font-bold text-slate-500 italic">{session.date}</p>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <Badge variant={session.status === 'present' ? 'success' : 'danger'} className="uppercase tracking-tighter font-black italic px-2 py-0.5 text-[9px]">
                          {session.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">{session.method}</p>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
