import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, RotateCcw, BookOpen } from 'lucide-react';

interface ComprehensionQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface StoryComprehensionActivityProps {
  title: string;
  story: string;
  questions: ComprehensionQuestion[];
  onComplete: (score: number, percentage: number, answers?: (string | number | string[])[], timeSpentSeconds?: number) => void;
}


export const StoryComprehensionActivity: React.FC<StoryComprehensionActivityProps> = ({
  title,
  story,
  questions,
  onComplete
}) => {
  useEffect(() => {
    document.body.classList.add('no-select');
    type FsEl = HTMLElement & {
      webkitRequestFullscreen?: () => Promise<void> | void;
      msRequestFullscreen?: () => Promise<void> | void;
      mozRequestFullScreen?: () => Promise<void> | void;
    };
    const el = document.documentElement as FsEl;
    const req = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen || el.mozRequestFullScreen;
    try {
      if (req) {
        const res = req.call(el);
        if (res && typeof (res as Promise<void>).catch === 'function') {
          (res as Promise<void>).catch(() => {/* ignore */});
        }
      }
    } catch (e) { /* noop */ }

    return () => {
      document.body.classList.remove('no-select');
      type FsDoc = Document & {
        webkitExitFullscreen?: () => Promise<void> | void;
        msExitFullscreen?: () => Promise<void> | void;
        mozCancelFullScreen?: () => Promise<void> | void;
      };
      const d = document as FsDoc;
      const exit = document.exitFullscreen || d.webkitExitFullscreen || d.msExitFullscreen || d.mozCancelFullScreen;
      try {
        if (exit) {
          const res = exit.call(document);
          if (res && typeof (res as Promise<void>).catch === 'function') {
            (res as Promise<void>).catch(() => {/* ignore */});
          }
        }
      } catch (e) { /* noop */ }
    };
  }, []);
  const [currentStep, setCurrentStep] = useState<'story' | 'questions'>('story');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [startTime] = useState(Date.now());

  const handleStartQuestions = () => {
    setCurrentStep('questions');
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) return;

    const isCorrect = selectedAnswer === questions[currentQuestion].correctAnswer;
    const newAnswers = [...answers, selectedAnswer];
    setAnswers(newAnswers);

    if (isCorrect) {
      setScore(score + 1);
    }

    setShowResult(true);

    setTimeout(() => {
      if (currentQuestion + 1 >= questions.length) {
        const finalScore = score + (isCorrect ? 1 : 0);
        const percentage = Math.round((finalScore / questions.length) * 100);
        const timeSpentSeconds = Math.round((Date.now() - startTime) / 1000);
        onComplete(finalScore, percentage, newAnswers, timeSpentSeconds);
      } else {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      }
    }, 2500);
  };

  const resetActivity = () => {
    setCurrentStep('story');
    setCurrentQuestion(0);
    setShowResult(false);
    setScore(0);
    setAnswers([]);
  };

  if (currentStep === 'story') {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <Card className="learning-card">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-primary rounded-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-xl">{title}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted/50 p-6 rounded-lg">
              <h3 className="font-semibold text-lg mb-4 text-center">Basahin ang Kwento:</h3>
              <div className="mb-6 flex justify-center">
                <img 
                  src="https://res.cloudinary.com/danhaqwtq/image/upload/v1761669881/Untitled_design_8_nvdvrr.png" 
                  alt="Story illustration"
                  className="max-w-full h-auto rounded-lg"
                />
              </div>
              <div className="text-base leading-relaxed space-y-4">
                {story.split('\n').map((paragraph, index) => (
                  <p key={index} className="text-justify">
                    {paragraph.trim()}
                  </p>
                ))}
              </div>
            </div>

            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                Basahin nang mabuti ang kwento. <br></br>Pagkatapos ay sasagutan ninyo ang mga tanong tungkol dito.
              </p>
              <Button 
                variant="activity" 
                size="lg" 
                onClick={handleStartQuestions}
                className="btn-bounce"
              >
                Simulan ang mga Tanong
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const isCorrect = showResult && selectedAnswer === currentQ.correctAnswer;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="mb-4">
        <Button 
          variant="ghost" 
          onClick={() => setCurrentStep('story')}
          className="mb-2"
        >
          ← Bumalik sa Kwento
        </Button>
      </div>

      <Card className="learning-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Mga Tanong</CardTitle>
            <div className="text-sm text-muted-foreground">
              {currentQuestion + 1} of {questions.length}
            </div>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Story Preview */}
          <div className="bg-muted/30 p-4 rounded-lg">
            <div className="text-sm text-muted-foreground mb-2">Kwento:</div>
            <div className="text-sm line-clamp-3">
              {story}
            </div>
          </div>

          <div className="text-lg font-medium">
            {currentQ.question}
          </div>

          <div className="space-y-3">
            {currentQ.options.map((option, index) => {
              let buttonClass = "w-full justify-start text-left h-auto p-4 whitespace-normal";
              let variant: "outline" | "success" | "destructive" = "outline";

              if (showResult) {
                if (index === currentQ.correctAnswer) {
                  variant = "success";
                  buttonClass += " border-success bg-success-light";
                } else if (index === selectedAnswer && selectedAnswer !== currentQ.correctAnswer) {
                  variant = "destructive";
                  buttonClass += " border-destructive bg-destructive/10";
                }
              } else if (selectedAnswer === index) {
                buttonClass += " border-primary bg-primary/10";
              }

              return (
                <Button
                  key={index}
                  variant={variant}
                  className={buttonClass}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showResult}
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-bold">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="flex-1">{option}</span>
                    {showResult && index === currentQ.correctAnswer && (
                      <CheckCircle className="h-5 w-5 text-success" />
                    )}
                    {showResult && index === selectedAnswer && selectedAnswer !== currentQ.correctAnswer && (
                      <XCircle className="h-5 w-5 text-destructive" />
                    )}
                  </div>
                </Button>
              );
            })}
          </div>

          {showResult && (
            <div className={`p-4 rounded-lg ${isCorrect ? 'bg-success-light' : 'bg-destructive/10'}`}>
              <div className={`font-medium ${isCorrect ? 'text-success' : 'text-destructive'}`}>
                {isCorrect ? 'Tama! 🎉' : 'Mali 😔'}
              </div>
              {currentQ.explanation && (
                <div className="text-sm mt-2 text-muted-foreground">
                  {currentQ.explanation}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between">
            <Button variant="ghost" onClick={resetActivity}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Ulit-ulitin
            </Button>
            
            <Button 
              variant="activity" 
              onClick={handleSubmit}
              disabled={selectedAnswer === null || showResult}
              className="btn-bounce"
            >
              {currentQuestion + 1 >= questions.length ? 'Tapusin' : 'Susunod'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};