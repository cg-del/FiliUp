import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Trophy, Target, Clock, Star, ArrowRight, CheckCircle, Lock, User, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { MultipleChoiceActivity } from './activities/MultipleChoiceActivity';
import { DragDropActivity } from './activities/DragDropActivity';
import { MatchingPairsActivity } from './activities/MatchingPairsActivity';
import { StoryComprehensionActivity } from './activities/StoryComprehensionActivity';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CenteredLoading, InlineLoading } from '@/components/ui/loading-spinner';
import { 
  studentAPI, 
  StudentDashboardResponse, 
  LessonContentResponse, 
  ActivityContentResponse,
  mapActivityType,
  mapActivityTypeToBackend,
  MultipleChoiceContent,
  DragDropContent,
  MatchingPairsContent,
  StoryComprehensionContent
} from '@/lib/api';

type ActivityType = 'multiple-choice' | 'drag-drop' | 'matching-pairs' | 'story-comprehension' | null;
type ViewType = 'lesson' | 'activities';

interface StudentDashboardProps {
  initialLessonId?: string;
  initialActivityId?: string;
  initialActivityType?: string;
  path?: string;
}

export const StudentDashboard = ({
  initialLessonId,
  initialActivityId,
  initialActivityType,
  path
}: StudentDashboardProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // State management
  const [currentActivity, setCurrentActivity] = useState<ActivityType>(initialActivityType as ActivityType || null);
  const [selectedLessonId, setSelectedLessonId] = useState<string>(initialLessonId || '');
  const [selectedActivityId, setSelectedActivityId] = useState<string>(initialActivityId || '');
  const [currentView, setCurrentView] = useState<ViewType>(initialLessonId ? 'lesson' : 'activities');
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // API Data state
  const [dashboardData, setDashboardData] = useState<StudentDashboardResponse | null>(null);
  const [lessonContent, setLessonContent] = useState<LessonContentResponse | null>(null);
  const [activityContent, setActivityContent] = useState<ActivityContentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPassModal, setShowPassModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  // Load dashboard data on component mount
  useEffect(() => {
    loadDashboardData();
    
    // Load initial lesson or activity if provided in URL
    if (initialLessonId && !initialActivityId) {
      loadLessonContent(initialLessonId);
    } else if (initialActivityId && initialActivityType) {
      loadActivityContent(initialActivityId);
    }
  }, [initialLessonId, initialActivityId, initialActivityType]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await studentAPI.getDashboard();
      setDashboardData(data);
    } catch (err: unknown) {
      console.error('Failed to load dashboard data:', err);
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Centralized back-to-dashboard handler
  const goToDashboard = () => {
    // Reset activity state
    setCurrentActivity(null);
    setSelectedActivityId('');
    setActivityContent(null);
    // Reset lesson state
    setCurrentView('activities');
    setSelectedLessonId('');
    setLessonContent(null);
    setCurrentSlide(0);
    // Navigate to dashboard route without full reload
    navigate('/student/dashboard', { replace: true });
  };

  const loadLessonContent = async (lessonId: string) => {
    try {
      setLoading(true);
      setError(null);
      const content = await studentAPI.getLessonContentStructured(lessonId);
      setLessonContent(content);
      setSelectedLessonId(lessonId);
    } catch (err: unknown) {
      console.error('Failed to load lesson content:', err);
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to load lesson content');
    } finally {
      setLoading(false);
    }
  };

  const loadActivityContent = async (activityId: string) => {
    try {
      setLoading(true);
      setError(null);
      const content = await studentAPI.getActivityContentStructured(activityId);
      console.log('Activity content loaded from API:', content);
      setActivityContent(content);
      setSelectedActivityId(activityId);
    } catch (err: unknown) {
      console.error('Failed to load activity content:', err);
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to load activity content');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteLesson = async () => {
    if (!selectedLessonId) return;
    
    try {
      await studentAPI.completeLesson(selectedLessonId);
      await loadDashboardData(); // Refresh dashboard data
      setCurrentView('activities');
    } catch (err: unknown) {
      console.error('Failed to complete lesson:', err);
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to complete lesson');
    }
  };

  const handleActivityComplete = async (score: number, percentage: number, answers?: (string | number | string[])[], timeSpentSeconds?: number) => {
    if (!selectedActivityId) return;

    try {
      // Submit activity results
      await studentAPI.submitActivity(selectedActivityId, {
        answers: answers || [],
        timeSpentSeconds: timeSpentSeconds || 0
      });
      
      // Determine pass based on activity's passing percentage (default to 75 if missing)
      const passThreshold = activityContent?.passingPercentage ?? 75;
      const isPass = percentage >= passThreshold;

      if (isPass) {
        setShowPassModal(true);
      } else {
        // Non-pass: return to dashboard as usual
        await loadDashboardData();
        setCurrentActivity(null);
        setActivityContent(null);
      }
    } catch (err: unknown) {
      console.error('Failed to submit activity:', err);
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to submit activity');
    }
  };

  const handleClosePassModal = async () => {
    setShowPassModal(false);
    await loadDashboardData();
    // Navigate back to dashboard/clear activity state
    setCurrentActivity(null);
    setActivityContent(null);
    navigate('/student/dashboard', { replace: true });
  };

  const handleStartActivity = async (lessonId: string, activityType: ActivityType) => {
    if (!activityType || !dashboardData) return;

    // Find the lesson and its activities
    const lesson = dashboardData.phases
      .flatMap(phase => phase.lessons)
      .find(l => l.id === lessonId);
    
    if (!lesson) return;

    // Find the specific activity
    const activity = lesson.activities?.find(
      a => mapActivityType(a.activityType) === activityType
    );

    if (!activity) return;

    // Update URL without refreshing the page
    navigate(`/student/activity/${activity.id}/${activityType}`, { replace: true });
    
    // Load activity content directly
    await loadActivityContent(activity.id);
    setCurrentActivity(activityType);
  };

  const handleStartLesson = async (lessonId: string) => {
    // Update URL without refreshing the page
    navigate(`/student/lesson/${lessonId}`, { replace: true });
    
    // Load lesson content directly
    await loadLessonContent(lessonId);
    setCurrentView('lesson');
    setCurrentSlide(0);
  };

  // Helper functions for progress tracking
  const isActivityUnlocked = (lessonId: string, activityType: ActivityType): boolean => {
    if (!dashboardData || !activityType) return false;

    const lesson = dashboardData.phases
      .flatMap(phase => phase.lessons)
      .find(l => l.id === lessonId);
    
    if (!lesson) return false;

    const activity = lesson.activities?.find(
      a => mapActivityType(a.activityType) === activityType
    );

    return activity?.isUnlocked || false;
  };

  const isLessonUnlocked = (lessonId: string): boolean => {
    if (!dashboardData) return false;

    // Find the current lesson and its position
    let currentLesson = null;
    let allLessons: any[] = [];
    
    for (const phase of dashboardData.phases) {
      for (const lesson of phase.lessons) {
        allLessons.push(lesson);
        if (lesson.id === lessonId) {
          currentLesson = lesson;
        }
      }
    }

    if (!currentLesson) return false;

    // Sort lessons by phase order and lesson order
    allLessons.sort((a, b) => {
      const phaseA = dashboardData.phases.find(p => p.lessons.some(l => l.id === a.id));
      const phaseB = dashboardData.phases.find(p => p.lessons.some(l => l.id === b.id));
      
      if (phaseA?.orderIndex !== phaseB?.orderIndex) {
        return (phaseA?.orderIndex || 0) - (phaseB?.orderIndex || 0);
      }
      
      return a.orderIndex - b.orderIndex;
    });

    // Find the index of current lesson
    const currentIndex = allLessons.findIndex(l => l.id === lessonId);
    
    // First lesson is always unlocked
    if (currentIndex === 0) return true;

    // Check if all activities in previous lessons are completed
    for (let i = 0; i < currentIndex; i++) {
      const previousLesson = allLessons[i];
      
      // Check if all activities in the previous lesson are completed
      if (previousLesson.activities && previousLesson.activities.length > 0) {
        const hasIncompleteActivities = previousLesson.activities.some(
          (activity: any) => !activity.isCompleted
        );
        
        if (hasIncompleteActivities) {
          return false; // Previous lesson has incomplete activities
        }
      }
    }

    return true; // All previous activities are completed
  };

  const getActivityStatus = (lessonId: string, activityType: ActivityType): 'locked' | 'unlocked' | 'completed' => {
    if (!dashboardData || !activityType) return 'locked';

    const lesson = dashboardData.phases
      .flatMap(phase => phase.lessons)
      .find(l => l.id === lessonId);
    
    if (!lesson) return 'locked';

    const activity = lesson.activities?.find(
      a => mapActivityType(a.activityType) === activityType
    );

    if (!activity) return 'locked';
    if (activity.isCompleted) return 'completed';
    if (activity.isUnlocked) return 'unlocked';
    return 'locked';
  };

  const getActivityPercentage = (lessonId: string, activityType: ActivityType): number | null => {
    if (!dashboardData || !activityType) return null;

    const lesson = dashboardData.phases
      .flatMap(phase => phase.lessons)
      .find(l => l.id === lessonId);
    
    if (!lesson) return null;

    const activity = lesson.activities?.find(
      a => mapActivityType(a.activityType) === activityType
    );

    return activity?.percentage || null;
  };

  // Loading state
  if (loading && !dashboardData) {
    return <CenteredLoading message="Loading dashboard..." />;
  }

  // Error state
  if (error && !dashboardData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={loadDashboardData}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>No dashboard data available</p>
      </div>
    );
  }

  // Loading state for activity content
  if (currentActivity && loading && !activityContent) {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-4">
          <Button variant="ghost" onClick={goToDashboard} className="mb-4">
            ← Back to Dashboard
          </Button>
        </div>
        <CenteredLoading message="Loading activity..." />
      </div>
    );
  }

  // Activity Views
  if (currentActivity && activityContent) {
    const activityTitle = `${currentActivity.charAt(0).toUpperCase() + currentActivity.slice(1).replace('-', ' ')} - ${activityContent.title}`;
    console.log('Activity content loaded:', activityContent);

    if (currentActivity === 'multiple-choice') {
      return (
        <div className="min-h-screen bg-background">
          <div className="p-4">
            <Button variant="ghost" onClick={goToDashboard} className="mb-4">
              ← Back to Dashboard
            </Button>
          </div>
          <MultipleChoiceActivity
            questions={activityContent.questions?.map(q => ({
              id: q.id,
              question: q.questionText,
              options: q.options,
              correctAnswer: q.correctAnswerIndex,
              explanation: q.explanation
            })) || []}
            title={activityTitle}
            onComplete={handleActivityComplete}
          />
          <Dialog open={showPassModal} onOpenChange={(open) => !open && handleClosePassModal()}>
            <DialogContent className="sm:max-w-[480px]">
              <DialogHeader>
                <DialogTitle className="text-center">Mabuhay!</DialogTitle>
              </DialogHeader>
              <div className="w-full flex justify-center">
                <img
                  src="https://res.cloudinary.com/dqv26p8im/image/upload/v1759808060/Mabuhay_x3j754.png"
                  alt="Mabuhay"
                  className="max-w-full h-auto"
                />
              </div>
              <DialogFooter>
                <Button onClick={handleClosePassModal} className="w-full">Continue</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      );
    }

    if (currentActivity === 'drag-drop') {
      return (
        <div className="min-h-screen bg-background">
          <div className="p-4">
            <Button variant="ghost" onClick={goToDashboard} className="mb-4">
              ← Back to Dashboard
            </Button>
          </div>
          <DragDropActivity
            items={(activityContent.dragDropItems || []).map((it: NonNullable<ActivityContentResponse['dragDropItems']>[number]) => {
              const item = it as unknown as { id: string; text: string; correctCategory?: string; category?: string; orderIndex?: number };
              return {
                id: item.id,
                text: item.text,
                correctCategory: item.correctCategory ?? item.category ?? '',
                orderIndex: item.orderIndex ?? 0,
              };
            })}
            categories={(activityContent.dragDropCategories || []).map((c: NonNullable<ActivityContentResponse['dragDropCategories']>[number]) => {
              const cat = c as unknown as { id: string; categoryId?: string; name: string; colorClass?: string; color?: string; orderIndex?: number };
              return {
                id: cat.id,
                categoryId: cat.categoryId ?? cat.id,
                name: cat.name,
                colorClass: cat.colorClass ?? cat.color ?? 'bg-blue-100',
                orderIndex: cat.orderIndex ?? 0,
              };
            })}
            title={activityTitle}
            instructions={activityContent.instructions}
            onComplete={handleActivityComplete}
          />
          <Dialog open={showPassModal} onOpenChange={(open) => !open && handleClosePassModal()}>
            <DialogContent className="sm:max-w-[480px]">
              <DialogHeader>
                <DialogTitle className="text-center">Mabuhay!</DialogTitle>
              </DialogHeader>
              <div className="w-full flex justify-center">
                <img
                  src="https://res.cloudinary.com/dqv26p8im/image/upload/v1759808060/Mabuhay_x3j754.png"
                  alt="Mabuhay"
                  className="max-w-full h-auto"
                />
              </div>
              <DialogFooter>
                <Button onClick={handleClosePassModal} className="w-full">Continue</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      );
    }

    if (currentActivity === 'matching-pairs') {
      return (
        <div className="min-h-screen bg-background">
          <div className="p-4">
            <Button variant="ghost" onClick={goToDashboard} className="mb-4">
              ← Back to Dashboard
            </Button>
          </div>
          <MatchingPairsActivity
            pairs={(activityContent.matchingPairs || []).map(pair => ({
              id: pair.id,
              left: pair.leftText,
              right: pair.rightText
            }))}
            title={activityTitle}
            instructions={activityContent.instructions}
            onComplete={handleActivityComplete}
          />
          <Dialog open={showPassModal} onOpenChange={(open) => !open && handleClosePassModal()}>
            <DialogContent className="sm:max-w-[480px]">
              <DialogHeader>
                <DialogTitle className="text-center">Mabuhay!</DialogTitle>
              </DialogHeader>
              <div className="w-full flex justify-center">
                <img
                  src="https://res.cloudinary.com/dqv26p8im/image/upload/v1759808060/Mabuhay_x3j754.png"
                  alt="Mabuhay"
                  className="max-w-full h-auto"
                />
              </div>
              <DialogFooter>
                <Button onClick={handleClosePassModal} className="w-full">Continue</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      );
    }

    if (currentActivity === 'story-comprehension') {
      return (
        <div className="min-h-screen bg-background">
          <div className="p-4">
            <Button variant="ghost" onClick={goToDashboard} className="mb-4">
              ← Back to Dashboard
            </Button>
          </div>
          <StoryComprehensionActivity
            title={activityTitle}
            story={activityContent.storyText || ''}
            questions={activityContent.questions?.map(q => ({
              id: q.id,
              question: q.questionText,
              options: q.options,
              correctAnswer: q.correctAnswerIndex,
              explanation: q.explanation
            })) || []}
            onComplete={handleActivityComplete}
          />
          <Dialog open={showPassModal} onOpenChange={(open) => !open && handleClosePassModal()}>
            <DialogContent className="sm:max-w-[480px]">
              <DialogHeader>
                <DialogTitle className="text-center">Mabuhay!</DialogTitle>
              </DialogHeader>
              <div className="w-full flex justify-center">
                <img
                  src="https://res.cloudinary.com/dqv26p8im/image/upload/v1759808060/Mabuhay_x3j754.png"
                  alt="Mabuhay"
                  className="max-w-full h-auto"
                />
              </div>
              <DialogFooter>
                <Button onClick={handleClosePassModal} className="w-full">Continue</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      );
    }
    
    // If we get here, we have an activity type that doesn't match any of the above
    console.error('Unhandled activity type:', currentActivity, activityContent);
  }

  // Loading state for lesson content
  if (currentView === 'lesson' && loading && !lessonContent) {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-4">
          <Button variant="ghost" onClick={goToDashboard} className="mb-4">
            ← Back to Dashboard
          </Button>
        </div>
        <CenteredLoading message="Loading lesson..." />
      </div>
    );
  }

  // Lesson View
  if (currentView === 'lesson' && lessonContent) {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-4">
          <Button variant="ghost" onClick={goToDashboard} className="mb-4">
            ← Back to Dashboard
          </Button>
        </div>
        
        <div className="max-w-4xl mx-auto p-6">
          <Card className="learning-card">
            <CardHeader>
              <CardTitle className="text-center text-2xl text-primary">
                {lessonContent.title}
              </CardTitle>
              <div className="text-center text-muted-foreground">
                Slide {currentSlide + 1} of {lessonContent.slides.length}
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4 text-center">
                  {lessonContent.slides[currentSlide].title}
                </h3>
                <div className="space-y-3 text-lg leading-relaxed">
                  {lessonContent.slides[currentSlide].content.map((line, index) => (
                    <div key={index} className={line.trim() === '' ? 'h-2' : ''}>
                      <div dangerouslySetInnerHTML={{ __html: line }} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center mt-8">
                <Button
                  variant="outline"
                  onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                  disabled={currentSlide === 0}
                >
                  ← Previous
                </Button>

                <Progress value={(currentSlide + 1) / lessonContent.slides.length * 100} className="w-48" />

                {currentSlide < lessonContent.slides.length - 1 ? (
                  <Button
                    variant="default"
                    onClick={() => setCurrentSlide(currentSlide + 1)}
                  >
                    Next →
                  </Button>
                ) : (
                  <Button
                    variant="success"
                    onClick={handleCompleteLesson}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Complete Lesson
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Main Dashboard View
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">FiliUp</h1>
            <p className="text-muted-foreground">Welcome, {dashboardData.student.name}! 👋</p>
          </div>
          {/* Desktop actions */}
          <div className="hidden md:flex items-center space-x-3">
            <Button 
              variant="outline" 
              onClick={() => navigate('/student/leaderboard')}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Leaderboard
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/student/profile')}
            >
              <User className="h-4 w-4 mr-2" />
              Profile
            </Button>
            <Button variant="ghost" onClick={handleLogout}>
              Logout
            </Button>
          </div>
          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="outline" size="sm" onClick={() => setMobileMenuOpen((o) => !o)}>
              ☰
            </Button>
          </div>
        </div>
        {/* Mobile menu panel */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 max-w-6xl mx-auto">
            <div className="flex flex-col gap-2">
              <Button variant="outline" onClick={() => navigate('/student/leaderboard')} className="w-full text-left">
                Leaderboard
              </Button>
              <Button variant="outline" onClick={() => navigate('/student/profile')} className="w-full text-left">
                Profile
              </Button>
              <Button variant="ghost" onClick={handleLogout} className="w-full text-left">
                Logout
              </Button>
            </div>
          </div>
        )}
      </header>

      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="learning-card">
            <CardContent className="flex items-center p-4">
              <div className="p-2 rounded-lg bg-gradient-primary mr-3">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold">{dashboardData.stats.completedLessons}</div>
                <div className="text-xs text-muted-foreground">Completed Lessons</div>
              </div>
            </CardContent>
          </Card>

          <Card className="learning-card">
            <CardContent className="flex items-center p-4">
              <div className="p-2 rounded-lg bg-gradient-primary mr-3">
                <Trophy className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold">{dashboardData.stats.totalScore}</div>
                <div className="text-xs text-muted-foreground">Total Points</div>
              </div>
            </CardContent>
          </Card>

          <Card className="learning-card">
            <CardContent className="flex items-center p-4">
              <div className="p-2 rounded-lg bg-gradient-primary mr-3">
                <Target className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold">{dashboardData.stats.currentLevel}</div>
                <div className="text-xs text-muted-foreground">Current Level</div>
              </div>
            </CardContent>
          </Card>

          <Card className="learning-card">
            <CardContent className="flex items-center p-4">
              <div className="p-2 rounded-lg bg-gradient-primary mr-3">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold">{dashboardData.stats.studyDays}</div>
                <div className="text-xs text-muted-foreground">Study Days</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Learning Phases */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold">Lessons</h2>
          
          {dashboardData.phases.map((phase) => (
            <div key={phase.id} className="space-y-4">
              <div className="flex items-center space-x-3">
                <h3 className="text-2xl font-semibold text-primary">{phase.title}</h3>
              </div>
              <p className="text-muted-foreground mb-4" dangerouslySetInnerHTML={{ __html: phase.description }} />
              
              <div className="grid gap-6">
                {phase.lessons.map((lesson) => {
                  const completedActivities = lesson.completedActivitiesCount || 0;
                  const totalActivities = lesson.totalActivities || 0;
                  const lessonProgress = lesson.progressPercentage || 0;
                  
                  return (
                    <Card key={lesson.id} className="learning-card">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start space-x-4">
                            <div className="bg-gradient-primary p-3 rounded-lg text-white">
                              <BookOpen className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-xl font-semibold mb-2">{lesson.title}</h4>
                              <p className="text-muted-foreground mb-3" dangerouslySetInnerHTML={{ __html: lesson.description }} />
                              
                              <div className="flex items-center space-x-4 mb-3">
                                <div className="flex items-center space-x-2">
                                  <Progress value={lessonProgress} className="w-32" />
                                  <span className="text-sm font-medium">{lessonProgress}%</span>
                                </div>
                                <Badge variant="secondary">
                                  {completedActivities}/{totalActivities} activities
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {lessonProgress > 0 && lessonProgress < 100 && <Star className="h-5 w-5 text-warning" />}
                            {lessonProgress === 100 && <CheckCircle className="h-5 w-5 text-success" />}
                          </div>
                        </div>

                        {/* Lesson and Activity Buttons */}
                        <div className="space-y-4">
                          {/* Read Lesson Button */}
                          <div className="border-b pb-4">
                            {(() => {
                              const lessonUnlocked = isLessonUnlocked(lesson.id);
                              const isLocked = !lessonUnlocked;
                              
                              return (
                                <Button
                                  variant={lesson.isCompleted ? "success" : isLocked ? "outline" : "hero"}
                                  className={`w-full h-16 text-lg ${isLocked ? 'opacity-60' : ''}`}
                                  disabled={isLocked}
                                  onClick={() => {
                                    if (!isLocked) {
                                      handleStartLesson(lesson.id);
                                    }
                                  }}
                                >
                                  {isLocked && <Lock className="h-5 w-5 mr-2" />}
                                  {!isLocked && lesson.isCompleted && <CheckCircle className="h-5 w-5 mr-2" />}
                                  {!isLocked && !lesson.isCompleted && <BookOpen className="h-5 w-5 mr-2" />}
                                  {isLocked 
                                    ? 'Complete Previous Activities First' 
                                    : lesson.isCompleted 
                                    ? 'Lesson Completed - Read Again' 
                                    : 'Read Lesson First'
                                  }
                                </Button>
                              );
                            })()}
                          </div>

                          {/* Activity Buttons */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {/* Multiple Choice */}
                            {(() => {
                              const status = getActivityStatus(lesson.id, 'multiple-choice');
                              const percentage = getActivityPercentage(lesson.id, 'multiple-choice');
                              const isLocked = status === 'locked';
                              const isCompleted = status === 'completed';
                              
                              return (
                                <Button
                                  variant={isCompleted ? "success" : "outline"}
                                  className={`h-20 flex flex-col justify-center items-center p-2 w-full ${isCompleted ? 'border-success' : ''}`}
                                  disabled={isLocked}
                                  onClick={() => {
                                    if (!isLocked) {
                                      handleStartActivity(lesson.id, 'multiple-choice');
                                    }
                                  }}
                                >
                                  <div className="flex items-center justify-center mb-1">
                                    {isLocked ? (
                                      <Lock className="h-4 w-4" />
                                    ) : isCompleted ? (
                                      <CheckCircle className="h-4 w-4 text-white" />
                                    ) : (
                                      <Target className="h-4 w-4" />
                                    )}
                                  </div>
                                  <span className="text-xs text-center leading-tight">Multiple Choice</span>
                                  {percentage !== undefined && (
                                    <span className="text-xs font-semibold mt-1">{percentage}%</span>
                                  )}
                                </Button>
                              );
                            })()}

                            {/* Drag & Drop */}
                            {(() => {
                              const status = getActivityStatus(lesson.id, 'drag-drop');
                              const percentage = getActivityPercentage(lesson.id, 'drag-drop');
                              const isLocked = status === 'locked';
                              const isCompleted = status === 'completed';
                              
                              return (
                                <Button
                                  variant={isCompleted ? "success" : "outline"}
                                  className={`h-20 flex flex-col justify-center items-center p-2 w-full ${isCompleted ? 'border-success' : ''}`}
                                  disabled={isLocked}
                                  onClick={() => {
                                    if (!isLocked) {
                                      handleStartActivity(lesson.id, 'drag-drop');
                                    }
                                  }}
                                >
                                  <div className="flex items-center justify-center mb-1">
                                    {isLocked ? (
                                      <Lock className="h-4 w-4" />
                                    ) : isCompleted ? (
                                      <CheckCircle className="h-4 w-4 text-white" />
                                    ) : (
                                      <ArrowRight className="h-4 w-4" />
                                    )}
                                  </div>
                                  <span className="text-xs text-center leading-tight">Drag & Drop</span>
                                  {percentage !== undefined && (
                                    <span className="text-xs font-semibold mt-1">{percentage}%</span>
                                  )}
                                </Button>
                              );
                            })()}

                            {/* Matching Pairs */}
                            {(() => {
                              const status = getActivityStatus(lesson.id, 'matching-pairs');
                              const percentage = getActivityPercentage(lesson.id, 'matching-pairs');
                              const isLocked = status === 'locked';
                              const isCompleted = status === 'completed';
                              
                              return (
                                <Button
                                  variant={isCompleted ? "success" : "outline"}
                                  className={`h-20 flex flex-col justify-center items-center p-2 w-full ${isCompleted ? 'border-success' : ''}`}
                                  disabled={isLocked}
                                  onClick={() => {
                                    if (!isLocked) {
                                      handleStartActivity(lesson.id, 'matching-pairs');
                                    }
                                  }}
                                >
                                  <div className="flex items-center justify-center mb-1">
                                    {isLocked ? (
                                      <Lock className="h-4 w-4" />
                                    ) : isCompleted ? (
                                      <CheckCircle className="h-4 w-4 text-white" />
                                    ) : (
                                      <Star className="h-4 w-4" />
                                    )}
                                  </div>
                                  <span className="text-xs text-center leading-tight">Matching Pairs</span>
                                  {percentage !== undefined && (
                                    <span className="text-xs font-semibold mt-1">{percentage}%</span>
                                  )}
                                </Button>
                              );
                            })()}

                            {/* Story Reading */}
                            {(() => {
                              const status = getActivityStatus(lesson.id, 'story-comprehension');
                              const percentage = getActivityPercentage(lesson.id, 'story-comprehension');
                              const isLocked = status === 'locked';
                              const isCompleted = status === 'completed';
                              
                              return (
                                <Button
                                  variant={isCompleted ? "success" : "outline"}
                                  className={`h-20 flex flex-col justify-center items-center p-2 w-full ${isCompleted ? 'border-success' : ''}`}
                                  disabled={isLocked}
                                  onClick={() => {
                                    if (!isLocked) {
                                      handleStartActivity(lesson.id, 'story-comprehension');
                                    }
                                  }}
                                >
                                  <div className="flex items-center justify-center mb-1">
                                    {isLocked ? (
                                      <Lock className="h-4 w-4" />
                                    ) : isCompleted ? (
                                      <CheckCircle className="h-4 w-4 text-white" />
                                    ) : (
                                      <BookOpen className="h-4 w-4" />
                                    )}
                                  </div>
                                  <span className="text-xs text-center leading-tight">Story Reading</span>
                                  {percentage !== undefined && (
                                    <span className="text-xs font-semibold mt-1">{percentage}%</span>
                                  )}
                                </Button>
                              );
                            })()}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
