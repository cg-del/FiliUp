import { api } from '@/lib/api';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

interface Question {
  id: string;
  text: string;
  options: string[];
  correct: number;
  explanation: string;
}

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

export interface QuizQuestion {
  questionId: string;
  questionText: string;
  options: string[];
  correctAnswer?: string; // Optional since students shouldn't see this
  points: number;
}

export interface QuizData {
  quizId: string;
  title: string;
  description: string;
  category: string;
  timeLimitMinutes: number;
  opensAt: string;
  closesAt: string;
  storyId: string;
  storyTitle: string;
  createdById: string;
  createdByName: string;
  questions: QuizQuestion[];
  createdAt: string;
  isActive: boolean;
}

export interface QuizAttempt {
  attemptId: string;
  quizId: string;
  quizTitle: string;
  studentId: string;
  studentName: string;
  startedAt: string;
  expiresAt?: string;
  completedAt?: string;
  score?: number;
  maxPossibleScore: number;
  timeTakenMinutes?: number;
  isCompleted: boolean;
  responses?: QuestionResponse[];
  currentAnswers?: Record<string, string>; // Plain object from JSON, not Map
  currentQuestionIndex?: number;
  logs?: QuizLogEntry[]; // Add logs to the interface
}

export interface QuestionResponse {
  questionId: string;
  questionText: string;
  selectedAnswer: string;
  isCorrect: boolean;
  pointsEarned: number;
  possiblePoints: number;
}

export interface QuizSubmission {
  quizId: string;
  answers: QuestionAnswer[];
  timeTakenMinutes: number;
}

export interface QuestionAnswer {
  questionId: string;
  selectedAnswer: string;
}

// New interface for saving quiz progress
export interface QuizProgressSave {
  attemptId: string;
  currentAnswers: QuestionAnswer[];
  currentQuestionIndex: number;
}

// New interface for checking quiz eligibility
export interface QuizEligibilityResponse {
  canAttempt: boolean;
  reason?: string;
  existingAttempt?: QuizAttempt;
  hasCompletedAttempt: boolean;
  hasInProgressAttempt: boolean;
}

export interface QuizSubmissionResult {
  attemptId: string;
  quizId: string;
  quizTitle: string;
  score: number;
  scorePercentage: number;
  maxPossibleScore: number;
  correctAnswers: number;
  totalQuestions: number;
  questionResults: QuestionResult[];
  feedback: string;
  performanceLevel: string;
}

export interface QuestionResult {
  questionId: string;
  questionText: string;
  selectedAnswer: string;
  isCorrect: boolean;
  pointsEarned: number;
  possiblePoints: number;
  explanation: string;
}

// Quiz logging interfaces
export interface QuizLogEntry {
  timestamp: string;
  action: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  questionIndex?: number;
}

export interface QuizLog {
  attemptId: string;
  logEntries: QuizLogEntry[];
}

export interface ClassRecordMatrix {
  students: StudentRecord[];
  quizTitles: string[];
  classInfo: Record<string, string>; // classId -> className
  quizMetadata: Record<string, QuizMetadata>; // quizTitle -> quiz metadata
}

export interface StudentRecord {
  studentId: string;
  studentName: string;
  quizScores: Record<string, ScoreInfo>; // quizTitle -> score info
}

export interface ScoreInfo {
  score: number | null;
  maxScore: number;
  percentage: number;
  storyTitle: string;
  storyId: string;
  classId: string;
  className: string;
}

export interface QuizMetadata {
  quizTitle: string;
  storyTitle: string;
  storyId: string;
  classId: string;
  className: string;
}

