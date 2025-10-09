import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, GraduationCap, BookOpen, Settings, TrendingUp, UserPlus, Shield, Database, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AddUserDialog } from './AddUserDialog';
import { ContentManagement } from './ContentManagement';
import { adminAPI } from '@/lib/api';
import { CenteredLoading } from '@/components/ui/loading-spinner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface SystemStats {
  totalUsers: number;
  activeStudents: number;
  totalSections: number;
  systemHealth: number;
}

interface UserData {
  id: string;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
  createdAt?: string;
}

export const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showAddUser, setShowAddUser] = useState(false);
  const [showContentManagement, setShowContentManagement] = useState(false);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleConfirmLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const systemStatsDisplay = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users },
    { label: 'Active Students', value: stats?.activeStudents || 0, icon: GraduationCap },
    { label: 'Total Sections', value: stats?.totalSections || 0, icon: BookOpen },
    { label: 'System Health', value: `${stats?.systemHealth || 0}%`, icon: TrendingUp },
  ];

  const handleUserAdded = () => {
    // Refresh stats and recent users after adding a new user
    const fetchData = async () => {
      try {
        const statsResponse = await adminAPI.getStats();
        setStats(statsResponse);
        const usersResponse = await adminAPI.getUsers(0, 5);
        setRecentUsers(usersResponse.content || usersResponse);
      } catch (error) {
        console.error('Failed to refresh stats:', error);
      }
    };
    fetchData();
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsResponse = await adminAPI.getStats();
        setStats(statsResponse);
        const usersResponse = await adminAPI.getUsers(0, 5);
        setRecentUsers(usersResponse.content || usersResponse);
        setLoading(false);
      } catch (error: unknown) {
        const err = error instanceof Error ? error.message : 'Failed to load dashboard data';
        setError(err);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Show Content Management if selected
  if (showContentManagement) {
    return <ContentManagement onBack={() => setShowContentManagement(false)} />;
  }

  // Show loading state
  if (loading) {
    return <CenteredLoading message="Loading admin dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">Admin Dashboard</h1>
            <p className="text-muted-foreground">System Overview & Management, {user?.name} 🛡️</p>
          </div>
          {/* Desktop actions */}
          <div className="hidden md:flex items-center space-x-3">
            <Button variant="ghost" onClick={handleLogoutClick}>
              Logout
            </Button>
          </div>
          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="outline" size="sm" onClick={() => setMobileMenuOpen((o) => !o)}>
              ☰
            </Button>
          </div>
        </div>
        {/* Mobile menu panel */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 max-w-7xl mx-auto">
            <div className="flex flex-col gap-2">
              <Button variant="ghost" onClick={handleLogoutClick} className="w-full text-left">
                Logout
              </Button>
            </div>
          </div>
        )}
      </header>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* System Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {systemStatsDisplay.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="learning-card">
                <CardContent className="flex items-center p-4">
                  <div className="p-2 rounded-lg bg-gradient-primary mr-3">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">
                      <span>{stat.label}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* User Management */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">User Management</h2>
              <Button variant="activity" onClick={() => setShowAddUser(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </div>
            
            <Card className="learning-card">
              <CardHeader>
                <CardTitle className="text-lg">Recent Users</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentUsers.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No users found</p>
                ) : (
                  recentUsers.map((userData) => (
                    <div key={userData.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          userData.role === 'TEACHER' ? 'bg-gradient-warm' : 
                          userData.role === 'ADMIN' ? 'bg-gradient-primary' : 
                          'bg-gradient-success'
                        }`}>
                          {userData.role === 'TEACHER' ? 
                            <GraduationCap className="h-4 w-4 text-white" /> : 
                            userData.role === 'ADMIN' ? 
                            <Shield className="h-4 w-4 text-white" /> :
                            <Users className="h-4 w-4 text-white" />
                          }
                        </div>
                        <div>
                          <div className="font-medium text-sm">{userData.fullName}</div>
                          <div className="text-xs text-muted-foreground">{userData.email}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={userData.isActive ? 'default' : 'secondary'}>
                          {userData.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <div className="text-xs text-muted-foreground mt-1">
                          {userData.role.toLowerCase()}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  onClick={() => navigate('/admin/users')}
                >
                  View All Users
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* System Overview */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">System Overview</h2>
            <Card className="learning-card">
              <CardHeader>
                <CardTitle className="text-lg">Key Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {stats && (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Total Users</span>
                        <div className="text-right">
                          <div className="font-bold">{stats.totalUsers}</div>
                        </div>
                      </div>
                      <div className="border-t border-border" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Active Students</span>
                        <div className="text-right">
                          <div className="font-bold">{stats.activeStudents}</div>
                        </div>
                      </div>
                      <div className="border-t border-border" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Total Sections</span>
                        <div className="text-right">
                          <div className="font-bold">{stats.totalSections}</div>
                        </div>
                      </div>
                      <div className="border-t border-border" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">System Health</span>
                        <div className="text-right">
                          <div className="font-bold text-success">{stats.systemHealth}%</div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
            <h2 className="text-2xl font-bold">Management Tools</h2>
            {/* Management Tools */}
            <Card className="learning-card">
              <CardHeader>
                <CardTitle>Management Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
                
                  <Button 
                    variant="outline" 
                    className="h-24 flex-col space-y-2"
                    onClick={() => setShowContentManagement(true)}
                  >
                    <BookOpen className="h-6 w-6" />
                    <span className="text-sm">Content Management</span>
                  </Button>
                
                </div>
              </CardContent>
            </Card>
          </div>
          
        </div>

    

       
      </div>

      {/* Add User Dialog */}
      <AddUserDialog 
        open={showAddUser} 
        onOpenChange={(open) => {
          setShowAddUser(open);
          if (!open) {
            handleUserAdded();
          }
        }}
      />

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to logout? You will need to login again to access your dashboard.
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
