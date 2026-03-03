import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/Auth/ProtectedRoute'
import AppLayout from './components/Layout/AppLayout'
import LoginPage from './pages/Login/LoginPage'
import './App.css'

// Placeholder components for nested routes
const Home = () => <div><h2>Home Dashboard</h2><p>Welcome to the main application area.</p></div>;
const Dashboard = () => <div><h2>Detailed Dashboard</h2><p>Here are your stats.</p></div>;
const Profile = () => <div><h2>User Profile</h2><p>Manage your settings here.</p></div>;

function App() {
  return (
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
            <Route index element={<Home />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<div><h2>Settings</h2></div>} />
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
