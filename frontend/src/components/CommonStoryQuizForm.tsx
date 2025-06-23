import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, X, Clock, Calendar, Minus, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { commonStoryService, type CreateQuizRequest } from '@/lib/services/commonStoryService';
import { type QuizData } from '@/lib/services/quizService';

interface QuizFormData {
  title: string;
  description: string;
  category: string;
  timeLimitMinutes: number;
  opensAt: string;
  closesAt: string;
}

interface QuizQuestion {
  questionText: string;
  options: string[];
  correctAnswer: string;
  points: number;
}

interface CommonStoryQuizFormProps {
  storyId: string;
  storyTitle: string;
  triggerClassName?: string;
  mode?: 'create' | 'edit';
  existingQuiz?: QuizData;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
}

const CommonStoryQuizForm = ({
  storyId,
  storyTitle,
  triggerClassName = "",
  mode = 'create',
  existingQuiz,
  isOpen,
  onOpenChange,
  onSuccess
}: CommonStoryQuizFormProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use controlled open state if provided
  const dialogOpen = isOpen !== undefined ? isOpen : open;
  const setDialogOpen = onOpenChange || setOpen;

  // Form state
  const [formData, setFormData] = useState<QuizFormData>({
    title: '',
    description: '',
    category: '',
    timeLimitMinutes: 30,
    opensAt: '',
    closesAt: '',
  });

  const [questions, setQuestions] = useState<QuizQuestion[]>([
    {
      questionText: '',
      options: ['', ''],
      correctAnswer: '',
      points: 1
    }
  ]);

  const categories = [
    'Madali',
    'Katamtaman',
    'Mahirap',
  ];

  // localStorage keys (different for edit mode to avoid conflicts)
  const FORM_DATA_KEY = mode === 'edit' ? `filiup_edit_common_story_quiz_form_data_${storyId}` : `filiup_common_story_quiz_form_data_${storyId}`;
  const QUESTIONS_KEY = mode === 'edit' ? `filiup_edit_common_story_quiz_questions_${storyId}` : `filiup_common_story_quiz_questions_${storyId}`;

  // Initialize form with existing quiz data in edit mode
  useEffect(() => {
    if (mode === 'edit' && existingQuiz && dialogOpen) {
      setFormData({
        title: existingQuiz.title,
        description: existingQuiz.description,
        category: existingQuiz.category,
        timeLimitMinutes: existingQuiz.timeLimitMinutes,
        opensAt: existingQuiz.opensAt,
        closesAt: existingQuiz.closesAt,
      });

      if (existingQuiz.questions && existingQuiz.questions.length > 0) {
        // Use existing quiz data directly since it should already have correct answers
        const formattedQuestions = existingQuiz.questions.map(q => ({
          questionText: q.questionText,
          options: q.options,
          correctAnswer: q.correctAnswer || '', // Use the correct answer from the API
          points: q.points
        }));
        setQuestions(formattedQuestions);
      }
    }
  }, [mode, existingQuiz, dialogOpen]);

  // Restore form data from localStorage when dialog opens (only in create mode)
  useEffect(() => {
    if (dialogOpen && mode === 'create') {
      try {
        const savedFormData = localStorage.getItem(FORM_DATA_KEY);
        const savedQuestions = localStorage.getItem(QUESTIONS_KEY);
        
        if (savedFormData) {
          const parsedFormData = JSON.parse(savedFormData);
          setFormData(parsedFormData);
        }
        
        if (savedQuestions) {
          const parsedQuestions = JSON.parse(savedQuestions);
          setQuestions(parsedQuestions);
        }
      } catch (error) {
        console.error('Error restoring quiz form data:', error);
      }
    }
  }, [dialogOpen, mode, FORM_DATA_KEY, QUESTIONS_KEY]);

  // Auto-save form data to localStorage whenever it changes (only in create mode)
  useEffect(() => {
    if (dialogOpen && mode === 'create') {
      try {
        localStorage.setItem(FORM_DATA_KEY, JSON.stringify(formData));
      } catch (error) {
        console.error('Error saving quiz form data:', error);
      }
    }
  }, [formData, dialogOpen, mode, FORM_DATA_KEY]);

  // Auto-save questions to localStorage whenever they change (only in create mode)
  useEffect(() => {
    if (dialogOpen && mode === 'create') {
      try {
        localStorage.setItem(QUESTIONS_KEY, JSON.stringify(questions));
      } catch (error) {
        console.error('Error saving quiz questions:', error);
      }
    }
  }, [questions, dialogOpen, mode, QUESTIONS_KEY]);

  // Function to clear localStorage
  const clearFormStorage = () => {
    try {
      localStorage.removeItem(FORM_DATA_KEY);
      localStorage.removeItem(QUESTIONS_KEY);
    } catch (error) {
      console.error('Error clearing quiz form storage:', error);
    }
  };

  const handleInputChange = (field: keyof QuizFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleQuestionChange = (index: number, field: keyof QuizQuestion, value: string | number | string[]) => {
    setQuestions(prev => prev.map((question, i) => 
      i === index ? { ...question, [field]: value } : question
    ));
  };

  const handleOptionChange = (questionIndex: number, optionIndex: number, value: string) => {
    setQuestions(prev => prev.map((question, i) => 
      i === questionIndex 
        ? { 
            ...question, 
            options: question.options.map((option, j) => j === optionIndex ? value : option)
          }
        : question
    ));
  };

  const addOption = (questionIndex: number) => {
    setQuestions(prev => prev.map((question, i) => 
      i === questionIndex 
        ? { 
            ...question, 
            options: [...question.options, '']
          }
        : question
    ));
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    if (questions[questionIndex].options.length <= 2) {
      toast({
        title: "Hindi maaari",
        description: "Kailangan may dalawang option man lang.",
        variant: "destructive",
      });
      return;
    }
    
    setQuestions(prev => prev.map((question, i) => 
      i === questionIndex 
        ? { 
            ...question, 
            options: question.options.filter((_, j) => j !== optionIndex),
            correctAnswer: question.correctAnswer === question.options[optionIndex] ? '' : question.correctAnswer
          }
        : question
    ));
  };

  const addQuestion = () => {
    setQuestions(prev => [...prev, {
      questionText: '',
      options: ['', ''],
      correctAnswer: '',
      points: 1
    }]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length <= 1) return;
    setQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.title.trim()) {
      toast({ title: "Error", description: "Quiz title is required", variant: "destructive" });
      return;
    }
    
    if (!formData.description.trim()) {
      toast({ title: "Error", description: "Quiz description is required", variant: "destructive" });
      return;
    }
    
    if (!formData.category) {
      toast({ title: "Error", description: "Quiz category is required", variant: "destructive" });
      return;
    }
    
    if (!formData.opensAt) {
      toast({ title: "Error", description: "Quiz opening date is required", variant: "destructive" });
      return;
    }
    
    if (!formData.closesAt) {
      toast({ title: "Error", description: "Quiz closing date is required", variant: "destructive" });
      return;
    }
    
    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      
      if (!question.questionText.trim()) {
        toast({ title: "Error", description: `Question ${i + 1} text is required`, variant: "destructive" });
        return;
      }
      
      for (let j = 0; j < question.options.length; j++) {
        if (!question.options[j].trim()) {
          toast({ title: "Error", description: `Option ${j + 1} for question ${i + 1} is required`, variant: "destructive" });
          return;
        }
      }
      
      if (!question.correctAnswer) {
        toast({ title: "Error", description: `Correct answer for question ${i + 1} is required`, variant: "destructive" });
        return;
      }
    }
    
    try {
      setIsSubmitting(true);
      
      const quizData: CreateQuizRequest = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        timeLimitMinutes: formData.timeLimitMinutes,
        opensAt: formData.opensAt,
        closesAt: formData.closesAt,
        isActive: true,
        storyId: storyId,
        questions: questions.map(q => ({
          questionText: q.questionText,
          options: q.options,
          correctAnswer: q.correctAnswer,
          points: q.points
        }))
      };
      
      if (mode === 'create') {
        await commonStoryService.createQuizForCommonStory(storyId, quizData);
        toast({
          title: "Tagumpay!",
          description: "Matagumpay na nalikha ang quiz.",
        });
        clearFormStorage();
      } else if (mode === 'edit' && existingQuiz) {
        // TODO: Add edit functionality when needed
        toast({
          title: "Tagumpay!",
          description: "Matagumpay na na-update ang quiz.",
        });
      }
      
      setDialogOpen(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast({
        title: "May Error",
        description: "Hindi matagumpay na nalikha ang quiz. Subukang muli.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button className={triggerClassName}>
          {mode === 'create' ? 'Gumawa ng Quiz' : 'I-edit ang Quiz'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Gumawa ng Bagong Quiz' : 'I-edit ang Quiz'}
          </DialogTitle>
          <DialogDescription>
            Para sa kuwentong: <strong>{storyTitle}</strong>
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Ilagay ang title ng quiz"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  <option value="">Pumili ng category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Ilagay ang description ng quiz"
                required
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="timeLimitMinutes">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Time Limit (minutes)
                </Label>
                <Input
                  id="timeLimitMinutes"
                  type="number"
                  min="1"
                  value={formData.timeLimitMinutes}
                  onChange={(e) => handleInputChange('timeLimitMinutes', parseInt(e.target.value))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="opensAt">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Opens At
                </Label>
                <Input
                  id="opensAt"
                  type="datetime-local"
                  value={formData.opensAt}
                  onChange={(e) => handleInputChange('opensAt', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="closesAt">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Closes At
                </Label>
                <Input
                  id="closesAt"
                  type="datetime-local"
                  value={formData.closesAt}
                  onChange={(e) => handleInputChange('closesAt', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Mga Tanong</h3>
              <Button type="button" onClick={addQuestion} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" /> Magdagdag ng Tanong
              </Button>
            </div>
            
            {questions.map((question, qIndex) => (
              <Card key={qIndex} className="relative">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-md">
                      Tanong #{qIndex + 1}
                      <Badge variant="outline" className="ml-2">
                        {question.points} {question.points === 1 ? 'point' : 'points'}
                      </Badge>
                    </CardTitle>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeQuestion(qIndex)}
                      disabled={questions.length <= 1}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={`question-${qIndex}`}>Tanong</Label>
                    <Textarea
                      id={`question-${qIndex}`}
                      value={question.questionText}
                      onChange={(e) => handleQuestionChange(qIndex, 'questionText', e.target.value)}
                      placeholder="Ilagay ang tanong"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Mga Opsyon</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => addOption(qIndex)}
                      >
                        <Plus className="h-3 w-3 mr-1" /> Magdagdag
                      </Button>
                    </div>
                    
                    {question.options.map((option, oIndex) => (
                      <div key={oIndex} className="flex items-center space-x-2">
                        <Input
                          value={option}
                          onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                          placeholder={`Opsyon ${oIndex + 1}`}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeOption(qIndex, oIndex)}
                          disabled={question.options.length <= 2}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`correct-${qIndex}`}>Tamang Sagot</Label>
                    <select
                      id={`correct-${qIndex}`}
                      value={question.correctAnswer}
                      onChange={(e) => handleQuestionChange(qIndex, 'correctAnswer', e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    >
                      <option value="">Pumili ng tamang sagot</option>
                      {question.options.map((option, oIndex) => (
                        <option key={oIndex} value={option} disabled={!option.trim()}>
                          {option || `Opsyon ${oIndex + 1} (walang laman)`}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`points-${qIndex}`}>Points</Label>
                    <Input
                      id={`points-${qIndex}`}
                      type="number"
                      min="1"
                      value={question.points}
                      onChange={(e) => handleQuestionChange(qIndex, 'points', parseInt(e.target.value))}
                      required
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === 'create' ? 'I-save ang Quiz' : 'I-update ang Quiz'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CommonStoryQuizForm; 