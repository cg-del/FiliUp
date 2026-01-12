import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { authAPI } from '@/lib/api';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { FloatingLabelInput } from '@/components/ui/floating-label-input';

interface PasswordResetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  defaultPassword?: string;
}

export const PasswordResetDialog = ({
  open,
  onOpenChange,
  onSuccess,
  defaultPassword = ''
}: PasswordResetDialogProps) => {
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState(defaultPassword);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'New passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: 'Error',
        description: 'New password must be at least 6 characters long',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);
      await authAPI.resetPassword({
        currentPassword,
        newPassword,
        confirmPassword
      });

      toast({
        title: 'Success!',
        description: 'Your password has been updated successfully.',
      });

      // Reset form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // Close dialog and notify parent of success
      onSuccess();
      onOpenChange(false);
    } catch (err: unknown) {
      console.error('Password reset failed', err);
      const message = err instanceof Error ? err.message : 'Unexpected error';
      toast({
        title: 'Error resetting password',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reset Your Password</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <FloatingLabelInput
            id="currentPassword"
            label="Current Password"
            type={showPasswords.current ? "text" : "password"}
            value={currentPassword}
            onValueChange={setCurrentPassword}
            hasToggle
            onToggleVisibility={() => setShowPasswords(prev => ({...prev, current: !prev.current}))}
            showPassword={showPasswords.current}
            required
          />
          
          <FloatingLabelInput
            id="newPassword"
            label="New Password"
            type={showPasswords.new ? "text" : "password"}
            value={newPassword}
            onValueChange={setNewPassword}
            hasToggle
            onToggleVisibility={() => setShowPasswords(prev => ({...prev, new: !prev.new}))}
            showPassword={showPasswords.new}
            required
          />
          
          <FloatingLabelInput
            id="confirmPassword"
            label="Confirm New Password"
            type={showPasswords.confirm ? "text" : "password"}
            value={confirmPassword}
            onValueChange={setConfirmPassword}
            hasToggle
            onToggleVisibility={() => setShowPasswords(prev => ({...prev, confirm: !prev.confirm}))}
            showPassword={showPasswords.confirm}
            required
          />
          
          <DialogFooter>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <div className="flex items-center space-x-2">
                  <LoadingSpinner size="sm" className="w-4 h-4" />
                  <span>Updating...</span>
                </div>
              ) : (
                'Update Password'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
