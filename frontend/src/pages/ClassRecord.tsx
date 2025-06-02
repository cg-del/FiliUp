
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Search, FileText, Users } from 'lucide-react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { TeacherSidebar } from '../components/TeacherSidebar';
import ClassSelector from '../components/ClassSelector';
import { getClassInfo } from '@/constants/classData';

const ClassRecord = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock data for class records
  const [allClassesData] = useState({
    '3-matatag': {
      totalStudents: 25,
      students: [
        { 
          id: 1, 
          name: 'Juan Dela Cruz', 
          quizzes: {
            'Quiz 1 - Alamat ng Pinya': 85,
            'Quiz 2 - Pabula ni Juan': 92,
            'Quiz 3 - Matalinong Aso': 78,
            'Quiz 4 - Bugtong Compilation': 88
          },
          average: 85.75
        },
        { 
          id: 2, 
          name: 'Maria Santos', 
          quizzes: {
            'Quiz 1 - Alamat ng Pinya': 95,
            'Quiz 2 - Pabula ni Juan': 98,
            'Quiz 3 - Matalinong Aso': 89,
            'Quiz 4 - Bugtong Compilation': 94
          },
          average: 94
        },
        { 
          id: 3, 
          name: 'Pedro Garcia', 
          quizzes: {
            'Quiz 1 - Alamat ng Pinya': 72,
            'Quiz 2 - Pabula ni Juan': 75,
            'Quiz 3 - Matalinong Aso': 68,
            'Quiz 4 - Bugtong Compilation': 80
          },
          average: 73.75
        },
        { 
          id: 4, 
          name: 'Ana Rodriguez', 
          quizzes: {
            'Quiz 1 - Alamat ng Pinya': 88,
            'Quiz 2 - Pabula ni Juan': 90,
            'Quiz 3 - Matalinong Aso': 85,
            'Quiz 4 - Bugtong Compilation': 92
          },
          average: 88.75
        },
        { 
          id: 5, 
          name: 'Carlos Lopez', 
          quizzes: {
            'Quiz 1 - Alamat ng Pinya': 65,
            'Quiz 2 - Pabula ni Juan': 70,
            'Quiz 3 - Matalinong Aso': 62,
            'Quiz 4 - Bugtong Compilation': 68
          },
          average: 66.25
        }
      ]
    },
    '3-masigla': {
      totalStudents: 28,
      students: [
        { 
          id: 6, 
          name: 'Sofia Reyes', 
          quizzes: {
            'Quiz 1 - Alamat ng Pinya': 98,
            'Quiz 2 - Pabula ni Juan': 96,
            'Quiz 3 - Matalinong Aso': 94,
            'Quiz 4 - Bugtong Compilation': 97
          },
          average: 96.25
        },
        { 
          id: 7, 
          name: 'Miguel Torres', 
          quizzes: {
            'Quiz 1 - Alamat ng Pinya': 80,
            'Quiz 2 - Pabula ni Juan': 82,
            'Quiz 3 - Matalinong Aso': 76,
            'Quiz 4 - Bugtong Compilation': 84
          },
          average: 80.5
        }
      ]
    },
    '3-mabini': {
      totalStudents: 23,
      students: [
        { 
          id: 11, 
          name: 'Gabriel Santos', 
          quizzes: {
            'Quiz 1 - Alamat ng Pinya': 87,
            'Quiz 2 - Pabula ni Juan': 89,
            'Quiz 3 - Matalinong Aso': 83,
            'Quiz 4 - Bugtong Compilation': 91
          },
          average: 87.5
        }
      ]
    }
  });

  const [selectedClass, setSelectedClass] = useState(user?.classes?.[0] || '3-matatag');
  const classData = allClassesData[selectedClass] || allClassesData['3-matatag'];
  const selectedClassInfo = getClassInfo(selectedClass);

  // Get all quiz names from the first student (assuming all students have same quizzes)
  const quizNames = classData.students.length > 0 ? Object.keys(classData.students[0].quizzes) : [];

  const filteredStudents = classData.students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 80) return 'text-teal-600 bg-teal-50';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const exportToCSV = () => {
    const headers = ['Student Name', ...quizNames, 'Average'];
    const rows = filteredStudents.map(student => [
      student.name,
      ...quizNames.map(quiz => student.quizzes[quiz] || ''),
      student.average.toFixed(2)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedClassInfo?.name || selectedClass}_quiz_records.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
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
                      Class Record
                    </h1>
                    <p className="text-gray-600 text-sm">Track and export students' quiz performance</p>
                  </div>
                </div>
                <Button 
                  onClick={exportToCSV}
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export to CSV
                </Button>
              </div>
            </header>

            <div className="p-6">
              {/* Class Selector */}
              {user?.classes && user.classes.length > 1 && (
                <ClassSelector
                  classes={user.classes}
                  selectedClass={selectedClass}
                  onClassChange={setSelectedClass}
                  classData={allClassesData}
                />
              )}

              {/* Search and Stats */}
              <div className="mb-8 bg-white rounded-lg p-6 shadow-sm border border-teal-100">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                  <div className="flex-1">
                    <div className="relative max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search students..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 border-teal-200 focus:border-teal-500"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-teal-600" />
                        <span className="text-sm text-gray-500">Total Students</span>
                      </div>
                      <p className="text-xl font-bold text-teal-600">{classData.totalStudents}</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-cyan-600" />
                        <span className="text-sm text-gray-500">Total Quizzes</span>
                      </div>
                      <p className="text-xl font-bold text-cyan-600">{quizNames.length}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Records Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-5 w-5" />
                      <span>Quiz Records - {selectedClassInfo?.name || selectedClass}</span>
                    </div>
                    {selectedClassInfo && (
                      <Badge variant="outline" className="text-xs">
                        {selectedClassInfo.code}
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Complete record of all students' quiz scores and performance.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="font-semibold">Student Name</TableHead>
                          {quizNames.map((quiz) => (
                            <TableHead key={quiz} className="text-center font-semibold min-w-[120px]">
                              {quiz}
                            </TableHead>
                          ))}
                          <TableHead className="text-center font-semibold">Average</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredStudents.map((student) => (
                          <TableRow key={student.id} className="hover:bg-gray-50">
                            <TableCell className="font-medium">{student.name}</TableCell>
                            {quizNames.map((quiz) => {
                              const score = student.quizzes[quiz];
                              return (
                                <TableCell key={quiz} className="text-center">
                                  <Badge 
                                    variant="outline" 
                                    className={`${getScoreColor(score)} border-0 font-semibold`}
                                  >
                                    {score}%
                                  </Badge>
                                </TableCell>
                              );
                            })}
                            <TableCell className="text-center">
                              <Badge 
                                variant="outline" 
                                className={`${getScoreColor(student.average)} border-0 font-bold text-sm`}
                              >
                                {student.average.toFixed(1)}%
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {filteredStudents.length === 0 && (
                    <div className="text-center py-8">
                      <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">No students found</h3>
                      <p className="text-gray-500">
                        {searchTerm ? 'Try adjusting your search criteria.' : 'No students enrolled in this class yet.'}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default ClassRecord;
