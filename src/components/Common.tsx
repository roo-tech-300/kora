import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Badge = ({ children, variant = 'info', className, ...props }: { children: React.ReactNode, variant?: string, className?: string, [key: string]: any }) => {
  const styles: any = {
    info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    danger: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    purple: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  };
  return (
    <span {...props} className={cn("inline-block text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-lg border", styles[variant] || styles.info, className)}>
      {children}
    </span>
  );
};

export const NavItem = ({ icon: Icon, label, href, active, count }: any) => (
  <Link 
    to={href} 
    className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative group",
      active 
        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/40" 
        : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-100"
    )}
  >
    {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-indigo-400 rounded-r-lg shadow-[0_0_8px_rgba(129,140,248,0.6)]" />}
    <Icon size={20} className={cn("transition-transform group-hover:scale-110", active ? "text-white" : "text-slate-500")} />
    <span className="font-semibold text-sm">{label}</span>
    {count && (
      <span className={cn(
          "ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full border",
          active ? "bg-white/20 text-white border-white/20" : "bg-slate-800 text-slate-400 border-slate-700"
      )}>
        {count}
      </span>
    )}
  </Link>
);

export const Card = ({ children, className, title, subtitle, icon: Icon, action, ...props }: any) => (
  <div {...props} className={cn("bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6 flex flex-col h-full shadow-2xl shadow-black/20 hover:border-slate-700/50 transition-colors", className)}>
    {(title || Icon) && (
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          {Icon && (
            <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 shadow-inner">
              <Icon size={20} />
            </div>
          )}
          <div>
            {title && <h3 className="text-lg font-bold text-white tracking-tight leading-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 font-medium mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>
    )}
    <div className="flex-1">{children}</div>
  </div>
);

export const StatCard = ({ label, value, icon: Icon, trend, variant = 'indigo' }: any) => {
  const styles: any = {
    indigo: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
    purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
    green: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    red: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div className={cn("w-12 h-12 rounded-xl border flex items-center justify-center shadow-inner transition-transform group-hover:scale-110", styles[variant] || styles.indigo)}>
          <Icon size={24} />
        </div>
        {variant === 'indigo' && (
           <Badge variant="indigo">LIVE</Badge>
        )}
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{label}</p>
        <h4 className="text-3xl font-bold text-white mb-2 tracking-tighter italic">{value}</h4>
        {trend && (
           <div className="flex items-center gap-2">
              <span className={cn(
                  "text-[10px] font-bold uppercase tracking-tight",
                  variant === 'red' ? "text-rose-500" : "text-emerald-500"
              )}>{trend}</span>
              <span className="text-[10px] text-slate-600 font-medium uppercase tracking-widest">Growth Δ</span>
           </div>
        )}
      </div>
    </Card>
  );
};

import { motion, AnimatePresence } from 'framer-motion';

export const Tooltip = ({ content, children, className }: { content: string; children: React.ReactNode, className?: string }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className={cn("relative", className)} onMouseEnter={() => setIsVisible(true)} onMouseLeave={() => setIsVisible(false)}>
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-3 px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] whitespace-nowrap"
          >
            <div className="relative">
              <p className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest italic">{content}</p>
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-2 h-2 bg-slate-950 border-r border-b border-slate-800 rotate-45"></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const Input = ({ label, icon: Icon, error, className, ...props }: any) => (
  <div className="space-y-2">
    {label && <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-1">{label}</label>}
    <div className="relative group">
      {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" size={18} />}
      <input 
        className={cn(
          "w-full h-12 bg-slate-900/50 border border-slate-800 rounded-xl px-4 text-sm font-medium text-white placeholder:text-slate-700 outline-none transition-all shadow-xl",
          Icon && "pl-12",
          error ? "border-rose-500 focus:ring-rose-500/20" : "focus:border-indigo-500 focus:ring-indigo-500/20",
          className
        )}
        {...props}
      />
    </div>
    {error && <p className="text-[10px] font-bold text-rose-500 ml-1 italic">{error}</p>}
  </div>
);

export const Select = ({ label, children, error, className, ...props }: any) => (
  <div className="space-y-2">
    {label && <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-1">{label}</label>}
    <div className="relative group">
      <select 
        className={cn(
          "w-full h-12 bg-slate-900/50 border border-slate-800 rounded-xl px-4 text-sm font-medium text-white appearance-none outline-none transition-all shadow-xl cursor-pointer",
          error ? "border-rose-500 focus:ring-rose-500/20" : "focus:border-indigo-500 focus:ring-indigo-500/20",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600 group-hover:text-indigo-400 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
      </div>
    </div>
    {error && <p className="text-[10px] font-bold text-rose-500 ml-1 italic">{error}</p>}
  </div>
);

export const Spinner = ({ size = 24, className }: { size?: number, className?: string }) => (
  <Loader2 size={size} className={cn("animate-spin text-indigo-500", className)} />
);

export const LoadingScreen = ({ message = "Initializing Systems..." }: { message?: string }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xl">
    <div className="flex flex-col items-center justify-center p-12 glass-card shadow-[0_0_100px_rgba(99,102,241,0.15)] border border-indigo-500/10 rounded-[3rem]">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-indigo-500 rounded-full blur-[30px] opacity-20 animate-pulse-slow"></div>
        <Loader2 size={48} className="animate-spin text-indigo-400 relative z-10" />
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic">{message}</p>
    </div>
  </div>
);
