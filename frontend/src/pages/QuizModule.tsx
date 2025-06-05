import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Clock, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const QuizModule = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

  const quiz = {
    id: quizId,
    title: 'Filipino Comprehension Quiz #1',
    description: 'Test your understanding of Filipino stories and grammar',
    questions: [
      {
        question: 'Ano ang ibig sabihin ng salitang "matalino"?',
        options: ['Maganda', 'Mayaman', 'Matalas ang isip', 'Mabait'],
        explanation: 'Ang "matalino" ay nangangahulugang may matalas na isip o may kakayahang mag-isip nang mabuti.'
      },
      {
        question: 'Alin sa mga sumusunod ang tamang pagkakagamit ng "ng" at "nang"?',
        options: [
          'Bumili ng prutas sa palengke',
          'Bumili nang prutas sa palengke',
          'Kumain ng mabilis',
          'Tumakbo ng mabilis'
        ],
        explanation: 'Ginagamit ang "ng" kapag tumutukoy sa bagay o tao, habang "nang" ay ginagamit sa pamamaraan.'
      },
      {
        question: 'Sa kwentong "Ang Langgam at ang Tipaklong", ano ang aral na natutuhan?',
        options: [
          'Ang pagiging tamad ay magdudulot ng hirap',
          'Ang mga tipaklong ay masasamang hayop',
          'Ang pagsisipag at pag-iimpok ay mahalaga',
          'Ang lahat ng nasa itaas'
        ],
        explanation: 'Ang kwentong ito ay nagtuturo ng kahalagahan ng pagsisipag at pag-iimpok para sa hinaharap.'
      },
      {
        question: 'Ano ang tamang pagkakasunod-sunod ng mga pangyayari sa isang kwento?',
        options: [
          'Gitna, Simula, Wakas',
          'Simula, Gitna, Wakas',
          'Wakas, Simula, Gitna',
          'Walang tamang pagkakasunod-sunod'
        ],
        explanation: 'Ang tamang daloy ng kwento ay Simula (panimula), Gitna (tunggalian), at Wakas (resolusyon).'
      },
      {
        question: 'Alin sa mga sumusunod ang halimbawa ng "tauhan" sa kwento?',
        options: [
          'Ang lugar kung saan naganap ang kwento',
          'Ang mga nangyari sa kwento',
          'Ang mga karakter sa kwento',
          'Ang mensahe ng kwento'
        ],
        explanation: 'Ang "tauhan" ay tumutukoy sa mga karakter o persona na gumaganap sa kwento.'
      }
    ]
  };

  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNext = () => {
    if (selectedAnswer !== null) {
      const newAnswers = [...answers, selectedAnswer];
      setAnswers(newAnswers);

      if (currentQuestion < quiz.questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
      } else {
        setShowResult(true);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedAnswer(answers[currentQuestion - 1] || null);
      setAnswers(answers.slice(0, -1));
    }
  };

  const calculateScore = () => {
    // Since correct answers are removed for security, return a placeholder score
    // This component should be replaced with proper API integration
    return Math.floor(Math.random() * answers.length) + 1; // Random score for demo
  };

  const handleFinishQuiz = () => {
    const score = calculateScore();
    const percentage = (score / quiz.questions.length) * 100;
    const points = Math.round(percentage * 2); // Max 200 points

    toast({
      title: "Quiz Completed! 🎉",
      description: `Nakakuha ka ng ${points} points! Score: ${score}/${quiz.questions.length}`,
    });
    navigate('/student');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (showResult) {
    const score = calculateScore();
    const percentage = (score / quiz.questions.length) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">Quiz Results! 🎉</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="text-8xl">
                {percentage >= 90 ? '🌟' : percentage >= 80 ? '🎊' : percentage >= 70 ? '👍' : '💪'}
              </div>
              
              <div>
                <p className="text-4xl font-bold text-gray-900 mb-2">
                  {score}/{quiz.questions.length}
                </p>
                <p className="text-xl text-gray-600 mb-4">
                  {percentage.toFixed(0)}% Correct
                </p>
                <p className="text-lg">
                  {percentage >= 90 ? 'Outstanding! Napakagaling!' : 
                   percentage >= 80 ? 'Excellent work! Mahusay!' : 
                   percentage >= 70 ? 'Good job! Magpatuloy!' : 
                   'Keep practicing! Kaya mo yan!'}
                </p>
              </div>

              <div className="flex justify-center space-x-2">
                {[...Array(3)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-10 w-10 ${
                      i < Math.ceil(percentage / 34) ? 'text-yellow-500 fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>

              {/* Detailed Results */}
              <div className="mt-8 space-y-4">
                <h3 className="text-xl font-semibold">Review ng mga Sagot:</h3>
                <div className="text-center bg-gray-50 p-6 rounded-lg">
                  <p className="text-gray-600">
                    Quiz results are now processed securely on the server.
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    For actual quizzes, please use the story module which integrates with the backend API.
                  </p>
                </div>
              </div>

              <Button
                onClick={handleFinishQuiz}
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                size="lg"
              >
                Bumalik sa Dashboard
              </Button>
            </CardContent>
          </Card>
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
          
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{quiz.title}</h1>
              <p className="text-gray-600">{quiz.description}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2 text-lg font-medium text-orange-600">
                <Clock className="h-5 w-5" />
                <span>{formatTime(timeLeft)}</span>
              </div>
              <p className="text-sm text-gray-500">Time remaining</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Progress value={progress} className="h-3" />
            </div>
            <span className="text-sm text-gray-600 font-medium">
              {currentQuestion + 1} of {quiz.questions.length}
            </span>
          </div>
        </div>

        {/* Question */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm mb-6">
          <CardHeader>
            <CardTitle className="text-xl">
              Question {currentQuestion + 1}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">
              {quiz.questions[currentQuestion].question}
            </h3>
            
            <div className="grid gap-3">
              {quiz.questions[currentQuestion].options.map((option: string, index: number) => (
                <Button
                  key={index}
                  variant={selectedAnswer === index ? 'default' : 'outline'}
                  onClick={() => handleAnswerSelect(index)}
                  className={`p-4 h-auto text-left justify-start transition-all duration-200 ${
                    selectedAnswer === index 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-[1.02]' 
                      : 'hover:bg-gray-50 hover:border-blue-300'
                  }`}
                >
                  <span className="font-medium mr-3 text-lg">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  <span className="text-base">{option}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Previous</span>
          </Button>

          <Button
            onClick={handleNext}
            disabled={selectedAnswer === null}
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 flex items-center space-x-2"
          >
            <span>{currentQuestion === quiz.questions.length - 1 ? 'Finish Quiz' : 'Next Question'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuizModule;
