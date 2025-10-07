import axios from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT';
}

export interface PasswordResetRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface CreateUserRequest {
  email: string;
  fullName: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT';
  password: string;
  section?: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: 'ADMIN' | 'TEACHER' | 'STUDENT';
    sectionId: string | null;
    isActive: boolean;
    firstLogin?: boolean;
  };
}

export interface CreateSectionRequest {
  name: string;
  gradeLevel: string;
  capacity: number;
}

export interface SectionResponse {
  id: string;
  name: string;
  gradeLevel: string;
  inviteCode: string;
  studentCount: number;
  activeStudents: number;
  averageProgress: number;
}

export interface RegisterSectionRequest {
  registrationCode: string;
}

export interface SubmitActivityRequest {
  answers: (string | number | string[])[];
  timeSpentSeconds: number;
}

export interface ActivitySubmissionResponse {
  score: number;
  percentage: number;
  isCompleted: boolean;
  correctAnswers: number;
  totalQuestions: number;
  nextActivity?: {
    id: string;
    type: string;
  };
}

// Student Dashboard Response Types
export interface StudentDashboardResponse {
  student: {
    id: string;
    name: string;
    email: string;
    sectionName: string;
  };
  stats: {
    completedLessons: number;
    totalScore: number;
    currentLevel: string;
    studyDays: number;
  };
  phases: Phase[];
}

export interface Phase {
  id: string;
  title: string;
  description: string;
  orderIndex: number;
  lessons: LessonSummary[];
}

export interface LessonSummary {
  id: string;
  title: string;
  description: string;
  orderIndex: number;
  colorClass: string;
  totalActivities: number;
  isCompleted: boolean;
  activitiesUnlocked: boolean;
  progressPercentage: number;
  completedActivitiesCount: number;
  activities: ActivityProgress[];
}

export interface ActivityProgress {
  id: string;
  activityType: 'MULTIPLE_CHOICE' | 'DRAG_DROP' | 'MATCHING_PAIRS' | 'STORY_COMPREHENSION';
  title: string;
  orderIndex: number;
  status: 'locked' | 'unlocked' | 'completed';
  score: number | null;
  percentage: number | null;
  isUnlocked: boolean;
  isCompleted: boolean;
}

// Lesson Content Response Types
export interface LessonContentResponse {
  id: string;
  title: string;
  description: string;
  phase: string;
  slides: LessonSlide[];
}

export interface LessonSlide {
  id: string;
  title: string;
  content: string[];
  orderIndex: number;
}

// Activity Content Response Types
export interface ActivityContentResponse {
  id: string;
  activityType: 'MULTIPLE_CHOICE' | 'DRAG_DROP' | 'MATCHING_PAIRS' | 'STORY_COMPREHENSION';
  title: string;
  instructions: string;
  storyText?: string | null;
  orderIndex: number;
  passingPercentage: number;
  questions?: MultipleChoiceQuestion[];
  dragDropItems?: DragDropItem[] | null;
  dragDropCategories?: DragDropCategory[] | null;
  matchingPairs?: MatchingPair[] | null;
}

export interface MultipleChoiceContent {
  questions: MultipleChoiceQuestion[];
}

export interface MultipleChoiceQuestion {
  id: string;
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  orderIndex: number;
}

export interface DragDropContent {
  items: DragDropItem[];
  categories: DragDropCategory[];
}

export interface MatchingPair {
  id: string;
  leftText: string;
  rightText: string;
  orderIndex: number;
}

export interface DragDropItem {
  id: string;
  text: string;
  category: string;
}

export interface DragDropCategory {
  id: string;
  name: string;
  color: string;
}

export interface MatchingPairsContent {
  pairs: MatchingPair[];
}

export interface MatchingPair {
  id: string;
  left: string;
  right: string;
}

export interface StoryComprehensionContent {
  story: string;
  questions: MultipleChoiceQuestion[];
}

// Leaderboard Types (matching existing backend DTOs)
export interface StudentRankingResponse {
  id: string;
  name: string;
  totalScore: number;
  lessonsCompleted: number;
  activitiesCompleted: number;
  averageScore: number;
  rank: number;
}

export interface StudentProfileResponse {
  student: {
    id: string;
    name: string;
    email: string;
    sectionName: string;
    joinDate: string;
  };
  stats: {
    totalScore: number;
    lessonsCompleted: number;
    totalLessons: number;
    currentPhase: string;
  };
  achievements: {
    id: string;
    name: string;
    icon: string;
    earned: boolean;
  }[];
  recentActivity: {
    lesson: string;
    score: number;
    date: string;
  }[];
}

