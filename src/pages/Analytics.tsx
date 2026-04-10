import { 
  Users, 
  Calendar, 
  TrendingUp, 
  ShieldCheck, 
  Clock,
  ArrowRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { Card, StatCard, Badge } from '../components/Common';

const DATA_BY_GRADE = [
  { name: '10th Grade', rate: 94, color: '#6366f1' },
  { name: '11th Grade', rate: 91, color: '#818cf8' },
  { name: '12th Grade', rate: 89, color: '#4f46e5' },
];

export const Analytics = () => {
  return (
    <div className="space-y-10 animate-in">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <Badge variant="indigo">Deep Intelligence</Badge>
           <h1 className="text-3xl font-bold text-white tracking-tight mt-2 italic leading-tight uppercase">Presence <span className="text-indigo-400">Analytics</span></h1>
           <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1.5 italic">Institutional Meta-Data Visualization</p>
        </div>
        <button className="flex items-center gap-2.5 px-6 py-3 bg-slate-900 border border-slate-800 rounded-xl text-xs font-black text-slate-300 hover:bg-slate-800 transition-all shadow-xl shadow-black/20 uppercase tracking-tighter italic">
          <Calendar size={16} className="text-indigo-400" />
          Export Reports
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Institutional GPA" value="3.92" trend="+0.2 Δ" icon={TrendingUp} variant="indigo" />
        <StatCard label="Mesh Reliability" value="99.9%" trend="Zero Lag" icon={ShieldCheck} variant="green" />
        <StatCard label="Total Attendance" value="1,402" trend="+42 today" icon={Users} variant="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Retention / Presence Area Chart */}
        <Card className="lg:col-span-8" title="Presence Persistence" subtitle="Long-term biometric stability across institutional nodes">
          <div className="h-[350px] mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[
                { name: 'W1', active: 840 },
                { name: 'W2', active: 940 },
                { name: 'W3', active: 1100 },
                { name: 'W4', active: 1050 },
              ]}>
                <defs>
                  <linearGradient id="activeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="#1e293b" opacity={0.3} />
                <XAxis dataKey="name" stroke="#475569" axisLine={false} tickLine={false} style={{ fontSize: '10px', fontWeight: 'bold' }} dy={10} />
                <YAxis stroke="#475569" axisLine={false} tickLine={false} style={{ fontSize: '10px', fontWeight: 'bold' }} dx={-10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '1rem', color: '#fff', fontSize: '12px' }} 
                  itemStyle={{ color: '#818cf8' }}
                  cursor={{ stroke: '#4f46e5', strokeWidth: 1 }}
                />
                <Area type="monotone" dataKey="active" stroke="#6366f1" strokeWidth={3} fill="url(#activeGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Level Distribution Bar Chart */}
        <Card className="lg:col-span-4" title="Segment Distribution" subtitle="Biometric saturation per level cluster">
          <div className="h-[350px] mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DATA_BY_GRADE}>
                <XAxis dataKey="name" hide />
                <YAxis hide />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#0f172a', border: 'none' }} />
                <Bar dataKey="rate" radius={[8, 8, 8, 8]} barSize={40}>
                  {DATA_BY_GRADE.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} opacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-8 space-y-3">
                {DATA_BY_GRADE.map(grade => (
                    <div key={grade.name} className="flex justify-between items-center p-3 bg-slate-900/50 rounded-xl border border-slate-800 shadow-xl transition-all hover:bg-slate-900">
                        <div className="flex items-center gap-3">
                             <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: grade.color }}></div>
                             <span className="text-[10px] font-bold text-white italic uppercase tracking-widest">{grade.name}</span>
                        </div>
                        <span className="text-xs font-black text-indigo-400 italic">{grade.rate}% MESH</span>
                    </div>
                ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1,2,3].map(i => (
            <Card 
              key={i} 
              title={`Q${i} Status Report`} 
              subtitle="Analytical biometric buffer" 
              action={<button className="text-slate-600 hover:text-indigo-400 transition-colors"><ArrowRight size={18} /></button>}
            >
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-indigo-500/10 rounded-xl"><Clock size={20} className="text-indigo-400" /></div>
                  <p className="text-slate-400 text-[11px] font-medium leading-relaxed italic">Generated via Kora 8 Mesh Engine for {i % 2 === 0 ? 'Faculty' : 'Students'}.</p>
                </div>
                <div className="flex justify-between items-center pt-5 border-t border-slate-800/50">
                    <Badge variant="purple">EXPORT READY</Badge>
                    <button className="text-indigo-400 font-bold text-[10px] uppercase tracking-widest italic hover:text-white transition-colors">Download</button>
                </div>
            </Card>
        ))}
      </div>
    </div>
  );
};
