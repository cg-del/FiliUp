import { api } from '../api';
import { ApiResponse } from './types';

export interface StudentProfile {
  profileId: string;
  userId: string;
  parentsEmail?: string;
  section?: string;
  badges?: string;
  averageScore: number;
  numberOfQuizTakes: number;
  isAccepted: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface CreateStudentProfileRequest {
  userId: string;
  parentsEmail?: string;
  section?: string;
}

export interface UpdateStudentProfileRequest {
  parentsEmail?: string;
  section?: string;
}

export const studentProfileService = {
  async createProfile(data: CreateStudentProfileRequest): Promise<StudentProfile> {
    const response = await api.post('/v1/student-profiles', data);
    return response.data;
  },

  async getMyProfile(): Promise<StudentProfile> {
    const response = await api.get('/v1/student-profiles/my-profile');
    return response.data;
  },

  async getProfileById(profileId: string): Promise<StudentProfile> {
    const response = await api.get(`/v1/student-profiles/${profileId}`);
    return response.data;
  },

  async getProfileByUserId(userId: string): Promise<StudentProfile> {
    const response = await api.get(`/v1/student-profiles/user/${userId}`);
    return response.data;
  },

  async updateProfile(profileId: string, data: UpdateStudentProfileRequest): Promise<StudentProfile> {
    const response = await api.put(`/v1/student-profiles/${profileId}`, data);
    return response.data;
  },

  async deleteProfile(profileId: string): Promise<void> {
    await api.delete(`/v1/student-profiles/${profileId}`);
  },

  async incrementQuizzesTaken(userId: string, quizScore: number): Promise<void> {
    await api.post(`/v1/student-profiles/increment-quizzes-taken/${userId}?quizScore=${quizScore}`);
  },

  getDashboardStats: async (): Promise<ApiResponse<{
    userId: string;
    userName: string;
    totalPoints: number;
    completedStories: number;
    totalStories: number;
    completedQuizzes: number;
    totalQuizzes: number;
    level: number;
    averageQuizScore: number;
    profileAverageScore: number;
    profileQuizTakes: number;
    enrolledClassesCount: number;
    lastUpdated: string;
    recentQuizzes: Array<{
      quizTitle: string;
      score: number;
      maxScore: number;
      percentage: number;
      completedAt: string;
    }>;
  }>> => {
         const response = await api.get('/v1/student-profiles/dashboard-stats');
     return response.data;
  }
}; 