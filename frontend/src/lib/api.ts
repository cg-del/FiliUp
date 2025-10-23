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
      const originalRequest = error.config;
      
      // Only handle if this is not a retry request and not already logging out
      if (!originalRequest._retry && !originalRequest._isLogout) {
        // If this is a page load request (not an API call), redirect to login
        if (window.location.pathname !== '/login') {
          // Clear auth data
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          
          // Store the current URL to redirect back after login
          const returnUrl = window.location.pathname + window.location.search;
          sessionStorage.setItem('returnUrl', returnUrl);
          
          // Redirect to login with a flag to show session expired message
          window.location.href = '/login?sessionExpired=true';
          return Promise.reject(error);
        }
        
        // For API calls, show the session expired modal
        showSessionExpiredModal();
      }
    }
    return Promise.reject(error);
  }
);

// Function to show session expired modal
function showSessionExpiredModal() {
  // Check if modal already exists
  if (document.getElementById('session-expired-modal')) return;

  // Create modal container
  const modal = document.createElement('div');
  modal.id = 'session-expired-modal';
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
  
  // Modal content
  modal.innerHTML = `
    <div class="bg-background rounded-lg p-6 max-w-md w-full mx-auto shadow-xl">
      <div class="flex items-center gap-3 mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="text-lg font-semibold">Session Expired</h3>
      </div>
      <p class="text-muted-foreground mb-6">Your session has ended. Please log in again to continue.</p>
      <div class="flex justify-end gap-3">
        <button id="logout-btn" class="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
          Back to Login
        </button>
      </div>
    </div>
  `;

  // Add to body
  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden'; // Prevent scrolling

  // Add click handler for logout button
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.onclick = () => {
      // Clear auth data
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      // Remove modal and redirect to login
      document.body.removeChild(modal);
      document.body.style.overflow = '';
      window.location.href = '/';
    };
  }
}

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
  section?: string | null;  // Changed from sectionId to section to match backend
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
    activitiesCompleted: number;
    currentRank: number;
    currentPhase: string;
  };
  phases: Phase[];
}

export interface Phase {
  id: string;
  title: string;
  description: string;
  orderIndex: number;
  isUnlocked: boolean;
  totalActivitiesCount: number;
  completedActivitiesCount: number;
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
  isUnlocked: boolean;
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

  getUsers: async (page = 0, size = 10, role?: string, search?: string) => {
    const params = new URLSearchParams({ 
      page: page.toString(), 
      size: size.toString(),
      sort: 'created_at,desc'  // Sort by created_at in descending order
    });
    if (role) params.append('role', role);
    if (search && search.trim()) params.append('search', search.trim());
    const response = await api.get(`/admin/users?${params}`);
    return response.data;
  },

  createUser: async (data: CreateUserRequest) => {
    // Create a clean copy of the data
    const { section, ...restData } = data;
    const requestData: any = { ...restData };
    
    // Handle section - only include if it's a valid UUID
    if (section !== undefined) {
      if (section && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(section)) {
        requestData.section = section.toLowerCase();
      } else if (section === '') {
        // If section is an empty string, set it to null
        requestData.section = null;
      } else {
        console.warn('Invalid section format, removing from request:', section);
      }
    }
    
    console.log('Creating user with data:', JSON.stringify(requestData, null, 2));
    const response = await api.post('/admin/users', requestData);
    return response.data;
  },

  updateUser: async (id: string, data: Partial<CreateUserRequest>) => {
    // Create a clean copy of the data
    const { section, ...restData } = data;
    
    // Create a new object with the correct field names
    const requestData: any = { ...restData };
    
    // Handle section - use the value from the original data
    if (section !== undefined) {
      if (section && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(section)) {
        requestData.section = section.toLowerCase();
      } else if (section === '') {
        // If section is an empty string, set it to null to clear the section
        requestData.section = null;
      }
    }
    
    // Remove password if it's empty or undefined
    if (requestData.password === '' || requestData.password === undefined) {
      delete requestData.password;
    }
    
    return api.put(`/admin/users/${id}`, requestData);
  },

  deleteUser: async (id: string) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },

  activateUser: async (id: string) => {
    const response = await api.post(`/admin/users/${id}/activate`);
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
