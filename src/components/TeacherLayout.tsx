import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  UserCheck, 
  PieChart, 
  Settings, 
  LogOut, 
  Fingerprint,
  Bell,
  Search,
  ExternalLink
} from 'lucide-react';
import { DUMMY_TEACHERS } from '../data/dummy';
import { NavItem } from './Common';

export const TeacherLayout = ({ children }: { children: React.ReactNode }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { icon: LayoutDashboard, label: 'Overview', href: '/teacher' },
    { icon: BookOpen, label: 'My Classes', href: '/teacher/classes' },
    { icon: UserCheck, label: 'Daily Record', href: '/teacher/attendance' },
    { icon: PieChart, label: 'Analytics', href: '/teacher/reports' },
    { icon: Settings, label: 'Preferences', href: '/teacher/settings' },
  ];

  return (
    <div className="flex h-screen bg-[#020617] overflow-hidden font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-900 border-r border-slate-800 transition-all duration-300 ease-in-out flex flex-col relative z-20 shadow-2xl">
        <div className="p-6 mb-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-900/40 transform hover:rotate-6 transition-transform">
              <Fingerprint className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white leading-none italic">Kora</h2>
              <p className="text-[10px] font-semibold text-indigo-400 uppercase tracking-widest mt-1">Professor Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
            {navItems.map(item => (
                <NavItem 
                    key={item.href}
                    {...item}
                    active={pathname === item.href}
                />
            ))}
        </nav>

        <div className="p-4 mt-auto border-t border-slate-800/50">
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/30 flex items-center gap-3 group hover:bg-slate-800/60 transition-colors cursor-pointer relative overflow-hidden">
                <div className="absolute inset-0 bg-indigo-500/[0.02] shimmer opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <img src={DUMMY_TEACHERS[0].photo} className="w-10 h-10 rounded-full object-cover border border-slate-700 relative z-10" alt="" />
                <div className="min-w-0 relative z-10">
                    <p className="text-sm font-bold text-white truncate italic">{DUMMY_TEACHERS[0].name}</p>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest truncate">Instructor</p>
                </div>
                <button onClick={() => navigate('/login')} className="ml-auto text-slate-500 hover:text-rose-400 transition-colors relative z-10">
                    <LogOut size={16} />
                </button>
            </div>
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
                placeholder="Search classes or students..." 
                className="w-full h-11 bg-slate-900/50 border border-slate-800 rounded-xl pl-12 pr-4 text-sm font-medium text-slate-200 placeholder:text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:bg-slate-900 transition-all outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-8 ml-8">
            <nav className="flex items-center gap-6">
              <Link to="/teacher/classes" className="text-sm font-bold text-slate-400 hover:text-indigo-400 transition-colors italic uppercase tracking-wider">Schedule</Link>
              <Link to="/teacher/attendance" className="text-sm font-bold text-slate-400 hover:text-indigo-400 transition-colors italic uppercase tracking-wider">Log</Link>
            </nav>
            
            <button className="bg-white text-slate-950 px-6 py-2.5 rounded-xl text-sm font-black hover:bg-slate-200 transition-all shadow-xl shadow-white/5 active:scale-95 uppercase tracking-tighter flex items-center gap-2">
              Start Session <ExternalLink size={14} />
            </button>

            <div className="relative">
              <button className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                <Bell size={20} />
                <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-indigo-500 border-2 border-slate-950 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.6)] animate-pulse"></div>
              </button>
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
