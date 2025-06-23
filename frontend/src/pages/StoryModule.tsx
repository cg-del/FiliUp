import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BookOpen, ArrowLeft, ArrowRight, Star, Loader2, Clock, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { getGenreByValue } from '@/constants/storyGenres';
import { storyService } from '@/lib/services/storyService';
import { quizService, type QuizData, type QuizAttempt, type QuizSubmission, type QuizSubmissionResult, type QuizEligibilityResponse, type QuizLogEntry } from '@/lib/services/quizService';
import { quizWebSocketService, type QuizWebSocketMessage } from '@/lib/services/quizWebSocketService';

// TypeScript interfaces for the API response
interface ClassEntity {
  className: string;
  description: string;
  createdAt: string;
  isActive: boolean;
  classCode: string;
  classId: string;
}

interface StoryData {
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

interface StoryPage {
  text: string;
  image?: string;
}

interface QuizComponentProps {
  quiz: QuizData;
  onComplete: (result: QuizSubmissionResult) => void;
  storyTitle: string;
  isQuizLocked: boolean;
  setIsQuizLocked: (locked: boolean) => void;
  isCommonStory?: boolean;
}

const StoryModule = () => {
  const { id: storyId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { safeExecute } = useErrorHandler();
  
  const [currentPage, setCurrentPage] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [story, setStory] = useState<StoryData | null>(null);
  const [storyPages, setStoryPages] = useState<StoryPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableQuizzes, setAvailableQuizzes] = useState<QuizData[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<QuizData | null>(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [isQuizLocked, setIsQuizLocked] = useState(false);
  const [fullscreenWarnings, setFullscreenWarnings] = useState(0);
  const [isCommonStory, setIsCommonStory] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      console.log('User not authenticated, redirecting to login');
      navigate('/login');
      return;
    }
  }, [user, navigate]);

  // Fetch story data from API
  useEffect(() => {
    const fetchStory = async () => {
      console.log('=== StoryModule Debug ===');
      console.log('storyId from useParams:', storyId);
      console.log('User authenticated:', !!user);
      console.log('Current user:', user);
      
      if (!user) {
        console.log('User not authenticated, skipping story fetch');
        return;
      }
      
      if (!storyId) {
        console.log('ERROR: storyId is undefined or null');
        setError('Story ID not found in URL');
        setLoading(false);
        return;
      }

      setLoading(true);
      
      // Try to fetch as a regular story first
      const { data: fetchedStory, error: storyError } = await safeExecute(
        () => storyService.getStoryById(storyId),
        {
          customMessage: "Hindi nakuha ang kuwento. Subukang muli.",
          preventAutoRedirect: true,
          showToast: false, // Don't show toast for the first attempt
          onError: (appError) => {
            console.error('Error fetching regular story:', appError);
          }
        }
      );

      // If regular story fetch failed, try as a common story
      if (!fetchedStory && storyError) {
        console.log('Regular story not found, trying as common story');
        
        const { data: commonStoryData, error: commonStoryError } = await safeExecute(
          () => import('@/lib/services/commonStoryService').then(module => {
            const commonStoryService = module.commonStoryService;
            return commonStoryService.getStoryById(storyId);
          }),
          {
            customMessage: "Hindi nakuha ang kuwento. Subukang muli.",
            preventAutoRedirect: true,
            onError: (appError) => {
              console.error('Error fetching common story:', appError);
              setError(`Failed to load story: ${appError.message}`);
              
              // If it's an authentication error, provide more specific guidance
              if (appError.type === 'AUTHENTICATION_ERROR') {
                setError('You may not have permission to access this story. Please check with your teacher.');
              }
            }
          }
        );
        
        if (commonStoryData) {
          console.log('Common story fetched successfully:', commonStoryData);
          // Transform common story to match StoryData format
          const transformedStory: StoryData = {
            storyId: commonStoryData.storyId,
            title: commonStoryData.title,
            content: commonStoryData.content,
            createdAt: commonStoryData.createdAt,
            isActive: commonStoryData.isActive || true,
            genre: commonStoryData.genre,
            fictionType: commonStoryData.fictionType || '',
            coverPictureUrl: commonStoryData.coverPictureUrl,
            coverPictureType: commonStoryData.coverPictureType,
            // Create a minimal class entity since common stories don't have one
            classEntity: {
              className: 'Common Story',
              description: 'FiliUp Common Story',
              createdAt: commonStoryData.createdAt,
              isActive: true,
              classCode: '',
              classId: ''
            }
          };
          
          setStory(transformedStory);
          setIsCommonStory(true);
          
          // Split content into pages based on paragraphs
          const paragraphs = transformedStory.content
            .split(/\\n\\n|\\n|\\r\\n/)
            .filter(paragraph => paragraph.trim().length > 0)
            .map(paragraph => paragraph.trim());

          const pages: StoryPage[] = paragraphs.map(paragraph => ({
            text: paragraph,
            image: transformedStory.coverPictureUrl
          }));

          console.log('Common story pages created:', pages.length);
          setStoryPages(pages);
          
          // Fetch available quizzes for this common story
          const { data: commonStoryQuizzes, error: commonQuizError } = await safeExecute(
            () => quizService.getQuizzesByCommonStory(storyId),
            {
              customMessage: "Hindi nakuha ang mga quiz. Magpatuloy sa pagbabasa.",
              showToast: false, // Don't show toast for quiz errors, they're not critical
              onError: (appError) => {
                console.error('Error fetching common story quizzes:', appError);
                // Set empty array if quizzes fail to load
                setAvailableQuizzes([]);
              }
            }
          );

          if (commonStoryQuizzes) {
            console.log('Available common story quizzes:', commonStoryQuizzes);
            setAvailableQuizzes(commonStoryQuizzes);
          } else {
            setAvailableQuizzes([]);
          }
          
          setLoading(false);
          return;
        }
      }

      if (fetchedStory) {
        console.log('Story fetched successfully:', fetchedStory);
        setStory(fetchedStory);
        
        // Split content into pages based on paragraphs
        const paragraphs = fetchedStory.content
          .split(/\\n\\n|\\n|\\r\\n/)
          .filter(paragraph => paragraph.trim().length > 0)
          .map(paragraph => paragraph.trim());

        const pages: StoryPage[] = paragraphs.map(paragraph => ({
          text: paragraph,
          image: fetchedStory.coverPictureUrl
        }));

        console.log('Story pages created:', pages.length);
        setStoryPages(pages);

        // Fetch available quizzes for this story
        const { data: quizzes, error: quizError } = await safeExecute(
          () => quizService.getQuizzesByStory(storyId),
          {
            customMessage: "Hindi nakuha ang mga quiz. Magpatuloy sa pagbabasa.",
            showToast: false, // Don't show toast for quiz errors, they're not critical
            onError: (appError) => {
              console.error('Error fetching quizzes:', appError);
              // Set empty array if quizzes fail to load
              setAvailableQuizzes([]);
            }
          }
        );

        if (quizzes) {
          console.log('Available quizzes:', quizzes);
          setAvailableQuizzes(quizzes);
        } else {
          setAvailableQuizzes([]);
        }
      } else {
        setError('Story not found. It may have been deleted or you may not have access to it.');
      }
      
      setLoading(false);
    };

    fetchStory();
  }, [storyId, user, safeExecute]);

