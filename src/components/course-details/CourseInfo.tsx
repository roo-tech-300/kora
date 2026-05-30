import { MoreVertical } from 'lucide-react';
import { Card, cn } from '../Common';

type CourseInfoProps = {
  course: any;
  assignedTeachersCount: number;
  scheduledInstancesCount: number;
  className?: string;
};

export const CourseInfo = ({
  course,
  assignedTeachersCount,
  scheduledInstancesCount,
  className,
}: CourseInfoProps) => {
  const infoItems = [
    { label: 'Course Title', value: course.title },
    { label: 'Course Code', value: course.code },
    { label: 'Units', value: course.unit ?? '—' },
    { label: 'Venue', value: course.venue || '—' },
    { label: 'Total Sessions', value: course.schedule?.length ?? 0 },
    { label: 'Scheduled Dates', value: scheduledInstancesCount },
    { label: 'Assigned Teachers', value: assignedTeachersCount },
    { label: 'Course ID', value: course.$id },
  ];

  return (
    <Card className={cn("p-0 overflow-hidden", className)}>
      <div className="p-6 flex justify-between items-center border-b border-slate-800/50">
        <h3 className="text-lg font-bold text-white tracking-tight italic">Course Information</h3>
        <button className="w-8 h-8 flex items-center justify-center hover:text-white transition-colors bg-slate-900 border border-slate-800 rounded-lg text-slate-400 cursor-pointer">
          <MoreVertical size={14} />
        </button>
      </div>
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {infoItems.map(({ label, value }) => (
          <div key={label} className="p-4 bg-slate-900/40 rounded-xl border border-slate-800/50">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic mb-1">{label}</p>
            <p className="text-sm font-bold text-white italic truncate">{value}</p>
          </div>
        ))}
      </div>
    </Card>
  );
};
