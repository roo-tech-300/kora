import { CalendarDays, ChevronRight } from 'lucide-react';
import { Card, Badge, cn } from '../Common';

type RecentSessionsProps = {
  recentSessions: any[];
  hasMoreSessions: boolean;
  setIsFullLogOpen: (open: boolean) => void;
  setSelectedSession: (session: any) => void;
  setActionModalType: (type: 'report' | 'upload' | null) => void;
  setIsActionModalOpen: (open: boolean) => void;
  className?: string;
};

export const RecentSessions = ({
  recentSessions,
  hasMoreSessions,
  setIsFullLogOpen,
  setSelectedSession,
  setActionModalType,
  setIsActionModalOpen,
  className,
}: RecentSessionsProps) => {
  return (
    <Card className={cn("p-6 flex flex-col", className)}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">Recent Sessions</h3>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {hasMoreSessions && (
            <button
              onClick={() => setIsFullLogOpen(true)}
              className="text-[10px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest transition-colors flex items-center gap-1.5 italic bg-transparent border-none p-0 cursor-pointer"
            >
              View Full Log <ChevronRight size={12} />
            </button>
          )}
        </div>
      </div>
      <div className="space-y-3">
        {recentSessions.length > 0 ? (
          recentSessions.map((session, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-slate-900/50 border border-slate-800/50 rounded-xl hover:bg-slate-800/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700 text-slate-400">
                  <CalendarDays size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-white italic">{session.date}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{session.title}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 sm:gap-6">
                {session.status === 'PENDING' ? (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => {
                        setSelectedSession(session);
                        setActionModalType('report');
                        setIsActionModalOpen(true);
                      }}
                      className="h-9 px-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
                    >
                      Report Missed
                    </button>
                    <button
                      onClick={() => {
                        setSelectedSession(session);
                        setActionModalType('upload');
                        setIsActionModalOpen(true);
                      }}
                      className="h-9 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
                    >
                      Upload CSV
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="text-right">
                      <p className="text-xs font-black text-white italic">{session.attendance}</p>
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-0.5">Status</p>
                    </div>
                    <Badge
                      variant={session.status === 'RECORDED' ? 'success' : 'danger'}
                      className="text-[9px] w-24 flex justify-center py-1.5 shadow-inner"
                    >
                      {session.status}
                    </Badge>
                  </>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-[10px] font-bold text-slate-600 italic mt-2">No past sessions available yet</p>
        )}
      </div>
    </Card>
  );
};
