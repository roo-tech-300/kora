import { 
  Plus, 
  MapPin, 
  Clock, 
  User,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DUMMY_COURSES, DUMMY_TEACHERS } from '../data/dummy';
import { Badge, Card } from '../components/Common';

export const Courses = () => {
  return (
    <div className="space-y-8 animate-in pb-20">
      {/* Header & Primary Actions */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
           <Badge variant="indigo" className='mb-2'>Academic Administration</Badge>
           <h1 className="text-3xl font-bold text-white tracking-tight italic leading-none uppercase">Courses</h1>
           <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2 italic">Academic Year 2023-24 &middot; Active Courses: 42</p>
        </div>
        
        <Link to="/admin/courses/new" className="h-11 px-6 bg-indigo-600 rounded-xl text-xs font-black text-white hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-900/20 flex items-center gap-2 uppercase tracking-tighter italic">
            <Plus size={16} /> Create Course
        </Link>
      </div>

      {/* Grid Iteration */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {DUMMY_COURSES.map((course, i) => {
          const teacher = DUMMY_TEACHERS.find(t => t.id === course.teacher_id);
          
          return (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={course.id}
            >
              <Link to={`/admin/courses/${course.id}`} className="block h-full">
                <Card className="p-6 group hover:border-indigo-500/30 transition-all cursor-pointer relative overflow-hidden flex flex-col h-full">
                  {/* Top Row: Subject & Attendance */}
                  <div className="flex justify-between items-start mb-6"> 
                    <Badge variant="indigo" className="uppercase text-[9px] font-black italic tracking-widest px-3 py-1">
                      {course.subject}
                    </Badge>
                    <div className="text-right">
                      <span className="text-2xl font-black text-white tracking-tighter italic leading-none">{course.attendance_rate}%</span>
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest italic mt-0.5">Attendance</p>
                    </div>
                  </div>

                  {/* Main Identity */}
                  <div className="mb-6 flex-1">
                    <h3 className="text-xl font-bold text-white italic tracking-tight mb-2 group-hover:text-indigo-400 transition-colors">{course.name}</h3>
                    <p className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5 italic">
                      <User size={12} className="text-slate-500" /> {teacher?.name || 'Unassigned'}
                    </p>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-indigo-500/70" />
                      <span className="text-[11px] font-bold text-slate-300 italic">{course.room}</span>
                    </div>
                    <div className="flex items-center gap-2 text-right justify-end">
                      <Clock size={14} className="text-indigo-500/70" />
                      <span className="text-[11px] font-bold text-slate-300 italic">{course.schedule}</span>
                    </div>
                  </div>

                  {/* Bottom Row: Avatars & Count */}
                  <div className="flex justify-between items-center pt-4 border-t border-slate-800/50">
                    <div className="flex -space-x-2">
                      <div className="w-7 h-7 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-[8px] font-black text-indigo-300 z-30">JD</div>
                      <div className="w-7 h-7 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-[8px] font-black text-emerald-300 z-20">AK</div>
                      <div className="w-7 h-7 rounded-full bg-indigo-500/10 border-2 border-slate-900 flex items-center justify-center text-[8px] font-black text-indigo-400 z-10 italic">
                        +{(course.student_count - 2) || 0}
                      </div>
                    </div>
                    
                    <Badge variant="indigo" className="bg-slate-900 text-indigo-300 border-0 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 italic">
                      {course.student_count} Students
                    </Badge>
                  </div>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Paginator */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 pt-8 border-t border-slate-800/50">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">
          Showing <span className="text-white">6</span> of <span className="text-white">42</span> total courses
        </p>
        
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 flex items-center justify-center bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <ChevronLeft size={14} />
          </button>
          
          <button className="w-8 h-8 flex items-center justify-center bg-indigo-600 border border-indigo-500 text-white rounded-lg font-black text-[10px] shadow-lg shadow-indigo-900/20 italic">
            1
          </button>
          <button className="w-8 h-8 flex items-center justify-center bg-slate-900 border border-slate-800 rounded-lg text-slate-400 font-bold text-[10px] hover:text-white hover:bg-slate-800 transition-colors italic">
            2
          </button>
          <button className="w-8 h-8 flex items-center justify-center bg-slate-900 border border-slate-800 rounded-lg text-slate-400 font-bold text-[10px] hover:text-white hover:bg-slate-800 transition-colors italic">
            3
          </button>
          
          <button className="w-8 h-8 flex items-center justify-center bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
