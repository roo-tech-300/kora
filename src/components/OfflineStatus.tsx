import { X } from 'lucide-react';
import { useOffline } from '../context/OfflineContext';

export const OfflineStatus = () => {
  const { offline, showOfflineModal, dismissOfflineModal, goToCourses } = useOffline();

  return (
    <>
      {offline && (
        <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2 rounded-full border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-rose-300 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
          Offline mode active
        </div>
      )}

      {showOfflineModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[2rem] border border-slate-800 bg-slate-950 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.6)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-300">Offline notice</p>
                <h2 className="mt-2 text-2xl font-black italic text-white">You are offline, but the courses section still works.</h2>
              </div>
              <button
                onClick={dismissOfflineModal}
                className="rounded-lg border border-slate-800 p-2 text-slate-400 hover:text-white"
                aria-label="Dismiss offline notice"
              >
                <X size={16} />
              </button>
            </div>
            <p className="mt-4 text-sm text-slate-400">
              Cached course data will stay available, and attendance sync will resume once the connection returns.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={goToCourses}
                className="h-11 rounded-xl bg-white px-5 text-xs font-black uppercase tracking-widest text-slate-950"
              >
                Go to Courses
              </button>
              <button
                onClick={dismissOfflineModal}
                className="h-11 rounded-xl border border-slate-800 px-5 text-xs font-black uppercase tracking-widest text-white"
              >
                Keep browsing
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
