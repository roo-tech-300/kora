import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Fingerprint, 
  Save, 
  ShieldCheck, 
  Info,
  User,
  Mail,
  Phone
} from 'lucide-react';
import { Card, Input, Select } from '../components/Common';

export const AddStudent = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 animate-in pb-20 mt-4">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link to="/admin/students" className="flex items-center gap-2 text-slate-500 hover:text-white font-bold uppercase tracking-widest text-[10px] transition-all group italic">
           <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Directory
        </Link>
      </div>

      <header className="max-w-4xl">
         <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight italic leading-none uppercase">Add <br/><span className="text-indigo-500">New Student</span></h1>
         <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-4 max-w-2xl leading-relaxed italic">
           Initialize a new student profile within the institutional database. Biometric enrollment is recommended for automated attendance tracking.
         </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main Form Area */}
        <div className="lg:col-span-2 space-y-8">
          <Card 
            title="Personal Information" 
            subtitle="Core identities & academic placement"
            className="shadow-2xl"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
              <div className="md:col-span-2">
                <Input label="Full Name" placeholder="e.g. Jonathan R. Doe" icon={User} />
                <p className="text-[9px] font-bold text-slate-600 mt-2 italic">Legal name as it appears on birth certificate or ID.</p>
              </div>

              <div className="space-y-4">
                 <Input label="Matric Number" placeholder="e.g. KORA/24/0001" icon={Info} />
                 <p className="text-[9px] font-bold text-slate-600 italic">Institutional identification code</p>
              </div>

              <Select label="Level">
                <option value="">Select Level</option>
                <option value="100">100 Level</option>
                <option value="200">200 Level</option>
                <option value="300">300 Level</option>
                <option value="400">400 Level</option>
                <option value="500">500 Level</option>
              </Select>

            </div>
          </Card>

          <Card 
            title="Guardian Contacts" 
            subtitle="Emergency & verification access"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
              <Input label="Guardian Email" placeholder="guardian@email.com" icon={Mail} />
              <Input label="Phone Number" placeholder="+234 800 000 0000" icon={Phone} />
              <div className="md:col-span-2">
                 <p className="text-[9px] font-bold text-rose-500/80 italic flex items-center gap-1.5">
                    <Info size={10} /> Please enter a valid institutional or personal email.
                 </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-8">
           {/* Actions Card */}
           <Card>
              <div className="space-y-4">
                <button onClick={() => navigate('/admin/students/1/enroll')} className="w-full py-4 px-6 bg-indigo-600 rounded-2xl flex items-center justify-center gap-3 text-white font-black uppercase tracking-tighter hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-900/20 active:scale-95 italic">
                   <Fingerprint size={20} /> Save & Enroll Fingerprint
                </button>
                <button onClick={() => navigate('/admin/students')} className="w-full py-4 px-6 bg-slate-900/50 border border-slate-800 rounded-2xl flex items-center justify-center gap-3 text-slate-400 font-black uppercase tracking-tighter hover:bg-slate-800 transition-all active:scale-95 italic">
                   <Save size={20} /> Save Only
                </button>
              </div>

              <div className="pt-6 mt-2 flex gap-4 text-slate-600 border-t border-slate-800/50">
                 <ShieldCheck size={24} className="shrink-0 text-slate-700" />
                 <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic leading-none">Security Standards</p>
                    <p className="text-[9px] font-medium leading-relaxed mt-1.5 italic">Data is encrypted via AES-256 and stored according to institutional privacy protocols.</p>
                 </div>
              </div>
           </Card>

        </div>
      </div>
    </div>
  );
};
