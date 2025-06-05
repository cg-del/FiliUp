import { api } from '../api';
import type { ApiResponse, StudentProfile, TeacherProfile } from './types';

export const profileService = {
  // Student Profile endpoints
  getStudentProfile: async (userId: string): Promise<ApiResponse<StudentProfile>> => {
    const response = await api.get(`/students/${userId}`);
    return response.data;
  },

  updateStudentProfile: async (userId: string, data: Partial<StudentProfile>): Promise<ApiResponse<StudentProfile>> => {
    const response = await api.put(`/students/${userId}`, data);
    return response.data;
  },

  createStudentProfile: async (data: Omit<StudentProfile, 'id'>): Promise<ApiResponse<StudentProfile>> => {
    const response = await api.post('/students', data);
    return response.data;
  },

  // Teacher Profile endpoints
  getTeacherProfile: async (userId: string): Promise<ApiResponse<TeacherProfile>> => {
    const response = await api.get(`/teachers/${userId}`);
    return response.data;
  },

  updateTeacherProfile: async (userId: string, data: Partial<TeacherProfile>): Promise<ApiResponse<TeacherProfile>> => {
    const response = await api.put(`/teachers/${userId}`, data);
    return response.data;
  },

  createTeacherProfile: async (data: Omit<TeacherProfile, 'id'>): Promise<ApiResponse<TeacherProfile>> => {
    const response = await api.post('/teachers', data);
    return response.data;
  },
}; 