  const handleStartQuiz = async (quiz: QuizData) => {
    const { error } = await safeExecute(
      async () => {
        setSelectedQuiz(quiz);
        setQuizStarted(true);
        setShowQuiz(true);
        
        toast({
          title: "Quiz Started! 📝",
          description: `You have ${quiz.timeLimitMinutes} minutes to complete this quiz.`,
        });
        
        return Promise.resolve();
      },
      {
        customMessage: "Failed to start quiz. Please try again.",
      }
    );
  };

  const handleFinishStory = (result: QuizSubmissionResult) => {
    const scorePercentage = result.scorePercentage;
    let message = "Natapos mo na ang kuwento!";
    
    if (scorePercentage >= 80) {
      message += " Excellent work! Nakakuha ka ng 100 points!";
    } else if (scorePercentage >= 60) {
      message += " Good job! Nakakuha ka ng 75 points!";
    } else {
      message += " Keep practicing! Nakakuha ka ng 50 points!";
    }

    toast({
      title: "Congratulations! 🎉",
      description: message,
    });
    navigate('/student-dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading story...</p>
        </div>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Story not found</h2>
          <p className="text-gray-600 mb-4">{error || 'The story you are looking for could not be found.'}</p>
          <Button 
            onClick={() => navigate('/student-dashboard')}
            className="bg-gradient-to-r from-blue-500 to-purple-500"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const genre = getGenreByValue(story.genre);
  const progress = storyPages.length > 0 ? ((currentPage + 1) / storyPages.length) * 100 : 0;

  const handleNext = () => {
    if (currentPage < storyPages.length - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      // Story completed, show quiz selection if available
      if (availableQuizzes.length > 0) {
        setShowQuiz(true);
      } else {
        // No quizzes available, just complete the story
        toast({
          title: "Congratulations! 🎉",
          description: "Natapos mo na ang kuwento! Nakakuha ka ng 50 points!",
        });
        navigate('/student-dashboard');
      }
    }
  };

  const handlePrevious = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (showQuiz) {
    if (!quizStarted && availableQuizzes.length > 0) {
      // Show quiz selection
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <Button
                variant="outline"
                onClick={() => setShowQuiz(false)}
                className="mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Balik sa Kwento
              </Button>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Choose a Quiz! 🧠</h1>
              <p className="text-gray-600">Select a quiz to test your understanding of the story.</p>
            </div>

            <div className="grid gap-4">
              {availableQuizzes.map((quiz) => (
                <Card key={quiz.quizId} className="shadow-xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{quiz.title}</CardTitle>
                        <p className="text-gray-600 mt-2">{quiz.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{quiz.timeLimitMinutes} min</span>
                        </Badge>
                        <Badge variant="outline">
                          {quiz.questions.length} questions
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => handleStartQuiz(quiz)}
                      className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 w-full"
                    >
                      Start Quiz
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (selectedQuiz) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              {!isQuizLocked && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowQuiz(false);
                    setQuizStarted(false);
                    setSelectedQuiz(null);
                  }}
                  className="mb-4"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Quiz Selection
                </Button>
              )}
              
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {isQuizLocked ? `🔒 ${selectedQuiz.title} - Secure Mode` : 'Quiz Time! 🧠'}
              </h1>
              
              {isQuizLocked ? (
                <p className="text-gray-600">You are taking this quiz in secure mode. Do not exit fullscreen or navigate away.</p>
              ) : (
                <p className="text-gray-600">Answer the questions about the story you just read.</p>
              )}
            </div>

            <QuizComponent 
              quiz={selectedQuiz} 
              onComplete={handleFinishStory}
              storyTitle={story.title}
              isQuizLocked={isQuizLocked}
              setIsQuizLocked={setIsQuizLocked}
              isCommonStory={isCommonStory}
            />
          </div>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/student-dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Balik sa Dashboard
          </Button>
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{story.title}</h1>
            <div className="flex items-center space-x-2">
              {genre && (
                <Badge 
                  className="text-white border-0" 
                  style={{ backgroundColor: genre.color }}
                >
                  {genre.label}
                </Badge>
              )}
              {story.fictionType && (
                <Badge variant="outline">
                  {story.fictionType}
                </Badge>
              )}
            </div>
          </div>
          <div className="mb-2">
            <p className="text-sm text-gray-600">
              Class: {story.classEntity.className} ({story.classEntity.classCode})
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Progress value={progress} className="h-2" />
            </div>
            <span className="text-sm text-gray-600">
              {currentPage + 1} of {storyPages.length}
            </span>
          </div>
        </div>

        {/* Story Content */}
        <Card className="mb-6 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            {storyPages.length > 0 && (
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  {storyPages[currentPage].image ? (
                    <img
                      src={storyPages[currentPage].image}
                      alt={`${story.title} - Page ${currentPage + 1}`}
                      className="w-full h-64 object-cover rounded-lg shadow-lg"
                      onError={(e) => {
                        // Fallback to placeholder if image fails to load
                        e.currentTarget.src = '/placeholder.svg?height=300&width=400';
                      }}
                    />
                  ) : (
                    <div className="w-full h-64 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-lg shadow-lg flex items-center justify-center">
                      <BookOpen className="h-16 w-16 text-teal-500" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-lg leading-relaxed text-gray-800 font-medium">
                    {storyPages[currentPage].text}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quiz Section for Common Stories */}
        {isCommonStory && availableQuizzes.length > 0 && (
          <Card className="mb-6 shadow-xl border-0 bg-gradient-to-r from-purple-50 to-indigo-50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  🧠 Test Your Understanding!
                </h3>
                <p className="text-gray-600 mb-4">
                  Ready to take a quiz about this story? Test your comprehension and earn points!
                </p>
                <Button
                  onClick={() => setShowQuiz(true)}
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  size="lg"
                >
                  🎯 Take Quiz ({availableQuizzes.length} available)
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentPage === 0}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Previous</span>
          </Button>

          <Button
            onClick={handleNext}
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 flex items-center space-x-2"
          >
            <span>{currentPage === storyPages.length - 1 ? (availableQuizzes.length > 0 ? 'Take Quiz' : 'Complete') : 'Next'}</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const QuizComponent = ({ quiz, onComplete, storyTitle, isQuizLocked, setIsQuizLocked, isCommonStory = false }: QuizComponentProps) => {
  const { toast } = useToast();
  const { safeExecute } = useErrorHandler();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Map<string, string>>(new Map());
  const [quizAttempt, setQuizAttempt] = useState<QuizAttempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<QuizSubmissionResult | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isExpired, setIsExpired] = useState(false);
  const [webSocketConnected, setWebSocketConnected] = useState(false);
  const [isResuming, setIsResuming] = useState(false);
  const [isSavingProgress, setIsSavingProgress] = useState(false);
  const [fullscreenWarnings, setFullscreenWarnings] = useState(0);

  // WebSocket message handler
  const handleWebSocketMessage = useCallback((message: QuizWebSocketMessage) => {
    console.log('Received WebSocket message:', message);
    
    if (message.type === 'QUIZ_TIMEOUT') {
      setIsExpired(true);
      toast({
        title: "Time's Up! ⏰",
        description: message.message,
        variant: "destructive",
      });
      // Auto-submit will be handled by backend
    } else if (message.type === 'TIME_WARNING') {
      toast({
        title: "Time Warning! ⚠️",
        description: message.message,
        variant: "destructive",
      });
    }
  }, [toast]);

  // Function to log suspicious actions
  const logSuspiciousAction = useCallback(async (action: string, description: string, severity: QuizLogEntry['severity']) => {
    if (!quizAttempt || !quizAttempt.attemptId) return;

    const logEntry = quizService.createLogEntry(action, description, severity, currentQuestion);
    
    try {
      await safeExecute(
        () => isCommonStory 
          ? quizService.logCommonStoryQuizSuspiciousAction(quizAttempt.attemptId, logEntry)
          : quizService.logSuspiciousAction(quizAttempt.attemptId, logEntry),
        {
          showToast: false, // Don't show toast for logging
          preventAutoRedirect: true,
          onError: (error) => {
            console.warn('Failed to log suspicious action:', error);
          }
        }
      );
    } catch (error) {
      console.warn('Error logging suspicious action:', error);
    }
  }, [quizAttempt, currentQuestion, safeExecute]);

  // Save progress as student answers questions
  const saveProgress = useCallback(async (answers: Map<string, string>, questionIndex: number) => {
    if (!quizAttempt || !quizAttempt.attemptId) return;

    setIsSavingProgress(true);

    const progress = {
      attemptId: quizAttempt.attemptId,
      currentAnswers: Array.from(answers.entries()).map(([questionId, selectedAnswer]) => ({
        questionId,
        selectedAnswer
      })),
      currentQuestionIndex: questionIndex
    };

    const { error } = await safeExecute(
      () => isCommonStory 
        ? quizService.saveCommonStoryQuizProgress(quizAttempt.attemptId, progress)
        : quizService.saveQuizProgress(quizAttempt.attemptId, progress),
      {
        showToast: false, // Don't show toast for auto-save
        preventAutoRedirect: true,
        onError: (appError) => {
          console.warn('Failed to save quiz progress:', appError);
        }
      }
    );

    setIsSavingProgress(false);
  }, [quizAttempt, safeExecute]);

  // Auto-save progress when answers change
  useEffect(() => {
    if (selectedAnswers.size > 0 && quizAttempt && !isExpired && !showResult) {
      // Debounce auto-save to avoid too many requests
      const timeoutId = setTimeout(() => {
        saveProgress(selectedAnswers, currentQuestion);
      }, 1000); // Save 1 second after last change

      return () => clearTimeout(timeoutId);
    }
  }, [selectedAnswers, currentQuestion, quizAttempt, isExpired, showResult, saveProgress]);

  // Fullscreen management functions
  const enterFullscreen = useCallback(async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      } else if ((document.documentElement as HTMLElement & { webkitRequestFullscreen?: () => Promise<void> }).webkitRequestFullscreen) {
        await (document.documentElement as HTMLElement & { webkitRequestFullscreen: () => Promise<void> }).webkitRequestFullscreen();
      } else if ((document.documentElement as HTMLElement & { msRequestFullscreen?: () => Promise<void> }).msRequestFullscreen) {
        await (document.documentElement as HTMLElement & { msRequestFullscreen: () => Promise<void> }).msRequestFullscreen();
      }
      console.log('Entered fullscreen mode for quiz security');
    } catch (error) {
      console.warn('Could not enter fullscreen mode:', error);
      toast({
        title: "Fullscreen Notice",
        description: "Please use fullscreen mode for better quiz experience. Press F11 if needed.",
        variant: "default",
      });
    }
  }, [toast]);

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ((document as Document & { webkitExitFullscreen?: () => Promise<void> }).webkitExitFullscreen) {
        await (document as Document & { webkitExitFullscreen: () => Promise<void> }).webkitExitFullscreen();
      } else if ((document as Document & { msExitFullscreen?: () => Promise<void> }).msExitFullscreen) {
        await (document as Document & { msExitFullscreen: () => Promise<void> }).msExitFullscreen();
      }
    } catch (error) {
      console.warn('Could not exit fullscreen mode:', error);
    }
  }, []);

