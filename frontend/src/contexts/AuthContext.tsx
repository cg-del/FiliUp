import React, { createContext, useContext, useState, useEffect } from 'react';
import { userService } from '@/lib/services';

interface User {
  id: string;
  name: string;
  email: string;
  type: 'student' | 'teacher' | 'admin';
  grade?: string;
  section?: string;
  classes?: string[]; // For teachers - list of class IDs they manage
  enrolledClass?: string; // For students - enrolled class ID
  enrollmentStatus?: 'pending' | 'approved' | 'rejected' | 'none'; // For students
}

interface EnrollmentRequest {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  classId: string;
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, userType: 'student' | 'teacher' | 'admin') => Promise<boolean>;
  logout: () => void;
  enrollInClass: (classCode: string) => Promise<{ success: boolean; message: string }>;
  approveEnrollment: (requestId: string) => Promise<boolean>;
  rejectEnrollment: (requestId: string) => Promise<boolean>;
  getEnrollmentRequests: (classId: string) => EnrollmentRequest[];
  setUser: (user: User) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [enrollmentRequests, setEnrollmentRequests] = useState<EnrollmentRequest[]>([]);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('filiup_user');
    const storedRequests = localStorage.getItem('filiup_enrollment_requests');
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    if (storedRequests) {
      setEnrollmentRequests(JSON.parse(storedRequests));
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string, userType: 'student' | 'teacher' | 'admin'): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Use real authentication instead of mock
      const response = await userService.login({ userName: username, userPassword: password });
      
      if (response && response.data) {
        const { accessToken, refreshToken, mustChangePassword, userId } = response.data;
        
        // Clear all existing localStorage data before setting new values
        localStorage.clear();
        
        // Store tokens
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('token', accessToken); // Also store as 'token' for compatibility
        
        // Decode JWT to get user info
        const tokenPayload = JSON.parse(atob(accessToken.split('.')[1]));
        const userRole = tokenPayload.role;
        const userName = tokenPayload.sub;

        // Create user object and store in localStorage
        const user = {
          id: userId || tokenPayload.jti || Math.random().toString(36),
          name: userName, // Use username directly
          email: userName, // Keep email field for compatibility, using username value
          type: userRole.toLowerCase() as 'student' | 'teacher' | 'admin',
          ...(userRole === 'TEACHER' && { classes: ['3-matatag', '3-masigla', '3-mabini'] }),
          ...(userRole === 'STUDENT' && { enrollmentStatus: 'none' as const })
        };

        setUser(user);
        localStorage.setItem('filiup_user', JSON.stringify(user));
        setIsLoading(false);
        return true;
      }
    } catch (error) {
      console.error('Login error:', error);
    }
    
    setIsLoading(false);
    return false;
  };

  const enrollInClass = async (classCode: string): Promise<{ success: boolean; message: string }> => {
    if (!user || user.type !== 'student') {
      return { success: false, message: 'Only students can enroll in classes' };
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock validation of class code
    const validClassCodes = ['CLS-3MT-001', 'CLS-3MS-002', 'CLS-3MB-003'];
    const classMapping: Record<string, string> = {
      'CLS-3MT-001': '3-matatag',
      'CLS-3MS-002': '3-masigla',
      'CLS-3MB-003': '3-mabini'
    };

    if (!validClassCodes.includes(classCode)) {
      return { success: false, message: 'Invalid class code' };
    }

    const classId = classMapping[classCode];
    
    // Create enrollment request
    const newRequest: EnrollmentRequest = {
      id: Math.random().toString(36),
      studentId: user.id,
      studentName: user.name,
      studentEmail: user.email,
      classId,
      status: 'pending',
      requestDate: new Date().toISOString()
    };

    const updatedRequests = [...enrollmentRequests, newRequest];
    setEnrollmentRequests(updatedRequests);
    localStorage.setItem('filiup_enrollment_requests', JSON.stringify(updatedRequests));

    // Update user status
    const updatedUser = { ...user, enrollmentStatus: 'pending' as const };
    setUser(updatedUser);
    localStorage.setItem('filiup_user', JSON.stringify(updatedUser));

    return { success: true, message: 'Enrollment request sent! Wait for teacher approval.' };
  };

  const approveEnrollment = async (requestId: string): Promise<boolean> => {
    const request = enrollmentRequests.find(r => r.id === requestId);
    if (!request) return false;

    // Update request status
    const updatedRequests = enrollmentRequests.map(r => 
      r.id === requestId ? { ...r, status: 'approved' as const } : r
    );
    setEnrollmentRequests(updatedRequests);
    localStorage.setItem('filiup_enrollment_requests', JSON.stringify(updatedRequests));

    return true;
  };

  const rejectEnrollment = async (requestId: string): Promise<boolean> => {
    const request = enrollmentRequests.find(r => r.id === requestId);
    if (!request) return false;

    // Update request status
    const updatedRequests = enrollmentRequests.map(r => 
      r.id === requestId ? { ...r, status: 'rejected' as const } : r
    );
    setEnrollmentRequests(updatedRequests);
    localStorage.setItem('filiup_enrollment_requests', JSON.stringify(updatedRequests));

    return true;
  };

  const getEnrollmentRequests = (classId: string): EnrollmentRequest[] => {
    return enrollmentRequests.filter(r => r.classId === classId && r.status === 'pending');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('filiup_user');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      enrollInClass, 
      approveEnrollment, 
      rejectEnrollment, 
      getEnrollmentRequests, 
      setUser,
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
