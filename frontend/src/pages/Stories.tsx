import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { BookOpen, Plus, Search, Filter, Eye, Edit, Trash2, HelpCircle, Loader2 } from 'lucide-react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { TeacherSidebar } from '../components/TeacherSidebar';
import { STORY_GENRES, getGenreByValue } from '../constants/storyGenres';
import CreateStoryForm from '../components/CreateStoryForm';
import CreateQuizForm from '../components/CreateQuizForm';
import { storyService } from '@/lib/services/storyService';
import { toast } from '@/hooks/use-toast';

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
                            <Button size="sm" variant="outline" className="flex-1 text-teal-600 border-teal-200 hover:bg-teal-50">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1 text-cyan-600 border-cyan-200 hover:bg-cyan-50">
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
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
    </SidebarProvider>
  );
};

export default TeacherStories;
