import { useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/AdminSidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { adminService, type AdminUser } from '@/lib/services/adminService';
import { useToast } from '@/components/ui/use-toast';
import {
  Users,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Filter,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react';

interface UserFilters {
  role: string;
  isActive: string;
  search: string;
}

interface CreateUserData {
  userName: string;
  userEmail: string;
  userPassword: string;
  userRole: 'STUDENT' | 'TEACHER' | 'ADMIN';
}

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<UserFilters>({
    role: 'all',
    isActive: 'all',
    search: ''
  });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [createUserData, setCreateUserData] = useState<CreateUserData>({
    userName: '',
    userEmail: '',
    userPassword: '',
    userRole: 'STUDENT'
  });
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filters.role && filters.role !== 'all') params.role = filters.role;
      if (filters.isActive && filters.isActive !== 'all') params.isActive = filters.isActive === 'true';
      
      const response = await adminService.getUsers(params);
      let filteredUsers = response.users || [];
      
      // Apply search filter
      if (filters.search) {
        filteredUsers = filteredUsers.filter((user: AdminUser) =>
          user.userName.toLowerCase().includes(filters.search.toLowerCase()) ||
          user.userEmail.toLowerCase().includes(filters.search.toLowerCase())
        );
      }
      
      setUsers(filteredUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const handleCreateUser = async () => {
    try {
      await adminService.createUser(createUserData);
      toast({
        title: "Success",
        description: "User created successfully",
      });
      setIsCreateDialogOpen(false);
      setCreateUserData({
        userName: '',
        userEmail: '',
        userPassword: '',
        userRole: 'STUDENT'
      });
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: "Failed to create user. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    
    try {
      await adminService.updateUser(editingUser.userId, {
        userName: editingUser.userName,
        userEmail: editingUser.userEmail,
        userRole: editingUser.userRole,
        isActive: editingUser.isActive
      });
      toast({
        title: "Success",
        description: "User updated successfully",
      });
      setIsEditDialogOpen(false);
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: "Failed to update user. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await adminService.deleteUser(userId);
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleToggleUserStatus = async (userId: string) => {
    try {
      await adminService.toggleUserStatus(userId);
      toast({
        title: "Success",
        description: "User status updated successfully",
      });
      fetchUsers();
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast({
        title: "Error",
        description: "Failed to update user status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (selectedUsers.size === 0) {
      toast({
        title: "Error",
        description: "Please select users first",
        variant: "destructive",
      });
      return;
    }

    if (action === 'delete' && !confirm(`Are you sure you want to delete ${selectedUsers.size} users?`)) {
      return;
    }

    try {
      await adminService.bulkUserAction({
        userIds: Array.from(selectedUsers),
        action
      });
      toast({
        title: "Success",
        description: `Successfully ${action}d ${selectedUsers.size} users`,
      });
      setSelectedUsers(new Set());
      fetchUsers();
    } catch (error) {
      console.error('Error performing bulk action:', error);
      toast({
        title: "Error",
        description: "Failed to perform bulk action. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    const newSelected = new Set(selectedUsers);
    if (checked) {
      newSelected.add(userId);
    } else {
      newSelected.delete(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(new Set(users.map(user => user.userId)));
    } else {
      setSelectedUsers(new Set());
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'destructive';
      case 'TEACHER': return 'default';
      case 'STUDENT': return 'secondary';
      default: return 'outline';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <SidebarInset className="flex-1">
          <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-teal-100">
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center space-x-4">
                  <SidebarTrigger className="text-teal-600" />
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                      User Management
                    </h1>
                    <p className="text-gray-600 text-sm">Manage users, roles, and permissions</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button onClick={fetchUsers} variant="outline" size="sm" className="border-teal-200 text-teal-600 hover:bg-teal-50">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New User</DialogTitle>
                    <DialogDescription>
                      Add a new user to the system
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="userName">Username</Label>
                      <Input
                        id="userName"
                        value={createUserData.userName}
                        onChange={(e) => setCreateUserData(prev => ({ ...prev, userName: e.target.value }))}
                        placeholder="Enter username"
                      />
                    </div>
                    <div>
                      <Label htmlFor="userEmail">Email</Label>
                      <Input
                        id="userEmail"
                        type="email"
                        value={createUserData.userEmail}
                        onChange={(e) => setCreateUserData(prev => ({ ...prev, userEmail: e.target.value }))}
                        placeholder="Enter email"
                      />
                    </div>
                    <div>
                      <Label htmlFor="userPassword">Password</Label>
                      <Input
                        id="userPassword"
                        type="password"
                        value={createUserData.userPassword}
                        onChange={(e) => setCreateUserData(prev => ({ ...prev, userPassword: e.target.value }))}
                        placeholder="Enter password"
                      />
                    </div>
                    <div>
                      <Label htmlFor="userRole">Role</Label>
                      <Select 
                        value={createUserData.userRole} 
                        onValueChange={(value: 'STUDENT' | 'TEACHER' | 'ADMIN') => 
                          setCreateUserData(prev => ({ ...prev, userRole: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="STUDENT">Student</SelectItem>
                          <SelectItem value="TEACHER">Teacher</SelectItem>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateUser}>
                        Create User
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
                </div>
              </div>
            </header>
            
            <div className="p-6">
              {/* Welcome Section */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  User Management 👥
                </h1>
                <p className="text-gray-600">Manage users, roles, and permissions across the system.</p>
              </div>

          {/* Filters and Search */}
          <Card className="mb-6 bg-white shadow-sm border border-teal-100">
            <CardHeader>
              <CardTitle className="text-lg flex items-center text-teal-800">
                <Filter className="w-5 h-5 mr-2 text-teal-600" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="search"
                      placeholder="Search users..."
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select 
                    value={filters.role} 
                    onValueChange={(value) => setFilters(prev => ({ ...prev, role: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All roles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All roles</SelectItem>
                      <SelectItem value="STUDENT">Student</SelectItem>
                      <SelectItem value="TEACHER">Teacher</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={filters.isActive} 
                    onValueChange={(value) => setFilters(prev => ({ ...prev, isActive: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button 
                    variant="outline" 
                    onClick={() => setFilters({ role: 'all', isActive: 'all', search: '' })}
                    className="w-full border-teal-200 text-teal-600 hover:bg-teal-50"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bulk Actions */}
          {selectedUsers.size > 0 && (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {selectedUsers.size} users selected
                  </span>
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={() => handleBulkAction('activate')}>
                      <UserCheck className="w-4 h-4 mr-2" />
                      Activate
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleBulkAction('deactivate')}>
                      <UserX className="w-4 h-4 mr-2" />
                      Deactivate
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleBulkAction('delete')}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Users Table */}
          <Card className="bg-white shadow-sm border border-teal-100">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-teal-800">
                <span className="flex items-center">
                  <Users className="w-5 h-5 mr-2 text-teal-600" />
                  Users ({users.length})
                </span>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm">
                    <Upload className="w-4 h-4 mr-2" />
                    Import
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedUsers.size === users.length && users.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead className="w-12">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={7} className="text-center py-8">
                          Loading users...
                        </TableCell>
                      </TableRow>
                    ))
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.userId}>
                        <TableCell>
                          <Checkbox
                            checked={selectedUsers.has(user.userId)}
                            onCheckedChange={(checked) => handleSelectUser(user.userId, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{user.userName}</div>
                            <div className="text-sm text-muted-foreground">{user.userEmail}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(user.userRole)}>
                            {user.userRole}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.isActive ? "default" : "secondary"}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(user.createdAt)}</TableCell>
                        <TableCell>
                          {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                onClick={() => {
                                  setEditingUser(user);
                                  setIsEditDialogOpen(true);
                                }}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleUserStatus(user.userId)}>
                                {user.isActive ? (
                                  <>
                                    <UserX className="w-4 h-4 mr-2" />
                                    Deactivate
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="w-4 h-4 mr-2" />
                                    Activate
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteUser(user.userId)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Edit User Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit User</DialogTitle>
                <DialogDescription>
                  Update user information
                </DialogDescription>
              </DialogHeader>
              {editingUser && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="editUserName">Username</Label>
                    <Input
                      id="editUserName"
                      value={editingUser.userName}
                      onChange={(e) => setEditingUser(prev => prev ? ({ ...prev, userName: e.target.value }) : null)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="editUserEmail">Email</Label>
                    <Input
                      id="editUserEmail"
                      type="email"
                      value={editingUser.userEmail}
                      onChange={(e) => setEditingUser(prev => prev ? ({ ...prev, userEmail: e.target.value }) : null)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="editUserRole">Role</Label>
                    <Select 
                      value={editingUser.userRole} 
                      onValueChange={(value: 'STUDENT' | 'TEACHER' | 'ADMIN') => 
                        setEditingUser(prev => prev ? ({ ...prev, userRole: value }) : null)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="STUDENT">Student</SelectItem>
                        <SelectItem value="TEACHER">Teacher</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="editIsActive"
                      checked={editingUser.isActive}
                      onCheckedChange={(checked) => 
                        setEditingUser(prev => prev ? ({ ...prev, isActive: checked as boolean }) : null)
                      }
                    />
                    <Label htmlFor="editIsActive">Active</Label>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleUpdateUser}>
                      Update User
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}