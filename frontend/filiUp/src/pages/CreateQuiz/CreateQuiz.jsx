import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, GripVertical, X, Clock, Calendar } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import teacherService from '../../services/teacherService';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectValue } from '../../components/ui/select';
import { Card, CardContent } from '../../components/ui/card';

const CATEGORIES = [
  { value: 'SCIENCE', label: 'Science' },
  { value: 'MATH', label: 'Math' },
  { value: 'ENGLISH', label: 'English' },
  { value: 'FILIPINO', label: 'Filipino' },
  { value: 'HISTORY', label: 'History' },
  { value: 'SOCIAL_STUDIES', label: 'Social Studies' },
  { value: 'COMPUTER', label: 'Computer' },
  { value: 'ARTS', label: 'Arts' },
  { value: 'MUSIC', label: 'Music' },
  { value: 'PHYSICAL_EDUCATION', label: 'Physical Education' },
  { value: 'OTHER', label: 'Other' }
];

export default function CreateQuiz() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { storyId } = useParams();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    timeLimitMinutes: 30,
    opensAt: new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16), // Default to tomorrow
    closesAt: new Date(new Date().getTime() + 48 * 60 * 60 * 1000).toISOString().slice(0, 16), // Default to day after tomorrow
    questions: [],
    isActive: true
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Check if user is a teacher
  useEffect(() => {
    if (!user || (user.userRole !== 'TEACHER' && user.userRole !== 'ADMIN')) {
      navigate('/home');
    }
  }, [user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updatedData = {
        ...prev,
        [name]: value
      };
      localStorage.setItem('quizFormData', JSON.stringify(updatedData));
      return updatedData;
    });
    
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleAddQuestion = () => {
    const newQuestion = {
      id: Date.now().toString(),
      questionText: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      points: 10
    };
    
    setFormData(prev => {
      const updatedData = {
        ...prev,
        questions: [...prev.questions, newQuestion]
      };
      // Save to localStorage
      localStorage.setItem('quizFormData', JSON.stringify(updatedData));
      return updatedData;
    });
  };

  // Function to add a new option to a question
  const handleAddOption = (questionId) => {
    setFormData(prev => {
      const updatedQuestions = prev.questions.map(q => {
        if (q.id === questionId) {
          return {
            ...q,
            options: [...q.options, '']
          };
        }
        return q;
      });
      
      const updatedData = {
        ...prev,
        questions: updatedQuestions
      };
      
      // Save to localStorage
      localStorage.setItem('quizFormData', JSON.stringify(updatedData));
      return updatedData;
    });
  };

  // Function to remove an option from a question
  const handleRemoveOption = (questionId, optionIndex) => {
    setFormData(prev => {
      const updatedQuestions = prev.questions.map(q => {
        if (q.id === questionId) {
          const newOptions = [...q.options];
          newOptions.splice(optionIndex, 1);
          
          // If removed option was the correct answer, reset correctAnswer
          const updatedQuestion = {
            ...q,
            options: newOptions
          };
          
          if (q.correctAnswer === q.options[optionIndex]) {
            updatedQuestion.correctAnswer = '';
          }
          
          return updatedQuestion;
        }
        return q;
      });
      
      const updatedData = {
        ...prev,
        questions: updatedQuestions
      };
      
      // Save to localStorage
      localStorage.setItem('quizFormData', JSON.stringify(updatedData));
      return updatedData;
    });
  };

  const handleQuestionChange = (questionId, field, value) => {
    setFormData(prev => {
      const updatedQuestions = prev.questions.map(q => 
        q.id === questionId ? { ...q, [field]: value } : q
      );
      
      const updatedData = {
        ...prev,
        questions: updatedQuestions
      };
      
      localStorage.setItem('quizFormData', JSON.stringify(updatedData));
      return updatedData;
    });
  };

  const handleOptionChange = (questionId, optionIndex, value) => {
    setFormData(prev => {
      const updatedQuestions = prev.questions.map(q => {
        if (q.id === questionId) {
          const updatedOptions = [...q.options];
          updatedOptions[optionIndex] = value;
          
          // If this option was the correct answer, update it with the new value
          const updatedQuestion = {
            ...q,
            options: updatedOptions
          };
          
          if (q.correctAnswer === q.options[optionIndex]) {
            updatedQuestion.correctAnswer = value;
          }
          
          return updatedQuestion;
        }
        return q;
      });
      
      const updatedData = {
        ...prev,
        questions: updatedQuestions
      };
      
      localStorage.setItem('quizFormData', JSON.stringify(updatedData));
      return updatedData;
    });
  };

  const handleCorrectAnswerChange = (questionId, value) => {
    setFormData(prev => {
      const updatedQuestions = prev.questions.map(q => 
        q.id === questionId ? { ...q, correctAnswer: value } : q
      );
      
      const updatedData = {
        ...prev,
        questions: updatedQuestions
      };
      
      localStorage.setItem('quizFormData', JSON.stringify(updatedData));
      return updatedData;
    });
  };

  const handleRemoveQuestion = (questionId) => {
    setFormData(prev => {
      const updatedData = {
        ...prev,
        questions: prev.questions.filter(q => q.id !== questionId)
      };
      
      localStorage.setItem('quizFormData', JSON.stringify(updatedData));
      return updatedData;
    });
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(formData.questions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setFormData(prev => {
      const updatedData = {
        ...prev,
        questions: items
      };
      
      localStorage.setItem('quizFormData', JSON.stringify(updatedData));
      return updatedData;
    });
  };

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedFormData = localStorage.getItem('quizFormData');
    if (savedFormData) {
      try {
        const parsedData = JSON.parse(savedFormData);
        setFormData(parsedData);
      } catch (e) {
        console.error('Error parsing saved form data:', e);
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      setError('Quiz title is required.');
      return;
    }
    
    if (!formData.description.trim()) {
      setError('Quiz description is required.');
      return;
    }
    
    if (!formData.category) {
      setError('Please select a category.');
      return;
    }

    if (formData.questions.length === 0) {
      setError('Please add at least one question.');
      return;
    }

    const invalidQuestions = formData.questions.filter(q => 
      !q.questionText.trim() || 
      q.options.some(opt => !opt.trim()) ||
      !q.correctAnswer
    );

    if (invalidQuestions.length > 0) {
      setError('Please fill in all question fields and select correct answers.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const quizData = {
        ...formData,
        storyId: storyId || null,
        createdById: user.userId
      };
      
      await teacherService.createQuiz(storyId, quizData);
      
      setSuccess('Quiz created successfully!');
      
      // Clear localStorage after successful creation
      localStorage.removeItem('quizFormData');
      
      // Redirect after successful creation
      setTimeout(() => {
        if (storyId) {
          navigate(`/teacher/class/${storyId}/lessons`);
        } else {
          navigate('/teacher');
        }
      }, 2000);
      
    } catch (error) {
      console.error('Error creating quiz:', error);
      setError(error.message || 'Failed to create quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    if (storyId) {
      navigate(`/teacher/class/${storyId}/lessons`);
    } else {
      navigate('/teacher');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" className="rounded-full" onClick={handleGoBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Create New Quiz</h1>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/50 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-green-800 dark:text-green-200">{success}</p>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Quiz Details */}
          <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="space-y-6">
                {/* Quiz Title */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-base font-semibold text-slate-700 dark:text-slate-300">
                    Quiz Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Enter quiz title..."
                    value={formData.title}
                    onChange={handleInputChange}
                    className="text-lg h-12 border-slate-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400"
                    required
                  />
                </div>

                {/* Quiz Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-base font-semibold text-slate-700 dark:text-slate-300">
                    Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Enter quiz description..."
                    value={formData.description}
                    onChange={handleInputChange}
                    className="min-h-20 resize-y border-slate-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400"
                    required
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-base font-semibold text-slate-700 dark:text-slate-300">
                    Category <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full h-12 rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                      required
                    >
                      <option value="" disabled>Select a category</option>
                      {CATEGORIES.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Time Settings */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="timeLimitMinutes" className="text-base font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <Clock className="h-4 w-4" /> Time Limit (minutes)
                    </Label>
                    <Input
                      id="timeLimitMinutes"
                      name="timeLimitMinutes"
                      type="number"
                      min="1"
                      value={formData.timeLimitMinutes}
                      onChange={handleInputChange}
                      className="h-12 border-slate-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="opensAt" className="text-base font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <Calendar className="h-4 w-4" /> Opens At
                    </Label>
                    <Input
                      id="opensAt"
                      name="opensAt"
                      type="datetime-local"
                      value={formData.opensAt}
                      onChange={handleInputChange}
                      className="h-12 border-slate-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="closesAt" className="text-base font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <Calendar className="h-4 w-4" /> Closes At
                    </Label>
                    <Input
                      id="closesAt"
                      name="closesAt"
                      type="datetime-local"
                      value={formData.closesAt}
                      onChange={handleInputChange}
                      className="h-12 border-slate-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Questions Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Questions</h2>
              <Button 
                type="button"
                onClick={handleAddQuestion}
                className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2"
              >
                <Plus size={16} />
                Add Question
              </Button>
            </div>

            {formData.questions.length === 0 && (
              <div className="text-center py-10 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg">
                <p className="text-slate-500 dark:text-slate-400">No questions added yet. Click "Add Question" to start.</p>
              </div>
            )}

            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="questions">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                    {formData.questions.map((question, index) => (
                      <Draggable key={question.id} draggableId={question.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="rounded-lg bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700"
                          >
                            <div className="p-6 space-y-4">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                  <div
                                    {...provided.dragHandleProps}
                                    className="cursor-move p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
                                  >
                                    <GripVertical className="h-5 w-5 text-slate-500" />
                                  </div>
                                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                    Question {index + 1}
                                  </h3>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemoveQuestion(question.id)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30"
                                >
                                  <Trash2 className="h-5 w-5" />
                                </Button>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor={`question-${question.id}`} className="text-slate-700 dark:text-slate-300">
                                  Question Text <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                  id={`question-${question.id}`}
                                  value={question.questionText}
                                  onChange={(e) => handleQuestionChange(question.id, 'questionText', e.target.value)}
                                  placeholder="Enter your question here..."
                                  className="border-slate-200 dark:border-slate-600"
                                  required
                                />
                              </div>

                              <div className="space-y-3">
                                <Label className="text-slate-700 dark:text-slate-300">
                                  Options <span className="text-red-500">*</span>
                                </Label>
                                {question.options.map((option, optIndex) => (
                                  <div key={optIndex} className="flex items-center gap-2">
                                    <input
                                      type="radio"
                                      id={`opt-${question.id}-${optIndex}`}
                                      name={`correct-${question.id}`}
                                      checked={question.correctAnswer === option}
                                      onChange={() => handleCorrectAnswerChange(question.id, option)}
                                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                    />
                                    <Input
                                      value={option}
                                      onChange={(e) => handleOptionChange(question.id, optIndex, e.target.value)}
                                      placeholder={`Option ${optIndex + 1}`}
                                      className="flex-1 border-slate-200 dark:border-slate-600"
                                      required
                                    />
                                    {question.options.length > 2 && (
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleRemoveOption(question.id, optIndex)}
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full"
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>
                                ))}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleAddOption(question.id)}
                                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 flex items-center gap-1"
                                >
                                  <Plus className="h-4 w-4" />
                                  Add Option
                                </Button>
                                <div className="text-sm text-slate-500 dark:text-slate-400">
                                  Select the radio button next to the correct answer
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor={`points-${question.id}`} className="text-slate-700 dark:text-slate-300">
                                  Points
                                </Label>
                                <Input
                                  id={`points-${question.id}`}
                                  type="number"
                                  min="1"
                                  value={question.points}
                                  onChange={(e) => handleQuestionChange(question.id, 'points', parseInt(e.target.value))}
                                  className="w-24 border-slate-200 dark:border-slate-600"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg rounded-lg shadow-md"
              disabled={loading}
            >
              {loading ? 'Creating Quiz...' : 'Create Quiz'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 