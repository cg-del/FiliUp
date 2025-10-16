import React, { useState } from 'react';
import { StudentRankingResponse } from '../../lib/api';
import { InlineLoading } from '@/components/ui/loading-spinner';

interface LeaderboardTableProps {
  rankings: StudentRankingResponse[];
  currentStudentId?: string;
  showFullDetails?: boolean;
  isLoading?: boolean;
}

const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  rankings,
  currentStudentId,
  showFullDetails = false,
  isLoading = false
}) => {
  const [sortBy, setSortBy] = useState<'rank' | 'score' | 'percentage' | 'activities'>('rank');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleSort = (column: 'rank' | 'score' | 'percentage' | 'activities') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder(column === 'rank' ? 'asc' : 'desc');
    }
  };

  const sortedRankings = [...rankings].sort((a, b) => {
    let aValue: number, bValue: number;
    
    switch (sortBy) {
      case 'rank':
        aValue = a.rank;
        bValue = b.rank;
        break;
      case 'score':
        aValue = a.totalScore;
        bValue = b.totalScore;
        break;
      case 'percentage':
        aValue = a.averageScore;
        bValue = b.averageScore;
        break;
      case 'activities':
        aValue = a.activitiesCompleted;
        bValue = b.activitiesCompleted;
        break;
      default:
        aValue = a.rank;
        bValue = b.rank;
    }

    return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
  };

  const getBadgeColor = (badge?: string) => {
    switch (badge) {
      case 'Top Performer':
        return 'bg-yellow-100 text-yellow-800';
      case 'Most Improved':
        return 'bg-green-100 text-green-800';
      case 'Most Active':
        return 'bg-blue-100 text-blue-800';
      case 'Consistent':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-lg shadow-sm border border-border p-6">
        <InlineLoading message="Loading leaderboard data..." size="sm" />
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
      <div className="px-6 py-4 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">Class Leaderboard</h3>
        <p className="text-sm text-muted-foreground mt-1">Rankings based on overall performance</p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted/50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted"
                onClick={() => handleSort('rank')}
              >
                <div className="flex items-center space-x-1">
                  <span>Rank</span>
                  {sortBy === 'rank' && (
                    <span className="text-blue-500">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Student
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted"
                onClick={() => handleSort('score')}
              >
                <div className="flex items-center space-x-1">
                  <span>Total Score</span>
                  {sortBy === 'score' && (
                    <span className="text-blue-500">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted"
                onClick={() => handleSort('percentage')}
              >
                <div className="flex items-center space-x-1">
                  <span>Avg %</span>
                  {sortBy === 'percentage' && (
                    <span className="text-blue-500">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted"
                onClick={() => handleSort('activities')}
              >
                <div className="flex items-center space-x-1">
                  <span>Activities</span>
                  {sortBy === 'activities' && (
                    <span className="text-blue-500">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              {showFullDetails && (
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Lessons
                </th>
              )}
             
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border">
            {sortedRankings.map((student) => (
              <tr 
                key={student.id}
                className={`hover:bg-muted/50 ${
                  currentStudentId === student.id 
                    ? 'bg-primary/10 border-l-4 border-primary' 
                    : ''
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="text-2xl mr-2">{getRankIcon(student.rank)}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {student.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-foreground">
                        {currentStudentId === student.id ? 'You' : student.name}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-foreground">
                    {student.totalScore.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">points</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-foreground">
                      {student.averageScore.toFixed(1)}%
                    </div>
                    <div className="ml-2 w-16 bg-muted rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${Math.min(student.averageScore, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-foreground">
                    {student.activitiesCompleted}
                  </div>
                  <div className="text-xs text-muted-foreground">completed</div>
                </td>
                {showFullDetails && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-foreground">
                      {student.lessonsCompleted}
                    </div>
                    <div className="text-xs text-muted-foreground">lessons</div>
                  </td>
                )}
              
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rankings.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground text-lg mb-2">📊</div>
          <h3 className="text-lg font-medium text-foreground mb-1">No rankings yet</h3>
          <p className="text-muted-foreground">Complete some activities to see the leaderboard!</p>
        </div>
      )}
    </div>
  );
};

export default LeaderboardTable;
