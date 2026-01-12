import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts/AuthContext';
import { teacherAPI, SectionLeaderboardResponse, StudentRankingResponse } from '@/lib/api';
import { SimpleThemeToggle } from '@/components/ui/theme-toggle';

export const SectionDetailsPage = () => {
  const { sectionId } = useParams<{ sectionId: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sectionData, setSectionData] = useState<SectionLeaderboardResponse | null>(null);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleConfirmLogout = () => {
    setShowLogoutDialog(false);
    logout();
    navigate('/login', { replace: true });
  };
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading section details...</p>
        </div>
      </div>
    );
  }

  if (error || !sectionData) {
    return (
      <div className="min-h-screen bg-background">
        {/* Navigation Header */}
        <header className="bg-card border-b border-border p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate(-1)}
                className="h-9 w-9 rounded-full hover:bg-gray-200 dark:hover:bg-muted"
              >
                <ChevronLeft className="h-5 w-5" />
                <span className="sr-only">Back</span>
              </Button>
              <div className="flex items-center space-x-3">
                <img 
                  src="/filiLogo.png" 
                  alt="FiliUp Logo"
                  className="h-14 w-auto"
                />
                <div>
                  <h1 className="text-2xl font-bold text-primary">FiliUp</h1>
                  <p className="text-muted-foreground">Welcome, {user?.name}!</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <SimpleThemeToggle />
              <Button variant="outline" onClick={() => navigate('/teacher/profile')}>
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
              <Button variant="ghost" onClick={handleLogoutClick}>
                Logout
              </Button>
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto p-6">
          <div className="bg-card rounded-lg border border-border p-6 text-center">
            <div className="text-destructive text-lg font-medium mb-4">
              {error || 'Section not found'}
            </div>
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
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate(-1)}
              className="h-9 w-9 rounded-full hover:bg-gray-200 dark:hover:bg-muted"
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </Button>
            <div className="flex items-center space-x-3">
              <img 
                src="/filiLogo.png" 
                alt="FiliUp Logo"
                className="h-14 w-auto"
              />
              <div>
                <h1 className="text-2xl font-bold text-primary">FiliUp</h1>
                <p className="text-muted-foreground">Welcome, {user?.name}! 👋</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <SimpleThemeToggle />
            <Button variant="outline" onClick={() => navigate('/teacher/profile')}>
              <User className="h-4 w-4 mr-2" />
              Profile
            </Button>
            <Button variant="ghost" onClick={handleLogoutClick}>
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
              <p className="text-blue-100"> {sectionData.gradeLevel} • {stats.totalStudents} {stats.totalStudents === 1 ? 'Student' : 'Students'}</p>
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

      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        {/* Section Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <Card className="h-full">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center space-x-2 md:space-x-3">
                <div className="p-2 md:p-2.5 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <Users className="h-5 w-5 md:h-6 md:w-6 text-blue-500" />
                </div>
                <div className="min-w-0 space-y-2">
                  <div className="text-lg md:text-2xl font-bold leading-none">{stats.totalStudents}</div>
                  <div className="text-xs md:text-sm text-muted-foreground leading-tight">
                    {stats.totalStudents === 1 ? 'Student' : 'Students'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center space-x-2 md:space-x-3">
                <div className="p-2 md:p-2.5 rounded-lg bg-green-50 dark:bg-green-900/20">
                  <BarChart3 className="h-5 w-5 md:h-6 md:w-6 text-green-500" />
                </div>
                <div className="min-w-0 space-y-2">
                  <div className="text-lg md:text-2xl font-bold leading-none">{stats.averageScore}</div>
                  <div className="text-xs md:text-sm text-muted-foreground leading-tight">Avg Score</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center space-x-2 md:space-x-3">
                <div className="p-2 md:p-2.5 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                  <Trophy className="h-5 w-5 md:h-6 md:w-6 text-amber-500" />
                </div>
                <div className="min-w-0 space-y-2">
                  <div className="text-lg md:text-2xl font-bold leading-none">{stats.highestScore}</div>
                  <div className="text-xs md:text-sm text-muted-foreground leading-tight">Top Score</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center space-x-2 md:space-x-3">
                <div className="p-2 md:p-2.5 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                  <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-purple-500" />
                </div>
                <div className="min-w-0 space-y-2">
                  <div className="text-lg md:text-2xl font-bold leading-none">{stats.averagePercentage}%</div>
                  <div className="text-xs md:text-sm text-muted-foreground leading-tight">Avg %</div>
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
              <span>{stats.totalStudents === 1 ? 'Student' : 'Students'} ({stats.totalStudents})</span>
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
                    className="flex items-center p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    {/* Student Info - Fixed width */}
                    <div className="flex items-center space-x-4 w-64 shrink-0">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 text-white font-bold">
                        #{student.rank}
                      </div>
                      <div className="min-h-[60px] flex flex-col justify-center">
                        <div className="font-semibold text-lg leading-tight">{student.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Student ID: {student.id.substring(0, 8)}...
                        </div>
                      </div>
                    </div>

                    {/* Statistics - Takes remaining space */}
                    <div className="flex-1 px-4">
                      <div className="grid grid-cols-4 gap-6 text-center">
                        <div className="w-24">
                          <div className="text-2xl font-bold text-primary">{student.totalScore}</div>
                          <div className="text-xs text-muted-foreground">Total Score</div>
                        </div>
                        <div className="w-24">
                          <div className="text-2xl font-bold text-green-600">{student.averageScore.toFixed(1)}%</div>
                          <div className="text-xs text-muted-foreground">Average</div>
                        </div>
                        <div className="w-24">
                          <div className="text-2xl font-bold text-blue-600">{student.activitiesCompleted}</div>
                          <div className="text-xs text-muted-foreground">Activities</div>
                        </div>
                        <div className="w-24">
                          <div className="text-2xl font-bold text-purple-600">{student.lessonsCompleted}</div>
                          <div className="text-xs text-muted-foreground">Lessons</div>
                        </div>
                      </div>
                    </div>

                    {/* Badges - Fixed width and right-aligned */}
                    <div className="w-48 shrink-0 flex flex-col items-end gap-2">
                      {/* First row for rank badges */}
                      <div className="flex flex-wrap justify-end gap-2">
                        {student.rank === 1 && (
                          <Badge variant="default" className="bg-yellow-500 whitespace-nowrap py-1">
                            🥇 Top Student
                          </Badge>
                        )}
                        {student.rank === 2 && (
                          <Badge variant="secondary" className="whitespace-nowrap py-1">
                            🥈 2nd Place
                          </Badge>
                        )}
                        {student.rank === 3 && (
                          <Badge variant="secondary" className="whitespace-nowrap py-1">
                            🥉 3rd Place
                          </Badge>
                        )}
                      </div>
                      
                      {/* Second row for achievement badges */}
                      <div className="flex flex-wrap justify-end gap-2">
                        {student.averageScore >= 90 && (
                          <Badge variant="default" className="bg-green-500 whitespace-nowrap py-1">
                            ⭐ Excellent
                          </Badge>
                        )}
                        {student.averageScore >= 75 && student.averageScore < 90 && (
                          <Badge variant="outline" className="whitespace-nowrap py-1">
                            👍 Good
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        {/* <Card>
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
        </Card> */}
      </div>
      
      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to logout? You will need to login again to access your profile.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmLogout} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
