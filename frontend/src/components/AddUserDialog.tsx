import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { adminAPI } from '@/lib/api';
import type { CreateUserRequest } from '@/lib/api';

type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT';

interface UserData {
  id?: string;
  email: string;
  fullName: string;
  role: UserRole;
  password?: string;
  sectionId?: string;
  isActive?: boolean;
  createdAt?: string;
  firstLogin?: boolean;
}

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserAdded?: () => void;
  userToEdit?: UserData | null;
  onUpdateUser?: (user: UserData) => void;
}

export const AddUserDialog = ({
  open,
  onOpenChange,
  onUserAdded,
  userToEdit,
  onUpdateUser,
}: AddUserDialogProps) => {
  const { toast } = useToast();
  
  type FormData = {
    name: string;
    email: string;
    role: 'ADMIN' | 'TEACHER' | 'STUDENT';
    password?: string;
  };

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    role: 'ADMIN',
    password: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update form data when userToEdit changes or dialog opens
  useEffect(() => {
    if (open && userToEdit) {
      // Ensure role is valid and properly typed
      const role = (userToEdit.role as string).toUpperCase() as 'ADMIN' | 'TEACHER' | 'STUDENT';
      setFormData({
        name: userToEdit.fullName || '',
        email: userToEdit.email || '',
        role: (['ADMIN', 'TEACHER', 'STUDENT'] as const).includes(role) ? role : 'ADMIN',
        password: ''
      });
    } else if (open) {
      // Reset form when opening for new user
      setFormData({
        name: '',
        email: '',
        role: 'ADMIN',
      });
    }
  }, [open, userToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // For new users, all fields are required
    // For existing users, only name and email are editable
    if (!formData.email || !formData.name) {
      setError('Please fill in all required fields');
      return;
    }
    
    // Ensure the role is one of the valid values
    const role: UserRole = (['ADMIN', 'TEACHER', 'STUDENT'] as const).includes(formData.role) 
      ? formData.role 
      : 'ADMIN';

    // Basic email validation
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setSubmitting(true);

    try {
      if (userToEdit && onUpdateUser) {
        // Update existing user with new role if changed
        const updatedUser = {
          ...userToEdit,
          email: formData.email,
          fullName: formData.name,
          role: role,
        };
        
        // Create a clean update data object with only the fields we want to update
        const updateData: Partial<CreateUserRequest> = {
          email: formData.email,
          fullName: formData.name,
          role: role,
        };

        // For updates, always provide a default password since backend requires it
        if (formData.password && formData.password.trim() !== '') {
          updateData.password = formData.password;
        } else {
          // Set a default password for updates if none provided
          updateData.password = 'password123';
        }

        // Handle section - use the existing section from userToEdit
        if (userToEdit?.sectionId) {
          updateData.section = userToEdit.sectionId.trim();
        } else {
          updateData.section = null;
        }


        await adminAPI.updateUser(updatedUser.id, updateData);
        toast({
          title: "Success",
          description: "User updated successfully.",
          variant: "default",
        });
        onOpenChange(false);
        if (onUserAdded) onUserAdded();
      } else {
        // Create new user - ensure role is valid
        const payload: CreateUserRequest = {
          email: formData.email,
          fullName: formData.name,
          role: role,
          password: Math.random().toString(36).slice(-8), // Generate a random password
          section: userToEdit?.sectionId?.trim() || null
        };


        await adminAPI.createUser(payload);

        toast({
          title: 'Success',
          description: 'User created successfully',
        });

        // Reset form
        setFormData({
          name: '',
          email: '',
          role: 'TEACHER',
        });

        // Close dialog and refresh user list
        onOpenChange(false);
        if (onUserAdded) onUserAdded();
      }
    } catch (err: any) {
      console.error('Error processing user:', err);
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
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
          <DialogTitle>{userToEdit ? 'Edit User' : 'Add New User'}</DialogTitle>
          <DialogDescription>
            {userToEdit
              ? 'Update user details.'
              : 'Add a new user to the system. An email will be sent to the user with instructions to set their password.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                placeholder="Juan Dela Cruz"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="juan@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="role">
                Role {!userToEdit && '*'}
                {userToEdit && ' '}
              </Label>
              <Select 
                value={formData.role}
                onValueChange={(value: UserRole) => setFormData({...formData, role: value})}
                disabled={false} // Enable role selection for all users
                required
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TEACHER">Teacher</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="STUDENT">Student</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {error && (
              <div className="text-sm text-destructive p-2 bg-destructive/10 rounded-md">
                {error}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {userToEdit ? 'Updating...' : 'Creating...'}
                </>
              ) : userToEdit ? 'Update User' : 'Create User'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
