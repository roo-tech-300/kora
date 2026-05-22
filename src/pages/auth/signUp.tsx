import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Fingerprint,
  Mail,
  Lock,
  ShieldCheck,
  ArrowRight,
  User,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { signUp } from '../../lib/apis/auth/signUp';
import { Spinner } from '../../components/Common';
import { useAuth } from '../../context/AuthContext';
import { resolveUserRoute } from '../../lib/apis/auth/resolveUserRoute';

export const SignupPage = () => {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();
  const [title, setTitle] = useState('Mr.');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error('Identity incomplete. Fill all fields.');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be more than 8 characters long.');
      return;
    }

    try {
      setLoading(true);
      await signUp(email, password, name, title);
      const userProfile = await refreshProfile();
      const destination = resolveUserRoute(userProfile);
      navigate(destination, { replace: true });
    } catch (error) {
      toast.error('Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative font-sans selection:bg-indigo-500/30 selection:text-indigo-200 overflow-hidden"
    >
      {/* Background with mesh and image */}
      <div
        className="absolute inset-0 z-0 bg-slate-950"
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
          <p className="text-xs text-slate-500 font-bold tracking-[0.2em] uppercase italic">Node Initialization</p>
        </div>

        {/* Form Container */}
        <div className="w-full glass-card p-10 shadow-[0_50px_100px_rgba(0,0,0,0.5)] border-white/5">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 tracking-widest uppercase italic">Full Identity</label>
              <div className="flex flex-row items-center gap-3">
                <div className="relative group w-[100px] shrink-0">
                  <select
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-4 text-sm text-slate-200 outline-none focus:border-indigo-500 focus:bg-slate-900 transition-all font-medium italic appearance-none cursor-pointer"
                    onChange={(e) => setTitle(e.target.value)}
                    value={title}
                  >
                    <option value="Mr.">Mr.</option>
                    <option value="Miss">Miss</option>
                    <option value="Mrs.">Mrs.</option>
                    <option value="Dr.">Dr.</option>
                    <option value="Engr.">Engr.</option>
                    <option value="Prof.">Prof.</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600 group-hover:text-indigo-400 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                  </div>
                </div>
                <div className="relative group flex-1">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
                  <input
                    type="text"
                    placeholder="Full Name"
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-12 py-4 text-sm text-slate-200 placeholder:text-slate-700 outline-none focus:border-indigo-500 focus:bg-slate-900 transition-all font-medium italic"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

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
                <label className="text-[10px] font-black text-slate-500 tracking-widest uppercase italic">Password</label>
              </div>
              <div className="relative group">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-12 py-4 text-sm text-slate-200 placeholder:text-slate-700 outline-none focus:border-indigo-500 focus:bg-slate-900 transition-all font-medium"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-indigo-400 focus:outline-none transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <button
                type="submit"
                className="w-full bg-white text-slate-950 py-4 rounded-xl font-black text-xs uppercase tracking-[0.3em] hover:bg-slate-200 active:scale-95 transition-all shadow-2xl shadow-indigo-500/10 group italic flex items-center justify-center gap-3"
              >
                {loading ? <Spinner /> : <>Create Account <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></>}
              </button>

              <p className="text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">
                Already have an account? <Link to="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors">Login</Link>
              </p>
            </div>
          </form>
        </div>

        {/* Footer info */}
        <button className="mt-12 flex items-center gap-3 bg-slate-900/50 border border-slate-800 hover:bg-slate-800 text-slate-400 px-6 py-3 rounded-full text-[9px] font-black tracking-widest uppercase transition-all shadow-xl group">
          <ShieldCheck size={14} className="text-indigo-400 group-hover:scale-110 transition-transform" />
          Institutional Biometric Encryption Active
        </button>
      </div>
    </div>
  );
};
