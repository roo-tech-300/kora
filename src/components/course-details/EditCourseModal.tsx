import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, CalendarDays, Clock } from 'lucide-react';
import { Card, Spinner, cn } from '../Common';

type EditCourseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  lecturers: any[];
  selectedTeachers: any[];
  toggleTeacher: (teacher: any) => void;
  editTitle: string;
  setEditTitle: (val: string) => void;
  editCode: string;
  setEditCode: (val: string) => void;
  editVenue: string;
  setEditVenue: (val: string) => void;
  editUnit: string;
  setEditUnit: (val: string) => void;
  schedule: any[];
  toggleDay: (index: number) => void;
  updateTime: (index: number, field: 'start' | 'end', value: string) => void;
  isSaving: boolean;
  saveError: string | null;
  handleSaveDetails: () => Promise<void>;
};

export const EditCourseModal = ({
  isOpen,
  onClose,
  lecturers,
  selectedTeachers,
  toggleTeacher,
  editTitle,
  setEditTitle,
  editCode,
  setEditCode,
  editVenue,
  setEditVenue,
  editUnit,
  setEditUnit,
  schedule,
  toggleDay,
  updateTime,
  isSaving,
  saveError,
  handleSaveDetails,
}: EditCourseModalProps) => {
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
                <h2 className="text-2xl font-bold text-white tracking-tight italic">Edit Course Details</h2>
                <p className="text-sm text-slate-500 uppercase tracking-widest italic mt-1">Update title, code, venue, and units</p>
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                <X size={20} />
              </button>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Course Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full h-12 bg-slate-900/70 border border-slate-800 rounded-xl px-4 text-white outline-none focus:border-indigo-500 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Course Code</label>
                <input
                  type="text"
                  value={editCode}
                  onChange={(e) => setEditCode(e.target.value)}
                  className="w-full h-12 bg-slate-900/70 border border-slate-800 rounded-xl px-4 text-white outline-none focus:border-indigo-500 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Venue</label>
                <input
                  type="text"
                  value={editVenue}
                  onChange={(e) => setEditVenue(e.target.value)}
                  className="w-full h-12 bg-slate-900/70 border border-slate-800 rounded-xl px-4 text-white outline-none focus:border-indigo-500 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Units</label>
                <input
                  type="number"
                  min={0}
                  value={editUnit}
                  onChange={(e) => setEditUnit(e.target.value)}
                  className="w-full h-12 bg-slate-900/70 border border-slate-800 rounded-xl px-4 text-white outline-none focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            {/* Lecturer Picker */}
            <div className="mb-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-1">Select Lecturers</label>
                <div className="flex flex-wrap gap-3 mt-3">
                  {lecturers.map((teacher) => {
                    const isSelected = !!selectedTeachers.find(t => t.$id === teacher.$id);
                    return (
                      <button
                        key={teacher.$id}
                        onClick={() => toggleTeacher(teacher)}
                        className={cn(
                          "w-14 h-14 rounded-2xl overflow-hidden border-2 transition-all p-0.5 relative cursor-pointer",
                          isSelected ? "border-indigo-500 scale-110 shadow-lg shadow-indigo-500/20" : "border-transparent opacity-60 hover:opacity-100"
                        )}
                      >
                        <div className="w-full h-full bg-slate-800 flex items-center justify-center rounded-xl text-sm font-black text-indigo-300 italic">
                          {teacher.name ? teacher.name.slice(0, 2).toUpperCase() : 'U'}
                        </div>
                        {isSelected && (
                          <div className="absolute inset-0 bg-indigo-600/20 flex items-center justify-center">
                            <div className="bg-indigo-500 rounded-full p-0.5">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                            </div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-1">Assigned Lecturers ({selectedTeachers.length})</label>
                <div className="space-y-4 mt-3">
                  <AnimatePresence>
                    {selectedTeachers.map((teacher) => (
                      <motion.div
                        key={teacher.$id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="p-3 bg-slate-900/50 border border-slate-800 rounded-4xl relative overflow-hidden"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-800 shadow-xl shrink-0 bg-slate-800 flex items-center justify-center text-sm font-black text-indigo-300 italic">
                            {teacher.name ? teacher.name.slice(0, 2).toUpperCase() : 'U'}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="text-sm font-bold text-white italic truncate">{`${teacher.title || ''} ${teacher.name || ''}`}</h4>
                                <p className="text-[10px] text-slate-500 mt-0.5 truncate">{teacher.email}</p>
                              </div>
                              <button onClick={() => toggleTeacher(teacher)} className="p-1.5 text-slate-600 hover:text-rose-500 transition-colors cursor-pointer">
                                <X size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Schedule Section */}
            <div className="mb-6">
              <Card className="p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <CalendarDays size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-white tracking-tight italic">Weekly Schedule</h3>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                  {schedule.map((slot, index) => (
                    <div key={slot.day} className={cn(
                      "flex flex-col items-start p-4 rounded-2xl border transition-all gap-4",
                      slot.active ? "bg-slate-900/30 border-slate-700/50" : "bg-transparent border-slate-800/30 opacity-60 hover:opacity-100"
                    )}>
                      <div className="flex items-center gap-3 w-full">
                        <button
                          onClick={() => toggleDay(index)}
                          className={cn(
                            "w-6 h-6 rounded-lg flex items-center justify-center border transition-all cursor-pointer",
                            slot.active ? "bg-indigo-500 border-indigo-500 text-white" : "bg-slate-800 border-slate-700 text-transparent"
                          )}
                        >
                          <Check size={12} />
                        </button>
                        <span className="text-[12px] font-bold text-white italic uppercase tracking-wide">
                          {slot.day}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-3 w-full">
                        <div className="flex items-center gap-2 bg-slate-950/40 px-3 py-2 rounded-2xl border border-slate-800/50">
                          <Clock size={14} className="text-indigo-400" />
                          <div className="flex-1">
                            <p className="text-[8px] uppercase text-slate-500 tracking-widest">Start</p>
                            <input
                              type="time"
                              value={slot.start}
                              onChange={(e) => updateTime(index, 'start', e.target.value)}
                              disabled={!slot.active}
                              className="bg-transparent border-none p-0 text-[11px] font-bold text-white outline-none disabled:opacity-50 w-full selection:bg-indigo-500/30 focus:ring-0 leading-none"
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2 bg-slate-950/40 px-3 py-2 rounded-2xl border border-slate-800/50">
                          <Clock size={14} className="text-indigo-400" />
                          <div className="flex-1">
                            <p className="text-[8px] uppercase text-slate-500 tracking-widest">End</p>
                            <input
                              type="time"
                              value={slot.end}
                              onChange={(e) => updateTime(index, 'end', e.target.value)}
                              disabled={!slot.active}
                              className="bg-transparent border-none p-0 text-[11px] font-bold text-white outline-none disabled:opacity-50 w-full selection:bg-indigo-500/30 focus:ring-0 leading-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {saveError && <p className="text-sm text-rose-400 mb-4">{saveError}</p>}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button
                onClick={onClose}
                className="h-12 px-5 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:border-slate-600 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDetails}
                disabled={isSaving}
                className="h-11 px-8 bg-indigo-600 rounded-xl text-xs font-black text-white hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-900/20 flex items-center gap-2 uppercase tracking-tighter italic disabled:opacity-50 cursor-pointer"
              >
                {isSaving ? <Spinner /> : 'Save Changes'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
