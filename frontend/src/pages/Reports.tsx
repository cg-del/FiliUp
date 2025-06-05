import { useState, useEffect } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { TeacherSidebar } from '../components/TeacherSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, FileText, Users, Clock, CheckCircle, XCircle, Filter, Download, Eye, AlertTriangle } from 'lucide-react';
import { quizService, QuizAttempt } from '@/lib/services/quizService';
import { classService } from '@/lib/services/classService';
import type { Class } from '@/lib/services/types';

const Reports = () => {
  // State for quiz attempts data
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [filteredAttempts, setFilteredAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for filters
  const [quizTitleFilter, setQuizTitleFilter] = useState('');
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [completionFilter, setCompletionFilter] = useState<string>('all');
  
  // State for classes data
  const [classes, setClasses] = useState<Class[]>([]);
  
  // State for viewing logs
  const [selectedAttemptLogs, setSelectedAttemptLogs] = useState<QuizAttempt | null>(null);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch classes and quiz attempts in parallel
        const [classesResponse, attemptsResponse] = await Promise.all([
          classService.getClassesByTeacher(),
          quizService.getQuizAttemptReports()
        ]);

        if (classesResponse.data) {
          setClasses(classesResponse.data);
        }

        setQuizAttempts(attemptsResponse);
        setFilteredAttempts(attemptsResponse);
      } catch (err) {
        setError('Failed to fetch reports data');
        console.error('Error fetching reports data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Apply filters whenever filter values change
  useEffect(() => {
    let filtered = [...quizAttempts];

    // Filter by quiz title
    if (quizTitleFilter.trim()) {
      filtered = filtered.filter(attempt =>
        attempt.quizTitle.toLowerCase().includes(quizTitleFilter.toLowerCase())
      );
    }

    // Filter by class (handled by API call)

    // Filter by completion status
    if (completionFilter !== 'all') {
      filtered = filtered.filter(attempt => {
        if (completionFilter === 'completed') return attempt.isCompleted;
        if (completionFilter === 'in-progress') return !attempt.isCompleted;
        return true;
      });
    }

    setFilteredAttempts(filtered);
  }, [quizAttempts, quizTitleFilter, completionFilter]);

  // Handle filter changes that require API calls
  const handleFilterChange = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      
      if (quizTitleFilter.trim()) {
        filters.quizTitle = quizTitleFilter;
      }
      
      if (selectedClassId && selectedClassId !== 'all') {
        filters.classId = selectedClassId;
      }
      
      if (completionFilter !== 'all') {
        filters.completedOnly = completionFilter === 'completed';
      }

      const attempts = await quizService.getQuizAttemptReports(filters);
      setQuizAttempts(attempts);
      setFilteredAttempts(attempts);
    } catch (err) {
      setError('Failed to filter reports');
      console.error('Error filtering reports:', err);
    } finally {
      setLoading(false);
    }
  };

  // Reset filters
  const resetFilters = async () => {
    setQuizTitleFilter('');
    setSelectedClassId('all');
    setCompletionFilter('all');
    
    try {
      setLoading(true);
      const attempts = await quizService.getQuizAttemptReports();
      setQuizAttempts(attempts);
      setFilteredAttempts(attempts);
    } catch (err) {
      setError('Failed to reset filters');
      console.error('Error resetting filters:', err);
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get completion status badge
  const getCompletionBadge = (attempt: QuizAttempt) => {
    if (attempt.isCompleted) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Completed
        </Badge>
      );
    } else {
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
          <Clock className="w-3 h-3 mr-1" />
          In Progress
        </Badge>
      );
    }
  };

  // Get logs severity badge
  const getLogsSeverityBadge = (logs: any[]) => {
    if (!logs || logs.length === 0) {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          Clean
        </Badge>
      );
    }
    
    const hasCritical = logs.some(log => log.severity === 'CRITICAL');
    const hasHigh = logs.some(log => log.severity === 'HIGH');
    const hasMedium = logs.some(log => log.severity === 'MEDIUM');
    
    if (hasCritical) {
      return (
        <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Critical ({logs.length})
        </Badge>
      );
    } else if (hasHigh) {
      return (
        <Badge variant="destructive" className="bg-orange-100 text-orange-800 border-orange-200">
          <AlertTriangle className="w-3 h-3 mr-1" />
          High ({logs.length})
        </Badge>
      );
    } else if (hasMedium) {
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
          Medium ({logs.length})
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          Low ({logs.length})
        </Badge>
      );
    }
  };

  // Calculate statistics
  const totalAttempts = filteredAttempts.length;
  const completedAttempts = filteredAttempts.filter(a => a.isCompleted).length;
  const avgScore = filteredAttempts
    .filter(a => a.isCompleted && a.score !== undefined)
    .reduce((sum, a) => sum + (a.score || 0), 0) / 
    (filteredAttempts.filter(a => a.isCompleted && a.score !== undefined).length || 1);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <TeacherSidebar />
        <SidebarInset className="flex-1">
          <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
            <header className="bg-white shadow-sm border-b border-teal-100">
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center space-x-4">
                  <SidebarTrigger className="text-teal-600" />
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                      Quiz Attempt Reports
                    </h1>
                    <p className="text-gray-600 text-sm">Monitor and analyze student quiz attempts</p>
                  </div>
                </div>
              </div>
            </header>
            
            <div className="p-6 space-y-6">
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Attempts</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalAttempts}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Completed</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{completedAttempts}</div>
                    <p className="text-xs text-muted-foreground">
                      {totalAttempts > 0 ? Math.round((completedAttempts / totalAttempts) * 100) : 0}% completion rate
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {isNaN(avgScore) ? 'N/A' : Math.round(avgScore * 10) / 10}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Out of {filteredAttempts.find(a => a.maxPossibleScore)?.maxPossibleScore || 'N/A'} points
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Filters */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Filter className="w-5 h-5" />
                    <span>Filters</span>
                  </CardTitle>
                  <CardDescription>Filter quiz attempts by various criteria</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Quiz Title</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search quiz titles..."
                          value={quizTitleFilter}
                          onChange={(e) => setQuizTitleFilter(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Class</label>
                      <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                        <SelectTrigger>
                          <SelectValue placeholder="All classes" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All classes</SelectItem>
                          {classes.map((cls) => (
                            <SelectItem key={cls.classId} value={cls.classId}>
                              {cls.className}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Status</label>
                      <Select value={completionFilter} onValueChange={setCompletionFilter}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All attempts</SelectItem>
                          <SelectItem value="completed">Completed only</SelectItem>
                          <SelectItem value="in-progress">In progress only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Actions</label>
                      <div className="flex space-x-2">
                        <Button onClick={handleFilterChange} className="flex-1">
                          Apply Filters
                        </Button>
                        <Button variant="outline" onClick={resetFilters}>
                          Reset
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Loading State */}
              {loading && (
                <Card>
                  <CardContent className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                    <span className="ml-4 text-gray-600">Loading quiz attempts...</span>
                  </CardContent>
                </Card>
              )}

              {/* Error State */}
              {error && (
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2 text-red-600">
                      <XCircle className="w-5 h-5" />
                      <span className="font-semibold">Error:</span>
                      <span>{error}</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Results Table */}
              {!loading && !error && (
                <Card>
                  <CardHeader>
                    <CardTitle>Quiz Attempt Logs</CardTitle>
                    <CardDescription>
                      Showing {filteredAttempts.length} attempts
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {filteredAttempts.length === 0 ? (
                      <div className="text-center py-12">
                        <FileText className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-semibold text-gray-900">No quiz attempts found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Try adjusting your filters or check if any quizzes have been attempted.
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Student</TableHead>
                              <TableHead>Quiz Title</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Score</TableHead>
                              <TableHead>Time Taken</TableHead>
                              <TableHead>Logs</TableHead>
                              <TableHead>Started At</TableHead>
                              <TableHead>Completed At</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredAttempts.map((attempt) => (
                              <TableRow key={attempt.attemptId}>
                                <TableCell className="font-medium">
                                  {attempt.studentName}
                                </TableCell>
                                <TableCell>{attempt.quizTitle}</TableCell>
                                <TableCell>{getCompletionBadge(attempt)}</TableCell>
                                <TableCell>
                                  {attempt.isCompleted && attempt.score !== undefined ? (
                                    <span className="font-medium">
                                      {attempt.score}/{attempt.maxPossibleScore}
                                      <span className="text-sm text-gray-500 ml-1">
                                        ({Math.round((attempt.score / attempt.maxPossibleScore) * 100)}%)
                                      </span>
                                    </span>
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {attempt.timeTakenMinutes ? (
                                    <span>{attempt.timeTakenMinutes} min</span>
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {getLogsSeverityBadge(attempt.logs || [])}
                                </TableCell>
                                <TableCell>
                                  <span className="text-sm">
                                    {formatDate(attempt.startedAt)}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  {attempt.completedAt ? (
                                    <span className="text-sm">
                                      {formatDate(attempt.completedAt)}
                                    </span>
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {attempt.logs && attempt.logs.length > 0 && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setSelectedAttemptLogs(attempt)}
                                    >
                                      <Eye className="w-4 h-4 mr-1" />
                                      View Logs
                                    </Button>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
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
      </div>

      {/* Logs Modal */}
      <Dialog open={!!selectedAttemptLogs} onOpenChange={() => setSelectedAttemptLogs(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Quiz Attempt Logs</DialogTitle>
            <DialogDescription>
              {selectedAttemptLogs && (
                <>
                  Student: {selectedAttemptLogs.studentName} | Quiz: {selectedAttemptLogs.quizTitle}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {selectedAttemptLogs?.logs && selectedAttemptLogs.logs.length > 0 ? (
            <div className="space-y-4">
              {selectedAttemptLogs.logs.map((log, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${
                    log.severity === 'CRITICAL' ? 'border-l-red-500 bg-red-50' :
                    log.severity === 'HIGH' ? 'border-l-orange-500 bg-orange-50' :
                    log.severity === 'MEDIUM' ? 'border-l-yellow-500 bg-yellow-50' :
                    'border-l-blue-500 bg-blue-50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={
                          log.severity === 'CRITICAL' || log.severity === 'HIGH' 
                            ? 'destructive' 
                            : log.severity === 'MEDIUM' 
                            ? 'secondary' 
                            : 'outline'
                        }
                      >
                        {log.severity}
                      </Badge>
                      <span className="font-medium">{log.action}</span>
                      {log.questionIndex !== null && (
                        <span className="text-sm text-gray-500">
                          Question {log.questionIndex}
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-700">{log.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="mx-auto h-12 w-12 text-green-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No suspicious activity</h3>
              <p className="mt-1 text-sm text-gray-500">
                This quiz attempt has no logged issues.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default Reports;
