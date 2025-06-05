import { useState, useEffect } from 'react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Trophy, Medal, Crown, User, Star, Loader2, BookOpen, ArrowLeft } from 'lucide-react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { TeacherSidebar } from '../components/TeacherSidebar';
import ClassSelector from '../components/ClassSelector';
import { quizService, ClassRecordMatrix } from '@/lib/services/quizService';
import { Link, useNavigate } from 'react-router-dom';
import type { LeaderboardEntry } from '@/lib/services/types';

// Class Average Summary response interface
interface ClassAverageSummary {
  totalAverageScore: number;
  totalAttempts: number;
  studentAttempts: StudentAttempt[];
}

interface StudentAttempt {
  attemptId: string;
  studentName: string;
  studentId: string;
  score: number;
  maxScore: number;
  percentage: number;
  timeTakenMinutes: number;
  quizTitle: string;
  quizId: string;
}

// Aggregated student data for leaderboard display
interface StudentLeaderboardData {
  studentId: string;
  studentName: string;
  totalScore: number;
  totalMaxScore: number;
  averageScore: number;
  averagePercentage: number;
  totalAttempts: number;
  totalTimeMinutes: number;
  averageTimeMinutes: number;
  rank: number;
  avatar: string;
}

// Transformed student data for teacher leaderboard
interface TeacherLeaderboardStudent {
  id: string;
  name: string;
  averageScore: number;
  totalQuizzes: number;
  rank: number;
  avatar: string;
  classId?: string;
  className?: string;
}

