import { useState, useRef, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createStudent } from '../lib/apis/students/students';
import { getStudentRecommendedCourses, searchCourses } from '../lib/apis/courses/courses';
import { 
  ArrowLeft, 
  ShieldCheck,
  Info,
  User,
  Mail,
  Phone,
  Camera,
  Upload,
  X,
  Check,
  FlipHorizontal,
  ZapOff,
  BookOpen,
  Search as SearchIcon,
  Loader
} from 'lucide-react';
import { Card, Input, Select, Spinner } from '../components/Common';

// ── useDebounce Hook ────────────────────────────────────────────────────────
const useDebounce = <T,>(value: T, delay: number = 300): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

// ── Camera Modal ─────────────────────────────────────────────────────────────
const CameraModal = ({
  onCapture,
  onClose,
}: {
  onCapture: (dataUrl: string) => void;
  onClose: () => void;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mirrored, setMirrored] = useState(true);
  const [ready, setReady] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => setReady(true);
      }
    } catch {
      setError('Camera access denied or not available.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const capture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d')!;
    if (mirrored) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    stopCamera();
    onCapture(dataUrl);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/60 rounded-3xl overflow-hidden shadow-2xl shadow-black/60">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Live Camera</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-800 text-slate-500 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Video feed */}
        <div className="relative bg-black aspect-video flex items-center justify-center">
          {error ? (
            <div className="flex flex-col items-center gap-3 p-8 text-center">
              <ZapOff size={32} className="text-rose-500" />
              <p className="text-[11px] font-bold text-rose-400 uppercase tracking-widest italic">{error}</p>
              <p className="text-[9px] text-slate-500 italic">Ensure camera permissions are granted in your browser settings.</p>
            </div>
          ) : (
            <>
              {/* Guide overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <div className="w-40 h-52 border-2 border-indigo-400/60 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
              </div>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ transform: mirrored ? 'scaleX(-1)' : 'none' }}
              />
              {!ready && (
                <div className="absolute inset-0 flex items-center justify-center bg-black">
                  <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-3 px-6 py-5">
          <button
            onClick={() => setMirrored((m) => !m)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[9px] font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-all active:scale-95"
          >
            <FlipHorizontal size={14} /> Mirror
          </button>

          <button
            disabled={!ready || !!error}
            onClick={capture}
            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-white transition-all shadow-lg shadow-indigo-900/30 active:scale-95 italic"
          >
            <Camera size={16} /> Capture Photo
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Page ────────────────────────────────────────────────────────────────
export const AddStudent = () => {
  const navigate = useNavigate();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [matricNumber, setMatricNumber] = useState('');
  const [faculty, setFaculty] = useState('');
  const [department, setDepartment] = useState('');
  const [level, setLevel] = useState('');
  const [guardianEmail, setGuardianEmail] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');

  // Course state
  const [recommendedCourses, setRecommendedCourses] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingCourses, setLoadingCourses] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const debouncedDepartment = useDebounce(department, 400);

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFile = (file: File) => {
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
      setImageFile(file);
      if (errors.imageFile) setErrors({...errors, imageFile: ''});
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setShowOptions(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  // ── Fetch recommended courses when department & level change ──
  useEffect(() => {
    if (debouncedDepartment && level) {
      setLoadingCourses(true);
      getStudentRecommendedCourses(debouncedDepartment, level)
        .then((courses) => {
          setRecommendedCourses(courses || []);
          setSearchResults([]);
        })
        .catch((error) => {
          console.error('Error fetching recommended courses:', error);
          setRecommendedCourses([]);
        })
        .finally(() => setLoadingCourses(false));
    } else {
      setRecommendedCourses([]);
      setSearchResults([]);
    }
  }, [debouncedDepartment, level]);

  // ── Search courses with debouncing ──
  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      setLoadingCourses(true);
      searchCourses(debouncedSearchQuery)
        .then((courses) => {
          setSearchResults(courses || []);
        })
        .catch((error) => {
          console.error('Error searching courses:', error);
          setSearchResults([]);
        })
        .finally(() => setLoadingCourses(false));
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearchQuery]);

  // ── Toggle course selection ──
  const toggleCourseSelection = (courseId: string) => {
    const newSelected = new Set(selectedCourses);
    if (newSelected.has(courseId)) {
      newSelected.delete(courseId);
    } else {
      newSelected.add(courseId);
    }
    setSelectedCourses(newSelected);
  };

  // ── Validate form fields ──
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    if (!matricNumber.trim()) {
      newErrors.matricNumber = 'Matric number is required';
    }
    if (!level) {
      newErrors.level = 'Level is required';
    }
    if (!studentEmail.trim()) {
      newErrors.studentEmail = 'Email is required';
    }
    if (!imageFile) {
      newErrors.imageFile = 'Passport photo is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Convert dataUrl to File ──
  const dataUrlToFile = (dataUrl: string, fileName: string = 'passport.jpg'): File => {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], fileName, { type: mime });
  };

  const handleSubmit = async (enrollFingerprint: boolean = false) => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      const student = await createStudent(
        fullName,
        matricNumber,
        level,
        department,
        guardianEmail,
        guardianPhone,
        imageFile!,
        gender,
        faculty,
        parseInt(age) || 0,
        studentPhone,
        studentEmail,
        Array.from(selectedCourses)
      );

      if (enrollFingerprint) {
        navigate(`/admin/students/${student.$id}/enroll`);
      } else {
        navigate('/admin/students');
      }
    } catch (error) {
      console.log('Error creating student:', error);
      alert('Failed to create student. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Camera Modal — rendered at root level, outside card */}
      {showCamera && (
        <CameraModal
          onCapture={(dataUrl) => {
            setImagePreview(dataUrl);
            const file = dataUrlToFile(dataUrl, 'passport.jpg');
            setImageFile(file);
            if (errors.imageFile) setErrors({...errors, imageFile: ''});
            setShowCamera(false);
            setShowOptions(false);
          }}
          onClose={() => {
            setShowCamera(false);
            setShowOptions(false);
          }}
        />
      )}

      <div className="space-y-8 animate-in pb-20 mt-4">
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link
            to="/admin/students"
            className="flex items-center gap-2 text-slate-500 hover:text-white font-bold uppercase tracking-widest text-[10px] transition-all group italic"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Directory
          </Link>
        </div>

        <header className="max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight italic leading-none uppercase">
            Add <br />
            <span className="text-indigo-500">New Student</span>
          </h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-4 max-w-2xl leading-relaxed italic">
            Initialize a new student profile within the institutional database. Biometric enrollment is recommended for automated attendance tracking.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main Form Area */}
          <div className="lg:col-span-2 space-y-8">
            <Card title="Personal Information" subtitle="Core identities & academic placement" className="shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                <div className="md:col-span-2">
                  <Input label="Full Name" placeholder="e.g. Jonathan R. Doe" icon={User} value={fullName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setFullName(e.target.value); if (errors.fullName) setErrors({...errors, fullName: ''}) }} />
                  {errors.fullName && <p className="text-[9px] font-bold text-rose-500 mt-1 italic">{errors.fullName}</p>}
                  <p className="text-[9px] font-bold text-slate-600 mt-2 italic">Legal name as it appears on birth certificate or ID.</p>
                </div>

                <Input label="Age" placeholder="e.g. 19" value={age} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAge(e.target.value)} />
                <Select label="Gender" value={gender} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setGender(e.target.value)}>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </Select>

                <div>
                  <Input label="Student Email" placeholder="student@university.edu" icon={Mail} value={studentEmail} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setStudentEmail(e.target.value); if (errors.studentEmail) setErrors({...errors, studentEmail: ''}) }} />
                  {errors.studentEmail && <p className="text-[9px] font-bold text-rose-500 mt-1 italic">{errors.studentEmail}</p>}
                </div>
                <Input label="Student Phone" placeholder="+234 800 000 0000" icon={Phone} value={studentPhone} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStudentPhone(e.target.value)} />

                <div className="md:col-span-2 space-y-1">
                  <Input label="Matric Number" placeholder="e.g. KORA/24/0001" icon={Info} value={matricNumber} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setMatricNumber(e.target.value); if (errors.matricNumber) setErrors({...errors, matricNumber: ''}) }} />
                  {errors.matricNumber && <p className="text-[9px] font-bold text-rose-500 mt-1 italic">{errors.matricNumber}</p>}
                  <p className="text-[9px] font-bold text-slate-600 italic">Institutional identification code</p>
                </div>

                <Input label="Faculty" placeholder="e.g. Science" value={faculty} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFaculty(e.target.value)} />
                <Input label="Department" placeholder="e.g. Computer Science" value={department} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDepartment(e.target.value)} />

                <div className="md:col-span-2">
                  <Select label="Level" value={level} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { setLevel(e.target.value); if (errors.level) setErrors({...errors, level: ''}) }}>
                    <option value="">Select Level</option>
                    <option value="100">100 Level</option>
                    <option value="200">200 Level</option>
                    <option value="300">300 Level</option>
                    <option value="400">400 Level</option>
                    <option value="500">500 Level</option>
                  </Select>
                  {errors.level && <p className="text-[9px] font-bold text-rose-500 mt-1 italic">{errors.level}</p>}
                </div>
              </div>
            </Card>

            <Card title="Guardian Contacts" subtitle="Emergency & verification access">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                <Input label="Guardian Email" placeholder="guardian@email.com" icon={Mail} value={guardianEmail} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGuardianEmail(e.target.value)} />
                <Input label="Phone Number" placeholder="+234 800 000 0000" icon={Phone} value={guardianPhone} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGuardianPhone(e.target.value)} />
              </div>
            </Card>

            <Card title="Course Enrollment" subtitle="Assign courses based on curriculum or search" className="shadow-2xl">
              <div className="space-y-6 mt-4">
                {/* Search Courses */}
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic block mb-3">Search Courses</label>
                  <div className="relative">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400" size={16} />
                    <input
                      type="text"
                      placeholder="Search by course name, code..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-10 bg-slate-900/50 border border-slate-800 rounded-xl pl-10 pr-4 text-white font-medium text-sm outline-none focus:border-indigo-500/50 focus:bg-slate-900 transition-all"
                    />
                    {loadingCourses && <Loader size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-400 animate-spin" />}
                  </div>
                </div>

                {/* Recommended Courses */}
                {loadingCourses && debouncedDepartment && level && recommendedCourses.length === 0 && !debouncedSearchQuery && (
                  <div className="flex items-center gap-3 py-4">
                    <Loader size={16} className="text-indigo-400 animate-spin shrink-0" />
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">Loading recommended courses...</p>
                  </div>
                )}
                {recommendedCourses.length > 0 && (
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic mb-2">Recommended ({recommendedCourses.length})</p>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {recommendedCourses.map((course) => (
                        <label key={course.$id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/30 hover:bg-slate-900/50 transition-colors cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={selectedCourses.has(course.$id)}
                            onChange={() => toggleCourseSelection(course.$id)}
                            className="w-4 h-4 rounded cursor-pointer accent-indigo-500"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold text-white group-hover:text-indigo-400 transition-colors truncate italic">{course.title || course.course}</p>
                            <p className="text-[9px] text-slate-500">{course.code}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic mb-2">Search Results ({searchResults.length})</p>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {searchResults.map((course) => (
                        <label key={course.$id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/30 hover:bg-slate-900/50 transition-colors cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={selectedCourses.has(course.$id)}
                            onChange={() => toggleCourseSelection(course.$id)}
                            className="w-4 h-4 rounded cursor-pointer accent-indigo-500"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold text-white group-hover:text-indigo-400 transition-colors truncate italic">{course.title || course.course}</p>
                            <p className="text-[9px] text-slate-500">{course.code}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {!loadingCourses && recommendedCourses.length === 0 && searchResults.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <BookOpen size={32} className="text-slate-700 mb-2" />
                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider italic">
                      {debouncedDepartment && level ? 'No courses available' : 'Select Department & Level above'}
                    </p>
                  </div>
                )}

                {/* Selected Count */}
                {selectedCourses.size > 0 && (
                  <div className="pt-3 border-t border-slate-800/50 flex items-center gap-2">
                    <Check size={16} className="text-emerald-500" />
                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest italic">
                      {selectedCourses.size} course{selectedCourses.size !== 1 ? 's' : ''} selected
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar Controls */}
          <div className="space-y-8">
            <Card>
              {/* ── Passport Photo Upload ── */}
              <div className="pt-6 mt-6 border-t border-slate-800/50">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic mb-4">Passport Photograph</p>

                <div
                  className={`relative overflow-hidden flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-xl transition-all duration-200 group cursor-pointer ${
                    isDragging
                      ? 'border-indigo-500 bg-indigo-500/10 scale-[1.02]'
                      : 'border-slate-700/50 hover:border-indigo-500/50 hover:bg-indigo-500/5'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => !imagePreview && setShowOptions(true)}
                >
                  {/* ── Preview ── */}
                  {imagePreview ? (
                    <div className="relative w-full h-full group/preview">
                      <img src={imagePreview} alt="Passport preview" className="w-full h-full object-cover" />
                      {/* hover overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button
                          onClick={(e) => { e.stopPropagation(); setShowOptions(true); }}
                          className="p-2.5 bg-indigo-600 rounded-full text-white hover:bg-indigo-500 transition-colors shadow-lg"
                          title="Change photo"
                        >
                          <Camera size={16} />
                        </button>
                        <button
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setImagePreview(null); 
                            setImageFile(null);
                          }}
                          className="p-2.5 bg-rose-600 rounded-full text-white hover:bg-rose-500 transition-colors shadow-lg"
                          title="Remove photo"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      {/* success badge */}
                      <div className="absolute bottom-2 right-2 bg-emerald-500 p-1 rounded-full shadow-lg">
                        <Check size={12} className="text-white" />
                      </div>
                    </div>
                  ) : (
                    /* ── Empty state ── */
                    <>
                      <div className="w-12 h-12 rounded-full bg-slate-800/50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Camera size={20} className="text-slate-400 group-hover:text-indigo-400 transition-colors" />
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Initialize Capture</p>
                      <p className="text-[8px] font-medium text-slate-600 mt-1 italic text-center px-4">
                        Drag &amp; drop or click to choose source
                      </p>
                    </>
                  )}

                  {/* ── Source picker overlay ── */}
                  {showOptions && !imagePreview && (
                    <div
                      className="absolute inset-0 bg-slate-950/95 backdrop-blur-sm flex flex-col items-center justify-center gap-3 p-5"
                      style={{ animation: 'fadeInScale 0.15s ease-out' }}
                    >
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest italic mb-1">Select Source</p>

                      <button
                        onClick={(e) => { e.stopPropagation(); setShowOptions(false); setShowCamera(true); }}
                        className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white transition-all border border-slate-700 active:scale-95"
                      >
                        <Camera size={14} /> Direct Camera
                      </button>

                      <button
                        onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                      >
                        <Upload size={14} /> Upload File
                      </button>

                      <button
                        onClick={(e) => { e.stopPropagation(); setShowOptions(false); }}
                        className="mt-1 text-slate-500 hover:text-white transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/jpeg, image/png"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    if (e.target.files?.[0]) handleFile(e.target.files[0]);
                    e.target.value = '';
                  }}
                />
                {errors.imageFile && <p className="text-[9px] font-bold text-rose-500 mt-3 italic">{errors.imageFile}</p>}
              </div>

              <div className="pt-6 mt-6 flex gap-4 text-slate-600 border-t border-slate-800/50">
                <ShieldCheck size={24} className="shrink-0 text-slate-700" />
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic leading-none">Security Standards</p>
                  <p className="text-[9px] font-medium leading-relaxed mt-1.5 italic">
                    Data is encrypted via AES-256 and stored according to institutional privacy protocols.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Bottom Submit Section */}
        <div className="mt-12 pt-8 border-t border-slate-800/50 flex gap-4 justify-start">
          <button
            onClick={() => handleSubmit(true)}
            disabled={isSubmitting}
            className="h-11 px-8 bg-indigo-600 rounded-xl text-xs font-black text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-900/20 flex items-center gap-2 uppercase tracking-tighter italic"
          >
            {isSubmitting ? <Spinner /> : (
              <>
                Next <ArrowLeft size={16} className="rotate-180" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Keyframe for overlay animation */}
      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.96); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </>
  );
};
