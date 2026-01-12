import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, User, Award, BookOpen, TrendingUp, Calendar, Loader2, Eye, EyeOff, Edit2 } from 'lucide-react';
import { SimpleThemeToggle } from '@/components/ui/theme-toggle';
import { useAuth } from '@/contexts/AuthContext';
import { studentAPI, StudentProfileResponse, authAPI, PasswordResetRequest } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FloatingLabelInput } from '@/components/ui/floating-label-input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export const StudentProfile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<StudentProfileResponse | null>(null);
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [resetLoading, setResetLoading] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [fullName, setFullName] = useState(user?.name || '');
  const [isUpdating, setIsUpdating] = useState(false);

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
      await studentAPI.updateProfile({ fullName: fullName.trim() });
      
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

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleConfirmLogout = () => {
    setShowLogoutDialog(false);
    logout();
    navigate('/login', { replace: true });
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
        toast({ title: 'Validation', description: 'Please fill in all fields.', variant: 'destructive' });
        return;
      }
      if (passwords.newPassword.length < 6) {
        toast({ title: 'Validation', description: 'New password must be at least 6 characters.', variant: 'destructive' });
        return;
      }
      if (passwords.newPassword !== passwords.confirmPassword) {
        toast({ title: 'Validation', description: 'New password and confirm password do not match.', variant: 'destructive' });
        return;
      }
      setResetLoading(true);
      const payload: PasswordResetRequest = {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
        confirmPassword: passwords.confirmPassword,
      };
      await authAPI.resetPassword(payload);
      toast({ title: 'Success', description: 'Password has been reset successfully.' });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: unknown) {
      let message = 'Failed to reset password';
      if (typeof err === 'object' && err !== null) {
        const maybe = err as { response?: { data?: { message?: string } }, message?: string };
        message = maybe.response?.data?.message ?? maybe.message ?? message;
      }
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setResetLoading(false);
    }
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const data = await studentAPI.getProfile();
        setProfileData(data);
      } catch (error) {
        console.error('Error fetching profile data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load profile data. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [toast]);

  

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg">Loading profile data...</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-xl">Failed to load profile data</p>
          <Button onClick={() => navigate(-1)}>Return to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
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
              <h1 className="text-2xl font-bold text-primary">{user?.name}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <SimpleThemeToggle />
            <Button variant="outline" onClick={handleLogoutClick}>
              Logout
            </Button>
          </div>
        </div>
      </header>

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

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="learning-card">
            <CardContent className="flex items-center p-4">
              <div className="p-2 rounded-lg bg-gradient-teal-cyan mr-3">
                <Award className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold">{profileData.stats.totalScore}</div>
                <div className="text-xs text-muted-foreground">Total Score</div>
              </div>
            </CardContent>
          </Card>

          <Card className="learning-card">
            <CardContent className="flex items-center p-4">
              <div className="p-2 rounded-lg bg-gradient-success mr-3">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold">{profileData.stats.lessonsCompleted}/{profileData.stats.totalLessons}</div>
                <div className="text-xs text-muted-foreground">Lessons</div>
              </div>
            </CardContent>
          </Card>

          <Card className="learning-card">
            <CardContent className="flex items-center p-4">
              <div className="p-2 rounded-lg bg-gradient-warm mr-3">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-xl font-bold">{profileData.stats.currentPhase}</div>
                <div className="text-xs text-muted-foreground">Phase</div>
              </div>
            </CardContent>
          </Card>

          <Card className="learning-card">
            <CardContent className="flex items-center p-4">
              <div className="p-2 rounded-lg bg-gradient-primary mr-3">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-md font-bold">{profileData.student.joinDate}</div>
                <div className="text-xs text-muted-foreground">Joined</div>
              </div>
            </CardContent>
          </Card>
        </div>

        

        {/* Profile Details */}
        <Card className="learning-card">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1.5">Full Name</div>
                <div className="font-semibold flex items-center gap-2 h-[28px] mb-8">
                  {profileData.student.name}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 text-muted-foreground hover:text-foreground -ml-1"
                    onClick={handleEditClick}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1.5">Email</div>
                  <div className="font-semibold">{profileData.student.email}</div>
                </div>
              </div>
              <div>
                <div className="flex flex-col h-full">
                  <div className="mb-8">
                    <div className="text-sm font-medium text-muted-foreground mb-1.5">Section</div>
                    <div className="font-semibold">{profileData.student.sectionName}</div>
                  </div>
                  <div className="mt-auto">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="w-full sm:w-auto"
                        >
                          Reset Password
                        </Button>
                      </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Reset Your Password</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleResetPassword} className="mt-6 space-y-4">
                        <FloatingLabelInput
                          id="currentPassword"
                          label="Current Password"
                          type={showPasswords.current ? "text" : "password"}
                          value={passwords.currentPassword}
                          onValueChange={(value) => setPasswords({ ...passwords, currentPassword: value })}
                          hasToggle
                          onToggleVisibility={() => setShowPasswords(prev => ({...prev, current: !prev.current}))}
                          showPassword={showPasswords.current}
                          required
                        />
                        <FloatingLabelInput
                          id="newPassword"
                          label="New Password"
                          type={showPasswords.new ? "text" : "password"}
                          value={passwords.newPassword}
                          onValueChange={(value) => setPasswords({ ...passwords, newPassword: value })}
                          hasToggle
                          onToggleVisibility={() => setShowPasswords(prev => ({...prev, new: !prev.new}))}
                          showPassword={showPasswords.new}
                          required
                        />
                        <FloatingLabelInput
                          id="confirmPassword"
                          label="Confirm New Password"
                          type={showPasswords.confirm ? "text" : "password"}
                          value={passwords.confirmPassword}
                          onValueChange={(value) => setPasswords({ ...passwords, confirmPassword: value })}
                          hasToggle
                          onToggleVisibility={() => setShowPasswords(prev => ({...prev, confirm: !prev.confirm}))}
                          showPassword={showPasswords.confirm}
                          required
                        />
                        <DialogFooter>
                          <Button type="submit" disabled={resetLoading} className="btn-bounce">
                            {resetLoading ? (
                              <span className="inline-flex items-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</span>
                            ) : (
                              'Update Password'
                            )}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
            <AlertDialogAction 
              onClick={handleConfirmLogout} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
