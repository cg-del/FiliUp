import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/AdminSidebar';
import { 
  Filter, 
  Search, 
  RefreshCw, 
  Download, 
  Plus,
  Eye, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  User,
  Calendar,
  Globe,
  Loader2
} from 'lucide-react';
import { commonStoryService, type CommonStory, type CreateCommonStoryRequest } from '@/lib/services/commonStoryService';
import { STORY_GENRES } from '@/constants/storyGenres';

interface StoryFilters {
  status: string;
  search: string;
}

const AdminCommonStories = () => {
  const [stories, setStories] = useState<CommonStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<StoryFilters>({
    status: 'all',
    search: ''
  });
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [viewingStory, setViewingStory] = useState<CommonStory | null>(null);
  const [editingStory, setEditingStory] = useState<CommonStory | null>(null);
  
  const [newStory, setNewStory] = useState<CreateCommonStoryRequest>({
    title: '',
    content: '',
    genre: '',
    fictionType: '',
    coverPictureUrl: ''
  });

  const [selectedCoverFile, setSelectedCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  const { toast } = useToast();

  const handleCoverFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error",
          description: "Please select a valid image file",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "File size must be less than 5MB",
          variant: "destructive",
        });
        return;
      }

      setSelectedCoverFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setCoverPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearCoverImage = () => {
    setSelectedCoverFile(null);
    setCoverPreview('');
    setNewStory(prev => ({ 
      ...prev, 
      coverPictureUrl: ''
    }));
  };

  const fetchStories = async () => {
    setLoading(true);
    try {
      const response = await commonStoryService.getAllCommonStories();
      let filteredStories = response.stories || [];

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
        description: "Failed to fetch common stories. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, [filters]);

  const handleCreateStory = async () => {
    if (!newStory.title || !newStory.content || !newStory.genre) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      let coverPictureUrl = '';
      let coverPictureType = '';

      // Step 1: Upload cover image to Cloudinary if provided
      if (selectedCoverFile) {
        setIsUploadingCover(true);
        try {
          const uploadResult = await commonStoryService.uploadCoverImage(selectedCoverFile);
          coverPictureUrl = uploadResult.url;
          coverPictureType = selectedCoverFile.type;
          toast({
            title: "Cover Image Uploaded",
            description: "Cover image uploaded successfully.",
          });
        } catch (uploadError) {
          console.error('Error uploading cover image:', uploadError);
          toast({
            title: "Error",
            description: "Failed to upload cover image. Please try again.",
            variant: "destructive",
          });
          setIsUploadingCover(false);
          return;
        }
        setIsUploadingCover(false);
      }

      // Step 2: Create the story with Cloudinary URL
      const storyData = {
        ...newStory,
        coverPictureUrl,
        coverPictureType
      };

      await commonStoryService.createCommonStory(storyData);
      toast({
        title: "Success",
        description: "Common story created successfully",
      });
      setIsCreateDialogOpen(false);
      setNewStory({
        title: '',
        content: '',
        genre: '',
        fictionType: '',
        coverPictureUrl: ''
      });
      clearCoverImage();
      fetchStories();
    } catch (error) {
      console.error('Error creating story:', error);
      toast({
        title: "Error",
        description: "Failed to create story. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateStory = async () => {
    if (!editingStory) return;
    
    try {
      // Validate required fields
      if (!editingStory.title || !editingStory.content || !editingStory.genre) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      await commonStoryService.updateCommonStory(editingStory.storyId, {
        title: editingStory.title,
        content: editingStory.content,
        genre: editingStory.genre,
        fictionType: editingStory.fictionType,
        coverPictureUrl: editingStory.coverPictureUrl
      });
      
      toast({
        title: "Success",
        description: "Common story updated successfully",
      });
      setIsEditDialogOpen(false);
      setEditingStory(null);
      fetchStories();
    } catch (error) {
      console.error('Error updating story:', error);
      toast({
        title: "Error",
        description: "Failed to update story. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteStory = async (storyId: string) => {
    if (!confirm('Are you sure you want to delete this common story? This action cannot be undone.')) return;
    
    try {
      await commonStoryService.deleteCommonStory(storyId);
      toast({
        title: "Success",
        description: "Common story deleted successfully",
      });
      fetchStories();
    } catch (error) {
      console.error('Error deleting story:', error);
      toast({
        title: "Error",
        description: "Failed to delete story. Please try again.",
        variant: "destructive",
      });
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
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <SidebarInset className="flex-1">
          <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
            <header className="bg-white shadow-sm border-b border-teal-100">
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center space-x-4">
                  <SidebarTrigger className="text-teal-600" />
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                      Common Stories Management
                    </h1>
                    <p className="text-gray-600 text-sm">Manage public stories accessible to all users</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button onClick={fetchStories} variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                  <Button onClick={() => setIsCreateDialogOpen(true)} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Story
                  </Button>
                </div>
              </div>
            </header>
            
            <div className="p-6">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Common Stories Management 🌍
                </h1>
                <p className="text-gray-600">Create and manage public stories that are accessible to all users.</p>
              </div>

              <Card className="mb-6 bg-white shadow-sm border border-teal-100">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center text-teal-800">
                    <Filter className="w-5 h-5 mr-2 text-teal-600" />
                    Filters
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      <Label htmlFor="status">Status</Label>
                      <Select 
                        value={filters.status} 
                        onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All statuses</SelectItem>
                          <SelectItem value="true">Active</SelectItem>
                          <SelectItem value="false">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button 
                        variant="outline" 
                        onClick={() => setFilters({ status: 'all', search: '' })}
                        className="w-full"
                      >
                        Clear Filters
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm border border-teal-100">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-teal-800">
                    <span className="flex items-center">
                      <Globe className="w-5 h-5 mr-2 text-teal-600" />
                      Common Stories ({stories.length})
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Story Details</TableHead>
                        <TableHead>Author</TableHead>
                        <TableHead>Genre</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            Loading stories...
                          </TableCell>
                        </TableRow>
                      ) : stories.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            No common stories found
                          </TableCell>
                        </TableRow>
                      ) : (
                        stories.map((story) => (
                          <TableRow key={story.storyId}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{story.title}</div>
                                <div className="text-sm text-muted-foreground">
                                  {truncateContent(story.content)}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <User className="w-4 h-4 text-muted-foreground" />
                                <span>{story.createdBy?.userName || 'Unknown Author'}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {story.genre}
                              </Badge>
                              {story.fictionType && (
                                <Badge variant="secondary" className="ml-1">
                                  {story.fictionType}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant={story.isActive !== false ? 'default' : 'secondary'}>
                                {story.isActive !== false ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span>{formatDate(story.createdAt)}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem 
                                    onClick={() => {
                                      setViewingStory(story);
                                      setIsViewDialogOpen(true);
                                    }}
                                  >
                                    <Eye className="w-4 h-4 mr-2" />
                                    View
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => {
                                      setEditingStory(story);
                                      setIsEditDialogOpen(true);
                                    }}
                                  >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteStory(story.storyId)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Create Story Dialog */}
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create Common Story</DialogTitle>
                    <DialogDescription>
                      Create a new story that will be accessible to all users
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="newTitle">Title*</Label>
                      <Input
                        id="newTitle"
                        value={newStory.title}
                        onChange={(e) => setNewStory(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter story title"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="newGenre">Genre*</Label>
                        <Select 
                          value={newStory.genre} 
                          onValueChange={(value) => setNewStory(prev => ({ ...prev, genre: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select genre" />
                          </SelectTrigger>
                          <SelectContent>
                            {STORY_GENRES.map((genre) => (
                              <SelectItem key={genre.value} value={genre.value}>
                                {genre.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="newFictionType">Fiction Type</Label>
                        <Input
                          id="newFictionType"
                          value={newStory.fictionType}
                          onChange={(e) => setNewStory(prev => ({ ...prev, fictionType: e.target.value }))}
                          placeholder="e.g., Short Story, Novel"
                        />
                      </div>
                    </div>
                    
                    {/* Cover Image Upload */}
                    <div>
                      <Label htmlFor="coverImage">Cover Image (Optional)</Label>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                          <Input
                            id="coverImage"
                            type="file"
                            accept="image/*"
                            onChange={handleCoverFileChange}
                            className="flex-1"
                          />
                          {coverPreview && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={clearCoverImage}
                            >
                              Clear
                            </Button>
                          )}
                        </div>
                        {coverPreview && (
                          <div className="flex justify-center">
                            <img
                              src={coverPreview}
                              alt="Cover preview"
                              className="max-w-xs max-h-40 object-cover rounded-lg border"
                            />
                          </div>
                        )}
                        <p className="text-sm text-gray-500">
                          Supported formats: JPG, PNG, GIF. Max size: 5MB
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="newContent">Content*</Label>
                      <Textarea
                        id="newContent"
                        value={newStory.content}
                        onChange={(e) => setNewStory(prev => ({ ...prev, content: e.target.value }))}
                        placeholder="Write your story content here..."
                        rows={10}
                        className="resize-none"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => {
                        setIsCreateDialogOpen(false);
                        clearCoverImage();
                      }}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateStory} disabled={isUploadingCover}>
                        {isUploadingCover && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isUploadingCover ? 'Uploading Image...' : 'Create Story'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* View Story Dialog */}
              <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>View Common Story</DialogTitle>
                  </DialogHeader>
                  {viewingStory && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Title</Label>
                          <p className="font-medium">{viewingStory.title}</p>
                        </div>
                        <div>
                          <Label>Author</Label>
                          <p>{viewingStory.createdBy?.userName || 'Unknown Author'}</p>
                        </div>
                      </div>
                      <div>
                        <Label>Content</Label>
                        <div className="mt-2 p-4 bg-gray-50 rounded-lg max-h-60 overflow-y-auto">
                          <p className="whitespace-pre-wrap">{viewingStory.content}</p>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button onClick={() => setIsViewDialogOpen(false)}>
                          Close
                        </Button>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>

              {/* Edit Story Dialog */}
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Edit Common Story</DialogTitle>
                    <DialogDescription>
                      Update the story information
                    </DialogDescription>
                  </DialogHeader>
                  {editingStory && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="editTitle">Title*</Label>
                        <Input
                          id="editTitle"
                          value={editingStory.title}
                          onChange={(e) => setEditingStory(prev => prev ? ({ ...prev, title: e.target.value }) : null)}
                          placeholder="Enter story title"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="editGenre">Genre*</Label>
                          <Select 
                            value={editingStory.genre} 
                            onValueChange={(value) => setEditingStory(prev => prev ? ({ ...prev, genre: value }) : null)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select genre" />
                            </SelectTrigger>
                            <SelectContent>
                              {STORY_GENRES.map((genre) => (
                                <SelectItem key={genre.value} value={genre.value}>
                                  {genre.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="editFictionType">Fiction Type</Label>
                          <Input
                            id="editFictionType"
                            value={editingStory.fictionType || ''}
                            onChange={(e) => setEditingStory(prev => prev ? ({ ...prev, fictionType: e.target.value }) : null)}
                            placeholder="e.g., Short Story, Novel"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="editContent">Content*</Label>
                        <Textarea
                          id="editContent"
                          value={editingStory.content}
                          onChange={(e) => setEditingStory(prev => prev ? ({ ...prev, content: e.target.value }) : null)}
                          placeholder="Write your story content here..."
                          rows={10}
                          className="resize-none"
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleUpdateStory}>
                          Update Story
                        </Button>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AdminCommonStories;

 