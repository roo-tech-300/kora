import { BellRing, CalendarDays, Clock3, MapPin, PlayCircle } from 'lucide-react';
import { Card, cn } from '../Common';

type LiveSessionCardProps = {
  session: {
    dayLabel: string;
    start: string;
    end: string;
    venue: string;
    date: string;
    title: string;
    course: string;
    timetable: string;
  } | null;
  scheduleRows: any[];
  onTakeAttendance?: () => void;
  className?: string;
};

const WEEKLY_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const parseTimeToMinutes = (value: string) => {
  const raw = String(value || '').trim();
  if (!raw) return 0;

  const [hoursPart, minutesPart = '0'] = raw.split(':');
  const hours = Number(hoursPart);
  const minutes = Number(minutesPart);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return 0;
  return (hours * 60) + minutes;
};

export const LiveSessionCard = ({ session, scheduleRows, onTakeAttendance, className }: LiveSessionCardProps) => {
  const isLive = Boolean(session);
  const today = new Date().getDay();
  const currentMinutes = new Date().getHours() * 60 + new Date().getMinutes();

  const upcomingWeekClasses = (Array.isArray(scheduleRows) ? scheduleRows : [])
    .map((slot: any) => {
      const dayIndex = typeof slot.day === 'number'
        ? slot.day
        : (typeof slot.day === 'string' && /^\d+$/.test(slot.day))
          ? Number(slot.day)
          : WEEKLY_DAYS.findIndex((name) => name.toLowerCase() === String(slot.day).toLowerCase());

      if (dayIndex < 0 || dayIndex > 6) return null;

      return {
        ...slot,
        dayIndex,
        active: slot.active === 'True' || slot.active === true,
        start: slot.start || '00:00',
        end: slot.end || '00:00',
      };
    })
    .filter((slot: any) => slot && slot.active && slot.dayIndex >= today)
    .filter((slot: any) => {
      if (slot.dayIndex !== today) return true;
      return parseTimeToMinutes(slot.end) > currentMinutes;
    })
    .sort((a: any, b: any) => {
      if (a.dayIndex !== b.dayIndex) return a.dayIndex - b.dayIndex;
      return a.start.localeCompare(b.start);
    });

  return (
    <Card className={cn('p-6 flex flex-col relative overflow-hidden group', className)}>
      {isLive && (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 via-transparent to-indigo-500/10 pointer-events-none" />
          <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-rose-500/10 blur-3xl group-hover:bg-rose-500/15 transition-colors" />
        </>
      )}

      <div className="relative z-10 flex flex-col gap-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-white tracking-tight">
              {isLive ? 'Live Session' : 'Upcoming classes'}
            </p>
            <h3 className="text-xl font-bold text-white tracking-tight">
              {isLive ? 'Session is live now' : 'Weekly Schedule'}
            </h3>
          </div>

          {isLive && (
            <div
              className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-rose-200"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_0_0_rgba(244,63,94,0.65)]" />
              Live
            </div>
          )}
        </div>

        {isLive ? (
          <>
            <div className="flex items-center gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/5 px-4 py-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-300">
                <BellRing size={22} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white italic truncate">{session?.title}</p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-rose-100/70">
                  {session?.dayLabel} · {session?.start} - {session?.end}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-800/60 bg-slate-950/40 p-4">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 italic">Venue</p>
                <p className="mt-2 text-sm font-bold text-white italic flex items-center gap-2">
                  <MapPin size={14} className="text-rose-300" />
                  {session?.venue}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-800/60 bg-slate-950/40 p-4">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 italic">Timer</p>
                <p className="mt-2 text-sm font-bold text-white italic flex items-center gap-2">
                  <Clock3 size={14} className="text-rose-300" />
                  {session?.start} - {session?.end}
                </p>
              </div>
            </div>

            <button
              onClick={onTakeAttendance}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-600 px-5 py-4 text-xs font-black uppercase tracking-widest text-white shadow-[0_12px_30px_rgba(244,63,94,0.25)] transition-all hover:bg-rose-500 active:scale-[0.98] cursor-pointer"
            >
              <PlayCircle size={16} />
              Take Attendance
            </button>
          </>
        ) : upcomingWeekClasses.length > 0 ? (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">Upcoming Classes</h3>
              </div>
            </div>

            <div className="space-y-3">
              {upcomingWeekClasses.map((slot: any) => (
                <div key={`${slot.dayIndex}-${slot.start}-${slot.end}`} className="flex items-center justify-between p-4 bg-slate-900/50 border border-slate-800/50 rounded-xl hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700 text-slate-400 shrink-0">
                      <CalendarDays size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white italic truncate">{WEEKLY_DAYS[slot.dayIndex]}</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{slot.start} - {slot.end}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-white italic">{slot.dayIndex === today ? 'Today' : 'Upcoming'}</p>
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-0.5">Status</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-800/60 bg-slate-950/40 p-6 text-sm text-slate-400 italic">
            No classes for the rest of the week
          </div>
        )}
      </div>
    </Card>
  );
};
