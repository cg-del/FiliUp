import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { BookOpen, Plus, Search, Filter, Eye, Edit, Trash2, HelpCircle, Loader2, Clock } from 'lucide-react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { TeacherSidebar } from '../components/TeacherSidebar';
import { STORY_GENRES, getGenreByValue } from '../constants/storyGenres';
import CreateStoryForm from '../components/CreateStoryForm';
import CreateQuizForm from '../components/CreateQuizForm';
import { storyService } from '@/lib/services/storyService';
import { quizService, type QuizData } from '@/lib/services/quizService';
import { toast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// TypeScript interfaces for the API response
interface ClassEntity {
  className: string;
  description: string;
  createdAt: string;
  isActive: boolean;
  classCode: string;
  classId: string;
}

interface TeacherStory {
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

const TeacherStories = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [stories, setStories] = useState<TeacherStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for dialogs and operations
  const [deleteStoryId, setDeleteStoryId] = useState<string | null>(null);
  const [editingStory, setEditingStory] = useState<TeacherStory | null>(null);
  const [viewingQuiz, setViewingQuiz] = useState<QuizData | null>(null);
  const [editingQuiz, setEditingQuiz] = useState<QuizData | null>(null);
  const [quizAttempts, setQuizAttempts] = useState<Record<string, number>>({});
  const [loadingOperation, setLoadingOperation] = useState<string | null>(null);

  // Fetch stories from API
  useEffect(() => {
    const fetchStories = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedStories = await storyService.getStoriesByTeacher();
        setStories(fetchedStories);
      } catch (error) {
        console.error('Error fetching stories:', error);
        setError('Failed to load stories. Please try again.');
        toast({
          title: "Error",
          description: "Hindi nakuha ang mga kuwento. Subukang muli.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, []);

  // Fetch quiz attempts count for each story
  useEffect(() => {
    const fetchQuizAttempts = async () => {
      try {
        const attemptsData: Record<string, number> = {};
        
        for (const story of stories) {
          try {
            const quizzes = await quizService.getQuizzesByStory(story.storyId);
            let totalAttempts = 0;
            
            for (const quiz of quizzes) {
              const attempts = await quizService.getQuizAttemptsByQuiz(quiz.quizId);
              totalAttempts += attempts.length;
            }
            
            attemptsData[story.storyId] = totalAttempts;
          } catch (error) {
            console.error(`Error fetching attempts for story ${story.storyId}:`, error);
            attemptsData[story.storyId] = 0;
          }
        }
        
        setQuizAttempts(attemptsData);
      } catch (error) {
        console.error('Error fetching quiz attempts:', error);
      }
    };

    if (stories.length > 0) {
      fetchQuizAttempts();
    }
  }, [stories]);

  const filteredStories = stories.filter(story => {
    const matchesSearch = story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         story.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = selectedGenre === 'all' || story.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  const getGenreColor = (genre: string) => {
    const genreInfo = getGenreByValue(genre);
    return genreInfo?.color || '#6b7280';
  };

  const getGenreLabel = (genre: string) => {
    const genreInfo = getGenreByValue(genre);
    return genreInfo?.label || genre;
  };

  const getReadingTimeEstimate = (content: string): number => {
    // Estimate reading time based on content length (average 200 words per minute)
    const wordCount = content.split(' ').length;
    return Math.max(1, Math.ceil(wordCount / 200));
  };

  // Edit story handler
  const handleEditStory = (story: TeacherStory) => {
    setEditingStory(story);
  };

  // Update story
  const handleUpdateStory = async (updatedData: Partial<TeacherStory>) => {
    if (!editingStory) return;
    
    try {
      setLoadingOperation('updating');
      await storyService.updateStory(editingStory.storyId, updatedData);
      
      // Update local state
      setStories(prev => prev.map(story => 
        story.storyId === editingStory.storyId 
          ? { ...story, ...updatedData }
          : story
      ));
      
      setEditingStory(null);
      toast({
        title: "Success",
        description: "Ang kuwento ay na-update na.",
        variant: "default",
      });
    } catch (error) {
      console.error('Error updating story:', error);
      toast({
        title: "Error",
        description: "Hindi na-update ang kuwento. Subukang muli.",
        variant: "destructive",
      });
    } finally {
      setLoadingOperation(null);
    }
  };

  // Delete story handler
  const handleDeleteStory = async () => {
    if (!deleteStoryId) return;
    
    try {
      setLoadingOperation('deleting');
      await storyService.deleteStory(deleteStoryId);
      
      // Remove from local state
      setStories(prev => prev.filter(story => story.storyId !== deleteStoryId));
      
      setDeleteStoryId(null);
      toast({
        title: "Success",
        description: "Ang kuwento ay natanggal na.",
        variant: "default",
      });
    } catch (error) {
      console.error('Error deleting story:', error);
      toast({
        title: "Error",
        description: "Hindi natanggal ang kuwento. Subukang muli.",
        variant: "destructive",
      });
    } finally {
      setLoadingOperation(null);
    }
  };

  // View quiz handler
  const handleViewQuiz = async (storyId: string) => {
    try {
      setLoadingOperation('loading-quiz');
      const quizzes = await quizService.getQuizzesByStory(storyId);
      
      if (quizzes.length === 0) {
        toast({
          title: "No Quiz Found",
          description: "Walang quiz para sa kuwentong ito.",
          variant: "destructive",
        });
        return;
      }
      
      // For now, take the first quiz
      const quiz = quizzes[0];
      setViewingQuiz(quiz);
    } catch (error) {
      console.error('Error fetching quiz:', error);
      toast({
        title: "Error",
        description: "Hindi nakuha ang quiz. Subukang muli.",
        variant: "destructive",
      });
    } finally {
      setLoadingOperation(null);
    }
  };

  // Edit quiz handler - only allow if no attempts
  const handleEditQuiz = async (storyId: string) => {
    try {
      setLoadingOperation('checking-attempts');
      const quizzes = await quizService.getQuizzesByStory(storyId);
      
      if (quizzes.length === 0) {
        toast({
          title: "No Quiz Found",
          description: "Walang quiz para sa kuwentong ito.",
          variant: "destructive",
        });
        return;
      }
      
      const quiz = quizzes[0];
      const attempts = await quizService.getQuizAttemptsByQuiz(quiz.quizId);
      
      if (attempts.length > 0) {
        toast({
          title: "Cannot Edit Quiz",
          description: "Hindi mo ma-edit ang quiz na may mga sagot na ng mga estudyante.",
          variant: "destructive",
        });
        return;
      }
      
      // Fetch the complete quiz details with correct answers for editing
      const quizWithCorrectAnswers = await quizService.getQuizDetailsWithCorrectAnswers(quiz.quizId);
      setEditingQuiz(quizWithCorrectAnswers);
    } catch (error) {
      console.error('Error checking quiz attempts:', error);
      toast({
        title: "Error",
        description: "Hindi ma-check ang quiz attempts. Subukang muli.",
        variant: "destructive",
      });
    } finally {
      setLoadingOperation(null);
    }
  };

  // Success handler for quiz edit
  const handleQuizEditSuccess = () => {
    setEditingQuiz(null);
    // Optionally refetch quiz attempts to update the count
    const story = stories.find(s => s.storyId === editingQuiz?.storyId);
    if (story) {
      // Update quiz attempts count if needed
    }
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <TeacherSidebar />
          <SidebarInset className="flex-1">
            <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-teal-600 mx-auto mb-4" />
                <p className="text-gray-600">Loading your stories...</p>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

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
                      Teacher Stories
                    </h1>
                    <p className="text-gray-600 text-sm">Manage your interactive Filipino stories and quizzes</p>
                  </div>
                </div>
                <CreateStoryForm />
              </div>
            </header>

            <div className="p-6">
              {/* Error State */}
              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Search and Filter Section */}
              <div className="mb-8 bg-white rounded-lg p-6 shadow-sm border border-teal-100">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search stories by title or content..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 border-teal-200 focus:border-teal-500"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={selectedGenre}
                      onChange={(e) => setSelectedGenre(e.target.value)}
                      className="px-3 py-2 border border-teal-200 rounded-md focus:border-teal-500 focus:outline-none"
                    >
                      <option value="all">All Genres</option>
                      {STORY_GENRES.map(genre => (
                        <option key={genre.value} value={genre.value}>
                          {genre.label}
                        </option>
                      ))}
                    </select>
                    <Button variant="outline" className="border-teal-200 text-teal-600 hover:bg-teal-50">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                </div>
              </div>

              {/* Stories Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStories.map((story) => {
                  const readingTime = getReadingTimeEstimate(story.content);
                  const createdDate = new Date(story.createdAt);
                  const storyAttempts = quizAttempts[story.storyId] || 0;
                  
                  return (
                    <Card key={story.storyId} className="hover:shadow-lg transition-shadow border-teal-100">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg mb-2 text-gray-900">{story.title}</CardTitle>
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <Badge 
                                className="text-xs"
                                style={{ 
                                  backgroundColor: getGenreColor(story.genre),
                                  color: 'white'
                                }}
                              >
                                {getGenreLabel(story.genre)}
                              </Badge>
                              {story.fictionType && (
                                <Badge variant="outline" className="text-xs">
                                  {story.fictionType}
                                </Badge>
                              )}
                              <Badge className={`text-xs ${story.isActive ? 'bg-teal-100 text-teal-800' : 'bg-gray-100 text-gray-800'}`}>
                                {story.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                              {storyAttempts > 0 && (
                                <Badge className="text-xs bg-blue-100 text-blue-800">
                                  {storyAttempts} attempts
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <CardDescription className="text-sm text-gray-600">
                          {story.content.length > 150 
                            ? `${story.content.substring(0, 150)}...` 
                            : story.content}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* Story Stats */}
                          <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="bg-teal-50 p-3 rounded-lg">
                              <p className="text-lg font-semibold text-teal-600">{readingTime}</p>
                              <p className="text-xs text-gray-500">Min read</p>
                            </div>
                            <div className="bg-cyan-50 p-3 rounded-lg">
                              <p className="text-sm font-semibold text-cyan-600">{story.classEntity.className}</p>
                              <p className="text-xs text-gray-500">Class</p>
                            </div>
                          </div>

                          {/* Cover Image Preview */}
                          {story.coverPictureUrl && (
                            <div className="relative h-32 bg-gray-100 rounded-lg overflow-hidden">
                              <img 
                                src={story.coverPictureUrl} 
                                alt={story.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}

                          {/* Create Quiz Button */}
                          <div className="mb-3">
                            <CreateQuizForm triggerClassName="w-full" />
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="flex-1 text-teal-600 border-teal-200 hover:bg-teal-50"
                              onClick={() => handleViewQuiz(story.storyId)}
                              disabled={loadingOperation === 'loading-quiz'}
                            >
                              {loadingOperation === 'loading-quiz' ? (
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                              ) : (
                                <Eye className="h-4 w-4 mr-1" />
                              )}
                              Quiz
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="flex-1 text-cyan-600 border-cyan-200 hover:bg-cyan-50"
                              onClick={() => handleEditStory(story)}
                              disabled={!!loadingOperation}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => setDeleteStoryId(story.storyId)}
                              disabled={!!loadingOperation}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="text-xs text-gray-500 text-center">
                            Created: {createdDate.toLocaleDateString()}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Empty State */}
              {!loading && filteredStories.length === 0 && (
                <div className="text-center py-12">
                  <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    {stories.length === 0 ? 'No stories yet' : 'No stories found'}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {stories.length === 0 
                      ? 'Create your first story to get started teaching Filipino literature.'
                      : searchTerm || selectedGenre !== 'all' 
                        ? 'Try adjusting your search or filter criteria.' 
                        : 'No stories match your current filters.'}
                  </p>
                  <CreateStoryForm />
                </div>
              )}
            </div>
          </div>
        </SidebarInset>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteStoryId} onOpenChange={() => setDeleteStoryId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Story</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this story? This action cannot be undone.
              Ang akshong ito ay hindi na maipagbabalik.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loadingOperation === 'deleting'}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteStory}
              disabled={loadingOperation === 'deleting'}
              className="bg-red-600 hover:bg-red-700"
            >
              {loadingOperation === 'deleting' ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Story Dialog */}
      <Dialog open={!!editingStory} onOpenChange={() => setEditingStory(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Story</DialogTitle>
            <DialogDescription>
              Make changes to your story. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          {editingStory && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={editingStory.title}
                  onChange={(e) => setEditingStory({...editingStory, title: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Content</label>
                <textarea
                  value={editingStory.content}
                  onChange={(e) => setEditingStory({...editingStory, content: e.target.value})}
                  className="w-full min-h-[200px] p-3 border border-gray-300 rounded-md resize-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Genre</label>
                <select
                  value={editingStory.genre}
                  onChange={(e) => setEditingStory({...editingStory, genre: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  {STORY_GENRES.map(genre => (
                    <option key={genre.value} value={genre.value}>
                      {genre.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingStory(null)}>
              Cancel
            </Button>
            <Button 
              onClick={() => editingStory && handleUpdateStory(editingStory)}
              disabled={loadingOperation === 'updating'}
            >
              {loadingOperation === 'updating' ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Quiz Dialog */}
      <Dialog open={!!viewingQuiz} onOpenChange={() => setViewingQuiz(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <HelpCircle className="h-5 w-5 text-teal-600" />
              <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Quiz Details
              </span>
            </DialogTitle>
            <DialogDescription>
              Tingnan ang detalyadong impormasyon ng pagsusulit at mga tanong.
            </DialogDescription>
          </DialogHeader>
          {viewingQuiz && (
            <div className="space-y-6">
              {/* Quiz Header Information */}
              <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-6 rounded-lg border border-teal-200">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-bold text-xl text-gray-900 mb-2">{viewingQuiz.title}</h3>
                    <p className="text-gray-700 mb-4">{viewingQuiz.description}</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-teal-100 text-teal-800 border-teal-200">
                        {viewingQuiz.category}
                      </Badge>
                      <Badge className="bg-cyan-100 text-cyan-800 border-cyan-200">
                        {viewingQuiz.questions?.length || 0} Tanong
                      </Badge>
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        {viewingQuiz.questions?.reduce((sum, q) => sum + q.points, 0) || 0} Puntos
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-white p-4 rounded-lg border border-teal-100">
                      <div className="flex items-center space-x-2 mb-2">
                        <Clock className="h-4 w-4 text-teal-600" />
                        <span className="text-sm font-medium text-gray-700">Limitasyon ng Oras</span>
                      </div>
                      <p className="text-lg font-semibold text-teal-600">{viewingQuiz.timeLimitMinutes} minuto</p>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg border border-cyan-100">
                      <p className="text-sm text-gray-500 mb-1">Kuwento</p>
                      <p className="font-medium text-gray-900">{viewingQuiz.storyTitle}</p>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg border border-green-100">
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Bubukas Sa</p>
                          <p className="font-medium text-green-600">
                            {new Date(viewingQuiz.opensAt).toLocaleDateString('fil-PH', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Sasara Sa</p>
                          <p className="font-medium text-red-600">
                            {new Date(viewingQuiz.closesAt).toLocaleDateString('fil-PH', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditQuiz(viewingQuiz.storyId)}
                      disabled={loadingOperation === 'checking-attempts'}
                      className="w-full border-teal-200 text-teal-600 hover:bg-teal-50"
                    >
                      {loadingOperation === 'checking-attempts' ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Checking...
                        </>
                      ) : (
                        <>
                          <Edit className="h-4 w-4 mr-2" />
                          I-edit ang Quiz
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Questions Section */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <h4 className="text-lg font-semibold text-gray-900">Mga Tanong</h4>
                  <Badge variant="outline" className="text-teal-600">
                    {viewingQuiz.questions?.length || 0} kabuuan
                  </Badge>
                </div>
                
                <div className="space-y-4">
                  {viewingQuiz.questions?.map((question, index: number) => (
                    <Card key={question.questionId} className="border-teal-100 hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-base text-gray-900">
                            Tanong {index + 1}
                          </CardTitle>
                          <Badge className="bg-cyan-100 text-cyan-800">
                            {question.points} puntos
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <p className="font-medium text-gray-900">{question.questionText}</p>
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-700 mb-2">Mga Pagpipilian:</p>
                          <div className="space-y-2">
                            {question.options?.map((option: string, optIndex: number) => {
                              const isCorrect = option === question.correctAnswer;
                              return (
                                <div
                                  key={optIndex}
                                  className={`p-3 rounded-lg border-2 transition-colors ${
                                    isCorrect
                                      ? 'bg-teal-50 border-teal-300 text-teal-900'
                                      : 'bg-white border-gray-200 text-gray-700'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="flex items-center space-x-2">
                                      <span className={`font-semibold ${isCorrect ? 'text-teal-600' : 'text-gray-500'}`}>
                                        {String.fromCharCode(65 + optIndex)}.
                                      </span>
                                      <span>{option}</span>
                                    </span>
                                    {isCorrect && (
                                      <Badge className="bg-teal-500 text-white text-xs">
                                        Tamang Sagot
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="border-t pt-4">
            <Button 
              variant="outline" 
              onClick={() => setViewingQuiz(null)}
              className="border-teal-200 text-teal-600 hover:bg-teal-50"
            >
              Isara
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Quiz Form */}
      <CreateQuizForm
        mode="edit"
        existingQuiz={editingQuiz || undefined}
        isOpen={!!editingQuiz}
        onOpenChange={(open) => !open && setEditingQuiz(null)}
        onSuccess={handleQuizEditSuccess}
      />
    </SidebarProvider>
  );
};

export default TeacherStories;
