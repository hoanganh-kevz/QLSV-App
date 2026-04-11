import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Spin } from 'antd'
import { useAuth } from './context/AuthContext'
import { AuthProvider } from './context/AuthProvider'
import { NotificationProvider } from './context/NotificationContext'
import { ThemeProvider } from './context/ThemeContext'
import { SettingsProvider } from './context/SettingsProvider'
import ProtectedRoute from './components/common/Authorization/ProtectedRoute'
import AppLayout from './components/Layout/AppLayout'
import './App.css'
import './compact-mode.css'

// Lazy loaded pages
const HomePage = lazy(() => import('./pages/Home/HomePage'))
const LoginPage = lazy(() => import('./pages/Login/LoginPage'))
const DashboardPage = lazy(() => import('./pages/Dashboard/DashboardPage'))
const StudentsPage = lazy(() => import('./pages/Students/StudentsPage'))
const SubjectsPage = lazy(() => import('./pages/Subjects/SubjectsPage'))
const GradeEntryPage = lazy(() => import('./pages/Grades/GradeEntryPage'))
const StudentTranscriptPage = lazy(() => import('./pages/Grades/StudentTranscriptPage'))
const ClassGradeSheetPage = lazy(() => import('./pages/Grades/ClassGradeSheetPage'))
const TeachersPage = lazy(() => import('./pages/Teachers/TeachersPage'))
const ProfilePage = lazy(() => import('./pages/Profile/ProfilePage'))
const SettingsPage = lazy(() => import('./pages/Settings/SettingsPage'))
const UsersPage = lazy(() => import('./pages/Admin/UsersPage'))
const ClassesPage = lazy(() => import('./pages/Admin/ClassesPage'))
const TermsPage = lazy(() => import('./pages/Terms/TermsPage'))
const ClassSectionsPage = lazy(() => import('./pages/ClassSections/ClassSectionsPage'))
const SetupPage = lazy(() => import('./pages/Setup/SetupPage'))
const ForgotPasswordPage = lazy(() => import('./pages/Login/ForgotPasswordPage'))
const StudentSchedulePage = lazy(() => import('./pages/Schedule/StudentSchedulePage'))
const CourseRegistrationPage = lazy(() => import('./pages/CourseRegistration/CourseRegistrationPage'))
const AttendancePage = lazy(() => import('./pages/Attendance/AttendancePage'))
const TuitionPage = lazy(() => import('./pages/Tuition/TuitionPage'))
const PetitionPage = lazy(() => import('./pages/Petition/PetitionPage'))
const AnnouncementPage = lazy(() => import('./pages/Announcement/AnnouncementPage'))
const TrainingPointPage = lazy(() => import('./pages/TrainingPoint/TrainingPointPage'))
const ExamSchedulePage = lazy(() => import('./pages/ExamSchedule/ExamSchedulePage'))
const TeacherEvaluationPage = lazy(() => import('./pages/TeacherEvaluation/TeacherEvaluationPage'))

const SuspenseFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <Spin size="large" description="Loading page..." />
  </div>
)

const SetupCheck = ({ children }) => {
  const { setupRequired, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <SuspenseFallback />;

  if (setupRequired && location.pathname !== '/setup') {
    return <Navigate to="/setup" replace />;
  }

  if (!setupRequired && location.pathname === '/setup') {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <SettingsProvider>
              <SetupCheck>
              <Suspense fallback={<SuspenseFallback />}>
                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/setup" element={<SetupPage />} />

                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <AppLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<HomePage />} />
                    <Route path="students" element={
                      <ProtectedRoute roles={['admin', 'teacher']} redirectTo="/dashboard">
                        <StudentsPage />
                      </ProtectedRoute>
                    } />
                    <Route path="subjects" element={
                      <ProtectedRoute roles={['admin', 'teacher']} redirectTo="/dashboard">
                        <SubjectsPage />
                      </ProtectedRoute>
                    } />
                    <Route path="class-sections" element={
                      <ProtectedRoute roles={['admin', 'teacher']} redirectTo="/dashboard">
                        <ClassSectionsPage />
                      </ProtectedRoute>
                    } />
                    <Route path="teachers" element={
                      <ProtectedRoute roles={['admin']} redirectTo="/dashboard">
                        <TeachersPage />
                      </ProtectedRoute>
                    } />
                    <Route path="grades" element={
                      <ProtectedRoute roles={['admin', 'teacher']} redirectTo="/dashboard">
                        <GradeEntryPage />
                      </ProtectedRoute>
                    } />
                    <Route path="grades/transcript" element={<StudentTranscriptPage />} />
                    <Route path="grades/sheet" element={
                      <ProtectedRoute roles={['admin', 'teacher']} redirectTo="/dashboard">
                        <ClassGradeSheetPage />
                      </ProtectedRoute>
                    } />
                    <Route path="schedule" element={
                      <ProtectedRoute roles={['teacher', 'student']} redirectTo="/dashboard">
                        <StudentSchedulePage />
                      </ProtectedRoute>
                    } />
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="settings" element={<SettingsPage />} />

                    {/* New Features */}
                    <Route path="course-registrations" element={
                      <ProtectedRoute roles={['admin', 'student']} redirectTo="/dashboard">
                        <CourseRegistrationPage />
                      </ProtectedRoute>
                    } />
                    <Route path="attendances" element={
                      <ProtectedRoute roles={['admin', 'teacher', 'student']} redirectTo="/dashboard">
                        <AttendancePage />
                      </ProtectedRoute>
                    } />
                    <Route path="tuitions" element={
                      <ProtectedRoute roles={['admin', 'student']} redirectTo="/dashboard">
                        <TuitionPage />
                      </ProtectedRoute>
                    } />
                    <Route path="petitions" element={
                      <ProtectedRoute roles={['admin', 'teacher', 'student']} redirectTo="/dashboard">
                        <PetitionPage />
                      </ProtectedRoute>
                    } />
                    <Route path="announcements" element={
                      <ProtectedRoute roles={['admin', 'teacher', 'student']} redirectTo="/dashboard">
                        <AnnouncementPage />
                      </ProtectedRoute>
                    } />
                    <Route path="training-points" element={
                      <ProtectedRoute roles={['admin', 'teacher', 'student']} redirectTo="/dashboard">
                        <TrainingPointPage />
                      </ProtectedRoute>
                    } />
                    <Route path="exam-schedules" element={
                      <ProtectedRoute roles={['admin', 'teacher', 'student']} redirectTo="/dashboard">
                        <ExamSchedulePage />
                      </ProtectedRoute>
                    } />
                    <Route path="teacher-evaluations" element={
                      <ProtectedRoute roles={['admin', 'teacher', 'student']} redirectTo="/dashboard">
                        <TeacherEvaluationPage />
                      </ProtectedRoute>
                    } />

                    {/* Admin Only Routes */}
                    <Route
                      path="admin/users"
                      element={
                        <ProtectedRoute roles={['admin']} redirectTo="/dashboard">
                          <UsersPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="admin/classes"
                      element={
                        <ProtectedRoute roles={['admin', 'manager']} redirectTo="/dashboard">
                          <ClassesPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="admin/terms"
                      element={
                        <ProtectedRoute roles={['admin']} redirectTo="/dashboard">
                          <TermsPage />
                        </ProtectedRoute>
                      }
                    />
                  </Route>

                  {/* Fallback route */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </SetupCheck>
          </SettingsProvider>
        </NotificationProvider>
      </AuthProvider>
      </ThemeProvider>
    </Router>
  )
}

export default App
