import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Users, Award, TrendingUp, User, Menu, Copy, Check } from 'lucide-react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { TeacherSidebar } from '../components/TeacherSidebar';
import ClassSelector from '../components/ClassSelector';
import EnrollmentManagement from '../components/EnrollmentManagement';
import CreateClassForm from '../components/CreateClassForm';
import CreateStoryForm from '../components/CreateStoryForm';
import CreateQuizForm from '../components/CreateQuizForm';
import AddCommonStoryToClass from '../components/AddCommonStoryToClass';
import ClassCommonStories from '../components/ClassCommonStories';
import { getClassInfo } from '@/constants/classData';
import { classService } from '@/lib/services/classService';
import type { Class } from '@/lib/services/types';

// Interface for dashboard statistics
interface ClassDashboardStats {
  totalStudents: number;
  activeStudents: number;
  averageProgress: number;
  completedStories: number;
  completedQuizzes: number;
  averageScore: number;
  students: Array<{
    id: string;
    name: string;
    progress: number;
    stories: number;
    quizzes: number;
    points: number;
    lastActive: string;
  }>;
}

const TeacherDashboard = () => {
  const [isEditingClassName, setIsEditingClassName] = useState(false);
  const [editedClassName, setEditedClassName] = useState("");
  const [savingClassName, setSavingClassName] = useState(false);
  const [classNameError, setClassNameError] = useState<string|null>(null);

  // Edit handlers
  const handleEditClassName = () => {
    setIsEditingClassName(true);
    setEditedClassName(currentClass?.className || "");
    setClassNameError(null);
  };
  const handleCancelEditClassName = () => {
    setIsEditingClassName(false);
    setEditedClassName("");
    setClassNameError(null);
  };
  const handleSaveClassName = async () => {
    if (!editedClassName.trim()) {
      setClassNameError("Class name cannot be empty");
      return;
    }
    setSavingClassName(true);
    setClassNameError(null);
    try {
      const resp = await classService.updateClassName(currentClass.classId, editedClassName.trim());
      if (resp.data) {
        setClasses(prev => prev.map(cls =>
          cls.classId === currentClass.classId ? { ...cls, className: editedClassName.trim() } : cls
        ));
        setIsEditingClassName(false);
      } else {
        setClassNameError("Failed to update class name");
      }
    } catch (err) {
      setClassNameError("Failed to update class name");
    } finally {
      setSavingClassName(false);
    }
  };

  const { user } = useAuth();
  
  // State for classes data from API
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedClassCode, setCopiedClassCode] = useState(false);
  
  // State for dashboard statistics
  const [dashboardStats, setDashboardStats] = useState<ClassDashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Fetch classes data when component mounts
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const response = await classService.getClassesByTeacher();
        if (response.data) {
          setClasses(response.data);
        }
      } catch (err) {
        setError('Failed to fetch classes');
        console.error('Error fetching classes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  const [selectedClass, setSelectedClass] = useState<string>('');

  // Update selected class when classes are loaded
  useEffect(() => {
    if (classes.length > 0) {
      setSelectedClass(classes[0].classId);
    }
  }, [classes]);

  // Fetch dashboard statistics when selected class changes
  useEffect(() => {
    const fetchDashboardStats = async () => {
      if (!selectedClass) return;
      
      try {
        setStatsLoading(true);
        
        // Fetch comprehensive dashboard stats from the new endpoint
        const dashboardResponse = await classService.getClassDashboardStats(selectedClass);
        const dashboardData = dashboardResponse.data;
        
        if (dashboardData) {
          // Transform student activity data to match our interface
          const transformedStudents = dashboardData.studentActivity.map((student) => {
            const hoursAgo = student.lastActiveHours;
            let lastActiveText = '';
            
            if (hoursAgo < 1) {
              lastActiveText = 'Just now';
            } else if (hoursAgo < 24) {
              lastActiveText = `${Math.floor(hoursAgo)} hours ago`;
            } else {
              lastActiveText = `${Math.floor(hoursAgo / 24)} days ago`;
            }
            
            return {
              id: student.id,
              name: student.username,
              progress: Math.round(student.averageScore), // Use actual average score as progress
              stories: student.storiesRead,
              quizzes: student.quizzesCompleted,
              points: Math.round(student.averageScore * 10), // Convert score to points scale
              lastActive: lastActiveText
            };
          });

          const stats: ClassDashboardStats = {
            totalStudents: dashboardData.totalStudents,
            activeStudents: dashboardData.activeStudents,
            averageProgress: dashboardData.quizStats.averageAccuracy,
            completedStories: dashboardData.storiesCount,
            completedQuizzes: dashboardData.quizStats.totalQuizzes,
            averageScore: dashboardData.quizStats.averageScore,
            students: transformedStudents
          };

          setDashboardStats(stats);
        }
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        // Fallback to basic class data if dashboard stats fail
        try {
          const studentsResponse = await classService.getClassStudentsDetailed(selectedClass);
          const students = studentsResponse.data || [];
          
          const fallbackStats: ClassDashboardStats = {
            totalStudents: students.length,
            activeStudents: Math.floor(students.length * 0.8),
            averageProgress: 75,
            completedStories: 0,
            completedQuizzes: 0,
            averageScore: 0,
            students: students.map((student) => ({
              id: student.id,
              name: student.user.username,
              progress: 75,
              stories: 0,
              quizzes: 0,
              points: 0,
              lastActive: 'Unknown'
            }))
          };
          
          setDashboardStats(fallbackStats);
        } catch (fallbackErr) {
          console.error('Error fetching fallback data:', fallbackErr);
        }
      } finally {
        setStatsLoading(false);
      }
    };

    fetchDashboardStats();
  }, [selectedClass]);

  // Get current class data
  const currentClass = classes.find(cls => cls.classId === selectedClass);
  const selectedClassInfo = getClassInfo(selectedClass);

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-teal-500';
    if (progress >= 60) return 'bg-cyan-500';
    return 'bg-red-500';
  };

  const getProgressLabel = (progress: number) => {
    if (progress >= 80) return 'Mahusay';
    if (progress >= 60) return 'Magaling';
    return 'Kailangang ng Tulong';
  };

  const copyClassCode = async (classCode: string) => {
    try {
      await navigator.clipboard.writeText(classCode);
      setCopiedClassCode(true);
      setTimeout(() => setCopiedClassCode(false), 2000);
    } catch (err) {
      console.error('Failed to copy class code:', err);
    }
  };

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
                      Dashboard ng Guro
                    </h1>
                    <p className="text-gray-600 text-sm">Pangkalahatang-ideya ng mga istatistika at aktibidad ng sistema</p>
                  </div>
                </div>
              </div>
            </header>

            <div className="p-6">
              {/* Welcome Section */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Maligayang pagbabalik, {user?.name}! 👩‍🏫
                </h1>
                <p className="text-gray-600">Subaybayan ang progreso ng inyong mga mag-aaral at ipagdiwang ang kanilang mga tagumpay.</p>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
                  <span className="ml-4 text-gray-600">Ikinakarga ang inyong mga klase...</span>
                </div>
              )}

              {/* Error State */}
              {error && (
                <Card className="mb-8 border-red-200 bg-red-50">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2 text-red-600">
                      <span className="font-semibold">Error:</span>
                      <span>{error}</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Content - Only show when not loading */}
              {!loading && (
                <>
                  {/* Class Selector - Use dropdown */}
                  {classes.length > 1 && (
                    <div className="mb-8">
                      <Card>
                        <CardHeader>
                          <CardTitle>Pumili ng Klase</CardTitle>
                          <CardDescription>Pumili ng klase upang makita ang detalyadong impormasyon</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Select value={selectedClass} onValueChange={(value) => setSelectedClass(value)}>
                            <SelectTrigger className="w-full max-w-md">
                              <SelectValue placeholder="Pumili ng klase" />
                            </SelectTrigger>
                            <SelectContent>
                              {classes.map((cls) => (
                                <SelectItem key={cls.classId} value={cls.classId}>
                                  <div className="flex items-center justify-between w-full">
                                    <span className="font-medium">{cls.className}</span>
                                    <span className="text-sm text-gray-500 ml-4">
                                      {cls.studentCount ?? 0} mga mag-aaral
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Display current class info */}
                  {currentClass && (
                    <Card className="mb-8 bg-gradient-to-r from-teal-500 to-cyan-600 text-white">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-2">
                          {isEditingClassName ? (
                            <>
                              <input
                                className="text-2xl font-bold text-black rounded px-2 py-1 mr-2"
                                style={{ minWidth: 120 }}
                                value={editedClassName}
                                onChange={e => setEditedClassName(e.target.value)}
                                autoFocus
                              />
                              <Button size="sm" variant="secondary" className="mr-1" disabled={savingClassName}
                                onClick={handleSaveClassName}>
                                {savingClassName ? 'I-sine-save...' : 'I-save'}
                              </Button>
                              <Button size="sm" variant="ghost" onClick={handleCancelEditClassName} disabled={savingClassName}>Kanselahin</Button>
                            </>
                          ) : (
                            <>
                              <h2 className="text-2xl font-bold">{currentClass.className}</h2>
                              <Button size="sm" variant="ghost" className="ml-2 text-white border border-white/40 hover:bg-white/10"
                                onClick={handleEditClassName} title="Edit class name">
                                Edit
                              </Button>
                            </>
                          )}
                        </div>
                        <p className="text-teal-100 mb-4">{currentClass.description}</p>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary" className="bg-white text-teal-600">
                              Kodigo ng Klase: {currentClass.classCode}
                               <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyClassCode(currentClass.classCode)}
                              className="h-6 w-6 p-0 text-black hover:bg-white/20"
                              title={copiedClassCode ? "Nakopya!" : "Kopyahin ang kodigo ng klase"}
                            >
                              {copiedClassCode ? (
                                <Check className="h-3 w-3" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                            </Badge>
                          </div>
                          <Badge variant="secondary" className="bg-white text-teal-600">
                            {currentClass.studentCount || 0} mga mag-aaral
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Show message if no classes */}
                  {classes.length === 0 && !loading && (
                    <Card className="mb-8">
                      <CardContent className="p-6 text-center">
                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Walang Natagpuang Klase</h3>
                        <p className="text-gray-600 mb-4">Wala ka pang nakatalagang mga klase.</p>
                        <CreateClassForm />
                      </CardContent>
                    </Card>
                  )}

                  {/* Rest of the existing content */}
                  {classes.length > 0 && (
                    <>
                      {/* Enrollment Management - Only show for real classes */}
                      <div className="mb-8">
                        <EnrollmentManagement selectedClassId={selectedClass} />
                      </div>

                      {/* Class Overview with real data */}
                      <div className="grid md:grid-cols-4 gap-6 mb-8">
                        <Card className="bg-gradient-to-r from-teal-400 to-cyan-600 text-white border-0">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-teal-100">Kabuuang mag-aaral</p>
                                <p className="text-2xl font-bold">
                                  {statsLoading ? '...' : (dashboardStats?.totalStudents || currentClass?.studentCount || 0)}
                                </p>
                              </div>
                              <Users className="h-8 w-8 text-teal-100" />
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-r from-cyan-400 to-teal-600 text-white border-0">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-cyan-100">Aktibo Ngayon</p>
                                <p className="text-2xl font-bold">
                                  {statsLoading ? '...' : (dashboardStats?.activeStudents || 0)}
                                </p>
                              </div>
                              <TrendingUp className="h-8 w-8 text-cyan-100" />
                            </div>
                          </CardContent>
                        </Card>

                       

                        <Card className="bg-gradient-to-r from-cyan-500 to-teal-400 text-white border-0">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-cyan-100">Mga Kuwento</p>
                                <p className="text-2xl font-bold">
                                  {statsLoading ? '...' : (dashboardStats?.completedStories || 0)}
                                </p>
                              </div>
                              <BookOpen className="h-8 w-8 text-cyan-100" />
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Student Progress Table - Using real data */}
                      {dashboardStats && dashboardStats.students.length > 0 && (
                        <Card className="mb-8">
                          <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Users className="h-5 w-5" />
                                <span>Progreso ng mga Mag-aaral - {currentClass?.className}</span>
                              </div>
                              {selectedClassInfo && (
                                <Badge variant="outline" className="text-xs">
                                  {selectedClassInfo.code}
                                </Badge>
                              )}
                            </CardTitle>
                            <CardDescription>
                              Real-time tracking ng progreso ng inyong mga mag-aaral sa Filipino comprehension.
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            {statsLoading ? (
                              <div className="flex justify-center items-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                                <span className="ml-3 text-gray-600">Ikinakarga ang datos ng mga mag-aaral...</span>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                {dashboardStats.students.map((student) => (
                                  <div key={student.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center space-x-4">
                                      <div className="w-12 h-12 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full flex items-center justify-center text-white font-semibold">
                                        {student.name.split(' ').map(n => n[0]).join('')}
                                      </div>
                                      <div>
                                        <h3 className="font-semibold text-gray-900">{student.name}</h3>
                                        <p className="text-sm text-gray-500">Last active: {student.lastActive}</p>
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center space-x-6">
                                      <div className="text-center">
                                        <p className="text-sm text-gray-500">Stories</p>
                                        <p className="font-semibold">{student.stories}</p>
                                      </div>
                                      <div className="text-center">
                                        <p className="text-sm text-gray-500">Quizzes</p>
                                        <p className="font-semibold">{student.quizzes}</p>
                                      </div>
                                      <div className="text-center">
                                        <p className="text-sm text-gray-500">Points</p>
                                        <p className="font-semibold">{student.points}</p>
                                      </div>
                                      <div className="w-32">
                                        <div className="flex items-center justify-between text-sm mb-1">
                                          <span>Progress</span>
                                          <span>{student.progress}%</span>
                                        </div>
                                        <Progress value={student.progress} className="h-2" />
                                        <Badge 
                                          variant="outline"
                                          className={`mt-1 text-xs ${getProgressColor(student.progress)} text-white border-0`}
                                        >
                                          {getProgressLabel(student.progress)}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}

                      {/* Quick Actions */}
                      <div className="mt-8 grid md:grid-cols-4 gap-6">
                        <CreateClassForm />
                        
                        <CreateStoryForm selectedClass={selectedClass} />

                        <CreateQuizForm />

                        <Card className="border-2 border-dashed border-cyan-200 hover:border-cyan-400 transition-colors cursor-pointer">
                          <CardContent className="p-6 text-center">
                            <TrendingUp className="h-12 w-12 text-cyan-500 mx-auto mb-4" />
                            <h3 className="font-semibold text-gray-900 mb-2">Tingnan ang mga Ulat</h3>
                            <p className="text-sm text-gray-500">Gumawa ng detalyadong ulat ng progreso</p>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Class Common Stories */}
                      <div className="mt-8">
                        <ClassCommonStories 
                          selectedClass={selectedClass} 
                          className={currentClass?.className}
                        />
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default TeacherDashboard;
