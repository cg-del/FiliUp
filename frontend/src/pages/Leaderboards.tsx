import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Trophy, Medal, Crown, User, Star } from 'lucide-react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { TeacherSidebar } from '../components/TeacherSidebar';
import ClassSelector from '../components/ClassSelector';
import { getClassInfo } from '@/constants/classData';

const Leaderboards = () => {
  const { user } = useAuth();
  const isTeacher = user?.type === 'teacher';
  
  // Mock leaderboard data for multiple classes
  const [allLeaderboardData] = useState({
    '3-matatag': [
      { id: 1, name: 'Maria Santos', points: 1050, stories: 10, quizzes: 14, rank: 1, avatar: 'MS' },
      { id: 4, name: 'Ana Rodriguez', points: 890, stories: 9, quizzes: 13, rank: 2, avatar: 'AR' },
      { id: 1, name: 'Juan Dela Cruz', points: 820, stories: 8, quizzes: 12, rank: 3, avatar: 'JD' },
      { id: 5, name: 'Carlos Lopez', points: 660, stories: 5, quizzes: 8, rank: 4, avatar: 'CL' },
      { id: 6, name: 'Luis Garcia', points: 590, stories: 4, quizzes: 7, rank: 5, avatar: 'LG' },
      { id: 7, name: 'Elena Torres', points: 520, stories: 6, quizzes: 6, rank: 6, avatar: 'ET' },
    ],
    '3-masigla': [
      { id: 6, name: 'Sofia Reyes', points: 1200, stories: 12, quizzes: 16, rank: 1, avatar: 'SR' },
      { id: 10, name: 'Camila Flores', points: 1100, stories: 11, quizzes: 15, rank: 2, avatar: 'CF' },
      { id: 8, name: 'Isabella Cruz', points: 980, stories: 10, quizzes: 14, rank: 3, avatar: 'IC' },
      { id: 7, name: 'Miguel Torres', points: 780, stories: 7, quizzes: 11, rank: 4, avatar: 'MT' },
      { id: 9, name: 'Diego Morales', points: 650, stories: 6, quizzes: 8, rank: 5, avatar: 'DM' },
    ],
    '3-mabini': [
      { id: 12, name: 'Valentina Lopez', points: 1150, stories: 11, quizzes: 15, rank: 1, avatar: 'VL' },
      { id: 14, name: 'Luna Martinez', points: 900, stories: 9, quizzes: 12, rank: 2, avatar: 'LM' },
      { id: 11, name: 'Gabriel Santos', points: 850, stories: 9, quizzes: 13, rank: 3, avatar: 'GS' },
      { id: 15, name: 'Mateo Gonzalez', points: 810, stories: 8, quizzes: 11, rank: 4, avatar: 'MG' },
      { id: 13, name: 'Sebastian Rivera', points: 720, stories: 7, quizzes: 10, rank: 5, avatar: 'SR' },
    ]
  });

  const [selectedClass, setSelectedClass] = useState(user?.classes?.[0] || '3-matatag');
  const leaderboardData = allLeaderboardData[selectedClass] || allLeaderboardData['3-matatag'];
  const selectedClassInfo = getClassInfo(selectedClass);

  const getPodiumPosition = (rank: number) => {
    switch (rank) {
      case 1: return { icon: Crown, color: 'text-yellow-500', bg: 'bg-gradient-to-br from-yellow-400 to-yellow-600', height: 'h-32' };
      case 2: return { icon: Trophy, color: 'text-gray-400', bg: 'bg-gradient-to-br from-gray-300 to-gray-500', height: 'h-24' };
      case 3: return { icon: Medal, color: 'text-amber-600', bg: 'bg-gradient-to-br from-amber-400 to-amber-600', height: 'h-16' };
      default: return { icon: Award, color: 'text-teal-500', bg: 'bg-gradient-to-br from-teal-400 to-teal-600', height: 'h-12' };
    }
  };

  const topThree = leaderboardData.slice(0, 3);
  const restOfStudents = leaderboardData.slice(3);

  if (!isTeacher) {
    // Student view without sidebar
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-teal-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-lg flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  Class Leaderboard
                </h1>
              </div>
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium">{user?.name}</span>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LeaderboardContent 
            topThree={topThree}
            restOfStudents={restOfStudents}
            selectedClassInfo={selectedClassInfo}
            selectedClass={selectedClass}
            getPodiumPosition={getPodiumPosition}
            isTeacher={false}
          />
        </div>
      </div>
    );
  }

  // Teacher view with sidebar
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <TeacherSidebar />
        <SidebarInset className="flex-1">
          <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-teal-100">
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center space-x-4">
                  <SidebarTrigger className="text-teal-600" />
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                      Class Leaderboards
                    </h1>
                    <p className="text-gray-600 text-sm">Track student achievements and progress</p>
                  </div>
                </div>
              </div>
            </header>

            <div className="p-6">
              {/* Class Selector for teachers with multiple classes */}
              {user?.classes && user.classes.length > 1 && (
                <div className="mb-8">
                  <ClassSelector
                    classes={user.classes}
                    selectedClass={selectedClass}
                    onClassChange={setSelectedClass}
                    classData={{}}
                  />
                </div>
              )}

              <LeaderboardContent 
                topThree={topThree}
                restOfStudents={restOfStudents}
                selectedClassInfo={selectedClassInfo}
                selectedClass={selectedClass}
                getPodiumPosition={getPodiumPosition}
                isTeacher={true}
              />
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

