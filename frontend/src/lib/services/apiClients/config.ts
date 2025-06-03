// In Next.js, we need to use NEXT_PUBLIC_ prefix for client-side env variables
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/user/login',
  REGISTER: '/user/signup',
  
  // User
  USER_PROFILE: '/users/profile',
  UPDATE_PROFILE: '/users/profile',
  
  // Class
  CLASSES: '/classes',
  CLASS_DETAILS: (id: string) => `/classes/${id}`,
  JOIN_CLASS: (id: string) => `/classes/${id}/join`,
  
  // Quiz
  QUIZZES: '/quizzes',
  QUIZ_DETAILS: (id: string) => `/quizzes/${id}`,
  SUBMIT_QUIZ: (id: string) => `/quizzes/${id}/submit`,
  
  // Progress
  PROGRESS: '/progress',
  USER_PROGRESS: (userId: string) => `/progress/user/${userId}`,
  
  // Leaderboard
  LEADERBOARD: '/leaderboard',
  CLASS_LEADERBOARD: (classId: string) => `/leaderboard/class/${classId}`,
  
  // Rewards
  REWARDS: '/rewards',
  CLAIM_REWARD: (id: string) => `/rewards/${id}/claim`,
  
  // Story
  STORIES: '/stories',
  STORY_DETAILS: (id: string) => `/stories/${id}`,
  
  // Profile
  ACHIEVEMENTS: '/profile/achievements',
  STATISTICS: '/profile/statistics',
} as const; 