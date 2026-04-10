import { useState } from 'react';
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
import { cn, Badge, Card } from '../components/Common';
import { DUMMY_TEACHERS } from '../data/dummy';

export const AddCourse = () => {
    const navigate = useNavigate();
    const [selectedTeachers, setSelectedTeachers] = useState<any[]>([DUMMY_TEACHERS[0]]);
    const [schedule, setSchedule] = useState([
        { day: 'Monday', active: true, start: '08:00', end: '10:00' },
        { day: 'Tuesday', active: false, start: '08:00', end: '10:00' },
        { day: 'Wednesday', active: true, start: '08:00', end: '10:00' },
        { day: 'Thursday', active: false, start: '08:00', end: '10:00' },
        { day: 'Friday', active: false, start: '08:00', end: '10:00' },
        { day: 'Saturday', active: false, start: '08:00', end: '10:00' },
        { day: 'Sunday', active: false, start: '08:00', end: '10:00' },
    ]);

    const toggleDay = (index: number) => {
        const newSchedule = [...schedule];
        newSchedule[index].active = !newSchedule[index].active;
        setSchedule(newSchedule);
    };

    const toggleTeacher = (teacher: any) => {
        if (selectedTeachers.find(t => t.id === teacher.id)) {
            if (selectedTeachers.length > 1) {
                setSelectedTeachers(selectedTeachers.filter(t => t.id !== teacher.id));
            }
        } else {
            setSelectedTeachers([...selectedTeachers, teacher]);
        }
    };

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
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2 italic">Institutional subject & class node configuration</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => navigate('/admin/courses')}
                            className="h-11 px-6 bg-slate-900 border border-slate-800 rounded-xl text-xs font-black text-slate-400 hover:text-white hover:bg-slate-800 transition-all uppercase tracking-tighter italic"
                        >
                            Discard Draft
                        </button>
                        <button className="h-11 px-8 bg-indigo-600 rounded-xl text-xs font-black text-white hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-900/20 flex items-center gap-2 uppercase tracking-tighter italic">
                            Create Course
                        </button>
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
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-1">Course Identity Name</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. Robotics Lab 4"
                                        className="w-full h-12 bg-slate-950/50 border border-slate-800 rounded-xl px-4 text-white font-medium text-sm outline-none focus:border-indigo-500 focus:bg-slate-950 transition-all italic"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-1">Subject Category</label>
                                    <select className="w-full h-12 bg-slate-950/50 border border-slate-800 rounded-xl px-4 text-white font-medium text-sm outline-none focus:border-indigo-500 focus:bg-slate-950 transition-all italic appearance-none">
                                        <option>Select Subject...</option>
                                        <option>Robotics</option>
                                        <option>Physics</option>
                                        <option>Mathematics</option>
                                        <option>History</option>
                                    </select>
                                </div>

                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-1">Institutional Room Number</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                                        <input 
                                            type="text" 
                                            placeholder="e.g. LAB-402 or B-204"
                                            className="w-full h-12 bg-slate-950/50 border border-slate-800 rounded-xl pl-12 pr-4 text-white font-medium text-sm outline-none focus:border-indigo-500 focus:bg-slate-950 transition-all italic"
                                        />
                                    </div>
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
                                <h3 className="text-lg font-bold text-white tracking-tight italic">Instructor Assignment</h3>
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-1">Select Faculty Nodes</label>
                                    <div className="flex flex-wrap gap-3">
                                        {DUMMY_TEACHERS.map((teacher) => {
                                            const isSelected = selectedTeachers.find(t => t.id === teacher.id);
                                            return (
                                                <button 
                                                    key={teacher.id}
                                                    onClick={() => toggleTeacher(teacher)}
                                                    className={cn(
                                                        "w-14 h-14 rounded-2xl overflow-hidden border-2 transition-all p-0.5 relative",
                                                        isSelected ? "border-indigo-500 scale-110 shadow-lg shadow-indigo-500/20" : "border-transparent opacity-60 hover:opacity-100"
                                                    )}
                                                >
                                                    <img src={teacher.photo} alt={teacher.name} className="w-full h-full object-cover rounded-xl" />
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
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-1">Assigned Instructors ({selectedTeachers.length})</label>
                                    <div className="space-y-4">
                                        <AnimatePresence>
                                            {selectedTeachers.map((teacher) => (
                                                <motion.div
                                                    key={teacher.id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    className="p-4 bg-slate-900/50 border border-slate-800 rounded-4xl relative overflow-hidden group"
                                                >
                                                    <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-500/5 blur-2xl rounded-full"></div>
                                                    
                                                    <div className="flex items-center gap-4 relative z-10">
                                                        <div className="w-14 h-14 rounded-xl overflow-hidden border border-slate-800 shadow-xl shrink-0">
                                                            <img src={teacher.photo} alt={teacher.name} className="w-full h-full object-cover" />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <h4 className="text-sm font-bold text-white italic truncate">{teacher.name}</h4>
                                                                    <p className="text-[10px] font-medium text-slate-500 mt-0.5 truncate">{teacher.email}</p>
                                                                </div>
                                                                <button 
                                                                    onClick={() => toggleTeacher(teacher)}
                                                                    className="p-1.5 text-slate-600 hover:text-rose-500 transition-colors"
                                                                >
                                                                    <X size={14} />
                                                                </button>
                                                            </div>
                                                            <div className="mt-2 flex items-center gap-2">
                                                                <Badge variant="indigo" className="text-[7px] py-0.5 px-1.5">{teacher.subjects?.[0] || 'Faculty'}</Badge>
                                                                <div className="w-1 h-1 rounded-full bg-slate-700"></div>
                                                                <span className="text-[8px] font-bold text-slate-600 uppercase italic">{teacher.assigned_courses.length} Active Courses</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                </div>
                                
                                <div className="mt-6 flex items-center gap-2 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest italic">Verification Level: Institutional Standard</span>
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
                                        "flex items-start justify-between p-4 rounded-2xl border transition-all gap-4",
                                        slot.active ? "bg-slate-900/30 border-slate-700/50" : "bg-transparent border-slate-800/30 opacity-40 hover:opacity-100"
                                    )}>
                                        <div className="flex items-center gap-3 min-w-[100px] pt-1 shrink-0">
                                            <button 
                                                onClick={() => toggleDay(index)}
                                                className={cn(
                                                    "w-5 h-5 rounded-md flex items-center justify-center transition-all shrink-0",
                                                    slot.active ? "bg-emerald-500 text-white" : "bg-slate-800 text-transparent"
                                                )}
                                            >
                                                <Check size={12} />
                                            </button>
                                            <span className="text-[11px] font-bold text-white italic uppercase tracking-wider">{slot.day}</span>
                                        </div>

                                        <div className="flex flex-col items-end gap-2.5 flex-1 min-w-0">
                                            <div className="flex items-center gap-2 justify-end w-full">
                                                <div className="flex items-center gap-1.5 bg-slate-950/30 px-2 py-1 rounded-xl border border-slate-800/30 shadow-inner">
                                                    <Clock size={12} className="text-indigo-400 opacity-80" />
                                                    <input 
                                                        type="time" 
                                                        value={slot.start} 
                                                        disabled={!slot.active}
                                                        className="bg-transparent border-none p-0 text-[11px] font-bold text-white outline-none disabled:opacity-50 w-[70px] selection:bg-indigo-500/30 focus:ring-0 leading-none [&::-webkit-calendar-picker-indicator]:hidden"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-1.5 bg-slate-950/30 px-2 py-1 rounded-xl border border-slate-800/30 shadow-inner">
                                                    <Clock size={12} className="text-rose-400 opacity-80" />
                                                    <input 
                                                        type="time" 
                                                        value={slot.end} 
                                                        disabled={!slot.active}
                                                        className="bg-transparent border-none p-0 text-[11px] font-bold text-white outline-none disabled:opacity-50 w-[70px] selection:bg-indigo-500/30 focus:ring-0 leading-none [&::-webkit-calendar-picker-indicator]:hidden"
                                                    />
                                                </div>
                                            </div>
                                            <Badge variant={slot.active ? "success" : "slate"} className="min-w-[56px] flex justify-center py-0.5 mt-0.5 text-[7px] tracking-widest shadow-lg">
                                                {slot.active ? 'ACTIVE' : 'OFF'}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};
