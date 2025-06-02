
import { useState } from 'react';
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
import { Plus, X, Clock, Calendar, HelpCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const CreateQuizForm = ({ triggerClassName = "" }) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    timeLimitMinutes: 30,
    opensAt: '',
    closesAt: '',
    storyId: '',
  });

  const [questions, setQuestions] = useState([
    {
      questionText: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      points: 5
    }
  ]);

  // Mock stories for selection
  const stories = [
    { id: '1', title: 'Ang Alamat ng Pinya' },
    { id: '2', title: 'Si Juan at ang Higanteng Tainga' },
    { id: '3', title: 'Ang Matalinong Aso' },
    { id: '4', title: 'Bugtong ni Lola' },
  ];

  const categories = [
    'Reading Comprehension',
    'Grammar',
    'Vocabulary',
    'Literature',
    'Filipino Culture',
    'General Knowledge'
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleQuestionChange = (index: number, field: string, value: any) => {
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

  const addQuestion = () => {
    setQuestions(prev => [...prev, {
      questionText: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      points: 5
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
      if (!formData.title || !formData.description || !formData.category) {
        throw new Error('Please fill in all required fields');
      }

      // Validate questions
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        if (!question.questionText || !question.correctAnswer) {
          throw new Error(`Question ${i + 1} is incomplete`);
        }
        if (question.options.some(option => !option.trim())) {
          throw new Error(`Question ${i + 1} has empty options`);
        }
        if (!question.options.includes(question.correctAnswer)) {
          throw new Error(`Question ${i + 1} correct answer must match one of the options`);
        }
      }

      // Create quiz data structure
      const quizData = {
        ...formData,
        questions: questions.map(q => ({
          ...q,
          options: q.options.filter(option => option.trim())
        }))
      };

      console.log('Quiz Data:', quizData);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: "Quiz Created Successfully!",
        description: `"${formData.title}" has been created and is ready for students.`,
      });

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
        options: ['', '', '', ''],
        correctAnswer: '',
        points: 5
      }]);
      setOpen(false);

    } catch (error) {
      toast({
        title: "Error Creating Quiz",
        description: error.message,
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
            <h3 className="font-semibold text-gray-900 mb-2">Create Quiz</h3>
            <p className="text-sm text-gray-500">Design comprehension quizzes for your students</p>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <HelpCircle className="h-5 w-5" />
            <span>Create New Quiz</span>
          </DialogTitle>
          <DialogDescription>
            Create an interactive quiz for your students to test their comprehension and knowledge.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Quiz Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Reading Comprehension Quiz"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Brief description of what this quiz covers..."
              rows={3}
              required
            />
          </div>

          {/* Quiz Settings */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timeLimitMinutes" className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>Time Limit (minutes)</span>
              </Label>
              <Input
                id="timeLimitMinutes"
                type="number"
                value={formData.timeLimitMinutes}
                onChange={(e) => handleInputChange('timeLimitMinutes', parseInt(e.target.value))}
                min="5"
                max="180"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="opensAt" className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Opens At</span>
              </Label>
              <Input
                id="opensAt"
                type="datetime-local"
                value={formData.opensAt}
                onChange={(e) => handleInputChange('opensAt', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="closesAt">Closes At</Label>
              <Input
                id="closesAt"
                type="datetime-local"
                value={formData.closesAt}
                onChange={(e) => handleInputChange('closesAt', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="storyId">Related Story (Optional)</Label>
            <select
              id="storyId"
              value={formData.storyId}
              onChange={(e) => handleInputChange('storyId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">No related story</option>
              {stories.map(story => (
                <option key={story.id} value={story.id}>{story.title}</option>
              ))}
            </select>
          </div>

          {/* Questions Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Questions</h3>
              <div className="flex items-center space-x-4">
                <Badge variant="outline" className="text-teal-600">
                  {questions.length} question{questions.length !== 1 ? 's' : ''}
                </Badge>
                <Badge variant="outline" className="text-cyan-600">
                  {totalPoints} total points
                </Badge>
                <Button
                  type="button"
                  onClick={addQuestion}
                  size="sm"
                  className="bg-teal-500 hover:bg-teal-600"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Question
                </Button>
              </div>
            </div>

            {questions.map((question, questionIndex) => (
              <Card key={questionIndex} className="border-teal-100">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Question {questionIndex + 1}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-2">
                        <Label htmlFor={`points-${questionIndex}`} className="text-sm">Points:</Label>
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
                    <Label htmlFor={`question-${questionIndex}`}>Question Text *</Label>
                    <Textarea
                      id={`question-${questionIndex}`}
                      value={question.questionText}
                      onChange={(e) => handleQuestionChange(questionIndex, 'questionText', e.target.value)}
                      placeholder="Enter your question here..."
                      rows={2}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Answer Options *</Label>
                    <div className="grid md:grid-cols-2 gap-2">
                      {question.options.map((option, optionIndex) => (
                        <Input
                          key={optionIndex}
                          value={option}
                          onChange={(e) => handleOptionChange(questionIndex, optionIndex, e.target.value)}
                          placeholder={`Option ${optionIndex + 1}`}
                          required
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`correct-${questionIndex}`}>Correct Answer *</Label>
                    <select
                      id={`correct-${questionIndex}`}
                      value={question.correctAnswer}
                      onChange={(e) => handleQuestionChange(questionIndex, 'correctAnswer', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      required
                    >
                      <option value="">Select correct answer</option>
                      {question.options.filter(option => option.trim()).map((option, index) => (
                        <option key={index} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
            >
              {isSubmitting ? 'Creating...' : 'Create Quiz'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateQuizForm;
