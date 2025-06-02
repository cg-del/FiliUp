import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Award, User, Play, Star } from 'lucide-react';
import StudentEnrollment from '../components/StudentEnrollment';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const [userProgress] = useState({
    totalStories: 12,
    completedStories: 7,
    totalQuizzes: 15,
    completedQuizzes: 9,
    points: 850,
    level: 3,
    badges: [
      { id: 1, name: 'First Story', icon: '📖', earned: true },
      { id: 2, name: 'Quiz Master', icon: '🎯', earned: true },
      { id: 3, name: 'Story Explorer', icon: '🗺️', earned: true },
      { id: 4, name: 'Fast Learner', icon: '⚡', earned: false },
      { id: 5, name: 'Perfect Score', icon: '💯', earned: false },
    ]
  });

  const stories = [
    { id: 1, title: 'Ang Matalinong Langgam', difficulty: 'Easy', completed: true, stars: 3 },
    { id: 2, title: 'Ang Masipag na Bubuyog', difficulty: 'Easy', completed: true, stars: 2 },
    { id: 3, title: 'Ang Bahay ni Lola', difficulty: 'Medium', completed: true, stars: 3 },
    { id: 4, title: 'Ang Pamilyang Masaya', difficulty: 'Medium', completed: false, stars: 0 },
    { id: 5, title: 'Ang Pagkakaibigan', difficulty: 'Hard', completed: false, stars: 0 },
  ];

  // If student is not enrolled or enrollment is pending, show enrollment form
  if (user?.enrollmentStatus !== 'approved') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-teal-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  FiliUp
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <Link to="/leaderboards">
                  <Button variant="outline" className="text-teal-600 border-teal-200 hover:bg-teal-50">
                    Leaderboard
                  </Button>
                </Link>
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-medium">{user?.name}</span>
                </div>
                <Button variant="outline" onClick={logout}>
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Kumusta, {user?.name}! 👋
            </h1>
            <p className="text-gray-600">
              {user?.enrollmentStatus === 'pending' 
                ? 'Your enrollment request is pending teacher approval.' 
                : 'Join your class to start your Filipino learning journey!'}
            </p>
          </div>

          <StudentEnrollment />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-teal-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                FiliUp
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/leaderboards">
                <Button variant="outline" className="text-teal-600 border-teal-200 hover:bg-teal-50">
                  Leaderboard
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium">{user?.name}</span>
              </div>
              <Button variant="outline" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Kumusta, {user?.name}! 👋
          </h1>
          <p className="text-gray-600">Ready na ba kayong mag-explore ng mga bagong kwento?</p>
        </div>

        {/* Progress Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-teal-400 to-cyan-500 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-teal-100">Total Points</p>
                  <p className="text-2xl font-bold">{userProgress.points}</p>
                </div>
                <Star className="h-8 w-8 text-teal-100" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-cyan-400 to-teal-500 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-cyan-100">Level</p>
                  <p className="text-2xl font-bold">{userProgress.level}</p>
                </div>
                <Award className="h-8 w-8 text-cyan-100" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-teal-500 to-cyan-400 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-teal-100">Stories Done</p>
                  <p className="text-2xl font-bold">{userProgress.completedStories}/{userProgress.totalStories}</p>
                </div>
                <BookOpen className="h-8 w-8 text-teal-100" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-cyan-500 to-teal-400 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-cyan-100">Quiz Score</p>
                  <p className="text-2xl font-bold">{userProgress.completedQuizzes}/{userProgress.totalQuizzes}</p>
                </div>
                <Play className="h-8 w-8 text-cyan-100" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Stories Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5" />
                  <span>Mga Kwento</span>
                </CardTitle>
                <CardDescription>
                  Basahin ang mga kwento at sagutin ang mga tanong para makakuha ng points!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stories.map((story) => (
                    <div key={story.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          story.completed 
                            ? 'bg-teal-100 text-teal-600' 
                            : 'bg-gray-200 text-gray-500'
                        }`}>
                          <BookOpen className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{story.title}</h3>
                          <div className="flex items-center space-x-2">
                            <Badge variant={
                              story.difficulty === 'Easy' ? 'default' :
                              story.difficulty === 'Medium' ? 'secondary' : 'destructive'
                            }>
                              {story.difficulty}
                            </Badge>
                            {story.completed && (
                              <div className="flex items-center">
                                {[...Array(3)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < story.stars ? 'text-yellow-500 fill-current' : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <Link to={`/story/${story.id}`}>
                        <Button variant={story.completed ? 'outline' : 'default'} 
                          className={!story.completed ? 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600' : ''}>
                          {story.completed ? 'Ulit' : 'Basahin'}
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Badges Section */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5" />
                  <span>Mga Badge</span>
                </CardTitle>
                <CardDescription>
                  Collect badges by completing stories and quizzes!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {userProgress.badges.map((badge) => (
                    <div
                      key={badge.id}
                      className={`p-4 rounded-lg text-center transition-all duration-300 ${
                        badge.earned
                          ? 'bg-gradient-to-br from-teal-100 to-cyan-100 border-2 border-teal-300 shadow-lg'
                          : 'bg-gray-100 border-2 border-gray-200 opacity-50'
                      }`}
                    >
                      <div className="text-2xl mb-2">{badge.icon}</div>
                      <div className="text-sm font-medium text-gray-700">{badge.name}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Progress Card */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Overall Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Stories</span>
                    <span>{userProgress.completedStories}/{userProgress.totalStories}</span>
                  </div>
                  <Progress value={(userProgress.completedStories / userProgress.totalStories) * 100} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Quizzes</span>
                    <span>{userProgress.completedQuizzes}/{userProgress.totalQuizzes}</span>
                  </div>
                  <Progress value={(userProgress.completedQuizzes / userProgress.totalQuizzes) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
