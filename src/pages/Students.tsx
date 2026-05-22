import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users as UsersIcon, 
  Fingerprint, 
  Search, 
  Plus, 
  MoreVertical, 
  ArrowRight,
  School,
  BookOpen,
} from 'lucide-react';
import { getStudents } from '../lib/apis/students/students';
import { Badge, Card, StatCard, Tooltip, cn } from '../components/Common';
import { motion } from 'framer-motion';

const ITEMS_PER_PAGE = 30;

export const Students = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('All');
  const [students, setStudents] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const data = await getStudents();
        setStudents(data || []);
      } catch (error) {
        console.error('Error fetching students:', error);
        setStudents([]);
      }
    };
    fetchStudents();
  }, []);

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         student.matric_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === 'All' || student.level === filterLevel;
    return matchesSearch && matchesLevel;
  });

  const enrolledCount = students.filter(s => s.$id).length; // Count students with records
  const coveragePercent = students.length > 0 ? Math.round((enrolledCount / students.length) * 100) : 0;

  // Get unique faculties and departments
  const uniqueFaculties = new Set(students.map(s => s.faculty)).size;
  const uniqueDepartments = new Set(students.map(s => s.department)).size;

  // Pagination logic
  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedStudents = filteredStudents.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterLevel]);

  return (
    <div className="space-y-10 animate-in">
      {/* Header & Primary Actions */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
           <Badge variant="indigo">Management Portal</Badge>
           <h1 className="text-3xl font-bold text-white tracking-tight mt-2 italic leading-none uppercase">Students</h1>
           <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1.5 italic">Institutional Biometric Node Management</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or Matric..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-11 bg-slate-900/50 border border-slate-800 rounded-xl pl-12 pr-4 text-white font-medium text-sm outline-none focus:border-indigo-500/50 focus:bg-slate-900 transition-all shadow-xl"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <select 
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="h-11 px-4 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 text-xs font-bold focus:border-indigo-500 outline-none transition-all cursor-pointer appearance-none"
            >
              <option value="All">All Levels</option>
              <option value="100">100 Level</option>
              <option value="200">200 Level</option>
              <option value="300">300 Level</option>
              <option value="400">400 Level</option>
              <option value="500">500 Level</option>
            </select>
            <Link to="/admin/students/new" className="h-11 px-6 bg-indigo-600 rounded-xl text-xs font-black text-white hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-900/20 flex items-center gap-2 uppercase tracking-tighter italic">
                <Plus size={16} /> Add Student
            </Link>
          </div>
        </div>
      </div>

      {/* Stats HUD */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <StatCard label="Total Students" value={students.length.toString()} trend="Active in System" icon={UsersIcon} variant="indigo" />
         <StatCard label="Biometric Coverage" value={`${coveragePercent}%`} trend="Enrollment Rate" icon={Fingerprint} variant="purple" />
         <StatCard label="Departments" value={uniqueDepartments.toString()} trend="Across Faculties" icon={BookOpen} variant="green" />
         <StatCard label="Faculties" value={uniqueFaculties.toString()} trend="Institutional Reach" icon={School} variant="orange" />
      </div>

      {/* Main Inventory Table */}
      <Card title="Student Manifest" subtitle="Full scale biometric registry" className="overflow-hidden">
        <div className="overflow-x-auto -mx-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800/50 bg-slate-900/20">
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Identity</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Department</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Biometrics</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Attendance Rate</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/30">
              {paginatedStudents.map((student, i) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 5 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: i * 0.05 }}
                  key={student.$id} 
                  className="group hover:bg-slate-900/40 transition-colors"
                >
                  <td className="px-6 py-5">
                    <Link to={`/admin/students/${student.$id}`} className="flex items-center gap-4 group/item">
                      <div className="relative">
                        <div className="w-11 h-11 rounded-xl object-cover ring-2 ring-indigo-500/5 group-hover/item:scale-105 transition-transform shadow-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-slate-950 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <Tooltip content={student.name} className="min-w-0">
                          <p className="text-sm font-bold text-white group-hover/item:text-indigo-400 transition-colors italic leading-none truncate">{student.name}</p>
                        </Tooltip>
                        <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest italic group-hover/item:text-indigo-400/50">MATRIC: {student.matric_number}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-white italic">{student.level} Level</span>
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">{student.faculty || 'N/A'}</p>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <Tooltip content={student.department || 'N/A'} className="min-w-0">
                      <p className="text-[10px] font-bold text-white italic truncate">{student.department || 'N/A'}</p>
                    </Tooltip>
                  </td>
                  <td className="px-6 py-5">
                    <Badge variant="success" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">ACTIVE</Badge>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                       <div className="flex-1 w-24 h-1 bg-slate-950 rounded-full overflow-hidden shadow-inner">
                          <div className="h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(99,102,241,0.3)] bg-indigo-500" style={{ width: `85%` }} />
                       </div>
                       <span className="text-[11px] font-black text-white italic">85%</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button className="p-2 text-slate-700 hover:text-white transition-colors">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="mt-8 flex justify-between items-center px-2">
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest italic">Showing {startIndex + 1} - {Math.min(endIndex, filteredStudents.length)} of {filteredStudents.length} students</span>
            <div className="flex items-center gap-4">
                <button 
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic disabled:opacity-30 cursor-pointer hover:text-indigo-400 transition-colors disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => handlePageClick(page)}
                      className={cn(
                        "w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black transition-all",
                        currentPage === page 
                          ? "bg-indigo-500 text-white" 
                          : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-indigo-500"
                      )}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="text-[10px] font-black text-indigo-400 uppercase tracking-widest italic disabled:opacity-30 disabled:text-slate-600 flex items-center gap-1 group cursor-pointer hover:text-indigo-300 transition-colors disabled:cursor-not-allowed"
                >
                  Next <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
      </Card>
    </div>
  );
};
