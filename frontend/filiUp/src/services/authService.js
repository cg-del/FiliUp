import api from './api';

const authService = {
  login: async (credentials) => {
    const response = await api.post('/user/login', credentials);
    if (response.data && response.data.data) {
      const { accessToken, refreshToken } = response.data.data;
      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
      }
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
    }
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/user/register', userData);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  getCurrentUser: async () => {
    const response = await api.get('/user/info');
    if (response.data && response.data.data) {
      localStorage.setItem('user', JSON.stringify(response.data.data));
    }
    return response.data;
  },

  verifyUser: async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return null;

      const response = await api.post('/user/verify', { token });
      if (response.data && response.data.data) {
        localStorage.setItem('user', JSON.stringify(response.data.data));
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  },

  forgotPassword: async (email) => {
    const response = await api.post('/user/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token, newPassword) => {
    const response = await api.post('/user/reset-password', { token, newPassword });
    return response.data;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('accessToken');
  }
};

export default authService; 