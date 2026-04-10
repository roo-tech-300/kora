import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Fingerprint, 
  ShieldCheck, 
  Info,
  CheckCircle2,
  CircleDashed
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DUMMY_STUDENTS } from '../data/dummy';
import { Badge, cn } from '../components/Common';

export const BiometricEnrollment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const student = DUMMY_STUDENTS.find(s => s.id === id) || DUMMY_STUDENTS[0];
  const initials = student.name.split(' ').map(n => n[0]).join('').toUpperCase();

  const [step, setStep] = useState(1);
  const [scanProgress, setScanProgress] = useState(0);

  // Simulate scanning process
  useEffect(() => {
    let interval: any;
    if (step === 2) {
      interval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setStep(3), 500); // Move to step 3 when done
            return 100;
          }
          return prev + 5;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [step]);

  return (
    <div className="space-y-8 animate-in pb-20">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex items-center gap-4">
          <Link to={`/admin/students/${student.id}`} className="w-10 h-10 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-800 transition-all active:scale-95">
             <ArrowLeft size={18} />
          </Link>
          <div>
            <Badge variant="indigo" className="mb-3">Admin Protocol</Badge>
            <h1 className="text-3xl font-bold text-white tracking-tight italic leading-none uppercase">Biometric <span className="text-indigo-400">Enrollment</span></h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-12 bg-slate-900/30 border border-slate-800/50 rounded-[3rem] p-8 md:p-16 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-64 bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none"></div>

        {/* --- Step Indicator --- */}
        <div className="relative flex justify-between items-center max-w-xl mx-auto mb-16">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-800 -z-10"></div>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-indigo-500 transition-all duration-700 ease-in-out -z-10" style={{ width: `${(step - 1) * 50}%` }}></div>
          
          {[
            { num: 1, label: 'Place Finger' },
            { num: 2, label: 'Confirm Scan' },
            { num: 3, label: 'Saved' }
          ].map((s) => (
            <div key={s.num} className="flex flex-col items-center gap-4 relative">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm italic transition-all duration-500 shadow-xl",
                step >= s.num 
                  ? "bg-indigo-600 text-white shadow-indigo-900/40" 
                  : "bg-slate-900 border-2 border-slate-800 text-slate-500"
              )}>
                {step > s.num ? <CheckCircle2 size={20} /> : s.num}
              </div>
              <span className={cn(
                "absolute -bottom-8 text-[9px] uppercase tracking-[0.2em] font-black whitespace-nowrap italic",
                step >= s.num ? "text-indigo-400" : "text-slate-600"
              )}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* --- Target Identity --- */}
        <div className="flex flex-col items-center mb-12">
          {student.photo ? (
            <img src={student.photo} className="w-20 h-20 rounded-3xl object-cover border-4 border-slate-900 shadow-2xl ring-2 ring-indigo-500/20 mb-4" alt="" />
          ) : (
            <div className="w-20 h-20 rounded-3xl bg-slate-900 border-4 border-slate-800 flex items-center justify-center text-xl font-black text-indigo-400 italic shadow-2xl ring-2 ring-indigo-500/20 mb-4">
              {initials}
            </div>
          )}
          <h2 className="text-xl font-bold text-white italic">Enrolling: <span className="text-indigo-400">{student.name}</span></h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1.5 italic">Matric: {student.id}</p>
        </div>

        {/* --- Main Scanner Area --- */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-[2.5rem] p-10 md:p-16 max-w-md mx-auto text-center relative overflow-hidden shadow-2xl shadow-indigo-900/10 mb-12"
             onClick={() => {
               if (step === 1) setStep(2);
             }}
        >
          {step === 2 && (
             <motion.div 
               className="absolute bottom-0 left-0 h-1 bg-indigo-500 shadow-[0_0_15px_#6366f1]" 
               initial={{ width: 0 }} 
               animate={{ width: `${scanProgress}%` }}
             />
          )}

          <div className="relative w-32 h-32 mx-auto mb-10 flex items-center justify-center">
             {/* Animations */}
             {step < 3 && (
               <>
                 <motion.div 
                   animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }} 
                   transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                   className="absolute inset-0 border-2 border-indigo-500 rounded-full"
                 />
                 <motion.div 
                   animate={{ scale: [1, 1.4, 1], opacity: [0.1, 0, 0.1] }} 
                   transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                   className="absolute inset-0 border-2 border-indigo-500 rounded-full"
                 />
               </>
             )}
             
             {step === 3 && (
                <motion.div 
                  initial={{ scale: 0 }} 
                  animate={{ scale: 1 }} 
                  className="absolute inset-0 bg-indigo-500/20 rounded-full"
                />
             )}

             <div className={cn(
               "relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-colors duration-500",
               step === 1 ? "bg-slate-900 text-slate-500 hover:text-indigo-400" :
               step === 2 ? "bg-indigo-500/10 text-indigo-400" :
               "bg-indigo-500 text-white shadow-[0_0_30px_#4f46e5]"
             )}>
                <Fingerprint size={48} strokeWidth={step === 3 ? 2 : 1.5} className={cn(step === 2 && "animate-pulse")} />
             </div>
          </div>

          <div className="space-y-3 h-24 relative">
             <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div key="st1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    <h3 className="text-lg font-black text-white italic leading-tight">Ask the student to place their <br/>finger firmly on the scanner</h3>
                    <p className="text-[10px] text-slate-500 font-bold mt-3 leading-relaxed max-w-[260px] mx-auto italic">
                      Ensure the fingertip is centered and pressed with moderate pressure for the best scan quality.
                    </p>
                  </motion.div>
                )}
                {step === 2 && (
                  <motion.div key="st2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    <h3 className="text-lg font-black text-indigo-400 italic leading-tight">Scanning Biometrics...</h3>
                    <p className="text-[10px] text-slate-400 font-bold mt-3 leading-relaxed max-w-[260px] mx-auto italic">
                      Hold finger steady. Extrapolating nodal points and securing template data.
                    </p>
                    <p className="text-xs font-black text-white mt-4 italic">{scanProgress}%</p>
                  </motion.div>
                )}
                {step === 3 && (
                  <motion.div key="st3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    <h3 className="text-xl font-black text-emerald-400 italic leading-tight">Enrollment Complete!</h3>
                    <p className="text-[10px] text-slate-400 font-bold mt-3 leading-relaxed max-w-[260px] mx-auto italic">
                      The biometric signature has been successfully encrypted and bound to the student profile.
                    </p>
                  </motion.div>
                )}
             </AnimatePresence>
          </div>
        </div>

        {/* --- Controls --- */}
        <div className="flex flex-col items-center gap-6">
           {step === 1 && (
             <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] italic text-indigo-400">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
                Scanner Ready... (Click Icon to Mock Scan)
             </div>
           )}
           {step === 2 && (
             <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] italic text-amber-500">
                <CircleDashed size={14} className="animate-spin" />
                Reading Sensor...
             </div>
           )}
           
           {step < 3 ? (
             <button onClick={() => navigate(`/admin/students/${student.id}`)} className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors italic border-b border-transparent hover:border-slate-500 pb-0.5">
                Cancel Enrollment
             </button>
           ) : (
             <button onClick={() => navigate(`/admin/students/${student.id}`)} className="h-12 px-8 bg-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-indigo-900/20 hover:bg-indigo-500 transition-all italic flex items-center gap-2">
               <ArrowLeft size={16} /> Return to Profile
             </button>
           )}
        </div>
      </div>

      {/* --- Tips --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex items-start gap-4 hover:border-slate-700 transition-colors">
           <div className="p-3 border border-slate-700 bg-slate-800/50 rounded-xl text-slate-400">
             <Info size={20} />
           </div>
           <div>
             <h4 className="text-[11px] font-black uppercase tracking-widest text-white italic mb-1">Clean Scan Tip</h4>
             <p className="text-[10px] text-slate-500 font-bold leading-relaxed italic">If the scanner fails to recognize the finger, ensure it's not too dry. A light touch on a damp cloth can help improve resonance.</p>
           </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex items-start gap-4 hover:border-slate-700 transition-colors">
           <div className="p-3 border border-indigo-500/20 bg-indigo-500/10 rounded-xl text-indigo-400">
             <ShieldCheck size={20} />
           </div>
           <div>
             <h4 className="text-[11px] font-black uppercase tracking-widest text-white italic mb-1">Secure & Encrypted</h4>
             <p className="text-[10px] text-slate-500 font-bold leading-relaxed italic">We don't store actual fingerprints. Scans are immediately converted into non-reversible encrypted mathematical templates.</p>
           </div>
        </div>
      </div>
    </div>
  );
};
