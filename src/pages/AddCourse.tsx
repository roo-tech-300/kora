import { useEffect, useState } from 'react';
import { 
  BookOpen, 
  MapPin, 
  User, 
  Plus, 
  X, 
  Calendar,
  Check,
  ChevronRight,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { cn, Badge, Card, Spinner, Tooltip } from '../components/Common';
import { getInstitutionUsers } from '../lib/apis/auth/getInstitutionUsers';
import { createCourse } from '../lib/apis/courses/courses';

export const AddCourse = () => {
    const navigate = useNavigate();
    const [Teachers, setTeachers] = useState<any[]>([]);
    const [selectedTeachers, setSelectedTeachers] = useState<any[]>([]);
    const [schedule, setSchedule] = useState([
        { day: 'Monday', active: true, start: '08:00', end: '10:00', startDate: '', endDate: '' },
        { day: 'Tuesday', active: false, start: '08:00', end: '10:00', startDate: '', endDate: '' },
        { day: 'Wednesday', active: true, start: '08:00', end: '10:00', startDate: '', endDate: '' },
        { day: 'Thursday', active: false, start: '08:00', end: '10:00', startDate: '', endDate: '' },
        { day: 'Friday', active: false, start: '08:00', end: '10:00', startDate: '', endDate: '' },
        { day: 'Saturday', active: false, start: '08:00', end: '10:00', startDate: '', endDate: '' },
        { day: 'Sunday', active: false, start: '08:00', end: '10:00', startDate: '', endDate: '' },
    ]);

    // form states
    const [courseTitle, setCourseTitle] = useState('');
    const [courseCode, setCourseCode] = useState('');
    const [venue, setVenue] = useState('');
    const [unit, setUnit] = useState<number | string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);


    const getIsoDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const getNextWeekdayDate = (dayName: string) => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const targetIndex = days.indexOf(dayName);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const offset = (targetIndex - today.getDay() + 7) % 7;
        const nextDate = new Date(today);
        nextDate.setDate(today.getDate() + offset);
        return getIsoDate(nextDate);
    };

    const normalizeScheduleSlot = (slot: any) => {
        const startDate = slot.startDate || getNextWeekdayDate(slot.day);
        const todayIso = getIsoDate(new Date());
        const endDate = slot.endDate || (startDate > todayIso ? startDate : todayIso);

        return {
            day: slot.day,
            start: slot.start,
            end: slot.end,
            startDate,
            endDate,
            active: slot.active,
        };
    };

    const prepareScheduleForSubmit = () => schedule
        .filter(slot => slot.active)
        .map(normalizeScheduleSlot);

    const handleSubmit = async () =>{
        try {
            setIsSubmitting(true);
            const parsedUnit = Number(unit);
            const submissionSchedule = prepareScheduleForSubmit();
            await createCourse(
              courseTitle,
              courseCode,
              selectedTeachers.map(t => t.$id),
              venue,
              Number.isNaN(parsedUnit) ? 0 : parsedUnit,
              submissionSchedule
            );
            navigate('/admin/courses');
        } catch (error) {
            console.log(`Error creating course: ${error}`);
        }finally{
            setIsSubmitting(false);
        }
    }

    const toggleDay = (index: number) => {
        const newSchedule = [...schedule];
        newSchedule[index].active = !newSchedule[index].active;
        setSchedule(newSchedule);
    };

    const updateTime = (index: number, field: 'start' | 'end', value: string) => {
        const newSchedule = [...schedule];
        newSchedule[index][field] = value;
        setSchedule(newSchedule);
    };

    const updateDate = (index: number, field: 'startDate' | 'endDate', value: string) => {
        const newSchedule = [...schedule];
        newSchedule[index][field] = value;
        setSchedule(newSchedule);
    };

    const toggleTeacher = (teacher: any) => {
        if (selectedTeachers.find(t => t.$id === teacher.$id)) {
            setSelectedTeachers(selectedTeachers.filter(t => t.$id !== teacher.$id));
        } else {
            setSelectedTeachers([...selectedTeachers, teacher]);
        }
    };

    const getNextClass = () => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const today = new Date().getDay();
        const todayName = days[today];
        const now = new Date();
        const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

        // Find active classes
        const activeClasses = schedule.filter(slot => slot.active);
        if (activeClasses.length === 0) return null;

        // Check if there's a class today after current time
        const todayClass = activeClasses.find(slot => slot.day === todayName && slot.start > currentTime);
        if (todayClass) {
            return { type: 'time', value: todayClass.start };
        }

        // Find next day with a class
        let nextDayIndex = (today + 1) % 7;
        for (let i = 0; i < 7; i++) {
            const nextDay = days[nextDayIndex];
            const nextClass = activeClasses.find(slot => slot.day === nextDay);
            if (nextClass) {
                return { type: 'day', value: nextDay };
            }
            nextDayIndex = (nextDayIndex + 1) % 7;
        }

        return null;
    };

    const nextClass = getNextClass();

    useEffect(() => {
        const fetchTeachers = async()=>{
            const teachers = await getInstitutionUsers();
            setTeachers(teachers);
        }
        fetchTeachers();
    }, []);

    return (
        <div className="space-y-10 animate-in pb-20">
            {/* Header / Breadcrumbs */}
            <div className="flex flex-col gap-6">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest italic">
                    <Link to="/admin/courses" className="text-slate-500 hover:text-indigo-400 transition-colors">Courses</Link>
                    <ChevronRight size={12} className="text-slate-600" />
                    <span className="text-white">Create New Course</span>
                </div>
                
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div>
                        <h1 className="text-4xl font-bold text-white tracking-tight italic leading-none uppercase">Create <span className="text-indigo-500">Course</span></h1>
                    </div>
                </div>
            </div>

            <div className="space-y-8">
                {/* Top Section: General Info & Instructor Assignment */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-stretch">
                    {/* General Information */}
                    <div className="xl:col-span-7">
                        <Card className="p-8 h-full">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                                    <BookOpen size={20} />
                                </div>
                                <h3 className="text-lg font-bold text-white tracking-tight italic">General Information</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-1">Course Title</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. Applied Mathematics"
                                        value={courseTitle}
                                        onChange={(e) => setCourseTitle(e.target.value)}
                                        className="w-full h-12 bg-slate-950/50 border border-slate-800 rounded-xl px-4 text-white font-medium text-sm outline-none focus:border-indigo-500 focus:bg-slate-950 transition-all italic"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-1">Course Code</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. GET-301"
                                        value={courseCode}
                                        onChange={(e) => setCourseCode(e.target.value)}
                                        className="w-full h-12 bg-slate-950/50 border border-slate-800 rounded-xl px-4 text-white font-medium text-sm outline-none focus:border-indigo-500 focus:bg-slate-950 transition-all italic appearance-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-1">Course Units</label>
                                    <input 
                                        type="number" 
                                        min={0}
                                        placeholder="e.g. 3"
                                        value={unit}
                                        onChange={(e) => setUnit(e.target.value)}
                                        className="w-full h-12 bg-slate-950/50 border border-slate-800 rounded-xl px-4 text-white font-medium text-sm outline-none focus:border-indigo-500 focus:bg-slate-950 transition-all italic appearance-none"
                                    />
                                </div>

                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-1">Venue</label>
                                    <Tooltip content={venue || 'e.g. LAB-402 or B-204'}>
                                        <div className="relative w-full">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 flex-shrink-0 pointer-events-none">
                                                <MapPin size={18} />
                                            </div>
                                            <input 
                                                type="text" 
                                                placeholder="e.g. LAB-402 or B-204"
                                                value={venue}
                                                onChange={(e) => setVenue(e.target.value)}
                                                className="w-full h-12 bg-slate-950/50 border border-slate-800 rounded-xl pl-12 pr-4 text-white font-medium text-sm outline-none focus:border-indigo-500 focus:bg-slate-950 transition-all italic block"
                                                style={{ maxWidth: '100%' }}
                                            />
                                        </div>
                                    </Tooltip>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Instructor Assignment */}
                    <div className="xl:col-span-5">
                        <Card className="p-8 h-full">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                                    <User size={20} />
                                </div>
                                <h3 className="text-lg font-bold text-white tracking-tight italic">Assign Lecturer</h3>
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-1">Select Faculty Nodes</label>
                                    <div className="flex flex-wrap gap-3">
                                        {Teachers.map((teacher) => {
                                            const isSelected = selectedTeachers.find(t => t.$id === teacher.$id);
                                            return (
                                                <button 
                                                    key={teacher.$id}
                                                    onClick={() => toggleTeacher(teacher)}
                                                    className={cn(
                                                        "w-14 h-14 rounded-2xl overflow-hidden border-2 transition-all p-0.5 relative",
                                                        isSelected ? "border-indigo-500 scale-110 shadow-lg shadow-indigo-500/20" : "border-transparent opacity-60 hover:opacity-100"
                                                    )}
                                                >
                                                    <div className="w-full h-full bg-slate-800 flex items-center justify-center rounded-xl text-sm font-black text-indigo-300 italic">
                                                        {teacher.name ? teacher.name.slice(0, 2).toUpperCase() : 'U'}
                                                    </div>
                                                    {isSelected && (
                                                        <div className="absolute inset-0 bg-indigo-600/20 flex items-center justify-center">
                                                            <div className="bg-indigo-500 rounded-full p-0.5">
                                                                <Check size={10} className="text-white" />
                                                            </div>
                                                        </div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                        <button className="w-14 h-14 rounded-2xl border-2 border-dashed border-slate-700 flex items-center justify-center text-slate-500 hover:text-indigo-400 hover:border-indigo-500 transition-all">
                                            <Plus size={24} />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-1">Assigned Lecturers ({selectedTeachers.length})</label>
                                    <div className="space-y-4">
                                        <AnimatePresence>
                                            {selectedTeachers.map((teacher) => (
                                                <motion.div
                                                    key={teacher.$id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    className="p-4 bg-slate-900/50 border border-slate-800 rounded-4xl relative overflow-hidden group"
                                                >
                                                    <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-500/5 blur-2xl rounded-full"></div>
                                                    
                                                    <div className="flex items-center gap-4 relative z-10">
                                                        <div className="w-14 h-14 rounded-xl overflow-hidden border border-slate-800 shadow-xl shrink-0 bg-slate-800 flex items-center justify-center text-sm font-black text-indigo-300 italic">
                                                            {teacher.name ? teacher.name.slice(0, 2).toUpperCase() : 'U'}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <h4 className="text-sm font-bold text-white italic truncate">{`${teacher.title} ${teacher.name}`}</h4>
                                                                    <p className="text-[10px] font-medium text-slate-500 mt-0.5 truncate">{teacher.email}</p>
                                                                </div>
                                                                <button 
                                                                    onClick={() => toggleTeacher(teacher)}
                                                                    className="p-1.5 text-slate-600 hover:text-rose-500 transition-colors"
                                                                >
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
                        </Card>
                    </div>
                </div>

                {/* Bottom Section: Weekly Schedule */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                    <div className="xl:col-span-12">
                        <Card className="p-8">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                                    <Calendar size={20} />
                                </div>
                                <h3 className="text-lg font-bold text-white tracking-tight italic">Weekly Schedule</h3>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {schedule.map((slot, index) => (
                                    <div key={slot.day} className={cn(
                                        "flex flex-col items-start p-4 rounded-2xl border transition-all gap-4",
                                        slot.active ? "bg-slate-900/30 border-slate-700/50" : "bg-transparent border-slate-800/30 opacity-60 hover:opacity-100"
                                    )}>
                                        <div className="flex items-center gap-3 w-full">
                                            <button
                                                onClick={() => toggleDay(index)}
                                                className={cn(
                                                    "w-6 h-6 rounded-lg flex items-center justify-center border transition-all",
                                                    slot.active ? "bg-indigo-500 border-indigo-500 text-white" : "bg-slate-800 border-slate-700 text-transparent"
                                                )}
                                            >
                                                <Check size={12} />
                                            </button>
                                            <span className="text-[12px] font-bold text-white italic uppercase tracking-wide">
                                                {slot.day}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 w-full">
                                            <div className="flex items-center gap-2 bg-slate-950/40 px-3 py-2 rounded-2xl border border-slate-800/50">
                                                <Clock size={14} className="text-indigo-400" />
                                                <div className="w-full">
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
                                                <div className="w-full">
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

                                        <div className="grid grid-cols-2 gap-2 w-full">
                                            <Tooltip content="Optional start date for this weekly schedule. If empty, the frontend calculates the next matching weekday.">
                                                <label className="text-[8px] uppercase tracking-widest text-slate-500">
                                                    Start Date (optional)
                                                    <input
                                                        type="date"
                                                        value={slot.startDate}
                                                        onChange={(e) => updateDate(index, 'startDate', e.target.value)}
                                                        disabled={!slot.active}
                                                        className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-2 py-2 mt-1 text-[10px] text-white outline-none focus:border-indigo-500 focus:ring-0"
                                                    />
                                                </label>
                                            </Tooltip>
                                            <Tooltip content="Optional end date for this weekly schedule. If empty, the frontend uses today or the computed start date.">
                                                <label className="text-[8px] uppercase tracking-widest text-slate-500">
                                                    End Date (optional)
                                                    <input
                                                        type="date"
                                                        value={slot.endDate}
                                                        onChange={(e) => updateDate(index, 'endDate', e.target.value)}
                                                        disabled={!slot.active}
                                                        className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-2 py-2 mt-1 text-[10px] text-white outline-none focus:border-indigo-500 focus:ring-0"
                                                    />
                                                </label>
                                            </Tooltip>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Next Class Preview */}
                {nextClass && (
                    <div className="p-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                                <Clock size={18} className="text-indigo-400" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Next Session</p>
                                <p className="text-sm font-bold text-white italic mt-0.5">
                                    {nextClass.type === 'day' ? nextClass.value : nextClass.value}
                                </p>
                            </div>
                        </div>
                        <Badge variant="indigo" className="text-[9px]">{nextClass.type === 'day' ? 'UPCOMING' : 'TODAY'}</Badge>
                    </div>
                )}

                <div className="flex items-center gap-3">
                        <button 
                            onClick={() => navigate('/admin/courses')}
                            className="h-11 px-6 bg-slate-900 border border-slate-800 rounded-xl text-xs font-black text-slate-400 hover:text-white hover:bg-slate-800 transition-all uppercase tracking-tighter italic"
                        >
                            Discard Draft
                        </button>
                        <button onClick={handleSubmit} className="h-11 px-8 bg-indigo-600 rounded-xl text-xs font-black text-white hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-900/20 flex items-center gap-2 uppercase tracking-tighter italic">
                            { isSubmitting ? <Spinner /> : 'Create Course' }
                        </button>
                    </div>
            </div>
        </div>
    );
};
