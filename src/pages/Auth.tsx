import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Fingerprint, 
  Mail, 
  Lock, 
  User, 
  ShieldCheck, 
  ArrowRight, 
  ChevronRight,
  School,
  AlertCircle,
  RotateCcw,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { cn, Badge } from '../components/Common';

export const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Identity incomplete. Fill all fields.');
      return;
    }
    
    const isTeacher = email.toLowerCase().includes('teacher');
    toast.success(`Identity Verified: ${isTeacher ? 'Instructor' : 'Administrator'}`);
    setTimeout(() => {
      navigate(isTeacher ? '/teacher' : '/admin');
    }, 1200);
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center relative font-sans selection:bg-indigo-500/30 selection:text-indigo-200 overflow-hidden"
    >
      {/* Background with mesh and image */}
      <div 
        className="absolute inset-0 z-0 bg-[#020617]"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2000&auto=format&fit=crop')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.15
        }}
      ></div>
      <div className="absolute inset-0 mesh-gradient opacity-60 z-0"></div>
      
      {/* Main Login Box */}
      <div className="relative z-10 w-full max-w-[400px] flex flex-col items-center p-4">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-12 w-full text-center">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-2xl shadow-indigo-900/40 transform hover:scale-110 transition-transform cursor-pointer">
            <Fingerprint size={36} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-2">Kora</h1>
          <p className="text-xs text-slate-500 font-bold tracking-[0.2em] uppercase italic">Secure Institutional Gate</p>
        </div>

        {/* Form Container */}
        <div className="w-full glass-card p-10 shadow-[0_50px_100px_rgba(0,0,0,0.5)] border-white/5">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 tracking-widest uppercase italic">Institutional Email</label>
              <div className="relative group">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
                <input 
                  type="email" 
                  placeholder="admin@kora.edu" 
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-12 py-4 text-sm text-slate-200 placeholder:text-slate-700 outline-none focus:border-indigo-500 focus:bg-slate-900 transition-all font-medium italic"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                 <label className="text-[10px] font-black text-slate-500 tracking-widest uppercase italic">Infrastructure Pin</label>
                 <a href="#" className="text-[10px] text-indigo-400 hover:text-white font-black uppercase tracking-widest italic transition-colors">Recover?</a>
              </div>
              <div className="relative group">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
                <input 
                  type="password" 
                  placeholder="••••••••••••" 
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-12 py-4 text-sm text-slate-200 placeholder:text-slate-700 outline-none focus:border-indigo-500 focus:bg-slate-900 transition-all font-medium"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-3 py-2">
              <input 
                type="checkbox" 
                id="keep-signed-in" 
                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500/20 cursor-pointer" 
              />
              <label htmlFor="keep-signed-in" className="text-[11px] font-bold text-slate-500 cursor-pointer uppercase tracking-wider italic">Maintain Node Session</label>
            </div>

            <button 
              type="submit"
              className="w-full bg-white text-slate-950 py-4 rounded-xl font-black text-xs uppercase tracking-[0.3em] hover:bg-slate-200 active:scale-95 transition-all shadow-2xl shadow-indigo-500/10 mt-4 group italic flex items-center justify-center gap-3"
            >
              Authorize Gate <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>

        {/* Footer info */}
        <button className="mt-12 flex items-center gap-3 bg-slate-900/50 border border-slate-800 hover:bg-slate-800 text-slate-400 px-6 py-3 rounded-full text-[9px] font-black tracking-widest uppercase transition-all shadow-xl group">
          <ShieldCheck size={14} className="text-indigo-400 group-hover:scale-110 transition-transform" /> 
          Institutional Biometric Encryption Active
        </button>
      </div>

      {/* Footer Links */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-8 text-[10px] text-slate-600 font-black uppercase tracking-widest italic translate-y-0 opacity-60 hover:opacity-100 transition-opacity">
        <a href="#" className="hover:text-indigo-400 transition-colors">Network Terms</a>
        <span className="w-1 h-1 bg-slate-800 rounded-full"></span>
        <a href="#" className="hover:text-indigo-400 transition-colors">Support Node</a>
        <span className="w-1 h-1 bg-slate-800 rounded-full"></span>
        <a href="#" className="hover:text-indigo-400 transition-colors">Node Registry</a>
      </div>

      {/* Kiosk Floating Button */}
      <button 
        onClick={() => navigate('/kiosk')} 
        className="absolute bottom-10 right-10 flex items-center gap-4 bg-slate-900/80 hover:bg-slate-800 text-slate-300 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-2xl border border-slate-800/50 backdrop-blur-xl group italic active:scale-95"
      >
        <Zap size={18} className="text-amber-400 group-hover:scale-125 transition-transform" />
        Launch Kiosk Interface
      </button>
    </div>
  );
};

