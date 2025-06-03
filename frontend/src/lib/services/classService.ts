import { api } from '../api';
import type { ApiResponse, Class } from './types';

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
}; 