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
import StudentProfileEdit from './pages/StudentProfileEdit';
import StoryModule from './pages/StoryModule';
import QuizModule from './pages/QuizModule';
import NotFound from './pages/NotFound';
import DashboardRedirect from './components/DashboardRedirect';
import AuthTest from './pages/AuthTest';
import ChangePassword from './pages/ChangePassword';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminStories from './pages/AdminStories';
import AdminCommonStories from './pages/AdminCommonStories';
import CommonStories from './pages/CommonStories';
import AdminSystemStatus from './pages/AdminSystemStatus';
import AdminSettings from './pages/AdminSettings';
import AdminReports from './pages/AdminReports';
import AdminUserGrowth from './pages/AdminUserGrowth';
import AdminActivity from './pages/AdminActivity';

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
                  <ProtectedRoute allowedUserTypes={['teacher', 'student']}>
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
              <Route 
                path="/profile/edit" 
                element={
                  <ProtectedRoute allowedUserTypes={['student']}>
                    <StudentProfileEdit />
                  </ProtectedRoute>
                } 
              />

              {/* Admin Routes */}
              <Route 
                path="/admin-dashboard" 
                element={
                  <ProtectedRoute allowedUserTypes={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/users" 
                element={
                  <ProtectedRoute allowedUserTypes={['admin']}>
                    <AdminUsers />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/stories" 
                element={
                  <ProtectedRoute allowedUserTypes={['admin']}>
                    <AdminStories />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/common-stories" 
                element={
                  <ProtectedRoute allowedUserTypes={['admin']}>
                    <AdminCommonStories />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/system/status" 
                element={
                  <ProtectedRoute allowedUserTypes={['admin']}>
                    <AdminSystemStatus />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/settings" 
                element={
                  <ProtectedRoute allowedUserTypes={['admin']}>
                    <AdminSettings />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/reports" 
                element={
                  <ProtectedRoute allowedUserTypes={['admin']}>
                    <AdminReports />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/analytics/user-growth" 
                element={
                  <ProtectedRoute allowedUserTypes={['admin']}>
                    <AdminUserGrowth />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/analytics/activity" 
                element={
                  <ProtectedRoute allowedUserTypes={['admin']}>
                    <AdminActivity />
                  </ProtectedRoute>
                } 
              />

              {/* Shared Routes */}
              <Route 
                path="/common-stories" 
                element={
                  <ProtectedRoute allowedUserTypes={['teacher', 'student', 'admin']}>
                    <CommonStories />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute allowedUserTypes={['teacher', 'student', 'admin']}>
                    <Profile />
                  </ProtectedRoute>
                } 
              />

              {/* Redirect /dashboard based on user type */}
              <Route 
                path="/dashboard" 
                element={<DashboardRedirect />} 
              />

              {/* AuthTest Route */}
              <Route 
                path="/auth-test" 
                element={
                  <ProtectedRoute allowedUserTypes={['teacher', 'student', 'admin']}>
                    <AuthTest />
                  </ProtectedRoute>
                } 
              />

              {/* Change Password Route (not protected) */}
              <Route path="/change-password" element={<ChangePassword />} />

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
