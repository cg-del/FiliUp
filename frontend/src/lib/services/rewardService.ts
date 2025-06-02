import { api } from '../api';
import type { ApiResponse, Reward } from './types';

export const rewardService = {
  getAllRewards: async (): Promise<ApiResponse<Reward[]>> => {
    const response = await api.get('/rewards');
    return response.data;
  },

  getRewardById: async (id: string): Promise<ApiResponse<Reward>> => {
    const response = await api.get(`/rewards/${id}`);
    return response.data;
  },

  createReward: async (data: Omit<Reward, 'id'>): Promise<ApiResponse<Reward>> => {
    const response = await api.post('/rewards', data);
    return response.data;
  },

  updateReward: async (id: string, data: Partial<Reward>): Promise<ApiResponse<Reward>> => {
    const response = await api.put(`/rewards/${id}`, data);
    return response.data;
  },

  deleteReward: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/rewards/${id}`);
    return response.data;
  },

  getStudentRewards: async (studentId: string): Promise<ApiResponse<Reward[]>> => {
    const response = await api.get(`/rewards/student/${studentId}`);
    return response.data;
  },

  assignReward: async (studentId: string, rewardId: string): Promise<ApiResponse<void>> => {
    const response = await api.post(`/rewards/${rewardId}/assign/${studentId}`);
    return response.data;
  },
}; 