export interface SectionLeaderboardResponse {
  sectionId: string;
  sectionName: string;
  gradeLevel: string;
  students: StudentRankingResponse[];
}

// Auth API
export const authAPI = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  resetPassword: async (data: PasswordResetRequest) => {
    const response = await api.post('/auth/reset-password', data);
    return response.data;
  },
  // Mark first-login flow as completed on server (teacher)
  completeFirstLogin: async () => {
    const response = await api.post('/auth/first-login-complete');
    return response.data;
  },
};

// Admin API
export const adminAPI = {
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  getUsers: async (page = 0, size = 10, role?: string) => {
    const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
    if (role) params.append('role', role);
    const response = await api.get(`/admin/users?${params}`);
    return response.data;
  },

  createUser: async (data: CreateUserRequest) => {
    const response = await api.post('/admin/users', data);
    return response.data;
  },

  updateUser: async (id: string, data: Partial<CreateUserRequest>) => {
    const response = await api.put(`/admin/users/${id}`, data);
    return response.data;
  },

  deleteUser: async (id: string) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },

  // Content Management APIs
  // Phases
  getPhases: async () => {
    const response = await api.get('/admin/phases');
    return response.data;
  },

  createPhase: async (data: { title: string; description: string; orderIndex: number }) => {
    const response = await api.post('/admin/phases', data);
    return response.data;
  },

  updatePhase: async (id: string, data: { title: string; description: string; orderIndex: number }) => {
    const response = await api.put(`/admin/phases/${id}`, data);
    return response.data;
  },

  deletePhase: async (id: string) => {
    const response = await api.delete(`/admin/phases/${id}`);
    return response.data;
  },

  // Lessons
  getLessons: async () => {
    const response = await api.get('/admin/lessons');
    return response.data;
  },

  getLesson: async (id: string) => {
    const response = await api.get(`/admin/lessons/${id}`);
    return response.data;
  },

  getLessonsByPhase: async (phaseId: string) => {
    const response = await api.get(`/admin/lessons/phase/${phaseId}`);
    return response.data;
  },

  createLesson: async (data: {
    phaseId: string;
    title: string;
    description: string;
    orderIndex: number;
    slides: { title: string; content: string[]; orderIndex: number }[];
  }) => {
    const response = await api.post('/admin/lessons', data);
    return response.data;
  },

  updateLesson: async (id: string, data: {
    phaseId: string;
    title: string;
    description: string;
    orderIndex: number;
    slides: { title: string; content: string[]; orderIndex: number }[];
  }) => {
    const response = await api.put(`/admin/lessons/${id}`, data);
    return response.data;
  },

  deleteLesson: async (id: string) => {
    const response = await api.delete(`/admin/lessons/${id}`);
    return response.data;
  },

  // Activities
  getActivities: async () => {
    const response = await api.get('/admin/activities');
    return response.data;
  },

  getActivity: async (id: string) => {
    const response = await api.get(`/admin/activities/${id}`);
    return response.data;
  },

  getActivitiesByLesson: async (lessonId: string) => {
    const response = await api.get(`/admin/activities/lesson/${lessonId}`);
    return response.data;
  },

  createActivity: async (data: {
    lessonId: string;
    activityType: 'MULTIPLE_CHOICE' | 'DRAG_DROP' | 'MATCHING_PAIRS' | 'STORY_COMPREHENSION';
    title: string;
    instructions: string;
    storyText?: string;
    orderIndex: number;
    passingPercentage: number;
    content: {
      questions?: { questionText: string; options: string[]; correctAnswerIndex: number; explanation: string; orderIndex: number }[];
      categories?: { categoryId: string; name: string; colorClass: string; orderIndex: number }[];
      items?: { text: string; correctCategory: string; orderIndex: number }[];
      pairs?: { leftText: string; rightText: string; orderIndex: number }[];
    };
  }) => {
    const response = await api.post('/admin/activities', data);
    return response.data;
  },

  updateActivity: async (id: string, data: {
    lessonId: string;
    activityType: 'MULTIPLE_CHOICE' | 'DRAG_DROP' | 'MATCHING_PAIRS' | 'STORY_COMPREHENSION';
    title: string;
    instructions: string;
    storyText?: string;
    orderIndex: number;
    passingPercentage: number;
    content: {
      questions?: { questionText: string; options: string[]; correctAnswerIndex: number; explanation: string; orderIndex: number }[];
      categories?: { categoryId: string; name: string; colorClass: string; orderIndex: number }[];
      items?: { text: string; correctCategory: string; orderIndex: number }[];
      pairs?: { leftText: string; rightText: string; orderIndex: number }[];
    };
  }) => {
    const response = await api.put(`/admin/activities/${id}`, data);
    return response.data;
  },

  deleteActivity: async (id: string) => {
    const response = await api.delete(`/admin/activities/${id}`);
    return response.data;
  },
};

