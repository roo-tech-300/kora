import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

type ActionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  actionModalType: 'report' | 'upload' | null;
  selectedSessionLabel: string;
};

export const ActionModal = ({
  isOpen,
  onClose,
  actionModalType,
  selectedSessionLabel,
}: ActionModalProps) => {
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
            className="w-full max-w-2xl rounded-3xl border border-slate-800/70 bg-slate-950/90 shadow-2xl shadow-black/50 p-8"
          >
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight italic">
                  {actionModalType === 'report' ? 'Report Missed Class' : 'Upload Attendance CSV'}
                </h2>
                <p className="text-sm text-slate-500 uppercase tracking-widest italic mt-1">
                  {actionModalType === 'report'
                    ? 'Mark a scheduled session as missed for this course.'
                    : 'Upload a CSV file for an attended class.'}
                </p>
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {selectedSessionLabel && (
                <p className="text-xs text-slate-500 uppercase tracking-widest italic">{selectedSessionLabel}</p>
              )}
              <p className="text-sm text-slate-400">
                {actionModalType === 'report'
                  ? 'This action is a placeholder for reporting a missed class. Implementation can be wired to your classes table and enrollment flow.'
                  : 'This upload is a placeholder UI. Connect it to your CSV import flow when ready.'}
              </p>
              <button
                onClick={onClose}
                className="h-11 w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[11px] font-black uppercase tracking-widest transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
