import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Badge } from '../Common';

type FullSessionLogModalProps = {
  isOpen: boolean;
  onClose: () => void;
  allSessionItems: any[];
  setSelectedSession: (session: any) => void;
  setActionModalType: (type: 'report' | 'upload' | null) => void;
  setIsActionModalOpen: (open: boolean) => void;
};

export const FullSessionLogModal = ({
  isOpen,
  onClose,
  allSessionItems,
  setSelectedSession,
  setActionModalType,
  setIsActionModalOpen,
}: FullSessionLogModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/70 p-4 pt-24 md:pt-28"
        >
          <motion.div
            initial={{ y: 20, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.98 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl max-h-[calc(100vh-9rem)] rounded-3xl border border-slate-800/70 bg-slate-950/90 shadow-2xl shadow-black/50 p-8 overflow-y-auto overflow-x-hidden custom-scrollbar modal-scrollbar"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight italic">Full Session Log</h2>
                <p className="text-sm text-slate-500 uppercase tracking-widest italic mt-1">All past class instances for this course</p>
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                <X size={20} />
              </button>
            </div>

            {/* List */}
            <div className="space-y-3">
              {allSessionItems.length > 0 ? (
                allSessionItems.map((session, index) => (
                  <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-slate-900/50 border border-slate-800/50 rounded-xl gap-3">
                    <div>
                      <p className="text-xs font-bold text-white italic">{session.date}</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{session.title}</p>
                    </div>
                    {session.status === 'PENDING' ? (
                      <div className="flex flex-wrap gap-2 justify-end">
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
                      <Badge
                        variant={session.status === 'RECORDED' ? 'success' : 'danger'}
                        className="text-[9px] w-24 flex justify-center py-1.5 shadow-inner"
                      >
                        {session.status}
                      </Badge>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-[10px] font-bold text-slate-600 italic mt-2">No past sessions available yet.</p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
