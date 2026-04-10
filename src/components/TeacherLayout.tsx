import { Link } from 'react-router-dom';
import { 
  Bell,
  Search,
  ExternalLink
} from 'lucide-react';


export const TeacherLayout = ({ children }: { children: React.ReactNode }) => {


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

          <div className="flex items-center gap-8 ml-8">  
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
