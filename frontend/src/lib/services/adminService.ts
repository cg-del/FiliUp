import { api } from '../api';

// Types for admin functionality
export interface AdminUser {
  userId: string;
  userName: string;
  userEmail: string;
  userRole: 'STUDENT' | 'TEACHER' | 'ADMIN';
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  userProfilePictureUrl?: string;
}

export interface AdminStory {
  storyId: string;
  title: string;
  content: string;
  genre: string;
  fictionType?: string;
  createdAt: string;
  isActive: boolean;
  createdBy: {
    userId: string;
    userName: string;
  };
}

export interface DashboardData {
  userStats: {
    totalUsers: number;
    activeUsers: number;
    students: number;
    teachers: number;
    admins: number;
    recentRegistrations: number;
  };
  contentStats: {
    totalStories: number;
    totalClasses: number;
    totalQuizzes: number;
    totalReports: number;
  };
  activityStats: {
    activeUsersLast24h: number;
    activeUsersLastWeek: number;
    dailyRegistrations: Record<string, number>;
  };
  lastUpdated: string;
}

export interface UserGrowthData {
  dailyRegistrations: Record<string, number>;
  totalNewUsers: number;
  periodDays: number;
  averagePerDay: number;
}

export interface UserActivity {
  userId: string;
  userName: string;
  userRole: string;
  lastLogin: string;
  action: string;
  isActive: boolean;
}

export interface ActivitySummaryData {
  activeUsersLast24h: number;
  activeUsersLastWeek: number;
}

export interface BulkActionRequest {
  userIds: string[];
  action: 'activate' | 'deactivate' | 'delete';
}



class AdminService {
  // User Management
  async getUsers(params?: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
    role?: string;
    isActive?: boolean;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortDir) queryParams.append('sortDir', params.sortDir);
    if (params?.role) queryParams.append('role', params.role);
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());

    const response = await api.get(`/admin/users?${queryParams.toString()}`);
    return response.data.data; // Extract data from wrapped response
  }

  async createUser(userData: Partial<AdminUser>) {
    const response = await api.post('/admin/users', userData);
    return response.data;
  }

  async updateUser(userId: string, userData: Partial<AdminUser>) {
    const response = await api.put(`/admin/users/${userId}`, userData);
    return response.data;
  }

  async deleteUser(userId: string) {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  }

  async toggleUserStatus(userId: string) {
    const response = await api.patch(`/admin/users/${userId}/toggle-status`);
    return response.data;
  }

  async bulkUserAction(request: BulkActionRequest) {
    const response = await api.post('/admin/users/bulk-action', request);
    return response.data;
  }

  // Story Management
  async getStories(params?: {
    page?: number;
    size?: number;
    sortBy?: string;
    status?: string;
    teacherId?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.teacherId) queryParams.append('teacherId', params.teacherId);

    const response = await api.get(`/admin/stories?${queryParams.toString()}`);
    return response.data.data; // Extract data from wrapped response
  }

  // Note: updateStory and deleteStory methods have been removed
  // Admin can only view teacher-created stories, not modify them
  // Use common story endpoints for managing admin-created content

  // Analytics and Dashboard
  async getDashboardData(): Promise<DashboardData> {
    const response = await api.get('/admin/dashboard');
    return response.data.data; // Extract data from the wrapped response
  }

  async getUserGrowthAnalytics(days: number = 30): Promise<UserGrowthData> {
    const response = await api.get(`/admin/analytics/user-growth?days=${days}`);
    return response.data.data; // Extract data from wrapped response
  }

  async getActivitySummary(): Promise<ActivitySummaryData> {
    const response = await api.get('/admin/analytics/activity-summary');
    return response.data.data; // Extract data from wrapped response
  }



  async getUserActivityLogs(params?: {
    page?: number;
    size?: number;
    userId?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    if (params?.userId) queryParams.append('userId', params.userId);

    const response = await api.get(`/admin/logs/user-activities?${queryParams.toString()}`);
    return response.data;
  }


}

export const adminService = new AdminService(); 