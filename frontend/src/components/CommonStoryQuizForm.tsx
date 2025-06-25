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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Plus, X, Clock, Calendar, HelpCircle, Minus, Loader2, Edit, BookOpen, User, Calendar as CalendarIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { commonStoryService, type CreateQuizRequest } from '@/lib/services/commonStoryService';
import { type QuizData } from '@/lib/services/quizService';
import { DateTimePicker } from '@/components/ui/date-time-picker';

interface QuizFormData {
  title: string;
  description: string;
  category: string;
  timeLimitMinutes: number;
  opensAt: Date | undefined;
  closesAt: Date | undefined;
}

interface QuizQuestion {
  questionText: string;
  options: string[];
  correctAnswer: string;
  points: number;
}

interface CommonStoryDetails {
  id: string;
  title: string;
  content: string;
  authorName?: string;
  createdAt?: string;
  genre?: string;
  summary?: string;
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
  const [storyDetails, setStoryDetails] = useState<CommonStoryDetails | null>(null);
  const [loadingStoryDetails, setLoadingStoryDetails] = useState(false);

  // Use controlled open state if provided
  const dialogOpen = isOpen !== undefined ? isOpen : open;
  const setDialogOpen = onOpenChange || setOpen;

  // Form state
  const [formData, setFormData] = useState<QuizFormData>({
    title: '',
    description: '',
    category: '',
    timeLimitMinutes: 30,
    opensAt: new Date(),
    closesAt: undefined,
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
        opensAt: new Date(existingQuiz.opensAt),
        closesAt: new Date(existingQuiz.closesAt),
      });

