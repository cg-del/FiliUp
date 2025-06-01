import api from './api';

const fileService = {
  uploadFile: async (formData, onUploadProgress) => {
    const response = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onUploadProgress(percentCompleted);
        }
      },
    });
    return response.data;
  },

  getFiles: async (params) => {
    const response = await api.get('/files', { params });
    return response.data;
  },

  getFileById: async (fileId) => {
    const response = await api.get(`/files/${fileId}`);
    return response.data;
  },

  deleteFile: async (fileId) => {
    const response = await api.delete(`/files/${fileId}`);
    return response.data;
  },

  downloadFile: async (fileId) => {
    const response = await api.get(`/files/${fileId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  shareFile: async (fileId, shareData) => {
    const response = await api.post(`/files/${fileId}/share`, shareData);
    return response.data;
  },

  updateFileDetails: async (fileId, fileData) => {
    const response = await api.put(`/files/${fileId}`, fileData);
    return response.data;
  },
};

export default fileService; 