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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <InlineLoading message="Loading leaderboard data..." size="sm" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Class Leaderboard</h3>
        <p className="text-sm text-gray-600 mt-1">Rankings based on overall performance</p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
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
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
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
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lessons
                </th>
              )}
             
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedRankings.map((student) => (
              <tr 
                key={student.id}
                className={`hover:bg-gray-50 ${
                  currentStudentId === student.id 
                    ? 'bg-blue-50 border-l-4 border-blue-500' 
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
                      <div className="text-sm font-medium text-gray-900">
                        {currentStudentId === student.id ? 'You' : student.name}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-900">
                    {student.totalScore.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">points</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-gray-900">
                      {student.averageScore.toFixed(1)}%
                    </div>
                    <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${Math.min(student.averageScore, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {student.activitiesCompleted}
                  </div>
                  <div className="text-xs text-gray-500">completed</div>
                </td>
                {showFullDetails && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {student.lessonsCompleted}
                    </div>
                    <div className="text-xs text-gray-500">lessons</div>
                  </td>
                )}
              
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rankings.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-2">📊</div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No rankings yet</h3>
          <p className="text-gray-500">Complete some activities to see the leaderboard!</p>
        </div>
      )}
    </div>
  );
};

export default LeaderboardTable;
