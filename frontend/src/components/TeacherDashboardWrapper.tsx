import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PasswordResetDialog } from './PasswordResetDialog';
import { useToast } from '@/hooks/use-toast';
import { authAPI } from '@/lib/api';

interface TeacherDashboardWrapperProps {
  children: React.ReactNode;
}

export const TeacherDashboardWrapper: React.FC<TeacherDashboardWrapperProps> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showPasswordReset, setShowPasswordReset] = useState(false);

  useEffect(() => {
    // Check if user is a teacher and it's their first login
    // Updated rule: when backend provides firstLogin === true, require reset
    if (user?.role === 'teacher' && user?.firstLogin === true) {
      setShowPasswordReset(true);
    }
  }, [user]);

  const handlePasswordResetSuccess = () => {
    toast({
      title: 'Password updated successfully',
      description: 'You can now use your new password for future logins.',
    });
    
    // Update status on API and local storage
    const finalize = async () => {
      try {
        await authAPI.completeFirstLogin();
      } catch (e) {
        // Non-blocking: log but proceed to unlock UI
        console.error('Failed to mark first login complete on server', e);
      }
      if (user) {
        // Flip to true locally so wrapper stops prompting
        const updatedUser = { ...user, firstLogin: true };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    };
    finalize();
  };

  return (
    <>
      {children}
      <PasswordResetDialog
        open={showPasswordReset}
        onOpenChange={setShowPasswordReset}
        onSuccess={handlePasswordResetSuccess}
      />
    </>
  );
};
