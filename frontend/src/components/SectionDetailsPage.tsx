import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Users, 
  Trophy, 
  BookOpen, 
  Target,
  TrendingUp,
  Calendar,
  User,
  BarChart3,
  Download
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { teacherAPI, SectionLeaderboardResponse, StudentRankingResponse } from '@/lib/api';

export const SectionDetailsPage = () => {
  const { sectionId } = useParams<{ sectionId: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sectionData, setSectionData] = useState<SectionLeaderboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSectionData = useCallback(async () => {
    if (!sectionId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const data = await teacherAPI.getSectionLeaderboard(sectionId);
      setSectionData(data);
    } catch (err) {
      console.error('Error loading section data:', err);
      setError('Failed to load section data');
    } finally {
      setIsLoading(false);
    }
  }, [sectionId]);

  useEffect(() => {
    loadSectionData();
  }, [loadSectionData]);

  const calculateSectionStats = (students: StudentRankingResponse[]) => {
    if (students.length === 0) {
      return {
        totalStudents: 0,
        averageScore: 0,
        highestScore: 0,
        averagePercentage: 0,
        totalActivitiesCompleted: 0,
        totalLessonsCompleted: 0
      };
    }

    const totalScore = students.reduce((sum, s) => sum + s.totalScore, 0);
    const totalPercentage = students.reduce((sum, s) => sum + s.averageScore, 0);
    const totalActivities = students.reduce((sum, s) => sum + s.activitiesCompleted, 0);
    const totalLessons = students.reduce((sum, s) => sum + s.lessonsCompleted, 0);
    const highestScore = Math.max(...students.map(s => s.totalScore));

    return {
      totalStudents: students.length,
      averageScore: Math.round(totalScore / students.length),
      highestScore,
      averagePercentage: Number((totalPercentage / students.length).toFixed(1)),
      totalActivitiesCompleted: totalActivities,
      totalLessonsCompleted: totalLessons
    };
  };

  const exportStudentData = () => {
    if (!sectionData) return;

    let csvContent = 'Rank,Student Name,Total Score,Average Percentage,Activities Completed,Lessons Completed\n';
    sectionData.students.forEach(student => {
      csvContent += `${student.rank},"${student.name}",${student.totalScore},${student.averageScore},${student.activitiesCompleted},${student.lessonsCompleted}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `section-${sectionData.sectionName}-students-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Navigation Header */}
        <header className="bg-card border-b border-border p-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary">FiliUp</h1>
              <p className="text-muted-foreground">Welcome, {user?.name}! 👋</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                onClick={() => navigate('/teacher/dashboard')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/teacher/profile')}
              >
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
              <Button variant="ghost" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        </header>

        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading section details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !sectionData) {
    return (
      <div className="min-h-screen bg-background">
        {/* Navigation Header */}
        <header className="bg-card border-b border-border p-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary">FiliUp</h1>
              <p className="text-muted-foreground">Welcome, {user?.name}! 👋</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                onClick={() => navigate('/teacher/dashboard')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/teacher/profile')}
              >
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
              <Button variant="ghost" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        </header>

        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-destructive mb-4">{error || 'Section not found'}</p>
            <Button onClick={() => navigate('/teacher/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const stats = calculateSectionStats(sectionData.students);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="bg-card border-b border-border p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">FiliUp</h1>
            <p className="text-muted-foreground">Welcome, {user?.name}! 👋</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/teacher/profile')}
            >
              <User className="h-4 w-4 mr-2" />
              Profile
            </Button>
            <Button variant="ghost" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Section Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">{sectionData.sectionName}</h2>
              <p className="text-blue-100"> {sectionData.gradeLevel} • {stats.totalStudents} Students</p>
            </div>
            <div className="flex space-x-3">
              <Button 
                variant="secondary"
                onClick={() => navigate(`/teacher/leaderboard/${sectionId}`)}
              >
                <Trophy className="h-4 w-4 mr-2" />
                View Leaderboard
              </Button>
              <Button 
                variant="secondary"
                onClick={exportStudentData}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Section Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-blue-500" />
                <div>
                  <div className="text-2xl font-bold">{stats.totalStudents}</div>
                  <div className="text-sm text-muted-foreground">Total Students</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-8 w-8 text-green-500" />
                <div>
                  <div className="text-2xl font-bold">{stats.averageScore}</div>
                  <div className="text-sm text-muted-foreground">Average Score</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Trophy className="h-8 w-8 text-yellow-500" />
                <div>
                  <div className="text-2xl font-bold">{stats.highestScore}</div>
                  <div className="text-sm text-muted-foreground">Highest Score</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-8 w-8 text-purple-500" />
                <div>
                  <div className="text-2xl font-bold">{stats.averagePercentage}%</div>
                  <div className="text-sm text-muted-foreground">Average Percentage</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Students List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Students ({stats.totalStudents})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sectionData.students.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No students enrolled</h3>
                <p className="text-muted-foreground">Students will appear here once they join this section.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sectionData.students
                  .sort((a, b) => a.rank - b.rank)
                  .map((student) => (
                  <div 
                    key={student.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 text-white font-bold">
                        #{student.rank}
                      </div>
                      <div>
                        <div className="font-semibold text-lg">{student.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Student ID: {student.id.substring(0, 8)}...
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                      <div>
                        <div className="text-2xl font-bold text-primary">{student.totalScore}</div>
                        <div className="text-xs text-muted-foreground">Total Score</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">{student.averageScore.toFixed(1)}%</div>
                        <div className="text-xs text-muted-foreground">Average</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">{student.activitiesCompleted}</div>
                        <div className="text-xs text-muted-foreground">Activities</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">{student.lessonsCompleted}</div>
                        <div className="text-xs text-muted-foreground">Lessons</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {student.rank === 1 && (
                        <Badge variant="default" className="bg-yellow-500">
                          🥇 Top Student
                        </Badge>
                      )}
                      {student.rank === 2 && (
                        <Badge variant="secondary">
                          🥈 2nd Place
                        </Badge>
                      )}
                      {student.rank === 3 && (
                        <Badge variant="secondary">
                          🥉 3rd Place
                        </Badge>
                      )}
                      {student.averageScore >= 90 && (
                        <Badge variant="default" className="bg-green-500">
                          ⭐ Excellent
                        </Badge>
                      )}
                      {student.averageScore >= 75 && student.averageScore < 90 && (
                        <Badge variant="outline">
                          👍 Good
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center space-y-2"
                onClick={() => navigate(`/teacher/leaderboard/${sectionId}`)}
              >
                <Trophy className="h-8 w-8 text-yellow-500" />
                <span>View Leaderboard</span>
                <span className="text-xs text-muted-foreground">See rankings and competition</span>
              </Button>

              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center space-y-2"
                onClick={exportStudentData}
              >
                <Download className="h-8 w-8 text-blue-500" />
                <span>Export Data</span>
                <span className="text-xs text-muted-foreground">Download student progress</span>
              </Button>

              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center space-y-2"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="h-8 w-8 text-gray-500" />
                <span>Back to Dashboard</span>
                <span className="text-xs text-muted-foreground">Return to main view</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
