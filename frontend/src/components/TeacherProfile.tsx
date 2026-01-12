import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, User, Edit2 } from 'lucide-react';
import { SimpleThemeToggle } from '@/components/ui/theme-toggle';
import { useAuth } from '@/contexts/AuthContext';
import { PasswordResetDialog } from '@/components/PasswordResetDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FloatingLabelInput } from '@/components/ui/floating-label-input';
import { teacherAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export const TeacherProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [showReset, setShowReset] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [fullName, setFullName] = useState(user?.name || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleConfirmLogout = () => {
    setShowLogoutDialog(false);
    logout();
    navigate('/login', { replace: true });
  };

  const handleEditClick = () => {
    setFullName(user?.name || '');
    setShowEditDialog(true);
  };

  const handleUpdateProfile = async () => {
    if (!fullName.trim()) {
      toast({
        title: 'Error',
        description: 'Full name cannot be empty',
        variant: 'destructive',
      });
      return;
    }

    setIsUpdating(true);
    try {
      await teacherAPI.updateProfile({ fullName: fullName.trim() });
      
      // Update the user in localStorage
      const updatedUser = { ...user, name: fullName.trim() };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      toast({
        title: 'Success',
        description: 'Your profile has been updated successfully.',
      });
      
      setShowEditDialog(false);
      // Reload to refresh the user context and update the UI
      window.location.reload();
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate(-1)}
                className="h-9 w-9 rounded-full hover:bg-gray-200 dark:hover:bg-muted"
              >
                <ChevronLeft className="h-5 w-5" />
                <span className="sr-only">Back</span>
              </Button>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-teal-cyan rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-primary">{user?.name}</h1>
                  <p className="text-muted-foreground">Teacher</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <SimpleThemeToggle />
              <Button variant="outline" onClick={handleLogoutClick}>Logout</Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Card className="learning-card">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Full Name</div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{user?.name}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 text-muted-foreground hover:text-foreground -mr-2"
                    onClick={handleEditClick}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>
                <Button 
                  variant="default" 
                  size="sm" 
                  className="mt-6 w-full sm:w-auto"
                  onClick={() => setShowReset(true)}
                >
                  Reset Password
                </Button>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Email</div>
                <div className="font-semibold">{user?.email}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <PasswordResetDialog
        open={showReset}
        onOpenChange={setShowReset}
        onSuccess={() => { /* wrapper handles firstLogin flag elsewhere */ }}
      />

      {/* Edit Profile Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Profile Name</DialogTitle>
            <DialogDescription>
              Update your full name. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="px-1 py-4">
            <FloatingLabelInput
              id="fullName"
              label="Full Name"
              type="text"
              value={fullName}
              onValueChange={(value) => {
                // Capitalize first letter of each word
                const capitalized = value.replace(/\b\w/g, (char) => char.toUpperCase());
                setFullName(capitalized);
              }}
              disabled={isUpdating}
              autoCapitalizeWords={true}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateProfile}
              disabled={isUpdating || !fullName.trim()}
            >
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to logout? You will need to login again to access your profile.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmLogout} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
