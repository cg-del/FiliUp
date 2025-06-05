import { api } from '../api';
import type { ApiResponse, Progress } from './types';

export const progressService = {
  getStudentProgress: async (studentId: string): Promise<ApiResponse<Progress[]>> => {
    const response = await api.get(`/progress/${studentId}`);
    return response.data;
  },

  getProgressByStory: async (studentId: string, storyId: string): Promise<ApiResponse<Progress>> => {
    const response = await api.get(`/progress/${studentId}/stories/${storyId}`);
    return response.data;
  },

  getProgressByQuiz: async (studentId: string, quizId: string): Promise<ApiResponse<Progress>> => {
    const response = await api.get(`/progress/${studentId}/quizzes/${quizId}`);
    return response.data;
  },

  updateProgress: async (studentId: string, data: Partial<Progress>): Promise<ApiResponse<Progress>> => {
    const response = await api.put(`/progress/${studentId}`, data);
    return response.data;
  },

  createProgress: async (data: Omit<Progress, 'id'>): Promise<ApiResponse<Progress>> => {
    const response = await api.post('/progress', data);
    return response.data;
  },

  getClassProgress: async (classId: string): Promise<ApiResponse<Progress[]>> => {
    const response = await api.get(`/progress/class/${classId}`);
    return response.data;
  },
}; 