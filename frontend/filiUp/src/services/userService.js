import api from './api';

const userService = {
  // User management endpoints (Admin)
  createUser: async (userData) => {
    const response = await api.post('/user/postUser', userData);
    return response.data;
  },

  getAllUsers: async () => {
    const response = await api.get('/user/getAllUser');
    return response.data;
  },

  updateUser: async (id, userData) => {
    const response = await api.put(`/user/putUser?id=${id}`, userData);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/user/deleteUser/${id}`);
    return response.data;
  },

  // Authentication endpoints
  signup: async (userData) => {
    const response = await api.post('/user/signup', userData);
    return response.data;
  },

  // User profile endpoints
  getUserInfo: async () => {
    const response = await api.get('/user/info');
    return response.data;
  },

  // Token management
  refreshToken: async (refreshToken) => {
    const response = await api.post('/user/refresh', { refreshToken });
    return response.data;
  },

  verifyToken: async (token) => {
    const response = await api.post('/user/verify', { token });
    return response.data;
  },

  // Hello endpoint (test authentication)
  hello: async () => {
    const response = await api.get('/user/hello');
    return response.data;
  },

  // Student search (for Teachers and Admins)
  searchStudentsByName: async (name) => {
    const response = await api.get(`/user/search?name=${encodeURIComponent(name)}`);
    return response.data;
  },

  // Get users sorted by role (for Teachers and Admins)
  getUsersSortedByRole: async () => {
    const response = await api.get('/user/sorted-by-role');
    return response.data;
  },

  // Profile picture upload (if implemented in the backend)
  uploadProfilePicture: async (formData) => {
    const response = await api.post('/user/profile-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getUserProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  updateUserProfile: async (profileData) => {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  },

  updatePassword: async (passwordData) => {
    const response = await api.put('/users/password', passwordData);
    return response.data;
  },

  getUsers: async (params) => {
    const response = await api.get('/users', { params });
    return response.data;
  },
};

export default userService; 