  // Handle fullscreen change events
  const handleFullscreenChange = useCallback(() => {
    const isCurrentlyFullscreen = !!(
      document.fullscreenElement ||
      (document as Document & { webkitFullscreenElement?: Element }).webkitFullscreenElement ||
      (document as Document & { msFullscreenElement?: Element }).msFullscreenElement
    );

    if (isQuizLocked && !isCurrentlyFullscreen && !showResult && !isExpired) {
      // Student exited fullscreen during quiz - log this action
      logSuspiciousAction('FULLSCREEN_EXIT', 'Student exited fullscreen mode during quiz', 'HIGH');
      
      setFullscreenWarnings(prev => {
        const newCount = prev + 1;
        
        if (newCount >= 3) {
          // Too many warnings, auto-submit quiz
          logSuspiciousAction('AUTO_SUBMIT_VIOLATIONS', 'Quiz auto-submitted due to 3 fullscreen violations', 'CRITICAL');
          toast({
            title: "Quiz Auto-Submitted! ⚠️",
            description: "You have exited fullscreen mode too many times. The quiz has been automatically submitted for security reasons.",
            variant: "destructive",
          });
          // Auto-submit will be handled by useEffect below
        } else {
          // Show warning and re-enter fullscreen
          toast({
            title: `Fullscreen Warning ${newCount}/3! ⚠️`,
            description: `You must stay in fullscreen mode during the quiz. ${3 - newCount} warnings remaining before auto-submission.`,
            variant: "destructive",
          });
          
          // Re-enter fullscreen after a short delay
          setTimeout(() => {
            if (!showResult && !isExpired) {
              enterFullscreen();
            }
          }, 2000);
        }
        
        return newCount;
      });
    }
  }, [isQuizLocked, showResult, isExpired, toast, enterFullscreen, logSuspiciousAction]);

