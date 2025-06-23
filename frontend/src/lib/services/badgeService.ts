import { api } from '../api';
import type { BadgeDTO, StudentBadgeStatsDTO } from './types';

export interface StudentBadgeDTO {
  studentBadgeId: string;
  studentId: string;
  badgeId: string;
  badgeEarnedAt: string;
  performanceScore?: number;
  sourceType?: string;
  sourceId?: string;
  badge: BadgeDTO;
}

export interface BadgeLeaderboardEntry {
  studentId: string;
  studentName: string;
  studentEmail: string;
  totalBadges: number;
  totalPoints: number;
  rank: number;
}

export const badgeService = {
  // Get current student's earned badges
  getMyBadges: async (): Promise<StudentBadgeDTO[] | null> => {
    try {
      const response = await api.get('/badges/my-badges');
      return response.data && response.data.length > 0 ? response.data : null;
    } catch (error) {
      console.error('Error fetching my badges:', error);
      return null;
    }
  },

  // Get current student's badge statistics
  getMyBadgeStats: async (): Promise<StudentBadgeStatsDTO | null> => {
    try {
      const response = await api.get('/badges/my-stats');
      return response.data || null;
    } catch (error) {
      console.error('Error fetching my badge stats:', error);
      return null;
    }
  },

  // Get specific student's badges (for teachers/admin)
  getStudentBadges: async (studentId: string): Promise<StudentBadgeDTO[] | null> => {
    try {
      const response = await api.get(`/badges/student/${studentId}`);
      return response.data && response.data.length > 0 ? response.data : null;
    } catch (error) {
      console.error('Error fetching student badges:', error);
      return null;
    }
  },

  // Get specific student's badge statistics
  getStudentBadgeStats: async (studentId: string): Promise<StudentBadgeStatsDTO | null> => {
    try {
      const response = await api.get(`/badges/student/${studentId}/stats`);
      return response.data || null;
    } catch (error) {
      console.error('Error fetching student badge stats:', error);
      return null;
    }
  },

  // Get recent badges for current student
  getMyRecentBadges: async (limit: number = 5): Promise<StudentBadgeDTO[] | null> => {
    try {
      const response = await api.get(`/badges/my-badges/recent?limit=${limit}`);
      return response.data && response.data.length > 0 ? response.data : null;
    } catch (error) {
      console.error('Error fetching my recent badges:', error);
      return null;
    }
  },

  // Get class badge leaderboard
  getClassBadgeLeaderboard: async (): Promise<BadgeLeaderboardEntry[] | null> => {
    try {
      const response = await api.get('/badges/class/leaderboard');
      return response.data && response.data.length > 0 ? response.data : null;
    } catch (error) {
      console.error('Error fetching class badge leaderboard:', error);
      return null;
    }
  },

  // Get all available badges
  getAllBadges: async (): Promise<BadgeDTO[] | null> => {
    try {
      const response = await api.get('/badges');
      return response.data && response.data.length > 0 ? response.data : null;
    } catch (error) {
      console.error('Error fetching all badges:', error);
      
      // If badges don't exist, try to initialize them automatically
      try {
        console.log('Attempting to initialize system badges...');
        const initResponse = await api.post('/badges/initialize');
        if (initResponse) {
          console.log('System badges initialized successfully, retrying...');
          // Retry getting badges after initialization
          const retryResponse = await api.get('/badges');
          return retryResponse.data && retryResponse.data.length > 0 ? retryResponse.data : null;
        }
      } catch (initError) {
        console.error('Failed to initialize badges:', initError);
      }
      
      return null;
    }
  },

  // Initialize system badges
  initializeSystemBadges: async (): Promise<boolean> => {
    try {
      const response = await api.post('/badges/initialize');
      return true;
    } catch (error) {
      console.error('Error initializing system badges:', error);
      return false;
    }
  }
}; 