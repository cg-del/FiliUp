import { api } from '../api';
import type { ApiResponse, Class } from './types';

export const classService = {
  getAllClasses: async (): Promise<ApiResponse<Class[]>> => {
    const response = await api.get('/classes');
    return response.data;
  },

  getClassById: async (id: string): Promise<ApiResponse<Class>> => {
    const response = await api.get(`/classes/${id}`);
    return response.data;
  },

  createClass: async (data: Omit<Class, 'id'>): Promise<ApiResponse<Class>> => {
    const response = await api.post('/classes', data);
    return response.data;
  },

  updateClass: async (id: string, data: Partial<Class>): Promise<ApiResponse<Class>> => {
    const response = await api.put(`/classes/${id}`, data);
    return response.data;
  },

  deleteClass: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/classes/${id}`);
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

  getClassesByTeacher: async (teacherId: string): Promise<ApiResponse<Class[]>> => {
    const response = await api.get(`/classes/teacher/${teacherId}`);
    return response.data;
  },

  getClassesByStudent: async (studentId: string): Promise<ApiResponse<Class[]>> => {
    const response = await api.get(`/classes/student/${studentId}`);
    return response.data;
  },
}; 