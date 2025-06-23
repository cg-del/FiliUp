import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, Loader2, Copy, Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { enrollmentService } from '@/lib/services/enrollmentService';
import { enrollmentWebSocketService, type EnrollmentWebSocketMessage } from '@/lib/services/enrollmentWebSocketService';

interface StudentEnrollmentProps {
  onEnrollmentSuccess?: () => void;
}

const StudentEnrollment = ({ onEnrollmentSuccess }: StudentEnrollmentProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [classCode, setClassCode] = useState('');
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [webSocketConnected, setWebSocketConnected] = useState(false);
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  // Enrollment status state
  const [enrollmentStatus, setEnrollmentStatus] = useState<string | null>(null);
  const [statusLoading, setStatusLoading] = useState<boolean>(true);

  // Debug info
  const getDebugInfo = () => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    let tokenInfo = null;
    
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        tokenInfo = {
          subject: payload.sub,
          role: payload.role,
          expiry: new Date(payload.exp * 1000).toLocaleString(),
          isExpired: payload.exp * 1000 < Date.now()
        };
      } catch (e) {
        tokenInfo = { error: 'Invalid token format' };
      }
    }
    
    return {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      tokenInfo,
      user,
      localStorage: {
        accessToken: !!localStorage.getItem('accessToken'),
        token: !!localStorage.getItem('token'),
        refreshToken: !!localStorage.getItem('refreshToken'),
        filiup_user: !!localStorage.getItem('filiup_user')
      }
    };
  };

  useEffect(() => {
    const fetchEnrollmentStatus = async () => {
      if (!user?.id) {
        setEnrollmentStatus(null);
        setStatusLoading(false);
        return;
      }
      setStatusLoading(true);
      try {
        const res = await enrollmentService.getEnrollmentStatusByStudentId(user.id);
        setEnrollmentStatus(res.data?.status || null);
      } catch (err) {
        setEnrollmentStatus(null);
      } finally {
        setStatusLoading(false);
      }
    };
    fetchEnrollmentStatus();
    // Optionally, refetch on user change
  }, [user?.id]);


  // WebSocket message handler for students
  const handleWebSocketMessage = useCallback((message: EnrollmentWebSocketMessage) => {
    console.log('Student received enrollment WebSocket message:', message);
    
    switch (message.type) {
      case 'ENROLLMENT_ACCEPTED':
        toast({
          title: "🎉 Enrollment Approved!",
          description: message.message,
        });
        
        // Refresh or redirect to show the new class
        if (onEnrollmentSuccess) {
          onEnrollmentSuccess();
        } else {
          // Small delay to allow user to see the notification
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }
        break;
        
      case 'ENROLLMENT_REJECTED':
        toast({
          title: "Enrollment Rejected",
          description: message.message || "Your enrollment request was not approved.",
          variant: "destructive",
        });
        break;
        
      default:
        console.log('Unknown enrollment message type for student:', message.type);
    }
  }, [toast, onEnrollmentSuccess]);

  // Setup WebSocket connection for students
  useEffect(() => {
    const setupWebSocket = async () => {
      if (!user || user.type !== 'student') {
        return;
      }

      try {
        await enrollmentWebSocketService.connect(user.id, user.type);
        enrollmentWebSocketService.addMessageHandler(handleWebSocketMessage);
        setWebSocketConnected(true);
        console.log('Student enrollment WebSocket connected successfully');
      } catch (error) {
        console.warn('Student enrollment WebSocket connection failed:', error);
        setWebSocketConnected(false);
      }
    };

    setupWebSocket();

    // Cleanup on unmount
    return () => {
      if (webSocketConnected) {
        enrollmentWebSocketService.removeMessageHandler(handleWebSocketMessage);
        enrollmentWebSocketService.disconnect();
        setWebSocketConnected(false);
      }
    };
  }, [user, handleWebSocketMessage, webSocketConnected]);

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
        
        // Show additional message about WebSocket connectivity
        if (webSocketConnected) {
          setTimeout(() => {
            toast({
              title: "Stay tuned!",
              description: "You'll receive a real-time notification when your teacher reviews your request.",
            });
          }, 1500);
        }
        
        // Call the callback to refresh parent component
        if (onEnrollmentSuccess) {
          onEnrollmentSuccess();
        } else {
          // Fallback to reload if no callback provided
          window.location.reload();
        }
      }
    } catch (error: any) {
      console.error('Enrollment error:', error.response?.data);
      let errorMessage = "Failed to enroll in class. Please try again.";
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        }
      }
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

  if (statusLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600 mb-4" />
          <p className="text-gray-500">Checking enrollment status...</p>
        </CardContent>
      </Card>
    );
  }

  if (enrollmentStatus === 'pending') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="space-y-4 flex flex-col items-center justify-center py-12">
          {getStatusBadge()}
          <p className="text-lg font-semibold text-gray-700 text-center">Wait for the teacher to accept your request</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-5 w-5 text-blue-600" />
            <span>Join a Class</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowDebugInfo(!showDebugInfo)}
              className="text-gray-400 hover:text-gray-600"
              title="Toggle debug info"
            >
              <AlertCircle className="h-4 w-4" />
            </button>
            <div title={webSocketConnected ? "Real-time notifications active" : "Real-time notifications inactive"}>
              {webSocketConnected ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-gray-400" />
              )}
            </div>
          </div>
        </CardTitle>
        <CardDescription>
          Enter your teacher's class code to request enrollment
          {webSocketConnected && (
            <span className="text-green-600 ml-2">• Real-time updates enabled</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {showDebugInfo && (
          <div className="p-3 bg-gray-50 rounded-lg text-xs">
            <h4 className="font-medium mb-2">Debug Info:</h4>
            <pre className="whitespace-pre-wrap overflow-auto">
              {JSON.stringify(getDebugInfo(), null, 2)}
            </pre>
          </div>
        )}
        {getStatusBadge()}
        {user?.enrollmentStatus !== 'approved' && (
          <>
            <div className="space-y-2">
              <label htmlFor="classCode" className="text-sm font-medium">
                Class Code
              </label>
              <div className="flex space-x-2">
                <Input
                  placeholder="Enter class code"
                  value={classCode}
                  onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                  onKeyPress={(e) => e.key === 'Enter' && handleEnroll()}
                  disabled={isEnrolling}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyClassCode}
                  disabled={!classCode.trim()}
                  title="Copy class code"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Button 
              onClick={handleEnroll}
              disabled={isEnrolling || !classCode.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isEnrolling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting Request...
                </>
              ) : (
                'Request to Join Class'
              )}
            </Button>
          </>
        )}
        <div className="text-xs text-gray-500 mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="font-medium mb-2">How it works:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Enter the class code provided by your teacher</li>
            <li>Your enrollment request will be sent to the teacher</li>
            <li>Wait for teacher approval to access class content</li>
            {webSocketConnected && (
              <li className="text-green-600">✓ You'll get instant notifications when approved!</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentEnrollment;
