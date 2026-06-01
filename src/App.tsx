import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layouts
import { AdminLayout } from './components/AdminLayout';
import { TeacherLayout } from './components/TeacherLayout';
import { AuthGate } from './components/AuthGate';

// Pages
import { LoginPage } from './pages/auth/login';
import { SignupPage } from './pages/auth/signUp';
import { AdminDashboard } from './pages/AdminDashboard';
import { Analytics } from './pages/Analytics';
import { SessionManifest } from './pages/SessionManifest';
import { Courses } from './pages/Courses';
import { KioskMode } from './pages/KioskMode';
import { Students } from './pages/Students';
import { AddStudent } from './pages/AddStudent';
// import { Courses } from './pages/Courses';
import { CourseDetails } from './pages/CourseDetails';
import { AddCourse } from './pages/AddCourse';
import { Teachers } from './pages/Teachers';
import { StudentProfile } from './pages/StudentProfile';
import { BiometricEnrollment } from './pages/BiometricEnrollment';
import { PendingApproval } from './pages/PendingApproval';
import { AuthProvider } from './context/AuthContext';
import { OfflineProvider } from './context/OfflineContext';
import { OfflineStatus } from './components/OfflineStatus';

// --- APP ROOT ---
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <OfflineProvider>
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
          <OfflineStatus />
          <Routes>
            {/* Authentication Routes */}
            <Route path="/login" element={<AuthGate guestOnly><LoginPage /></AuthGate>} />
            <Route path="/signup" element={<AuthGate guestOnly><SignupPage /></AuthGate>} />
            <Route path="/pending" element={<AuthGate pendingOnly><PendingApproval /></AuthGate>} />

            {/* Admin Infrastructure */}
            <Route path="/admin" element={<AuthGate allowedRoles={['Admin']}><AdminLayout><AdminDashboard /></AdminLayout></AuthGate>} />
            <Route path="/admin/students" element={<AuthGate allowedRoles={['Admin']}><AdminLayout><Students /></AdminLayout></AuthGate>} />
            <Route path="/admin/students/:id" element={<AuthGate allowedRoles={['Admin']}><AdminLayout><StudentProfile /></AdminLayout></AuthGate>} />
            <Route path="/admin/students/:id/enroll" element={<AuthGate allowedRoles={['Admin']}><AdminLayout><BiometricEnrollment /></AdminLayout></AuthGate>} />
            <Route path="/admin/students/new" element={<AuthGate allowedRoles={['Admin']}><AdminLayout><AddStudent /></AdminLayout></AuthGate>} />
            <Route path="/admin/courses" element={<AuthGate allowedRoles={['Admin']}><AdminLayout><Courses /></AdminLayout></AuthGate>} />
            <Route path="/admin/courses/new" element={<AuthGate allowedRoles={['Admin']}><AdminLayout><AddCourse /></AdminLayout></AuthGate>} />
            <Route path="/admin/courses/:id" element={<AuthGate allowedRoles={['Admin']}><AdminLayout><CourseDetails /></AdminLayout></AuthGate>} />
            <Route path="/admin/teachers" element={<AuthGate allowedRoles={['Admin']}><AdminLayout><Teachers /></AdminLayout></AuthGate>} />
            <Route path="/admin/reports" element={<AuthGate allowedRoles={['Admin']}><AdminLayout><Analytics /></AdminLayout></AuthGate>} />
            <Route path="/admin/settings" element={<AuthGate allowedRoles={['Admin']}><AdminLayout><AdminDashboard /></AdminLayout></AuthGate>} />

            {/* Teacher Node Infrastructure */}
            <Route path="/teacher" element={<AuthGate allowedRoles={['Lecturer']}><TeacherLayout><Courses /></TeacherLayout></AuthGate>} />
            <Route path="/teacher/class/:id" element={<AuthGate allowedRoles={['Lecturer']}><TeacherLayout><CourseDetails/></TeacherLayout></AuthGate>} />
            <Route path="/teacher/courses" element={<AuthGate allowedRoles={['Lecturer']}><TeacherLayout><SessionManifest /></TeacherLayout></AuthGate>} />
            <Route path="/teacher/attendance" element={<AuthGate allowedRoles={['Lecturer']}><TeacherLayout><Courses /></TeacherLayout></AuthGate>} />
            <Route path="/teacher/reports" element={<AuthGate allowedRoles={['Lecturer']}><TeacherLayout><Analytics /></TeacherLayout></AuthGate>} />
            <Route path="/teacher/settings" element={<AuthGate allowedRoles={['Lecturer']}><TeacherLayout><Courses /></TeacherLayout></AuthGate>} />

            {/* Kiosk Mode Terminal */}
            <Route path="/kiosk" element={<KioskMode />} />

            {/* Global Redirects */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </OfflineProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}
