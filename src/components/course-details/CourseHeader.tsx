import { Link } from 'react-router-dom';
import { ChevronRight, User, MapPin, Clock, Pencil, PlayCircle } from 'lucide-react';
import { Badge } from '../Common';

type CourseHeaderProps = {
  course: any;
  sessionName: string;
  teacherNames: string;
  isActive: boolean;
  setIsEditOpen: (open: boolean) => void;
  onStartSession?: () => void;
  onEndSession?: () => void;
  isLive?: boolean;
  nextSession: { label: string; isToday: boolean } | null;
  isTeacher: boolean;
  isAdmin: boolean;
  backHref: string;
  backLabel: string;
};

export const CourseHeader = ({
  course,
  sessionName,
  teacherNames,
  isActive,
  setIsEditOpen,
  onStartSession,
  onEndSession,
  isLive,
  nextSession,
  isTeacher,
  isAdmin,
  backHref,
  backLabel,
}: CourseHeaderProps) => {
  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest italic">
        <Link to={backHref} className="text-slate-500 hover:text-indigo-400 transition-colors">
          {backLabel}
        </Link>
        <ChevronRight size={12} className="text-slate-600" />
        <span className="text-white">{sessionName}</span>
      </div>

      {/* Header Info */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <Badge variant="indigo" className="mb-3 uppercase text-[9px] font-black italic tracking-widest px-3 py-1">
            {course.code}
          </Badge>
          <h1 className="text-4xl font-bold text-white tracking-tight italic leading-none">{sessionName}</h1>
          <div className="flex flex-wrap items-center gap-6 mt-4 text-[11px] font-bold text-slate-400 italic">
            <div className="flex items-center gap-2">
              <User size={14} className="text-indigo-500/70" />
              <span>{teacherNames}</span>
            </div>
            {course.venue && (
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-indigo-500/70" />
                <span className="uppercase">{course.venue}</span>
              </div>
            )}
            {isTeacher && (
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-indigo-500/70" />
                <span className="uppercase">{isActive ? 'End Time: 11:30 AM' : 'Start Time: 10:00 AM'}</span>
              </div>
            )}
            {nextSession && (
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-indigo-500/70" />
                <span>{nextSession.label}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {(isTeacher || isAdmin) && (
              isLive ? (
                <button
                  onClick={onEndSession}
                  className="h-10 px-5 bg-rose-600 rounded-xl text-xs font-black text-white hover:bg-rose-500 transition-all flex items-center gap-2 uppercase tracking-tighter italic shadow-lg shadow-rose-900/20 active:scale-95"
                >
                  <PlayCircle size={14} className="rotate-180 text-rose-200" /> End Session
                </button>
              ) : (
                <button
                  onClick={onStartSession}
                  className="h-10 px-5 bg-indigo-600 rounded-xl text-xs font-black text-white hover:bg-indigo-500 transition-all flex items-center gap-2 uppercase tracking-tighter italic shadow-lg shadow-indigo-900/20 active:scale-95"
                >
                  <PlayCircle size={14} /> Start Session  
                </button>
              )
            )}
            {isAdmin && (
              <button
                onClick={() => setIsEditOpen(true)}
                className="h-10 px-5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-black text-slate-300 hover:text-white hover:bg-slate-800 transition-all flex items-center gap-2 uppercase tracking-tighter italic"
              >
                <Pencil size={14} /> Edit Details
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
