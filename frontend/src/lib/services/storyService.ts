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
    const response = await api.put(`/story/${id}`, data);
    return response.data;
  },

  deleteStory: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/story/${id}`);
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

/**
 * Create story with retry logic and better error handling
 */
export const createStoryWithRetry = async (
  storyData: {
    title: string;
    content: string;
    genre: string;
    fictionType: string;
    coverPictureUrl?: string;
    coverPictureType?: string;
    classId: string;
  },
  maxRetries: number = 2
): Promise<any> => {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      console.log(`Story creation attempt ${attempt}/${maxRetries + 1}`);
      
      // Validate data before sending
      if (!storyData.title?.trim()) {
        throw new Error('Story title is required');
      }
      if (!storyData.content?.trim()) {
        throw new Error('Story content is required');
      }
      if (!storyData.classId) {
        throw new Error('Class ID is required');
      }
      
      const response = await api.post('/story/create', {
        title: storyData.title.trim(),
        content: storyData.content.trim(),
        genre: storyData.genre,
        fictionType: storyData.fictionType,
        coverPictureUrl: storyData.coverPictureUrl || '',
        coverPictureType: storyData.coverPictureType || '',
        classId: storyData.classId
      });
      
      console.log(`Story creation successful on attempt ${attempt}`);
      return response.data;
      
    } catch (error: any) {
      lastError = error;
      console.error(`Story creation attempt ${attempt} failed:`, error);
      
      // Don't retry for client errors (400-499)
      if (error?.response?.status && error.response.status >= 400 && error.response.status < 500) {
        console.log('Client error detected, not retrying');
        throw error;
      }
      
      // Don't retry on last attempt
      if (attempt === maxRetries + 1) {
        console.log('Max retries reached, throwing last error');
        throw lastError;
      }
      
      // Wait before retrying (exponential backoff)
      const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
      console.log(`Waiting ${waitTime}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw lastError;
};

/**
 * Upload cover image with retry logic
 */
export const uploadCoverImageWithRetry = async (
  file: File,
  maxRetries: number = 2
): Promise<{ url: string }> => {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      console.log(`Cover image upload attempt ${attempt}/${maxRetries + 1}`);
      
      // Validate file
      if (!file) {
        throw new Error('File is required');
      }
      
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Invalid file type. Only JPG, PNG, and GIF are allowed.');
      }
      
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error('File size too large. Maximum size is 5MB.');
      }
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/story/upload-cover', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log(`Cover image upload successful on attempt ${attempt}`);
      return response.data;
      
    } catch (error: any) {
      lastError = error;
      console.error(`Cover image upload attempt ${attempt} failed:`, error);
      
      // Don't retry for client errors (400-499)
      if (error?.response?.status && error.response.status >= 400 && error.response.status < 500) {
        console.log('Client error detected, not retrying');
        throw error;
      }
      
      // Don't retry on last attempt
      if (attempt === maxRetries + 1) {
        console.log('Max retries reached, throwing last error');
        throw lastError;
      }
      
      // Wait before retrying (exponential backoff)
      const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
      console.log(`Waiting ${waitTime}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw lastError;
}; 