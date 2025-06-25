import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Search, FileText, Users, RefreshCw, AlertCircle, Filter, GraduationCap, Trophy } from 'lucide-react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { TeacherSidebar } from '../components/TeacherSidebar';
import { useClassRecord } from '@/hooks/useClassRecord';

const ClassRecord: React.FC = () => {
  const { user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [quizTypeFilter, setQuizTypeFilter] = useState<string>('all');
  const { classRecordData, loading, error, refreshData } = useClassRecord(quizTypeFilter);

  // Filter students based on search term, class, and grade
  const filteredStudents = classRecordData?.students.filter(student => {
    const matchesSearch = student.studentName.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Check if student has any quiz scores in the selected class
    let matchesClass = selectedClass === 'all';
    if (selectedClass !== 'all' && classRecordData) {
      // Check if student has any quiz scores from the selected class
      const hasQuizInSelectedClass = Object.values(student.quizScores).some(scoreInfo => 
        scoreInfo && scoreInfo.classId === selectedClass
      );
      matchesClass = hasQuizInSelectedClass;
    }
    
    // Calculate student's average for grade filtering (only for filtered quizzes)
    if (gradeFilter !== 'all') {
      const filteredQuizTitles = getFilteredQuizTitles();
      const validScores = filteredQuizTitles
        .map(quizTitle => student.quizScores[quizTitle])
        .filter(score => score !== null && score !== undefined);
      const average = validScores.length > 0 
        ? validScores.reduce((sum, score) => sum + score.percentage, 0) / validScores.length 
        : 0;
      
      if (gradeFilter === 'excellent' && average < 90) return false;
      if (gradeFilter === 'good' && (average < 75 || average >= 90)) return false;
      if (gradeFilter === 'needs-help' && average >= 75) return false;
    }
    
    return matchesSearch && matchesClass;
  }) || [];

  // Filter quiz titles based on selected class
  const getFilteredQuizTitles = () => {
    if (!classRecordData || selectedClass === 'all') {
      return classRecordData?.quizTitles || [];
    }
    
    // Filter quizzes to only show those from the selected class
    return classRecordData.quizTitles.filter(quizTitle => {
      const quizMetadata = classRecordData.quizMetadata[quizTitle];
      return quizMetadata && quizMetadata.classId === selectedClass;
    });
  };

  const filteredQuizTitles = getFilteredQuizTitles();

  const exportToCSV = () => {
    if (!classRecordData || !filteredStudents.length) return;

    const headers = ['Student Name', ...filteredQuizTitles, 'Average'];
    const rows = filteredStudents.map(student => {
      const quizScores = filteredQuizTitles.map(quizTitle => {
        const scoreInfo = student.quizScores[quizTitle];
        return scoreInfo ? scoreInfo.score : 'N/A';
      });
      
      // Calculate average for filtered quizzes only
      const validScores = filteredQuizTitles
        .map(quizTitle => student.quizScores[quizTitle])
        .filter(score => score !== null && score !== undefined);
      const average = validScores.length > 0 
        ? validScores.reduce((sum, score) => sum + score.percentage, 0) / validScores.length 
        : 0;

      return [student.studentName, ...quizScores, `${average.toFixed(1)}%`];
    });

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'class-records.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Calculate summary statistics
  const summaryStats = React.useMemo(() => {
    if (!filteredStudents.length || !classRecordData) return null;
    
    const totalStudents = filteredStudents.length;
    let excellentCount = 0;
    let goodCount = 0;
    let needsHelpCount = 0;
    let totalAverage = 0;
    
    filteredStudents.forEach(student => {
      const validScores = filteredQuizTitles
        .map(quizTitle => student.quizScores[quizTitle])
        .filter(score => score !== null && score !== undefined);
      const average = validScores.length > 0 
        ? validScores.reduce((sum, score) => sum + score.percentage, 0) / validScores.length 
        : 0;
      
      totalAverage += average;
      
      if (average >= 90) excellentCount++;
      else if (average >= 75) goodCount++;
      else needsHelpCount++;
    });
    
    return {
      totalStudents,
      excellentCount,
      goodCount,
      needsHelpCount,
      classAverage: totalAverage / totalStudents,
    };
  }, [filteredStudents, classRecordData, filteredQuizTitles]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <SidebarProvider>
      <TeacherSidebar />
      <SidebarInset>
        <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
          {/* Header */}
          <header className="bg-white shadow-sm border-b border-teal-100">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center space-x-4">
                <SidebarTrigger className="text-teal-600" />
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                    Class Records
                  </h1>
                  <p className="text-gray-600 text-sm">Student performance matrix across all classes and quizzes</p>
                </div>
              </div>
            </div>
          </header>

          <div className="p-6">
            {/* Error Alert */}
            {error && (
              <Alert className="mb-6 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Summary Statistics */}
            {!loading && summaryStats && (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                <Card className="bg-gradient-to-r from-teal-400 to-cyan-500 text-white border-0">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-teal-100 text-sm">Total Students</p>
                        <p className="text-2xl font-bold">{summaryStats.totalStudents}</p>
                      </div>
                      <Users className="h-8 w-8 text-teal-100" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-400 to-emerald-500 text-white border-0">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm">Excellent (90%+)</p>
                        <p className="text-2xl font-bold">{summaryStats.excellentCount}</p>
                      </div>
                      <Trophy className="h-8 w-8 text-green-100" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-blue-400 to-indigo-500 text-white border-0">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm">Good (75-89%)</p>
                        <p className="text-2xl font-bold">{summaryStats.goodCount}</p>
                      </div>
                      <GraduationCap className="h-8 w-8 text-blue-100" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-orange-400 to-red-500 text-white border-0">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-100 text-sm">Needs Help</p>
                        <p className="text-2xl font-bold">{summaryStats.needsHelpCount}</p>
                      </div>
                      <AlertCircle className="h-8 w-8 text-orange-100" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-purple-400 to-pink-500 text-white border-0">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100 text-sm">Class Average</p>
                        <p className="text-2xl font-bold">{summaryStats.classAverage.toFixed(1)}%</p>
                      </div>
                      <FileText className="h-8 w-8 text-purple-100" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Quiz Distribution Summary */}
            {!loading && classRecordData && classRecordData.quizMetadata && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Stories Summary */}
                <Card className="bg-white/80 backdrop-blur-sm border-teal-100">
                  <CardHeader>
                    <CardTitle className="text-teal-700 flex items-center gap-2">
                      📖 Quiz Distribution by Stories
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.values(classRecordData.quizMetadata)
                        .reduce((acc, quiz) => {
                          const existing = acc.find(item => item.storyId === quiz.storyId);
                          if (existing) {
                            existing.quizCount++;
                          } else {
                            acc.push({
                              storyId: quiz.storyId,
                              storyTitle: quiz.storyTitle,
                              className: quiz.className,
                              quizCount: 1
                            });
                          }
                          return acc;
                        }, [] as Array<{storyId: string, storyTitle: string, className: string, quizCount: number}>)
                        .map((story, index) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-teal-50 rounded">
                            <div>
                              <span className="font-medium text-teal-700">{story.storyTitle}</span>
                              <div className="text-xs text-teal-600">Class: {story.className}</div>
                            </div>
                            <Badge variant="outline" className="text-teal-600 border-teal-300">
                              {story.quizCount} quiz{story.quizCount !== 1 ? 'es' : ''}
                            </Badge>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Classes Summary */}
                <Card className="bg-white/80 backdrop-blur-sm border-teal-100">
                  <CardHeader>
                    <CardTitle className="text-teal-700 flex items-center gap-2">
                      🏫 Quiz Distribution by Classes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.values(classRecordData.quizMetadata)
                        .reduce((acc, quiz) => {
                          const existing = acc.find(item => item.classId === quiz.classId);
                          if (existing) {
                            existing.quizCount++;
                          } else {
                            acc.push({
                              classId: quiz.classId,
                              className: quiz.className,
                              quizCount: 1
                            });
                          }
                          return acc;
                        }, [] as Array<{classId: string, className: string, quizCount: number}>)
                        .map((cls, index) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-cyan-50 rounded">
                            <span className="font-medium text-cyan-700">{cls.className}</span>
                            <Badge variant="outline" className="text-cyan-600 border-cyan-300">
                              {cls.quizCount} quiz{cls.quizCount !== 1 ? 'es' : ''}
                            </Badge>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Filters and Controls */}
            <Card className="mb-6 bg-white/80 backdrop-blur-sm border-teal-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-teal-700">
                  <Filter className="h-5 w-5" />
                  Filters & Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
                  <div className="flex flex-col sm:flex-row gap-4 flex-1">
                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search students..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64 border-teal-200 focus:border-teal-400 focus:ring-teal-400"
                      />
                    </div>

                    {/* Class Filter */}
                    <Select value={selectedClass} onValueChange={setSelectedClass}>
                      <SelectTrigger className="w-48 border-teal-200 focus:border-teal-400 focus:ring-teal-400">
                        <SelectValue placeholder="Filter by class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Classes</SelectItem>
                        {classRecordData && Object.entries(classRecordData.classInfo).map(([classId, className]) => (
                          <SelectItem key={classId} value={classId}>
                            {className}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Grade Filter */}
                    <Select value={gradeFilter} onValueChange={setGradeFilter}>
                      <SelectTrigger className="w-48 border-teal-200 focus:border-teal-400 focus:ring-teal-400">
                        <SelectValue placeholder="Filter by grade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Performance</SelectItem>
                        <SelectItem value="excellent">Excellent (90%+)</SelectItem>
                        <SelectItem value="good">Good (75-89%)</SelectItem>
                        <SelectItem value="needs-help">Needs Help (&lt;75%)</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Quiz Type Filter */}
                    <Select value={quizTypeFilter} onValueChange={setQuizTypeFilter}>
                      <SelectTrigger className="w-48 border-teal-200 focus:border-teal-400 focus:ring-teal-400">
                        <SelectValue placeholder="Filter by quiz type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Quiz Types</SelectItem>
                        <SelectItem value="STORY">Regular Stories</SelectItem>
                        <SelectItem value="COMMON_STORY">Common Stories</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={refreshData}
                      disabled={loading}
                      className="flex items-center gap-2 border-teal-200 text-teal-600 hover:bg-teal-50"
                    >
                      <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                    <Button 
                      onClick={exportToCSV}
                      disabled={!classRecordData || filteredStudents.length === 0}
                      className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700"
                    >
                      <Download className="h-4 w-4" />
                      Export CSV
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Loading State */}
            {loading && (
              <Card className="bg-white/80 backdrop-blur-sm border-teal-100">
                <CardContent className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mb-4"></div>
                  <p className="text-gray-600 text-lg">Loading class records...</p>
                </CardContent>
              </Card>
            )}

            {/* Class Records Matrix */}
            {!loading && classRecordData && (
              <Card className="bg-white/80 backdrop-blur-sm border-teal-100 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-teal-700">
                    <FileText className="h-5 w-5" />
                    Student Quiz Performance Matrix
                  </CardTitle>
                  <CardDescription className="text-teal-600">
                    Showing {filteredStudents.length} students across {filteredQuizTitles.length} quizzes
                    {selectedClass !== 'all' && classRecordData.classInfo[selectedClass] && 
                      ` (filtered by class: ${classRecordData.classInfo[selectedClass]})`
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {filteredStudents.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg mb-2">No student records found</p>
                      {searchTerm || selectedClass !== 'all' || gradeFilter !== 'all' ? (
                        <p className="text-sm">Try adjusting your filters to see more results</p>
                      ) : (
                        <p className="text-sm">No data available</p>
                      )}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-200">
                            <TableHead className="font-semibold text-teal-700 sticky left-0 bg-gradient-to-r from-teal-50 to-cyan-50 z-10">
                              Student Name
                            </TableHead>
                            {filteredQuizTitles.map((quizTitle, index) => (
                              <TableHead key={index} className="text-center font-semibold min-w-[140px] text-teal-700">
                                <div className="flex flex-col items-center gap-1">
                                  <span className="font-semibold">{quizTitle}</span>
                                  {classRecordData.quizMetadata[quizTitle] && (
                                    <div className="text-xs text-teal-600 space-y-1">
                                      <div>📖 {classRecordData.quizMetadata[quizTitle].storyTitle}</div>
                                     
                                    </div>
                                  )}
                                </div>
                              </TableHead>
                            ))}
                            <TableHead className="text-center font-semibold text-teal-700 sticky right-0 bg-gradient-to-r from-teal-50 to-cyan-50 z-10">
                              Average
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredStudents.map((student) => {
                            // Calculate average for this student using filtered quizzes only
                            const validScores = filteredQuizTitles
                              .map(quizTitle => student.quizScores[quizTitle])
                              .filter(score => score !== null && score !== undefined);
                            const average = validScores.length > 0 
                              ? validScores.reduce((sum, score) => sum + score.percentage, 0) / validScores.length 
                              : 0;

                            return (
                              <TableRow key={student.studentId} className="hover:bg-teal-50/50 transition-colors">
                                <TableCell className="font-medium text-gray-900 sticky left-0 bg-white z-10 border-r border-teal-100">
                                  {student.studentName}
                                </TableCell>
                                {filteredQuizTitles.map((quizTitle, index) => {
                                  const scoreInfo = student.quizScores[quizTitle];
                                  
                                  if (!scoreInfo || scoreInfo.score === null) {
                                    return (
                                      <TableCell key={index} className="text-center">
                                        <Badge variant="outline" className="text-gray-400 border-gray-300">
                                          N/A
                                        </Badge>
                                      </TableCell>
                                    );
                                  }

                                  const percentage = scoreInfo.percentage;
                                  const getBadgeStyle = (pct: number) => {
                                    if (pct >= 90) return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0';
                                    if (pct >= 75) return 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white border-0';
                                    if (pct >= 60) return 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0';
                                    return 'bg-gradient-to-r from-red-500 to-pink-500 text-white border-0';
                                  };

                                  return (
                                    <TableCell key={index} className="text-center">
                                      <div className="flex flex-col items-center gap-1" 
                                           title={`Story: ${scoreInfo.storyTitle}\nClass: ${scoreInfo.className}\nScore: ${scoreInfo.score}/${scoreInfo.maxScore} (${scoreInfo.percentage.toFixed(1)}%)`}>
                                        <Badge className={getBadgeStyle(percentage)}>
                                          {scoreInfo.score}/{scoreInfo.maxScore}
                                        </Badge>
                                       
                                        
                                      </div>
                                      <span className="text-xs text-gray-500 font-medium">
                                          {percentage.toFixed(1)}%
                                        </span>
                                    </TableCell>
                                  );
                                })}
                                <TableCell className="text-center sticky right-0 bg-white z-10 border-l border-teal-100">
                                  <Badge 
                                    className={
                                      average >= 90 ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0' : 
                                      average >= 75 ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white border-0' : 
                                      average >= 60 ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0' : 
                                      'bg-gradient-to-r from-red-500 to-pink-500 text-white border-0'
                                    }
                                  >
                                    {average.toFixed(1)}%
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

         
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default ClassRecord;