const Leaderboards = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isTeacher = user?.type === 'teacher';
  
  // Teacher-specific state
  const [teacherData, setTeacherData] = useState<ClassRecordMatrix | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [teacherLeaderboardData, setTeacherLeaderboardData] = useState<TeacherLeaderboardStudent[]>([]);

  // Student-specific state
  const [classAverageSummary, setClassAverageSummary] = useState<ClassAverageSummary | null>(null);
  const [studentLeaderboardData, setStudentLeaderboardData] = useState<StudentLeaderboardData[]>([]);
  
  // Shared state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Teacher data fetching (existing logic)
  useEffect(() => {
    if (!isTeacher) return;
    
    const fetchTeacherData = async () => {
      try {
        setLoading(true);
        const data = await quizService.getClassRecordMatrix();
        setTeacherData(data);
        
        if (data.classInfo && Object.keys(data.classInfo).length > 0) {
          const firstClassId = Object.keys(data.classInfo)[0];
          setSelectedClassId(firstClassId);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherData();
  }, [isTeacher]);

  // Student data fetching (new)
  useEffect(() => {
    if (isTeacher) return;
    
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        const response = await quizService.getClassAverageSummary();
        
        if (response) {
          setClassAverageSummary(response);
          
          // Aggregate student attempts by student
          const studentMap = new Map<string, {
            studentId: string;
            studentName: string;
            totalScore: number;
            totalMaxScore: number;
            totalPercentage: number;
            totalAttempts: number;
            totalTimeMinutes: number;
          }>();
          
          response.studentAttempts.forEach((attempt) => {
            const existing = studentMap.get(attempt.studentId);
            if (existing) {
              existing.totalScore += attempt.score;
              existing.totalMaxScore += attempt.maxScore;
              existing.totalPercentage += attempt.percentage;
              existing.totalAttempts += 1;
              existing.totalTimeMinutes += attempt.timeTakenMinutes;
            } else {
              studentMap.set(attempt.studentId, {
                studentId: attempt.studentId,
                studentName: attempt.studentName,
                totalScore: attempt.score,
                totalMaxScore: attempt.maxScore,
                totalPercentage: attempt.percentage,
                totalAttempts: 1,
                totalTimeMinutes: attempt.timeTakenMinutes,
              });
            }
          });
          
          // Convert to leaderboard format and sort by average percentage (same logic as teacher side)
          const leaderboardData: StudentLeaderboardData[] = Array.from(studentMap.values())
            .map((student) => {
              const averagePercentage = student.totalAttempts > 0 ? student.totalPercentage / student.totalAttempts : 0;
              return {
                ...student,
                averageScore: student.totalScore / student.totalAttempts,
                averagePercentage: Math.round(averagePercentage * 100) / 100, // Same rounding as teacher side
                averageTimeMinutes: student.totalTimeMinutes / student.totalAttempts,
                rank: 0,
                avatar: generateAvatar(student.studentName),
              };
            })
            .sort((a, b) => b.averagePercentage - a.averagePercentage)
            .map((student, index) => ({
              ...student,
              rank: index + 1,
            }));
          
          setStudentLeaderboardData(leaderboardData);
        }
      } catch (err) {
        console.error('Error fetching student leaderboard:', err);
        setError('Failed to fetch leaderboard data. Make sure you are enrolled in classes with quiz data.');
        setStudentLeaderboardData([]);
        setClassAverageSummary(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [isTeacher]);

  // Teacher leaderboard calculation (existing logic)
  useEffect(() => {
    if (!isTeacher || !teacherData || !selectedClassId) return;

    const transformedStudents: TeacherLeaderboardStudent[] = teacherData.students
      .filter(student => {
        return Object.values(student.quizScores).some(quiz => quiz.classId === selectedClassId);
      })
      .map(student => {
        const classQuizzes = Object.values(student.quizScores).filter(
          quiz => quiz.classId === selectedClassId
        );

        const averageScore = classQuizzes.length > 0
          ? classQuizzes.reduce((sum, quiz) => sum + quiz.percentage, 0) / classQuizzes.length
          : 0;

        const generateAvatar = (name: string) => {
          const parts = name.split(/[\s_.]+/);
          if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
          }
          return name.substring(0, 2).toUpperCase();
        };

        return {
          id: student.studentId,
          name: student.studentName,
          averageScore: Math.round(averageScore * 100) / 100,
          totalQuizzes: classQuizzes.length,
          rank: 0,
          avatar: generateAvatar(student.studentName),
          classId: selectedClassId,
          className: teacherData.classInfo[selectedClassId]
        };
      })
      .sort((a, b) => b.averageScore - a.averageScore)
      .map((student, index) => ({
        ...student,
        rank: index + 1
      }));

    setTeacherLeaderboardData(transformedStudents);
  }, [isTeacher, teacherData, selectedClassId]);

  const getPodiumPosition = (rank: number) => {
    switch (rank) {
      case 1: return { icon: Crown, color: 'text-yellow-500', bg: 'bg-gradient-to-br from-yellow-400 to-yellow-600', height: 'h-32' };
      case 2: return { icon: Trophy, color: 'text-gray-400', bg: 'bg-gradient-to-br from-gray-300 to-gray-500', height: 'h-24' };
      case 3: return { icon: Medal, color: 'text-amber-600', bg: 'bg-gradient-to-br from-amber-400 to-amber-600', height: 'h-16' };
      default: return { icon: Award, color: 'text-teal-500', bg: 'bg-gradient-to-br from-teal-400 to-teal-600', height: 'h-12' };
    }
  };

  const generateAvatar = (name: string) => {
    const parts = name.split(/[\s_.]+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
          <span className="text-lg font-medium text-teal-600">Loading leaderboard...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="flex space-x-2">
              <Button onClick={() => window.location.reload()}>Retry</Button>
              {!isTeacher && (
                <Button variant="outline" onClick={() => navigate('/student-dashboard')}>
                  Back to Dashboard
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isTeacher) {
    // Student view
    const topThree = studentLeaderboardData.slice(0, 3);
    const restOfStudents = studentLeaderboardData.slice(3);

    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-teal-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-3">
                <Link to="/student-dashboard">
                  <Button variant="ghost" size="sm" className="text-teal-600 hover:bg-teal-50">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                </Link>
                <div className="w-10 h-10 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-lg flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  Class Leaderboard
                </h1>
              </div>
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium">{user?.name}</span>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Class Average Summary */}
          {classAverageSummary && (
            <div className="mb-8">
              <Card className="border-teal-200 bg-gradient-to-r from-teal-50 to-cyan-50">
                <CardHeader>
                  <CardTitle className="text-teal-700">Class Overview</CardTitle>
                  <CardDescription className="text-teal-600">
                    Performance summary for all your classes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-teal-600 mb-2">
                        {classAverageSummary.totalAverageScore.toFixed(1)}%
                      </div>
                      <div className="text-sm text-teal-500">Class Average Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-cyan-600 mb-2">
                        {classAverageSummary.totalAttempts}
                      </div>
                      <div className="text-sm text-cyan-500">Total Quiz Attempts</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <StudentLeaderboardContent 
            topThree={topThree}
            restOfStudents={restOfStudents}
            getPodiumPosition={getPodiumPosition}
            generateAvatar={generateAvatar}
          />
        </div>
      </div>
    );
  }

  // Teacher view (existing logic)
  const topThree = teacherLeaderboardData.slice(0, 3);
  const restOfStudents = teacherLeaderboardData.slice(3);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <TeacherSidebar />
        <SidebarInset className="flex-1">
          <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-teal-100">
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center space-x-4">
                  <SidebarTrigger className="text-teal-600" />
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                      Class Leaderboards
                    </h1>
                    <p className="text-gray-600 text-sm">Track student achievements and progress</p>
                  </div>
                </div>
              </div>
            </header>

            <div className="p-6">
              {/* Class Selector for teachers */}
              {teacherData?.classInfo && Object.keys(teacherData.classInfo).length > 1 && (
                <div className="mb-8">
                  <ClassSelector
                    classes={Object.keys(teacherData.classInfo)}
                    selectedClass={selectedClassId}
                    onClassChange={setSelectedClassId}
                    classData={Object.fromEntries(
                      Object.entries(teacherData.classInfo).map(([classId, className]) => [
                        classId,
                        {
                          name: className,
                          totalStudents: teacherData.students.filter(s => 
                            Object.values(s.quizScores).some(q => q.classId === classId)
                          ).length
                        }
                      ])
                    )}
                  />
                </div>
              )}

              <TeacherLeaderboardContent 
                topThree={topThree}
                restOfStudents={restOfStudents}
                selectedClassName={teacherData?.classInfo[selectedClassId] || ''}
                getPodiumPosition={getPodiumPosition}
              />
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

// Student leaderboard content component
const StudentLeaderboardContent = ({ topThree, restOfStudents, getPodiumPosition, generateAvatar }: {
  topThree: StudentLeaderboardData[];
  restOfStudents: StudentLeaderboardData[];
  getPodiumPosition: (rank: number) => { icon: LucideIcon; color: string; bg: string; height: string; };
  generateAvatar: (name: string) => string;
}) => {

  return (
    <>
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Trophy className="h-8 w-8 text-yellow-500" />
          <h2 className="text-3xl font-bold text-gray-900">
            Classmate Leaderboard
          </h2>
          <Trophy className="h-8 w-8 text-yellow-500" />
        </div>
        <p className="text-gray-600">
          See how you rank among your classmates based on quiz performance
        </p>
      </div>

      {/* Podium Section */}
      <Card className="mb-8 bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center space-x-2 text-teal-700">
            <Award className="h-6 w-6 text-teal-600" />
            <span>Top Performers</span>
          </CardTitle>
          <CardDescription className="text-teal-600">The leading students in your classes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-end space-x-8 mb-6">
            {/* Reorder for podium effect: 2nd, 1st, 3rd */}
            {topThree.length > 1 && (
              <StudentPodiumStudent student={topThree[1]} position={getPodiumPosition(2)} generateAvatar={generateAvatar} />
            )}
            {topThree.length > 0 && (
              <StudentPodiumStudent student={topThree[0]} position={getPodiumPosition(1)} generateAvatar={generateAvatar} />
            )}
            {topThree.length > 2 && (
              <StudentPodiumStudent student={topThree[2]} position={getPodiumPosition(3)} generateAvatar={generateAvatar} />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Rest of Students */}
      {restOfStudents.length > 0 && (
        <Card className="border-teal-200">
          <CardHeader>
            <CardTitle className="text-teal-700">Other Students</CardTitle>
            <CardDescription className="text-teal-600">Keep up the great work!</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {restOfStudents.map((student) => (
                <div key={student.studentId} className="flex items-center justify-between p-4 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors border border-teal-100">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center font-bold">
                        {student.rank}
                      </Badge>
                      <div className="w-12 h-12 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full flex items-center justify-center text-white font-semibold">
                        {student.avatar}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-teal-800">{student.studentName}</h3>
                      <div className="flex items-center space-x-4 text-sm text-teal-600">
                        <span>{student.totalAttempts} attempts</span>
                        <span>⏱️ {student.averageTimeMinutes.toFixed(1)} min avg</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <span className="text-xl font-bold text-teal-700">{student.averagePercentage.toFixed(1)}%</span>
                    <span className="text-sm text-teal-500">avg</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No students message */}
      {topThree.length === 0 && restOfStudents.length === 0 && (
        <Card className="border-teal-200">
          <CardContent className="text-center py-12">
            <Trophy className="h-16 w-16 text-teal-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-teal-600 mb-2">No leaderboard data available</h3>
            <p className="text-teal-500 mb-4">
              You or your classmates haven't taken any quizzes yet, or you're not enrolled in any classes.
            </p>
            <Link to="/student-dashboard">
              <Button className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600">
                <BookOpen className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </>
  );
};

// Teacher leaderboard content component (existing)
const TeacherLeaderboardContent = ({ topThree, restOfStudents, selectedClassName, getPodiumPosition }) => {
  return (
    <>
      {/* Class Header */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Trophy className="h-8 w-8 text-yellow-500" />
          <h2 className="text-3xl font-bold text-gray-900">
            {selectedClassName} Leaderboard
          </h2>
          <Trophy className="h-8 w-8 text-yellow-500" />
        </div>
        <p className="text-gray-600">
          Monitor your students' quiz performance and celebrate their success!
        </p>
      </div>

      {/* Podium Section */}
      <Card className="mb-8 bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center space-x-2 text-teal-700">
            <Award className="h-6 w-6 text-teal-600" />
            <span>Top Performers</span>
          </CardTitle>
          <CardDescription className="text-teal-600">The leading students based on average quiz scores</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-end space-x-8 mb-6">
            {/* Reorder for podium effect: 2nd, 1st, 3rd */}
            {topThree.length > 1 && (
              <TeacherPodiumStudent student={topThree[1]} position={getPodiumPosition(2)} />
            )}
            {topThree.length > 0 && (
              <TeacherPodiumStudent student={topThree[0]} position={getPodiumPosition(1)} />
            )}
            {topThree.length > 2 && (
              <TeacherPodiumStudent student={topThree[2]} position={getPodiumPosition(3)} />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Rest of Students */}
      {restOfStudents.length > 0 && (
        <Card className="border-teal-200">
          <CardHeader>
            <CardTitle className="text-teal-700">Other Students</CardTitle>
            <CardDescription className="text-teal-600">Keep up the great work!</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {restOfStudents.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-4 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors border border-teal-100">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center font-bold">
                        {student.rank}
                      </Badge>
                      <div className="w-12 h-12 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full flex items-center justify-center text-white font-semibold">
                        {student.avatar}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-teal-800">{student.name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-teal-600">
                        <span>{student.totalQuizzes} quizzes taken</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <span className="text-xl font-bold text-teal-700">{student.averageScore}%</span>
                    <span className="text-sm text-teal-500">avg</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No students message */}
      {topThree.length === 0 && restOfStudents.length === 0 && (
        <Card className="border-teal-200">
          <CardContent className="text-center py-12">
            <Trophy className="h-16 w-16 text-teal-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-teal-600 mb-2">No quiz data available</h3>
            <p className="text-teal-500">Students haven't taken any quizzes in this class yet.</p>
          </CardContent>
        </Card>
      )}
    </>
  );
};

// Student podium component
const StudentPodiumStudent = ({ student, position, generateAvatar }: {
  student: StudentLeaderboardData;
  position: { icon: LucideIcon; color: string; bg: string; height: string; };
  generateAvatar: (name: string) => string;
}) => {
  const { icon: Icon, color, bg, height } = position;
  
  return (
    <div className="flex flex-col items-center">
      <div className="text-center mb-4">
        <div className="w-16 h-16 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full flex items-center justify-center text-white font-bold text-lg mb-2 mx-auto">
          {student.avatar}
        </div>
        <h3 className="font-semibold text-teal-800 text-sm">{student.studentName}</h3>
        <div className="flex items-center justify-center space-x-1 mt-1">
          <Star className="h-4 w-4 text-yellow-500" />
          <span className="font-bold text-teal-600">{student.averagePercentage.toFixed(1)}%</span>
        </div>
        <div className="text-xs text-teal-600 mt-1">
          {student.totalAttempts} attempts
        </div>
      </div>
      <div className={`${bg} ${height} w-24 rounded-t-lg flex flex-col items-center justify-start pt-4 text-white relative`}>
        <Icon className={`h-8 w-8 ${color} mb-2`} />
        <Badge className="bg-white text-teal-700 font-bold border border-teal-200">
          #{student.rank}
        </Badge>
      </div>
    </div>
  );
};

// Teacher podium component (existing)
const TeacherPodiumStudent = ({ student, position }) => {
  const { icon: Icon, color, bg, height } = position;
  
  return (
    <div className="flex flex-col items-center">
      <div className="text-center mb-4">
        <div className="w-16 h-16 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full flex items-center justify-center text-white font-bold text-lg mb-2 mx-auto">
          {student.avatar}
        </div>
        <h3 className="font-semibold text-teal-800 text-sm">{student.name}</h3>
        <div className="flex items-center justify-center space-x-1 mt-1">
          <Star className="h-4 w-4 text-yellow-500" />
          <span className="font-bold text-teal-600">{student.averageScore}%</span>
        </div>
        <div className="text-xs text-teal-600 mt-1">
          {student.totalQuizzes} quizzes
        </div>
      </div>
      <div className={`${bg} ${height} w-24 rounded-t-lg flex flex-col items-center justify-start pt-4 text-white relative`}>
        <Icon className={`h-8 w-8 ${color} mb-2`} />
        <Badge className="bg-white text-teal-700 font-bold border border-teal-200">
          #{student.rank}
        </Badge>
      </div>
    </div>
  );
};

export default Leaderboards;
