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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Plus, Trash2, GripVertical, CheckCircle } from 'lucide-react';
import { adminAPI } from '@/lib/api';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface Lesson {
  id: string;
  title: string;
  phaseId: string;
}

interface Activity {
  id?: string;
  lessonId: string;
  activityType: 'MULTIPLE_CHOICE' | 'DRAG_DROP' | 'MATCHING_PAIRS' | 'STORY_COMPREHENSION';
  title: string;
  instructions: string;
  orderIndex: number;
  passingPercentage: number;
  storyText?: string;
}

interface Question {
  id?: string;
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  orderIndex: number;
}

interface DragDropCategory {
  id?: string;
  categoryId: string;
  name: string;
  colorClass: string;
  orderIndex: number;
}

interface DragDropItem {
  id?: string;
  text: string;
  correctCategory: string;
  orderIndex: number;
}

interface MatchingPair {
  id?: string;
  leftText: string;
  rightText: string;
  orderIndex: number;
}

interface ActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activity?: Activity | null;
  lessons: Lesson[];
  onSave: (activity: Omit<Activity, 'id'>, activityData: { questions?: Question[]; categories?: DragDropCategory[]; items?: DragDropItem[]; pairs?: MatchingPair[] }) => Promise<void>;
}

export const ActivityDialog: React.FC<ActivityDialogProps> = ({
  open,
  onOpenChange,
  activity,
  lessons,
  onSave
}) => {
  const [formData, setFormData] = useState<Omit<Activity, 'id'>>({
    lessonId: '',
    activityType: 'MULTIPLE_CHOICE',
    title: '',
    instructions: '',
    orderIndex: 1,
    passingPercentage: 75,
    storyText: ''
  });

  const [questions, setQuestions] = useState<Omit<Question, 'id'>[]>([]);
  const [dragDropCategories, setDragDropCategories] = useState<Omit<DragDropCategory, 'id'>[]>([]);
  const [dragDropItems, setDragDropItems] = useState<Omit<DragDropItem, 'id'>[]>([]);
  const [matchingPairs, setMatchingPairs] = useState<Omit<MatchingPair, 'id'>[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeStep, setActiveStep] = useState<'activity' | 'content'>('activity');

  const isEditing = !!activity;

  useEffect(() => {
    if (!open) {
      // Clear all state when dialog closes
      setFormData({
        lessonId: '',
        activityType: 'MULTIPLE_CHOICE',
        title: '',
        instructions: '',
        orderIndex: 1,
        passingPercentage: 75,
        storyText: ''
      });
      resetActivityData();
      setErrors({});
      setActiveStep('activity');
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
          resetActivityData();
          setErrors({});
          setActiveStep('activity');
        }

        if (activity?.id) {
          // Prefill core fields from the provided activity
          const base = {
            lessonId: activity.lessonId,
            activityType: activity.activityType,
            title: activity.title,
            instructions: activity.instructions,
            orderIndex: activity.orderIndex,
            passingPercentage: activity.passingPercentage,
            storyText: activity.storyText || '',
          } as Omit<Activity, 'id'>;
          if (mounted) setFormData(base);

          // Load detailed content via admin endpoint
          try {
            const detailed = await adminAPI.getActivity(activity.id);

            if (!mounted) return;

            // Update core fields from backend detail
            setFormData(prev => ({
              ...prev,
              title: detailed.title ?? prev.title,
              instructions: detailed.instructions ?? prev.instructions,
              orderIndex: detailed.orderIndex ?? prev.orderIndex,
              passingPercentage: detailed.passingPercentage ?? prev.passingPercentage,
              storyText: detailed.storyText ?? prev.storyText,
              activityType: detailed.activityType ?? prev.activityType,
              lessonId: detailed.lessonId ?? prev.lessonId,
            }));

            // Clear existing content first, then populate new content
            resetActivityData();
            
            const type = (detailed.activityType || activity.activityType) as Activity['activityType'];
            if (type === 'MULTIPLE_CHOICE' || type === 'STORY_COMPREHENSION') {
              const qs: Omit<Question, 'id'>[] = (detailed.questions || detailed.content?.questions || []).map(
                (q: { questionText: string; options: string[]; correctAnswerIndex: number; explanation: string; orderIndex: number }) => ({
                  questionText: q.questionText,
                  options: q.options || [],
                  correctAnswerIndex: q.correctAnswerIndex,
                  explanation: q.explanation || '',
                  orderIndex: q.orderIndex,
                })
              );
              if (mounted) setQuestions(qs);
            } else if (type === 'DRAG_DROP') {
              const cats: Omit<DragDropCategory, 'id'>[] = (detailed.categories || detailed.content?.categories || []).map(
                (c: { categoryId: string; name: string; colorClass: string; orderIndex: number }) => ({
                  categoryId: c.categoryId,
                  name: c.name,
                  colorClass: c.colorClass,
                  orderIndex: c.orderIndex,
                })
              );
              const items: Omit<DragDropItem, 'id'>[] = (detailed.items || detailed.content?.items || []).map(
                (it: { text: string; correctCategory: string; orderIndex: number }) => ({
                  text: it.text,
                  correctCategory: it.correctCategory,
                  orderIndex: it.orderIndex,
                })
              );
              if (mounted) {
                setDragDropCategories(cats);
                setDragDropItems(items);
              }
            } else if (type === 'MATCHING_PAIRS') {
              const pairs: Omit<MatchingPair, 'id'>[] = (detailed.pairs || detailed.content?.pairs || []).map(
                (p: { leftText: string; rightText: string; orderIndex: number }) => ({
                  leftText: p.leftText,
                  rightText: p.rightText,
                  orderIndex: p.orderIndex,
                })
              );
              if (mounted) setMatchingPairs(pairs);
            }
          } catch (e) {
            console.error('Failed to load activity (admin):', e);
            // Keep the basic activity data but clear content on error
            if (mounted) resetActivityData();
          }
        } else {
          // New activity defaults
          if (mounted) {
            setFormData({
              lessonId: lessons[0]?.id || '',
              activityType: 'MULTIPLE_CHOICE',
              title: '',
              instructions: '',
              orderIndex: 1,
              passingPercentage: 75,
              storyText: '',
            });
          }
        }
      } finally {
        loadingRef.current = false;
      }
    };

    void init();
    return () => { 
      mounted = false; 
      loadingRef.current = false;
    };
  }, [open, activity?.id]);

  const resetActivityData = () => {
    setQuestions([]);
    setDragDropCategories([]);
    setDragDropItems([]);
    setMatchingPairs([]);
  };

  const validateActivityForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.lessonId) {
      newErrors.lessonId = 'Lesson is required';
    }

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.instructions.trim()) {
      newErrors.instructions = 'Instructions are required';
    }

    if (formData.orderIndex < 1) {
      newErrors.orderIndex = 'Order index must be at least 1';
    }

    if (formData.passingPercentage < 1 || formData.passingPercentage > 100) {
      newErrors.passingPercentage = 'Passing percentage must be between 1 and 100';
    }

    if (formData.activityType === 'STORY_COMPREHENSION' && !formData.storyText?.trim()) {
      newErrors.storyText = 'Story text is required for story comprehension activities';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateContentForm = () => {
    switch (formData.activityType) {
      case 'MULTIPLE_CHOICE':
      case 'STORY_COMPREHENSION':
        if (questions.length === 0) {
          setErrors({ content: 'At least one question is required' });
          return false;
        }
        for (let i = 0; i < questions.length; i++) {
          const q = questions[i];
          if (!q.questionText.trim()) {
            setErrors({ content: `Question ${i + 1} text is required` });
            return false;
          }
          if (q.options.length < 2 || q.options.some(opt => !opt.trim())) {
            setErrors({ content: `Question ${i + 1} must have at least 2 valid options` });
            return false;
          }
          if (q.correctAnswerIndex < 0 || q.correctAnswerIndex >= q.options.length) {
            setErrors({ content: `Question ${i + 1} must have a valid correct answer selected` });
            return false;
          }
        }
        break;
      
      case 'DRAG_DROP':
        if (dragDropCategories.length === 0) {
          setErrors({ content: 'At least one category is required' });
          return false;
        }
        if (dragDropItems.length === 0) {
          setErrors({ content: 'At least one item is required' });
          return false;
        }
        // Validate each item's text and selected category
        for (let i = 0; i < dragDropItems.length; i++) {
          const it = dragDropItems[i];
          if (!it.text.trim()) {
            setErrors({ content: `Item ${i + 1} must have text` });
            return false;
          }
          if (!it.correctCategory || !dragDropCategories.some(c => c.categoryId === it.correctCategory)) {
            setErrors({ content: `Item ${i + 1} must select a valid category` });
            return false;
          }
        }
        break;
      
      case 'MATCHING_PAIRS':
        if (matchingPairs.length === 0) {
          setErrors({ content: 'At least one matching pair is required' });
          return false;
        }
        for (let i = 0; i < matchingPairs.length; i++) {
          const pair = matchingPairs[i];
          if (!pair.leftText.trim() || !pair.rightText.trim()) {
            setErrors({ content: `Pair ${i + 1} must have both left and right text` });
            return false;
          }
        }
        break;
    }

    setErrors({});
    return true;
  };

  const handleNext = () => {
    if (validateActivityForm()) {
      setActiveStep('content');
    }
  };

  const handleSubmit = async () => {
    if (!validateActivityForm() || !validateContentForm()) {
      return;
    }

    setLoading(true);
    try {
      let activityData;
      switch (formData.activityType) {
        case 'MULTIPLE_CHOICE':
        case 'STORY_COMPREHENSION':
          activityData = { questions };
          break;
        case 'DRAG_DROP':
          activityData = { categories: dragDropCategories, items: dragDropItems };
          break;
        case 'MATCHING_PAIRS':
          activityData = { pairs: matchingPairs };
          break;
      }

      await onSave(formData, activityData);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save activity:', error);
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

  // Question management functions
  const addQuestion = () => {
    const newQuestion: Omit<Question, 'id'> = {
      questionText: '',
      options: ['', ''],
      correctAnswerIndex: 0,
      explanation: '',
      orderIndex: questions.length + 1
    };
    setQuestions(prev => [...prev, newQuestion]);
  };

  const updateQuestion = (index: number, field: keyof Question, value: string | string[] | number) => {
    setQuestions(prev => prev.map((q, i) => 
      i === index ? { ...q, [field]: value } : q
    ));
  };

  const removeQuestion = (index: number) => {
    setQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const addOption = (questionIndex: number) => {
    setQuestions(prev => prev.map((q, i) => 
      i === questionIndex 
        ? { ...q, options: [...q.options, ''] }
        : q
    ));
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    setQuestions(prev => prev.map((q, i) => 
      i === questionIndex 
        ? { 
            ...q, 
            options: q.options.map((opt, j) => j === optionIndex ? value : opt)
          }
        : q
    ));
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    setQuestions(prev => prev.map((q, i) => 
      i === questionIndex 
        ? { 
            ...q, 
            options: q.options.filter((_, j) => j !== optionIndex),
            correctAnswerIndex: q.correctAnswerIndex >= optionIndex && q.correctAnswerIndex > 0 
              ? q.correctAnswerIndex - 1 
              : q.correctAnswerIndex
          }
        : q
    ));
  };

  // Drag & Drop management functions
  const addCategory = () => {
    const idx = dragDropCategories.length + 1;
    const newCat: Omit<DragDropCategory, 'id'> = {
      categoryId: `cat_${Date.now()}_${idx}`,
      name: '',
      colorClass: 'bg-blue-100',
      orderIndex: idx,
    };
    setDragDropCategories(prev => [...prev, newCat]);
  };

  const updateCategory = (index: number, field: keyof DragDropCategory, value: string | number) => {
    setDragDropCategories(prev => prev.map((c, i): Omit<DragDropCategory, 'id'> => (
      i === index ? { ...c, [field]: value } as Omit<DragDropCategory, 'id'> : c
    )));
  };

  const removeCategory = (index: number) => {
    const removed = dragDropCategories[index];
    setDragDropCategories(prev => prev.filter((_, i) => i !== index));
    // Clear items that referenced the removed category
    setDragDropItems(prev => prev.map(it => it.correctCategory === removed.categoryId ? { ...it, correctCategory: '' } : it));
  };

  const addItem = () => {
    const idx = dragDropItems.length + 1;
    const newItem: Omit<DragDropItem, 'id'> = {
      text: '',
      correctCategory: '',
      orderIndex: idx,
    };
    setDragDropItems(prev => [...prev, newItem]);
  };

  const updateItem = (index: number, field: keyof DragDropItem, value: string | number) => {
    setDragDropItems(prev => prev.map((it, i): Omit<DragDropItem, 'id'> => (
      i === index ? { ...it, [field]: value } as Omit<DragDropItem, 'id'> : it
    )));
  };

  const removeItem = (index: number) => {
    setDragDropItems(prev => prev.filter((_, i) => i !== index));
  };

  // Matching Pairs management functions
  const addPair = () => {
    const idx = matchingPairs.length + 1;
    const newPair: Omit<MatchingPair, 'id'> = {
      leftText: '',
      rightText: '',
      orderIndex: idx,
    };
    setMatchingPairs(prev => [...prev, newPair]);
  };

  const updatePair = (index: number, field: keyof MatchingPair, value: string) => {
    setMatchingPairs(prev => prev.map((p, i) => i === index ? { ...p, [field]: value } : p));
  };

  const removePair = (index: number) => {
    setMatchingPairs(prev => prev.filter((_, i) => i !== index));
  };

  const selectedLesson = lessons.find(l => l.id === formData.lessonId);

  const getActivityTypeIcon = (type: string) => {
    switch (type) {
      case 'MULTIPLE_CHOICE': return '📝';
      case 'DRAG_DROP': return '🎯';
      case 'MATCHING_PAIRS': return '🔗';
      case 'STORY_COMPREHENSION': return '📖';
      default: return '📋';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Activity' : 'Create New Activity'}
          </DialogTitle>
          <DialogDescription>
            {activeStep === 'activity' 
              ? 'Set up the basic activity information and type.'
              : 'Create the content for your activity.'
            }
          </DialogDescription>
        </DialogHeader>

        {activeStep === 'activity' ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="lessonId">Lesson</Label>
              <select
                id="lessonId"
                className="w-full px-3 py-2 border rounded-md bg-background"
                value={formData.lessonId}
                onChange={(e) => handleInputChange('lessonId', e.target.value)}
              >
                <option value="">Select a lesson</option>
                {lessons.map(lesson => (
                  <option key={lesson.id} value={lesson.id}>
                    {lesson.title}
                  </option>
                ))}
              </select>
              {errors.lessonId && (
                <p className="text-sm text-red-500">{errors.lessonId}</p>
              )}
            </div>

            {selectedLesson && (
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Lesson:</strong> {selectedLesson.title}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="activityType">Activity Type</Label>
              <select
                id="activityType"
                className="w-full px-3 py-2 border rounded-md bg-background"
                value={formData.activityType}
                onChange={(e) => handleInputChange('activityType', e.target.value)}
              >
                <option value="MULTIPLE_CHOICE">📝 Multiple Choice</option>
                <option value="DRAG_DROP">🎯 Drag & Drop</option>
                <option value="MATCHING_PAIRS">🔗 Matching Pairs</option>
                <option value="STORY_COMPREHENSION">📖 Story Comprehension</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Activity Title</Label>
              <Input
                id="title"
                placeholder={`e.g., ${getActivityTypeIcon(formData.activityType)} ${formData.activityType.replace('_', ' ')} - Topic Name`}
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructions">Instructions</Label>
              <Textarea
                id="instructions"
                placeholder="Provide clear instructions for students..."
                value={formData.instructions}
                onChange={(e) => handleInputChange('instructions', e.target.value)}
                className={errors.instructions ? 'border-red-500' : ''}
                rows={3}
              />
              {errors.instructions && (
                <p className="text-sm text-red-500">{errors.instructions}</p>
              )}
            </div>

            {formData.activityType === 'STORY_COMPREHENSION' && (
              <div className="space-y-2">
                <Label htmlFor="storyText">Story Text</Label>
                <Textarea
                  id="storyText"
                  placeholder="Enter the story text that students will read..."
                  value={formData.storyText}
                  onChange={(e) => handleInputChange('storyText', e.target.value)}
                  className={errors.storyText ? 'border-red-500' : ''}
                  rows={5}
                />
                {errors.storyText && (
                  <p className="text-sm text-red-500">{errors.storyText}</p>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
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

              <div className="space-y-2">
                <Label htmlFor="passingPercentage">Passing Percentage</Label>
                <Input
                  id="passingPercentage"
                  type="number"
                  min="1"
                  max="100"
                  placeholder="75"
                  value={formData.passingPercentage}
                  onChange={(e) => handleInputChange('passingPercentage', parseInt(e.target.value) || 75)}
                  className={errors.passingPercentage ? 'border-red-500' : ''}
                />
                {errors.passingPercentage && (
                  <p className="text-sm text-red-500">{errors.passingPercentage}</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <span>{getActivityTypeIcon(formData.activityType)}</span>
                <span>{formData.activityType.replace('_', ' ')} Content</span>
              </h3>
              {(formData.activityType === 'MULTIPLE_CHOICE' || formData.activityType === 'STORY_COMPREHENSION') && (
                <Button onClick={addQuestion} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
              )}
            </div>

            {errors.content && (
              <p className="text-sm text-red-500">{errors.content}</p>
            )}

            {/* Multiple Choice / Story Comprehension Questions */}
            {(formData.activityType === 'MULTIPLE_CHOICE' || formData.activityType === 'STORY_COMPREHENSION') && (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {questions.map((question, questionIndex) => (
                  <Card key={questionIndex} className="border-2">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                          <Badge variant="outline">Question {questionIndex + 1}</Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeQuestion(questionIndex)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label>Question Text</Label>
                        <Textarea
                          placeholder="Enter your question..."
                          value={question.questionText}
                          onChange={(e) => updateQuestion(questionIndex, 'questionText', e.target.value)}
                          rows={2}
                        />
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label>Answer Options</Label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => addOption(questionIndex)}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add Option
                          </Button>
                        </div>
                        
                        <div className="space-y-2">
                          {question.options.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center space-x-2">
                              <Button
                                type="button"
                                variant={question.correctAnswerIndex === optionIndex ? "default" : "outline"}
                                size="sm"
                                onClick={() => updateQuestion(questionIndex, 'correctAnswerIndex', optionIndex)}
                                className="min-w-[32px]"
                              >
                                {question.correctAnswerIndex === optionIndex ? (
                                  <CheckCircle className="h-3 w-3" />
                                ) : (
                                  String.fromCharCode(65 + optionIndex)
                                )}
                              </Button>
                              <Input
                                placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                                value={option}
                                onChange={(e) => updateOption(questionIndex, optionIndex, e.target.value)}
                              />
                              {question.options.length > 2 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeOption(questionIndex, optionIndex)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label>Explanation</Label>
                        <Textarea
                          placeholder="Explain why this is the correct answer..."
                          value={question.explanation}
                          onChange={(e) => updateQuestion(questionIndex, 'explanation', e.target.value)}
                          rows={2}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {questions.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No questions created yet.</p>
                    <Button onClick={addQuestion} variant="outline" className="mt-2">
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Question
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Drag & Drop content builder */}
            {formData.activityType === 'DRAG_DROP' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Categories</h4>
                  <Button onClick={addCategory} size="sm">
                    <Plus className="h-4 w-4 mr-2" /> Add Category
                  </Button>
                </div>
                <div className="space-y-3 max-h-44 overflow-y-auto">
                  {dragDropCategories.map((cat, idx) => (
                    <Card key={idx}>
                      <CardContent className="pt-4">
                        <div className="grid grid-cols-12 gap-2 items-center">
                          <div className="col-span-5">
                            <Label>Name</Label>
                            <Input
                              placeholder="e.g., Noun"
                              value={cat.name}
                              onChange={(e) => updateCategory(idx, 'name', e.target.value)}
                            />
                          </div>
                          <div className="col-span-5">
                            <Label>Color</Label>
                            <select
                              className="w-full px-3 py-2 border rounded-md bg-background"
                              value={cat.colorClass}
                              onChange={(e) => updateCategory(idx, 'colorClass', e.target.value)}
                            >
                              <option value="bg-blue-100">Blue</option>
                              <option value="bg-green-100">Green</option>
                              <option value="bg-yellow-100">Yellow</option>
                              <option value="bg-red-100">Red</option>
                              <option value="bg-purple-100">Purple</option>
                            </select>
                          </div>
                          <div className="col-span-2 flex justify-end">
                            <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => removeCategory(idx)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {dragDropCategories.length === 0 && (
                    <div className="text-sm text-muted-foreground">No categories yet. Add at least one.</div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <h4 className="font-semibold">Items</h4>
                  <Button onClick={addItem} size="sm">
                    <Plus className="h-4 w-4 mr-2" /> Add Item
                  </Button>
                </div>
                <div className="space-y-3 max-h-52 overflow-y-auto">
                  {dragDropItems.map((it, idx) => (
                    <Card key={idx}>
                      <CardContent className="pt-4">
                        <div className="grid grid-cols-12 gap-2 items-center">
                          <div className="col-span-6">
                            <Label>Item Text</Label>
                            <Input
                              placeholder="e.g., Bahay"
                              value={it.text}
                              onChange={(e) => updateItem(idx, 'text', e.target.value)}
                            />
                          </div>
                          <div className="col-span-5">
                            <Label>Correct Category</Label>
                            <select
                              className="w-full px-3 py-2 border rounded-md bg-background"
                              value={it.correctCategory}
                              onChange={(e) => updateItem(idx, 'correctCategory', e.target.value)}
                            >
                              <option value="">Select category</option>
                              {dragDropCategories.map((cat, cIdx) => (
                                <option key={cIdx} value={cat.categoryId}>{cat.name || `Category ${cIdx + 1}`}</option>
                              ))}
                            </select>
                          </div>
                          <div className="col-span-1 flex justify-end">
                            <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => removeItem(idx)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {dragDropItems.length === 0 && (
                    <div className="text-sm text-muted-foreground">No items yet. Add at least one item and select its correct category.</div>
                  )}
                </div>
              </div>
            )}

            {/* Matching Pairs content builder */}
            {formData.activityType === 'MATCHING_PAIRS' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Pairs</h4>
                  <Button onClick={addPair} size="sm">
                    <Plus className="h-4 w-4 mr-2" /> Add Pair
                  </Button>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {matchingPairs.map((pair, idx) => (
                    <Card key={idx}>
                      <CardContent className="pt-4">
                        <div className="grid grid-cols-12 gap-2 items-center">
                          <div className="col-span-5">
                            <Label>Left Text</Label>
                            <Input
                              placeholder="e.g., Malaki"
                              value={pair.leftText}
                              onChange={(e) => updatePair(idx, 'leftText', e.target.value)}
                            />
                          </div>
                          <div className="col-span-5">
                            <Label>Right Text</Label>
                            <Input
                              placeholder="e.g., Maliit"
                              value={pair.rightText}
                              onChange={(e) => updatePair(idx, 'rightText', e.target.value)}
                            />
                          </div>
                          <div className="col-span-2 flex justify-end">
                            <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => removePair(idx)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {matchingPairs.length === 0 && (
                    <div className="text-sm text-muted-foreground">No pairs yet. Add at least one left-right pair.</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (activeStep === 'content') {
                setActiveStep('activity');
              } else {
                onOpenChange(false);
              }
            }}
            disabled={loading}
          >
            {activeStep === 'content' ? 'Back' : 'Cancel'}
          </Button>
          
          {activeStep === 'activity' ? (
            <Button
              onClick={handleNext}
              className="bg-gradient-primary"
            >
              Next: Create Content
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-gradient-primary"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <LoadingSpinner size="sm" className="w-4 h-4" />
                  <span>{isEditing ? 'Updating...' : 'Creating...'}</span>
                </div>
              ) : (
                isEditing ? 'Update Activity' : 'Create Activity'
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
