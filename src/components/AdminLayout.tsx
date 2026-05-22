import { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  Users,
  BookOpen,
  PieChart,
  Settings,
  LogOut,
  LayoutDashboard,
  Fingerprint,
  Search,
  User
} from 'lucide-react';
import { NavItem, cn } from './Common';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

export const AdminLayout = ({ children }: any) => {
  const { pathname } = useLocation();
  const [isSidebarOpen] = useState(true);
  const { profile, logout } = useAuth();
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
      {/* Sidebar */}
      <aside className={cn(
        "bg-slate-900 border-r border-slate-800 transition-all duration-300 ease-in-out flex flex-col relative z-20 shadow-2xl",
        isSidebarOpen ? "w-72" : "w-20"
      )}>
        <div className="p-6 mb-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-900/40">
              <Fingerprint className="text-white" size={24} />
            </div>
            {isSidebarOpen && (
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white leading-none italic">Kora</h2>
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mt-1">Institutional Admin</p>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
          <NavItem label="Dashboard" icon={LayoutDashboard} href="/admin" active={pathname === '/admin'} />
          <NavItem label="Students" icon={Users} href="/admin/students" active={pathname.startsWith('/admin/students')} />
          <NavItem label="Courses" icon={BookOpen} href="/admin/courses" active={pathname.startsWith('/admin/courses')} />
          <NavItem label="Lecturers" icon={User} href="/admin/teachers" active={pathname.startsWith('/admin/teachers')} />
          <NavItem label="Reports" icon={PieChart} href="/admin/reports" active={pathname.startsWith('/admin/reports')} />
          <NavItem label="Settings" icon={Settings} href="/admin/settings" active={pathname === '/admin/settings'} />
        </nav>

        <div className="p-4 mt-auto border-t border-slate-800/50">
          {isSidebarOpen ? (
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/30 flex items-center gap-3 group hover:bg-slate-800/60 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-xs font-black text-white shadow-md shadow-indigo-900/30 shrink-0 italic">
                {getInitials(profile?.name || "")}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-white truncate italic">{profile?.title ? `${profile.title} ` : ''}{profile?.name || 'Admin'}</p>
                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">{profile?.role || 'Admin'}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="p-1.5 hover:bg-rose-500/10 rounded-lg text-slate-500 hover:text-rose-400 cursor-pointer transition-colors"
                title="Log Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <button
                onClick={handleLogout}
                className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-xs font-black text-white shadow-md shadow-indigo-900/30 shrink-0 italic cursor-pointer"
                title={`${profile?.name} - Log Out`}
              >
                {getInitials(profile?.name || "")}
              </button>
              <button 
                onClick={handleLogout}
                className="p-2 hover:bg-rose-500/10 rounded-lg text-slate-500 hover:text-rose-400 cursor-pointer transition-colors"
                title="Log Out"
              >
                <LogOut size={20} />
              </button>
            </div>
          )}
        </div>
      </aside>

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
                placeholder="Search students, teachers, or classes..."
                className="w-full h-11 bg-slate-900/50 border border-slate-800 rounded-xl pl-12 pr-4 text-sm font-medium text-slate-200 placeholder:text-slate-600 focus:ring-2 focus:ring-indigo-500/20 focus:bg-slate-900 transition-all outline-none"
              />
            </div>
          </div>
        </header>

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto p-10 custom-scrollbar relative z-0">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
