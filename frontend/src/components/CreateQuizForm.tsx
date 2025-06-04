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
import { Plus, X, Clock, Calendar, HelpCircle, Minus, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { classService } from '@/lib/services/classService';
import { storyService } from '@/lib/services/storyService';
import { quizService } from '@/lib/services/quizService';
import type { Class } from '@/lib/services/types';

interface QuizFormData {
  title: string;
  description: string;
  category: string;
  timeLimitMinutes: number;
  opensAt: string;
  closesAt: string;
  storyId: string;
}

interface QuizQuestion {
  questionText: string;
  options: string[];
  correctAnswer: string;
  points: number;
}

interface CreateQuizRequestData {
  title: string;
  description: string;
  category: string;
  timeLimitMinutes: number;
  opensAt: string;
  closesAt: string;
  isActive: boolean;
  storyId: string;
  questions: QuizQuestion[];
}

interface Story {
  id: string;
  title: string;
}

const CreateQuizForm = ({ triggerClassName = "" }) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stories, setStories] = useState<Story[]>([]);
  const [loadingStories, setLoadingStories] = useState(false);

  // Form state
  const [formData, setFormData] = useState<QuizFormData>({
    title: '',
    description: '',
    category: '',
    timeLimitMinutes: 30,
    opensAt: '',
    closesAt: '',
    storyId: '',
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

  // localStorage keys
  const FORM_DATA_KEY = 'filiup_quiz_form_data';
  const QUESTIONS_KEY = 'filiup_quiz_questions';

  // Restore form data from localStorage when dialog opens
  useEffect(() => {
    if (open) {
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
  }, [open]);

  // Auto-save form data to localStorage whenever it changes
  useEffect(() => {
    if (open) {
      try {
        localStorage.setItem(FORM_DATA_KEY, JSON.stringify(formData));
      } catch (error) {
        console.error('Error saving quiz form data:', error);
      }
    }
  }, [formData, open]);

  // Auto-save questions to localStorage whenever they change
  useEffect(() => {
    if (open) {
      try {
        localStorage.setItem(QUESTIONS_KEY, JSON.stringify(questions));
      } catch (error) {
        console.error('Error saving quiz questions:', error);
      }
    }
  }, [questions, open]);

  // Function to clear localStorage
  const clearFormStorage = () => {
    try {
      localStorage.removeItem(FORM_DATA_KEY);
      localStorage.removeItem(QUESTIONS_KEY);
    } catch (error) {
      console.error('Error clearing quiz form storage:', error);
    }
  };

  // Fetch teacher's stories when dialog opens
  useEffect(() => {
    const fetchStories = async () => {
      if (!open) return;
      
      try {
        setLoadingStories(true);
        const response = await storyService.getStoriesByTeacher();
        // Transform the data to match our Story interface
        const formattedStories = response.map(story => ({
          id: story.storyId,
          title: story.title
        }));
        setStories(formattedStories);
      } catch (error) {
        toast({
          title: "Mali",
          description: "Hindi nakuha ang mga kuwento. Subukang muli.",
          variant: "destructive",
        });
        console.error('Error fetching stories:', error);
      } finally {
        setLoadingStories(false);
      }
    };

    fetchStories();
  }, [open]);

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
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.title || !formData.description || !formData.category || !formData.storyId || !formData.opensAt || !formData.closesAt) {
        throw new Error('Pakikumpletuhin ang lahat ng kinakailangang patlang');
      }

      // Validate questions
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        if (!question.questionText || !question.correctAnswer) {
          throw new Error(`Tanong ${i + 1} ay hindi kumpleto`);
        }
        
        const validOptions = question.options.filter(option => option.trim());
        if (validOptions.length < 2) {
          throw new Error(`Tanong ${i + 1} ay dapat may hindi bababa sa 2 pagpipilian`);
        }
        
        if (!validOptions.includes(question.correctAnswer)) {
          throw new Error(`Tanong ${i + 1} - ang tamang sagot ay dapat tumugma sa isa sa mga pagpipilian`);
        }
      }

      // Create quiz data structure
      const quizData: CreateQuizRequestData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        timeLimitMinutes: formData.timeLimitMinutes,
        opensAt: formData.opensAt,
        closesAt: formData.closesAt,
        isActive: true,
        storyId: formData.storyId,
        questions: questions.map(q => ({
          questionText: q.questionText,
          options: q.options.filter(option => option.trim()),
          correctAnswer: q.correctAnswer,
          points: q.points
        }))
      };

      console.log('Quiz Data:', quizData);
      await quizService.createQuizForStory(quizData);

      toast({
        title: "Matagumpay na Nalikha ang Pagsusulit!",
        description: `"${formData.title}" ay nalikha na at handa na para sa mga estudyante.`,
      });

      // Clear localStorage after successful creation
      clearFormStorage();

      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        timeLimitMinutes: 30,
        opensAt: '',
        closesAt: '',
        storyId: '',
      });
      setQuestions([{
        questionText: '',
        options: ['', ''],
        correctAnswer: '',
        points: 5
      }]);
      setOpen(false);

    } catch (error) {
      toast({
        title: "Mali sa Paggawa ng Pagsusulit",
        description: error instanceof Error ? error.message : "Nagkaproblema sa hindi inaasahang dahilan",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Card className={`border-2 border-dashed border-teal-200 hover:border-teal-400 transition-colors cursor-pointer ${triggerClassName}`}>
          <CardContent className="p-6 text-center">
            <HelpCircle className="h-12 w-12 text-teal-500 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Gumawa ng Pagsusulit</h3>
            <p className="text-sm text-gray-500">Magdisenyo ng mga pagsusulit sa pag-unawa para sa inyong mga estudyante</p>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <HelpCircle className="h-5 w-5" />
            <span>Gumawa ng Bagong Pagsusulit</span>
          </DialogTitle>
          <DialogDescription>
            Gumawa ng interactive na pagsusulit para sa inyong mga estudyante upang subukin ang kanilang pag-unawa at kaalaman.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Pamagat ng Pagsusulit *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="hal., Komprehensibong Pagsusulit sa Alamat ng Pinya"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Kategorya *</Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              >
                <option value="">Pumili ng Kategorya</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Paglalarawan *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Detalyadong pagsusulit na sumasaklaw sa lahat ng aspeto ng kuwento..."
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="storyId">Kaugnay na Kuwento *</Label>
            <select
              id="storyId"
              value={formData.storyId}
              onChange={(e) => handleInputChange('storyId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
              disabled={loadingStories}
            >
              <option value="">
                {loadingStories ? "Naglo-load ng mga kuwento..." : "Piliin ang kuwento"}
              </option>
              {stories.map(story => (
                <option key={story.id} value={story.id}>{story.title}</option>
              ))}
            </select>
            {loadingStories && (
              <div className="flex items-center mt-2">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm text-gray-500">Naglo-load ng mga kuwento...</span>
              </div>
            )}
          </div>

          {/* Quiz Settings */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timeLimitMinutes" className="flex items-center space-x-1">
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
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="opensAt" className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Bubukas Sa *</span>
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
              <Label htmlFor="closesAt">Sasara Sa *</Label>
              <Input
                id="closesAt"
                type="datetime-local"
                value={formData.closesAt}
                onChange={(e) => handleInputChange('closesAt', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Questions Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Mga Tanong</h3>
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
              <Card key={questionIndex} className="border-teal-100">
                <CardHeader className="pb-3">
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
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
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
                        className="text-teal-600 border-teal-200"
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
                              className="text-red-600 border-red-200 hover:bg-red-50 px-2"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`correct-${questionIndex}`}>Tamang Sagot *</Label>
                    <select
                      id={`correct-${questionIndex}`}
                      value={question.correctAnswer}
                      onChange={(e) => handleQuestionChange(questionIndex, 'correctAnswer', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      required
                    >
                      <option value="">Piliin ang tamang sagot</option>
                      {question.options.filter(option => option.trim()).map((option, index) => (
                        <option key={index} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                </CardContent>
                
              </Card>
            ))}
             <Button
                  type="button"
                  onClick={addQuestion}
                  size="sm"
                  className="bg-teal-500 hover:bg-teal-600 display-flex right"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Magdagdag ng Tanong
                </Button>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Kanselahin
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.storyId || loadingStories}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Ginagawa...
                </>
              ) : (
                'Gumawa ng Pagsusulit'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateQuizForm;
