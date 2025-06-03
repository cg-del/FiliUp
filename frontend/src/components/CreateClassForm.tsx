import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { classService } from '@/lib/services/classService';

const formSchema = z.object({
  className: z.string().min(1, 'Class name is required').max(100, 'Class name must be less than 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description must be less than 1000 characters'),
});

interface CreateClassFormData {
  className: string;
  description: string;
}

const CreateClassForm = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const form = useForm<CreateClassFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      className: '',
      description: ''
    }
  });

  const onSubmit = async (data: CreateClassFormData) => {
    try {
      // Call the actual API to create class with the exact payload structure
      const classData = {
        className: data.className.trim(),
        description: data.description.trim()
      };
      
      const response = await classService.createClass(classData);
      
      if (response.data) {
        toast({
          title: "Class Created Successfully!",
          description: `Class "${response.data.className}" has been created with code: ${response.data.classCode}`,
        });

        // Reset form and close dialog
        form.reset();
        setIsOpen(false);
        
        // Optionally refresh the page or emit an event to update the class list
        window.location.reload();
      }
    } catch (error) {
      console.error('Error creating class:', error);
      toast({
        title: "Error",
        description: "Failed to create class. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Card className="border-2 border-dashed border-teal-200 hover:border-teal-400 transition-colors cursor-pointer">
          <CardContent className="p-6 text-center">
            <Plus className="h-12 w-12 text-teal-500 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Create New Class</h3>
            <p className="text-sm text-gray-500">Set up a new class for your students</p>
          </CardContent>
        </Card>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-teal-600" />
            <span>Create New Class</span>
          </DialogTitle>
          <DialogDescription>
            Fill in the details to create a new class. Students will use the generated class code to enroll.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="className"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Class Name *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Rizal, English Literature, Filipino History" 
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Provide a detailed description of the class, including objectives, topics covered, and what students will learn..."
                      {...field}
                      className="focus:ring-teal-500 focus:border-teal-500 min-h-[100px]"
                      rows={4}
                    />
                  </FormControl>
                  <FormDescription>
                    Describe the class content, objectives, and what students will learn.
                  </FormDescription>
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
                Create Class
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateClassForm;
