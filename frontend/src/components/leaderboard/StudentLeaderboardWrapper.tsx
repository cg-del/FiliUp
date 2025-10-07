import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { StudentLeaderboard } from '../StudentLeaderboard';

const StudentLeaderboardWrapper: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Please log in to view the leaderboard</p>
        </div>
      </div>
    );
  }

  return <StudentLeaderboard />;
};

export default StudentLeaderboardWrapper;