export const SignupPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();
        if (step < 2) setStep(step + 1);
        else {
            toast.success("Institutional Node Registered Successfully.");
            setTimeout(() => navigate('/login'), 1500);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8 font-sans mesh-gradient overflow-hidden relative selection:bg-indigo-500/30 selection:text-indigo-200">
            <div className="absolute top-[-20%] right-[-10%] w-[900px] h-[900px] bg-indigo-600/5 rounded-full blur-[200px] animate-pulse-slow"></div>
            
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-4xl relative z-10">
                <div className="glass-card flex flex-col md:flex-row overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.8)] border border-white/5 bg-slate-900/40 backdrop-blur-3xl rounded-[3rem]">
                    <div className="w-full md:w-2/5 p-16 bg-slate-950/60 border-r border-slate-800/40 backdrop-blur-3xl flex flex-col justify-between">
                        <div>
                          <Badge variant="indigo">Node Deployment</Badge>
                          <h2 className="text-6xl font-black text-white italic tracking-tighter mt-10 leading-[0.9] uppercase transition-all">Node <br/><span className="premium-gradient-text">Assembly.</span></h2>
                        </div>
                        
                        <div className="space-y-12">
                            {[1, 2].map(s => (
                                <div key={s} className="flex items-center gap-6 group">
                                    <div className={cn(
                                        "w-14 h-14 rounded-2xl flex items-center justify-center font-black italic transition-all duration-700 shadow-2xl",
                                        step >= s ? "bg-indigo-600 text-white scale-110 shadow-indigo-600/30" : "bg-slate-900 text-slate-700 border border-slate-800 group-hover:border-indigo-500/30"
                                    )}>{s}</div>
                                    <div className="overflow-hidden">
                                        <p className={cn("text-[9px] font-black uppercase tracking-[0.3em] transition-colors italic", step === s ? "text-white" : "text-slate-600")}>
                                            {s === 1 ? 'Institutional Identity' : 'Mesh Security Key'}
                                        </p>
                                        <div className={cn("h-1 w-24 mt-2 rounded-full transition-all duration-1000 shadow-inner", step >= s ? "bg-indigo-500" : "bg-slate-950")} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="flex-1 p-16 overflow-y-auto max-h-[85vh] custom-scrollbar bg-slate-900/40">
                        <div className="flex justify-between items-start mb-16">
                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] italic leading-tight">Phase {step} Sequence</p>
                                <h3 className="text-3xl font-black text-white italic tracking-tighter mt-2 uppercase">
                                    {step === 1 ? 'Configure Authority' : 'Encrypt Protocols'}
                                </h3>
                            </div>
                            <button onClick={() => navigate('/login')} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-slate-600 hover:text-white transition-all shadow-xl group active:scale-95">
                                <RotateCcw size={22} className="group-hover:rotate-180 transition-transform" />
                            </button>
                        </div>

                        <form onSubmit={handleNext} className="space-y-10">
                            <AnimatePresence mode="wait">
                                {step === 1 ? (
                                    <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                        <div className="group relative">
                                          <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-indigo-400 transition-colors" size={20} />
                                          <input type="text" placeholder="ROOT ADMINISTRATOR NAME" className="w-full bg-slate-950/80 border border-slate-800 rounded-3xl py-6 pl-16 pr-8 text-white font-black text-sm tracking-widest placeholder:text-slate-850 outline-none focus:border-indigo-500 transition-all shadow-inner uppercase italic" required />
                                        </div>
                                        <div className="group relative">
                                          <School className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-indigo-400 transition-colors" size={20} />
                                          <input type="text" placeholder="INSTITUTION MESH NAME" className="w-full bg-slate-950/80 border border-slate-800 rounded-3xl py-6 pl-16 pr-8 text-white font-black text-sm tracking-widest placeholder:text-slate-850 outline-none focus:border-indigo-500 transition-all shadow-inner uppercase italic" required />
                                        </div>
                                        <div className="group relative">
                                          <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-indigo-400 transition-colors" size={20} />
                                          <input type="email" placeholder="AUTHORITY EMAIL" className="w-full bg-slate-950/80 border border-slate-800 rounded-3xl py-6 pl-16 pr-8 text-white font-black text-sm tracking-widest placeholder:text-slate-850 outline-none focus:border-indigo-500 transition-all shadow-inner uppercase italic" required />
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                        <div className="group relative">
                                          <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-indigo-400 transition-colors" size={20} />
                                          <input type="password" placeholder="MASTER INFRASTRUCTURE PIN" className="w-full bg-slate-950/80 border border-slate-800 rounded-3xl py-6 pl-16 pr-8 text-white font-black text-sm tracking-widest placeholder:text-slate-850 outline-none focus:border-indigo-500 transition-all shadow-inner italic" required />
                                        </div>
                                        <div className="p-10 bg-indigo-600/5 border border-indigo-500/20 rounded-[3rem] flex items-center gap-8 shadow-2xl relative overflow-hidden group">
                                             <div className="absolute inset-0 bg-indigo-500/[0.02] shimmer opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                             <div className="w-20 h-20 bg-indigo-500/10 rounded-2xl flex items-center justify-center shadow-2xl relative z-10"><ShieldCheck className="text-indigo-400" size={36} /></div>
                                             <div className="relative z-10">
                                                <p className="text-xs font-black text-white italic uppercase tracking-widest leading-tight">Biometric Encryption Active</p>
                                                <p className="text-[10px] text-slate-500 font-bold mt-2 uppercase tracking-[0.2em] leading-relaxed italic">Your identity hash is automatically verified across the institutional mesh network using AES-256 standard protocols.</p>
                                             </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <button type="submit" className="w-full py-8 bg-white hover:bg-slate-200 text-slate-950 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.5em] transition-all shadow-[0_20px_50px_rgba(255,255,255,0.05)] group flex items-center justify-center gap-4 active:scale-95 italic">
                                {step === 1 ? 'PROCEED TO ENCRYPTION' : 'FINALIZE DEPLOYMENT'} <ChevronRight className="group-hover:translate-x-3 transition-transform text-indigo-600" size={28} />
                            </button>
                        </form>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
