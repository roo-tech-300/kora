import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layouts
import { AdminLayout } from './components/AdminLayout';
import { TeacherLayout } from './components/TeacherLayout';

// Pages
import { LoginPage, SignupPage } from './pages/Auth';
import { AdminDashboard } from './pages/AdminDashboard';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { Analytics } from './pages/Analytics';
import { ClassManifest } from './pages/ClassManifest';
import { KioskMode } from './pages/KioskMode';
import { Students } from './pages/Students';
import { AddStudent } from './pages/AddStudent';
import { Classes } from './pages/Classes';
import { ClassDetails } from './pages/ClassDetails';
import { Teachers } from './pages/Teachers';
import { StudentProfile } from './pages/StudentProfile';
import { BiometricEnrollment } from './pages/BiometricEnrollment';

// --- APP ROOT ---
export default function App() {
  return (
    <BrowserRouter>
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: '#020617',
            color: '#fff',
            border: '1px solid #1e293b',
            padding: '16px 24px',
            borderRadius: '1.25rem',
            fontSize: '14px',
            fontWeight: 'bold',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          },
        }}
      />
      
      <Routes>
        {/* Authentication Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        
        {/* Admin Infrastructure */}
        <Route path="/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
        <Route path="/admin/students" element={<AdminLayout><Students /></AdminLayout>} />
        <Route path="/admin/students/:id" element={<AdminLayout><StudentProfile /></AdminLayout>} />
        <Route path="/admin/students/:id/enroll" element={<AdminLayout><BiometricEnrollment /></AdminLayout>} />
        <Route path="/admin/students/new" element={<AdminLayout><AddStudent /></AdminLayout>} />
        <Route path="/admin/classes" element={<AdminLayout><Classes /></AdminLayout>} />
        <Route path="/admin/classes/:id" element={<AdminLayout><ClassDetails /></AdminLayout>} />
        <Route path="/admin/teachers" element={<AdminLayout><Teachers /></AdminLayout>} />
        <Route path="/admin/reports" element={<AdminLayout><Analytics /></AdminLayout>} />
        <Route path="/admin/settings" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
        
        {/* Teacher Node Infrastructure */}
        <Route path="/teacher" element={<TeacherLayout><TeacherDashboard /></TeacherLayout>} />
        <Route path="/teacher/classes" element={<TeacherLayout><ClassManifest /></TeacherLayout>} />
        <Route path="/teacher/attendance" element={<TeacherLayout><TeacherDashboard /></TeacherLayout>} />
        <Route path="/teacher/reports" element={<TeacherLayout><Analytics /></TeacherLayout>} />
        <Route path="/teacher/settings" element={<TeacherLayout><TeacherDashboard /></TeacherLayout>} />
        
        {/* Kiosk Mode Terminal */}
        <Route path="/kiosk" element={<KioskMode />} />
        
        {/* Global Redirects */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
