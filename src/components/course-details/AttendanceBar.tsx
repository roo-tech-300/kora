import { Download, Eye } from 'lucide-react';

type AttendanceBarProps = {
  isTeacher: boolean;
};

export const AttendanceBar = ({ isTeacher }: AttendanceBarProps) => {
  if (!isTeacher) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-950/90 backdrop-blur-2xl border-t border-slate-800 z-30 px-8 py-3 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
      <div className="flex items-center gap-10">
        <div>
          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest italic mb-0.5">Attendance Status</p>
          <p className="text-sm font-bold text-white italic">
            <span className="text-xl font-black text-emerald-400 tracking-tighter">18/24</span> Present
          </p>
        </div>
        <div className="hidden sm:block w-px h-8 bg-slate-800"></div>
        <div>
          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest italic mb-0.5">Awaiting</p>
          <p className="text-sm font-bold text-white italic">
            <span className="text-xl font-black text-amber-500 tracking-tighter">6</span> Absent
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button className="h-9 px-4 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 italic cursor-pointer">
          <Download size={12} /> Export CSV
        </button>       
        <button className="h-9 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 italic shadow-[0_5px_15px_rgba(99,102,241,0.3)] cursor-pointer">
          <Eye size={12} /> Kiosk View
        </button>
      </div>
    </div>
  );
};
