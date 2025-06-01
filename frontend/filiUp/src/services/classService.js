import api from './api';

const classService = {
  // Create a new class
  createClass: async (classData, teacherId) => {
    const response = await api.post(`/classes?teacherId=${teacherId}`, classData);
    return response.data;
  },

  // Get all active classes
  getAllClasses: async () => {
    const response = await api.get('/classes');
    return response.data;
  },

  // Get class by ID
  getClassById: async (classId) => {
    const response = await api.get(`/classes/${classId}`);
    return response.data;
  },

  // Get classes by teacher
  getClassesByTeacher: async (teacherId) => {
    const response = await api.get(`/classes/teacher/${teacherId}`);
    return response.data;
  },

  // Get classes for the authenticated student
  getMyClasses: async () => {
    const response = await api.get('/classes/myclasses');
    return response.data;
  },

  // Update class
  updateClass: async (classId, classData) => {
    const response = await api.put(`/classes/${classId}`, classData);
    return response.data;
  },

  // Delete class (hard delete)
  deleteClass: async (classId) => {
    const response = await api.delete(`/classes/${classId}`);
    return response.data;
  },

  // Add student to class
  addStudentToClass: async (classId, studentId) => {
    const response = await api.post(`/classes/${classId}/students/${studentId}`);
    return response.data;
  },

  // Remove student from class
  removeStudentFromClass: async (classId, studentId) => {
    const response = await api.delete(`/classes/${classId}/students/${studentId}`);
    return response.data;
  },

  // Regenerate class code
  regenerateClassCode: async (classId) => {
    const response = await api.post(`/classes/${classId}/regenerate-code`);
    return response.data;
  },

  // Get students by class
  getStudentsByClass: async (classId) => {
    const response = await api.get(`/classes/${classId}/students`);
    return response.data;
  },

  // Get class teacher
  getClassTeacher: async (classId) => {
    const response = await api.get(`/classes/${classId}/teacher`);
    return response.data;
  },

  // Get pending enrollments for a class
  getPendingEnrollments: async (classCode) => {
    const response = await api.get(`/enrollments/class/${classCode}`);
    return response.data;
  },

  // Accept student enrollment
  acceptEnrollment: async (classCode, userId) => {
    const response = await api.post(`/enrollments/accept/${classCode}/${userId}`);
    return response.data;
  }
};

export default classService; 