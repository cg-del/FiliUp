import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Eye, Trash2, RefreshCw, List, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { classService } from '@/lib/services/classService';
import { commonStoryService, type CommonStory } from '@/lib/services/commonStoryService';
import AddCommonStoryToClass from './AddCommonStoryToClass';

interface ClassCommonStoriesProps {
  selectedClass: string;
  className?: string;
}

export default function ClassCommonStories({ selectedClass, className }: ClassCommonStoriesProps) {
  const [stories, setStories] = useState<CommonStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewStory, setViewStory] = useState<CommonStory | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [storyToRemove, setStoryToRemove] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);
  
  const { toast } = useToast();

  const fetchClassStories = async () => {
    if (!selectedClass) return;
    
    setLoading(true);
    try {
      const response = await classService.getClassCommonStories(selectedClass);
      if (response.data) {
        setStories(response.data);
      } else {
        setStories([]);
      }
    } catch (error) {
      console.error('Error fetching class stories:', error);
      toast({
        title: "Error",
        description: "Failed to fetch stories for this class",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassStories();
  }, [selectedClass]);

  const handleViewStory = async (storyId: string) => {
    try {
      const story = await commonStoryService.getStoryById(storyId);
      setViewStory(story);
      setIsViewDialogOpen(true);
    } catch (error) {
      console.error('Error fetching story details:', error);
      toast({
        title: "Error",
        description: "Failed to load story details",
        variant: "destructive",
      });
    }
  };

  const confirmRemoveStory = (storyId: string) => {
    setStoryToRemove(storyId);
    setIsConfirmDialogOpen(true);
  };

  const handleRemoveStory = async () => {
    if (!storyToRemove) return;
    
    setRemoving(true);
    try {
      await classService.removeCommonStoryFromClass(selectedClass, storyToRemove);
      
      // Update the local state to remove the story
      setStories(stories.filter(story => story.storyId !== storyToRemove));
      
      toast({
        title: "Success",
        description: "Story removed from class",
      });
      
      setIsConfirmDialogOpen(false);
      setStoryToRemove(null);
    } catch (error) {
      console.error('Error removing story:', error);
      toast({
        title: "Error",
        description: "Failed to remove story from class",
        variant: "destructive",
      });
    } finally {
      setRemoving(false);
    }
  };

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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <BookOpen className="h-5 w-5 mr-2 text-teal-600" />
          <h2 className="text-xl font-semibold text-gray-800">
            Common Stories for {className || 'Class'}
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchClassStories}
            className="border-teal-200 text-teal-600 hover:bg-teal-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <AddCommonStoryToClass 
            selectedClass={selectedClass} 
            onSuccess={fetchClassStories}
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
          <span className="ml-3 text-gray-600">Loading stories...</span>
        </div>
      )}

      {/* Empty State */}
      {!loading && stories.length === 0 && (
        <Card className="border-dashed border-2 border-gray-200 bg-gray-50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">No Common Stories Added</h3>
            <p className="text-gray-500 text-center mb-6 max-w-md">
              Add common stories to this class to provide students with additional reading materials.
            </p>
            <AddCommonStoryToClass 
              selectedClass={selectedClass} 
              onSuccess={fetchClassStories}
            />
          </CardContent>
        </Card>
      )}

      {/* Stories List */}
      {!loading && stories.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stories.map((story) => (
            <Card key={story.storyId} className="border border-gray-200 hover:border-teal-200 transition-colors">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{story.title}</h3>
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
                    <p className="text-sm text-gray-600 mb-3">
                      {truncateContent(story.content)}
                    </p>
                    <div className="text-xs text-gray-500">
                      Added by {story.createdBy?.userName || 'Unknown'} • {formatDate(story.createdAt)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-end mt-4 space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                    onClick={() => handleViewStory(story.storyId)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => confirmRemoveStory(story.storyId)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* View Story Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{viewStory?.title}</DialogTitle>
            <div className="flex flex-wrap gap-2 mt-2">
              {viewStory?.genre && (
                <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">
                  {viewStory.genre}
                </Badge>
              )}
              {viewStory?.fictionType && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {viewStory.fictionType}
                </Badge>
              )}
            </div>
          </DialogHeader>
          
          <div className="mt-4">
            <div className="bg-gray-50 p-6 rounded-md border border-gray-200 whitespace-pre-wrap">
              {viewStory?.content}
            </div>
            
            <div className="mt-4 text-sm text-gray-500">
              <div>Author: {viewStory?.createdBy?.userName || 'Unknown'}</div>
              {viewStory?.createdAt && (
                <div>Created: {formatDate(viewStory.createdAt)}</div>
              )}
            </div>
          </div>
          
          <DialogFooter className="mt-6">
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Removal Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Story</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this story from the class? 
              This won't delete the story, but it will no longer be available to students in this class.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsConfirmDialogOpen(false)}
              disabled={removing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemoveStory}
              disabled={removing}
            >
              {removing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Removing...
                </>
              ) : (
                'Remove'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 