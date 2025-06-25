import { api } from '../api';
import type { ApiResponse, Class, Student, CommonStoryDTO } from './types';

export const classService = {
  getAllClasses: async (): Promise<ApiResponse<Class[]>> => {
    const response = await api.get('/classes');
    return response.data;
  },

  getClassById: async (classId: string): Promise<ApiResponse<Class>> => {
    const response = await api.get(`/classes/${classId}`);
    return response.data;
  },

  createClass: async (data: { className: string; description: string }): Promise<ApiResponse<Class>> => {
    const response = await api.post('/classes', data);
    return response.data;
  },

  updateClass: async (classId: string, data: Partial<Class>): Promise<ApiResponse<Class>> => {
    const response = await api.put(`/classes/${classId}`, data);
    return response.data;
  },

  updateClassName: async (classId: string, className: string): Promise<ApiResponse<Class>> => {
    const response = await api.put(`/classes/${classId}/name`, { className });
    return response.data;
  },

  deleteClass: async (classId: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/classes/${classId}`);
    return response.data;
  },

  // Enrollment endpoints
  enrollStudent: async (classId: string, studentId: string): Promise<ApiResponse<void>> => {
    const response = await api.post(`/enrollments/${classId}/students/${studentId}`);
    return response.data;
  },

  unenrollStudent: async (classId: string, studentId: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/enrollments/${classId}/students/${studentId}`);
    return response.data;
  },

  getClassesByTeacher: async (): Promise<ApiResponse<Class[]>> => {
    const response = await api.get('/classes/teacher');
    console.log(response.data);
    return response.data;
  },

  getClassesByStudent: async (studentId: string): Promise<ApiResponse<Class[]>> => {
    const response = await api.get(`/classes/student/${studentId}`);
    return response.data;
  },

  // Get classes for the current authenticated student
  getMyClasses: async (): Promise<ApiResponse<Class[]>> => {
    const response = await api.get('/classes/myclasses');
    return response.data;
  },

  // Get students by class ID
  getStudentsByClass: async (classId: string): Promise<ApiResponse<Student[]>> => {
    const response = await api.get(`/classes/${classId}/students`);
    return response.data;
  },
  
  // Add common story to class
  addCommonStoryToClass: async (classId: string, storyId: string): Promise<ApiResponse<void>> => {
    const response = await api.post(`/classes/${classId}/common-stories/${storyId}`);
    return response.data;
  },
  
  // Get common stories added to a class
  getClassCommonStories: async (classId: string): Promise<ApiResponse<CommonStoryDTO[]>> => {
    const response = await api.get(`/classes/${classId}/common-stories`);
    return response.data;
  },
  
  // Remove common story from class
  removeCommonStoryFromClass: async (classId: string, storyId: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/classes/${classId}/common-stories/${storyId}`);
    return response.data;
  },

  // Get class quiz summary for dashboard statistics
  getClassQuizSummary: async (classId: string): Promise<ApiResponse<{
    totalStudents: number;
    totalQuizzes: number;
    averageScore: number;
    averageAccuracy: number;
    averageTimeMinutes: number;
    classId: string;
  }>> => {
    const response = await api.get(`/leaderboard/class/${classId}/summary`);
    return response.data;
  },

  // Get class students with detailed info for dashboard
  getClassStudentsDetailed: async (classId: string): Promise<ApiResponse<Array<{
    id: string;
    user: {
      id: string;
      username: string;
      email: string;
      role: string;
    };
    studentProfile?: {
      id: string;
      userId: string;
      grade: string;
      readingLevel: string;
    };
  }>>> => {
    const response = await api.get(`/classes/${classId}/students`);
    return response.data;
  },

  // Get comprehensive dashboard statistics for a class
  getClassDashboardStats: async (classId: string): Promise<ApiResponse<{
    classId: string;
    className: string;
    totalStudents: number;
    activeStudents: number;
    storiesCount: number;
    quizStats: {
      totalQuizzes: number;
      averageScore: number;
      averageAccuracy: number;
      completedQuizzes: number;
    };
    studentActivity: Array<{
      id: string;
      username: string;
      email: string;
      enrolledAt: string;
      lastActiveHours: number;
      storiesRead: number;
      quizzesCompleted: number;
      averageScore: number;
    }>;
    lastUpdated: string;
  }>> => {
    const response = await api.get(`/classes/${classId}/dashboard-stats`);
    return response.data;
  }
}; 