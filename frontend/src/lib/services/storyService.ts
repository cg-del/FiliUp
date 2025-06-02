import { api } from '../api';
import type { ApiResponse, Story, PaginationParams } from './types';

export const storyService = {
  getAllStories: async (params?: PaginationParams): Promise<ApiResponse<Story[]>> => {
    const response = await api.get('/stories', { params });
    return response.data;
  },

  getStoryById: async (id: string): Promise<ApiResponse<Story>> => {
    const response = await api.get(`/stories/${id}`);
    return response.data;
  },

  createStory: async (data: Omit<Story, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Story>> => {
    const response = await api.post('/stories', data);
    return response.data;
  },

  updateStory: async (id: string, data: Partial<Story>): Promise<ApiResponse<Story>> => {
    const response = await api.put(`/stories/${id}`, data);
    return response.data;
  },

  deleteStory: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/stories/${id}`);
    return response.data;
  },

  getStoriesByDifficulty: async (difficulty: string): Promise<ApiResponse<Story[]>> => {
    const response = await api.get(`/stories/difficulty/${difficulty}`);
    return response.data;
  },

  getCommonStories: async (): Promise<ApiResponse<Story[]>> => {
    const response = await api.get('/stories/common');
    return response.data;
  },
}; 