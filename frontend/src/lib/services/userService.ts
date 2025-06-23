import { UserApiClient } from './apiClients';
import type { User, LoginCredentials, RegisterData } from './types';

const userApiClient = new UserApiClient();

export const userService = {
  login: async (credentials: LoginCredentials) => {
    return userApiClient.login(credentials);
  },

  register: async (userName: string, userEmail: string, userPassword: string) => {
    const data: RegisterData = {
      userName,
      userEmail,
      userPassword
    };
    return userApiClient.register(data);
  },

  getCurrentUser: async () => {
    return userApiClient.getProfile();
  },

  updateUser: async (data: Partial<User>) => {
    return userApiClient.updateProfile(data);
  },

  deleteUser: async (userId: string) => {
    return userApiClient.delete(`/users/${userId}`);
  },

  getAllUsers: async () => {
    return userApiClient.get<User[]>('/users');
  },

  changePassword: async ({ userId, newPassword }: { userId: string; newPassword: string }) => {
    return userApiClient.post('/user/change-password', { userId, newPassword });
  },
}; 