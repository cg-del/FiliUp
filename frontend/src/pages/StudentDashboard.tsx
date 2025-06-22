import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Award, User, Play, Star, Loader2, Settings, Trophy, BarChart, Filter } from 'lucide-react';
import StudentEnrollment from '../components/StudentEnrollment';
import { enrollmentService } from '@/lib/services/enrollmentService';
import { classService } from '@/lib/services/classService';
import { storyService } from '@/lib/services/storyService';
import { progressService } from '@/lib/services/progressService';
import { leaderboardService } from '@/lib/services/leaderboardService';
import { quizService } from '@/lib/services/quizService';
import { toast } from '@/hooks/use-toast';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import type { Class, CommonStoryDTO } from '@/lib/services/types';
import type { LeaderboardEntry as BaseLeaderboardEntry } from '@/lib/services/types';

// Extended LeaderboardEntry with percentage for our display purposes
interface LeaderboardEntry extends BaseLeaderboardEntry {
  percentage?: string;
}

// Add custom styles for 3D book effects
const bookStyles = `
  .perspective-1000 {
    perspective: 1000px;
  }
  
  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .shadow-3xl {
    box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1);
  }
  
  .book-hover:hover {
    transform: perspective(1000px) rotateY(-5deg) scale(1.05);
  }
  
  .border-l-3, .border-r-3 {
    border-left-width: 3px;
    border-right-width: 3px;
  }
  
  .border-t-8 {
    border-top-width: 8px;
  }
  
  @keyframes bookFloat {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-4px); }
  }
  
  .book-float:hover {
    animation: bookFloat 2s ease-in-out infinite;
  }
`;

// TypeScript interfaces for the API response
interface ClassEntity {
  className: string;
  description: string;
  createdAt: string;
  isActive: boolean;
  classCode: string;
  classId: string;
}

interface ClassStory {
  storyId: string;
  title: string;
  content: string;
  createdAt: string;
  isActive: boolean;
  genre: string;
  fictionType: string;
  coverPictureUrl?: string;
  coverPictureType?: string;
  classEntity: ClassEntity;
}

// Interface for user statistics
interface UserStats {
  totalPoints: number;
  completedStories: number;
  totalStories: number;
  completedQuizzes: number;
  totalQuizzes: number;
  level: number;
  badges: Array<{
    id: number;
    name: string;
    icon: string;
    earned: boolean;
  }>;
}