  // Set up fullscreen event listeners
  useEffect(() => {
    if (isQuizLocked) {
      document.addEventListener('fullscreenchange', handleFullscreenChange);
      document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.addEventListener('msfullscreenchange', handleFullscreenChange);

      return () => {
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
        document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.removeEventListener('msfullscreenchange', handleFullscreenChange);
      };
    }
  }, [isQuizLocked, handleFullscreenChange]);

  // Prevent certain keyboard shortcuts during quiz
  useEffect(() => {
    if (isQuizLocked) {
      const handleKeyDown = (e: KeyboardEvent) => {
        // Prevent common shortcuts that could be used to cheat
        if (
          (e.ctrlKey && (e.key === 't' || e.key === 'n' || e.key === 'w' || e.key === 'r')) || // New tab, window, close, refresh
          (e.altKey && e.key === 'Tab') || // Alt+Tab
          e.key === 'F5' || // Refresh
          (e.ctrlKey && e.shiftKey && e.key === 'I') || // Dev tools
          e.key === 'F12' // Dev tools
        ) {
          e.preventDefault();
          
          // Log the suspicious action
          const actionType = 'BLOCKED_SHORTCUT';
          let description = `Attempted to use blocked keyboard shortcut: ${e.key}`;
          if (e.ctrlKey) description += ' (Ctrl)';
          if (e.altKey) description += ' (Alt)';
          if (e.shiftKey) description += ' (Shift)';
          
          logSuspiciousAction(actionType, description, 'MEDIUM');
          
          toast({
            title: "Action Blocked",
            description: "This action is not allowed during the quiz.",
            variant: "destructive",
          });
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isQuizLocked, toast, logSuspiciousAction]);

  // Prevent browser navigation during quiz
  useEffect(() => {
    if (isQuizLocked) {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = 'You have an active quiz in progress. Are you sure you want to leave?';
        return 'You have an active quiz in progress. Are you sure you want to leave?';
      };

      const handlePopState = () => {
        toast({
          title: "Navigation Blocked",
          description: "You cannot navigate away during the quiz.",
          variant: "destructive",
        });
        // Push the current state back to prevent navigation
        window.history.pushState(null, '', window.location.href);
      };

      // Add a state to history to detect back button
      window.history.pushState(null, '', window.location.href);
      window.addEventListener('beforeunload', handleBeforeUnload);
      window.addEventListener('popstate', handlePopState);

      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [isQuizLocked, toast]);

  // Start quiz attempt and connect WebSocket
  useEffect(() => {
    const startOrResumeQuiz = async () => {
      setLoading(true);
      
      // First, check if student can attempt this quiz or has existing attempt
      const { data: eligibility, error: eligibilityError } = await safeExecute(
        () => isCommonStory 
          ? quizService.checkCommonStoryQuizEligibility(quiz.quizId)
          : quizService.checkQuizEligibility(quiz.quizId),
        {
          customMessage: "Hindi ma-check ang quiz eligibility. Subukang muli.",
          preventAutoRedirect: true,
        }
      );

      if (eligibilityError) {
        setLoading(false);
        return;
      }

      if (eligibility) {
        // If student has already completed this quiz
        if (eligibility.hasCompletedAttempt) {
          toast({
            title: "Quiz Already Completed",
            description: "You have already completed this quiz. You can only attempt each quiz once.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        // If student has an in-progress attempt, resume it
        if (eligibility.hasInProgressAttempt && eligibility.existingAttempt) {
          console.log('Resuming existing quiz attempt:', eligibility.existingAttempt);
          setIsResuming(true);
          
          // Get the attempt with progress
          const { data: attemptWithProgress, error: attemptError } = await safeExecute(
            () => quizService.getQuizAttemptWithProgress(eligibility.existingAttempt!.attemptId),
            {
              customMessage: "Hindi ma-load ang existing quiz attempt. Subukang muli.",
              preventAutoRedirect: true,
            }
          );

          if (attemptError) {
            setLoading(false);
            return;
          }

          if (attemptWithProgress) {
            setQuizAttempt(attemptWithProgress);
            
            // Restore saved answers if any
            if (attemptWithProgress.currentAnswers) {
              const restoredAnswers = new Map(
                Object.entries(attemptWithProgress.currentAnswers)
              );
              setSelectedAnswers(restoredAnswers);
            }
            
            // Restore current question index if available
            if (attemptWithProgress.currentQuestionIndex !== undefined && 
                attemptWithProgress.currentQuestionIndex !== null) {
              setCurrentQuestion(attemptWithProgress.currentQuestionIndex);
            }
            
            // Calculate remaining time
            const remaining = quizService.getRemainingTime(attemptWithProgress);
            setTimeRemaining(remaining);
            
            // Check if attempt has expired
            if (quizService.isAttemptExpired(attemptWithProgress)) {
              setIsExpired(true);
              toast({
                title: "Quiz Expired",
                description: "Your quiz time has expired. The quiz will be auto-submitted.",
                variant: "destructive",
              });
            } else {
              // Don't lock here, will be handled by useEffect below
              toast({
                title: "Quiz Resumed",
                description: "Your previous progress has been restored. Continue where you left off! You are now in secure mode.",
              });
            }
          }
        } else {
          // Start new attempt
          const { data: newAttempt, error: attemptError } = await safeExecute(
            () => isCommonStory 
              ? quizService.getOrCreateCommonStoryQuizAttempt(quiz.quizId)
              : quizService.getOrCreateQuizAttempt(quiz.quizId),
            {
              customMessage: "Hindi ma-start ang quiz. Subukang muli.",
              preventAutoRedirect: true,
            }
          );

          if (attemptError) {
            setLoading(false);
            return;
          }

          if (newAttempt) {
            setQuizAttempt(newAttempt);
            
            // Calculate initial time remaining
            const remaining = quizService.getRemainingTime(newAttempt);
            setTimeRemaining(remaining);
            
            // Don't lock here, will be handled by useEffect below
            toast({
              title: "Quiz Started! 📝",
              description: `You have ${quiz.timeLimitMinutes} minutes to complete this quiz. You are now in secure mode.`,
            });
          }
        }
      }

      // Try to connect to WebSocket - don't fail the quiz if this fails
      if (quizAttempt || eligibility?.existingAttempt) {
        const attempt = quizAttempt || eligibility?.existingAttempt;
        if (attempt) {
          const { error: wsError } = await safeExecute(
            async () => {
              const studentId = attempt.studentId;
              await quizWebSocketService.connect(studentId);
              quizWebSocketService.addMessageHandler(handleWebSocketMessage);
              setWebSocketConnected(true);
              console.log('WebSocket connected successfully');
              return Promise.resolve();
            },
            {
              showToast: false, // Don't show toast for WebSocket errors
              preventAutoRedirect: true,
              onError: (appError) => {
                console.warn('WebSocket connection failed, quiz will continue without real-time features:', appError);
                setWebSocketConnected(false);
                // Only show warning for new quizzes, not resumed ones
                if (!isResuming) {
                  toast({
                    title: "Info",
                    description: "Quiz started successfully. Real-time features may be limited.",
                  });
                }
              }
            }
          );
        }
      }
      
      setLoading(false);
    };

    startOrResumeQuiz();

    // Cleanup
    return () => {
      if (webSocketConnected) {
        quizWebSocketService.removeMessageHandler(handleWebSocketMessage);
        quizWebSocketService.disconnect();
      }
      
      // Exit fullscreen and unlock when leaving quiz
      if (isQuizLocked) {
        exitFullscreen();
        setIsQuizLocked(false);
      }
    };
  }, [quiz.quizId, handleWebSocketMessage, safeExecute, webSocketConnected, toast, isResuming, enterFullscreen]);

  // Exit fullscreen when quiz is completed
  useEffect(() => {
    if (showResult || isExpired) {
      if (isQuizLocked) {
        exitFullscreen();
        setIsQuizLocked(false);
      }
    }
  }, [showResult, isExpired, isQuizLocked, exitFullscreen]);

  // Lock quiz when quiz attempt becomes available (and not expired)
  useEffect(() => {
    if (quizAttempt && !isExpired && !showResult && !isQuizLocked) {
      setIsQuizLocked(true);
      enterFullscreen();
    }
  }, [quizAttempt, isExpired, showResult, isQuizLocked, enterFullscreen]);

  // Disable text selection, clipboard, and right-click during quiz
  useEffect(() => {
    if (isQuizLocked) {
      const handleContextMenu = (e: MouseEvent) => {
        e.preventDefault();
        
        // Log the suspicious action
        logSuspiciousAction('RIGHT_CLICK_BLOCKED', 'Attempted to right-click during quiz', 'LOW');
        
        toast({
          title: "Action Blocked",
          description: "Right-click is disabled during the quiz.",
          variant: "destructive",
        });
      };

      const handleCopy = (e: ClipboardEvent) => {
        e.preventDefault();
        
        // Log the suspicious action
        const actionType = e.type === 'copy' ? 'CLIPBOARD_COPY' : e.type === 'cut' ? 'CLIPBOARD_CUT' : 'CLIPBOARD_PASTE';
        logSuspiciousAction(actionType, `Attempted to use clipboard: ${e.type}`, 'MEDIUM');
        
        toast({
          title: "Action Blocked", 
          description: "Copy/paste is not allowed during the quiz.",
          variant: "destructive",
        });
      };

      const handleSelectStart = (e: Event) => {
        e.preventDefault();
      };

      const handleDragStart = (e: DragEvent) => {
        e.preventDefault();
      };

      // Add event listeners
      document.addEventListener('contextmenu', handleContextMenu);
      document.addEventListener('copy', handleCopy);
      document.addEventListener('cut', handleCopy);
      document.addEventListener('paste', handleCopy);
      document.addEventListener('selectstart', handleSelectStart);
      document.addEventListener('dragstart', handleDragStart);

      // Add CSS to disable text selection
      const style = document.createElement('style');
      style.textContent = `
        .quiz-no-select {
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
          -webkit-touch-callout: none !important;
          -webkit-tap-highlight-color: transparent !important;
        }
      `;
      document.head.appendChild(style);
      document.body.classList.add('quiz-no-select');

      return () => {
        document.removeEventListener('contextmenu', handleContextMenu);
        document.removeEventListener('copy', handleCopy);
        document.removeEventListener('cut', handleCopy);
        document.removeEventListener('paste', handleCopy);
        document.removeEventListener('selectstart', handleSelectStart);
        document.removeEventListener('dragstart', handleDragStart);
        document.body.classList.remove('quiz-no-select');
        if (style.parentNode) {
          style.parentNode.removeChild(style);
        }
      };
    }
  }, [isQuizLocked, toast]);

  // Auto-submit quiz when fullscreen warnings reach 3
  useEffect(() => {
    if (fullscreenWarnings >= 3 && !submitting && !showResult && !isExpired && quizAttempt) {
      console.log('Auto-submitting quiz due to 3 fullscreen violations');
      
      // Create submission with current answers
      const submission = {
        quizId: quiz.quizId,
        answers: Array.from(selectedAnswers.entries()).map(([questionId, selectedAnswer]) => ({
          questionId,
          selectedAnswer
        })),
        timeTakenMinutes: Math.ceil((quiz.timeLimitMinutes * 60 - timeRemaining) / 60)
      };

      // Set submitting state to prevent multiple submissions
      setSubmitting(true);

      // Submit the quiz
      const autoSubmit = async () => {
        const { data: submissionResult, error } = await safeExecute(
          () => isCommonStory 
            ? quizService.submitCommonStoryQuizAttempt(quizAttempt.attemptId, submission)
            : quizService.submitQuizAttempt(quizAttempt.attemptId, submission),
          {
            customMessage: "Quiz auto-submitted due to security violations.",
            preventAutoRedirect: true,
          }
        );

        if (submissionResult) {
          setResult(submissionResult);
          setShowResult(true);
          console.log('Quiz auto-submitted successfully:', submissionResult);
          
          toast({
            title: "Quiz Auto-Submitted! ⚠️",
            description: "Your quiz was automatically submitted due to multiple security violations.",
            variant: "destructive",
          });
        }

        setSubmitting(false);
      };

      autoSubmit();
    }
  }, [fullscreenWarnings, submitting, showResult, isExpired, quizAttempt, quiz.quizId, quiz.timeLimitMinutes, selectedAnswers, timeRemaining, safeExecute, toast]);

  // Timer countdown - works independently of WebSocket
  useEffect(() => {
    if (timeRemaining <= 0 || isExpired || showResult) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          setIsExpired(true);
          return 0;
        }
        
        // Show local warnings if WebSocket is not connected
        if (!webSocketConnected) {
          if (newTime === 300) { // 5 minutes remaining
            toast({
              title: "Time Warning! ⚠️",
              description: "5 minutes remaining!",
              variant: "destructive",
            });
          } else if (newTime === 60) { // 1 minute remaining
            toast({
              title: "Time Warning! ⚠️",
              description: "1 minute remaining!",
              variant: "destructive",
            });
          }
        }
        
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, isExpired, showResult, webSocketConnected, toast]);

  const handleAnswerSelect = (questionId: string, answer: string) => {
    if (isExpired) return;
    
    setSelectedAnswers(prev => {
      const newAnswers = new Map(prev);
      newAnswers.set(questionId, answer);
      return newAnswers;
    });
    
    // Progress will be auto-saved by the useEffect hook
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmitQuiz();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!quizAttempt || submitting) return;

    setSubmitting(true);

    // Prepare submission
    const submission: QuizSubmission = {
      quizId: quiz.quizId,
      answers: Array.from(selectedAnswers.entries()).map(([questionId, selectedAnswer]) => ({
        questionId,
        selectedAnswer
      })),
      timeTakenMinutes: Math.ceil((quiz.timeLimitMinutes * 60 - timeRemaining) / 60)
    };

    console.log('Submitting quiz:', submission);

    // Submit quiz using error handling
    const { data: submissionResult, error } = await safeExecute(
      () => isCommonStory 
        ? quizService.submitCommonStoryQuizAttempt(quizAttempt.attemptId, submission)
        : quizService.submitQuizAttempt(quizAttempt.attemptId, submission),
      {
        customMessage: "Hindi ma-submit ang quiz. Subukang muli.",
        preventAutoRedirect: true,
        onError: (appError) => {
          // Check for specific error conditions
          if (appError.statusCode === 400 && 
              appError.details?.message?.includes('expired')) {
            setIsExpired(true);
          }
        }
      }
    );

    if (submissionResult) {
      setResult(submissionResult);
      setShowResult(true);
      console.log('Quiz submitted successfully:', submissionResult);
    }

    setSubmitting(false);
  };

  if (loading) {
    return (
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">
            {isResuming ? 'Resuming your quiz progress...' : 'Starting quiz...'}
          </p>
          {isResuming && (
            <p className="text-sm text-gray-500 mt-2">
              Your previous answers and progress are being restored.
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  if (showResult && result) {
    const percentage = result.scorePercentage;

    return (
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Quiz Results! 🎉</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="text-6xl">
            {percentage >= 80 ? '🌟' : percentage >= 60 ? '👍' : '💪'}
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900 mb-2">
              {result.score}/{result.maxPossibleScore}
            </p>
            <p className="text-xl font-semibold text-gray-700 mb-2">
              {percentage.toFixed(1)}%
            </p>
            <p className="text-gray-600">
              {result.feedback || (percentage >= 80 ? 'Excellent work!' : percentage >= 60 ? 'Good job!' : 'Keep practicing!')}
            </p>
          </div>
          <div className="flex justify-center space-x-2">
            {[...Array(3)].map((_, i) => (
              <Star
                key={i}
                className={`h-8 w-8 ${
                  i < Math.ceil(percentage / 34) ? 'text-yellow-500 fill-current' : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <Button
            onClick={() => onComplete(result)}
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
            size="lg"
          >
            Complete Story
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isExpired) {
    return (
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Time's Up!</h2>
          <p className="text-gray-600 mb-4">Your quiz has been automatically submitted.</p>
          <p className="text-sm text-gray-500">Please wait for results...</p>
        </CardContent>
      </Card>
    );
  }

  const currentQuestionData = quiz.questions[currentQuestion];
  const isAnswered = selectedAnswers.has(currentQuestionData.questionId);

  return (
    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Question {currentQuestion + 1} of {quiz.questions.length}</CardTitle>
          <div className="flex items-center space-x-4">
            {/* Progress saving indicator */}
            {isSavingProgress && (
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Saving...</span>
              </div>
            )}
            
            {/* Security mode indicator */}
            {isQuizLocked && (
              <div className="flex items-center space-x-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                <span>🔒</span>
                <span>Secure Mode</span>
              </div>
            )}
            
            {/* Resume indicator */}
            {isResuming && (
              <div className="flex items-center space-x-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                <span>📄</span>
                <span>Resumed</span>
              </div>
            )}
            
            {/* Fullscreen warnings indicator */}
            {fullscreenWarnings > 0 && (
              <div className="flex items-center space-x-1 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                <span>⚠️</span>
                <span>{fullscreenWarnings}/3 warnings</span>
              </div>
            )}
            
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span className={`font-mono ${timeRemaining < 300 ? 'text-red-600' : ''}`}>
                {quizService.formatTime(timeRemaining)}
              </span>
            </div>
            <Progress value={((currentQuestion + 1) / quiz.questions.length) * 100} className="w-32 h-2" />
          </div>
          
          {/* Security notice when quiz is locked */}
          {isQuizLocked && (
            <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2 text-sm text-yellow-800">
                <span>🔐</span>
                <span>Quiz is in secure mode. Stay in fullscreen and avoid using other applications.</span>
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-900">
          {currentQuestionData.questionText}
        </h3>
        
        <div className="grid gap-3">
          {currentQuestionData.options.map((option: string, index: number) => {
            const isSelected = selectedAnswers.get(currentQuestionData.questionId) === option;
            return (
              <Button
                key={index}
                variant={isSelected ? 'default' : 'outline'}
                onClick={() => handleAnswerSelect(currentQuestionData.questionId, option)}
                disabled={isExpired}
                className={`p-4 h-auto text-left justify-start ${
                  isSelected 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <span className="font-medium mr-3">{String.fromCharCode(65 + index)}.</span>
                {option}
              </Button>
            );
          })}
        </div>

        <div className="flex justify-between">
          <Button
            onClick={handlePrevious}
            disabled={currentQuestion === 0 || isExpired}
            variant="outline"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={!isAnswered || isExpired || submitting}
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
          >
            {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {currentQuestion === quiz.questions.length - 1 ? 'Submit Quiz' : 'Next Question'}
            {!submitting && currentQuestion < quiz.questions.length - 1 && <ArrowRight className="h-4 w-4 ml-2" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default StoryModule;
