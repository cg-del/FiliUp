import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Award, User, Play, Star, Loader2 } from 'lucide-react';
import StudentEnrollment from '../components/StudentEnrollment';
import { enrollmentService } from '@/lib/services/enrollmentService';
import { classService } from '@/lib/services/classService';
import { storyService } from '@/lib/services/storyService';
import { toast } from '@/hooks/use-toast';
import type { Class } from '@/lib/services/types';

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

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const [studentClasses, setStudentClasses] = useState<Class[]>([]);
  const [stories, setStories] = useState<ClassStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [storiesLoading, setStoriesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [userProgress] = useState({
    totalStories: 12,
    completedStories: 7,
    totalQuizzes: 15,
    completedQuizzes: 9,
    points: 850,
    level: 3,
    badges: [
      { id: 1, name: 'First Story', icon: '📖', earned: true },
      { id: 2, name: 'Quiz Master', icon: '🎯', earned: true },
      { id: 3, name: 'Story Explorer', icon: '🗺️', earned: true },
      { id: 4, name: 'Fast Learner', icon: '⚡', earned: false },
      { id: 5, name: 'Perfect Score', icon: '💯', earned: false },
    ]
  });

  // Fetch student's classes on component mount
  useEffect(() => {
    const fetchStudentClasses = async () => {
      try {
        setLoading(true);
        const response = await classService.getMyClasses();
        if (response.data) {
          setStudentClasses(response.data);
        }
      } catch (err) {
        setError('Failed to fetch classes');
        console.error('Error fetching student classes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentClasses();
  }, []);

  // Fetch stories for all enrolled classes
  useEffect(() => {
    const fetchStoriesForClasses = async () => {
      if (studentClasses.length === 0) return;

      try {
        setStoriesLoading(true);
        const allStories: ClassStory[] = [];

        // Fetch stories for each class
        for (const studentClass of studentClasses) {
          try {
            const classStories = await storyService.getStoriesByClass(studentClass.classId);
            allStories.push(...classStories);
          } catch (err) {
            console.error(`Error fetching stories for class ${studentClass.className}:`, err);
          }
        }

        setStories(allStories);
      } catch (err) {
        console.error('Error fetching stories:', err);
        toast({
          title: "Error",
          description: "Hindi nakuha ang mga kuwento. Subukang muli.",
          variant: "destructive",
        });
      } finally {
        setStoriesLoading(false);
      }
    };

    fetchStoriesForClasses();
  }, [studentClasses]);

  // Function to refresh classes after successful enrollment
  const handleEnrollmentSuccess = async () => {
    try {
      const response = await classService.getMyClasses();
      if (response.data) {
        setStudentClasses(response.data);
      }
    } catch (err) {
      console.error('Error refreshing classes:', err);
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
          <p className="text-gray-600">
            Ready na ba kayong mag-explore ng mga bagong kwento? 
            You're enrolled in {studentClasses.length} {studentClasses.length === 1 ? 'class' : 'classes'}.
          </p>
          
          {/* Display enrolled classes */}
          {studentClasses.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Your Classes:</h3>
              <div className="flex flex-wrap gap-2">
                {studentClasses.map((cls) => (
                  <Badge key={cls.classId} variant="outline" className="px-3 py-1 text-sm">
                    {cls.className} ({cls.classCode})
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Progress Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-teal-400 to-cyan-500 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-teal-100">Total Points</p>
                  <p className="text-2xl font-bold">{userProgress.points}</p>
                </div>
                <Star className="h-8 w-8 text-teal-100" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-cyan-400 to-teal-500 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-cyan-100">Level</p>
                  <p className="text-2xl font-bold">{userProgress.level}</p>
                </div>
                <Award className="h-8 w-8 text-cyan-100" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-teal-500 to-cyan-400 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-teal-100">Stories Done</p>
                  <p className="text-2xl font-bold">{userProgress.completedStories}/{userProgress.totalStories}</p>
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
                  <p className="text-2xl font-bold">{userProgress.completedQuizzes}/{userProgress.totalQuizzes}</p>
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
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5" />
                  <span>Mga Kwento</span>
                </CardTitle>
                <CardDescription>
                  Basahin ang mga kwento at sagutin ang mga tanong para makakuha ng points!
                </CardDescription>
              </CardHeader>
              <CardContent>
                {storiesLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-teal-600 mr-3" />
                    <p className="text-gray-600">Loading stories...</p>
                  </div>
                ) : stories.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No stories available yet.</p>
                    <p className="text-sm text-gray-500">Your teachers will add stories to your classes soon!</p>
                  </div>
                ) : (
                  <div className="relative">
                    {/* Timeline Line */}
                    <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-teal-300 via-cyan-400 to-teal-500"></div>
                    
                    <div className="space-y-8">
                      {stories.map((story, index) => {
                        const difficulty = getDifficultyFromGenre(story.genre);
                        const readingTime = getReadingTimeEstimate(story.content);
                        
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
                        
                        const bookGradient = bookColors[story.genre as keyof typeof bookColors] || bookColors['MAIKLING_KWENTO'];
                        const shadowColor = shadowColors[story.genre as keyof typeof shadowColors] || shadowColors['MAIKLING_KWENTO'];
                        
                        return (
                          <div key={story.storyId} className={`relative flex items-center ${index % 2 === 0 ? 'justify-start pl-20' : 'justify-end pr-20'}`}>
                            {/* Timeline Dot */}
                            <div className={`absolute ${index % 2 === 0 ? 'left-6' : 'right-6'} w-4 h-4 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-full border-4 border-white shadow-lg z-10`}></div>
                            
                            {/* 3D Book Container */}
                            <div className={`group cursor-pointer transition-all duration-500 hover:scale-105 hover:-translate-y-2 ${index % 2 === 0 ? '' : 'flex-row-reverse'}`}>
                              <Link to={`/story/${story.storyId}`}>
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
                                        {story.coverPictureUrl ? (
                                          <img 
                                            src={story.coverPictureUrl} 
                                            alt={story.title}
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
                                          {story.title}
                                        </h3>
                                        
                                        {/* Genre Badge */}
                                        <div className="mb-2">
                                          <span className="inline-block px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs text-white font-medium border border-white/30">
                                            {story.genre}
                                          </span>
                                        </div>
                                        
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
                                    {story.isActive && (
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
                                    {story.fictionType && (
                                      <Badge variant="outline" className="text-xs">
                                        {story.fictionType}
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  <p className="text-sm text-gray-600 line-clamp-3">
                                    {story.content.substring(0, 120)}...
                                  </p>
                                  
                                  <div className="flex items-center justify-between text-xs text-gray-500">
                                    <span>📚 {story.classEntity.className}</span>
                                    <span>🕒 {new Date(story.createdAt).toLocaleDateString()}</span>
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

          {/* Badges Section */}
          <div>
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
                  {userProgress.badges.map((badge) => (
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
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Progress Card */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Overall Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Stories</span>
                    <span>{userProgress.completedStories}/{userProgress.totalStories}</span>
                  </div>
                  <Progress value={(userProgress.completedStories / userProgress.totalStories) * 100} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Quizzes</span>
                    <span>{userProgress.completedQuizzes}/{userProgress.totalQuizzes}</span>
                  </div>
                  <Progress value={(userProgress.completedQuizzes / userProgress.totalQuizzes) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
