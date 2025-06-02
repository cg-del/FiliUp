
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BookOpen, ArrowLeft, ArrowRight, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getGenreByValue } from '@/constants/storyGenres';

const StoryModule = () => {
  const { storyId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [currentPage, setCurrentPage] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);

  const story = {
    id: storyId,
    title: 'Ang Matalinong Langgam',
    genre: 'PABULA',
    pages: [
      {
        text: 'Sa isang maliit na bakuran, may nakatira na masipag na langgam na nagngangalang Ligaya. Tuwing umaga, maagang bumabangon si Ligaya para maghanap ng pagkain.',
        image: '/placeholder.svg?height=300&width=400',
        audio: null
      },
      {
        text: 'Isang araw, nakakita si Ligaya ng malaking tinapay na nahulog mula sa kusina. "Ang laki nito!" sabi niya. "Pero paano ko kaya ito dadalhin sa aming tahanan?"',
        image: '/placeholder.svg?height=300&width=400',
        audio: null
      },
      {
        text: 'Naisip ni Ligaya na humingi ng tulong sa iba. Pumunta siya sa mga kaibigan niya - si Maya na tipaklong, si Ben na beetles, at si Carl na cricket.',
        image: '/placeholder.svg?height=300&width=400',
        audio: null
      },
      {
        text: 'Nang makita ng mga kaibigan ni Ligaya ang malaking tinapay, agad silang tumumulong. Sama-sama nilang binuhat ang tinapay patungo sa tahanan ng mga langgam.',
        image: '/placeholder.svg?height=300&width=400',
        audio: null
      },
      {
        text: 'Dahil sa pakikipagtulungan, naging masaya ang lahat. Nahati nila ang tinapay at walang nagutom sa kanilang komunidad.',
        image: '/placeholder.svg?height=300&width=400',
        audio: null
      }
    ],
    quiz: [
      {
        question: 'Ano ang pangalan ng langgam sa kwento?',
        options: ['Maya', 'Ligaya', 'Ben', 'Carl'],
        correct: 1
      },
      {
        question: 'Ano ang nakita ni Ligaya na nahulog mula sa kusina?',
        options: ['Prutas', 'Tinapay', 'Tubig', 'Aklat'],
        correct: 1
      },
      {
        question: 'Sino-sino ang tumulong kay Ligaya?',
        options: ['Maya, Ben, at Carl', 'Ligaya lang', 'Mga tao', 'Mga pusa'],
        correct: 0
      }
    ]
  };

  const genre = getGenreByValue(story.genre);
  const progress = ((currentPage + 1) / story.pages.length) * 100;

  const handleNext = () => {
    if (currentPage < story.pages.length - 1) {
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
      description: "Natapos mo na ang kwento! Nakakuha ka ng 50 points!",
    });
    navigate('/student');
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
            quiz={story.quiz} 
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
            onClick={() => navigate('/student')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Balik sa Dashboard
          </Button>
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{story.title}</h1>
            {genre && (
              <Badge 
                className="text-white border-0" 
                style={{ backgroundColor: genre.color }}
              >
                {genre.label}
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Progress value={progress} className="h-2" />
            </div>
            <span className="text-sm text-gray-600">
              {currentPage + 1} of {story.pages.length}
            </span>
          </div>
        </div>

        {/* Story Content */}
        <Card className="mb-6 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <img
                  src={story.pages[currentPage].image}
                  alt={`Page ${currentPage + 1}`}
                  className="w-full h-64 object-cover rounded-lg shadow-lg"
                />
              </div>
              <div>
                <p className="text-lg leading-relaxed text-gray-800 font-medium">
                  {story.pages[currentPage].text}
                </p>
              </div>
            </div>
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
            <span>{currentPage === story.pages.length - 1 ? 'Take Quiz' : 'Next'}</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const QuizComponent = ({ quiz, onComplete, storyTitle }: { 
  quiz: any[], 
  onComplete: () => void,
  storyTitle: string 
}) => {
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
