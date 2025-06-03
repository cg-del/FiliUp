import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, Loader2, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { enrollmentService } from '@/lib/services/enrollmentService';

interface StudentEnrollmentProps {
  onEnrollmentSuccess?: () => void;
}

const StudentEnrollment = ({ onEnrollmentSuccess }: StudentEnrollmentProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [classCode, setClassCode] = useState('');
  const [isEnrolling, setIsEnrolling] = useState(false);

  const handleEnroll = async () => {
    if (!classCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a class code",
        variant: "destructive",
      });
      return;
    }

    setIsEnrolling(true);
    
    try {
      const response = await enrollmentService.enrollInClass(classCode.trim());
      
      if (response.data) {
        toast({
          title: "Success!",
          description: response.data.message || "Enrollment request submitted successfully!",
        });
        setClassCode('');
        
        // Call the callback to refresh parent component
        if (onEnrollmentSuccess) {
          onEnrollmentSuccess();
        } else {
          // Fallback to reload if no callback provided
          window.location.reload();
        }
      }
    } catch (error: any) {
      console.error('Enrollment error:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          "Failed to enroll in class. Please try again.";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
    
    setIsEnrolling(false);
  };

  const handleCopyClassCode = () => {
    navigator.clipboard.writeText(classCode);
    toast({
      title: "Copied!",
      description: "Class code copied to clipboard",
    });
  };

  const getStatusBadge = () => {
    switch (user?.enrollmentStatus) {
      case 'pending':
        return <Badge variant="secondary">Enrollment Pending</Badge>;
      case 'approved':
        return <Badge className="bg-teal-500 text-white">Enrolled</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Enrollment Rejected</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <GraduationCap className="h-5 w-5 text-teal-600" />
          <span>Enroll in Class</span>
        </CardTitle>
        <CardDescription>
          Enter your class code to join your teacher's class
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {getStatusBadge()}
        
        {user?.enrollmentStatus !== 'approved' && (
          <>
            <div className="space-y-2">
              <label htmlFor="classCode" className="text-sm font-medium">
                Class Code
              </label>
              <div className="flex space-x-2">
                <Input
                  id="classCode"
                  placeholder="e.g., Z309THUA"
                  value={classCode}
                  onChange={(e) => setClassCode(e.target.value)}
                  disabled={isEnrolling || user?.enrollmentStatus === 'pending'}
                  className="flex-1"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyClassCode}
                  disabled={!classCode.trim()}
                  className="px-3"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <Button 
              onClick={handleEnroll}
              disabled={isEnrolling || user?.enrollmentStatus === 'pending'}
              className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
            >
              {isEnrolling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {user?.enrollmentStatus === 'pending' ? 'Request Pending' : 'Enroll Now'}
            </Button>
          </>
        )}
        
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Ask your teacher for the class code</p>
          <p>• Wait for teacher approval after submitting</p>
          <p>• You'll be able to access stories and quizzes once approved</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentEnrollment;
