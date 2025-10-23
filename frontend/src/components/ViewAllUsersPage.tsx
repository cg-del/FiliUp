import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  GraduationCap, 
  Shield, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Filter,
  Edit2,
  Trash2,
  Loader2,
  UserCheck,
  Check,
  X
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { SimpleThemeToggle } from '@/components/ui/theme-toggle';
import { useAuth } from '@/contexts/AuthContext';
import { adminAPI } from '@/lib/api';
import { CenteredLoading } from '@/components/ui/loading-spinner';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AddUserDialog } from './AddUserDialog';

type UserRole = 'TEACHER' | 'ADMIN' | 'STUDENT';

interface UserData {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  password?: string;
  sectionId?: string;
  isActive: boolean;
  createdAt?: string;
  firstLogin?: boolean;
}

export const ViewAllUsersPage = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const pageSize = 10;

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      // Include search term in the API call if it's not empty
      const searchQuery = searchTerm.trim() ? searchTerm : undefined;
      const response = await adminAPI.getUsers(page, pageSize, roleFilter || undefined, searchQuery);
      setUsers(response.content || []);
      setTotalPages(response.totalPages || 1);
      setTotalElements(response.totalElements || 0);
    } catch (err: unknown) {
      console.error('Failed to fetch users:', err);
      const error = err instanceof Error ? err.message : 'Failed to load users';
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter, searchTerm]); // Add searchTerm to the dependency array

  const handleUserAdded = () => {
    fetchUsers();
    toast({
      title: 'Success',
      description: 'User created successfully',
      variant: 'default',
    });
  };

  const handleEditUser = (user: UserData) => {
    setEditingUser(user);
  };

  const handleUpdateUser = async (updatedUser: UserData) => {
    try {
      await adminAPI.updateUser(updatedUser.id, {
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        role: updatedUser.role as any,
      });
      toast({
        title: 'Success',
        description: 'User updated successfully',
        variant: 'default',
      });
      fetchUsers();
      setEditingUser(null);
    } catch (error) {
      console.error('Failed to update user:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteClick = (userId: string) => {
    setUserToDelete(userId);
    setShowDeleteDialog(true);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    setIsDeleting(true);
    try {
      await adminAPI.deleteUser(userToDelete);
      toast({
        title: 'Success',
        description: 'User deactivated successfully',
        variant: 'default',
      });
      fetchUsers();
    } catch (error) {
      console.error('Failed to deactivate user:', error);
      toast({
        title: 'Error',
        description: 'Failed to deactivate user',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
      setUserToDelete(null);
    }
  };

  const handleActivateUser = async (userId: string) => {
    try {
      await adminAPI.activateUser(userId);
      toast({
        title: 'Success',
        description: 'User activated successfully',
        variant: 'default',
      });
      fetchUsers();
    } catch (error) {
      console.error('Failed to activate user:', error);
      toast({
        title: 'Error',
        description: 'Failed to activate user',
        variant: 'destructive',
      });
    }
  };

  const handlePreviousPage = () => {
    setPage(Math.max(0, page - 1));
  };

  const handleNextPage = () => {
    setPage(Math.min(totalPages - 1, page + 1));
  };

  const handleRoleFilterChange = (value: string) => {
    setRoleFilter(value === 'all' ? null : value);
    setPage(0); // Reset to first page when filter changes
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Reset to first page when searching
    setPage(0);
    // The useEffect will trigger fetchUsers with the new search term
  };

  if (loading && users.length === 0) {
    return <CenteredLoading message="Loading users..." />;
  }

  const roleOptions = [
    { value: 'ADMIN', label: 'Admin' },
    { value: 'TEACHER', label: 'Teacher' },
    { value: 'STUDENT', label: 'Student' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">User Management</h1>
            <p className="text-muted-foreground">View and manage all users in the system</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline" 
              onClick={() => window.history.back()}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <SimpleThemeToggle />
            <Button variant="default" onClick={() => setShowAddUser(true)}>
              <Users className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center space-x-2">
            <Select value={roleFilter || 'all'} onValueChange={handleRoleFilterChange}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="TEACHER">Teacher</SelectItem>
                <SelectItem value="STUDENT">Student</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <form onSubmit={handleSearch} className="flex w-full md:w-auto">
            <Input
              placeholder="Search by name or email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-64"
            />
            <Button type="submit" variant="secondary" className="ml-2">
              <Search className="h-4 w-4" />
            </Button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-md">
            {error}
          </div>
        )}

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle>Users ({totalElements})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.length === 0 && !loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  No users found. Try adjusting your filters.
                </div>
              ) : (
                users.map((userData) => (
                  <div key={userData.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        userData.role === 'TEACHER' ? 'bg-gradient-warm' : 
                        userData.role === 'ADMIN' ? 'bg-gradient-primary' : 
                        'bg-gradient-success'
                      }`}>
                        {userData.role === 'TEACHER' ? 
                          <GraduationCap className="h-5 w-5 text-white" /> : 
                          userData.role === 'ADMIN' ? 
                          <Shield className="h-5 w-5 text-white" /> :
                          <Users className="h-5 w-5 text-white" />
                        }
                      </div>
                      <div>
                        <div className="font-medium">{userData.fullName}</div>
                        <div className="text-sm text-muted-foreground">{userData.email}</div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="text-sm text-muted-foreground mb-1">
                        {userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}
                      </div>
                      <div className="flex space-x-2">
                        {userData.firstLogin && userData.role === 'TEACHER' && (
                          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                            First Login Pending
                          </Badge>
                        )}
                        <Badge variant="outline">
                          {userData.role.toLowerCase()}
                        </Badge>
                        
                        {/* Toggle Switch for Active/Inactive Status */}
                        <div 
                          className={`relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors ${
                            userData.isActive 
                              ? 'bg-green-500' 
                              : 'bg-red-500'
                          }`}
                          onClick={() => {
                            if (userData.isActive) {
                              handleDeleteClick(userData.id);
                            } else {
                              handleActivateUser(userData.id);
                            }
                          }}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              userData.isActive ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          >
                            <div className="flex items-center justify-center h-full">
                              {userData.isActive ? (
                                <Check className="h-3 w-3 text-green-500" />
                              ) : (
                                <X className="h-3 w-3 text-red-500" />
                              )}
                            </div>
                          </span>
                        </div>
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={() => handleEditUser(userData)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <div className="text-sm text-muted-foreground">
                    Page {page + 1} of {totalPages}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePreviousPage}
                      disabled={page === 0}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={page >= totalPages - 1}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add User Dialog */}
      <AddUserDialog 
        open={showAddUser} 
        onOpenChange={setShowAddUser} 
        onUserAdded={handleUserAdded}
      />
      
      {/* Edit User Dialog */}
      {editingUser && (
        <AddUserDialog
          open={!!editingUser}
          onOpenChange={(open) => !open && setEditingUser(null)}
          onUserAdded={() => {}}
          userToEdit={editingUser}
          onUpdateUser={handleUpdateUser}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will deactivate the user account. The user will not be able to log in, but the account can be reactivated later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteUser} 
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deactivating...
                </>
              ) : (
                'Deactivate'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
