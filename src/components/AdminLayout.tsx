import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  Users, 
  BookOpen, 
  PieChart, 
  Settings, 
  LogOut, 
  LayoutDashboard, 
  Fingerprint, 
  Search,
  Bell,
  User
} from 'lucide-react';
import { NavItem, cn } from './Common';

export const AdminLayout = ({ children }: any) => {
  const { pathname } = useLocation();
  const [isSidebarOpen] = useState(true);

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
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/30 flex items-center gap-3 group hover:bg-slate-800/60 transition-colors cursor-pointer">
              <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" alt="User" className="w-10 h-10 rounded-full object-cover border border-slate-700" />
              <div className="min-w-0">
                <p className="text-sm font-bold text-white truncate italic">Admin User</p>
                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Super Admin</p>
              </div>
              <LogOut size={16} className="ml-auto text-slate-500 hover:text-rose-400 cursor-pointer transition-colors" />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" alt="User" className="w-10 h-10 rounded-full object-cover border border-slate-700" />
              <LogOut size={20} className="text-slate-500 hover:text-rose-400 cursor-pointer" />
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
                placeholder="Search students, teachers, or courses..." 
                className="w-full h-11 bg-slate-900/50 border border-slate-800 rounded-xl pl-12 pr-4 text-sm font-medium text-slate-200 placeholder:text-slate-600 focus:ring-2 focus:ring-indigo-500/20 focus:bg-slate-900 transition-all outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-8 ml-8">
            <nav className="flex items-center gap-6">
              <Link to="/admin/courses" className="text-sm font-bold text-slate-400 hover:text-indigo-400 transition-colors italic uppercase tracking-wider">My Courses</Link>
              <Link to="/admin/reports" className="text-sm font-bold text-slate-400 hover:text-indigo-400 transition-colors italic uppercase tracking-wider">Reports</Link>
            </nav>
            
            <Link to="/kiosk" className="bg-white text-slate-950 px-6 py-2.5 rounded-xl text-sm font-black hover:bg-slate-200 transition-all shadow-xl shadow-white/5 active:scale-95 uppercase tracking-tighter">
              Check In
            </Link>

            <div className="relative">
              <button className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                <Bell size={20} />
                <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 border-2 border-slate-950 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.6)]"></div>
              </button>
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
