import React, { useState, useEffect } from 'react';
import { studentAPI, LeaderboardResponse, StudentRankingDTO } from '../../lib/api';
import LeaderboardTable from './LeaderboardTable';

interface StudentLeaderboardProps {
  currentStudentId: string;
}

const StudentLeaderboard: React.FC<StudentLeaderboardProps> = ({ currentStudentId }) => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLeaderboard = async () => {
    try {
      setError(null);
      const data = await studentAPI.getLeaderboard();
      setLeaderboardData(data);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError('Failed to load leaderboard. Please try again.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchLeaderboard();
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const getMotivationalMessage = (currentRank?: StudentRankingDTO) => {
    if (!currentRank) return "Keep learning to join the leaderboard!";
    
    const rank = currentRank.rank;
    const totalStudents = leaderboardData?.sectionStats.totalStudents || 0;
    
    if (rank === 1) {
      return "🎉 Amazing! You're at the top of your class!";
    } else if (rank <= 3) {
      return "🌟 Excellent work! You're in the top 3!";
    } else if (rank <= Math.ceil(totalStudents * 0.25)) {
      return "💪 Great job! You're in the top 25%!";
    } else if (rank <= Math.ceil(totalStudents * 0.5)) {
      return "📈 Good progress! Keep it up!";
    } else {
      return "🚀 You can do it! Keep practicing to climb higher!";
    }
  };

  const getProgressToNext = (currentRank?: StudentRankingDTO) => {
    if (!currentRank || !leaderboardData) return null;
    
    const currentIndex = leaderboardData.rankings.findIndex(r => r.studentId === currentStudentId);
    if (currentIndex <= 0) return null;
    
    const nextStudent = leaderboardData.rankings[currentIndex - 1];
    const scoreDifference = nextStudent.totalScore - currentRank.totalScore;
    
    return {
      nextRank: nextStudent.rank,
      nextStudentName: nextStudent.studentName,
      scoreDifference
    };
  };

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Leaderboard</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchLeaderboard}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const progressToNext = getProgressToNext(leaderboardData?.currentStudentRank);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Class Leaderboard</h1>
          <p className="text-gray-600 mt-1">
            {leaderboardData?.sectionName || 'Your Section'} • Updated {leaderboardData?.lastUpdated ? new Date(leaderboardData.lastUpdated).toLocaleString() : 'recently'}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
        >
          <span className={refreshing ? 'animate-spin' : ''}>🔄</span>
          <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Personal Stats Card */}
      {leaderboardData?.currentStudentRank && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Your Performance</h2>
              <p className="text-blue-100 mb-4">{getMotivationalMessage(leaderboardData.currentStudentRank)}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/20 rounded-lg p-3">
                  <div className="text-2xl font-bold">{leaderboardData.currentStudentRank.rank}</div>
                  <div className="text-sm text-blue-100">Current Rank</div>
                </div>
                <div className="bg-white/20 rounded-lg p-3">
                  <div className="text-2xl font-bold">{leaderboardData.currentStudentRank.totalScore.toLocaleString()}</div>
                  <div className="text-sm text-blue-100">Total Score</div>
                </div>
                <div className="bg-white/20 rounded-lg p-3">
                  <div className="text-2xl font-bold">{leaderboardData.currentStudentRank.averagePercentage.toFixed(1)}%</div>
                  <div className="text-sm text-blue-100">Average</div>
                </div>
                <div className="bg-white/20 rounded-lg p-3">
                  <div className="text-2xl font-bold">{leaderboardData.currentStudentRank.completedActivities}</div>
                  <div className="text-sm text-blue-100">Activities</div>
                </div>
              </div>
            </div>
            
            {leaderboardData.currentStudentRank.rank <= 3 && (
              <div className="text-6xl">
                {leaderboardData.currentStudentRank.rank === 1 ? '🥇' : 
                 leaderboardData.currentStudentRank.rank === 2 ? '🥈' : '🥉'}
              </div>
            )}
          </div>

          {/* Progress to Next Rank */}
          {progressToNext && (
            <div className="mt-4 bg-white/20 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Next Goal</h3>
              <p className="text-blue-100">
                Score <span className="font-bold">{progressToNext.scoreDifference}</span> more points to reach rank #{progressToNext.nextRank}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Section Stats */}
      {leaderboardData?.sectionStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-gray-900">{leaderboardData.sectionStats.totalStudents}</div>
            <div className="text-sm text-gray-600">Total Students</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-gray-900">{leaderboardData.sectionStats.averageScore.toFixed(0)}</div>
            <div className="text-sm text-gray-600">Class Average Score</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-gray-900">{leaderboardData.sectionStats.topScore.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Highest Score</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-gray-900">{leaderboardData.sectionStats.averageCompletion.toFixed(1)}%</div>
            <div className="text-sm text-gray-600">Avg Completion</div>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <LeaderboardTable
        rankings={leaderboardData?.rankings || []}
        currentStudentId={currentStudentId}
        isLoading={isLoading}
      />

      {/* Encouragement Section */}
      <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-lg p-6 text-white text-center">
        <h3 className="text-xl font-bold mb-2">Keep Learning! 🌟</h3>
        <p className="text-green-100 mb-4">
          Complete more activities and lessons to improve your ranking and earn badges!
        </p>
        <div className="flex justify-center space-x-4 text-sm">
          <div className="bg-white/20 rounded-lg px-3 py-2">
            <span className="font-semibold">💡 Tip:</span> Focus on accuracy to boost your average percentage
          </div>
          <div className="bg-white/20 rounded-lg px-3 py-2">
            <span className="font-semibold">🎯 Goal:</span> Complete all activities in each lesson
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentLeaderboard;
