import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Plus, Globe, Upload, X, Loader2, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { STORY_GENRES } from '@/constants/storyGenres';
import { commonStoryService, type CreateCommonStoryRequest } from '@/lib/services/commonStoryService';
import { useErrorHandler } from '@/hooks/useErrorHandler';

interface CreateCommonStoryFormData {
  title: string;
  content: string;
  genre: string;
  fictionType: string;
}

interface CreateCommonStoryProps {
  onSuccess?: () => void;
}

interface SavedFormData extends CreateCommonStoryFormData {
  coverImagePreview?: string;
}

const STORAGE_KEY = 'filiup_create_common_story_draft';

const CreateCommonStoryForm = ({ onSuccess }: CreateCommonStoryProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { safeExecute } = useErrorHandler();
  
  const form = useForm<CreateCommonStoryFormData>({
    defaultValues: {
      title: '',
      content: '',
      genre: '',
      fictionType: 'Alamat'
    }
  });

  // Save form data to localStorage
  const saveFormData = async (data: SavedFormData) => {
    await safeExecute(
      () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return Promise.resolve();
      },
      {
        showToast: false, // Don't show toast for localStorage errors
        onError: (error) => {
          console.error('Failed to save form data to localStorage:', error);
        }
      }
    );
  };

  // Load form data from localStorage
  const loadFormData = async (): Promise<SavedFormData | null> => {
    const { data } = await safeExecute(
      () => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return Promise.resolve(saved ? JSON.parse(saved) : null);
      },
      {
        showToast: false, // Don't show toast for localStorage errors
        onError: (error) => {
          console.error('Failed to load form data from localStorage:', error);
        }
      }
    );
    return data;
  };

  // Clear form data from localStorage
  const clearFormData = async () => {
    await safeExecute(
      () => {
        localStorage.removeItem(STORAGE_KEY);
        return Promise.resolve();
      },
      {
        showToast: false, // Don't show toast for localStorage errors
        onError: (error) => {
          console.error('Failed to clear form data from localStorage:', error);
        }
      }
    );
  };

  // Load saved form data when dialog opens
  useEffect(() => {
    if (isOpen) {
      const loadSavedData = async () => {
        const savedData = await loadFormData();
        if (savedData) {
          // Restore form values
          form.setValue('title', savedData.title);
          form.setValue('content', savedData.content);
          form.setValue('genre', savedData.genre);
          form.setValue('fictionType', savedData.fictionType);
          
          // Restore cover image preview
          if (savedData.coverImagePreview) {
            setCoverImagePreview(savedData.coverImagePreview);
          }

          toast({
            title: "Naibalik ang Draft",
            description: "Naibalik ang inyong dating gawa.",
          });
        }
      };

      loadSavedData();
    }
  }, [isOpen, form, toast]);

  // Watch form changes and save to localStorage
  useEffect(() => {
    if (!isOpen) return;

    const subscription = form.watch((value) => {
      const formData: SavedFormData = {
        title: value.title || '',
        content: value.content || '',
        genre: value.genre || '',
        fictionType: value.fictionType || 'Alamat',
        coverImagePreview: coverImagePreview
      };
      
      // Only save if there's actual content to prevent unnecessary storage
      if (formData.title || formData.content || formData.genre || coverImagePreview) {
        // Save asynchronously without blocking the UI
        saveFormData(formData).catch(console.error);
      }
    });

    return () => subscription.unsubscribe();
  }, [form, isOpen, coverImagePreview]);

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
        const preview = e.target?.result as string;
        setCoverImagePreview(preview);
        
        // Save the preview to localStorage
        const currentFormData = form.getValues();
        saveFormData({
          ...currentFormData,
          coverImagePreview: preview
        }).catch(console.error);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeCoverImage = () => {
    setCoverImage(null);
    setCoverImagePreview('');
    
    // Update localStorage without cover image
    const currentFormData = form.getValues();
    saveFormData({
      ...currentFormData,
      coverImagePreview: undefined
    }).catch(console.error);
  };

  const resetForm = async () => {
    form.reset();
    setCoverImage(null);
    setCoverImagePreview('');
    await clearFormData();
  };

  const onSubmit = async (data: CreateCommonStoryFormData) => {
    setIsCreating(true);
    let coverPictureUrl = '';
    let coverPictureType = '';

    try {
      // Step 1: Validate form data before proceeding
      if (!data.title?.trim()) {
        toast({
          title: "Validation Error",
          description: "Kailangan ng pamagat ng kuwento.",
          variant: "destructive"
        });
        setIsCreating(false);
        return;
      }

      if (!data.content?.trim()) {
        toast({
          title: "Validation Error", 
          description: "Kailangan ng nilalaman ng kuwento.",
          variant: "destructive"
        });
        setIsCreating(false);
        return;
      }

      if (!data.genre) {
        toast({
          title: "Validation Error",
          description: "Piliin ang kategorya ng kuwento.",
          variant: "destructive"
        });
        setIsCreating(false);
        return;
      }

      // Step 2: Upload cover image if provided
      if (coverImage) {
        setIsUploading(true);
        console.log('Uploading cover image...');
        
        const { data: uploadResult, error: uploadError } = await safeExecute(
          () => commonStoryService.uploadCoverImage(coverImage),
          {
            customMessage: "Hindi nai-upload ang larawan sa pabalat. Subukang muli.",
          }
        );

        if (uploadError) {
          console.error('Cover image upload failed:', uploadError);
          setIsUploading(false);
          setIsCreating(false);
          return;
        }

        if (uploadResult) {
          coverPictureUrl = uploadResult.url;
          coverPictureType = coverImage.type;
          console.log('Cover image uploaded successfully:', coverPictureUrl);
          toast({
            title: "Na-upload ang Larawan",
            description: "Matagumpay na na-upload ang larawan sa pabalat.",
          });
        }
        setIsUploading(false);
      }

      // Step 3: Create the common story
      const storyData: CreateCommonStoryRequest = {
        title: data.title.trim(),
        content: data.content.trim(),
        genre: data.genre,
        fictionType: data.fictionType,
        coverPictureUrl
      };
      
      console.log('Creating common story with data:', {
        ...storyData,
        content: `${storyData.content.substring(0, 100)}...` // Log only first 100 chars
      });

      const { data: createResult, error: createError } = await safeExecute(
        () => commonStoryService.createCommonStory(storyData),
        {
          customMessage: "Hindi nagawa ang kuwento. Subukang muli.",
          onError: (error) => {
            console.error('Common story creation failed:', error);
            
            // Parse server error response for better user feedback
            if (error?.response?.data) {
              const errorData = error.response.data;
              
              if (errorData.status === 401) {
                toast({
                  title: "Authentication Required",
                  description: "Kailangan mo munang mag-login ulit.",
                  variant: "destructive"
                });
              } else if (errorData.status === 403) {
                toast({
                  title: "Access Denied",
                  description: errorData.message || "Walang pahintulot na gumawa ng common story.",
                  variant: "destructive"
                });
              } else if (errorData.status === 400) {
                toast({
                  title: "Validation Error",
                  description: errorData.message || "May mali sa mga datos na ipinasok.",
                  variant: "destructive"
                });
              } else if (errorData.status === 409) {
                toast({
                  title: "Conflict",
                  description: errorData.message || "May kuwentong may katulad na pamagat na.",
                  variant: "destructive"
                });
              } else if (errorData.status >= 500) {
                toast({
                  title: "Server Error",
                  description: "May problema sa server. Subukang muli mamaya.",
                  variant: "destructive"
                });
              }
            }
          }
        }
      );

      if (createError) {
        setIsCreating(false);
        return;
      }

      if (createResult) {
        console.log('Common story created successfully:', createResult);
        toast({
          title: "Matagumpay na Nagawa ang Common Story!",
          description: `Nagawa na ang "${data.title}" at makikita na ng lahat ng users.`,
        });

        // Clear form and localStorage after successful creation
        await resetForm();
        setIsOpen(false);
        
        // Call success callback if provided
        if (onSuccess) {
          onSuccess();
        }
      }

    } catch (error) {
      console.error('Unexpected error during common story creation:', error);
      toast({
        title: "Unexpected Error",
        description: "May hindi inaasahang error na naganap. Subukang muli.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
      setIsUploading(false);
    }
  };

  const handleDialogClose = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Don't clear form data when closing - let it persist for next time
      // User can manually clear if needed
    }
  };

  const handleCancel = () => {
    const formData = form.getValues();
    const hasContent = formData.title || formData.content || formData.genre || coverImagePreview;
    
    if (hasContent) {
      // Keep the draft for later
      toast({
        title: "Nai-save ang Draft",
        description: "Nai-save ang inyong gawa bilang draft.",
      });
    }
    
    setIsOpen(false);
  };

  const isSubmitting = isUploading || isCreating;

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogTrigger asChild>
        <Card className="border-2 border-dashed border-teal-200 hover:border-teal-400 transition-colors cursor-pointer">
          <CardContent className="p-6 text-center">
            <Globe className="h-12 w-12 text-teal-500 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Gumawa ng Bagong Common Story</h3>
            <p className="text-sm text-gray-500">Sumulat ng public na kuwentong Filipino na makikita ng lahat ng users</p>
          </CardContent>
        </Card>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[1200px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Globe className="h-5 w-5 text-teal-600" />
            <span>Gumawa ng Bagong Common Story</span>
          </DialogTitle>
          <DialogDescription>
            Gumawa ng public na kuwentong Filipino na makikita at mababasa ng lahat ng users sa platform.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - All fields except Story Content */}
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pamagat ng Kuwento</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="hal. Ang Alamat ng Pinya" 
                          {...field}
                          className="focus:ring-teal-500 focus:border-teal-500"
                          disabled={isSubmitting}
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
                      <FormLabel>Uri/Kategorya</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                        <FormControl>
                          <SelectTrigger className="focus:ring-teal-500 focus:border-teal-500">
                            <SelectValue placeholder="Piliin ang uri ng kuwento" />
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
                  name="fictionType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Uri ng Kathang-Isip</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                        <FormControl>
                          <SelectTrigger className="focus:ring-teal-500 focus:border-teal-500">
                            <SelectValue placeholder="Piliin ang uri ng kathang-isip" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Alamat">Alamat</SelectItem>
                          <SelectItem value="Pabula">Pabula</SelectItem>
                          <SelectItem value="Kuwentong Bayan">Kuwentong Bayan</SelectItem>
                          <SelectItem value="Mitolohiya">Mitolohiya</SelectItem>
                          <SelectItem value="Maikling Kuwento">Maikling Kuwento</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Cover Image Upload */}
                <div className="space-y-4">
                  <Label>Larawan sa Pabalat</Label>
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
                        disabled={isSubmitting}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">Mag-upload ng larawan para sa inyong kuwento</p>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="cursor-pointer"
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-gray-500">
                    Suportadong format: JPG, PNG, GIF. Maximum na laki: 5MB
                  </p>
                </div>
              </div>

              {/* Right Column - Story Content */}
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nilalaman ng Kuwento</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Isulat ang inyong kuwento dito..."
                          className="min-h-[500px] focus:ring-teal-500 focus:border-teal-500"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormDescription>
                        Isulat ang kumpletong nilalaman ng public story na babasahin ng lahat ng users.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
                disabled={isSubmitting}
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isUploading ? 'Ina-upload ang Larawan...' : isCreating ? 'Ginagawa ang Common Story...' : 'Gumawa ng Common Story'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCommonStoryForm; 