import { BaseApiClient } from './baseApiClient';
import { API_BASE_URL, API_ENDPOINTS } from './config';
import { User, LoginCredentials, RegisterData } from '../types';

export class UserApiClient extends BaseApiClient {
  constructor() {
    super(API_BASE_URL);
  }

  async login(credentials: LoginCredentials): Promise<{ data: { accessToken: string; refreshToken: string } }> {
    return this.post(API_ENDPOINTS.LOGIN, credentials);
  }

  async register(data: RegisterData): Promise<{ token: string; user: User }> {
    return this.post(API_ENDPOINTS.REGISTER, data);
  }

  async getProfile(): Promise<User> {
    return this.get(API_ENDPOINTS.USER_PROFILE);
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    return this.put(API_ENDPOINTS.UPDATE_PROFILE, data);
  }
}
