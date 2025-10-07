import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  GripVertical, 
  FileText, 
  Activity,
  ArrowLeft,
  Settings
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { PhaseDialog } from './PhaseDialog';
import { LessonDialog } from './LessonDialog';
import { ActivityDialog } from './ActivityDialog';
import { adminAPI } from '@/lib/api';

interface Phase {
  id: string;
  title: string;
  description: string;
  orderIndex: number;
  lessonsCount?: number;
}

interface Lesson {
  id: string;
  phaseId: string;
  title: string;
  description: string;
  orderIndex: number;
  slidesCount?: number;
  activitiesCount?: number;
}

interface Activity {
  id: string;
  lessonId: string;
  activityType: 'MULTIPLE_CHOICE' | 'DRAG_DROP' | 'MATCHING_PAIRS' | 'STORY_COMPREHENSION';
  title: string;
  instructions: string;
  orderIndex: number;
  passingPercentage: number;
}

export const ContentManagement = ({ onBack }: { onBack: () => void }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('phases');
  const [phases, setPhases] = useState<Phase[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Dialog states
  const [showPhaseDialog, setShowPhaseDialog] = useState(false);
  const [editingPhase, setEditingPhase] = useState<Phase | null>(null);
  const [showLessonDialog, setShowLessonDialog] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [showActivityDialog, setShowActivityDialog] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  // Load data from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch phases
        const phasesData = await adminAPI.getPhases();
        setPhases(phasesData.map((phase: any) => ({
          ...phase,
          lessonsCount: 0 // Will be calculated when lessons are loaded
        })));

        // Fetch lessons
        const lessonsData = await adminAPI.getLessons();
        setLessons(lessonsData.map((lesson: any) => ({
          ...lesson,
          slidesCount: lesson.slidesCount || 0,
          activitiesCount: lesson.activitiesCount || 0
        })));

        // Update phase lesson counts
        const lessonCounts = lessonsData.reduce((acc: any, lesson: any) => {
          acc[lesson.phaseId] = (acc[lesson.phaseId] || 0) + 1;
          return acc;
        }, {});

        setPhases(prev => prev.map(phase => ({
          ...phase,
          lessonsCount: lessonCounts[phase.id] || 0
        })));

        // Fetch activities
        const activitiesData = await adminAPI.getActivities();
        setActivities(activitiesData.map((activity: any) => ({
          ...activity,
          activityType: activity.activityType
        })));

        // Update lesson activity counts
        const activityCounts = activitiesData.reduce((acc: any, activity: any) => {
          acc[activity.lessonId] = (acc[activity.lessonId] || 0) + 1;
          return acc;
        }, {});

        setLessons(prev => prev.map(lesson => ({
          ...lesson,
          activitiesCount: activityCounts[lesson.id] || 0
        })));

      } catch (error) {
        console.error('Failed to fetch data:', error);
        // Fallback to empty arrays on error
        setPhases([]);
        setLessons([]);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getActivityTypeIcon = (type: string) => {
    switch (type) {
      case 'MULTIPLE_CHOICE': return '📝';
      case 'DRAG_DROP': return '🎯';
      case 'MATCHING_PAIRS': return '🔗';
      case 'STORY_COMPREHENSION': return '📖';
      default: return '📋';
    }
  };

  const getActivityTypeColor = (type: string) => {
    switch (type) {
      case 'MULTIPLE_CHOICE': return 'bg-blue-100 text-blue-800';
      case 'DRAG_DROP': return 'bg-green-100 text-green-800';
      case 'MATCHING_PAIRS': return 'bg-purple-100 text-purple-800';
      case 'STORY_COMPREHENSION': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredLessons = selectedPhase 
    ? lessons.filter(lesson => lesson.phaseId === selectedPhase)
    : lessons;

  const filteredActivities = selectedLesson
    ? activities.filter(activity => activity.lessonId === selectedLesson)
    : activities;

  // Phase management functions
  const handleCreatePhase = () => {
    setEditingPhase(null);
    setShowPhaseDialog(true);
  };

  const handleEditPhase = (phase: Phase) => {
    setEditingPhase(phase);
    setShowPhaseDialog(true);
  };

  const handleSavePhase = async (phaseData: Omit<Phase, 'id'>) => {
    try {
      if (editingPhase) {
        // Update existing phase
        const updatedPhase = await adminAPI.updatePhase(editingPhase.id, phaseData);
        setPhases(prev => prev.map(p => 
          p.id === editingPhase.id 
            ? { ...updatedPhase, lessonsCount: p.lessonsCount }
            : p
        ));
      } else {
        // Create new phase
        const newPhase = await adminAPI.createPhase(phaseData);
        setPhases(prev => [...prev, { ...newPhase, lessonsCount: 0 }]);
      }
    } catch (error) {
      console.error('Failed to save phase:', error);
      throw error;
    }
  };

  const handleDeletePhase = async (phaseId: string) => {
    if (confirm('Are you sure you want to delete this phase? This will also delete all associated lessons and activities.')) {
      try {
        await adminAPI.deletePhase(phaseId);
        setPhases(prev => prev.filter(p => p.id !== phaseId));
        // Also remove associated lessons and activities from local state
        setLessons(prev => prev.filter(l => l.phaseId !== phaseId));
        const lessonIds = lessons.filter(l => l.phaseId === phaseId).map(l => l.id);
        setActivities(prev => prev.filter(a => !lessonIds.includes(a.lessonId)));
      } catch (error) {
        console.error('Failed to delete phase:', error);
        alert('Failed to delete phase. Please try again.');
      }
    }
  };

  // Lesson management functions
  const handleCreateLesson = () => {
    setEditingLesson(null);
    setShowLessonDialog(true);
  };

  const handleEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setShowLessonDialog(true);
  };

  const handleSaveLesson = async (lessonData: Omit<Lesson, 'id'>, slides: { title: string; content: string[]; orderIndex: number }[]) => {
    try {
      if (editingLesson) {
        // Update existing lesson
        const updatedLesson = await adminAPI.updateLesson(editingLesson.id, {
          ...lessonData,
          slides
        });
        setLessons(prev => prev.map(l => 
          l.id === editingLesson.id 
            ? { ...updatedLesson, slidesCount: slides.length, activitiesCount: l.activitiesCount }
            : l
        ));
      } else {
        // Create new lesson
        const newLesson = await adminAPI.createLesson({
          ...lessonData,
          slides
        });
        setLessons(prev => [...prev, { 
          ...newLesson, 
          slidesCount: slides.length,
          activitiesCount: 0
        }]);
        
        // Update phase lesson count
        setPhases(prev => prev.map(p => 
          p.id === lessonData.phaseId 
            ? { ...p, lessonsCount: (p.lessonsCount || 0) + 1 }
            : p
        ));
      }
    } catch (error) {
      console.error('Failed to save lesson:', error);
      throw error;
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (confirm('Are you sure you want to delete this lesson? This will also delete all associated activities.')) {
      try {
        const lesson = lessons.find(l => l.id === lessonId);
        await adminAPI.deleteLesson(lessonId);
        setLessons(prev => prev.filter(l => l.id !== lessonId));
        setActivities(prev => prev.filter(a => a.lessonId !== lessonId));
        
        // Update phase lesson count
        if (lesson) {
          setPhases(prev => prev.map(p => 
            p.id === lesson.phaseId 
              ? { ...p, lessonsCount: Math.max(0, (p.lessonsCount || 0) - 1) }
              : p
          ));
        }
      } catch (error) {
        console.error('Failed to delete lesson:', error);
        alert('Failed to delete lesson. Please try again.');
      }
    }
  };

  // Activity management functions
  const handleCreateActivity = () => {
    setEditingActivity(null);
    setShowActivityDialog(true);
  };

  const handleEditActivity = (activity: Activity) => {
    setEditingActivity(activity);
    setShowActivityDialog(true);
  };

  const handleSaveActivity = async (activityData: Omit<Activity, 'id'>, content: { questions?: any[]; categories?: any[]; items?: any[]; pairs?: any[] }) => {
    try {
      if (editingActivity) {
        // Update existing activity
        const updatedActivity = await adminAPI.updateActivity(editingActivity.id, {
          ...activityData,
          content
        });
        setActivities(prev => prev.map(a => 
          a.id === editingActivity.id 
            ? { ...updatedActivity }
            : a
        ));
      } else {
        // Create new activity
        const newActivity = await adminAPI.createActivity({
          ...activityData,
          content
        });
        setActivities(prev => [...prev, newActivity]);
        
        // Update lesson activity count
        setLessons(prev => prev.map(l => 
          l.id === activityData.lessonId 
            ? { ...l, activitiesCount: (l.activitiesCount || 0) + 1 }
            : l
        ));
      }
    } catch (error) {
      console.error('Failed to save activity:', error);
      throw error;
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    if (confirm('Are you sure you want to delete this activity?')) {
      try {
        const activity = activities.find(a => a.id === activityId);
        await adminAPI.deleteActivity(activityId);
        setActivities(prev => prev.filter(a => a.id !== activityId));
        
        // Update lesson activity count
        if (activity) {
          setLessons(prev => prev.map(l => 
            l.id === activity.lessonId 
              ? { ...l, activitiesCount: Math.max(0, (l.activitiesCount || 0) - 1) }
              : l
          ));
        }
      } catch (error) {
        console.error('Failed to delete activity:', error);
        alert('Failed to delete activity. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-primary">Content Management</h1>
              <p className="text-muted-foreground">Create and manage phases, lessons, and activities</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant="outline" className="px-3 py-1">
              {user?.name} - Admin
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="phases" className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4" />
              <span>Phases</span>
            </TabsTrigger>
            <TabsTrigger value="lessons" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Lessons</span>
            </TabsTrigger>
            <TabsTrigger value="activities" className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>Activities</span>
            </TabsTrigger>
          </TabsList>

          {/* Phases Tab */}
          <TabsContent value="phases" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Phases Management</h2>
              <Button className="bg-gradient-primary" onClick={handleCreatePhase}>
                <Plus className="h-4 w-4 mr-2" />
                Create Phase
              </Button>
            </div>

            <div className="grid gap-4">
              {phases.map((phase) => (
                <Card key={phase.id} className="learning-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2 text-muted-foreground">
                          <GripVertical className="h-4 w-4" />
                          <span className="text-sm font-medium">#{phase.orderIndex}</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{phase.title}</h3>
                          <p className="text-muted-foreground text-sm">{phase.description}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <Badge variant="secondary">
                              {phase.lessonsCount} lessons
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEditPhase(phase)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-destructive"
                          onClick={() => handleDeletePhase(phase.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Lessons Tab */}
          <TabsContent value="lessons" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h2 className="text-2xl font-bold">Lessons Management</h2>
                {selectedPhase && (
                  <Badge variant="outline" className="px-3 py-1">
                    Phase: {phases.find(p => p.id === selectedPhase)?.title}
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <select 
                  className="px-3 py-2 border rounded-md bg-background"
                  value={selectedPhase || ''}
                  onChange={(e) => setSelectedPhase(e.target.value || null)}
                >
                  <option value="">All Phases</option>
                  {phases.map(phase => (
                    <option key={phase.id} value={phase.id}>
                      {phase.title}
                    </option>
                  ))}
                </select>
                <Button className="bg-gradient-primary" onClick={handleCreateLesson}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Lesson
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              {filteredLessons.map((lesson) => (
                <Card key={lesson.id} className="learning-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2 text-muted-foreground">
                          <GripVertical className="h-4 w-4" />
                          <span className="text-sm font-medium">#{lesson.orderIndex}</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{lesson.title}</h3>
                          <p className="text-muted-foreground text-sm">{lesson.description}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <Badge variant="secondary">
                              {lesson.slidesCount} slides
                            </Badge>
                            <Badge variant="outline">
                              {lesson.activitiesCount} activities
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                       
                        <Button variant="ghost" size="sm" onClick={() => handleEditLesson(lesson)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-destructive"
                          onClick={() => handleDeleteLesson(lesson.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Activities Tab */}
          <TabsContent value="activities" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h2 className="text-2xl font-bold">Activities Management</h2>
                {selectedLesson && (
                  <Badge variant="outline" className="px-3 py-1">
                    Lesson: {lessons.find(l => l.id === selectedLesson)?.title}
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <select 
                  className="px-3 py-2 border rounded-md bg-background"
                  value={selectedLesson || ''}
                  onChange={(e) => setSelectedLesson(e.target.value || null)}
                >
                  <option value="">All Lessons</option>
                  {lessons.map(lesson => (
                    <option key={lesson.id} value={lesson.id}>
                      {lesson.title}
                    </option>
                  ))}
                </select>
                <Button className="bg-gradient-primary" onClick={handleCreateActivity}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Activity
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              {filteredActivities.map((activity) => (
                <Card key={activity.id} className="learning-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2 text-muted-foreground">
                          <GripVertical className="h-4 w-4" />
                          <span className="text-sm font-medium">#{activity.orderIndex}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="text-2xl">{getActivityTypeIcon(activity.activityType)}</span>
                            <h3 className="font-semibold text-lg">{activity.title}</h3>
                            <Badge className={getActivityTypeColor(activity.activityType)}>
                              {activity.activityType.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground text-sm">{activity.instructions}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <Badge variant="outline">
                              {activity.passingPercentage}% to pass
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        
                        <Button variant="ghost" size="sm" onClick={() => handleEditActivity(activity)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-destructive"
                          onClick={() => handleDeleteActivity(activity.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Phase Dialog */}
      <PhaseDialog
        open={showPhaseDialog}
        onOpenChange={setShowPhaseDialog}
        phase={editingPhase}
        onSave={handleSavePhase}
      />

      {/* Lesson Dialog */}
      <LessonDialog
        open={showLessonDialog}
        onOpenChange={setShowLessonDialog}
        lesson={editingLesson}
        phases={phases}
        onSave={handleSaveLesson}
      />

      {/* Activity Dialog */}
      <ActivityDialog
        open={showActivityDialog}
        onOpenChange={setShowActivityDialog}
        activity={editingActivity}
        lessons={lessons}
        onSave={handleSaveActivity}
      />
    </div>
  );
};
