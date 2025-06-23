import { useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/AdminSidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { adminService, type AdminStory } from '@/lib/services/adminService';
import { useToast } from '@/components/ui/use-toast';
import {
  BookOpen,
  Search,
  MoreHorizontal,
  Eye,
  Filter,
  Download,
  RefreshCw,
  Calendar,
  User
} from 'lucide-react';

interface StoryFilters {
  status: string;
  teacherId: string;
  search: string;
}

export default function AdminStories() {
  const [stories, setStories] = useState<AdminStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<StoryFilters>({
    status: 'all',
    teacherId: '',
    search: ''
  });
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewingStory, setViewingStory] = useState<AdminStory | null>(null);
  const { toast } = useToast();

  const fetchStories = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filters.status && filters.status !== 'all') params.status = filters.status;
      if (filters.teacherId) params.teacherId = filters.teacherId;
      
      const response = await adminService.getStories(params);
      let filteredStories = response.stories || [];
      
      // Apply search filter
      if (filters.search) {
        filteredStories = filteredStories.filter((story: AdminStory) =>
          story.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          story.genre.toLowerCase().includes(filters.search.toLowerCase()) ||
          (story.createdBy?.userName || '').toLowerCase().includes(filters.search.toLowerCase())
        );
      }
      
      setStories(filteredStories);
    } catch (error) {
      console.error('Error fetching stories:', error);
      toast({
        title: "Error",
        description: "Failed to fetch stories. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, [filters]);

  // Note: Admin can only view teacher-created stories, not edit or delete them
  // Edit and delete functionality has been removed for teacher-created stories
  // Only common stories can be managed through the Admin Common Stories page

  const getStatusBadgeVariant = (status: boolean) => {
    return status ? 'default' : 'secondary';
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
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-teal-100">
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center space-x-4">
                  <SidebarTrigger className="text-teal-600" />
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                      Teacher Stories (View Only)
                    </h1>
                    <p className="text-gray-600 text-sm">Review stories created by teachers - read-only access</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button onClick={fetchStories} variant="outline" size="sm" className="border-teal-200 text-teal-600 hover:bg-teal-50">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
            </header>
            
            <div className="p-6">
              {/* Welcome Section */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Teacher Stories 📚
                </h1>
                <p className="text-gray-600">Review and view all stories created by teachers. These stories cannot be edited or deleted by admin.</p>
              </div>

          {/* Notice */}
          <Card className="mb-6 bg-amber-50 border border-amber-200">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <BookOpen className="w-6 h-6 text-amber-600" />
                <div>
                  <h3 className="font-semibold text-amber-800">Teacher Stories - View Only</h3>
                  <p className="text-sm text-amber-700">
                    These stories were created by teachers. You can view them but cannot edit or delete them. 
                    To create and manage stories as an admin, use the Common Stories section.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

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
                <div>
                  <Label htmlFor="teacher">Teacher</Label>
                  <Input
                    id="teacher"
                    placeholder="Teacher ID"
                    value={filters.teacherId}
                    onChange={(e) => setFilters(prev => ({ ...prev, teacherId: e.target.value }))}
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    variant="outline" 
                    onClick={() => setFilters({ status: 'all', teacherId: '', search: '' })}
                    className="w-full border-teal-200 text-teal-600 hover:bg-teal-50"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stories Table */}
          <Card className="bg-white shadow-sm border border-teal-100">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-teal-800">
                <span className="flex items-center">
                  <BookOpen className="w-5 h-5 mr-2 text-teal-600" />
                  Stories ({stories.length})
                </span>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Story</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Genre</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-12">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={6} className="text-center py-8">
                          Loading stories...
                        </TableCell>
                      </TableRow>
                    ))
                  ) : stories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        No stories found
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
                          <Badge variant={getStatusBadgeVariant(story.isActive)}>
                            {story.isActive ? 'Active' : 'Inactive'}
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

          {/* View Story Dialog */}
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>View Story</DialogTitle>
                <DialogDescription>
                  Story details and content
                </DialogDescription>
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
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Genre</Label>
                      <p>{viewingStory.genre}</p>
                    </div>
                    <div>
                      <Label>Fiction Type</Label>
                      <p>{viewingStory.fictionType || 'Not specified'}</p>
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


            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
} 