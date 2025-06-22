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
            <h3 className="font-semibold text-gray-900 mb-2">Gumawa ng Bagong Klase</h3>
            <p className="text-sm text-gray-500">Mag-set up ng bagong klase para sa inyong mga estudyante</p>
          </CardContent>
        </Card>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-teal-600" />
            <span>Gumawa ng Bagong Klase</span>
          </DialogTitle>
          <DialogDescription>
            Punan ang mga detalye upang gumawa ng bagong klase. Gagamitin ng mga estudyante ang nabuo na class code upang makasali.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="className"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pangalan ng Klase *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="hal. Rizal, Panitikang Ingles, Kasaysayan ng Pilipinas" 
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
                  <FormLabel>Paglalarawan  *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Magbigay ng detalyadong deskripsyon ng klase, kabilang ang mga layunin, paksang tatalakayin, at matututuhan ng mga estudyante..."
                      {...field}
                      className="focus:ring-teal-500 focus:border-teal-500 min-h-[100px]"
                      rows={4}
                    />
                  </FormControl>
                  <FormDescription>
                    Ilarawan ang mga nilalaman, layunin, at matututuhan ng mga estudyante sa klase.
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
                Kanselahin
              </Button>
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
              >
                Gumawa ng Klase
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateClassForm;
