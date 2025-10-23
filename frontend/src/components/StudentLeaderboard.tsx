import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Trophy, Medal, Award, User } from 'lucide-react';
import { SimpleThemeToggle } from '@/components/ui/theme-toggle';
import { useAuth } from '@/contexts/AuthContext';
import { studentAPI, SectionLeaderboardResponse } from '@/lib/api';
import { CenteredLoading } from '@/components/ui/loading-spinner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export const StudentLeaderboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [leaderboardData, setLeaderboardData] = useState<SectionLeaderboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleConfirmLogout = () => {
    setShowLogoutDialog(false);
    logout();
    navigate('/login', { replace: true });
  };

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await studentAPI.getLeaderboard();
      setLeaderboardData(data);
    } catch (err) {
      console.error('Error loading leaderboard:', err);
      setError('Failed to load leaderboard');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <CenteredLoading message="Loading leaderboard..." />;
  }

  if (error || !leaderboardData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">{error || 'No leaderboard data available'}</p>
          <Button onClick={loadLeaderboard}>Try Again</Button>
        </div>
      </div>
    );
  }

  const students = leaderboardData.students || [];

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-white" />; // White on gold
    if (rank === 2) return <Medal className="h-6 w-6 text-white" />; // White on silver
    if (rank === 3) return <Medal className="h-6 w-6 text-white" />; // White on bronze
    return <Award className="h-6 w-6 text-muted-foreground/50" />;
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-br from-yellow-400 to-yellow-600'; // Gold gradient
    if (rank === 2) return 'bg-gradient-to-br from-gray-300 to-gray-500'; // Silver gradient
    if (rank === 3) return 'bg-gradient-to-br from-amber-500 to-amber-700'; // Bronze gradient
    return 'bg-muted';
  };

  const currentUserRank = students.find(student => student.id === user?.id);

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
              onClick={() => navigate('/student/dashboard')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/student/profile')}
            >
              <User className="h-4 w-4 mr-2" />
              Profile
            </Button>
            <SimpleThemeToggle />
            <Button variant="ghost" onClick={handleLogoutClick}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Leaderboard Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-8">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Trophy className="h-10 w-10" />
              <div>
                <h2 className="text-3xl font-bold">Leaderboard</h2>
                <p className="text-blue-100">{leaderboardData.sectionName} - {leaderboardData.gradeLevel}</p>
              </div>
            </div>
            {currentUserRank && (
              <Card className="bg-white/20 border-white/30">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-sm text-blue-100">Your Rank</div>
                    <div className="text-3xl font-bold text-white">#{currentUserRank.rank}</div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Top 3 Podium */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[2, 1, 3].map((position) => {
            const student = students.find(s => s.rank === position);
            
            // Position mapping: rank 1 in middle, rank 2 on left, rank 3 on right
            const getPositionClass = (rank: number) => {
              if (rank === 1) return 'order-2'; // Middle position
              if (rank === 2) return 'order-1 mt-8'; // Left position, slightly lower
              if (rank === 3) return 'order-3 mt-8'; // Right position, slightly lower
              return 'order-3 mt-8'; // Fallback
            };
            
            if (!student) {
              return (
                <div 
                  key={`empty-${position}`} 
                  className={`flex flex-col items-center ${getPositionClass(position)}`}
                >
                  <div className="w-full h-full opacity-0">
                    {/* Empty placeholder to maintain grid structure */}
                  </div>
                </div>
              );
            }
            
            const isFirst = student.rank === 1;
            
            return (
              <div 
                key={student.id} 
                className={`flex flex-col items-center ${getPositionClass(student.rank)}`}
              >
                <Card className={`learning-card w-full ${isFirst ? 'ring-2 ring-warning' : ''} ${student.id === user?.id ? 'ring-2 ring-primary' : ''}`}>
                  <CardContent className="p-4 text-center">
                    <div className={`w-16 h-16 mx-auto mb-3 rounded-full ${getRankBadge(student.rank)} flex items-center justify-center`}>
                      {getRankIcon(student.rank)}
                    </div>
                    <div className="text-3xl font-bold mb-1">#{student.rank}</div>
                    <div className="font-semibold mb-2">{student.name}</div>
                    {student.id === user?.id && (
                      <Badge className="mb-2">You</Badge>
                    )}
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <Award className="h-4 w-4 text-warning" />
                      <span className="text-2xl font-bold text-primary">{student.totalScore}</span>
                    </div>
                    <Badge variant={isFirst ? 'default' : 'secondary'}>
                      {student.lessonsCompleted} lessons
                    </Badge>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>

        {/* Full Rankings */}
        <Card className="learning-card">
          <CardHeader>
            <CardTitle>Overall Rankings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {students.map((student) => (
              <div 
                key={student.id} 
                className={`flex items-center justify-between p-4 rounded-lg ${
                  student.id === user?.id 
                    ? 'bg-gradient-to-r from-primary/20 to-primary/5 ring-2 ring-primary' 
                    : student.rank <= 3 
                    ? 'bg-gradient-to-r from-primary/5 to-transparent' 
                    : 'bg-muted/30'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full ${getRankBadge(student.rank)} flex items-center justify-center font-bold`}>
                    {student.rank <= 3 ? getRankIcon(student.rank) : `#${student.rank}`}
                  </div>
                  <div>
                    <div className="font-semibold flex items-center space-x-2">
                      <span>{student.name}</span>
                      {student.id === user?.id && (
                        <Badge variant="outline">Ikaw</Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {student.lessonsCompleted} lessons completed
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <Award className="h-5 w-5 text-warning" />
                    <span className="text-2xl font-bold text-primary">{student.totalScore}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">points</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to logout? You will need to login again to access the leaderboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmLogout} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
