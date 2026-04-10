import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Fingerprint, 
  BookOpen, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  ArrowRight 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { DUMMY_STUDENTS, DUMMY_COURSES } from '../data/dummy';
import { cn, Badge } from '../components/Common';

export const KioskMode = () => {
  const [step, setStep] = useState('welcome');
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [scannedStudent, setScannedStudent] = useState<any>(null);

  const handleScan = () => {
    setScanState('scanning');
    setTimeout(() => {
      const success = Math.random() > 0.1;
      if (success) {
        const student = DUMMY_STUDENTS[Math.floor(Math.random() * DUMMY_STUDENTS.length)];
        setScannedStudent(student);
        setScanState('success');
        toast.success(`Identity Verified: ${student.name}`);
        setTimeout(() => { setScanState('idle'); setScannedStudent(null); }, 3000);
      } else {
        setScanState('error');
        toast.error("Biometric mismatch. Retry.");
        setTimeout(() => setScanState('idle'), 2000);
      }
    }, 1500);
  };

  if (step === 'welcome') return (
    <div className="fixed inset-0 bg-slate-950 flex items-center justify-center p-8 overflow-hidden font-sans selection:bg-indigo-500/30">
      <div className="absolute inset-0 mesh-gradient opacity-30"></div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 text-center max-w-4xl">
         <div className="relative w-48 h-48 mx-auto bg-slate-900 border border-slate-800 rounded-[2.5rem] flex items-center justify-center shadow-2xl mb-12 group">
            <div className="absolute inset-0 bg-indigo-500/10 blur-2xl group-hover:bg-indigo-500/20 transition-all opacity-0 group-hover:opacity-100"></div>
            <Fingerprint size={80} className="text-white relative group-hover:scale-110 transition-transform shadow-glow" />
         </div>
         <h1 className="text-6xl md:text-8xl font-bold text-white tracking-tight mb-6 italic leading-none uppercase select-none font-sans">Presence <br/><span className="text-indigo-500">starts here.</span></h1>
         <p className="text-slate-500 font-bold uppercase tracking-[0.6em] mb-12 italic text-sm">Terminal Node 01-A • Physics Dept</p>
         <button onClick={() => setStep('class-select')} className="px-12 py-5 bg-white hover:bg-slate-200 text-slate-950 rounded-2xl font-black text-lg uppercase tracking-widest transition-all shadow-xl shadow-white/5 active:scale-95 group flex items-center gap-4 mx-auto italic">
           Initialize Node <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
         </button>
      </motion.div>
    </div>
  );

  if (step === 'class-select') return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col p-8 md:p-16 overflow-y-auto font-sans selection:bg-indigo-500/30">
       <div className="absolute inset-0 mesh-gradient opacity-20"></div>
       <div className="max-w-6xl mx-auto w-full relative z-10">
          <button onClick={() => setStep('welcome')} className="flex items-center gap-3 text-slate-500 hover:text-white font-bold uppercase tracking-widest text-[10px] mb-12 transition-all group italic">
             <RotateCcw size={16} className="group-hover:rotate-180 transition-transform" /> Terminate sequence
          </button>
          
          <header className="mb-12">
            <Badge variant="indigo">Deployment Active</Badge>
            <h2 className="text-5xl font-bold text-white tracking-tight mt-4 italic uppercase leading-none">Select <br/><span className="text-indigo-400">Institutional Node.</span></h2>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {DUMMY_COURSES.map((course, i) => (
               <div key={i} onClick={() => { setSelectedCourse(course); setStep('scanning'); }} className="p-8 bg-slate-900/50 border border-slate-800 rounded-4xl cursor-pointer hover:border-indigo-500/50 hover:bg-slate-900 transition-all group relative overflow-hidden shadow-2xl backdrop-blur-md">
                 <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-500/5 blur-3xl rounded-full group-hover:bg-indigo-500/10 transition-colors"></div>
                 <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all mb-8 w-fit shadow-2xl relative"><BookOpen size={24} /></div>
                 <h3 className="text-2xl font-bold text-white mb-2 italic tracking-tight leading-none group-hover:text-indigo-400 transition-colors uppercase relative">{course.name}</h3>
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic group-hover:text-slate-400 transition-colors relative">Node {course.room}</p>
                 <ArrowRight className="absolute right-8 bottom-8 text-slate-800 group-hover:text-indigo-500 group-hover:translate-x-2 transition-all opacity-0 group-hover:opacity-100" size={24} />
               </div>
             ))}
          </div>
       </div>
    </div>
  );

  if (step === 'scanning') return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col p-8 md:p-16 overflow-hidden items-center justify-center font-sans selection:bg-indigo-500/30">
       <div className="absolute inset-0 mesh-gradient opacity-30"></div>
       <div className="max-w-4xl w-full text-center relative z-10">
          <div className="mb-16">
             <div className="flex items-center justify-center gap-3 mb-4">
                <Badge variant="indigo">Real-time Verify</Badge>
             </div>
             <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight italic uppercase leading-none">{selectedCourse?.name}</h2>
             <p className="text-indigo-400 text-sm mt-4 font-bold uppercase tracking-widest italic opacity-60">Mesh Tracking Sequence Active</p>
          </div>
          
          <div className={cn(
               "relative w-64 h-64 mx-auto rounded-[3.5rem] border-2 transition-all duration-700 flex items-center justify-center overflow-hidden cursor-pointer", 
               scanState === 'scanning' ? "border-indigo-500 bg-indigo-500/5 shadow-[0_0_80px_rgba(99,102,241,0.3)] scale-110" : 
               scanState === 'success' ? "border-emerald-500 bg-emerald-500/5 shadow-[0_0_80px_rgba(16,185,129,0.3)]" :
               scanState === 'error' ? "border-rose-500 bg-rose-500/5 animate-shake" :
               "border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:scale-[1.02] backdrop-blur-md"
          )} onClick={scanState === 'idle' ? handleScan : undefined}>
             <AnimatePresence>
                {scanState === 'scanning' && <motion.div initial={{ top: '-10%' }} animate={{ top: '110%' }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} className="absolute left-0 w-full h-[4px] bg-indigo-500 shadow-[0_0_20px_#6366f1] z-10" />}
             </AnimatePresence>
             <div className="relative">
                {scanState === 'idle' && <Fingerprint size={100} className="text-slate-700 animate-pulse" />}
                {scanState === 'scanning' && <Fingerprint size={100} className="text-white" />}
                {scanState === 'success' && <CheckCircle2 size={100} className="text-emerald-500" />}
                {scanState === 'error' && <XCircle size={100} className="text-rose-500" />}
             </div>
          </div>
          
          <div className="mt-16 h-32 flex items-center justify-center">
             <AnimatePresence mode="wait">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key={scanState} className="space-y-3">
                   <p className="text-2xl font-bold text-white uppercase italic tracking-tight">
                      {scanState === 'idle' ? 'Awaiting biometric payload' : 
                       scanState === 'scanning' ? 'Orchestrating handshake...' : 
                       scanState === 'success' ? `Welcome, ${scannedStudent?.name}` : 
                       'Data mismatch'}
                   </p>
                   <p className="text-slate-500 font-bold uppercase tracking-widest italic text-[10px]">
                      {scanState === 'idle' ? 'Place finger on optical sensor' : 
                       scanState === 'scanning' ? 'Keep finger steady for depth scan' : 
                       scanState === 'success' ? 'Attendance logged to node' : 
                       'Please re-align and retry'}
                   </p>
                </motion.div>
             </AnimatePresence>
          </div>
       </div>

       {/* Kiosk Identity Loop */}
       <div className="absolute bottom-12 right-12 flex items-center gap-6 bg-slate-900/50 p-6 rounded-4xl border border-slate-800 shadow-2xl backdrop-blur-3xl relative z-10">
          <div className="flex -space-x-3">
             {DUMMY_STUDENTS.slice(0, 4).map((s, i) => <img key={i} src={s.photo} className="w-10 h-10 rounded-xl object-cover border-2 border-slate-950" alt="" />)}
          </div>
          <div className="text-left border-l border-slate-800/50 pl-6">
             <p className="text-white text-lg font-black italic leading-none">14 LOGS</p>
             <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1 italic">Recorded today</p>
          </div>
       </div>
    </div>
  );

  return null;
};
