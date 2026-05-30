import { Card, cn } from '../Common';

type UpcomingClassesProps = {
  upcomingClasses: any[];
  daysOfWeek: string[];
  className?: string;
};

export const UpcomingClasses = ({ upcomingClasses, daysOfWeek, className }: UpcomingClassesProps) => {
  return (
    <Card className={cn("p-6 flex flex-col group relative overflow-hidden", className)}>
      <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-colors" />
      <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic mb-4">Upcoming Classes</h3>
      {upcomingClasses.length > 0 ? (
        <div className="space-y-2">
          {upcomingClasses.map((slot: any, i: number) => (
            <div key={`${slot.dayIndex}-${slot.start}-${i}`} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-800/50">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest italic w-8">
                  {daysOfWeek[slot.dayIndex]}
                </span>
                <span className="text-[11px] font-bold text-white italic">{slot.start} – {slot.end}</span>
              </div>
              <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                {slot.dayIndex === new Date().getDay() ? 'Today' : 'Upcoming'}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[10px] font-bold text-slate-600 italic mt-2">No lectures for the rest of the week</p>
      )}
    </Card>
  );
};
