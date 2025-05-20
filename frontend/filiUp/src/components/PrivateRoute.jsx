import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

export const PrivateRoute = ({ component: Component, requireTeacher = false, requireAdmin = false }) => {
  const { user, isAuthenticated, loading } = useUser();

  if (loading) {
    return null; // or a loading spinner
  }

  if (!isAuthenticated) {
    return <Navigate to="/sign-in" replace />;
  }

  if (requireAdmin && user?.userRole !== 'ADMIN') {
    return <Navigate to="/home" replace />;
  }

  if (requireTeacher && user?.userRole !== 'TEACHER') {
    return <Navigate to="/home" replace />;
  }

  if (!requireTeacher && !requireAdmin && user?.userRole === 'TEACHER') {
    return <Navigate to="/teacher" replace />;
  }

  if (!requireTeacher && !requireAdmin && user?.userRole === 'ADMIN') {
    return <Navigate to="/admin" replace />;
  }

  return <Component />;
}; 