// Teacher API
export const teacherAPI = {
  getSections: async (): Promise<SectionResponse[]> => {
    const response = await api.get('/teacher/sections');
    return response.data;
  },

  createSection: async (data: CreateSectionRequest): Promise<SectionResponse> => {
    const response = await api.post('/teacher/sections', data);
    return response.data;
  },

  getSectionDetails: async (id: string): Promise<SectionResponse> => {
    const response = await api.get(`/teacher/sections/${id}`);
    return response.data;
  },

  // Leaderboard API
  getSectionLeaderboard: async (sectionId: string): Promise<SectionLeaderboardResponse> => {
    const response = await api.get(`/teacher/sections/${sectionId}/leaderboard`);
    return response.data;
  },

  getAllSectionsLeaderboard: async (): Promise<SectionLeaderboardResponse[]> => {
    const response = await api.get('/teacher/leaderboard/all-sections');
    return response.data;
  },

  getLeaderboardAnalytics: async (sectionId?: string) => {
    const url = sectionId ? `/teacher/leaderboard/analytics?sectionId=${sectionId}` : '/teacher/leaderboard/analytics';
    const response = await api.get(url);
    return response.data;
  },
};

// Student API
export const studentAPI = {
  registerToSection: async (data: RegisterSectionRequest) => {
    const response = await api.post('/student/register-section', data);
    return response.data;
  },

  // Dashboard API
  getDashboard: async (): Promise<StudentDashboardResponse> => {
    const response = await api.get('/student/dashboard');
    return response.data;
  },

  // Lessons API
  getLessons: async () => {
    const response = await api.get('/student/lessons');
    return response.data;
  },

  getLessonContent: async (id: string) => {
    const response = await api.get(`/student/lessons/${id}`);
    return response.data;
  },

  getLessonContentStructured: async (id: string): Promise<LessonContentResponse> => {
    const response = await api.get(`/student/lessons/${id}/content`);
    return response.data;
  },

  completeLesson: async (id: string) => {
    const response = await api.post(`/student/lessons/${id}/complete`);
    return response.data;
  },

  // Activities API
  getActivityContent: async (id: string) => {
    const response = await api.get(`/student/activities/${id}`);
    return response.data;
  },

  getActivityContentStructured: async (id: string): Promise<ActivityContentResponse> => {
    const response = await api.get(`/student/activities/${id}/content`);
    return response.data;
  },

  submitActivity: async (id: string, data: SubmitActivityRequest): Promise<ActivitySubmissionResponse> => {
    const response = await api.post(`/student/activities/${id}/submit`, data);
    return response.data;
  },

  // Leaderboard API
  getLeaderboard: async (): Promise<SectionLeaderboardResponse> => {
    const response = await api.get('/student/leaderboard');
    return response.data;
  },

  getMyRank: async () => {
    const response = await api.get('/student/leaderboard/my-rank');
    return response.data;
  },

  // Profile API
  getProfile: async (): Promise<StudentProfileResponse> => {
    const response = await api.get('/student/profile');
    return response.data;
  },
};

export default api;

// Helper function to map activity type from backend to frontend
export const mapActivityType = (backendType: string): 'multiple-choice' | 'drag-drop' | 'matching-pairs' | 'story-comprehension' => {
  switch (backendType) {
    case 'MULTIPLE_CHOICE':
      return 'multiple-choice';
    case 'DRAG_DROP':
      return 'drag-drop';
    case 'MATCHING_PAIRS':
      return 'matching-pairs';
    case 'STORY_COMPREHENSION':
      return 'story-comprehension';
    default:
      return 'multiple-choice';
  }
};

// Helper function to map activity type from frontend to backend
export const mapActivityTypeToBackend = (frontendType: 'multiple-choice' | 'drag-drop' | 'matching-pairs' | 'story-comprehension'): string => {
  switch (frontendType) {
    case 'multiple-choice':
      return 'MULTIPLE_CHOICE';
    case 'drag-drop':
      return 'DRAG_DROP';
    case 'matching-pairs':
      return 'MATCHING_PAIRS';
    case 'story-comprehension':
      return 'STORY_COMPREHENSION';
    default:
      return 'MULTIPLE_CHOICE';
  }
};
