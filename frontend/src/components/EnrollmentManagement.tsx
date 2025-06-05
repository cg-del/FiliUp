import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Check, X, Users, Wifi, WifiOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { enrollmentService, type PendingEnrollment } from '@/lib/services/enrollmentService';
import { enrollmentWebSocketService, type EnrollmentWebSocketMessage } from '@/lib/services/enrollmentWebSocketService';

interface EnrollmentManagementProps {
  selectedClassId: string;
}

const EnrollmentManagement = ({ selectedClassId }: EnrollmentManagementProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [pendingEnrollments, setPendingEnrollments] = useState<PendingEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingRequests, setProcessingRequests] = useState<Set<string>>(new Set());
  const [webSocketConnected, setWebSocketConnected] = useState(false);

  // Helper function to check if the class ID is a valid UUID (real class) vs mock data
  const isValidClassId = (classId: string): boolean => {
    // UUID format check - real class IDs are UUIDs, mock ones are like "3-matatag"
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(classId);
  };

  // WebSocket message handler
  const handleWebSocketMessage = useCallback((message: EnrollmentWebSocketMessage) => {
    console.log('Received enrollment WebSocket message:', message);
    
    // Only handle messages for the currently selected class
    if (message.classId !== selectedClassId) {
      return;
    }

    switch (message.type) {
      case 'NEW_ENROLLMENT':
        if (message.enrollment) {
          // Add new enrollment to the list
          setPendingEnrollments(prev => {
            // Check if enrollment already exists to avoid duplicates
            const exists = prev.some(e => e.id === message.enrollment!.id);
            if (!exists) {
              toast({
                title: "New Enrollment Request",
                description: message.message,
              });
              return [message.enrollment!, ...prev];
            }
            return prev;
          });
        }
        break;
        
      case 'ENROLLMENT_ACCEPTED':
        // This would be handled if we want to show notifications about accepted enrollments
        // For now, we'll just log it
        console.log('Enrollment accepted:', message);
        break;
        
      default:
        console.log('Unknown enrollment message type:', message.type);
    }
  }, [selectedClassId, toast]);

  // Setup WebSocket connection for teachers
  useEffect(() => {
    const setupWebSocket = async () => {
      if (!user || user.type !== 'teacher') {
        return;
      }

      try {
        await enrollmentWebSocketService.connect(user.id, user.type);
        enrollmentWebSocketService.addMessageHandler(handleWebSocketMessage);
        setWebSocketConnected(true);
        console.log('Enrollment WebSocket connected successfully');
      } catch (error) {
        console.warn('Enrollment WebSocket connection failed:', error);
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

  // Fetch pending enrollments when selectedClassId changes
  useEffect(() => {
    const fetchPendingEnrollments = async () => {
      if (!selectedClassId) {
        setLoading(false);
        return;
      }

      // Check if the selected class ID is valid (not mock data)
      if (!isValidClassId(selectedClassId)) {
        console.log('Selected class is mock data, skipping API call:', selectedClassId);
        setPendingEnrollments([]);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const response = await enrollmentService.getPendingEnrollmentsByClassId(selectedClassId);
        if (response.data) {
          setPendingEnrollments(response.data);
        }
      } catch (error) {
        console.error('Error fetching pending enrollments:', error);
        toast({
          title: "Error",
          description: "Failed to load enrollment requests.",
          variant: "destructive",
        });
        setPendingEnrollments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingEnrollments();
  }, [selectedClassId, toast]);

  const handleApprove = async (enrollment: PendingEnrollment) => {
    setProcessingRequests(prev => new Set([...prev, enrollment.id]));
    
    try {
      await enrollmentService.approveEnrollment(enrollment.classCode, enrollment.userId);
      
      // Remove the approved enrollment from the list
      setPendingEnrollments(prev => prev.filter(e => e.id !== enrollment.id));
      
      toast({
        title: "Student Approved!",
        description: `${enrollment.studentName} can now access the class content.`,
      });
    } catch (error) {
      console.error('Error approving enrollment:', error);
      toast({
        title: "Error",
        description: "Failed to approve enrollment request.",
        variant: "destructive",
      });
    }
    
    setProcessingRequests(prev => {
      const newSet = new Set(prev);
      newSet.delete(enrollment.id);
      return newSet;
    });
  };

  const handleReject = async (enrollment: PendingEnrollment) => {
    setProcessingRequests(prev => new Set([...prev, enrollment.id]));
    
    try {
      // Note: You may need to add a reject endpoint to the backend
      // For now, we'll just remove it from the local state
      setPendingEnrollments(prev => prev.filter(e => e.id !== enrollment.id));
      
      toast({
        title: "Enrollment Rejected",
        description: `${enrollment.studentName}'s enrollment request has been rejected.`,
      });
    } catch (error) {
      console.error('Error rejecting enrollment:', error);
      toast({
        title: "Error", 
        description: "Failed to reject enrollment request.",
        variant: "destructive",
      });
    }
    
    setProcessingRequests(prev => {
      const newSet = new Set(prev);
      newSet.delete(enrollment.id);
      return newSet;
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <UserPlus className="h-5 w-5 text-teal-600" />
              <span>Enrollment Requests</span>
            </div>
            <div className="flex items-center space-x-2" title={webSocketConnected ? "Real-time updates active" : "Real-time updates inactive"}>
              {webSocketConnected ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-gray-400" />
              )}
            </div>
          </CardTitle>
          <CardDescription>
            Manage student enrollment requests for this class
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading enrollment requests...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show message if no valid class is selected or if using mock data
  if (!selectedClassId || !isValidClassId(selectedClassId)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <UserPlus className="h-5 w-5 text-teal-600" />
              <span>Enrollment Requests</span>
            </div>
            <div className="flex items-center space-x-2" title={webSocketConnected ? "Real-time updates active" : "Real-time updates inactive"}>
              {webSocketConnected ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-gray-400" />
              )}
            </div>
          </CardTitle>
          <CardDescription>
            Manage student enrollment requests for this class
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Please select a valid class to view enrollment requests</p>
            <p className="text-sm mt-2">Create a new class or select an existing one to manage enrollments</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (pendingEnrollments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <UserPlus className="h-5 w-5 text-teal-600" />
              <span>Enrollment Requests</span>
            </div>
            <div className="flex items-center space-x-2" title={webSocketConnected ? "Real-time updates active" : "Real-time updates inactive"}>
              {webSocketConnected ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-gray-400" />
              )}
            </div>
          </CardTitle>
          <CardDescription>
            Manage student enrollment requests for this class
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No pending enrollment requests</p>
            {webSocketConnected && (
              <p className="text-sm mt-2 text-teal-600">🔄 Real-time updates are active</p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <UserPlus className="h-5 w-5 text-teal-600" />
            <span>Enrollment Requests</span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">{pendingEnrollments.length} pending</Badge>
            <div title={webSocketConnected ? "Real-time updates active" : "Real-time updates inactive"}>
              {webSocketConnected ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-gray-400" />
              )}
            </div>
          </div>
        </CardTitle>
        <CardDescription>
          Review and approve student enrollment requests
          {webSocketConnected && (
            <span className="text-teal-600 ml-2">• Live updates enabled</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pendingEnrollments.map((enrollment) => (
            <div key={enrollment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full flex items-center justify-center text-white font-semibold">
                  {enrollment.studentName.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{enrollment.studentName}</h3>
                  <p className="text-sm text-gray-500">{enrollment.studentEmail}</p>
                  <p className="text-xs text-gray-400">
                    Requested: {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                  </p>
                 
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  onClick={() => handleApprove(enrollment)}
                  disabled={processingRequests.has(enrollment.id)}
                  className="bg-teal-500 hover:bg-teal-600 text-white"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleReject(enrollment)}
                  disabled={processingRequests.has(enrollment.id)}
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  <X className="h-4 w-4 mr-1" />
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnrollmentManagement;
