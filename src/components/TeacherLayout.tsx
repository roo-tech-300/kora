import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell,
  Search,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

export const TeacherLayout = ({ children }: { children: React.ReactNode }) => {
  const { profile, loading, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await logout();
      toast.success("Logged out successfully");
      navigate('/login', { replace: true });
    } catch (err) {
      console.error("Logout failed:", err);
      toast.error("Failed to log out. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }
    return parts[0].substring(0, Math.min(parts[0].length, 2)).toUpperCase();
  };


  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden font-sans selection:bg-indigo-500/30 selection:text-indigo-200">


      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute inset-0 mesh-gradient opacity-40 pointer-events-none"></div>
        
        {/* Top Header */}
        <header className="h-20 bg-slate-950/50 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-8 shrink-0 relative z-10">
          <div className="flex-1 max-w-xl">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Search classes or students..." 
                className="w-full h-11 bg-slate-900/50 border border-slate-800 rounded-xl pl-12 pr-4 text-sm font-medium text-slate-200 placeholder:text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:bg-slate-900 transition-all outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 ml-8">  
            <div className="relative">
              <button className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                <Bell size={20} />
                <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-indigo-500 border-2 border-slate-950 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.6)] animate-pulse"></div>
              </button>
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700/80 hover:bg-slate-800/40 text-slate-400 hover:text-white transition-all duration-200 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-xs font-black text-white shadow-md shadow-indigo-900/30 shrink-0 italic">
                  {loading ? '...' : getInitials(profile?.name || "")}
                </div>
                <ChevronDown size={14} className={`text-slate-500 transition-transform duration-200 mr-1 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-64 glass-card p-4 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] border-slate-800/80 z-50">
                  {loading ? (
                    <div className="text-xs text-slate-500 text-center py-4 italic">Loading profile...</div>
                  ) : (
                    <>
                      <div className="px-1 py-1.5 mb-3">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic mb-1">Signed in as</p>
                        <p className="text-sm font-bold text-white truncate italic">{profile?.title ? `${profile.title} ` : ''}{profile?.name || 'Lecturer'}</p>
                        <p className="text-xs text-slate-400 truncate mt-0.5">{profile?.email || 'N/A'}</p>
                        <div className="mt-2.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-black tracking-widest uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 italic">
                            {profile?.role || 'Lecturer'}
                          </span>
                        </div>
                      </div>

                      <div className="h-px bg-slate-800 my-2" />

                      <button
                        onClick={handleLogout}
                        disabled={loggingOut}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 active:scale-[0.98] transition-all duration-150 text-left cursor-pointer"
                      >
                        <LogOut size={16} />
                        {loggingOut ? 'Logging out...' : 'Log Out'}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto p-12 custom-scrollbar relative z-0">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