// Interface for Quiz Summary from the API
interface QuizClassSummary {
  totalAverageScore: number;
  totalAttempts: number;
  studentAttempts: Array<{
    attemptId: string;
    studentName: string;
    studentId: string;
    score: number;
    maxScore: number;
    percentage: number;
    timeTakenMinutes: number;
    quizTitle: string;
    quizId: string;
  }>;
}

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const { safeExecute } = useErrorHandler();
  const [studentClasses, setStudentClasses] = useState<Class[]>([]);
  const [stories, setStories] = useState<ClassStory[]>([]);
  const [commonStories, setCommonStories] = useState<CommonStoryDTO[]>([]);
  const [filteredStories, setFilteredStories] = useState<(ClassStory | CommonStoryDTO)[]>([]);
  const [storyFilter, setStoryFilter] = useState<'all' | 'teacher' | 'filiup'>('all');
  const [loading, setLoading] = useState(true);
  const [storiesLoading, setStoriesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userStats, setUserStats] = useState<UserStats>({
    totalPoints: 0,
    completedStories: 0,
    totalStories: 0,
    completedQuizzes: 0,
    totalQuizzes: 0,
    level: 1,
    badges: [
      { id: 1, name: 'First Story', icon: '📖', earned: false },
      { id: 2, name: 'Quiz Master', icon: '🎯', earned: false },
      { id: 3, name: 'Story Explorer', icon: '🗺️', earned: false },
      { id: 4, name: 'Fast Learner', icon: '⚡', earned: false },
      { id: 5, name: 'Perfect Score', icon: '💯', earned: false },
    ]
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [classLeaderboard, setClassLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);

  // Helper function to check if a story is a CommonStoryDTO
  const isCommonStory = (story: ClassStory | CommonStoryDTO): story is CommonStoryDTO => {
    return 'createdByUserName' in story && 'classId' in story;
  };

  // Function to filter stories based on creator type
  const filterStories = (allStories: ClassStory[], allCommonStories: CommonStoryDTO[], filter: 'all' | 'teacher' | 'filiup') => {
    console.log('🔍 Filtering stories:', {
      filter,
      classStoriesCount: allStories.length,
      commonStoriesCount: allCommonStories.length,
      commonStories: allCommonStories.map(s => ({
        title: s.title,
        createdBy: s.createdByUserName
      }))
    });
    
    let filtered: (ClassStory | CommonStoryDTO)[] = [];
    
    switch (filter) {
      case 'all':
        filtered = [...allStories, ...allCommonStories];
        break;
      case 'teacher': {
        // Class stories are created by teachers
        const teacherCommonStories = allCommonStories.filter(story => 
          story.createdByUserName && story.createdByUserName !== 'filiup'
        );
        console.log('👨‍🏫 Teacher filter - common stories by teachers:', teacherCommonStories.length);
        filtered = [...allStories, ...teacherCommonStories];
        break;
      }
      case 'filiup': {
        // Only common stories created by 'filiup'
        const filiupStories = allCommonStories.filter(story => 
          story.createdByUserName === 'filiup'
        );
        console.log('🤖 FiliUp filter - stories by filiup:', filiupStories.length);
        filtered = filiupStories;
        break;
      }
      default:
        filtered = [...allStories, ...allCommonStories];
    }
    
    console.log('✅ Filtered results:', filtered.length, 'stories');
    return filtered;
  };

  // Function to fetch user statistics (extracted for reuse)
  const fetchUserStats = async () => {
    if (!user?.id) return;
    
    setStatsLoading(true);
    
    try {
      // Get user's leaderboard entry for points
      const { data: leaderboardResponse, error: leaderboardError } = await safeExecute(
        () => leaderboardService.getStudentRank(user.id),
        {
          showToast: false,
          preventAutoRedirect: true,
          onError: (appError) => {
            console.error('Error fetching user leaderboard data:', appError);
          }
        }
      );
      
      // Get user's progress data
      const { data: progressResponse, error: progressError } = await safeExecute(
        () => progressService.getStudentProgress(user.id),
        {
          showToast: false,
          preventAutoRedirect: true,
          onError: (appError) => {
            console.error('Error fetching user progress data:', appError);
          }
        }
      );
      
      // If both API calls failed, use default values
      if ((!leaderboardResponse || leaderboardError) && (!progressResponse || progressError)) {
        console.warn('Using default values for user stats due to API errors');
        setUserStats({
          ...userStats,
          totalPoints: 0,
          completedStories: 0,
          completedQuizzes: 0,
          level: 1
        });
        setStatsLoading(false);
        return;
      }
      
      // Extract actual data from API responses
      const leaderboardData = leaderboardResponse?.data;
      const progressData = progressResponse?.data;
      
      // Calculate stats from the fetched data
      const points = leaderboardData?.score || 0;
      
      // Count completed stories and quizzes from progress data
      const completedStories = progressData ? progressData.filter(
        (progress) => progress.storyId && progress.completedAt
      ).length : 0;
      
      const completedQuizzes = progressData ? progressData.filter(
        (progress) => progress.quizId && progress.completedAt
      ).length : 0;
      
      // Calculate level based on points (example formula)
      const level = Math.max(1, Math.floor(points / 100) + 1);
      
      // Update badges based on achievements
      const updatedBadges = [
        { id: 1, name: 'First Story', icon: '📖', earned: completedStories > 0 },
        { id: 2, name: 'Quiz Master', icon: '🎯', earned: completedQuizzes >= 5 },
        { id: 3, name: 'Story Explorer', icon: '🗺️', earned: completedStories >= 3 },
        { id: 4, name: 'Fast Learner', icon: '⚡', earned: level >= 3 },
        { id: 5, name: 'Perfect Score', icon: '💯', earned: points >= 500 },
      ];
      
      setUserStats({
        totalPoints: points,
        completedStories: completedStories,
        totalStories: stories.length || 0,
        completedQuizzes: completedQuizzes,
        totalQuizzes: completedQuizzes + 5, // Assuming there are more quizzes to complete
        level: level,
        badges: updatedBadges
      });
    } catch (err) {
      console.error('Error calculating user stats:', err);
      // Use fallback values if there's an error
      setUserStats({
        ...userStats,
        totalPoints: 0,
        completedStories: 0,
        completedQuizzes: 0,
        level: 1
      });
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch student's classes on component mount
  useEffect(() => {
    const fetchStudentClasses = async () => {
      setLoading(true);
      const { data: response, error } = await safeExecute(
        () => classService.getMyClasses(),
        {
          customMessage: "Hindi nakuha ang mga klase. Subukang i-refresh ang page.",
          preventAutoRedirect: true, // Don't redirect to login for class access issues
          onError: (appError) => {
            console.error('Error fetching student classes:', appError);
            setError('Failed to fetch classes');
          }
        }
      );

      if (response?.data) {
        setStudentClasses(response.data);
        setError(null);
      }
      
      setLoading(false);
    };

    fetchStudentClasses();
  }, [safeExecute]);

  // Fetch user statistics
  useEffect(() => {
    fetchUserStats();
  }, [user?.id, stories.length, safeExecute]);

  // Fetch stories for all enrolled classes
  useEffect(() => {
    const fetchStoriesForClasses = async () => {
      if (studentClasses.length === 0) return;

      setStoriesLoading(true);
      const allStories: ClassStory[] = [];
      const allCommonStories: CommonStoryDTO[] = [];

      // Fetch stories for each class
      for (const studentClass of studentClasses) {
        // Fetch class stories
        const { data: classStories, error: classStoriesError } = await safeExecute(
          () => storyService.getStoriesByClass(studentClass.classId),
          {
            showToast: false, // Don't show individual toasts for each class
            preventAutoRedirect: true,
            onError: (appError) => {
              console.error(`Error fetching stories for class ${studentClass.className}:`, appError);
            }
          }
        );

        if (classStories) {
          allStories.push(...classStories);
        }

        // Fetch common stories for the class
        const { data: commonStoriesResponse, error: commonStoriesError } = await safeExecute(
          () => classService.getClassCommonStories(studentClass.classId),
          {
            showToast: false,
            preventAutoRedirect: true,
            onError: (appError) => {
              console.error(`Error fetching common stories for class ${studentClass.className}:`, appError);
            }
          }
        );

        if (commonStoriesResponse?.data) {
          console.log(`📚 Common stories for class ${studentClass.className}:`, commonStoriesResponse.data);
          allCommonStories.push(...commonStoriesResponse.data);
        }
      }

      setStories(allStories);
      setCommonStories(allCommonStories);
      
      // Apply current filter to combined stories
      const filtered = filterStories(allStories, allCommonStories, storyFilter);
      setFilteredStories(filtered);
      
      // Show a single toast if no stories were loaded and there were errors
      if (allStories.length === 0 && allCommonStories.length === 0 && studentClasses.length > 0) {
        toast({
          title: "Info",
          description: "Hindi pa may mga kuwento sa inyong mga klase.",
        });
      }
      
      setStoriesLoading(false);
      
      // Update total stories count in userStats
      setUserStats(prev => ({
        ...prev,
        totalStories: allStories.length + allCommonStories.length
      }));
      
      // Refresh user stats after stories are loaded to get accurate completion percentages
      fetchUserStats();
    };

    fetchStoriesForClasses();
  }, [studentClasses, safeExecute]);

  // Update filtered stories when filter changes
  useEffect(() => {
    console.log('🔄 Filter effect triggered:', {
      storyFilter,
      storiesCount: stories.length,
      commonStoriesCount: commonStories.length
    });
    const filtered = filterStories(stories, commonStories, storyFilter);
    setFilteredStories(filtered);
    console.log('🎯 Set filtered stories count:', filtered.length);
  }, [stories, commonStories, storyFilter]);

  // Function to refresh classes after successful enrollment
  const handleEnrollmentSuccess = async () => {
    const { data: response, error } = await safeExecute(
      () => classService.getMyClasses(),
      {
        customMessage: "Hindi na-refresh ang mga klase. Subukang i-reload ang page.",
        preventAutoRedirect: true,
        onError: (appError) => {
          console.error('Error refreshing classes:', appError);
        }
      }
    );

    if (response?.data) {
      setStudentClasses(response.data);
    }
  };

  const getDifficultyFromGenre = (genre: string): string => {
    // Map genres to difficulty levels for display
    const genreDifficultyMap: { [key: string]: string } = {
      'ALAMAT': 'Medium',
      'PABULA': 'Easy',
      'MAIKLING_KWENTO': 'Medium',
      'TULA': 'Easy',
      'BUGTONG': 'Hard',
      'Adventure': 'Medium',
      'Mystery': 'Hard'
    };
    return genreDifficultyMap[genre] || 'Medium';
  };

  const getReadingTimeEstimate = (content: string): number => {
    // Estimate reading time based on content length (average 200 words per minute)
    const wordCount = content.split(' ').length;
    return Math.max(1, Math.ceil(wordCount / 200));
  };

  // Function to fetch class leaderboard
  const fetchClassLeaderboard = async () => {
    if (studentClasses.length === 0) return;
    
    setLeaderboardLoading(true);
    
    try {
      // Use quizService to get class average summary
      console.log('Fetching class average summary for leaderboard');
      
      const { data: summaryData, error } = await safeExecute(
        () => quizService.getClassAverageSummary(),
        {
          showToast: false,
          preventAutoRedirect: true,
          onError: (appError) => {
            console.error('Error fetching class average summary:', appError);
          }
        }
      );
      
      console.log('Class average summary API response:', summaryData, error);
      
      if (summaryData && summaryData.studentAttempts && summaryData.studentAttempts.length > 0) {
        // Aggregate student attempts by student
        const studentMap = new Map<string, {
          studentId: string;
          studentName: string;
          totalScore: number;
          totalMaxScore: number;
          totalPercentage: number;
          totalAttempts: number;
        }>();
        
        summaryData.studentAttempts.forEach((attempt) => {
          const existing = studentMap.get(attempt.studentId);
          if (existing) {
            existing.totalScore += attempt.score;
            existing.totalMaxScore += attempt.maxScore;
            existing.totalPercentage += attempt.percentage;
            existing.totalAttempts += 1;
          } else {
            studentMap.set(attempt.studentId, {
              studentId: attempt.studentId,
              studentName: attempt.studentName,
              totalScore: attempt.score,
              totalMaxScore: attempt.maxScore,
              totalPercentage: attempt.percentage,
              totalAttempts: 1,
            });
          }
        });
        
        // Convert to leaderboard format
        const leaderboardData: LeaderboardEntry[] = Array.from(studentMap.values())
          .map((student) => {
            const averagePercentage = student.totalAttempts > 0 ? student.totalPercentage / student.totalAttempts : 0;
            // Calculate a score based on total percentage (to display in leaderboard)
            // This is just to have a nice looking number in the UI
            const score = Math.round(averagePercentage * 100);
            
            return {
              entryId: student.studentId,
              studentId: student.studentId,
              studentName: student.studentName,
              studentEmail: "",
              score: score,
              percentage: averagePercentage.toFixed(1) + "%", // Add percentage property for display
              rank: 0, // Will be calculated after sorting
              category: "POINTS",
              timeFrame: "ALL_TIME",
              lastUpdated: new Date().toISOString()
            };
          })
          .sort((a, b) => b.score - a.score)
          .map((student, index) => ({
            ...student,
            rank: index + 1,
          }));
        
        console.log('Processed leaderboard data:', leaderboardData);
        setClassLeaderboard(leaderboardData);
      } else {
        console.warn('No leaderboard data received from API, using mock data');
        
        // Use mock data if no real data is available
        const mockLeaderboard = [
          {
            entryId: "1",
            studentId: user?.id || "current-user",
            studentName: "You",
            studentEmail: "",
            score: 245,
            percentage: "85.5%",
            rank: 1,
            category: "POINTS",
            timeFrame: "ALL_TIME",
            lastUpdated: new Date().toISOString()
          },
          {
            entryId: "2",
            studentId: "student2",
            studentName: "Maria Santos",
            studentEmail: "",
            score: 289,
            percentage: "95.0%",
            rank: 2,
            category: "POINTS",
            timeFrame: "ALL_TIME",
            lastUpdated: new Date().toISOString()
          },
          {
            entryId: "3",
            studentId: "student3",
            studentName: "Jose Cruz",
            studentEmail: "",
            score: 265,
            percentage: "90.0%",
            rank: 3,
            category: "POINTS",
            timeFrame: "ALL_TIME",
            lastUpdated: new Date().toISOString()
          },
          {
            entryId: "4",
            studentId: "student4",
            studentName: "Ana Reyes",
            studentEmail: "",
            score: 240,
            percentage: "82.5%",
            rank: 4,
            category: "POINTS",
            timeFrame: "ALL_TIME",
            lastUpdated: new Date().toISOString()
          }
        ];
        
        // Sort mock data by score
        const sortedMock = [...mockLeaderboard].sort((a, b) => b.score - a.score);
        console.log('Using mock leaderboard data:', sortedMock);
        setClassLeaderboard(sortedMock);
      }
    } catch (err) {
      console.error('Error calculating class leaderboard:', err);
      
             // Fallback to mock data on error
       const mockLeaderboard = [
        {
          entryId: "1",
          studentId: user?.id || "current-user",
          studentName: "You",
          studentEmail: "",
          score: 245,
          percentage: "85.5%",
          rank: 1,
          category: "POINTS",
          timeFrame: "ALL_TIME",
          lastUpdated: new Date().toISOString()
        },
        {
          entryId: "2",
          studentId: "student2",
          studentName: "Maria Santos",
          studentEmail: "",
          score: 289,
          percentage: "95.0%",
          rank: 2,
          category: "POINTS",
          timeFrame: "ALL_TIME",
          lastUpdated: new Date().toISOString()
        },
        {
          entryId: "3",
          studentId: "student3",
          studentName: "Jose Cruz",
          studentEmail: "",
          score: 265,
          percentage: "90.0%",
          rank: 3,
          category: "POINTS",
          timeFrame: "ALL_TIME",
          lastUpdated: new Date().toISOString()
        },
        {
          entryId: "4",
          studentId: "student4",
          studentName: "Ana Reyes",
          studentEmail: "",
          score: 240,
          percentage: "82.5%",
          rank: 4,
          category: "POINTS",
          timeFrame: "ALL_TIME",
          lastUpdated: new Date().toISOString()
        }
      ];
      
      // Sort mock data by score
      const sortedMock = [...mockLeaderboard].sort((a, b) => b.score - a.score);
      console.log('Using mock leaderboard data due to error:', sortedMock);
      setClassLeaderboard(sortedMock);
    } finally {
      setLeaderboardLoading(false);
    }
  };

  // Fetch class leaderboard after classes are loaded
  useEffect(() => {
    if (studentClasses.length > 0) {
      fetchClassLeaderboard();
    }
  }, [studentClasses]);



  // ENROLLMENT FLOW: If student has no accepted classes, show enrollment form
  // This calls /api/classes/myclasses which only returns classes where enrollment isAccepted = true
  if (loading || studentClasses.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
        {/* Inject custom styles */}
        <style dangerouslySetInnerHTML={{ __html: bookStyles }} />
        
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-teal-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  FiliUp
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <Link to="/leaderboards">
                  <Button variant="outline" className="text-teal-600 border-teal-200 hover:bg-teal-50">
                    Leaderboard
                  </Button>
                </Link>
                <Link to="/profile/edit">
                  <Button 
                    variant="outline" 
                    className="text-teal-600 border-teal-200 hover:bg-teal-50"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Profile
                  </Button>
                </Link>
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-medium">{user?.name}</span>
                </div>
                <Button variant="outline" onClick={logout}>
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Kumusta, {user?.name}! 👋
            </h1>
            {loading ? (
              <div className="flex justify-center items-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600 mr-3"></div>
                <p className="text-gray-600">Loading your classes...</p>
              </div>
            ) : error ? (
              <div className="text-center py-4">
                <p className="text-red-600 mb-2">Error loading classes. Please try again.</p>
                <Button 
                  onClick={() => window.location.reload()} 
                  variant="outline"
                  className="text-teal-600 border-teal-200 hover:bg-teal-50"
                >
                  Retry
                </Button>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 mb-2">
                  You are not enrolled in any classes yet.
                </p>
                <p className="text-sm text-gray-500">
                  Join your class to start your Filipino learning journey!
                </p>
              </div>
            )}
          </div>

          {!loading && !error && <StudentEnrollment onEnrollmentSuccess={handleEnrollmentSuccess} />}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
      {/* Inject custom styles */}
      <style dangerouslySetInnerHTML={{ __html: bookStyles }} />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-teal-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                FiliUp
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/leaderboards">
                <Button variant="outline" className="text-teal-600 border-teal-200 hover:bg-teal-50">
                  Leaderboard
                </Button>
              </Link>
              <Link to="/profile/edit">
                <Button 
                  variant="outline" 
                  className="text-teal-600 border-teal-200 hover:bg-teal-50"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Profile
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium">{user?.name}</span>
              </div>
              <Button variant="outline" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Kumusta, {user?.name}! 👋
          </h1>
          
          
          
        </div>

        {/* Progress Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-teal-400 to-cyan-500 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-teal-100">Total Points</p>
                  {statsLoading ? (
                    <div className="flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin text-teal-100 mr-2" />
                      <p className="text-2xl font-bold">Loading...</p>
                    </div>
                  ) : (
                    <p className="text-2xl font-bold">{userStats.totalPoints}</p>
                  )}
                </div>
                <Star className="h-8 w-8 text-teal-100" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-teal-500 to-cyan-400 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-teal-100">Stories Done</p>
                  {statsLoading ? (
                    <div className="flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin text-teal-100 mr-2" />
                      <p className="text-2xl font-bold">Loading...</p>
                    </div>
                  ) : (
                    <p className="text-2xl font-bold">{userStats.completedStories}/{userStats.totalStories}</p>
                  )}
                </div>
                <BookOpen className="h-8 w-8 text-teal-100" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-cyan-500 to-teal-400 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-cyan-100">Quiz Score</p>
                  {statsLoading ? (
                    <div className="flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin text-cyan-100 mr-2" />
                      <p className="text-2xl font-bold">Loading...</p>
                    </div>
                  ) : (
                    <p className="text-2xl font-bold">{userStats.completedQuizzes}/{userStats.totalQuizzes}</p>
                  )}
                </div>
                <Play className="h-8 w-8 text-cyan-100" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Stories Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-5 w-5" />
                    <span>Mga Kwento</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <Select value={storyFilter} onValueChange={(value: 'all' | 'teacher' | 'filiup') => {
                      console.log('📝 Filter changed to:', value);
                      setStoryFilter(value);
                    }}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Filter stories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Stories</SelectItem>
                        <SelectItem value="teacher">By Teachers</SelectItem>
                        <SelectItem value="filiup">By FiliUp</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardTitle>
                <CardDescription>
                  Basahin ang mga kwento at sagutin ang mga tanong para makakuha ng points!
                  {storyFilter === 'teacher' && ' (Teacher created stories)'}
                  {storyFilter === 'filiup' && ' (AI generated stories)'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {storiesLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-teal-600 mr-3" />
                    <p className="text-gray-600">Loading stories...</p>
                  </div>
                ) : filteredStories.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">
                      {storyFilter === 'all' 
                        ? 'No stories available yet.' 
                        : storyFilter === 'teacher' 
                        ? 'No teacher-created stories available yet.'
                        : 'No FiliUp AI stories available yet.'
                      }
                    </p>
                    <p className="text-sm text-gray-500">
                      {storyFilter === 'all' 
                        ? 'Your teachers will add stories to your classes soon!'
                        : 'Try changing the filter to see other stories.'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    {/* Timeline Line */}
                    <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-teal-300 via-cyan-400 to-teal-500"></div>
                    
                    <div className="space-y-8">
                      {filteredStories.map((story, index) => {
                        const isCommon = isCommonStory(story);
                        
                        let storyId: string;
                        let storyTitle: string;
                        let storyContent: string;
                        let storyGenre: string;
                        let storyFictionType: string;
                        let storyCoverUrl: string | undefined;
                        let storyCreatedAt: string;
                        let storyIsActive: boolean;
                        let storyClassName: string;
                        let createdBy: string | undefined;
                        
                        if (isCommon) {
                          storyId = story.storyId;
                          storyTitle = story.title;
                          storyContent = story.content;
                          storyGenre = story.genre;
                          storyFictionType = story.fictionType;
                          storyCoverUrl = story.coverPictureUrl;
                          storyCreatedAt = story.createdAt;
                          storyIsActive = story.isActive;
                          storyClassName = story.className;
                          createdBy = story.createdByUserName;
                        } else {
                          // Type guard ensures this is a ClassStory
                          storyId = story.storyId;
                          storyTitle = story.title;
                          storyContent = story.content;
                          storyGenre = story.genre;
                          storyFictionType = story.fictionType;
                          storyCoverUrl = story.coverPictureUrl;
                          storyCreatedAt = story.createdAt;
                          storyIsActive = story.isActive;
                          storyClassName = (story as any).classEntity?.className || 'Unknown Class';
                          createdBy = 'teacher';
                        }
                        
                        const difficulty = getDifficultyFromGenre(storyGenre);
                        const readingTime = getReadingTimeEstimate(storyContent);
                        
                        // Color schemes for different genres
                        const bookColors = {
                          'ALAMAT': 'from-amber-400 via-orange-500 to-red-500',
                          'PABULA': 'from-green-400 via-emerald-500 to-teal-500',
                          'MAIKLING_KWENTO': 'from-blue-400 via-indigo-500 to-purple-500',
                          'TULA': 'from-pink-400 via-rose-500 to-red-500',
                          'BUGTONG': 'from-purple-400 via-violet-500 to-indigo-500',
                          'Adventure': 'from-orange-400 via-amber-500 to-yellow-500',
                          'Mystery': 'from-gray-600 via-slate-700 to-gray-800'
                        };
                        
                        const shadowColors = {
                          'ALAMAT': 'shadow-orange-500/30',
                          'PABULA': 'shadow-teal-500/30',
                          'MAIKLING_KWENTO': 'shadow-indigo-500/30',
                          'TULA': 'shadow-rose-500/30',
                          'BUGTONG': 'shadow-violet-500/30',
                          'Adventure': 'shadow-amber-500/30',
                          'Mystery': 'shadow-gray-700/30'
                        };
                        
                        const bookGradient = bookColors[storyGenre as keyof typeof bookColors] || bookColors['MAIKLING_KWENTO'];
                        const shadowColor = shadowColors[storyGenre as keyof typeof shadowColors] || shadowColors['MAIKLING_KWENTO'];
                        
                        return (
                          <div key={`${isCommon ? 'common' : 'class'}-${storyId}`} className={`relative flex items-center ${index % 2 === 0 ? 'justify-start pl-20' : 'justify-end pr-20'}`}>
                            {/* Timeline Dot */}
                            <div className={`absolute ${index % 2 === 0 ? 'left-6' : 'right-6'} w-4 h-4 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-full border-4 border-white shadow-lg z-10`}></div>
                            
                            {/* 3D Book Container */}
                            <div className={`group cursor-pointer transition-all duration-500 hover:scale-105 hover:-translate-y-2 ${index % 2 === 0 ? '' : 'flex-row-reverse'}`}>
                              <Link to={`/story/${storyId}`}>
                                <div className="relative">
                                  {/* Book Main Body */}
                                  <div className={`relative w-48 h-64 bg-gradient-to-br ${bookGradient} rounded-r-lg rounded-l-sm shadow-2xl ${shadowColor} group-hover:shadow-3xl transition-all duration-500 transform perspective-1000`}>
                                    
                                    {/* Book Spine */}
                                    <div className="absolute left-0 top-0 w-2 h-full bg-gradient-to-b from-black/20 to-black/40 rounded-l-sm"></div>
                                    
                                    {/* Book Pages Effect */}
                                    <div className="absolute right-0 top-1 w-1 h-[calc(100%-8px)] bg-white/90 rounded-r-sm"></div>
                                    <div className="absolute right-1 top-2 w-1 h-[calc(100%-16px)] bg-white/70 rounded-r-sm"></div>
                                    <div className="absolute right-2 top-3 w-1 h-[calc(100%-24px)] bg-white/50 rounded-r-sm"></div>
                                    
                                    {/* Book Cover Content */}
                                    <div className="relative z-10 p-4 h-full flex flex-col justify-between">
                                      {/* Cover Image Area */}
                                      <div className="flex-1 mb-4">
                                        {storyCoverUrl ? (
                                          <img 
                                            src={storyCoverUrl} 
                                            alt={storyTitle}
                                            className="w-full h-32 object-cover rounded-lg shadow-md border-2 border-white/30"
                                          />
                                        ) : (
                                          <div className="w-full h-32 bg-white/20 rounded-lg shadow-md border-2 border-white/30 flex items-center justify-center">
                                            <BookOpen className="h-12 w-12 text-white/80" />
                                          </div>
                                        )}
                                      </div>
                                      
                                      {/* Book Title */}
                                      <div className="text-center">
                                        <h3 className="text-white font-bold text-sm leading-tight mb-2 drop-shadow-lg">
                                          {storyTitle}
                                        </h3>
                                        
                                        {/* Genre Badge */}
                                        <div className="mb-2">
                                          <span className="inline-block px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs text-white font-medium border border-white/30">
                                            {storyGenre}
                                          </span>
                                        </div>
                                        
                                        {/* Creator Badge */}
                                        {createdBy && (
                                          <div className="mb-2">
                                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${
                                              createdBy === 'filiup' 
                                                ? 'bg-purple-500/20 border-purple-300/30 text-purple-100' 
                                                : 'bg-blue-500/20 border-blue-300/30 text-blue-100'
                                            }`}>
                                              {createdBy === 'filiup' ? '🤖 AI Generated' : '👨‍🏫 Teacher'}
                                            </span>
                                          </div>
                                        )}
                                        
                                        {/* Reading Time */}
                                        <div className="text-white/80 text-xs">
                                          📖 {readingTime} min read
                                        </div>
                                      </div>
                                      
                                      {/* Decorative Lines (Book Spine Text Effect) */}
                                      <div className="absolute bottom-2 left-2 right-2">
                                        <div className="flex justify-center space-x-1">
                                          <div className="w-6 h-0.5 bg-white/40 rounded"></div>
                                          <div className="w-8 h-0.5 bg-white/60 rounded"></div>
                                          <div className="w-6 h-0.5 bg-white/40 rounded"></div>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {/* Bookmark Ribbon */}
                                    <div className="absolute top-0 right-8 w-6 h-16 bg-gradient-to-b from-red-400 to-red-600 shadow-lg transform -skew-x-3">
                                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-3 border-r-3 border-t-8 border-l-transparent border-r-transparent border-t-red-600"></div>
                                    </div>
                                    
                                    {/* Highlight Effect */}
                                    <div className="absolute top-4 left-4 w-8 h-12 bg-white/10 rounded-lg transform rotate-12 opacity-60"></div>
                                    
                                    {/* Status Indicator */}
                                    {storyIsActive && (
                                      <div className="absolute top-2 left-2 w-3 h-3 bg-green-400 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                                    )}
                                  </div>
                                  
                                  {/* Book Shadow Base */}
                                  <div className={`absolute top-2 left-2 w-48 h-64 bg-black/20 rounded-r-lg rounded-l-sm -z-10 transform transition-all duration-500 group-hover:translate-x-1 group-hover:translate-y-1`}></div>
                                </div>
                              </Link>
                              
                              {/* Story Details Card */}
                              <div className={`ml-6 bg-white rounded-lg shadow-lg p-4 border-l-4 border-teal-400 max-w-xs group-hover:shadow-xl transition-all duration-300 ${index % 2 === 0 ? 'ml-6' : 'mr-6 order-first'}`}>
                                <div className="space-y-2">
                                  <div className="flex items-center space-x-2">
                                    <Badge variant={
                                      difficulty === 'Easy' ? 'default' :
                                      difficulty === 'Medium' ? 'secondary' : 'destructive'
                                    } className="text-xs">
                                      {difficulty}
                                    </Badge>
                                    {storyFictionType && (
                                      <Badge variant="outline" className="text-xs">
                                        {storyFictionType}
                                      </Badge>
                                    )}
                                    {createdBy && (
                                      <Badge variant={createdBy === 'filiup' ? 'secondary' : 'default'} className="text-xs">
                                        {createdBy === 'filiup' ? '🤖 AI' : '👨‍🏫 Teacher'}
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  <p className="text-sm text-gray-600 line-clamp-3">
                                    {storyContent.substring(0, 120)}...
                                  </p>
                                  
                                  <div className="flex items-center justify-between text-xs text-gray-500">
                                    <span>📚 {storyClassName}</span>
                                    <span>🕒 {new Date(storyCreatedAt).toLocaleDateString()}</span>
                                  </div>
                                  
                                  <Button 
                                    size="sm"
                                    className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-md hover:shadow-lg transition-all duration-300"
                                  >
                                    Basahin ang Kwento
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Badges and Leaderboard Section */}
          <div>
            {/* Class Leaderboard Card */}
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5 text-green-600" />
                  <span>Class Leaderboard</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {leaderboardLoading ? (
                  <div className="flex justify-center items-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-teal-600 mr-3" />
                    <p className="text-gray-600">Loading leaderboard...</p>
                  </div>
                ) : classLeaderboard.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-gray-600">No leaderboard data available yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {classLeaderboard.slice(0, 5).map((entry, index) => {
                      const isCurrentUser = entry.studentId === user?.id;
                      const rankColors = {
                        0: 'text-yellow-500', // 1st place
                        1: 'text-gray-400',   // 2nd place
                        2: 'text-amber-700',  // 3rd place
                      };
                      
                      return (
                        <div 
                          key={entry.entryId || index} 
                          className={`flex items-center justify-between ${
                            isCurrentUser ? 'bg-blue-50 rounded-md' : ''
                          }`}
                        >
                          <div className="flex items-center">
                            <div className={`font-bold w-6 ${rankColors[index] || 'text-gray-600'}`}>
                              #{index + 1}
                            </div>
                            <div className="w-8 h-8 bg-gray-200 rounded-full mx-2"></div>
                            <div>
                              <div className="font-medium">
                                {isCurrentUser ? 'You' : entry.studentName}
                              </div>
                            </div>
                          </div>
                          <div className="font-bold text-indigo-600">
                            {entry.percentage || (entry.score + "%")}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Badges Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5" />
                  <span>Mga Badge</span>
                </CardTitle>
                <CardDescription>
                  Collect badges by completing stories and quizzes!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {statsLoading ? (
                    <div className="col-span-2 flex justify-center items-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-teal-600 mr-3" />
                      <p className="text-gray-600">Loading badges...</p>
                    </div>
                  ) : (
                    userStats.badges.map((badge) => (
                      <div
                        key={badge.id}
                        className={`p-4 rounded-lg text-center transition-all duration-300 ${
                          badge.earned
                            ? 'bg-gradient-to-br from-teal-100 to-cyan-100 border-2 border-teal-300 shadow-lg'
                            : 'bg-gray-100 border-2 border-gray-200 opacity-50'
                        }`}
                      >
                        <div className="text-2xl mb-2">{badge.icon}</div>
                        <div className="text-sm font-medium text-gray-700">{badge.name}</div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Progress Card */}
            {/* <Card className="mt-6">
              <CardHeader>
                <CardTitle>Overall Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Stories</span>
                    <span>{statsLoading ? 'Loading...' : `${userStats.completedStories}/${userStats.totalStories}`}</span>
                  </div>
                  <Progress 
                    value={statsLoading ? 0 : (userStats.totalStories > 0 ? (userStats.completedStories / userStats.totalStories) * 100 : 0)} 
                    className="h-2" 
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Quizzes</span>
                    <span>{statsLoading ? 'Loading...' : `${userStats.completedQuizzes}/${userStats.totalQuizzes}`}</span>
                  </div>
                  <Progress 
                    value={statsLoading ? 0 : (userStats.totalQuizzes > 0 ? (userStats.completedQuizzes / userStats.totalQuizzes) * 100 : 0)} 
                    className="h-2" 
                  />
                </div>
              </CardContent>
            </Card> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
