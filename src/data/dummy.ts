
export interface Student {
  id: string;
  name: string;
  level: string;
  course_id: string;
  fingerprint_enrolled: boolean;
  active: boolean;
  photo?: string;
  attendance_rate: number;
  guardian_email?: string;
  emergency_contact?: string;
  enrollment_date?: string;
}

export interface Course {
  id: string;
  name: string;
  subject: string;
  teacher_id: string;
  schedule: string;
  room: string;
  student_count: number;
  attendance_rate: number;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  assigned_courses: string[];
  photo?: string;
  subjects?: string[];
}

export interface Session {
  id: string;
  course_id: string;
  start_time: string;
  end_time?: string;
  status: 'upcoming' | 'active' | 'done';
}

export interface AttendanceRecord {
  id: string;
  session_id: string;
  student_id: string;
  timestamp: string;
  status: 'present' | 'absent' | 'late';
  method: 'fingerprint' | 'manual';
}

export const DUMMY_STUDENTS: Student[] = [
  { 
    id: '1', 
    name: 'Alice Peterson', 
    level: '100', 
    course_id: 'C1', 
    fingerprint_enrolled: true, 
    active: true, 
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop', 
    attendance_rate: 90.5,
    guardian_email: 'a.peterson.guardian@example.com',
    emergency_contact: '+234 800 123 4567',
    enrollment_date: 'August 15, 2023'
  },
  { id: '2', name: 'Bob Smith', level: '100', course_id: 'C1', fingerprint_enrolled: true, active: true, photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop', attendance_rate: 85 },
  { id: '3', name: 'Charlie Dean', level: '200', course_id: 'C2', fingerprint_enrolled: false, active: true, photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop', attendance_rate: 92 },
  { id: '4', name: 'Diana Ross', level: '300', course_id: 'C3', fingerprint_enrolled: true, active: true, photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop', attendance_rate: 76 },
  { id: '5', name: 'Edward Norton', level: '100', course_id: 'C1', fingerprint_enrolled: true, active: false, photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop', attendance_rate: 45 },
  { id: '6', name: 'Fiona Apple', level: '200', course_id: 'C2', fingerprint_enrolled: true, active: true, photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop', attendance_rate: 94 },
];

export const DUMMY_TEACHERS: Teacher[] = [
  { id: 'T1', name: 'Dr. Sarah Connor', email: 's.connor@physics.school', assigned_courses: ['C1', 'C4'], photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop', subjects: ['Physics', 'Mathematics'] },
  { id: 'T2', name: 'Prof. James Bond', email: 'j.bond@strategy.school', assigned_courses: ['C2', 'C3'], photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop', subjects: ['Strategic Intelligence', 'Tactical History'] },
];

export const DUMMY_COURSES: Course[] = [
  { id: 'C1', name: 'Robotics Lab 4', subject: 'Robotics', teacher_id: 'T1', schedule: 'Mon-Wed 08:00 AM', room: 'Lab 402', student_count: 28, attendance_rate: 87 },
  { id: 'C2', name: 'Quantum Mechanics', subject: 'Physics', teacher_id: 'T2', schedule: 'Tue-Thu 10:00 AM', room: 'B204', student_count: 22, attendance_rate: 94 },
  { id: 'C3', name: 'Modern Strategy', subject: 'History', teacher_id: 'T2', schedule: 'Fri 09:00 AM', room: 'C305', student_count: 18, attendance_rate: 82 },
  { id: 'C4', name: 'Applied Mathematics', subject: 'Math', teacher_id: 'T1', schedule: 'Mon 11:00 AM', room: 'D402', student_count: 30, attendance_rate: 91 },
  { id: 'C5', name: 'Computer Science 101', subject: 'Technology', teacher_id: 'T2', schedule: 'Wed 02:45 PM', room: 'Lab 02', student_count: 32, attendance_rate: 96 },
  { id: 'C6', name: 'Geography 10C', subject: 'Geography', teacher_id: 'T1', schedule: 'Thu 08:45 AM', room: 'RM 108', student_count: 26, attendance_rate: 85 },
];

export const DUMMY_SESSIONS: Session[] = [
  { id: 'S1', course_id: 'C1', start_time: '2026-04-07T08:00:00', status: 'done' },
  { id: 'S2', course_id: 'C2', start_time: '2026-04-07T10:00:00', status: 'active' },
  { id: 'S3', course_id: 'C4', start_time: '2026-04-07T11:00:00', status: 'upcoming' },
];

export const DUMMY_ATTENDANCE: AttendanceRecord[] = [
  { id: 'R1', session_id: 'S2', student_id: '3', timestamp: '2026-04-07T10:05:12', status: 'present', method: 'fingerprint' },
  { id: 'R2', session_id: 'S2', student_id: '6', timestamp: '2026-04-07T10:06:45', status: 'present', method: 'fingerprint' },
];

