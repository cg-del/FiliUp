import { api } from '../api';
import type { ApiResponse } from './types';

export interface EnrollmentRequest {
  classCode: string;
}

export interface EnrollmentResponse {
  message: string;
  enrollmentId?: string;
  status?: string;
}

export interface PendingEnrollment {
  id: string;
  userId: string;
  classCode: string;
  isAccepted: boolean;
  enrollmentDate: string;
  studentName: string;
  studentEmail: string;
  userProfilePictureUrl: string | null;
  section: string;
  averageScore: number;
  numberOfQuizTakes: number;
}

export const enrollmentService = {
  getEnrollmentStatusByStudentId: async (studentId: string): Promise<ApiResponse<{ status: string; classId?: string }>> => {
    const response = await api.get(`/enrollment-status/${studentId}`);
    return response.data;
  },
  enrollInClass: async (classCode: string): Promise<ApiResponse<EnrollmentResponse>> => {
    const response = await api.post('/enrollments/enroll', { classCode });
    return response.data;
  },

  getPendingEnrollmentsByClassId: async (classId: string): Promise<ApiResponse<PendingEnrollment[]>> => {
    const response = await api.get(`/enrollments/class/${classId}`);
    return response.data;
  },

  getMyEnrollments: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/enrollments/my');
    return response.data;
  },

  cancelEnrollment: async (enrollmentId: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/enrollments/${enrollmentId}`);
    return response.data;
  },

  approveEnrollment: async (classCode: string, studentId: string): Promise<ApiResponse<void>> => {
    const response = await api.post(`/enrollments/accept/${classCode}/${studentId}`);
    return response.data;
  }
}; 