import { api } from '../api';
import type { ApiResponse, Quiz, Question } from './types';

interface CreateQuizRequestData {
  title: string;
  description: string;
  category: string;
  timeLimitMinutes: number;
  opensAt: string;
  closesAt: string;
  isActive: boolean;
  storyId: string;
  questions: {
    questionText: string;
    options: string[];
    correctAnswer: string;
    points: number;
  }[];
}

interface CreateQuizResponse {
  id: string;
  title: string;
  description: string;
  category: string;
  timeLimitMinutes: number;
  opensAt: string;
  closesAt: string;
  isActive: boolean;
  createdAt: string;
}

export const quizService = {
  getAllQuizzes: async (): Promise<ApiResponse<Quiz[]>> => {
    const response = await api.get('/quizzes');
    return response.data;
  },

  getQuizById: async (id: string): Promise<ApiResponse<Quiz>> => {
    const response = await api.get(`/quizzes/${id}`);
    return response.data;
  },

  createQuiz: async (data: Omit<Quiz, 'id'>): Promise<ApiResponse<Quiz>> => {
    const response = await api.post('/quizzes', data);
    return response.data;
  },

  // Method for creating quiz for a specific story
  createQuizForStory: async (data: CreateQuizRequestData): Promise<CreateQuizResponse> => {
    const response = await api.post('/v1/quizzes', data);
    return response.data;
  },

  updateQuiz: async (id: string, data: Partial<Quiz>): Promise<ApiResponse<Quiz>> => {
    const response = await api.put(`/quizzes/${id}`, data);
    return response.data;
  },

  deleteQuiz: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/quizzes/${id}`);
    return response.data;
  },

  // Question Bank endpoints
  getAllQuestions: async (): Promise<ApiResponse<Question[]>> => {
    const response = await api.get('/questions');
    return response.data;
  },

  getQuestionById: async (id: string): Promise<ApiResponse<Question>> => {
    const response = await api.get(`/questions/${id}`);
    return response.data;
  },

  createQuestion: async (data: Omit<Question, 'id'>): Promise<ApiResponse<Question>> => {
    const response = await api.post('/questions', data);
    return response.data;
  },

  updateQuestion: async (id: string, data: Partial<Question>): Promise<ApiResponse<Question>> => {
    const response = await api.put(`/questions/${id}`, data);
    return response.data;
  },

  deleteQuestion: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/questions/${id}`);
    return response.data;
  },
}; 