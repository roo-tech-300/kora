import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Fingerprint, PlayCircle } from 'lucide-react';
import { Badge, cn } from '../components/Common';
import { getCourseById } from '../lib/apis/courses/courses';
import { createClassRecord, findExistingClassInstances } from '../lib/apis/courses/classes';

const WEEKLY_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const parseTimeToMinutes = (value: string) => {
  const raw = String(value || '').trim();
  if (!raw) return 0;
  const [hoursPart, minutesPart = '0'] = raw.split(':');
  const hours = Number(hoursPart);
  const minutes = Number(minutesPart);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return 0;
  return hours * 60 + minutes;
};

const getDayIndex = (day: any) => {
  if (typeof day === 'number') return day;
  return WEEKLY_DAYS.findIndex((name) => name.toLowerCase() === String(day).toLowerCase());
};

export const KioskMode = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = (location.state as any) || {};
  const courseId = routeState.courseId as string | undefined;
  const routeActiveClass = routeState.activeSession || null;

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<any>(null);
  const [activeClass, setActiveClass] = useState<any | null>(routeActiveClass);
  const [nextClass, setNextClass] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [scannedStudent, setScannedStudent] = useState<any>(null);
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    const resolveClassState = async () => {
      if (routeActiveClass) {
        try {
          const session = routeActiveClass;
          setActiveClass(session);
          setCourse({ title: session.title || 'Attendance' });

          if (courseId && session.course && session.timetable && session.date) {
            const existing = await findExistingClassInstances(courseId, [session]);
            if (!existing.length) {
              await createClassRecord({
                course: courseId,
                timetable: String(session.timetable),
                date: String(session.date),
                start: String(session.start || '08:00'),
                end: String(session.end || '10:00'),
              });
            }
          }

          setLoading(false);
          return;
        } catch (err) {
          console.error('Failed to create active class record from route state', err);
          setError('Failed to load attendance session.');
          setLoading(false);
          return;
        }
      }

      if (!courseId) {
        setError('No course selected for attendance.');
        setLoading(false);
        return;
      }

      try {
        const courseData = await getCourseById(courseId);
        setCourse(courseData);

        const now = new Date();
        const today = now.getDay();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        const normalizedSchedule = (courseData.schedule || [])
          .map((slot: any) => {
            const dayIndex = getDayIndex(slot.day);
            if (dayIndex < 0 || dayIndex > 6) return null;
            const active = slot.active === 'True' || slot.active === true;
            return {
              ...slot,
              dayIndex,
              active,
              start: slot.start || '08:00',
              end: slot.end || '10:00',
              startMinutes: parseTimeToMinutes(slot.start || '08:00'),
              endMinutes: parseTimeToMinutes(slot.end || '10:00'),
            };
          })
          .filter(Boolean)
          .filter((slot: any) => slot.active);

        const todaysSlots = normalizedSchedule.filter((slot: any) => slot.dayIndex === today);
        const liveSlot = todaysSlots.find((slot: any) => slot.startMinutes <= currentMinutes && currentMinutes < slot.endMinutes) || null;

        const futureSlots = normalizedSchedule
          .filter((slot: any) => slot.dayIndex > today || (slot.dayIndex === today && slot.startMinutes > currentMinutes))
          .sort((a: any, b: any) => {
            if (a.dayIndex !== b.dayIndex) return a.dayIndex - b.dayIndex;
            return a.startMinutes - b.startMinutes;
          });

        setNextClass(futureSlots[0] || null);

        if (!liveSlot) {
          setActiveClass(null);
          setLoading(false);
          return;
        }

        const dateIso = now.toISOString().slice(0, 10);
        const classInstance = {
          course: courseId,
          timetable: String(liveSlot.$id || `${liveSlot.dayIndex}-${liveSlot.start}-${liveSlot.end}`),
          date: dateIso,
          start: liveSlot.start,
          end: liveSlot.end,
        };

        const existing = await findExistingClassInstances(courseId, [classInstance]);
        if (!existing.length) {
          await createClassRecord(classInstance);
        }

        setActiveClass({
          ...classInstance,
          dayLabel: WEEKLY_DAYS[liveSlot.dayIndex],
        });
      } catch (err) {
        console.error('Failed to resolve kiosk attendance state', err);
        setError('Failed to load attendance session.');
      } finally {
        setLoading(false);
      }
    };

    resolveClassState();
  }, [courseId]);

  const title = useMemo(() => course?.title || 'Attendance', [course]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Resolving session...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="max-w-xl w-full rounded-3xl border border-slate-800 bg-slate-900/60 p-8 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-300">Attendance unavailable</p>
          <h1 className="mt-3 text-2xl font-bold text-white italic">{error}</h1>
          <button
            onClick={() => navigate(-1)}
            className="mt-6 h-11 px-5 rounded-xl bg-indigo-600 text-white text-xs font-black uppercase tracking-widest italic"
          >
            <ArrowLeft size={14} className="inline-block mr-2" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!activeClass) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-6 md:p-12">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white uppercase tracking-widest italic transition-colors"
          >
            <ArrowLeft size={14} /> Back
          </button>

          <div className="mt-8 rounded-[2rem] border border-slate-800 bg-slate-900/50 p-8 md:p-10">
            <div className="flex items-center gap-3">
              <Badge variant="indigo">Next Class</Badge>
            </div>
            <h1 className="mt-4 text-4xl md:text-6xl font-black italic tracking-tight">{title}</h1>
            <p className="mt-3 text-sm font-bold text-slate-400 uppercase tracking-widest italic">
              No class is active right now.
            </p>

            {nextClass ? (
              <div className="mt-8 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-300">Upcoming session</p>
                  <h2 className="mt-3 text-2xl font-bold text-white italic">{WEEKLY_DAYS[nextClass.dayIndex]}</h2>
                  <p className="mt-2 text-sm text-slate-400 font-bold">{nextClass.start} - {nextClass.end}</p>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Action</p>
                  <p className="mt-3 text-sm text-slate-300">
                    Attendance will open automatically once the class session becomes active.
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
                <p className="text-sm text-slate-400">No upcoming class was found for this course.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white uppercase tracking-widest italic transition-colors"
        >
          <ArrowLeft size={14} /> Back
        </button>

        <div className="mt-8 rounded-[2rem] border border-emerald-500/20 bg-emerald-500/5 p-8 md:p-10">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="success">In Session</Badge>
            <Badge variant="indigo">{activeClass.dayLabel}</Badge>
          </div>

          <h1 className="mt-4 text-4xl md:text-6xl font-black italic tracking-tight">{title}</h1>
          <p className="mt-3 text-sm text-emerald-100/80 font-bold">
            {activeClass.start} - {activeClass.end}
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-emerald-500/20 bg-slate-950/60 p-6">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-300">Ready to scan</p>
              <div className="mt-4 flex items-center gap-3 text-slate-200">
                <Fingerprint size={22} className="text-emerald-400" />
                <span className="text-sm font-bold">Open the fingerprint scanner for attendance capture</span>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Session key</p>
              <p className="mt-4 text-sm font-bold text-white break-all">
                {activeClass.course} :: {activeClass.timetable} :: {activeClass.date}
              </p>
            </div>
          </div>

          {!showScanner ? (
            <button
              className="mt-8 h-12 px-6 rounded-xl bg-white text-slate-950 text-xs font-black uppercase tracking-widest italic"
              onClick={() => setShowScanner(true)}
            >
              <PlayCircle size={14} className="inline-block mr-2" />
              Start Fingerprint Scan
            </button>
          ) : (
            <div className="mt-8 rounded-[2rem] border border-slate-800 bg-slate-900/60 p-8">
              <div
                className={cn(
                  'relative w-64 h-64 mx-auto rounded-[3.5rem] border-2 transition-all duration-700 flex items-center justify-center overflow-hidden cursor-pointer',
                  scanState === 'scanning'
                    ? 'border-indigo-500 bg-indigo-500/5 shadow-[0_0_80px_rgba(99,102,241,0.3)] scale-110'
                    : scanState === 'success'
                      ? 'border-emerald-500 bg-emerald-500/5 shadow-[0_0_80px_rgba(16,185,129,0.3)]'
                      : scanState === 'error'
                        ? 'border-rose-500 bg-rose-500/5 animate-shake'
                        : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:scale-[1.02] backdrop-blur-md'
                )}
                onClick={() => {
                  if (scanState !== 'idle') return;
                  setScanState('scanning');
                  setTimeout(() => {
                    const success = Math.random() > 0.1;
                    if (success) {
                      setScannedStudent({ name: 'Verified Student' });
                      setScanState('success');
                    } else {
                      setScanState('error');
                    }
                    setTimeout(() => {
                      setScanState('idle');
                      setScannedStudent(null);
                    }, 2500);
                  }, 1200);
                }}
              >
                <div className="relative">
                  {scanState === 'idle' && <Fingerprint size={100} className="text-slate-700 animate-pulse" />}
                  {scanState === 'scanning' && <Fingerprint size={100} className="text-white" />}
                  {scanState === 'success' && <Fingerprint size={100} className="text-emerald-500" />}
                  {scanState === 'error' && <Fingerprint size={100} className="text-rose-500" />}
                </div>
              </div>

              <div className="mt-8 text-center">
                <p className="text-2xl font-bold text-white uppercase italic tracking-tight">
                  {scanState === 'idle'
                    ? 'Awaiting biometric payload'
                    : scanState === 'scanning'
                      ? 'Orchestrating handshake...'
                      : scanState === 'success'
                        ? `Welcome, ${scannedStudent?.name}`
                        : 'Data mismatch'}
                </p>
                <p className="mt-3 text-slate-500 font-bold uppercase tracking-widest italic text-[10px]">
                  {scanState === 'idle'
                    ? 'Place finger on optical sensor'
                    : scanState === 'scanning'
                      ? 'Keep finger steady for depth scan'
                      : scanState === 'success'
                        ? 'Attendance logged to node'
                        : 'Please re-align and retry'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
