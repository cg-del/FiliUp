// Common types
export interface PaginationParams {
  page?: number;
  size?: number;
  sort?: string[];
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

// User types
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
}

export interface Student {
  id: string;
  user: User;
  studentProfile?: StudentProfile;
}

export interface LoginCredentials {
  userName: string;
  userPassword: string;
}

export interface RegisterData {
  userName: string;
  userPassword: string;
  userEmail: string;
}

// Story types
export interface Story {
  id: string;
  title: string;
  content: string;
  difficulty: string;
  createdAt: string;
  updatedAt: string;
}

// Quiz types
export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
}

// Class types
export interface Class {
  classId: string;
  className: string;
  description: string;
  classCode: string;
  createdAt: string;
  isActive: boolean;
  students?: any[]; // Optional since it might not always be included
}

// Profile types
export interface StudentProfile {
  id: string;
  userId: string;
  grade: string;
  readingLevel: string;
}

export interface TeacherProfile {
  id: string;
  userId: string;
  subjects: string[];
  yearsOfExperience: number;
}

// Progress types
export interface Progress {
  id: string;
  studentId: string;
  storyId: string;
  quizId: string;
  score: number;
  completedAt: string;
}

// Reward types
export interface Reward {
  id: string;
  name: string;
  description: string;
  points: number;
}

// Leaderboard types
export interface LeaderboardEntry {
  studentId: string;
  username: string;
  points: number;
  rank: number;
}
