import { useState } from 'react';
import { QuizData } from '@/lib/services/quizService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Clock, Calendar, Users, Edit, Eye, CheckCircle, XCircle } from 'lucide-react';

interface QuizSelectionDialogProps {
  quizzes: QuizData[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onQuizSelect: (quiz: QuizData, action: 'view' | 'edit') => void;
  storyTitle: string;
  showEditOption?: boolean;
}

export const QuizSelectionDialog = ({
  quizzes,
  isOpen,
  onOpenChange,
  onQuizSelect,
  storyTitle,
  showEditOption = true
}: QuizSelectionDialogProps) => {
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
    const now = new Date();
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

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Pumili ng Quiz</DialogTitle>
          <DialogDescription>
            Pumili ng quiz na gusto mong {showEditOption ? 'tingnan o i-edit' : 'tingnan'} para sa kuwentong: <strong>{storyTitle}</strong>
          </DialogDescription>
        </DialogHeader>
        
        <div className="overflow-y-auto max-h-[60vh] pr-2">
          <div className="grid gap-4">
            {quizzes.map((quiz) => {
              const { status, color } = getQuizStatus(quiz);
              
              return (
                <Card key={quiz.quizId} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{quiz.title}</CardTitle>
                        <CardDescription className="text-sm">{quiz.description}</CardDescription>
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        <Badge className={color}>{status}</Badge>
                        <Badge variant="outline" className="text-xs">
                          {quiz.category}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-gray-500" />
                          <span>{quiz.timeLimitMinutes} minuto</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                          <span>Bukas: {formatDate(quiz.opensAt)}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                          <span>Sarado: {formatDate(quiz.closesAt)}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2 text-gray-500" />
                          <span>{quiz.questions?.length || 0} {quiz.questions?.length === 1 ? 'tanong' : 'mga tanong'}</span>
                        </div>
                        <div className="flex items-center">
                          {quiz.isActive ? (
                            <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 mr-2 text-red-600" />
                          )}
                          <span>{quiz.isActive ? 'Aktibo' : 'Hindi Aktibo'}</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2 text-gray-500" />
                          <span>Nililikha ni: {quiz.createdByName}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onQuizSelect(quiz, 'view')}
                        className="flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        Tingnan
                      </Button>
                      
                      {showEditOption && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => onQuizSelect(quiz, 'edit')}
                          className="flex items-center gap-2"
                        >
                          <Edit className="h-4 w-4" />
                          I-edit
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuizSelectionDialog; 