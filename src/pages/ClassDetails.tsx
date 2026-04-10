import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Clock,
  UserCheck,
  FileDown,
  Edit,
  Eye,
  Activity,
  Calendar,
  ArrowLeft
} from 'lucide-react';
import { DUMMY_STUDENTS } from '../data/dummy';
import { cn, Badge } from '../components/Common';

export const ClassDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  // Using some mock data for the class view since we're viewing a 'session'
  const sessionName = id === 'math-10a' ? 'Math 10A' : id === 'physics-11c' ? 'Physics 11C' : id === 'english-9b' ? 'English 9B' : 'Economics 10B';
  const enrolledStudents = DUMMY_STUDENTS.slice(0, 24); // mock 24 students max
  
  // For demonstration, we allow toggling active state
  // Let Physics 11C be active by default to showcase the layout from before
  const [isActive, setIsActive] = useState(id === 'physics-11c');

  // Generate initials for the avatars
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen pb-24 animate-in flex flex-col relative w-full h-full text-slate-100">
      
      {/* Back navigation */}
      <div className="py-4">
        <Link to="/teacher" className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-indigo-400 transition-colors uppercase tracking-widest italic">
           <ArrowLeft size={14} /> Back to Dashboard
        </Link>
      </div>

      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center py-6 gap-6 border-b border-slate-800/50">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-black text-white italic tracking-tighter">{sessionName}</h1>
          {isActive && (
            <Badge variant="danger" className="text-[10px] py-1.5 px-3 flex items-center gap-2 animate-pulse rounded-xl uppercase tracking-widest italic shadow-[0_0_15px_rgba(244,63,94,0.3)]">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span> LIVE
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic mb-1">
              {isActive ? "End Time" : "Start Time"}
            </p>
            <p className="text-sm font-bold text-white italic">
              {isActive ? "11:30 AM" : "10:00 AM"}
            </p>
          </div>
          
          {isActive ? (
            <button 
              onClick={() => setIsActive(false)}
              className="bg-rose-500 hover:bg-rose-600 text-white px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-[0_10px_30px_rgba(244,63,94,0.2)] active:scale-95 italic"
            >
              Close Session
            </button>
          ) : (
            <button 
              onClick={() => setIsActive(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-[0_10px_30px_rgba(99,102,241,0.2)] active:scale-95 flex items-center gap-2 italic"
            >
               <Activity size={16} /> Start Session
            </button>
          )}
        </div>
      </div>

      {/* 3 Stat Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
         {/* Card 1: Time Progress */}
         <div className="glass-card p-8 border border-slate-800/60 bg-slate-900/40 relative overflow-hidden group hover:border-indigo-500/30 transition-all">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic mb-3">
              {isActive ? "Session Progress" : "Countdown to Session"}
            </p>
            
            {isActive ? (
              <div className="flex items-end gap-3">
                 <h4 className="text-5xl font-black text-white tracking-tighter italic leading-none">45:12</h4>
                 <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider italic mb-1">Elapsed</p>
              </div>
            ) : (
              <div className="flex items-end gap-3">
                 <h4 className="text-4xl font-black text-white tracking-tighter italic leading-none">Starts in 3 days</h4>
              </div>
            )}
         </div>
         
         {/* Card 2: Auto-Check Efficiency */}
         <div className="glass-card p-8 border border-slate-800/60 bg-slate-900/40 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic mb-3">Auto-Check Efficiency</p>
            <div className="flex items-end gap-3">
               <h4 className="text-5xl font-black text-white tracking-tighter italic leading-none">92%</h4>
               <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider italic mb-1">Fingerprint matches</p>
            </div>
         </div>
         
         {/* Card 3: Room Environment */}
         <div className="glass-card p-8 border border-slate-800/60 bg-slate-900/40 relative overflow-hidden group hover:border-amber-500/30 transition-all">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic mb-3">Room Environment</p>
            <div className="flex items-end gap-3">
               <h4 className="text-5xl font-black text-white tracking-tighter italic leading-none">Lab 4</h4>
               <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider italic mb-1">Primary Node</p>
            </div>
         </div>
      </div>

      {/* Grid of Students */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pb-32">
        {enrolledStudents.map((student, i) => {
          // Mock data: alternate statuses to match the design
          const isPresent = i % 3 !== 0; 
          
          return (
             <div key={student.id} className="glass-card p-5 bg-slate-900/40 border border-slate-800/50 hover:bg-slate-800/40 hover:border-indigo-500/20 transition-all flex items-center gap-4 cursor-pointer group">
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center font-black text-sm italic shadow-inner border",
                  isPresent ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" : "bg-slate-800 text-slate-400 border-slate-700"
                )}>
                  {getInitials(student.name)}
                </div>
                
                <div className="flex-1 min-w-0">
                   <p className="text-sm font-bold text-white truncate italic group-hover:text-indigo-300 transition-colors">{student.name}</p>
                   <div className="flex items-center gap-1.5 mt-1">
                      {isPresent ? (
                        <>
                          <UserCheck size={12} className="text-emerald-500" />
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">Present • 10:03 AM</span>
                        </>
                      ) : (
                        <>
                          <Clock size={12} className="text-slate-500" />
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate">Not evaluated</span>
                        </>
                      )}
                   </div>
                </div>
             </div>
          );
        })}
      </div>

      {/* Bottom Fixed Footer Dashboard Style */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-950/90 backdrop-blur-2xl border-t border-slate-800 z-30 px-8 py-3 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
         <div className="flex items-center gap-10">
            <div>
               <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest italic mb-0.5">Attendance Status</p>
               <p className="text-sm font-bold text-white italic"><span className="text-xl font-black text-emerald-400 tracking-tighter">18/24</span> Present</p>
            </div>
            
            <div className="hidden sm:block w-px h-8 bg-slate-800"></div>
            
            <div>
               <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest italic mb-0.5">Awaiting</p>
               <p className="text-sm font-bold text-white italic"><span className="text-xl font-black text-amber-500 tracking-tighter">6</span> Absent</p>
            </div>
         </div>
         
         <div className="flex items-center gap-3">
            <button className="h-9 px-4 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 italic">
               <FileDown size={12} /> Export CSV
            </button>
            <button className="h-9 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 italic shadow-lg">
               <Edit size={12} /> Manual Override
            </button>
            <button 
              onClick={() => navigate('/kiosk')}
              className="h-9 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 italic shadow-[0_5px_15px_rgba(99,102,241,0.3)]"
            >
               <Eye size={12} /> Kiosk View
            </button>
         </div>
      </div>
    </div>
  );
};
