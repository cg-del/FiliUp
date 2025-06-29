import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  BookOpen, 
  Filter, 
  Search, 
  RefreshCw, 
  Eye, 
  User,
  Calendar,
  Globe,
  Heart,
  BookmarkPlus,
  CheckSquare
} from 'lucide-react';
import { commonStoryService, type CommonStory } from '@/lib/services/commonStoryService';
import CommonStoryQuizList from '@/components/CommonStoryQuizList';
import { useAuth } from '@/contexts/AuthContext';

interface StoryFilters {
  genre: string;
  fictionType: string;
  search: string;
}

export default function CommonStories() {
  const { user } = useAuth();
  const [stories, setStories] = useState<CommonStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<StoryFilters>({
    genre: 'all',
    fictionType: 'all',
    search: ''
  });
  const [availableGenres, setAvailableGenres] = useState<string[]>([]);
  const [availableFictionTypes, setAvailableFictionTypes] = useState<string[]>([]);
  
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewingStory, setViewingStory] = useState<CommonStory | null>(null);
  const [activeTab, setActiveTab] = useState('content');

  const { toast } = useToast();
  const isTeacher = user?.role === 'TEACHER' || user?.role === 'ADMIN';

  const fetchStories = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filters.genre !== 'all') params.genre = filters.genre;
      if (filters.fictionType !== 'all') params.fictionType = filters.fictionType;

      const response = await commonStoryService.getActiveCommonStories(params);
      let filteredStories = response.stories || [];

      // Apply search filter
      if (filters.search) {
        filteredStories = filteredStories.filter((story: CommonStory) =>
          story.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          story.genre.toLowerCase().includes(filters.search.toLowerCase()) ||
          (story.createdBy?.userName || '').toLowerCase().includes(filters.search.toLowerCase())
        );
      }
      
      setStories(filteredStories);
    } catch (error) {
      console.error('Error fetching common stories:', error);
      toast({
        title: "Error",
        description: "Failed to fetch stories. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchGenresAndFictionTypes = async () => {
    try {
      const [genresResponse, fictionTypesResponse] = await Promise.all([
        commonStoryService.getAvailableGenres(),
        commonStoryService.getAvailableFictionTypes()
      ]);
      
      setAvailableGenres(Array.from(genresResponse));
      setAvailableFictionTypes(Array.from(fictionTypesResponse));
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  };

  useEffect(() => {
    fetchStories();
  }, [filters]);

  useEffect(() => {
    fetchGenresAndFictionTypes();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
  };

  const handleOpenStoryDialog = (story: CommonStory) => {
    setViewingStory(story);
    setIsViewDialogOpen(true);
    setActiveTab('content'); // Reset to content tab when opening dialog
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-teal-100">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Globe className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  Common Stories
                </h1>
                <p className="text-gray-600">Discover stories from our community</p>
              </div>
            </div>
            <Button onClick={fetchStories} variant="outline" className="border-teal-200 text-teal-600 hover:bg-teal-50">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </header>
      
      <div className="max-w-7xl mx-auto p-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Explore Public Stories 📚
          </h2>
          <p className="text-gray-600">Browse through our collection of public stories available to all users.</p>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6 bg-white shadow-sm border border-teal-100">
          <CardHeader>
            <CardTitle className="text-lg flex items-center text-teal-800">
              <Filter className="w-5 h-5 mr-2 text-teal-600" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="search"
                    placeholder="Search stories..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="genre">Genre</Label>
                <Select 
                  value={filters.genre} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, genre: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All genres" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All genres</SelectItem>
                    {availableGenres.map((genre) => (
                      <SelectItem key={genre} value={genre}>
                        {genre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="fictionType">Fiction Type</Label>
                <Select 
                  value={filters.fictionType} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, fictionType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    {availableFictionTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => setFilters({ genre: 'all', fictionType: 'all', search: '' })}
                  className="w-full border-teal-200 text-teal-600 hover:bg-teal-50"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stories Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            <p className="mt-4 text-gray-600">Loading stories...</p>
          </div>
        ) : stories.length === 0 ? (
          <div className="text-center py-12">
            <Globe className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Stories Found</h3>
            <p className="text-gray-600">Try adjusting your filters to find more stories.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((story) => (
              <Card key={story.storyId} className="bg-white shadow-sm border border-teal-100 hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg line-clamp-2 text-gray-900">
                      {story.title}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenStoryDialog(story)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center mb-3 text-sm text-gray-600">
                    <User className="w-4 h-4 mr-1" />
                    <span>{story.createdBy?.userName || 'Unknown'}</span>
                    <span className="mx-2">•</span>
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>{formatDate(story.createdAt)}</span>
                  </div>
                  
                  <div className="mb-3 text-sm text-gray-700 line-clamp-3">
                    {truncateContent(story.content)}
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="bg-teal-100 text-teal-800 hover:bg-teal-200">
                      {story.genre}
                    </Badge>
                    {story.fictionType && (
                      <Badge variant="outline" className="border-cyan-200 text-cyan-800">
                        {story.fictionType}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Story View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {viewingStory && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">{viewingStory.title}</DialogTitle>
                <DialogDescription className="flex items-center text-sm text-gray-600">
                  <User className="w-4 h-4 mr-1" />
                  <span>{viewingStory.createdBy?.userName || 'Unknown'}</span>
                  <span className="mx-2">•</span>
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>{formatDate(viewingStory.createdAt)}</span>
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary" className="bg-teal-100 text-teal-800">
                  {viewingStory.genre}
                </Badge>
                {viewingStory.fictionType && (
                  <Badge variant="outline" className="border-cyan-200 text-cyan-800">
                    {viewingStory.fictionType}
                  </Badge>
                )}
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="content" className="flex items-center">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Story Content
                  </TabsTrigger>
                  <TabsTrigger value="quizzes" className="flex items-center">
                    <CheckSquare className="w-4 h-4 mr-2" />
                    Quizzes
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="content" className="mt-0">
                  <div className="prose max-w-none">
                    {viewingStory.content.split('\n').map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="quizzes" className="mt-0">
                  <CommonStoryQuizList 
                    storyId={viewingStory.storyId} 
                    storyTitle={viewingStory.title} 
                  />
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 