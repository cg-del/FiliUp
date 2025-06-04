import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BookOpen, ArrowLeft, ArrowRight, Star, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getGenreByValue } from '@/constants/storyGenres';
import { storyService } from '@/lib/services/storyService';

// TypeScript interfaces for the API response
interface ClassEntity {
  className: string;
  description: string;
  createdAt: string;
  isActive: boolean;
  classCode: string;
  classId: string;
}

interface StoryData {
  storyId: string;
  title: string;
  content: string;
  createdAt: string;
  isActive: boolean;
  genre: string;
  fictionType: string;
  coverPictureUrl?: string;
  coverPictureType?: string;
  classEntity: ClassEntity;
}

interface StoryPage {
  text: string;
  image?: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
}

interface QuizComponentProps {
  quiz: QuizQuestion[];
  onComplete: () => void;
  storyTitle: string;
}

const StoryModule = () => {
  const { id: storyId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [currentPage, setCurrentPage] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [story, setStory] = useState<StoryData | null>(null);
  const [storyPages, setStoryPages] = useState<StoryPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch story data from API
  useEffect(() => {
    const fetchStory = async () => {
      console.log('=== StoryModule Debug ===');
      console.log('storyId from useParams:', storyId);
      console.log('storyId type:', typeof storyId);
      console.log('window.location.pathname:', window.location.pathname);
      
      if (!storyId) {
        console.log('ERROR: storyId is undefined or null');
        setError('Story ID not found in URL');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('Fetching story with ID:', storyId);
        const fetchedStory = await storyService.getStoryById(storyId);
        console.log('Story fetched successfully:', fetchedStory);
        setStory(fetchedStory);
        
        // Split content into pages based on paragraphs
        const paragraphs = fetchedStory.content
          .split(/\\n\\n|\\n|\\r\\n/)
          .filter(paragraph => paragraph.trim().length > 0)
          .map(paragraph => paragraph.trim());

        const pages: StoryPage[] = paragraphs.map(paragraph => ({
          text: paragraph,
          image: fetchedStory.coverPictureUrl
        }));

        console.log('Story pages created:', pages.length);
        setStoryPages(pages);
      } catch (err) {
        console.error('Error fetching story:', err);
        setError(`Failed to load story: ${err.message || 'Unknown error'}`);
        toast({
          title: "Error",
          description: "Hindi nakuha ang kuwento. Subukang muli.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStory();
  }, [storyId, toast]);

  // Mock quiz data (since not provided by API yet)
  const quiz = [
    {
      question: 'Ano ang natutunan mo sa kwentong ito?',
      options: ['Ang kahalagahan ng pagiging masipag', 'Ang kahalagahan ng kabaitan', 'Pareho ng A at B', 'Wala'],
      correct: 2
    },
    {
      question: 'Sino ang pangunahing tauhan sa kwento?',
      options: ['Pedro', 'Maria', 'Juan', 'Ana'],
      correct: 0
    },
    {
      question: 'Anong uri ng kwento ito?',
      options: ['Alamat', 'Pabula', 'Maikling Kwento', 'Tula'],
      correct: 0
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading story...</p>
        </div>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Story not found</h2>
          <p className="text-gray-600 mb-4">{error || 'The story you are looking for could not be found.'}</p>
          <Button 
            onClick={() => navigate('/student-dashboard')}
            className="bg-gradient-to-r from-blue-500 to-purple-500"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const genre = getGenreByValue(story.genre);
  const progress = storyPages.length > 0 ? ((currentPage + 1) / storyPages.length) * 100 : 0;

  const handleNext = () => {
    if (currentPage < storyPages.length - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      setShowQuiz(true);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleFinishStory = () => {
    toast({
      title: "Congratulations! 🎉",
      description: "Natapos mo na ang kuwento! Nakakuha ka ng 50 points!",
    });
    navigate('/student-dashboard');
  };

  if (showQuiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => setShowQuiz(false)}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Balik sa Kwento
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz Time! 🧠</h1>
            <p className="text-gray-600">Sagutin ang mga tanong tungkol sa kwentong nabasa mo.</p>
          </div>

          <QuizComponent 
            quiz={quiz} 
            onComplete={handleFinishStory}
            storyTitle={story.title}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/student-dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Balik sa Dashboard
          </Button>
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{story.title}</h1>
            <div className="flex items-center space-x-2">
              {genre && (
                <Badge 
                  className="text-white border-0" 
                  style={{ backgroundColor: genre.color }}
                >
                  {genre.label}
                </Badge>
              )}
              {story.fictionType && (
                <Badge variant="outline">
                  {story.fictionType}
                </Badge>
              )}
            </div>
          </div>
          <div className="mb-2">
            <p className="text-sm text-gray-600">
              Class: {story.classEntity.className} ({story.classEntity.classCode})
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Progress value={progress} className="h-2" />
            </div>
            <span className="text-sm text-gray-600">
              {currentPage + 1} of {storyPages.length}
            </span>
          </div>
        </div>

        {/* Story Content */}
        <Card className="mb-6 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            {storyPages.length > 0 && (
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  {storyPages[currentPage].image ? (
                    <img
                      src={storyPages[currentPage].image}
                      alt={`${story.title} - Page ${currentPage + 1}`}
                      className="w-full h-64 object-cover rounded-lg shadow-lg"
                      onError={(e) => {
                        // Fallback to placeholder if image fails to load
                        e.currentTarget.src = '/placeholder.svg?height=300&width=400';
                      }}
                    />
                  ) : (
                    <div className="w-full h-64 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-lg shadow-lg flex items-center justify-center">
                      <BookOpen className="h-16 w-16 text-teal-500" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-lg leading-relaxed text-gray-800 font-medium">
                    {storyPages[currentPage].text}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentPage === 0}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Previous</span>
          </Button>

          <Button
            onClick={handleNext}
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 flex items-center space-x-2"
          >
            <span>{currentPage === storyPages.length - 1 ? 'Take Quiz' : 'Next'}</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const QuizComponent = ({ quiz, onComplete, storyTitle }: QuizComponentProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNext = () => {
    if (selectedAnswer !== null) {
      const newAnswers = [...answers, selectedAnswer];
      setAnswers(newAnswers);

      if (currentQuestion < quiz.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
      } else {
        setShowResult(true);
      }
    }
  };

  const calculateScore = () => {
    return answers.reduce((score, answer, index) => {
      return score + (answer === quiz[index].correct ? 1 : 0);
    }, 0);
  };

  if (showResult) {
    const score = calculateScore();
    const percentage = (score / quiz.length) * 100;

    return (
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Quiz Results! 🎉</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="text-6xl">
            {percentage >= 80 ? '🌟' : percentage >= 60 ? '👍' : '💪'}
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900 mb-2">
              {score}/{quiz.length}
            </p>
            <p className="text-gray-600">
              {percentage >= 80 ? 'Excellent work!' : percentage >= 60 ? 'Good job!' : 'Keep practicing!'}
            </p>
          </div>
          <div className="flex justify-center space-x-2">
            {[...Array(3)].map((_, i) => (
              <Star
                key={i}
                className={`h-8 w-8 ${
                  i < Math.ceil(percentage / 34) ? 'text-yellow-500 fill-current' : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <Button
            onClick={onComplete}
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
            size="lg"
          >
            Complete Story
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Question {currentQuestion + 1} of {quiz.length}</CardTitle>
          <Progress value={((currentQuestion + 1) / quiz.length) * 100} className="w-32 h-2" />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-900">
          {quiz[currentQuestion].question}
        </h3>
        
        <div className="grid gap-3">
          {quiz[currentQuestion].options.map((option: string, index: number) => (
            <Button
              key={index}
              variant={selectedAnswer === index ? 'default' : 'outline'}
              onClick={() => handleAnswerSelect(index)}
              className={`p-4 h-auto text-left justify-start ${
                selectedAnswer === index 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                  : 'hover:bg-gray-50'
              }`}
            >
              <span className="font-medium mr-3">{String.fromCharCode(65 + index)}.</span>
              {option}
            </Button>
          ))}
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleNext}
            disabled={selectedAnswer === null}
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
          >
            {currentQuestion === quiz.length - 1 ? 'Finish Quiz' : 'Next Question'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default StoryModule;
