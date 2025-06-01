import api from './api';

const teacherService = {
  // Create a new story
  createStory: async (storyData) => {
    try {
      const response = await api.post('/story/create', storyData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all stories for a class
  getClassStories: async (classId) => {
    try {
      const response = await api.get(`/api/story/class/${classId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update a story
  updateStory: async (storyId, storyData) => {
    try {
      const response = await api.put(`/api/story/${storyId}`, storyData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete a story
  deleteStory: async (storyId) => {
    try {
      const response = await api.delete(`/api/story/${storyId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create a quiz for a story
  createQuiz: async (storyId, quizData) => {
    try {
      const response = await api.post(
        storyId ? `/v1/quizzes/${storyId}` : '/quiz/create', 
        quizData
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all quizzes for a story
  getStoryQuizzes: async (storyId) => {
    try {
      const response = await api.get(`/api/stories/${storyId}/quizzes`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get class statistics
  getClassStats: async (classId) => {
    try {
      const response = await api.get(`/api/classes/${classId}/stats`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default teacherService; 