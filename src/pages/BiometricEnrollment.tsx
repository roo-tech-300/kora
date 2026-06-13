import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  ArrowLeft,
  Fingerprint,
  ShieldCheck,
  Info,
  CheckCircle2,
  CircleDashed,
  RefreshCw,
  Lock,
  AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge, cn } from '../components/Common';
import { getStudentById } from '../lib/apis/students/students';
import { captureAngle, uploadTemplate, finalizeEnrollment, ANGLES } from '../lib/scanner/enroll';

type Phase = 'idle' | 'scanning' | 'uploading' | 'complete' | 'error';

export const BiometricEnrollment = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState<any>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [templates, setTemplates] = useState<{
    straight?: string;
    tilted_left?: string;
    flat?: string;
  }>({});

  const currentStudent = student || {
    name: 'Loading student',
    $id: id || '—',
  };
  const initials = (currentStudent.name || 'Student')
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase();

  // Load cached templates on mount or student id change
  useEffect(() => {
    if (!id) return;
    const cached = localStorage.getItem(`biometric_enrollment_${id}`);
    if (cached) {
      try {
        setTemplates(JSON.parse(cached));
      } catch (e) {
        console.error("Failed to parse cached templates", e);
      }
    }
  }, [id]);

  // Derive active angle index from templates state
  let angleIndex = 0;
  if (templates.straight) {
    angleIndex = 1;
    if (templates.tilted_left) {
      angleIndex = 2;
      if (templates.flat) {
        angleIndex = 3;
      }
    }
  }

  const allScanned = !!(templates.straight && templates.tilted_left && templates.flat);

  const scanCurrentAngle = async () => {
    if (!student || phase === 'scanning' || phase === 'uploading') return;
    setPhase('scanning');
    setErrorMsg(null);

    const suffix = ANGLES[angleIndex]?.suffix;
    if (!suffix) return;

    try {
      let data = await captureAngle(student.$id || student.id, suffix);

      // Retry once if first attempt fails
      if (!data.success) {
        data = await captureAngle(student.$id || student.id, suffix);
        if (!data.success) {
          throw new Error(`Failed to capture: ${data.message}`);
        }
      }

      if (!data.template) {
        throw new Error("Scanner did not return template data.");
      }

      const updated = {
        ...templates,
        [suffix]: data.template
      };

      setTemplates(updated);
      localStorage.setItem(`biometric_enrollment_${student.$id || student.id}`, JSON.stringify(updated));
      setPhase('idle');
    } catch (error: any) {
      setPhase('error');
      let friendlyError = error?.message || 'Scan failed';
      if (friendlyError.includes('connect scanner')) {
        friendlyError = 'Scanner not detected. Please check the USB connection.';
      } else if (friendlyError.includes('try again')) {
        friendlyError = 'Scan timed out or failed. Please position your finger and try again.';
      }
      setErrorMsg(friendlyError);
      toast.error(friendlyError);
    }
  };

  const uploadBiometrics = async () => {
    if (!student || !templates.straight || !templates.tilted_left || !templates.flat) return;
    setPhase('uploading');
    setErrorMsg(null);

    try {
      // 1. Upload Straight template to storage
      const straightId = await uploadTemplate(templates.straight);
      // 2. Upload Tilted template to storage
      const tiltedId = await uploadTemplate(templates.tilted_left);
      // 3. Upload Flat template to storage
      const flatId = await uploadTemplate(templates.flat);

      // 4. Finalize database record
      await finalizeEnrollment(student.$id || student.id, [straightId, tiltedId, flatId]);

      // 5. Success cleanup
      localStorage.removeItem(`biometric_enrollment_${student.$id || student.id}`);
      setTemplates({});
      setPhase('complete');
      toast.success('Biometric enrollment complete');
    } catch (error: any) {
      setPhase('error');
      const friendlyError = error?.message || 'Failed to upload templates';
      setErrorMsg(friendlyError);
      toast.error(friendlyError);
    }
  };

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const s = await getStudentById(id as string);
        setStudent(s || { name: 'Unknown student', $id: id || '—' });
      } catch (error) {
        console.error('Failed to load student', error);
        setStudent({ name: 'Unknown student', $id: id || '—' });
      }
    })();
  }, [id]);

  return (
    <div className="space-y-8 animate-in pb-20">
      {/* Uploading Spinner Overlay */}
      <AnimatePresence>
        {phase === 'uploading' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center text-center p-6"
          >
            <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full"
              />
              <Fingerprint size={48} className="text-indigo-400 animate-pulse" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-widest text-white italic">Uploading Templates</h3>
            <p className="text-xs text-slate-400 font-bold mt-3 max-w-sm leading-relaxed italic">
              Securing mathematical representations of biometric data, generating cryptographic keys, and storing templates...
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex items-center gap-4">
          <Link to={`/admin/students/${currentStudent.$id}`} className="w-10 h-10 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-800 transition-all active:scale-95">
             <ArrowLeft size={18} />
          </Link>
          <div>
            <Badge variant="indigo" className="mb-3">Admin Protocol</Badge>
            <h1 className="text-3xl font-bold text-white tracking-tight italic leading-none uppercase">Biometric <span className="text-indigo-400">Enrollment</span></h1>
          </div>
        </div>
      </div>

      {/* --- Target Identity --- */}
      <div className="flex flex-col items-center mb-6 bg-slate-900/10 border border-slate-800/40 rounded-3xl p-6 max-w-xl mx-auto relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-xs h-32 bg-indigo-500/5 blur-[60px] rounded-full pointer-events-none"></div>
        <div className="relative z-10 flex items-center gap-5">
          {currentStudent.photo ? (
            <img src={currentStudent.photo} className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-800 shadow-xl" alt="" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-slate-900 border-2 border-slate-800 flex items-center justify-center text-lg font-black text-indigo-400 italic shadow-xl">
              {initials}
            </div>
          )}
          <div>
            <h2 className="text-lg font-bold text-white italic">Enrolling: <span className="text-indigo-400">{currentStudent.name || 'Loading...'}</span></h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1 italic">Matric No: {currentStudent.$id || '—'}</p>
          </div>
        </div>
      </div>

      {/* --- Celebratory Completion Banner --- */}
      <AnimatePresence>
        {phase === 'complete' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto mb-10 bg-emerald-950/20 border border-emerald-500/30 rounded-[2rem] p-8 text-center text-emerald-400 shadow-xl shadow-emerald-950/20 relative overflow-hidden"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-md h-32 bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none"></div>
            <div className="relative z-10">
              <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/20 shadow-lg shadow-emerald-950/40">
                <CheckCircle2 size={28} />
              </div>
              <h3 className="text-xl font-black uppercase tracking-widest italic">Enrollment Successful!</h3>
              <p className="text-[11px] font-bold text-slate-400 mt-3 max-w-md mx-auto leading-relaxed italic">
                All 3 fingerprint angles have been successfully captured, uploaded to the secure backend, and verified.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- 3-Angle Grid Area --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
        {ANGLES.map((a, i) => {
          let status: 'locked' | 'ready' | 'scanning' | 'completed' | 'failed' = 'locked';
          
          const suffix = a.suffix;
          const isScanned = !!(
            (suffix === 'straight' && templates.straight) ||
            (suffix === 'tilted_left' && templates.tilted_left) ||
            (suffix === 'flat' && templates.flat)
          );

          if (phase === 'complete' || isScanned) {
            status = 'completed';
          } else if (angleIndex === i) {
            if (phase === 'scanning') {
              status = 'scanning';
            } else if (phase === 'error') {
              status = 'failed';
            } else {
              status = 'ready';
            }
          } else {
            status = 'locked';
          }

          const isCurrent = angleIndex === i;
          const canClick = isCurrent && (phase === 'idle' || phase === 'error');

          return (
            <motion.div
              key={i}
              whileHover={canClick ? { scale: 1.02, y: -4 } : {}}
              whileTap={canClick ? { scale: 0.98 } : {}}
              className={cn(
                "relative p-8 rounded-[2.5rem] border-2 text-center transition-all duration-300 flex flex-col justify-between min-h-[380px] overflow-hidden",
                status === 'completed' && "bg-emerald-950/10 border-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-950/10",
                status === 'scanning' && "bg-indigo-950/20 border-indigo-500/80 text-indigo-400 ring-4 ring-indigo-500/10 shadow-2xl shadow-indigo-950/20",
                status === 'failed' && "bg-rose-950/10 border-rose-500/20 text-rose-400 shadow-lg shadow-rose-950/10",
                status === 'ready' && "bg-slate-900/20 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-900/30 cursor-pointer shadow-md",
                status === 'locked' && "bg-slate-950/10 border-slate-900/30 opacity-40 text-slate-600 cursor-not-allowed"
              )}
              onClick={() => {
                if (canClick) {
                  scanCurrentAngle();
                }
              }}
            >
              {/* Card Header Status Indicator */}
              <div className="flex items-center justify-between mb-4">
                <span className={cn(
                  "text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full italic",
                  status === 'completed' && "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
                  status === 'scanning' && "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 animate-pulse",
                  status === 'failed' && "bg-rose-500/10 text-rose-400 border border-rose-500/20",
                  status === 'ready' && "bg-slate-800 text-slate-400 border border-slate-700",
                  status === 'locked' && "bg-slate-950 text-slate-700 border border-slate-900/50"
                )}>
                  Angle {i + 1}
                </span>

                {status === 'completed' && <CheckCircle2 size={18} className="text-emerald-400" />}
                {status === 'scanning' && <CircleDashed size={18} className="text-indigo-400 animate-spin" />}
                {status === 'failed' && <AlertCircle size={18} className="text-rose-400" />}
                {status === 'ready' && <span className="w-2 h-2 bg-indigo-500 rounded-full animate-ping" />}
                {status === 'locked' && <Lock size={16} className="text-slate-700" />}
              </div>

              {/* Central Fingerprint Icon Container */}
              <div className="relative w-28 h-28 mx-auto my-4 flex items-center justify-center rounded-3xl bg-slate-950/60 border border-slate-800/60 overflow-hidden shadow-inner">
                {/* Laser Scanning Line Animation */}
                {status === 'scanning' && (
                  <motion.div
                    className="absolute left-0 right-0 h-0.5 bg-indigo-400 shadow-[0_0_8px_#818cf8] z-20"
                    animate={{ top: ['0%', '100%', '0%'] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}

                {/* Laser Overlay/Glow */}
                {status === 'scanning' && (
                  <div className="absolute inset-0 bg-indigo-500/5 pointer-events-none" />
                )}

                {/* Pulsing visual circles */}
                {status === 'scanning' && (
                  <>
                    <div className="absolute inset-2 border border-indigo-500/15 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
                    <div className="absolute inset-6 border border-indigo-500/10 rounded-full animate-pulse" />
                  </>
                )}

                <div className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300",
                  status === 'completed' && "bg-emerald-500/10 text-emerald-400",
                  status === 'scanning' && "bg-indigo-500/20 text-indigo-400 scale-105",
                  status === 'failed' && "bg-rose-500/10 text-rose-400",
                  status === 'ready' && "bg-slate-900 text-slate-500",
                  status === 'locked' && "bg-slate-900/20 text-slate-700"
                )}>
                  <Fingerprint size={36} strokeWidth={status === 'completed' || status === 'scanning' ? 2 : 1.2} />
                </div>
              </div>

              {/* Text Label & Descriptions */}
              <div className="space-y-2 flex-grow flex flex-col justify-end mt-4">
                <h3 className={cn(
                  "text-xs font-black italic tracking-wider uppercase",
                  status === 'completed' && "text-emerald-400",
                  status === 'scanning' && "text-indigo-300",
                  status === 'failed' && "text-rose-400",
                  status === 'ready' && "text-slate-300",
                  status === 'locked' && "text-slate-600"
                )}>
                  {a.suffix === 'straight' ? 'Straight Recurve' : a.suffix === 'tilted_left' ? 'Tilted Left Angle' : 'Flat Print (Wider)'}
                </h3>

                <p className={cn(
                  "text-[10px] font-bold leading-relaxed max-w-[200px] mx-auto italic h-12 flex items-center justify-center",
                  status === 'completed' && "text-emerald-500/60",
                  status === 'scanning' && "text-indigo-400/80",
                  status === 'failed' && "text-rose-500/80",
                  status === 'ready' && "text-slate-500",
                  status === 'locked' && "text-slate-700"
                )}>
                  {status === 'completed' && "Scan completed and verified"}
                  {status === 'scanning' && "Place your hand on the scanner..."}
                  {status === 'failed' && (errorMsg || "Scan failed")}
                  {status === 'ready' && "Click/Tap to initiate scanner"}
                  {status === 'locked' && "Awaiting previous scan completion"}
                </p>
              </div>

              {/* Footer controls inside the card */}
              <div className="mt-6 pt-4 border-t border-slate-900">
                {status === 'completed' && (
                  <span className="text-[9px] uppercase tracking-[0.2em] font-black text-emerald-400 flex items-center justify-center gap-1.5 italic">
                    <CheckCircle2 size={12} /> Captured
                  </span>
                )}
                {status === 'scanning' && (
                  <span className="text-[9px] uppercase tracking-[0.2em] font-black text-indigo-400 flex items-center justify-center gap-1.5 italic animate-pulse">
                    <CircleDashed size={12} className="animate-spin" /> Scanning...
                  </span>
                )}
                {status === 'failed' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      scanCurrentAngle();
                    }}
                    className="w-full py-2 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/20 rounded-xl text-[9px] uppercase tracking-[0.2em] font-black text-rose-400 transition-all active:scale-95 italic flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw size={12} /> Retry Angle
                  </button>
                )}
                {status === 'ready' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      scanCurrentAngle();
                    }}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[9px] uppercase tracking-[0.2em] font-black transition-all active:scale-95 italic flex items-center justify-center gap-1.5 shadow-md shadow-indigo-900/30"
                  >
                    Launch Scan
                  </button>
                )}
                {status === 'locked' && (
                  <span className="text-[9px] uppercase tracking-[0.2em] font-black text-slate-700 flex items-center justify-center gap-1.5 italic">
                    <Lock size={12} /> Locked
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* --- Footer Controls --- */}
      <div className="flex flex-col items-center gap-6 mt-8">
        {phase === 'complete' ? (
          <button
            onClick={() => navigate(`/admin/students/${currentStudent.$id}`)}
            className="h-12 px-8 bg-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-indigo-900/20 hover:bg-indigo-500 transition-all italic flex items-center gap-2"
          >
            <ArrowLeft size={16} /> Return to Profile
          </button>
        ) : (
          <div className="flex items-center gap-6">
            {allScanned ? (
              <button
                onClick={uploadBiometrics}
                className="h-12 px-8 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-900/20 transition-all active:scale-95 italic flex items-center gap-2"
              >
                Upload Biometrics
              </button>
            ) : (
              <button
                onClick={() => navigate('/admin/students')}
                className="text-[10px] font-black text-emerald-500 hover:text-emerald-400 uppercase tracking-widest transition-colors italic border-b border-transparent hover:border-emerald-500 pb-0.5"
              >
                Skip Biometric
              </button>
            )}
            
            {Object.keys(templates).length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm("Are you sure you want to clear all scanned angles and start over?")) {
                    localStorage.removeItem(`biometric_enrollment_${student.$id || student.id}`);
                    setTemplates({});
                    setPhase('idle');
                    setErrorMsg(null);
                  }
                }}
                className="text-[10px] font-black text-rose-500 hover:text-rose-400 uppercase tracking-widest transition-colors italic border-b border-transparent hover:border-rose-500 pb-0.5"
              >
                Reset Scans
              </button>
            )}

            <button
              onClick={() => navigate(`/admin/students/${currentStudent.$id}`)}
              className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors italic border-b border-transparent hover:border-slate-500 pb-0.5"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Info Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6 flex items-start gap-4 hover:border-slate-700/80 transition-colors">
           <div className="p-3 border border-slate-700 bg-slate-800/50 rounded-xl text-slate-400">
             <Info size={20} />
           </div>
           <div>
             <h4 className="text-[11px] font-black uppercase tracking-widest text-white italic mb-1">3 Angles for Accuracy</h4>
             <p className="text-[10px] text-slate-500 font-bold leading-relaxed italic">The scanner captures three positions (straight, tilted left, flat) to build a complete biometric profile for reliable matching.</p>
           </div>
        </div>
        <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6 flex items-start gap-4 hover:border-slate-700/80 transition-colors">
           <div className="p-3 border border-indigo-500/20 bg-indigo-500/10 rounded-xl text-indigo-400">
             <ShieldCheck size={20} />
           </div>
           <div>
             <h4 className="text-[11px] font-black uppercase tracking-widest text-white italic mb-1">Secure & Encrypted</h4>
             <p className="text-[10px] text-slate-500 font-bold leading-relaxed italic">We don't store actual fingerprints. Scans are immediately converted into non-reversible encrypted mathematical templates.</p>
           </div>
        </div>
      </div>
    </div>
  );
};
