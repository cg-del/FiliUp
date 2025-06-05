import { useState, useEffect } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { TeacherSidebar } from '../components/TeacherSidebar';
import { classService } from '../lib/services/classService';
import type { Class, Student } from '../lib/services/types';

const Students = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await classService.getClassesByTeacher();
      setClasses(response.data);
      if (response.data.length > 0) {
        setSelectedClass(response.data[0]);
        fetchStudents(response.data[0].classId);
      }
    } catch (err) {
      setError('Failed to fetch classes');
      console.error('Error fetching classes:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async (classId: string) => {
    try {
      setLoadingStudents(true);
      const response = await classService.getStudentsByClass(classId);
      setStudents(response.data);
    } catch (err) {
      setError('Failed to fetch students');
      console.error('Error fetching students:', err);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleClassChange = (classData: Class) => {
    setSelectedClass(classData);
    fetchStudents(classData.classId);
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <TeacherSidebar />
          <SidebarInset className="flex-1">
            <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading classes...</p>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

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
                      Students
                    </h1>
                    <p className="text-gray-600 text-sm">Manage your students and their progress</p>
                  </div>
                </div>
              </div>
            </header>
            
            <div className="p-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                  {error}
                </div>
              )}

              {classes.length === 0 ? (
                <div className="bg-white rounded-lg p-8 text-center shadow-sm border border-teal-100">
                  <h2 className="text-xl font-semibold text-gray-700 mb-2">No Classes Found</h2>
                  <p className="text-gray-500">You don't have any classes yet. Create a class to start managing students.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Class Selection */}
                  <div className="bg-white rounded-lg p-6 shadow-sm border border-teal-100">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Select Class</h2>
                    <div className="flex flex-wrap gap-2">
                      {classes.map((classData) => (
                        <button
                          key={classData.classId}
                          onClick={() => handleClassChange(classData)}
                          className={`px-4 py-2 rounded-lg border transition-colors ${
                            selectedClass?.classId === classData.classId
                              ? 'bg-teal-600 text-white border-teal-600'
                              : 'bg-white text-gray-700 border-gray-200 hover:border-teal-300 hover:bg-teal-50'
                          }`}
                        >
                          {classData.className}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Students List */}
                  {selectedClass && (
                    <div className="bg-white rounded-lg p-6 shadow-sm border border-teal-100">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-gray-800">
                          Students in {selectedClass.className}
                        </h2>
                        <span className="text-sm text-gray-500">
                          {students.length} student{students.length !== 1 ? 's' : ''}
                        </span>
                      </div>

                      {loadingStudents ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
                          <p className="text-gray-600">Loading students...</p>
                        </div>
                      ) : students.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-gray-500">No students enrolled in this class yet.</p>
                        </div>
                      ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                          {students.map((student) => (
                            <div key={student.id} className="border border-gray-200 rounded-lg p-4 hover:border-teal-300 transition-colors">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                                  <span className="text-teal-600 font-semibold">
                                    {student.user.username.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <h3 className="font-semibold text-gray-800">{student.user.username}</h3>
                                  <p className="text-sm text-gray-600">{student.user.email}</p>
                                  {student.studentProfile && (
                                    <p className="text-xs text-teal-600">
                                      Grade: {student.studentProfile.grade} | Level: {student.studentProfile.readingLevel}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Students;
