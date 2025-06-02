
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Plus, BookOpen, Upload, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { STORY_GENRES } from '@/constants/storyGenres';

interface CreateStoryFormData {
  title: string;
  content: string;
  genre: string;
  coverPictureUrl?: string;
  isActive: boolean;
  classId: string;
}

interface CreateStoryFormProps {
  selectedClass?: string;
}

const CreateStoryForm = ({ selectedClass }: CreateStoryFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string>('');
  const { user } = useAuth();
  const { toast } = useToast();
  
  const form = useForm<CreateStoryFormData>({
    defaultValues: {
      title: '',
      content: '',
      genre: '',
      coverPictureUrl: '',
      isActive: true,
      classId: selectedClass || user?.classes?.[0] || ''
    }
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File Type",
          description: "Please select an image file.",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }

      setCoverImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setCoverImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeCoverImage = () => {
    setCoverImage(null);
    setCoverImagePreview('');
    form.setValue('coverPictureUrl', '');
  };

  const onSubmit = async (data: CreateStoryFormData) => {
    try {
      // Generate story ID (UUID simulation)
      const storyId = crypto.randomUUID();
      
      // Simulate API call to create story
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const storyData = {
        storyId,
        title: data.title,
        content: data.content,
        genre: data.genre,
        coverPicture: coverImage ? await convertFileToBytes(coverImage) : null,
        coverPictureUrl: data.coverPictureUrl || '',
        coverPictureType: coverImage?.type || '',
        createdAt: new Date().toISOString(),
        isActive: data.isActive,
        classId: data.classId,
        createdBy: user?.id
      };
      
      console.log('Creating story:', storyData);

      toast({
        title: "Story Created Successfully!",
        description: `"${data.title}" has been created and is ready for students.`,
      });

      // Reset form and close dialog
      form.reset();
      setCoverImage(null);
      setCoverImagePreview('');
      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create story. Please try again.",
        variant: "destructive",
      });
    }
  };

  const convertFileToBytes = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Card className="border-2 border-dashed border-teal-200 hover:border-teal-400 transition-colors cursor-pointer">
          <CardContent className="p-6 text-center">
            <BookOpen className="h-12 w-12 text-teal-500 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Create New Story</h3>
            <p className="text-sm text-gray-500">Write interactive Filipino stories for your students</p>
          </CardContent>
        </Card>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-teal-600" />
            <span>Create New Story</span>
          </DialogTitle>
          <DialogDescription>
            Create an engaging Filipino story for your students. Add content, cover image, and assign it to a class.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Story Title</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Ang Alamat ng Pinya" 
                      {...field}
                      className="focus:ring-teal-500 focus:border-teal-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="genre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Genre</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="focus:ring-teal-500 focus:border-teal-500">
                        <SelectValue placeholder="Select story genre" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {STORY_GENRES.map(genre => (
                        <SelectItem key={genre.value} value={genre.value}>
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: genre.color }}
                            />
                            <span>{genre.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Story Content</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Write your story here..."
                      className="min-h-[200px] focus:ring-teal-500 focus:border-teal-500"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Write the complete story content that students will read.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Cover Image Upload */}
            <div className="space-y-4">
              <Label>Cover Image</Label>
              {coverImagePreview ? (
                <div className="relative">
                  <img 
                    src={coverImagePreview} 
                    alt="Cover preview" 
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={removeCoverImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Upload a cover image for your story</p>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>

            <FormField
              control={form.control}
              name="coverPictureUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Or provide image URL (optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://example.com/image.jpg"
                      {...field}
                      className="focus:ring-teal-500 focus:border-teal-500"
                    />
                  </FormControl>
                  <FormDescription>
                    Alternative to uploading: provide a direct URL to an image.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="classId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assign to Class</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="focus:ring-teal-500 focus:border-teal-500">
                        <SelectValue placeholder="Select a class" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {user?.classes?.map((classId) => (
                        <SelectItem key={classId} value={classId}>
                          Grade {classId.charAt(0)} - {classId.split('-')[1]?.charAt(0)?.toUpperCase() + classId.split('-')[1]?.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
              >
                Create Story
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateStoryForm;
