import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/Auth/ProtectedRoute'
import AppLayout from './components/Layout/AppLayout'
import LoginPage from './pages/Login/LoginPage'
import HomePage from './pages/Dashboard/HomePage'
import DashboardPage from './pages/Dashboard/DashboardPage'
import StudentsPage from './pages/Students/StudentsPage'
import ClassesPage from './pages/Classes/ClassesPage'
import SubjectsPage from './pages/Subjects/SubjectsPage'
import TeachersPage from './pages/Teachers/TeachersPage'
import GradeEntryPage from './pages/Grades/GradeEntryPage'
import TranscriptPage from './pages/Grades/TranscriptPage'
import './App.css'

import { ConfigProvider } from 'antd';

// Placeholder components for nested routes
const Profile = () => <div><h2>User Profile</h2><p>Manage your settings here.</p></div>;

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#0A6C5B',
          borderRadius: 8,
          fontFamily: '"Inter", system-ui, Avenir, Helvetica, Arial, sans-serif',
          colorBgContainer: '#ffffff',
        },
        components: {
          Button: {
            controlHeightLG: 48,
            borderRadiusLG: 8,
            fontWeight: 600,
          },
          Input: {
            controlHeightLG: 48,
            borderRadiusLG: 8,
          }
        }
      }}
    >
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<HomePage />} />
              <Route path="dashboard" element={<DashboardPage />} />
              
              {/* Admin only routes */}
              <Route path="users" element={<ProtectedRoute allowedRoles={['admin']}><div><h2>User Management</h2></div></ProtectedRoute>} />
              <Route path="teachers" element={<ProtectedRoute allowedRoles={['admin']}><TeachersPage /></ProtectedRoute>} />
              <Route path="students" element={<ProtectedRoute allowedRoles={['admin']}><StudentsPage /></ProtectedRoute>} />
              <Route path="classes" element={<ProtectedRoute allowedRoles={['admin']}><ClassesPage /></ProtectedRoute>} />
              <Route path="subjects" element={<ProtectedRoute allowedRoles={['admin']}><SubjectsPage /></ProtectedRoute>} />

              {/* Teacher routes */}
              <Route path="grade-entry" element={<ProtectedRoute allowedRoles={['teacher', 'admin']}><GradeEntryPage /></ProtectedRoute>} />

              {/* Student routes */}
              <Route path="transcript" element={<ProtectedRoute allowedRoles={['student']}><TranscriptPage /></ProtectedRoute>} />

              {/* Shared routes */}
              <Route path="profile" element={<Profile />} />
            </Route>

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ConfigProvider>
  )
}

export default App
