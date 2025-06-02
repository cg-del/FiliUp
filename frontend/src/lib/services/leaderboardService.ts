import { api } from '../api';
import type { ApiResponse, LeaderboardEntry } from './types';

export const leaderboardService = {
  getGlobalLeaderboard: async (): Promise<ApiResponse<LeaderboardEntry[]>> => {
    const response = await api.get('/leaderboard/global');
    return response.data;
  },

  getClassLeaderboard: async (classId: string): Promise<ApiResponse<LeaderboardEntry[]>> => {
    const response = await api.get(`/leaderboard/class/${classId}`);
    return response.data;
  },

  getStudentRank: async (studentId: string): Promise<ApiResponse<LeaderboardEntry>> => {
    const response = await api.get(`/leaderboard/student/${studentId}`);
    return response.data;
  },

  getTopPerformers: async (limit: number = 10): Promise<ApiResponse<LeaderboardEntry[]>> => {
    const response = await api.get(`/leaderboard/top/${limit}`);
    return response.data;
  },

  getWeeklyLeaderboard: async (): Promise<ApiResponse<LeaderboardEntry[]>> => {
    const response = await api.get('/leaderboard/weekly');
    return response.data;
  },

  getMonthlyLeaderboard: async (): Promise<ApiResponse<LeaderboardEntry[]>> => {
    const response = await api.get('/leaderboard/monthly');
    return response.data;
  },
}; 