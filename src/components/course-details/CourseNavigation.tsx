import { motion } from 'framer-motion';
import { cn } from '../Common';

export type CourseTab = 'overview' | 'students' | 'schedule' | 'attendance';

type CourseNavigationProps = {
  activeTab: CourseTab;
  setActiveTab: (tab: CourseTab) => void;
};

const TABS: { id: CourseTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'students', label: 'Students' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'attendance', label: 'Attendance' },
];

export const CourseNavigation = ({ activeTab, setActiveTab }: CourseNavigationProps) => {
  return (
    <div className="flex items-center gap-8 border-b border-slate-800/50 pb-px">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "pb-4 text-xs font-black uppercase tracking-widest italic transition-colors relative cursor-pointer",
              isActive ? "text-indigo-400" : "text-slate-500 hover:text-slate-300"
            )}
          >
            {tab.label}
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-t-full shadow-[0_-2px_8px_rgba(99,102,241,0.5)]"
              />
            )}
          </button>
        );
      })}
    </div>
  );
};
