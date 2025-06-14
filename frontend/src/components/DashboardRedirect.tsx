import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const DashboardRedirect = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Route based on user type
  switch (user.type) {
    case 'student':
      return <Navigate to="/student-dashboard" replace />;
    case 'teacher':
      return <Navigate to="/teacher-dashboard" replace />;
    case 'admin':
      return <Navigate to="/admin-dashboard" replace />;
    default:
      return <Navigate to="/" replace />;
  }
};

export default DashboardRedirect; 