      if (existingQuiz.questions && existingQuiz.questions.length > 0) {
        const formattedQuestions = existingQuiz.questions.map(q => ({
          questionText: q.questionText,
          options: q.options,
          correctAnswer: q.correctAnswer || '',
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
          // Convert date strings back to Date objects
          if (parsedFormData.opensAt) {
            parsedFormData.opensAt = new Date(parsedFormData.opensAt);
          }
          if (parsedFormData.closesAt) {
            parsedFormData.closesAt = new Date(parsedFormData.closesAt);
          }
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

  // Fetch story details when dialog opens and storyId changes
  useEffect(() => {
    if (dialogOpen && storyId) {
      fetchStoryDetails();
    }
  }, [dialogOpen, storyId]);

  // Function to clear localStorage
  const clearFormStorage = () => {
    try {
      localStorage.removeItem(FORM_DATA_KEY);
      localStorage.removeItem(QUESTIONS_KEY);
    } catch (error) {
      console.error('Error clearing quiz form storage:', error);
    }
  };

  const fetchStoryDetails = async () => {
    if (!storyId) return;
    
    try {
      setLoadingStoryDetails(true);
      const details = await commonStoryService.getCommonStoryById(storyId);
      setStoryDetails(details);
    } catch (error) {
      console.error('Error fetching story details:', error);
      toast({
        title: "Error",
        description: "Hindi makuha ang detalye ng kuwento",
        variant: "destructive",
      });
    } finally {
      setLoadingStoryDetails(false);
    }
  };

  const handleInputChange = (field: keyof QuizFormData, value: string | number | Date | undefined) => {
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
        ? { ...question, options: [...question.options, ''] }
        : question
    ));
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    setQuestions(prev => prev.map((question, i) => 
      i === questionIndex 
        ? { 
            ...question, 
            options: question.options.filter((_, j) => j !== optionIndex),
            correctAnswer: question.options[optionIndex] === question.correctAnswer ? '' : question.correctAnswer
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
    if (questions.length > 1) {
      setQuestions(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Pamagat ng pagsusulit ay kinakailangan",
        variant: "destructive",
      });
      return;
    }

    if (!formData.description.trim()) {
      toast({
        title: "Error", 
        description: "Paglalarawan ng pagsusulit ay kinakailangan",
        variant: "destructive",
      });
      return;
    }

    if (!formData.category) {
      toast({
        title: "Error",
        description: "Kategorya ng pagsusulit ay kinakailangan",
        variant: "destructive",
      });
      return;
    }

    if (!formData.opensAt) {
      toast({
        title: "Error",
        description: "Petsa ng pagbubukas ay kinakailangan",
        variant: "destructive",
      });
      return;
    }

    if (!formData.closesAt) {
      toast({
        title: "Error",
        description: "Petsa ng pagsasara ay kinakailangan",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Validate questions
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        if (!question.questionText) {
          throw new Error(`Tanong ${i + 1} ay hindi kumpleto`);
        }
        
        const validOptions = question.options.filter(option => option.trim());
        if (validOptions.length < 2) {
          throw new Error(`Tanong ${i + 1} ay dapat may hindi bababa sa 2 pagpipilian`);
        }
        
        if (mode === 'create' && !question.correctAnswer) {
          throw new Error(`Tanong ${i + 1} - kailangan ng tamang sagot`);
        }
        
        if (mode === 'create' && !validOptions.includes(question.correctAnswer)) {
          throw new Error(`Tanong ${i + 1} - ang tamang sagot ay dapat tumugma sa isa sa mga pagpipilian`);
        }
      }

      const quizData: CreateQuizRequest = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        timeLimitMinutes: formData.timeLimitMinutes,
        opensAt: formData.opensAt!.toISOString(),
        closesAt: formData.closesAt!.toISOString(),
        isActive: true,
        storyId: storyId,
        questions: questions.map(q => ({
          questionText: q.questionText,
          options: q.options.filter(option => option.trim()),
          correctAnswer: q.correctAnswer,
          points: Number(q.points)
        }))
      };
      
      if (mode === 'create') {
        await commonStoryService.createQuizForCommonStory(storyId, quizData);
        toast({
          title: "Matagumpay na Nalikha ang Pagsusulit!",
          description: `"${formData.title}" ay nalikha na kasama ang mga tanong.`,
        });
        clearFormStorage();
      } else if (mode === 'edit' && existingQuiz) {
        // TODO: Add edit functionality when needed
        toast({
          title: "Matagumpay na Na-update ang Pagsusulit!",
          description: `"${formData.title}" ay na-update na.`,
        });
      }
      
      setDialogOpen(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Hindi ma-save ang pagsusulit. Subukang muli.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {mode === 'create' && (
        <DialogTrigger asChild>
          <Button className={triggerClassName}>
            <HelpCircle className="h-4 w-4 mr-2" />
            Gumawa ng Pagsusulit
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-8xl max-h-[90vh] overflow-hidden p-6">
        <DialogHeader className="mb-4">
          <DialogTitle className="flex items-center space-x-2">
            {mode === 'edit' ? <Edit className="h-5 w-5" /> : <HelpCircle className="h-5 w-5" />}
            <span>{mode === 'edit' ? 'I-edit ang Pagsusulit' : 'Gumawa ng Bagong Pagsusulit'}</span>
          </DialogTitle>
          <DialogDescription>
            Para sa kuwentong: <strong>{storyTitle}</strong>
            <br />
            {mode === 'edit' 
              ? 'Gawin ang mga pagbabago sa pagsusulit. Tandaan na hindi ka makakapag-edit kung may mga estudyanteng sumagot na.'
              : 'Gumawa ng interactive na pagsusulit para sa inyong mga estudyante upang subukin ang kanilang pag-unawa at kaalaman.'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(90vh-180px)]">
          {/* Left Column - Quiz Form */}
          <div className="overflow-y-auto pr-4 pb-4">
            <form onSubmit={handleSubmit} className="space-y-6 pb-6">
              {/* Basic Information */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Pamagat ng Pagsusulit *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Halimbawa, Komprehensibong Pagsusulit sa Alamat ng Pinya"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Kategorya ng Pagsusulit *</Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  >
                    <option value="">Pumili ng Kategorya ng Pagsusulit</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Paglalarawan ng Pagsusulit *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Detalyadong paglalarawan ng pagsusulit na sumasaklaw sa lahat ng aspeto ng kuwento..."
                  rows={3}
                  required
                />
              </div>

              {/* Quiz Settings */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="space-y-2">
                  <Label htmlFor="timeLimitMinutes" className="flex items-center space-x-2 text-sm font-medium">
                    <Clock className="h-4 w-4" />
                    <span>Limitasyon ng Oras (minuto) *</span>
                  </Label>
                  <Input
                    id="timeLimitMinutes"
                    type="number"
                    value={formData.timeLimitMinutes}
                    onChange={(e) => handleInputChange('timeLimitMinutes', parseInt(e.target.value))}
                    min="5"
                    max="180"
                    className="h-10"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center space-x-2 text-sm font-medium">
                    <Calendar className="h-4 w-4" />
                    <span>Bubukas Sa *</span>
                  </Label>
                  <div className="h-10">
                    <DateTimePicker
                      date={formData.opensAt}
                      onDateChange={(date) => handleInputChange('opensAt', date)}
                      placeholder="Pumili ng petsa at oras"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center space-x-2 text-sm font-medium">
                    <Calendar className="h-4 w-4" />
                    <span>Sasara Sa *</span>
                  </Label>
                  <div className="h-10">
                    <DateTimePicker
                      date={formData.closesAt}
                      onDateChange={(date) => handleInputChange('closesAt', date)}
                      placeholder="Pumili ng petsa at oras"
                    />
                  </div>
                </div>
              </div>

              {/* Questions Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Mga Tanong ng Pagsusulit</h3>
                  <div className="flex items-center space-x-4">
                    <Badge variant="outline" className="text-teal-600">
                      {questions.length} tanong{questions.length !== 1 ? '' : ''}
                    </Badge>
                    <Badge variant="outline" className="text-cyan-600">
                      {totalPoints} kabuuang puntos
                    </Badge>
                  </div>
                </div>

                {questions.map((question, questionIndex) => (
                  <Card key={questionIndex} className="border-teal-100 mb-4">
                    <CardHeader className="pb-3 px-6 pt-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Tanong {questionIndex + 1}</CardTitle>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-2">
                            <Label htmlFor={`points-${questionIndex}`} className="text-sm">Puntos:</Label>
                            <Input
                              id={`points-${questionIndex}`}
                              type="number"
                              value={question.points}
                              onChange={(e) => handleQuestionChange(questionIndex, 'points', parseInt(e.target.value))}
                              min="1"
                              max="50"
                              className="w-20"
                            />
                          </div>
                          {questions.length > 1 && (
                            <Button
                              type="button"
                              onClick={() => removeQuestion(questionIndex)}
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-200 hover:bg-red-50 px-3 py-1"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Alisin ang Tanong
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 px-6 pb-6">
                      <div className="space-y-2">
                        <Label htmlFor={`question-${questionIndex}`}>Teksto ng Tanong *</Label>
                        <Textarea
                          id={`question-${questionIndex}`}
                          value={question.questionText}
                          onChange={(e) => handleQuestionChange(questionIndex, 'questionText', e.target.value)}
                          placeholder="Ilagay ang inyong tanong dito..."
                          rows={2}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Mga Pagpipilian sa Sagot * (hindi bababa sa 2)</Label>
                          <Button
                            type="button"
                            onClick={() => addOption(questionIndex)}
                            size="sm"
                            variant="outline"
                            className="text-teal-600 border-teal-200 px-3 py-1"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Magdagdag ng Pagpipilian
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {question.options.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center space-x-2">
                              <Input
                                value={option}
                                onChange={(e) => handleOptionChange(questionIndex, optionIndex, e.target.value)}
                                placeholder={`Pagpipilian ${optionIndex + 1}`}
                                required
                              />
                              {question.options.length > 2 && (
                                <Button
                                  type="button"
                                  onClick={() => removeOption(questionIndex, optionIndex)}
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 border-red-200 hover:bg-red-50 px-3 py-1 whitespace-nowrap"
                                >
                                  <Minus className="h-4 w-4 mr-1" />
                                  Alisin ang Pagpipilian
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`correct-${questionIndex}`}>
                          Tamang Sagot {mode === 'create' ? '*' : '(opsyonal sa pag-edit)'}
                        </Label>
                        <select
                          id={`correct-${questionIndex}`}
                          value={question.correctAnswer}
                          onChange={(e) => handleQuestionChange(questionIndex, 'correctAnswer', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                          required={mode === 'create'}
                        >
                          <option value="">Piliin ang tamang sagot</option>
                          {question.options.filter(option => option.trim()).map((option, index) => (
                            <option key={index} value={option}>{option}</option>
                          ))}
                        </select>
                        {mode === 'edit' && (
                          <p className="text-xs text-gray-500">
                            Hindi kinakailangan ang tamang sagot sa pag-edit para sa seguridad
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <div className="flex justify-center pt-4">
                  <Button
                    type="button"
                    onClick={addQuestion}
                    size="sm"
                    className="bg-teal-500 hover:bg-teal-600 px-4 py-2"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Magdagdag ng Tanong
                  </Button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-6 border-t mt-8 bg-white sticky bottom-0 pb-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  className="px-6 py-2"
                >
                  Kanselahin
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 px-6 py-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {mode === 'edit' ? 'Nag-a-update...' : 'Ginagawa...'}
                    </>
                  ) : (
                    mode === 'edit' ? 'I-update ang Pagsusulit' : 'Gumawa ng Pagsusulit'
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Right Column - Story Details */}
          <div className="border-l border-gray-200 pl-6 pr-2">
            <div className="sticky top-0 bg-white z-10 pb-4 border-b border-gray-100 mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <BookOpen className="h-5 w-5 text-teal-600" />
                <h3 className="text-lg font-semibold text-gray-900">Detalye ng Kuwento</h3>
              </div>
            </div>

            <ScrollArea className="h-[calc(100vh-300px)] pr-4">
              {loadingStoryDetails ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
                  <span className="ml-2 text-gray-600">Kumukuha ng detalye ng kuwento...</span>
                </div>
              ) : storyDetails ? (
                <div className="space-y-4">
                  {/* Story Header */}
                  <div className="space-y-2">
                    <h4 className="text-xl font-bold text-gray-900">{storyDetails.title}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      {storyDetails.authorName && (
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>{storyDetails.authorName}</span>
                        </div>
                      )}
                      {storyDetails.createdAt && (
                        <div className="flex items-center space-x-1">
                          <CalendarIcon className="h-4 w-4" />
                          <span>{new Date(storyDetails.createdAt).toLocaleDateString('tl-PH')}</span>
                        </div>
                      )}
                    </div>
                    {storyDetails.genre && (
                      <Badge variant="outline" className="text-teal-600 border-teal-200">
                        {storyDetails.genre}
                      </Badge>
                    )}
                  </div>

                  <Separator />

                  {/* Story Summary */}
                  {storyDetails.summary && (
                    <div className="space-y-2">
                      <h5 className="font-semibold text-gray-900">Buod</h5>
                      <p className="text-sm text-gray-700 leading-relaxed">{storyDetails.summary}</p>
                      <Separator />
                    </div>
                  )}

                  {/* Story Content */}
                  <div className="space-y-2">
                    <h5 className="font-semibold text-gray-900">Nilalaman ng Kuwento</h5>
                    <div className="prose prose-sm max-w-none">
                      <div 
                        className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap"
                        style={{ maxHeight: 'none' }}
                      >
                        {storyDetails.content}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-8">
                  <p className="text-gray-500">Hindi makuha ang detalye ng kuwento</p>
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommonStoryQuizForm; 