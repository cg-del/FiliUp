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
  Filter 
} from 'lucide-react';
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

interface UserData {
  id: string;
  email: string;
  fullName: string;
  role: string;
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

  const pageSize = 10;

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminAPI.getUsers(page, pageSize, roleFilter || undefined);
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
  }, [page, roleFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleUserAdded = () => {
    fetchUsers();
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
    // In a real implementation, you would send the search term to the backend
    // For now, we'll just reset the page
    setPage(0);
    fetchUsers();
  };

  if (loading && users.length === 0) {
    return <CenteredLoading message="Loading users..." />;
  }

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
                      <div className="flex space-x-2">
                        <Badge variant={userData.isActive ? 'default' : 'secondary'}>
                          {userData.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant="outline">
                          {userData.role.toLowerCase()}
                        </Badge>
                        {userData.firstLogin && userData.role === 'TEACHER' && (
                          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                            First Login Pending
                          </Badge>
                        )}
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
        onOpenChange={(open) => {
          setShowAddUser(open);
          if (!open) {
            handleUserAdded();
          }
        }}
      />
    </div>
  );
};
