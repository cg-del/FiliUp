import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Trophy, Target, Clock, Star, ArrowRight, CheckCircle, Lock, User, TrendingUp } from 'lucide-react';
import { SimpleThemeToggle } from '@/components/ui/theme-toggle';
import { useAuth } from '@/contexts/AuthContext';
import { MultipleChoiceActivity } from './activities/MultipleChoiceActivity';
import { DragDropActivity } from './activities/DragDropActivity';
import { MatchingPairsActivity } from './activities/MatchingPairsActivity';
import { StoryComprehensionActivity } from './activities/StoryComprehensionActivity';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
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
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);
  const [showLessonReminder, setShowLessonReminder] = useState(false);
  const [showLessonComplete, setShowLessonComplete] = useState(false);
  const [selectedLessonForReminder, setSelectedLessonForReminder] = useState<{id: string, title: string} | null>(null);
  const [completedLessonTitle, setCompletedLessonTitle] = useState<string>('');
  const [selectedPhaseForModal, setSelectedPhaseForModal] = useState<string | null>(null);
  const [showActivityConfirmation, setShowActivityConfirmation] = useState(false);
  const [pendingActivity, setPendingActivity] = useState<{lessonId: string, activityType: ActivityType} | null>(null);

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleConfirmLogout = () => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLessonId, initialActivityId, initialActivityType]);

  // Show welcome dialog for new students or first login (once per session)
  useEffect(() => {
    if (user && (user.firstLogin || user.isNewStudent) && !loading) {
      // Check if welcome dialog has already been shown in this session
      const welcomeShown = sessionStorage.getItem(`welcomeShown_${user.id}`);

      if (!welcomeShown) {
        // Small delay to ensure dashboard loads first
        const timer = setTimeout(() => {
          setShowWelcomeDialog(true);
          // Mark as shown for this session
          sessionStorage.setItem(`welcomeShown_${user.id}`, 'true');
        }, 1000);

        return () => clearTimeout(timer);
      }
    }
  }, [user, loading]);

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
      
      // Check if lesson is unlocked before loading content
      if (dashboardData) {
        const lesson = dashboardData.phases
          .flatMap(phase => phase.lessons)
          .find(l => l.id === lessonId);
        
        if (lesson && !lesson.isUnlocked) {
          setError('This lesson is locked. Please complete all activities in the previous lesson first.');
          setLoading(false);
          goToDashboard();
          return;
        }
      }
      
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
      
      // Find the completed lesson to get its title
      const lesson = dashboardData?.phases
        .flatMap(phase => phase.lessons)
        .find(l => l.id === selectedLessonId);
      
      if (lesson) {
        setCompletedLessonTitle(lesson.title);
        setShowLessonComplete(true);
      }
      
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

    // Show confirmation modal before starting activity
    setPendingActivity({ lessonId, activityType });
    setShowActivityConfirmation(true);
  };

  const handleConfirmStartActivity = async () => {
    if (!pendingActivity || !dashboardData) return;

    const { lessonId, activityType } = pendingActivity;

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

    // Close confirmation modal
    setShowActivityConfirmation(false);
    setPendingActivity(null);

    // Update URL without refreshing the page
    navigate(`/student/activity/${activity.id}/${activityType}`, { replace: true });
    
    // Load activity content directly
    await loadActivityContent(activity.id);
    setCurrentActivity(activityType);
  };

  const handleStartLesson = async (lessonId: string) => {
    // Find the lesson to get its title
    const lesson = dashboardData?.phases
      .flatMap(phase => phase.lessons)
      .find(l => l.id === lessonId);
    
    if (lesson) {
      // Check if lesson is unlocked before allowing access
      if (!lesson.isUnlocked) {
        setError('This lesson is locked. Please complete all activities in the previous lesson first.');
        return;
      }
      
      setSelectedLessonForReminder({
        id: lessonId,
        title: lesson.title
      });
      setShowLessonReminder(true);
    }
  };

  const handleConfirmStartLesson = async () => {
    if (!selectedLessonForReminder) return;
    
    setShowLessonReminder(false);
    
    // Update URL without refreshing the page
    navigate(`/student/lesson/${selectedLessonForReminder.id}`, { replace: true });
    
    // Load lesson content directly
    await loadLessonContent(selectedLessonForReminder.id);
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
      a => a.activityType && mapActivityType(a.activityType) === activityType
    );

    return activity?.isUnlocked || false;
  };

  const isLessonUnlocked = (lessonId: string): boolean => {
    if (!dashboardData) return false;

    // Find the lesson in the dashboard data
    const lesson = dashboardData.phases
      .flatMap(phase => phase.lessons)
      .find(l => l.id === lessonId);
    
    // Return the isUnlocked status from backend
    return lesson?.isUnlocked ?? false;
  };

  const getActivityStatus = (lessonId: string, activityType: ActivityType): 'locked' | 'unlocked' | 'completed' => {
    if (!dashboardData || !activityType) return 'locked';

    const lesson = dashboardData.phases
      .flatMap(phase => phase.lessons)
      .find(l => l.id === lessonId);
    
    if (!lesson) return 'locked';

    const activity = lesson.activities?.find(
      a => a.activityType && mapActivityType(a.activityType) === activityType
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
      a => a.activityType && mapActivityType(a.activityType) === activityType
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
            <SimpleThemeToggle />
            <Button variant="ghost" onClick={handleLogoutClick}>
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
              <div className="flex justify-center py-2">
                <SimpleThemeToggle />
              </div>
              <Button variant="ghost" onClick={handleLogoutClick} className="w-full text-left">
                Logout
              </Button>
            </div>
          </div>
        )}
      </header>

      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Error Alert */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-destructive" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm text-destructive">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-3 flex-shrink-0 text-destructive/60 hover:text-destructive"
            >
              <span className="sr-only">Dismiss</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
        
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
                <div className="text-m font-bold">{dashboardData.stats.currentPhase}</div>
                <div className="text-xs text-muted-foreground">Current Phase</div>
              </div>
            </CardContent>
          </Card>

          <Card className="learning-card">
            <CardContent className="flex items-center p-4">
              <div className="p-2 rounded-lg bg-gradient-primary mr-3">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold">#{dashboardData.stats.currentRank}</div>
                <div className="text-xs text-muted-foreground">Leaderboard Rank</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Learning Phases */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Learning Phases</h2>

          <div className="flex flex-col gap-6">
            {dashboardData.phases.map((phase, phaseIndex) => (
              <div key={phase.id} className="flex items-center gap-6">
                {/* Left side image for phase 2 */}
                {phaseIndex === 1 && (
                  <div className="flex-[3]">
                    <Card className={`h-full border-0 shadow-sm hover:shadow-md hover:-translate-y-0.5 transform transition-all duration-300 ${
                      phaseIndex === 1 ? 'bg-amber-50 dark:bg-amber-950/20 hover:bg-amber-100 dark:hover:bg-amber-950/30' :
                      phaseIndex === 0 ? 'bg-sky-50 dark:bg-sky-950/20 hover:bg-sky-100 dark:hover:bg-sky-950/30' :
                      'bg-emerald-50 dark:bg-emerald-950/20 hover:bg-emerald-100 dark:hover:bg-emerald-950/30'
                    }`}>
                      <CardContent className="p-4 h-full flex items-center">
                        <img
                          src="https://res.cloudinary.com/dxygu2aeh/image/upload/v1759982197/Remove_background_project-1_3_yjpzkq.png"
                          alt="Phase 2 Character"
                          className="w-full h-45 object-contain"
                        />
                      </CardContent>
                    </Card>
                  </div>
                )}

                <Card className={`group hover:shadow-md hover:-translate-y-0.5 transform transition-all duration-300 flex-[7] min-h-[280px] border-0 shadow-sm ${
                  phaseIndex === 0 ? 'bg-sky-50 dark:bg-sky-950/20 hover:bg-sky-100 dark:hover:bg-sky-950/30' :
                  phaseIndex === 1 ? 'bg-amber-50 dark:bg-amber-950/20 hover:bg-amber-100 dark:hover:bg-amber-950/30' :
                  'bg-emerald-50 dark:bg-emerald-950/20 hover:bg-emerald-100 dark:hover:bg-emerald-950/30'
                }`}>
                  <CardContent className="p-6 h-full flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg transition-all duration-300 ${
                          phaseIndex === 0 ? 'bg-sky-500' :
                          phaseIndex === 1 ? 'bg-amber-500' :
                          'bg-emerald-500'
                        }`}>
                          <span className="text-lg font-bold text-white">{phaseIndex + 1}</span>
                        </div>
                        <div>
                          <h3 className={`text-xl font-semibold ${
                            phaseIndex === 0 ? 'text-sky-700 dark:text-sky-400' :
                            phaseIndex === 1 ? 'text-amber-700 dark:text-amber-400' :
                            'text-emerald-700 dark:text-emerald-400'
                          }`}>{phase.title}</h3>
                        </div>
                      </div>
                    </div>

                    <p className="text-muted-foreground mb-6 flex-grow" dangerouslySetInnerHTML={{ __html: phase.description }} />

                    <div className="flex justify-between items-center">
                      {!phase.isUnlocked && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Lock className="h-4 w-4 mr-2" />
                          <span>Complete all activities in previous phase to unlock</span>
                        </div>
                      )}
                      {phase.isUnlocked && phase.completedActivitiesCount < phase.totalActivitiesCount && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <span>{phase.completedActivitiesCount}/{phase.totalActivitiesCount} activities completed</span>
                        </div>
                      )}
                      {phase.isUnlocked && phase.completedActivitiesCount === phase.totalActivitiesCount && (
                        <div className="flex items-center text-sm text-green-600 font-medium">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          <span>Phase Completed!</span>
                        </div>
                      )}
                      <Button
                        className={`hover:opacity-90 ${
                          phaseIndex === 0 ? 'bg-sky-500 hover:bg-sky-600' :
                          phaseIndex === 1 ? 'bg-amber-500 hover:bg-amber-600' :
                          'bg-emerald-500 hover:bg-emerald-600'
                        }`}
                        onClick={() => {
                          // Check if ALL previous phases are completed before allowing access
                          if (phaseIndex > 0) {
                            // Check each previous phase in order
                            for (let i = 0; i < phaseIndex; i++) {
                              const previousPhase = dashboardData.phases[i];
                              if (previousPhase && previousPhase.completedActivitiesCount < previousPhase.totalActivitiesCount) {
                                setError(`Please complete all activities in ${previousPhase.title} before accessing ${phase.title}.`);
                                // Scroll to top to show error
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                return;
                              }
                            }
                          }
                          setSelectedPhaseForModal(phase.id);
                        }}
                        disabled={!phase.isUnlocked}
                      >
                        {phase.isUnlocked ? 'View Lessons' : (
                          <>
                            <Lock className="h-4 w-4 mr-2" />
                            Locked
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Right side images for phases 1 and 3 */}
                {phaseIndex === 0 && (
                  <div className="flex-[3]">
                    <Card className="h-full border-0 shadow-sm hover:shadow-md hover:-translate-y-0.5 transform transition-all duration-300 bg-sky-50 dark:bg-sky-950/20 hover:bg-sky-100 dark:hover:bg-sky-950/30">
                      <CardContent className="p-4 h-full flex items-center">
                        <img
                          src="https://res.cloudinary.com/dxygu2aeh/image/upload/v1759982189/Remove_background_project-1_2_daxtwh.png"
                          alt="Phase 1 Character"
                          className="w-full h-45 object-contain"
                        />
                      </CardContent>
                    </Card>
                  </div>
                )}

                {phaseIndex === 2 && (
                  <div className="flex-[3]">
                    <Card className="h-full border-0 shadow-sm hover:shadow-md hover:-translate-y-0.5 transform transition-all duration-300 bg-emerald-50 dark:bg-emerald-950/20 hover:bg-emerald-100 dark:hover:bg-emerald-950/30">
                      <CardContent className="p-4 h-full flex items-center">
                        <img
                          src="https://res.cloudinary.com/dxygu2aeh/image/upload/v1759982201/Remove_background_project-1_4_heiu9a.png"
                          alt="Phase 3 Character"
                          className="w-full h-45 object-contain"
                        />
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Phase Lessons Modal */}
      {selectedPhaseForModal && dashboardData && (
        <Dialog open={!!selectedPhaseForModal} onOpenChange={() => setSelectedPhaseForModal(null)}>
          <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                {(() => {
                  const phase = dashboardData.phases.find(p => p.id === selectedPhaseForModal);
                  if (!phase) return 'Phase Not Found';
                  const phaseIndex = dashboardData.phases.findIndex(p => p.id === selectedPhaseForModal);
                  return (
                    <span className={`${
                      [
                        'text-sky-700 dark:text-sky-400',    // Phase 1
                        'text-amber-700 dark:text-amber-400',  // Phase 2
                        'text-emerald-700 dark:text-emerald-400' // Phase 3
                      ][phaseIndex] || 'text-primary'
                    }`}>
                      {phase.title}
                    </span>
                  );
                })()}
              </DialogTitle>
              <DialogDescription className="hidden">
                {(() => {
                  const phase = dashboardData.phases.find(p => p.id === selectedPhaseForModal);
                  return phase ? phase.description : '';
                })()}
              </DialogDescription>
            </DialogHeader>

            <div className="max-h-[60vh] overflow-y-auto space-y-6">
              {(() => {
                const phase = dashboardData.phases.find(p => p.id === selectedPhaseForModal);
                if (!phase || !phase.lessons || phase.lessons.length === 0) {
                  return (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No lessons found for this phase.</p>
                    </div>
                  );
                }

                // Get the phase index for color theming
                const phaseIndex = dashboardData.phases.findIndex(p => p.id === selectedPhaseForModal);
                
                return phase.lessons.map((lesson) => {
                  const completedActivities = lesson.completedActivitiesCount || 0;
                  const totalActivities = lesson.totalActivities || 0;
                  const lessonProgress = lesson.progressPercentage || 0;

                  // Determine colors based on phase index
                  const bgColor = [
                    'bg-sky-50 dark:bg-sky-950/20',    // Phase 1
                    'bg-amber-50 dark:bg-amber-950/20',  // Phase 2
                    'bg-emerald-50 dark:bg-emerald-950/20' // Phase 3
                  ][phaseIndex] || 'bg-card';
                  
                  const borderColor = [
                    'border-sky-200 dark:border-sky-800',    // Phase 1
                    'border-amber-200 dark:border-amber-800',  // Phase 2
                    'border-emerald-200 dark:border-emerald-800' // Phase 3
                  ][phaseIndex] || 'border-border';

                  return (
                    <Card key={lesson.id} className={`${bgColor} ${borderColor} shadow-sm hover:shadow-md transition-shadow duration-300`}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start space-x-4">
                            <div className={`p-3 rounded-lg flex-shrink-0 ${
                              [
                                'bg-sky-500 text-white dark:bg-sky-900',    // Phase 1
                                'bg-amber-500 text-white dark:bg-amber-900',  // Phase 2
                                'bg-emerald-500 text-white dark:bg-emerald-900' // Phase 3
                              ][phaseIndex] || 'bg-primary text-white'
                            }`}>
                              <BookOpen className="h-6 w-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className={`text-xl font-semibold mb-2 ${
                                [
                                  'text-sky-800 dark:text-sky-300',    // Phase 1
                                  'text-amber-800 dark:text-amber-300',  // Phase 2
                                  'text-emerald-800 dark:text-emerald-300' // Phase 3
                                ][phaseIndex] || 'text-foreground'
                              }`}>
                                {lesson.title}
                              </h4>
                              <div className="text-foreground/80 mb-3 leading-relaxed text-sm lesson-description prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: lesson.description }} />

                              <div className="flex items-center space-x-4 mb-3">
                                <div className="flex items-center space-x-2">
                                  <div className="relative w-32 h-2 rounded-full overflow-hidden">
                                    <div className={`absolute top-0 left-0 h-full ${
                                      [
                                        'bg-sky-100 dark:bg-sky-900/30',    // Phase 1
                                        'bg-amber-100 dark:bg-amber-900/30',  // Phase 2
                                        'bg-emerald-100 dark:bg-emerald-900/30' // Phase 3
                                      ][phaseIndex] || 'bg-muted'
                                    } w-full`} />
                                    <div 
                                      className={`absolute top-0 left-0 h-full ${
                                        [
                                          'bg-sky-500',    // Phase 1
                                          'bg-amber-500',  // Phase 2
                                          'bg-emerald-500' // Phase 3
                                        ][phaseIndex] || 'bg-primary'
                                      } transition-all duration-300`}
                                      style={{ width: `${lessonProgress}%` }}
                                    />
                                  </div>
                                <span className={`text-sm font-medium ${
                                  [
                                    'text-sky-700 dark:text-sky-400',    // Phase 1
                                    'text-amber-700 dark:text-amber-400',  // Phase 2
                                    'text-emerald-700 dark:text-emerald-400' // Phase 3
                                  ][phaseIndex] || 'text-foreground'
                                }`}>
                                  {lessonProgress}%
                                </span>
                                </div>
                                <Badge 
                                  variant="secondary" 
                                  className={`text-xs ${
                                    [
                                      'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 hover:bg-sky-200 dark:hover:bg-sky-900/50',    // Phase 1
                                      'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50',  // Phase 2
                                      'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50' // Phase 3
                                    ][phaseIndex] || ''
                                  }`}
                                >
                                  {completedActivities}/{totalActivities} activities
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 flex-shrink-0">
                            {lessonProgress > 0 && lessonProgress < 100 && <Star className="h-5 w-5 text-yellow-500" />}
                            {lessonProgress === 100 && <CheckCircle className="h-5 w-5 text-green-500" />}
                          </div>
                        </div>

                        {/* Lesson and Activity Buttons */}
                        <div className="space-y-4">
                          {/* Read Lesson Button */}
                          <div className="border-b border-border pb-4">
                            {!lesson.isUnlocked && (
                              <div className="mb-3 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                <div className="flex items-center text-sm text-yellow-800 dark:text-yellow-400">
                                  <Lock className="h-4 w-4 mr-2 flex-shrink-0" />
                                  <span>Complete all activities in the previous lesson to unlock this lesson</span>
                                </div>
                              </div>
                            )}
                            <Button
                              variant={lesson.isCompleted ? "default" : "default"}
                              className={`w-full h-16 text-lg font-medium ${
                                !lesson.isUnlocked ? 'opacity-60 cursor-not-allowed' : ''
                              } ${
                                lesson.isCompleted ? (
                                  [
                                    'bg-sky-700 hover:bg-sky-800 text-white',    // Phase 1 - Completed
                                    'bg-amber-700 hover:bg-amber-800 text-white',  // Phase 2 - Completed
                                    'bg-emerald-700 hover:bg-emerald-800 text-white' // Phase 3 - Completed
                                  ][phaseIndex] || 'bg-primary text-white'
                                ) : (
                                  [
                                    'bg-sky-500 hover:bg-sky-600 text-white',    // Phase 1 - Not completed
                                    'bg-amber-500 hover:bg-amber-600 text-white',  // Phase 2 - Not completed
                                    'bg-emerald-500 hover:bg-emerald-600 text-white' // Phase 3 - Not completed
                                  ][phaseIndex] || ''
                                )
                              }`}
                              disabled={!lesson.isUnlocked}
                              onClick={() => {
                                if (lesson.isUnlocked) {
                                  setSelectedPhaseForModal(null);
                                  handleStartLesson(lesson.id);
                                }
                              }}
                            >
                              <div className="flex items-center justify-center">
                                {!lesson.isUnlocked ? (
                                  <>
                                    <Lock className="h-5 w-5 mr-2" />
                                    <span>Lesson Locked</span>
                                  </>
                                ) : lesson.isCompleted ? (
                                  <>
                                    <CheckCircle className="h-5 w-5 mr-2" />
                                    <span>Lesson Completed - Read Again</span>
                                  </>
                                ) : (
                                  <>
                                    <BookOpen className="h-5 w-5 mr-2" />
                                    <span>Read Lesson</span>
                                  </>
                                )}
                              </div>
                            </Button>
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
                                  variant={isCompleted ? "default" : "outline"}
                                  className={`h-20 flex flex-col justify-center items-center p-2 w-full text-xs font-medium ${
                                    isLocked 
                                      ? 'opacity-70' 
                                      : isCompleted 
                                        ? [
                                            'bg-sky-700 hover:bg-sky-800 text-white',    // Phase 1 - Completed
                                            'bg-amber-700 hover:bg-amber-800 text-white',  // Phase 2 - Completed
                                            'bg-emerald-700 hover:bg-emerald-800 text-white' // Phase 3 - Completed
                                          ][phaseIndex] || 'bg-primary text-white'
                                        : [
                                            'border-sky-500 text-sky-700 hover:bg-sky-50',    // Phase 1 - Not completed
                                            'border-amber-500 text-amber-700 hover:bg-amber-50',  // Phase 2 - Not completed
                                            'border-emerald-500 text-emerald-700 hover:bg-emerald-50' // Phase 3 - Not completed
                                          ][phaseIndex] || ''
                                  }`}
                                  disabled={isLocked}
                                  onClick={() => {
                                    if (!isLocked) {
                                      setSelectedPhaseForModal(null);
                                      handleStartActivity(lesson.id, 'multiple-choice');
                                    }
                                  }}
                                >
                                  <div className="flex items-center justify-center mb-1">
                                    {isLocked ? (
                                      <Lock className="h-4 w-4 text-muted-foreground" />
                                    ) : isCompleted ? (
                                      <CheckCircle className="h-4 w-4 text-white mr-1" />
                                    ) : (
                                      <Target className={`h-4 w-4 ${
                                        [
                                          'text-sky-500',    // Phase 1
                                          'text-amber-500',  // Phase 2
                                          'text-emerald-500' // Phase 3
                                        ][phaseIndex] || 'text-primary'
                                      }`} />
                                    )}
                                  </div>
                                  <span className={`text-center leading-tight ${isCompleted ? 'text-white font-semibold' : 'text-foreground'}`}>Multiple Choice</span>
                                  {percentage !== undefined && (
                                    <span className={`text-xs font-semibold mt-1 ${isCompleted ? 'text-white' : 'text-muted-foreground'}`}>{percentage}%</span>
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
                                  variant={isCompleted ? "default" : "outline"}
                                  className={`h-20 flex flex-col justify-center items-center p-2 w-full text-xs font-medium ${
                                    isLocked 
                                      ? 'opacity-70' 
                                      : isCompleted 
                                        ? [
                                            'bg-sky-700 hover:bg-sky-800 text-white',
                                            'bg-amber-700 hover:bg-amber-800 text-white',
                                            'bg-emerald-700 hover:bg-emerald-800 text-white'
                                          ][phaseIndex] || 'bg-primary text-white'
                                        : [
                                            'border-sky-500 text-sky-700 hover:bg-sky-50',
                                            'border-amber-500 text-amber-700 hover:bg-amber-50',
                                            'border-emerald-500 text-emerald-700 hover:bg-emerald-50'
                                          ][phaseIndex] || ''
                                  }`}
                                  disabled={isLocked}
                                  onClick={() => {
                                    if (!isLocked) {
                                      setSelectedPhaseForModal(null);
                                      handleStartActivity(lesson.id, 'drag-drop');
                                    }
                                  }}
                                >
                                  <div className="flex items-center justify-center mb-1">
                                    {isLocked ? (
                                      <Lock className="h-4 w-4 text-muted-foreground" />
                                    ) : isCompleted ? (
                                      <CheckCircle className="h-4 w-4 text-white mr-1" />
                                    ) : (
                                      <ArrowRight className={`h-4 w-4 ${
                                        [
                                          'text-sky-500',
                                          'text-amber-500',
                                          'text-emerald-500'
                                        ][phaseIndex] || 'text-primary'
                                      }`} />
                                    )}
                                  </div>
                                  <span className={`text-center leading-tight ${isCompleted ? 'text-white font-semibold' : 'text-foreground'}`}>Drag & Drop</span>
                                  {percentage !== undefined && (
                                    <span className={`text-xs font-semibold mt-1 ${isCompleted ? 'text-white' : 'text-muted-foreground'}`}>
                                      {percentage}%
                                    </span>
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
                                  variant={isCompleted ? "default" : "outline"}
                                  className={`h-20 flex flex-col justify-center items-center p-2 w-full text-xs font-medium ${
                                    isLocked 
                                      ? 'opacity-70'  
                                      : isCompleted 
                                        ? [
                                            'bg-sky-700 hover:bg-sky-800 text-white',
                                            'bg-amber-700 hover:bg-amber-800 text-white',
                                            'bg-emerald-700 hover:bg-emerald-800 text-white'
                                          ][phaseIndex] || 'bg-primary text-white'
                                        : [
                                            'border-sky-500 text-sky-700 hover:bg-sky-50',
                                            'border-amber-500 text-amber-700 hover:bg-amber-50',
                                            'border-emerald-500 text-emerald-700 hover:bg-emerald-50'
                                          ][phaseIndex] || ''
                                  }`}
                                  disabled={isLocked}
                                  onClick={() => {
                                    if (!isLocked) {
                                      setSelectedPhaseForModal(null);
                                      handleStartActivity(lesson.id, 'matching-pairs');
                                    }
                                  }}
                                >
                                  <div className="flex items-center justify-center mb-1">
                                    {isLocked ? (
                                      <Lock className="h-4 w-4 text-muted-foreground" />
                                    ) : isCompleted ? (
                                      <CheckCircle className="h-4 w-4 text-white mr-1" />
                                    ) : (
                                      <Star className={`h-4 w-4 ${
                                        [
                                          'text-sky-500',
                                          'text-amber-500',
                                          'text-emerald-500'
                                        ][phaseIndex] || 'text-primary'
                                      }`} />
                                    )}
                                  </div>
                                  <span className={`text-center leading-tight ${isCompleted ? 'text-white font-semibold' : 'text-foreground'}`}>Matching Pairs</span>
                                  {percentage !== undefined && (
                                    <span className={`text-xs font-semibold mt-1 ${isCompleted ? 'text-white' : 'text-muted-foreground'}`}>
                                      {percentage}%
                                    </span>
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
                                  variant={isCompleted ? "default" : "outline"}
                                  className={`h-20 flex flex-col justify-center items-center p-2 w-full text-xs font-medium ${
                                    isLocked 
                                      ? 'opacity-70'  
                                      : isCompleted 
                                        ? [
                                            'bg-sky-700 hover:bg-sky-800 text-white',
                                            'bg-amber-700 hover:bg-amber-800 text-white',
                                            'bg-emerald-700 hover:bg-emerald-800 text-white'
                                          ][phaseIndex] || 'bg-primary text-white'
                                        : [
                                            'border-sky-500 text-sky-700 hover:bg-sky-50',
                                            'border-amber-500 text-amber-700 hover:bg-amber-50',
                                            'border-emerald-500 text-emerald-700 hover:bg-emerald-50'
                                          ][phaseIndex] || ''
                                  }`}
                                  disabled={isLocked}
                                  onClick={() => {
                                    if (!isLocked) {
                                      setSelectedPhaseForModal(null);
                                      handleStartActivity(lesson.id, 'story-comprehension');
                                    }
                                  }}
                                >
                                  <div className="flex items-center justify-center mb-1">
                                    {isLocked ? (
                                      <Lock className="h-4 w-4 text-muted-foreground" />
                                    ) : isCompleted ? (
                                      <CheckCircle className="h-4 w-4 text-white mr-1" />
                                    ) : (
                                      <BookOpen className={`h-4 w-4 ${
                                        [
                                          'text-sky-500',
                                          'text-amber-500',
                                          'text-emerald-500'
                                        ][phaseIndex] || 'text-primary'
                                      }`} />
                                    )}
                                  </div>
                                  <span className={`text-center leading-tight ${isCompleted ? 'text-white font-semibold' : 'text-foreground'}`}>Story Reading</span>
                                  {percentage !== undefined && (
                                    <span className={`text-xs font-semibold mt-1 ${isCompleted ? 'text-white' : 'text-muted-foreground'}`}>
                                      {percentage}%
                                    </span>
                                  )}
                                </Button>
                              );
                            })()}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                });
              })()}
            </div>

            <DialogFooter className="mt-6">
              <Button onClick={() => setSelectedPhaseForModal(null)} variant="outline" className="w-full sm:w-auto">
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Welcome Dialog for new students */}
      <Dialog open={showWelcomeDialog} onOpenChange={setShowWelcomeDialog}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader className="text-center">
            <DialogTitle className="text-2xl font-bold text-primary mb-4">
              Welcome to FiliUp! 🎉
            </DialogTitle>
            <DialogDescription className="text-center">
              Welcome to your Filipino language learning journey!
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-6">
            <div className="relative">
              <img
                src="https://res.cloudinary.com/dxygu2aeh/image/upload/v1759976738/Remove_background_project-1_1_q6lftl.png"
                alt="Welcome Character"
                className="w-48 h-48 object-contain"
              />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold text-primary">
                {user?.firstLogin ? 'Welcome back!' : 'Welcome to your learning journey!'}
              </h3>
              <p className="text-muted-foreground">
                {user?.firstLogin
                  ? `Great to see you again, ${user.name}! Ready to continue your Filipino language learning adventure?`
                  : `Hello ${user?.name}! Get ready to embark on an exciting journey to learn Filipino through interactive lessons and fun activities.`
                }
              </p>
            </div>
          </div>
          <DialogFooter className="flex justify-center">
            <Button
              onClick={() => setShowWelcomeDialog(false)}
              className="w-full sm:w-auto"
              size="lg"
            >
              Let's Start Learning! 🚀
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to logout? Your learning progress will be saved, but you'll need to login again to continue.
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

      {/* Lesson Reminder Modal */}
      <Dialog open={showLessonReminder} onOpenChange={setShowLessonReminder}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold text-primary">
              Ready to Learn?
            </DialogTitle>
            <DialogDescription className="text-center">
              You're about to start the lesson:
            </DialogDescription>
          </DialogHeader>
          <div className="w-full flex flex-col items-center space-y-4 py-4">
            <img
              src="https://res.cloudinary.com/dxygu2aeh/image/upload/v1759976738/Remove_background_project-1_1_q6lftl.png"
              alt="Lesson Reminder"
              className="max-w-[300px] h-auto"
            />
            <h3 className="text-xl font-semibold text-center">
              {selectedLessonForReminder?.title}
            </h3>
            <p className="text-center text-muted-foreground">
              Take your time to understand the concepts. You can review this lesson anytime!
            </p>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowLessonReminder(false)}
              className="w-full"
            >
              Not Now
            </Button>
            <Button 
              onClick={handleConfirmStartLesson}
              className="w-full"
            >
              Start Learning
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Activity Confirmation Modal */}
      <AlertDialog open={showActivityConfirmation} onOpenChange={setShowActivityConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center text-xl font-bold">Ready to Start Activity?</AlertDialogTitle>
            <AlertDialogDescription className="text-center space-y-3">
              <div className="flex justify-center my-4">
                <img
                  src="https://res.cloudinary.com/dxygu2aeh/image/upload/v1759976738/Remove_background_project-1_1_q6lftl.png"
                  alt="Activity Reminder"
                  className="max-w-[200px] h-auto"
                />
              </div>
              <p className="text-base font-medium">
                This activity will open in fullscreen mode for the best learning experience.
              </p>
              <p className="text-sm text-muted-foreground">
                Make sure you're ready to focus and complete the activity without interruptions.
              </p>
              <p className="text-sm font-semibold text-primary">
                Are you ready to take this activity?
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
            <AlertDialogCancel onClick={() => {
              setShowActivityConfirmation(false);
              setPendingActivity(null);
            }}>
              Not Yet
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmStartActivity} className="bg-primary hover:bg-primary/90">
              Yes, I'm Ready!
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Lesson Complete Modal */}
      <Dialog open={showLessonComplete} onOpenChange={setShowLessonComplete}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold text-primary">
              Lesson Completed! 🎉
            </DialogTitle>
            <DialogDescription className="text-center">
              Great job completing:
            </DialogDescription>
          </DialogHeader>
          <div className="w-full flex flex-col items-center space-y-4 py-4">
            <img
              src="https://res.cloudinary.com/dxygu2aeh/image/upload/v1760111954/Remove_background_project-1_7_qg2prd.png"
              alt="Lesson Completed"
              className="max-w-[300px] h-auto"
            />
            <h3 className="text-xl font-semibold text-center">
              {completedLessonTitle}
            </h3>
            <p className="text-center text-muted-foreground">
              You're making great progress! Keep up the good work!
            </p>
          </div>
          <DialogFooter className="flex justify-center">
            <Button 
              onClick={() => {
                setShowLessonComplete(false);
                // Open the lessons list modal
                const currentPhase = dashboardData?.phases.find(phase => 
                  phase.lessons.some(lesson => lesson.id === selectedLessonId)
                );
                if (currentPhase) {
                  setSelectedPhaseForModal(currentPhase.id);
                }
              }}
              className="w-full sm:w-auto"
              size="lg"
            >
              Continue Learning
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
