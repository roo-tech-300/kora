import { Link, useNavigate } from 'react-router-dom';
import { Clock3, ShieldCheck, LogOut } from 'lucide-react';
import { Badge } from '../components/Common';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

export const PendingApproval = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate('/login', { replace: true });
    } catch (err) {
      console.error("Logout failed:", err);
      toast.error("Failed to log out");
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-950 px-4 selection:bg-indigo-500/30 selection:text-indigo-200">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at top, rgba(99,102,241,0.18), transparent 35%), radial-gradient(circle at bottom right, rgba(14,165,233,0.15), transparent 30%)",
        }}
      />

      <div className="absolute inset-0 mesh-gradient opacity-50 z-0"></div>

      <div className="relative z-10 w-full max-w-2xl rounded-[2rem] border border-slate-800 bg-slate-900/60 p-8 shadow-[0_40px_120px_rgba(0,0,0,0.45)] backdrop-blur-xl md:p-12">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 shadow-2xl shadow-indigo-900/40">
              <Clock3 size={30} className="text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500 italic">
                Access Gate
              </p>
              <h1 className="text-3xl font-black tracking-tight text-white italic">
                Approval Pending
              </h1>
            </div>
          </div>

          <Badge variant="warning" className="px-3 py-2 text-[9px] tracking-[0.25em]">
            Awaiting Review
          </Badge>
        </div>

        <div className="space-y-6">
          <p className="max-w-xl text-sm font-medium leading-7 text-slate-300">
            Your account was recognized, but access is paused until an administrator approves your profile.
            Once your status is marked as accepted, you will be routed straight to the correct dashboard on login.
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
              <p className="mb-2 text-[10px] font-black uppercase tracking-[0.28em] text-slate-500 italic">
                What happens next
              </p>
              <p className="text-sm leading-6 text-slate-300">
                An administrator reviews your role and updates your account status from pending to accepted.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
              <p className="mb-2 text-[10px] font-black uppercase tracking-[0.28em] text-slate-500 italic">
                Security state
              </p>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <ShieldCheck size={18} className="text-indigo-400" />
                Your session is active, but dashboard access is restricted for now.
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Link
              to="/login"
              className="inline-flex h-12 items-center justify-center rounded-xl bg-white px-6 text-xs font-black uppercase tracking-[0.28em] text-slate-950 transition-all hover:bg-slate-200 active:scale-95"
            >
              Back To Login
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-950/70 px-6 text-xs font-black uppercase tracking-[0.24em] text-rose-400 hover:text-rose-300 transition-all hover:bg-rose-950/30 hover:border-rose-900/30 cursor-pointer"
            >
              <LogOut size={15} />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
