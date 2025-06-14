import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, Search, Filter, Globe, Check, Loader2, Plus } from 'lucide-react';
import { commonStoryService, type CommonStory } from '@/lib/services/commonStoryService';
import { classService } from '@/lib/services/classService';
import type { Class } from '@/lib/services/types';
import { Badge } from '@/components/ui/badge';

interface AddCommonStoryToClassProps {
  selectedClass?: string;
  onSuccess?: () => void;
}

export default function AddCommonStoryToClass({ selectedClass, onSuccess }: AddCommonStoryToClassProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [stories, setStories] = useState<CommonStory[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedStory, setSelectedStory] = useState<string>('');
  const [selectedClassId, setSelectedClassId] = useState<string>(selectedClass || '');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [genreFilter, setGenreFilter] = useState('all');
  const [availableGenres, setAvailableGenres] = useState<string[]>([]);
  
  const { toast } = useToast();

  // Fetch common stories when dialog opens
  const fetchStories = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (genreFilter !== 'all') params.genre = genreFilter;

      const response = await commonStoryService.getActiveCommonStories(params);
      let filteredStories = response.stories || [];
      
      // Apply search filter if there's a search term
      if (search) {
        filteredStories = filteredStories.filter((story: CommonStory) => 
          story.title.toLowerCase().includes(search.toLowerCase()) ||
          story.genre.toLowerCase().includes(search.toLowerCase()) ||
          (story.createdBy?.userName || '').toLowerCase().includes(search.toLowerCase())
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

  // Fetch available genres for filtering
  const fetchGenres = async () => {
    try {
      const genresResponse = await commonStoryService.getAvailableGenres();
      setAvailableGenres(Array.from(genresResponse));
    } catch (error) {
      console.error('Error fetching genres:', error);
    }
  };

  // Fetch teacher's classes
  const fetchClasses = async () => {
    try {
      const response = await classService.getClassesByTeacher();
      if (response.data) {
        setClasses(response.data);
        // Set default class if provided and exists in the fetched classes
        if (selectedClass && response.data.some(cls => cls.classId === selectedClass)) {
          setSelectedClassId(selectedClass);
        } else if (response.data.length > 0) {
          // Otherwise use the first class
          setSelectedClassId(response.data[0].classId);
        }
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast({
        title: "Error",
        description: "Failed to fetch classes. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Load data when dialog opens
  useEffect(() => {
    if (isOpen) {
      fetchStories();
      fetchGenres();
      fetchClasses();
    }
  }, [isOpen]);

  // Refresh stories when search or filter changes
  useEffect(() => {
    if (isOpen) {
      fetchStories();
    }
  }, [search, genreFilter, isOpen]);

  // Handle adding story to class
  const handleAddStoryToClass = async () => {
    if (!selectedStory || !selectedClassId) {
      toast({
        title: "Error",
        description: "Please select both a story and a class.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      // Log the authentication token for debugging
      const token = localStorage.getItem('accessToken') || 
                    localStorage.getItem('authToken') || 
                    localStorage.getItem('token');
      console.log('Using token for API call:', token ? 'Yes (length: ' + token.length + ')' : 'No');
      console.log('ClassId:', selectedClassId);
      console.log('StoryId:', selectedStory);
      
      // Call the API to add the story to the class
      await classService.addCommonStoryToClass(selectedClassId, selectedStory);
      
      toast({
        title: "Success",
        description: "Story successfully added to class!",
      });
      
      // Reset form and close dialog
      setSelectedStory('');
      setIsOpen(false);
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error adding story to class:', error);
      toast({
        title: "Error",
        description: "Failed to add story to class. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateContent = (content: string, maxLength: number = 100) => {
    return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600">
          <Plus className="h-4 w-4 mr-2" />
          Add Common Story
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-2xl">
            <Globe className="h-5 w-5 mr-2 text-teal-600" />
            Add Common Story to Class
          </DialogTitle>
          <DialogDescription>
            Browse and select from our collection of common stories to add to your class.
          </DialogDescription>
        </DialogHeader>
        
        {/* Filters and Search */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <Label htmlFor="story-search">Search Stories</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="story-search"
                placeholder="Search by title, genre..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="genre-filter">Filter by Genre</Label>
            <Select value={genreFilter} onValueChange={setGenreFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All genres" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All genres</SelectItem>
                {availableGenres.map((genre) => (
                  <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="class-select">Select Class</Label>
            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((cls) => (
                  <SelectItem key={cls.classId} value={cls.classId}>{cls.className}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
            <span className="ml-3 text-gray-600">Loading stories...</span>
          </div>
        )}
        
        {/* Story List */}
        {!loading && stories.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>No stories found. Try adjusting your filters.</p>
          </div>
        )}
        
        {!loading && stories.length > 0 && (
          <div className="grid grid-cols-1 gap-4 mt-2">
            {stories.map((story) => (
              <Card 
                key={story.storyId} 
                className={`cursor-pointer transition-all ${selectedStory === story.storyId ? 'ring-2 ring-teal-500 bg-teal-50' : 'hover:bg-gray-50'}`}
                onClick={() => setSelectedStory(story.storyId)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <h3 className="text-lg font-semibold">{story.title}</h3>
                        {selectedStory === story.storyId && (
                          <Check className="h-5 w-5 ml-2 text-teal-600" />
                        )}
                      </div>
                      
                      <div className="mb-2 flex flex-wrap gap-2">
                        <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">
                          {story.genre}
                        </Badge>
                        {story.fictionType && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {story.fictionType}
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-2">
                        {truncateContent(story.content)}
                      </p>
                      
                      <div className="text-sm text-gray-500 mt-2 flex items-center">
                        <span>By {story.createdBy?.userName || 'Unknown'}</span>
                        <span className="mx-2">•</span>
                        <span>{formatDate(story.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        <DialogFooter className="flex items-center justify-between mt-4">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleAddStoryToClass}
            disabled={!selectedStory || !selectedClassId || submitting}
            className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Add to Class
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 