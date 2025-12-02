import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, User, Edit2 } from 'lucide-react';
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
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-teal-cyan rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primary">{user?.name}</h1>
                <p className="text-muted-foreground">Teacher</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <SimpleThemeToggle />
              <Button onClick={() => setShowReset(true)}>Reset Password</Button>
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
            <div className="flex justify-end mb-4">
              <Button variant="outline" size="sm" onClick={handleEditClick}>
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Full Name</div>
                <div className="font-semibold">{user?.name}</div>
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
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your full name. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                disabled={isUpdating}
              />
            </div>
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
