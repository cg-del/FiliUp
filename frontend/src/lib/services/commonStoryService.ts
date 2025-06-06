import { api } from '../api';

export interface CommonStory {
  storyId: string;
  title: string;
  content: string;
  genre: string;
  fictionType?: string;
  createdAt: string;
  isActive?: boolean;
  coverPictureUrl?: string;
  coverPictureType?: string;
  createdBy: {
    userId?: string;
    userName: string;
  };
}

export interface CreateCommonStoryRequest {
  title: string;
  content: string;
  genre: string;
  fictionType?: string;
  coverPictureUrl?: string;
  coverPictureType?: string;
}

class CommonStoryService {
  // Public endpoints (for all users) - using PublicCommonStoryController
  async getActiveCommonStories(params?: {
    page?: number;
    size?: number;
    genre?: string;
    fictionType?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    if (params?.genre) queryParams.append('genre', params.genre);
    if (params?.fictionType) queryParams.append('fictionType', params.fictionType);

    const response = await api.get(`/public/common-stories?${queryParams.toString()}`);
    return response.data.data;
  }

  async getCommonStoryById(storyId: string) {
    const response = await api.get(`/public/common-stories/${storyId}`);
    return response.data.data;
  }

  async getAvailableGenres() {
    const response = await api.get('/public/common-stories/genres');
    return response.data.data;
  }

  async getAvailableFictionTypes() {
    const response = await api.get('/public/common-stories/fiction-types');
    return response.data.data;
  }

  // Admin endpoints (for admins only) - using AdminController
  async getAllCommonStories(params?: {
    page?: number;
    size?: number;
    sortBy?: string;
    status?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.status) queryParams.append('status', params.status);

    const response = await api.get(`/admin/common-stories?${queryParams.toString()}`);
    return response.data.data;
  }

  async createCommonStory(storyData: CreateCommonStoryRequest) {
    const response = await api.post('/admin/common-stories', storyData);
    return response.data;
  }

  async uploadCoverImage(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/story/upload-cover', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async updateCommonStory(storyId: string, storyData: Partial<CommonStory>) {
    const response = await api.put(`/admin/common-stories/${storyId}`, storyData);
    return response.data;
  }

  async deleteCommonStory(storyId: string) {
    const response = await api.delete(`/admin/common-stories/${storyId}`);
    return response.data;
  }

  async toggleCommonStoryStatus(storyId: string) {
    const response = await api.patch(`/admin/common-stories/${storyId}/toggle-status`);
    return response.data;
  }

  // Regular CRUD endpoints (for authenticated users) - using CommonStoryController  
  async getAllStories() {
    const response = await api.get('/common-stories');
    return response.data;
  }

  async getStoryById(storyId: string) {
    const response = await api.get(`/common-stories/${storyId}`);
    return response.data;
  }

  async saveStory(storyData: CreateCommonStoryRequest) {
    const response = await api.post('/common-stories', storyData);
    return response.data;
  }

  async updateStory(storyId: string, storyData: Partial<CommonStory>) {
    const response = await api.put(`/common-stories/${storyId}`, storyData);
    return response.data;
  }

  async deleteStory(storyId: string) {
    const response = await api.delete(`/common-stories/${storyId}`);
    return response.data;
  }
}

export const commonStoryService = new CommonStoryService(); 