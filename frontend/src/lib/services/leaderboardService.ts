import { api } from '../api';
import type { ApiResponse, LeaderboardEntry } from './types';

export const leaderboardService = {
  getGlobalLeaderboard: async (): Promise<ApiResponse<LeaderboardEntry[]>> => {
    const response = await api.get('/leaderboard/global');
    return response.data;
  },

  getClassLeaderboard: async (classId: string): Promise<ApiResponse<LeaderboardEntry[]>> => {
    console.log('LeaderboardService: Fetching leaderboard for classId:', classId);
    try {
      // Try the v1 endpoint first
      const response = await api.get(`/v1/leaderboard/class/${classId}`);
      console.log('LeaderboardService: Response from v1 endpoint:', response.data);
      return response.data;
    } catch (error) {
      console.log('LeaderboardService: Error with v1 endpoint, trying legacy endpoint');
      // Fall back to the original endpoint
      const response = await api.get(`/leaderboard/class/${classId}`);
      console.log('LeaderboardService: Response from legacy endpoint:', response.data);
      return response.data;
    }
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

  // New endpoint for students to view their classmates' leaderboards
  getStudentClassmateLeaderboards: async (
    category: string = 'CLASS_QUIZ_PERFORMANCE',
    timeFrame: string = 'ALL_TIME'
  ): Promise<ApiResponse<LeaderboardEntry[]>> => {
    const response = await api.get(`/leaderboard/student/classmates`, {
      params: { category, timeFrame }
    });
    return response.data;
  },
}; 