import { api } from '../api';
import type { ApiResponse, Story, PaginationParams } from './types';

interface CreateStoryRequestData {
  title: string;
  content: string;
  genre: string;
  fictionType: string;
  coverPictureUrl: string;
  coverPictureType: string;
  classId: string;
}

interface TeacherStory {
  storyId: string;
  title: string;
  content: string;
  createdAt: string;
  isActive: boolean;
  genre: string;
  fictionType: string;
  coverPictureUrl?: string;
  coverPictureType?: string;
  classEntity: {
    className: string;
    description: string;
    createdAt: string;
    isActive: boolean;
    classCode: string;
    classId: string;
  };
}

export const storyService = {
  getAllStories: async (params?: PaginationParams): Promise<ApiResponse<Story[]>> => {
    const response = await api.get('/stories', { params });
    return response.data;
  },

  getAllStoriesByTeacher: async (params?: PaginationParams): Promise<ApiResponse<Story[]>> => {
    const response = await api.get('/story/teacher', { params });
    return response.data;
  },
  

  getStoryById: async (storyId: string): Promise<TeacherStory> => {
    const response = await api.get(`/story/${storyId}`);
    return response.data;
  },

  createStory: async (data: Omit<Story, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Story>> => {
    const response = await api.post('/stories', data);
    return response.data;
  },

  createStoryWithDetails: async (data: CreateStoryRequestData): Promise<ApiResponse<Story>> => {
    const response = await api.post('/story/create', data);
    return response.data;
  },

  uploadCoverImage: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/story/upload-cover', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
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

  getStoriesByTeacher: async (): Promise<TeacherStory[]> => {
    const response = await api.get('/story/teacher');
    return response.data;
  },

  getStoriesByClass: async (classId: string): Promise<TeacherStory[]> => {
    const response = await api.get(`/story/class/${classId}`);
    return response.data;
  },
}; 