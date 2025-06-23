import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { commonStoryService } from '@/lib/services/commonStoryService';
import { QuizData } from '@/lib/services/quizService';
import CommonStoryQuizForm from './CommonStoryQuizForm';

interface CommonStoryQuizListProps {
  storyId: string;
  storyTitle: string;
}

const CommonStoryQuizList = ({ storyId, storyTitle }: CommonStoryQuizListProps) => {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<QuizData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await commonStoryService.getQuizzesForCommonStory(storyId);
      setQuizzes(data);
    } catch (err) {
      console.error('Error fetching quizzes:', err);
      setError('Hindi makuha ang mga quiz. Subukang muli.');
      toast({
        title: "Error",
        description: "Hindi makuha ang mga quiz. Subukang muli.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, [storyId]);

  const isTeacher = user?.role === 'TEACHER' || user?.role === 'ADMIN';
  const now = new Date();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getQuizStatus = (quiz: QuizData) => {
    const opensAt = new Date(quiz.opensAt);
    const closesAt = new Date(quiz.closesAt);
    
    if (now < opensAt) {
      return { status: 'Upcoming', color: 'bg-blue-100 text-blue-800' };
    } else if (now > closesAt) {
      return { status: 'Closed', color: 'bg-gray-100 text-gray-800' };
    } else {
      return { status: 'Active', color: 'bg-green-100 text-green-800' };
    }
  };

  const handleQuizCreated = () => {
    fetchQuizzes();
    toast({
      title: "Tagumpay!",
      description: "Matagumpay na nalikha ang quiz.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Mga Quiz para sa {storyTitle}</h2>
        {isTeacher && (
          <CommonStoryQuizForm 
            storyId={storyId} 
            storyTitle={storyTitle}
            onSuccess={handleQuizCreated}
          />
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Naglo-load...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-md text-red-800 text-center">
          {error}
        </div>
      ) : quizzes.length === 0 ? (
        <div className="bg-gray-50 p-8 rounded-md text-center">
          <p className="text-gray-600">Walang available na quiz para sa kuwentong ito.</p>
          {isTeacher && (
            <p className="mt-2">Maaari kang lumikha ng bagong quiz gamit ang button sa itaas.</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quizzes.map((quiz) => {
            const { status, color } = getQuizStatus(quiz);
            return (
              <Card key={quiz.quizId} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle>{quiz.title}</CardTitle>
                    <Badge className={color}>{status}</Badge>
                  </div>
                  <CardDescription>{quiz.category}</CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm text-gray-600 mb-4">{quiz.description}</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{quiz.timeLimitMinutes} minuto</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>Bukas: {formatDate(quiz.opensAt)}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>Sarado: {formatDate(quiz.closesAt)}</span>
                    </div>
                    <div className="flex items-center">
                      {quiz.isActive ? (
                        <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 mr-1 text-red-600" />
                      )}
                      <span>{quiz.isActive ? 'Aktibo' : 'Hindi Aktibo'}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="w-full flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      {quiz.questions?.length || 0} {quiz.questions?.length === 1 ? 'tanong' : 'mga tanong'}
                    </span>
                    <Button 
                      variant={now >= new Date(quiz.opensAt) && now <= new Date(quiz.closesAt) ? "default" : "outline"}
                      disabled={now < new Date(quiz.opensAt) || now > new Date(quiz.closesAt) || !quiz.isActive}
                    >
                      {isTeacher ? 'Tingnan' : 'Kumuha ng Quiz'}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CommonStoryQuizList; 