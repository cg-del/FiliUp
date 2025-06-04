import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import { ErrorBoundary } from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Index from './pages/Index';
import Login from './pages/Login';
import Signup from './pages/Signup';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import Stories from './pages/Stories';
import Students from './pages/Students';
import Assessments from './pages/Assessments';
import ClassRecord from './pages/ClassRecord';
import Reports from './pages/Reports';
import Leaderboards from './pages/Leaderboards';
import Profile from './pages/Profile';
import StoryModule from './pages/StoryModule';
import QuizModule from './pages/QuizModule';
import NotFound from './pages/NotFound';

import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              
              {/* Teacher Routes */}
              <Route 
                path="/teacher-dashboard" 
                element={
                  <ProtectedRoute allowedUserTypes={['teacher']}>
                    <TeacherDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/stories" 
                element={
                  <ProtectedRoute allowedUserTypes={['teacher']}>
                    <Stories />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/students" 
                element={
                  <ProtectedRoute allowedUserTypes={['teacher']}>
                    <Students />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/assessments" 
                element={
                  <ProtectedRoute allowedUserTypes={['teacher']}>
                    <Assessments />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/class-record" 
                element={
                  <ProtectedRoute allowedUserTypes={['teacher']}>
                    <ClassRecord />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/reports" 
                element={
                  <ProtectedRoute allowedUserTypes={['teacher']}>
                    <Reports />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/leaderboards" 
                element={
                  <ProtectedRoute allowedUserTypes={['teacher']}>
                    <Leaderboards />
                  </ProtectedRoute>
                } 
              />

              {/* Student Routes */}
              <Route 
                path="/student-dashboard" 
                element={
                  <ProtectedRoute allowedUserTypes={['student']}>
                    <StudentDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/story/:id" 
                element={
                  <ProtectedRoute allowedUserTypes={['student']}>
                    <StoryModule />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/quiz/:id" 
                element={
                  <ProtectedRoute allowedUserTypes={['student']}>
                    <QuizModule />
                  </ProtectedRoute>
                } 
              />

              {/* Shared Routes */}
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute allowedUserTypes={['teacher', 'student']}>
                    <Profile />
                  </ProtectedRoute>
                } 
              />

              {/* Redirect /dashboard based on user type */}
              <Route 
                path="/dashboard" 
                element={<Navigate to="/teacher-dashboard" replace />} 
              />

              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Toaster />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