export const quizService = {
  getAllQuizzes: async (): Promise<ApiResponse<QuizData[]>> => {
    const response = await api.get('/quizzes');
    return response.data;
  },

  getQuizById: async (id: string): Promise<ApiResponse<QuizData>> => {
    const response = await api.get(`/quizzes/${id}`);
    return response.data;
  },

  createQuiz: async (data: Omit<QuizData, 'id'>): Promise<ApiResponse<QuizData>> => {
    const response = await api.post('/quizzes', data);
    return response.data;
  },

  // Method for creating quiz for a specific story
  createQuizForStory: async (data: CreateQuizRequestData): Promise<CreateQuizResponse> => {
    const response = await api.post('/v1/quizzes', data);
    return response.data;
  },

  updateQuiz: async (id: string, data: Partial<QuizData>): Promise<ApiResponse<QuizData>> => {
    const response = await api.put(`/v1/quizzes/${id}`, data);
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

  // Get quiz for student (without correct answers)
  async getQuizForStudent(quizId: string): Promise<QuizData> {
    const response = await api.get(`/v1/quizzes/student/${quizId}`);
    return response.data;
  },

  // Get quiz details with correct answers (admin/teacher only)
  async getQuizDetailsWithCorrectAnswers(quizId: string): Promise<QuizData> {
    const response = await api.get(`/v1/quizzes/${quizId}/details`);
    return response.data;
  },

  // Start a quiz attempt
  async startQuizAttempt(quizId: string): Promise<QuizAttempt> {
    const response = await api.post(`/v1/quizzes/attempts/start/${quizId}`);
    return response.data;
  },

  // Submit quiz attempt with scoring
  async submitQuizAttempt(attemptId: string, submission: QuizSubmission): Promise<QuizSubmissionResult> {
    const response = await api.post(`/v1/quizzes/attempts/submit-and-score/${attemptId}`, submission);
    return response.data;
  },

  // Get quiz attempt by ID
  async getQuizAttemptById(attemptId: string): Promise<QuizAttempt> {
    const response = await api.get(`/v1/quizzes/attempts/${attemptId}`);
    return response.data;
  },

  // Get student's quiz attempts
  async getMyQuizAttempts(): Promise<QuizAttempt[]> {
    const response = await api.get(`/v1/quizzes/attempts/student`);
    return response.data;
  },

  // Get quiz attempts for a specific story
  async getMyQuizAttemptsByStory(storyId: string): Promise<QuizAttempt[]> {
    const response = await api.get(`/v1/quizzes/attempts/story/${storyId}`);
    return response.data;
  },

  // Get quizzes for a story
  async getQuizzesByStory(storyId: string): Promise<QuizData[]> {
    const response = await api.get(`/v1/quizzes/story/${storyId}`);
    return response.data;
  },

  // Check if student can attempt a quiz (and get existing attempt if any)
  async checkQuizEligibility(quizId: string): Promise<QuizEligibilityResponse> {
    const response = await api.get(`/v1/quizzes/eligibility/${quizId}`);
    return response.data;
  },

  // Get or create quiz attempt (prevents multiple attempts)
  async getOrCreateQuizAttempt(quizId: string): Promise<QuizAttempt> {
    const response = await api.post(`/v1/quizzes/attempts/get-or-create/${quizId}`);
    return response.data;
  },

  // Save quiz progress (answers so far)
  async saveQuizProgress(attemptId: string, progress: QuizProgressSave): Promise<void> {
    await api.post(`/v1/quizzes/attempts/save-progress/${attemptId}`, progress);
  },

  // Get quiz attempt with current progress
  async getQuizAttemptWithProgress(attemptId: string): Promise<QuizAttempt> {
    const response = await api.get(`/v1/quizzes/attempts/with-progress/${attemptId}`);
    return response.data;
  },

  // Resume an existing quiz attempt
  async resumeQuizAttempt(quizId: string): Promise<QuizAttempt | null> {
    try {
      const response = await api.get(`/v1/quizzes/attempts/resume/${quizId}`);
      return response.data;
    } catch (error) {
      // Return null if no attempt found to resume
      return null;
    }
  },

  // Calculate remaining time
  getRemainingTime(attempt: QuizAttempt): number {
    if (!attempt.expiresAt) return 0;
    
    const now = new Date();
    const expiresAt = new Date(attempt.expiresAt);
    const remainingMs = expiresAt.getTime() - now.getTime();
    
    return Math.max(0, Math.floor(remainingMs / 1000)); // Return seconds
  },

  // Format time for display
  formatTime(seconds: number): string {
    if (seconds <= 0) return '00:00';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  },

  // Check if quiz attempt is expired
  isAttemptExpired(attempt: QuizAttempt): boolean {
    if (!attempt.expiresAt) return false;
    
    const now = new Date();
    const expiresAt = new Date(attempt.expiresAt);
    
    return now > expiresAt;
  },

  // Quiz logging methods
  async logSuspiciousAction(attemptId: string, logEntry: QuizLogEntry): Promise<void> {
    await api.post(`/v1/quizzes/attempts/log/${attemptId}`, logEntry);
  },

  async getQuizLogs(attemptId: string): Promise<QuizLog> {
    const response = await api.get(`/v1/quizzes/attempts/logs/${attemptId}`);
    return response.data;
  },

  // Helper method to create log entries
  createLogEntry(action: string, description: string, severity: QuizLogEntry['severity'], questionIndex?: number): QuizLogEntry {
    return {
      timestamp: new Date().toISOString(),
      action,
      description,
      severity,
      questionIndex
    };
  },

  // Get quiz attempts for all classes taught by the teacher
  async getQuizAttemptsForTeacher(): Promise<QuizAttempt[]> {
    const response = await api.get('/v1/quizzes/attempts/teacher');
    return response.data;
  },

  // Get quiz attempts for a specific class
  async getQuizAttemptsByClass(classId: string): Promise<QuizAttempt[]> {
    const response = await api.get(`/v1/quizzes/attempts/class/${classId}`);
    return response.data;
  },

  // Get quiz attempts by quiz (admin/teacher only)
  async getQuizAttemptsByQuiz(quizId: string): Promise<QuizAttempt[]> {
    const response = await api.get(`/v1/quizzes/${quizId}/attempts`);
    return response.data;
  },

  // Get quiz attempts grouped for teacher
  async getQuizAttemptsGroupedForTeacher(): Promise<Record<string, Record<string, QuizAttempt[]>>> {
    const response = await api.get('/v1/quizzes/attempts/teacher/grouped');
    return response.data;
  },
  
  // Get class record matrix
  async getClassRecordMatrix(): Promise<ClassRecordMatrix> {
    const response = await api.get('/v1/quizzes/class-record-matrix');
    return response.data;
  },

  // Get class average summary
  async getClassAverageSummary(): Promise<{
    totalAverageScore: number;
    totalAttempts: number;
    studentAttempts: {
      attemptId: string;
      studentName: string;
      studentId: string;
      score: number;
      maxScore: number;
      percentage: number;
      timeTakenMinutes: number;
      quizTitle: string;
      quizId: string;
    }[];
  }> {
    const response = await api.get('/v1/quizzes/class-average-summary');
    return response.data;
  },

  // New method for reports with filtering
  async getQuizAttemptReports(filters?: {
    quizTitle?: string;
    classId?: string;
    completedOnly?: boolean;
  }): Promise<QuizAttempt[]> {
    const params = new URLSearchParams();
    if (filters?.quizTitle) params.append('quizTitle', filters.quizTitle);
    if (filters?.classId) params.append('classId', filters.classId);
    if (filters?.completedOnly !== undefined) params.append('completedOnly', String(filters.completedOnly));

    const response = await api.get(`/v1/quizzes/reports/attempts?${params.toString()}`);
    return response.data;
  },

  getQuizzesByClass: async (classId: string): Promise<ApiResponse<QuizData[]>> => {
    const response = await api.get(`/quizzes/class/${classId}`);
    return response.data;
  },

  submitQuiz: async (quizId: string, answers: Record<string, string>): Promise<ApiResponse<any>> => {
    const response = await api.post(`/quizzes/${quizId}/submit`, { answers });
    return response.data;
  },
}; 