import {
  MoreVertical,
  Mail,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Badge, Card, Spinner, Tooltip } from '../components/Common';
import { getInstitutionUsers } from '../lib/apis/auth/getInstitutionUsers';
import { getCourses } from '../lib/apis/courses/courses';

type InstitutionUserRow = {
  $id: string;
  name?: string;
  email?: string;
  title?: string;
  role?: string;
  status?: string;
};

type LecturerRow = {
  documentId: string;
  name: string;
  email: string;
  title: string;
  status: string;
  coursesAssigned: number;
};

const buildLecturerRows = async (): Promise<LecturerRow[]> => {
  const [users, courseResponse] = await Promise.all([
    getInstitutionUsers(),
    getCourses(),
  ]);

  const courseCountByUserId = new Map<string, number>();

  courseResponse.forEach((course: any) => {
    course.teachers?.forEach((teacherId: string) => {
      courseCountByUserId.set(teacherId, (courseCountByUserId.get(teacherId) ?? 0) + 1);
    });
  });

  return users.map((user: InstitutionUserRow) => ({
    documentId: user.$id,
    name: user.name || 'Unnamed User',
    email: user.email || 'No email',
    title: user.title || user.role || 'Institution User',
    status: user.status || 'UNKNOWN',
    coursesAssigned: courseCountByUserId.get(user.$id) ?? 0,
  }));
};

export const Teachers = () => {
  const [lecturers, setLecturers] = useState<LecturerRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;

    const loadLecturers = async () => {
      setIsLoading(true);
      setError('');

      try {
        const rows = await buildLecturerRows();

        if (ignore) return;
        setLecturers(rows);
      } catch (loadError) {
        if (ignore) return;
        console.error('Failed to load lecturers:', loadError);
        setError('Unable to load lecturers right now.');
      } finally {
        if (ignore) return;
        setIsLoading(false);
      }
    };

    void loadLecturers();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="space-y-10 animate-in">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <Badge variant="indigo">Staff Infrastructure</Badge>
          <h1 className="text-3xl font-bold text-white tracking-tight mt-2 italic leading-none uppercase">Lecturers</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1.5 italic">
            Synced from user table · Active records: {lecturers.length}
          </p>
        </div>
      </div>

      <Card title="Department Overview" className="overflow-hidden">
        <div className="overflow-x-auto -mx-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800/50 bg-slate-900/20">
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Identity</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Courses Assigned</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Status</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/30">
              {isLoading && (
                <tr>
                  <td colSpan={5} className="px-6 py-12">
                    <div className="flex items-center justify-center gap-3 text-sm font-bold text-slate-400 italic">
                      <Spinner size={18} />
                      Loading lecturer records...
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading && error && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm font-bold text-rose-400 italic">
                    {error}
                  </td>
                </tr>
              )}

              {!isLoading && !error && lecturers.map((lecturer, i) => (
                <motion.tr
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={lecturer.documentId}
                  className="group hover:bg-slate-900/40 transition-colors"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-11 h-11 rounded-xl object-cover ring-2 ring-indigo-500/5 group-hover:scale-105 transition-transform shadow-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-black text-indigo-300 italic">
                          {(lecturer.name || lecturer.email || 'U').slice(0, 2).toUpperCase()}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-slate-950 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.55)] bg-emerald-500"></div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <Tooltip content={lecturer.name || lecturer.email} className="min-w-0">
                          <p className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors italic leading-none truncate">
                            {`${lecturer.title} ${lecturer.name}`}
                          </p>
                        </Tooltip>
                        <p className="text-[10px] font-bold text-slate-500 mt-1.5 uppercase tracking-widest italic flex items-center gap-1.5 line-clamp-1">
                          <Mail size={10} className="text-indigo-500" /> {lecturer.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex items-center justify-center gap-3 text-[11px] font-black text-white italic tracking-tighter uppercase whitespace-nowrap">
                      {lecturer.coursesAssigned}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <Badge variant={lecturer.status.toLowerCase() === 'accepted' ? 'success' : 'warning'}>
                      {lecturer.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3 justify-end">
                      <button className="p-2 text-slate-600 hover:text-indigo-400 transition-colors bg-slate-950/40 rounded-lg hover:border-indigo-500/30 border border-transparent">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}

              {!isLoading && !error && lecturers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm font-bold text-slate-500 italic">
                    No users found in the lecturer source table yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
