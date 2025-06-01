import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Trophy, Medal, Award, Star, ArrowLeft } from 'lucide-react';

export default function StudentLeaderboard() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { classId } = useParams();
  
  // Sample student data - in a real app, this would come from an API
  const [students] = useState([
    { id: 1, name: "Emma Johnson", score: 2450, avatar: "/placeholder.svg?height=80&width=80", rank: 1 },
    { id: 2, name: "Alex Chen", score: 2380, avatar: "/placeholder.svg?height=80&width=80", rank: 2 },
    { id: 3, name: "Sofia Rodriguez", score: 2320, avatar: "/placeholder.svg?height=80&width=80", rank: 3 },
    { id: 4, name: "Marcus Thompson", score: 2180, avatar: "/placeholder.svg?height=60&width=60", rank: 4 },
    { id: 5, name: "Lily Wang", score: 2150, avatar: "/placeholder.svg?height=60&width=60", rank: 5 },
    { id: 6, name: "David Kim", score: 2090, avatar: "/placeholder.svg?height=60&width=60", rank: 6 },
    { id: 7, name: "Isabella Brown", score: 2020, avatar: "/placeholder.svg?height=60&width=60", rank: 7 },
    { id: 8, name: "Ryan O'Connor", score: 1980, avatar: "/placeholder.svg?height=60&width=60", rank: 8 },
  ]);

  const topThree = students.slice(0, 3);
  const otherStudents = students.slice(3);

  // Check if user is authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <Star className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPodiumHeight = (rank) => {
    switch (rank) {
      case 1:
        return "h-32";
      case 2:
        return "h-24";
      case 3:
        return "h-20";
      default:
        return "h-16";
    }
  };

  const getPodiumColor = (rank) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-t from-yellow-400 to-yellow-300";
      case 2:
        return "bg-gradient-to-t from-gray-400 to-gray-300";
      case 3:
        return "bg-gradient-to-t from-amber-600 to-amber-500";
      default:
        return "bg-gray-200";
    }
  };

  const handleGoBack = () => {
    if (classId) {
      navigate(`/teacher/class/${classId}/lessons`);
    } else {
      navigate(user?.userRole === 'TEACHER' ? '/teacher' : '/home');
    }
  };

  // Reorder for podium display: 2nd, 1st, 3rd
  const podiumOrder = [topThree[1], topThree[0], topThree[2]];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" className="rounded-full" onClick={handleGoBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Student Leaderboard</h1>
            <p className="text-gray-600 dark:text-gray-300">Top performers this semester</p>
          </div>
        </div>

        {/* Podium Section */}
        <Card className="overflow-hidden">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white">Top 3 Students</CardTitle>
          </CardHeader>
          <CardContent className="pb-0">
            <div className="flex items-end justify-center gap-4 mb-8">
              {podiumOrder.map((student, index) => {
                if (!student) return null; // Handle case where there might be fewer than 3 students
                
                const actualRank = student.rank;

                return (
                  <div key={student.id} className="flex flex-col items-center">
                    {/* Student Info */}
                    <div className="mb-4 text-center">
                      <Avatar className="h-20 w-20 mx-auto mb-2 ring-4 ring-white shadow-lg">
                        <AvatarImage src={student.avatar || "/placeholder.svg"} alt={student.name} />
                        <AvatarFallback className="text-lg font-semibold">
                          {student.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{student.name}</h3>
                      <p className="text-lg font-bold text-gray-700 dark:text-gray-300">{student.score} pts</p>
                      <Badge variant="secondary" className="mt-1">
                        {getRankIcon(actualRank)}
                        <span className="ml-1">#{actualRank}</span>
                      </Badge>
                    </div>

                    {/* Podium */}
                    <div
                      className={`w-24 ${getPodiumHeight(actualRank)} ${getPodiumColor(actualRank)} rounded-t-lg border-2 border-white shadow-lg flex items-center justify-center`}
                    >
                      <span className="text-white font-bold text-2xl">#{actualRank}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Other Rankings */}
        {otherStudents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-800 dark:text-white">Other Rankings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {otherStudents.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="w-12 justify-center">
                      #{student.rank}
                    </Badge>
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={student.avatar || "/placeholder.svg"} alt={student.name} />
                      <AvatarFallback>
                        {student.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{student.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Student</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-gray-900 dark:text-white">{student.score}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">points</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Top Score</h3>
              <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                {students.length > 0 ? students[0].score.toLocaleString() : '0'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Star className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Average Score</h3>
              <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                {students.length > 0 ? Math.round(students.reduce((sum, student) => sum + student.score, 0) / students.length).toLocaleString() : '0'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Award className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Total Students</h3>
              <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{students.length}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
