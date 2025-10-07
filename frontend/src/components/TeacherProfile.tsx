import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { PasswordResetDialog } from '@/components/PasswordResetDialog';

export const TeacherProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showReset, setShowReset] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border p-4">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Bumalik
          </Button>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-teal-cyan rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primary">{user?.name}</h1>
                <p className="text-muted-foreground">Teacher</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => setShowReset(true)}>Reset Password</Button>
              <Button variant="outline" onClick={logout}>Mag-logout</Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Card className="learning-card">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Full Name</div>
                <div className="font-semibold">{user?.name}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Email</div>
                <div className="font-semibold">{user?.email}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <PasswordResetDialog
        open={showReset}
        onOpenChange={setShowReset}
        onSuccess={() => { /* wrapper handles firstLogin flag elsewhere */ }}
      />
    </div>
  );
};
