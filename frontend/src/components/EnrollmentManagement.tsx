
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Check, X, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EnrollmentManagementProps {
  selectedClass: string;
}

const EnrollmentManagement = ({ selectedClass }: EnrollmentManagementProps) => {
  const { approveEnrollment, rejectEnrollment, getEnrollmentRequests } = useAuth();
  const { toast } = useToast();
  const [processingRequests, setProcessingRequests] = useState<Set<string>>(new Set());

  const enrollmentRequests = getEnrollmentRequests(selectedClass);

  const handleApprove = async (requestId: string) => {
    setProcessingRequests(prev => new Set([...prev, requestId]));
    
    const success = await approveEnrollment(requestId);
    
    if (success) {
      toast({
        title: "Student Approved!",
        description: "The student can now access the class content.",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to approve enrollment request.",
        variant: "destructive",
      });
    }
    
    setProcessingRequests(prev => {
      const newSet = new Set(prev);
      newSet.delete(requestId);
      return newSet;
    });
  };

  const handleReject = async (requestId: string) => {
    setProcessingRequests(prev => new Set([...prev, requestId]));
    
    const success = await rejectEnrollment(requestId);
    
    if (success) {
      toast({
        title: "Enrollment Rejected",
        description: "The student's enrollment request has been rejected.",
      });
    } else {
      toast({
        title: "Error", 
        description: "Failed to reject enrollment request.",
        variant: "destructive",
      });
    }
    
    setProcessingRequests(prev => {
      const newSet = new Set(prev);
      newSet.delete(requestId);
      return newSet;
    });
  };

  if (enrollmentRequests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UserPlus className="h-5 w-5 text-teal-600" />
            <span>Enrollment Requests</span>
          </CardTitle>
          <CardDescription>
            Manage student enrollment requests for this class
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No pending enrollment requests</p>
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
          <Badge variant="secondary">{enrollmentRequests.length} pending</Badge>
        </CardTitle>
        <CardDescription>
          Review and approve student enrollment requests
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {enrollmentRequests.map((request) => (
            <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full flex items-center justify-center text-white font-semibold">
                  {request.studentName.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{request.studentName}</h3>
                  <p className="text-sm text-gray-500">{request.studentEmail}</p>
                  <p className="text-xs text-gray-400">
                    Requested: {new Date(request.requestDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  onClick={() => handleApprove(request.id)}
                  disabled={processingRequests.has(request.id)}
                  className="bg-teal-500 hover:bg-teal-600 text-white"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleReject(request.id)}
                  disabled={processingRequests.has(request.id)}
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