// Separate component for the leaderboard content
const LeaderboardContent = ({ topThree, restOfStudents, selectedClassInfo, selectedClass, getPodiumPosition, isTeacher }) => {
  return (
    <>
      {/* Class Header */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Trophy className="h-8 w-8 text-yellow-500" />
          <h2 className="text-3xl font-bold text-gray-900">
            {selectedClassInfo?.name || selectedClass} Leaderboard
          </h2>
          <Trophy className="h-8 w-8 text-yellow-500" />
        </div>
        <p className="text-gray-600">
          {isTeacher ? 'Monitor your students\' achievements and celebrate their success!' : 'See how you rank among your classmates!'}
        </p>
      </div>

      {/* Podium Section */}
      <Card className="mb-8 bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center space-x-2">
            <Award className="h-6 w-6 text-teal-600" />
            <span>Top Performers</span>
          </CardTitle>
          <CardDescription>The leading students in your class</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-end space-x-8 mb-6">
            {/* Reorder for podium effect: 2nd, 1st, 3rd */}
            {topThree.length > 1 && (
              <PodiumStudent student={topThree[1]} position={getPodiumPosition(2)} />
            )}
            {topThree.length > 0 && (
              <PodiumStudent student={topThree[0]} position={getPodiumPosition(1)} />
            )}
            {topThree.length > 2 && (
              <PodiumStudent student={topThree[2]} position={getPodiumPosition(3)} />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Rest of Students */}
      {restOfStudents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Other Students</CardTitle>
            <CardDescription>Keep up the great work!</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {restOfStudents.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center font-bold">
                        {student.rank}
                      </Badge>
                      <div className="w-12 h-12 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full flex items-center justify-center text-white font-semibold">
                        {student.avatar}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{student.name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{student.stories} stories</span>
                        <span>{student.quizzes} quizzes</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <span className="text-xl font-bold text-teal-600">{student.points}</span>
                    <span className="text-sm text-gray-500">pts</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

// Podium student component
const PodiumStudent = ({ student, position }) => {
  const { icon: Icon, color, bg, height } = position;
  
  return (
    <div className="flex flex-col items-center">
      <div className="text-center mb-4">
        <div className="w-16 h-16 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full flex items-center justify-center text-white font-bold text-lg mb-2 mx-auto">
          {student.avatar}
        </div>
        <h3 className="font-semibold text-gray-900 text-sm">{student.name}</h3>
        <div className="flex items-center justify-center space-x-1 mt-1">
          <Star className="h-4 w-4 text-yellow-500" />
          <span className="font-bold text-teal-600">{student.points}</span>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {student.stories}S • {student.quizzes}Q
        </div>
      </div>
      <div className={`${bg} ${height} w-24 rounded-t-lg flex flex-col items-center justify-start pt-4 text-white relative`}>
        <Icon className={`h-8 w-8 ${color} mb-2`} />
        <Badge className="bg-white text-gray-900 font-bold">
          #{student.rank}
        </Badge>
      </div>
    </div>
  );
};

export default Leaderboards;
