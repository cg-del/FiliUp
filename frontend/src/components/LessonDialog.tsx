import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Trash2, GripVertical } from 'lucide-react';
import { adminAPI } from '@/lib/api';
import { RichTextEditor } from '@/components/ui/rich-text-editor';

interface Phase {
  id: string;
  title: string;
  description: string;
  orderIndex: number;
}

interface Lesson {
  id?: string;
  phaseId: string;
  title: string;
  description: string;
  orderIndex: number;
}

interface LessonSlide {
  id?: string;
  title: string;
  content: string[];
  orderIndex: number;
}

interface LessonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lesson?: Lesson | null;
  phases: Phase[];
  onSave: (lesson: Omit<Lesson, 'id'>, slides: Omit<LessonSlide, 'id'>[]) => Promise<void>;
}

export const LessonDialog: React.FC<LessonDialogProps> = ({
  open,
  onOpenChange,
  lesson,
  phases,
  onSave
}) => {
  const [formData, setFormData] = useState<Omit<Lesson, 'id'>>({
    phaseId: '',
    title: '',
    description: '',
    orderIndex: 1
  });
  
  const [slides, setSlides] = useState<Omit<LessonSlide, 'id'>[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeStep, setActiveStep] = useState<'lesson' | 'slides'>('lesson');

  const isEditing = !!lesson;

  useEffect(() => {
    if (!open) {
      // Clear all state when dialog closes
      setFormData({
        phaseId: '',
        title: '',
        description: '',
        orderIndex: 1
      });
      setSlides([]);
      setErrors({});
      setActiveStep('lesson');
      return;
    }

    let mounted = true;
    const loadingRef = { current: false };

    const init = async () => {
      // Prevent multiple concurrent loads
      if (loadingRef.current) return;
      loadingRef.current = true;

      try {
        // Always reset state first to prevent duplication
        if (mounted) {
          setSlides([]);
          setErrors({});
          setActiveStep('lesson');
        }

        if (lesson?.id) {
          // Prefill with existing lesson data
          const nextForm = {
            phaseId: lesson.phaseId,
            title: lesson.title,
            description: lesson.description,
            orderIndex: lesson.orderIndex,
          };
          if (mounted) setFormData(nextForm);

          // Load existing slides for this lesson (admin endpoint)
          try {
            const detailed = await adminAPI.getLesson(lesson.id);
            
            if (!mounted) return;

            // Clear existing slides first, then populate new slides
            setSlides([]);
            
            const fetchedSlides = (detailed?.slides || []).map((s: { title: string; content: string[]; orderIndex: number }) => ({
              title: s.title,
              content: s.content || [],
              orderIndex: s.orderIndex,
            }));
            
            if (mounted) setSlides(fetchedSlides);
          } catch (e) {
            console.error('Failed to load slides for lesson (admin):', e);
            // Keep the basic lesson data but clear slides on error
            if (mounted) setSlides([]);
          }
        } else {
          // New lesson defaults
          if (mounted) {
            setFormData({
              phaseId: phases[0]?.id || '',
              title: '',
              description: '',
              orderIndex: 1,
            });
          }
        }
      } finally {
        loadingRef.current = false;
      }
    };

    init();

    return () => {
      mounted = false;
      loadingRef.current = false;
    };
  }, [open, lesson?.id]);

  const validateLessonForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.phaseId) {
      newErrors.phaseId = 'Phase is required';
    }

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.orderIndex < 1) {
      newErrors.orderIndex = 'Order index must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSlidesForm = () => {
    if (slides.length === 0) {
      setErrors({ slides: 'At least one slide is required' });
      return false;
    }

    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      if (!slide.title.trim()) {
        setErrors({ slides: `Slide ${i + 1} title is required` });
        return false;
      }
      if (slide.content.length === 0 || slide.content.every(c => !c.trim())) {
        setErrors({ slides: `Slide ${i + 1} must have content` });
        return false;
      }
    }

    setErrors({});
    return true;
  };

  const handleNext = () => {
    if (validateLessonForm()) {
      setActiveStep('slides');
    }
  };

  const handleSubmit = async () => {
    if (!validateLessonForm() || !validateSlidesForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSave(formData, slides);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save lesson:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const addSlide = () => {
    const newSlide: Omit<LessonSlide, 'id'> = {
      title: '',
      content: [''],
      orderIndex: slides.length + 1
    };
    setSlides(prev => [...prev, newSlide]);
  };

  const updateSlide = (index: number, field: keyof LessonSlide, value: string | string[] | number) => {
    setSlides(prev => prev.map((slide, i) => 
      i === index ? { ...slide, [field]: value } : slide
    ));
  };

  const removeSlide = (index: number) => {
    setSlides(prev => prev.filter((_, i) => i !== index));
  };

  const addContentLine = (slideIndex: number) => {
    setSlides(prev => prev.map((slide, i) => 
      i === slideIndex 
        ? { ...slide, content: [...slide.content, ''] }
        : slide
    ));
  };

  const updateContentLine = (slideIndex: number, lineIndex: number, value: string) => {
    setSlides(prev => prev.map((slide, i) => 
      i === slideIndex 
        ? { 
            ...slide, 
            content: slide.content.map((line, j) => j === lineIndex ? value : line)
          }
        : slide
    ));
  };

  const removeContentLine = (slideIndex: number, lineIndex: number) => {
    setSlides(prev => prev.map((slide, i) => 
      i === slideIndex 
        ? { 
            ...slide, 
            content: slide.content.filter((_, j) => j !== lineIndex)
          }
        : slide
    ));
  };

  const selectedPhase = phases.find(p => p.id === formData.phaseId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Lesson' : 'Create New Lesson'}
          </DialogTitle>
          <DialogDescription>
            {activeStep === 'lesson' 
              ? 'Set up the basic lesson information.'
              : 'Create slides with content for your lesson.'
            }
          </DialogDescription>
        </DialogHeader>

        {activeStep === 'lesson' ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phaseId">Phase</Label>
              <select
                id="phaseId"
                className="w-full px-3 py-2 border rounded-md bg-background"
                value={formData.phaseId}
                onChange={(e) => handleInputChange('phaseId', e.target.value)}
              >
                <option value="">Select a phase</option>
                {phases.map(phase => (
                  <option key={phase.id} value={phase.id}>
                    {phase.title}
                  </option>
                ))}
              </select>
              {errors.phaseId && (
                <p className="text-sm text-red-500">{errors.phaseId}</p>
              )}
            </div>

            {selectedPhase && (
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Phase:</strong> {selectedPhase.title}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedPhase.description}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Lesson Title</Label>
              <Input
                id="title"
                placeholder="e.g., Pangngalan (Nouns)"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <RichTextEditor
                value={formData.description}
                onChange={(value) => handleInputChange('description', value)}
                placeholder="Describe what students will learn in this lesson..."
                error={errors.description}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="orderIndex">Order Index</Label>
              <Input
                id="orderIndex"
                type="number"
                min="1"
                placeholder="1"
                value={formData.orderIndex}
                onChange={(e) => handleInputChange('orderIndex', parseInt(e.target.value) || 1)}
                className={errors.orderIndex ? 'border-red-500' : ''}
              />
              {errors.orderIndex && (
                <p className="text-sm text-red-500">{errors.orderIndex}</p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Lesson Slides</h3>
              <Button onClick={addSlide} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Slide
              </Button>
            </div>

            {errors.slides && (
              <p className="text-sm text-red-500">{errors.slides}</p>
            )}

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {slides.map((slide, slideIndex) => (
                <Card key={slideIndex} className="border-2">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        <Badge variant="outline">Slide {slideIndex + 1}</Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSlide(slideIndex)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label>Slide Title</Label>
                      <Input
                        placeholder="Enter slide title..."
                        value={slide.title}
                        onChange={(e) => updateSlide(slideIndex, 'title', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Content Lines</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => addContentLine(slideIndex)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Line
                        </Button>
                      </div>
                      
                      <div className="space-y-3">
                        {slide.content.map((line, lineIndex) => (
                          <div key={lineIndex} className="space-y-1">
                            <div className="flex items-center justify-between">
                              <Label className="text-sm font-medium">Content Line {lineIndex + 1}</Label>
                              {slide.content.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeContentLine(slideIndex, lineIndex)}
                                  className="text-destructive h-6 w-6 p-0"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                            <RichTextEditor
                              value={line}
                              onChange={(value) => updateContentLine(slideIndex, lineIndex, value)}
                              placeholder={`Enter content for line ${lineIndex + 1}...`}
                              rows={3}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {slides.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No slides created yet.</p>
                <Button onClick={addSlide} variant="outline" className="mt-2">
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Slide
                </Button>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (activeStep === 'slides') {
                setActiveStep('lesson');
              } else {
                onOpenChange(false);
              }
            }}
            disabled={loading}
          >
            {activeStep === 'slides' ? 'Back' : 'Cancel'}
          </Button>
          
          {activeStep === 'lesson' ? (
            <Button
              onClick={handleNext}
              className="bg-gradient-primary"
            >
              Next: Create Slides
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-gradient-primary"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Update Lesson' : 'Create Lesson'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
