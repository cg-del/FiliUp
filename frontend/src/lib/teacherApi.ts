const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';

export interface TeacherStats {
  totalStudents: number;
  activeSections: number;
  averageProgress: number;
  activitiesCreated: number;
}

export interface TeacherSection {
  id: string;
  name: string;
  gradeLevel: string;
  totalStudents: number;
  activeStudents: number;
  averageProgress: number;
  inviteCode: string;
  status: string;
}

export interface RecentActivity {
  studentId: string;
  studentName: string;
  activity: string;
  score: number | null;
  timestamp: string;
  timeAgo: string;
}

export interface TeacherDashboard {
  stats: TeacherStats;
  sections: TeacherSection[];
  recentActivity: RecentActivity[];
}

export interface StudentRanking {
  id: string;
  name: string;
  totalScore: number;
  lessonsCompleted: number;
  activitiesCompleted: number;
  averageScore: number;
  rank: number;
}

export interface SectionLeaderboard {
  sectionId: string;
  sectionName: string;
  gradeLevel: string;
  students: StudentRanking[];
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
  capacity: number;
  isActive: boolean;
  createdAt: string;
}

class TeacherApiService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  async getDashboard(): Promise<TeacherDashboard> {
    const response = await fetch(`${API_BASE_URL}/teacher/dashboard`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch teacher dashboard');
    }

    return response.json();
  }

  async getSections(): Promise<SectionResponse[]> {
    const response = await fetch(`${API_BASE_URL}/teacher/sections`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch sections');
    }

    return response.json();
  }

  async createSection(request: CreateSectionRequest): Promise<SectionResponse> {
    const response = await fetch(`${API_BASE_URL}/teacher/sections`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('Failed to create section');
    }

    return response.json();
  }

  async getSectionDetails(sectionId: string): Promise<SectionResponse> {
    const response = await fetch(`${API_BASE_URL}/teacher/sections/${sectionId}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch section details');
    }

    return response.json();
  }

  async getSectionLeaderboard(sectionId: string): Promise<SectionLeaderboard> {
    const response = await fetch(`${API_BASE_URL}/teacher/sections/${sectionId}/leaderboard`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch section leaderboard');
    }

    return response.json();
  }
}

export const teacherApi = new TeacherApiService();
