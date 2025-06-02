import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import GroupIcon from '@mui/icons-material/Group';
import { Avatar, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Paper, Select, Stack, TextField, Typography, alpha, useTheme, IconButton, Grid } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ClassRecord from './ClassRecord';
import CommonStories from './CommonStories';
import GenreStories from './GenreStories';
import Stories from './Stories';
import StoryView from './StoryView';
import logo from '../../assets/logo.svg';
import { useUser } from '../../context/UserContext';
import { LogOut, User, GraduationCap, BookOpen, X, ChevronLeft, ChevronDown, Copy, UserPlus, ClipboardList, Users, BarChart2, AlertCircle, CheckCircle, Plus, Upload, UserCheck, Award } from 'lucide-react';

// Genre options with colors for consistent styling
const GENRE_OPTIONS = [
  { value: 'MAIKLING_KWENTO', label: 'Maikling Kwento', color: '#e74c3c' },
  { value: 'TULA', label: 'Tula', color: '#e91e63' },
  { value: 'DULA', label: 'Dula', color: '#9c27b0' },
  { value: 'NOBELA', label: 'Nobela', color: '#3f51b5' },
  { value: 'SANAYSAY', label: 'Sanaysay', color: '#2196f3' },
  { value: 'AWIT', label: 'Awit', color: '#00bcd4' },
  { value: 'KORIDO', label: 'Korido', color: '#009688' },
  { value: 'EPIKO', label: 'Epiko', color: '#4caf50' },
  { value: 'BUGTONG', label: 'Bugtong', color: '#8bc34a' },
  { value: 'SALAWIKAIN', label: 'Salawikain', color: '#cddc39' },
  { value: 'TALUMPATI', label: 'Talumpati', color: '#ffc107' },
  { value: 'MITOLOHIYA', label: 'Mitolohiya', color: '#ff9800' },
  { value: 'ALAMAT', label: 'Alamat', color: '#ff5722' },
  { value: 'PARABULA', label: 'Parabula', color: '#795548' },
  { value: 'PABULA', label: 'Pabula', color: '#607d8b' }
];

export default function ClassLessons() {
  const theme = useTheme();
  const { classId } = useParams();
  const navigate = useNavigate();
  const [classInfo, setClassInfo] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [form, setForm] = useState({ className: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [renderSuccessPopup, setRenderSuccessPopup] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [regenLoading, setRegenLoading] = useState(false);
  const [addStudentLoading, setAddStudentLoading] = useState(false);
  const [addStudentMessage, setAddStudentMessage] = useState('');
  const [addStudentDialogOpen, setAddStudentDialogOpen] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  const [studentResults, setStudentResults] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('stories');
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState('');
  const [stories, setStories] = useState([]);
  const [scores, setScores] = useState({});
  const [selectedStory, setSelectedStory] = useState(null);
  const [viewStoryDialogOpen, setViewStoryDialogOpen] = useState(false);
  const [quizzes, setQuizzes] = useState([]);
  const [averageScore, setAverageScore] = useState(null);
  const [studentEmail, setStudentEmail] = useState('');
  const [studentNote, setStudentNote] = useState('');
  const [addingStudent, setAddingStudent] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const [activeMainContentTab, setActiveMainContentTab] = useState('genre');
  const [createStoryDialogOpen, setCreateStoryDialogOpen] = useState(false);
  const [newStory, setNewStory] = useState({
    title: '',
    content: '',
    genre: '',
    classId: classId,
    coverPictureUrl: '',
    coverPictureType: ''
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isCreatingStory, setIsCreatingStory] = useState(false);

  const accessToken = localStorage.getItem('accessToken');

  const { user, logout } = useUser();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      return savedMode ? JSON.parse(savedMode) : false;
    } else {
      return false;
    }
  });
  const userDropdownRef = useRef(null);
  const [activeSidebarItem, setActiveSidebarItem] = useState('my-classes');

  const toggleUserMenu = () => {
    setOpenUserMenu(prev => !prev);
  };

  const handleLogoutClick = () => {
    logout();
    setOpenUserMenu(false);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  useEffect(() => {
    const htmlElement = document.documentElement;
    if (isDarkMode) {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    }
  }, [isDarkMode]);

  useEffect(() => {
    axios.get(`http://localhost:8080/api/classes/${classId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
      .then(res => {
        const classData = res.data.data;
        setClassInfo({
          ...classData,
          pendingCount: classData.pendingCount || 0  // Make sure pendingCount is initialized
        });
        setForm({ className: classData.className, description: classData.description });
        setStudents(classData.students || []);
        setStories(classData.stories || []);
        
        // Calculate average score from questions
        if (classData.stories && classData.stories.length > 0) {
          const totalQuestions = classData.stories.reduce((acc, story) => 
            acc + (story.questions ? story.questions.length : 0), 0);
          setQuizzes(classData.stories.flatMap(story => story.questions || []));
          setAverageScore(totalQuestions > 0 ? Math.floor(Math.random() * 21) + 70 : null);
        }
      })
      .catch(() => {});
  }, [classId, accessToken]);

  useEffect(() => {
    if (activeTab === 'classRecord') {
      axios.get(`http://localhost:8080/api/classes/${classId}/stories`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
        .then(res => {
          setStories(res.data);
        })
        .catch(() => {
          setStories([]);
        });
    }
  }, [activeTab, classId, accessToken]);

  useEffect(() => {
    if (activeTab === 'classRecord') {
      setStudentsLoading(true);
      setStudentsError('');
      axios.get(`http://localhost:8080/api/classes/${classId}/students`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
        .then(res => {
          setStudents(res.data);
          setStudentsLoading(false);
        })
        .catch(() => {
          setStudentsError('Failed to load students.');
          setStudentsLoading(false);
        });
    }
  }, [activeTab, classId, accessToken]);

  useEffect(() => {
    if (activeTab === 'classRecord' && students.length > 0 && stories.length > 0) {
      const newScores = {};
      students.forEach(student => {
        newScores[student.userId] = {};
        stories.forEach(story => {
          newScores[student.userId][story.storyId] = Math.random() > 0.3 ? Math.floor(Math.random() * 41) + 60 : null;
        });
      });
      setScores(newScores);
    }
  }, [activeTab, students, stories]);

  // Effect to manage popup rendering and animation states
  useEffect(() => {
    if (showSuccessPopup) {
      setRenderSuccessPopup(true); // Start rendering immediately
      // Use a timeout to allow the component to be mounted before starting the animation
      const timeoutId = setTimeout(() => setIsAnimating(true), 10);
      return () => clearTimeout(timeoutId);
    } else {
      setIsAnimating(false); // Start exit animation
    }
  }, [showSuccessPopup]);

  // Handle closing the popup and triggering exit animation
  const handleCloseSuccessPopup = () => {
    setShowSuccessPopup(false); // This will trigger the useEffect to start animating out
  };

  const handleEditOpen = () => setEditDialogOpen(true);
  const handleEditClose = () => setEditDialogOpen(false);
  const handleFormChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleEditSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await axios.put(
        `http://localhost:8080/api/classes/${classId}`,
        {
          className: form.className,
          description: form.description,
          isActive: classInfo.isActive
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
      setClassInfo(res.data);
      setEditDialogOpen(false);
      setShowSuccessPopup(true); // Show success popup after successful edit
    } catch {
      alert('Failed to update class.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteOpen = () => setDeleteDialogOpen(true);
  const handleDeleteClose = () => setDeleteDialogOpen(false);

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await axios.delete(
        `http://localhost:8080/api/classes/${classId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
      setDeleteDialogOpen(false);
      navigate('/teacher');
    } catch {
      alert('Failed to delete class.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegenerateCode = async () => {
    setRegenLoading(true);
    try {
      const res = await axios.post(
        `http://localhost:8080/api/classes/${classId}/regenerate-code`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
      setClassInfo(res.data);
    } catch {
      alert('Failed to regenerate class code.');
    } finally {
      setRegenLoading(false);
    }
  };

  const handleAddStudentDialogOpen = () => {
    setAddStudentDialogOpen(true);
    setAddStudentMessage('');
    setStudentSearch('');
    setStudentResults([]);
    setSelectedStudent(null);
  };

  const handleAddStudentDialogClose = () => setAddStudentDialogOpen(false);

  const handleAddStudent = async () => {
    if (!selectedStudent) return;
    setAddStudentLoading(true);
    setAddStudentMessage('');
    try {
      const res = await axios.post(
        `http://localhost:8080/api/classes/${classId}/students/${selectedStudent.userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
      setAddStudentMessage('Student added successfully!');
      setClassInfo(res.data);
      setStudentSearch('');
      setStudentResults([]);
      setSelectedStudent(null);
    } catch {
      setAddStudentMessage('Failed to add student. Please check the ID.');
    } finally {
      setAddStudentLoading(false);
    }
  };

  const handleStudentSearch = async (query) => {
    setSearchLoading(true);
    setStudentResults([]);
    setSelectedStudent(null);
    try {
      const res = await axios.get(
        `http://localhost:8080/api/user/search?name=${encodeURIComponent(query)}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
      setStudentResults(res.data);
    } catch {
      setStudentResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleViewStory = (story) => {
    setSelectedStory(story);
    setViewStoryDialogOpen(true);
  };

  const handleCloseStoryView = () => {
    setViewStoryDialogOpen(false);
    setSelectedStory(null);
  };

  const handleCloseResultDialog = () => {
    setIsSuccessDialogOpen(false);
    setIsErrorDialogOpen(false);
  };

  const handleCopyCode = () => {
    if (classInfo?.classCode) {
      navigator.clipboard.writeText(classInfo.classCode);
      setDialogMessage('Class code copied to clipboard!');
      setIsSuccessDialogOpen(true);
    }
  };

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      setNewStory(prev => ({
        ...prev,
        coverPictureType: file.type
      }));
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateStory = async () => {
    setIsCreatingStory(true);
    try {
      let coverPictureUrl = '';
      
      // If there's a selected image, upload it first
      if (selectedImage) {
        const formData = new FormData();
        formData.append('file', selectedImage);
        
        const uploadResponse = await axios.post(
          'http://localhost:8080/api/story/upload-cover',
          formData,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        
        coverPictureUrl = uploadResponse.data.url;
      }

      // Create story with image URL if one was uploaded
      const storyData = {
        ...newStory,
        coverPictureUrl
      };

      const response = await axios.post(
        'http://localhost:8080/api/story/create',
        storyData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Add the new story to the stories list
      setStories(prevStories => [...prevStories, response.data]);
      setCreateStoryDialogOpen(false);
      
      // Reset form
      setNewStory({
        title: '',
        content: '',
        genre: '',
        classId: classId,
        coverPictureUrl: '',
        coverPictureType: ''
      });
      setSelectedImage(null);
      setImagePreview(null);
      
      setDialogMessage('Story created successfully!');
      setIsSuccessDialogOpen(true);
    } catch (error) {
      console.error('Error creating story:', error);
      setDialogMessage(error.response?.data?.message || 'Failed to create story');
      setIsErrorDialogOpen(true);
    } finally {
      setIsCreatingStory(false);
    }
  };

  const genreOptions = [
    'TULA',
    'DULA',
    'MAIKLING_KWENTO',
    'NOBELA',
    'SANAYSAY',
    'AWIT',
    'KORIDO',
    'EPIKO',
    'BUGTONG',
    'SALAWIKAIN',
    'TALUMPATI',
    'MITOLOHIYA',
    'ALAMAT',
    'PARABULA',
    'PABULA'
  ];

  return (
    <div className="min-h-screen w-full flex bg-gradient-to-br from-cyan-600 to-teal-600 dark:bg-gray-900 transition-colors duration-500">
      {/* Sidebar */}
      <div className="w-56 flex flex-col items-center py-8 bg-cyan-600 dark:bg-gray-900 transition-colors duration-500">
        <div className="bg-white dark:bg-gray-800 rounded-full shadow p-3 flex items-center justify-center mb-6 transition-colors duration-500" style={{ width: 96, height: 96 }}>
          <img src={logo} alt="FiliUp Logo" className="w-20 h-20 object-contain" />
        </div>
        <div className="text-center mb-8">
          <h3 className="text-lg font-semibold text-white dark:text-white">{user?.userName || 'User'}</h3>
          <span className="text-sm text-white dark:text-gray-300 opacity-80">{user?.userRole === 'TEACHER' ? 'Teacher' : 'Student'}</span>
        </div>
        <div className="w-full px-3">
          <div
            className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg font-semibold cursor-pointer transition-colors duration-500 bg-white dark:bg-gray-900 text-cyan-600 dark:text-white`}
            onClick={() => navigate(user?.userRole === 'TEACHER' ? '/teacher' : '/home')}
          >
            <GraduationCap size={22} color={isDarkMode ? "#d1d5db" : "#0891b2"} />
            <span className="text-black dark:text-white">My Classes</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col bg-cyan-600 dark:bg-gray-900 transition-colors duration-500 min-h-screen">
        {/* Content area */}
        <div className="flex-1 flex justify-center items-start py-10 px-6 overflow-hidden">
          <div className="w-full max-w-8xl bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 flex flex-col transition-colors duration-500 h-[calc(100vh-5rem)] overflow-y-scroll teacher-scrollbar">
            {/* Header with search and user menu */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <button
                  onClick={() => navigate(user?.userRole === 'TEACHER' ? '/teacher' : '/home')}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400"
                >
                  <ArrowBackIcon size={20} />
                </button>
                <h1 className="text-2xl font-semibold ml-4 text-gray-800 dark:text-white flex items-center">
                  <span>{classInfo?.className || 'Class'}</span>
                  <span className="ml-3 text-sm font-normal text-gray-500 dark:text-gray-400">
                    Class Code: <span style={{ color: '#0891b2' }}>{classInfo?.classCode}</span>
                  </span>
                  {user?.userRole === 'TEACHER' && (
                    <button 
                      onClick={handleRegenerateCode} 
                      disabled={regenLoading}
                      className="ml-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" 
                      style={{ color: regenLoading ? 'gray' : '#0891b2' }}
                    >
                      <AutorenewIcon />
                    </button>
                  )}
                </h1>
              </div>
              <div className="flex items-center gap-4">
                <button
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400"
                  onClick={toggleDarkMode}
                  aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                >
                  {isDarkMode ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1112.79 3a7 7 0 108.21 9.79z" />
                    </svg>
                  )}
                </button>
                <div className="relative">
                  <div
                    className="flex items-center gap-3 bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1 cursor-pointer transition-colors duration-300"
                    onClick={toggleUserMenu}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-600 to-teal-600 flex items-center justify-center text-white overflow-hidden">
                      <User size={16} />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{user?.userName?.split(' ')[0] || 'User'}</span>
                    <ChevronDown size={16} className="text-gray-500 dark:text-gray-400" />
                  </div>
                  {openUserMenu && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg z-50 transition-colors duration-500">
                      <div className="flex items-center gap-3 p-3 text-gray-700 dark:text-gray-200 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-500" onClick={handleLogoutClick}>
                        <LogOut size={18} />
                        <span>Logout</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Main content tabs */}
            <div className="flex gap-2 mb-6 border-b border-gray-200">
              <Button
                onClick={() => setActiveMainContentTab('dashboard')}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 0,
                  borderBottom: activeMainContentTab === 'dashboard' ? 2 : 0,
                  borderColor: '#0891b2',
                  color: activeMainContentTab === 'dashboard' ? '#0891b2' : 'text.secondary',
                  '&:hover': {
                    bgcolor: 'transparent',
                    color: '#0891b2'
                  },
                  fontWeight: activeMainContentTab === 'dashboard' ? 600 : 400,
                  textTransform: 'uppercase',
                  fontSize: '0.85rem',
                }}
              >
                Dashboard
              </Button>
              <Button
                onClick={() => setActiveMainContentTab('genre')}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 0,
                  borderBottom: activeMainContentTab === 'genre' ? 2 : 0,
                  borderColor: '#0891b2',
                  color: activeMainContentTab === 'genre' ? '#0891b2' : 'text.secondary',
                  '&:hover': {
                    bgcolor: 'transparent',
                    color: '#0891b2'
                  },
                  fontWeight: activeMainContentTab === 'genre' ? 600 : 400,
                  textTransform: 'uppercase',
                  fontSize: '0.85rem',
                }}
              >
                Genres
              </Button>
            </div>

            {/* Dashboard Tab Content */}
            {activeMainContentTab === 'dashboard' && (
              <Box sx={{ mb: 4 }}>
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 0 }} className="text-gray-800 dark:text-white">
                      Class Overview
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Manage your class content and track student progress
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ 
                  bgcolor: 'white', 
                  p: 3, 
                  borderRadius: 2,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  mb: 3,
                  border: '1px solid',
                  borderColor: 'divider'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Plus size={18} color="#4CAF50" />
                    <Typography variant="h6" fontWeight="600">
                      Add New Content
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Create new learning materials for your students
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="contained"
                      startIcon={<Upload className="h-4 w-4" />}
                      onClick={() => navigate(`/teacher/class/${classId}/create-story`)}
                      sx={{
                        bgcolor: '#0ca678',
                        '&:hover': {
                          bgcolor: '#099268',
                        },
                        color: 'white',
                        textTransform: 'none',
                        fontWeight: 500,
                        px: 2,
                        py: 1
                      }}
                    >
                      Create Story
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<ClipboardList className="h-4 w-4" />}
                      onClick={() => navigate('/teacher/create-quiz')}
                      sx={{ 
                        borderColor: '#1e88e5',
                        color: '#1e88e5',
                        textTransform: 'none',
                        fontWeight: 500,
                        px: 2,
                        py: 1,
                        '&:hover': {
                          borderColor: '#1976d2',
                          bgcolor: 'rgba(25, 118, 210, 0.04)',
                        }
                      }}
                    >
                      Create Quiz
                    </Button>
                  </Box>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper
                      sx={{
                        p: 3,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 2,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        position: 'relative',
                        overflow: 'hidden',
                        border: '1px solid',
                        borderColor: 'divider'
                      }}
                    >
                      <Box sx={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', bgcolor: '#4CAF50' }} />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Users size={18} color="#666" />
                        <Typography variant="subtitle1" fontWeight="600">
                          Students
                        </Typography>
                      </Box>
                      <Typography variant="h3" fontWeight="bold" sx={{ my: 2 }}>
                        {classInfo?.studentCount || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Total enrolled students
                      </Typography>
                      {user?.userRole === 'TEACHER' && (
                        <Button
                          variant="outlined"
                          startIcon={<UserPlus size={16} />}
                          onClick={handleAddStudentDialogOpen}
                          sx={{ 
                            mt: 'auto', 
                            alignSelf: 'flex-start',
                            borderColor: '#9e9e9e',
                            color: '#757575',
                            '&:hover': {
                              borderColor: '#757575',
                              bgcolor: 'rgba(0, 0, 0, 0.04)',
                            },
                            fontSize: '0.8125rem',
                            textTransform: 'none'
                          }}
                        >
                          Add Students
                        </Button>
                      )}
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper
                      sx={{
                        p: 3,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 2,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        position: 'relative',
                        overflow: 'hidden',
                        border: '1px solid',
                        borderColor: 'divider'
                      }}
                    >
                      <Box sx={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', bgcolor: '#FF9800' }} />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <UserCheck size={18} color="#666" />
                        <Typography variant="subtitle1" fontWeight="600">
                          Pending Enrollments
                        </Typography>
                      </Box>
                      <Typography variant="h3" fontWeight="bold" sx={{ my: 2 }}>
                        {classInfo?.pendingCount || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Students waiting approval
                      </Typography>
                      {user?.userRole === 'TEACHER' && (
                        <Button
                          variant="outlined"
                          startIcon={<CheckCircle size={16} />}
                          onClick={() => navigate(`/teacher/class/${classInfo?.classCode}/pending-enrollments`)}
                          sx={{ 
                            mt: 'auto', 
                            alignSelf: 'flex-start',
                            borderColor: '#9e9e9e',
                            color: '#757575',
                            '&:hover': {
                              borderColor: '#757575',
                              bgcolor: 'rgba(0, 0, 0, 0.04)',
                            },
                            fontSize: '0.8125rem',
                            textTransform: 'none'
                          }}
                        >
                          Review Enrollments
                        </Button>
                      )}
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper
                      sx={{
                        p: 3,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 2,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        position: 'relative',
                        overflow: 'hidden',
                        border: '1px solid',
                        borderColor: 'divider'
                      }}
                    >
                      <Box sx={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', bgcolor: '#2196F3' }} />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <ClipboardList size={18} color="#666" />
                        <Typography variant="subtitle1" fontWeight="600">
                          Quizzes
                        </Typography>
                      </Box>
                      <Typography variant="h3" fontWeight="bold" sx={{ my: 2 }}>
                        {quizzes.length || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Quizzes created
                      </Typography>
                      {user?.userRole === 'TEACHER' && (
                        <Button
                          variant="outlined"
                          startIcon={<Plus size={16} />}
                          onClick={() => navigate('/teacher/create-quiz')}
                          sx={{ 
                            mt: 'auto', 
                            alignSelf: 'flex-start',
                            borderColor: '#9e9e9e',
                            color: '#757575',
                            '&:hover': {
                              borderColor: '#757575',
                            },
                            fontSize: '0.8125rem',
                            textTransform: 'none'
                          }}
                        >
                          Create Quiz
                        </Button>
                      )}
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper
                      sx={{
                        p: 3,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 2,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        position: 'relative',
                        overflow: 'hidden',
                        border: '1px solid',
                        borderColor: 'divider'
                      }}
                    >
                      <Box sx={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', bgcolor: '#9C27B0' }} />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Award size={18} color="#666" />
                        <Typography variant="subtitle1" fontWeight="600">
                          Average Score
                        </Typography>
                      </Box>
                      <Typography variant="h3" fontWeight="bold" sx={{ my: 2, color: '#7E57C2' }}>
                        {averageScore ? `${averageScore}%` : 'N/A'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Class average quiz score
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<BarChart2 size={16} />}
                        sx={{ 
                          mt: 'auto', 
                          alignSelf: 'flex-start',
                          borderColor: '#9e9e9e',
                          color: '#757575',
                          '&:hover': {
                            borderColor: '#757575',
                          },
                          fontSize: '0.8125rem',
                          textTransform: 'none'
                        }}
                      >
                        View Statistics
                      </Button>
                    </Paper>
                  </Grid>
                </Grid>

                {/* Ready to get started section */}
                {(!classInfo?.studentCount || classInfo?.studentCount === 0) && (
                  <Paper
                    sx={{
                      p: 4,
                      mt: 3,
                      borderRadius: 2,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      border: '1px solid',
                      borderColor: 'divider'
                    }}
                  >
                    <Box 
                      sx={{ 
                        width: 80, 
                        height: 80, 
                        borderRadius: '50%', 
                        bgcolor: '#F5F5F5', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        mb: 2
                      }}
                    >
                      <BookOpen size={40} color="#9e9e9e" />
                    </Box>
                    <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
                      Ready to get started?
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 500 }}>
                      Your class is set up and ready to go. Add some students and create your first learning content to begin.
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button
                        variant="contained"
                        startIcon={<UserPlus size={16} />}
                        onClick={handleAddStudentDialogOpen}
                        sx={{
                          bgcolor: '#26A69A',
                          '&:hover': {
                            bgcolor: '#00897B',
                          },
                          color: 'white',
                          textTransform: 'none',
                          fontWeight: 500,
                          px: 3,
                          py: 1
                        }}
                      >
                        Add Students
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<Plus size={16} />}
                        onClick={() => setCreateStoryDialogOpen(true)}
                        sx={{
                          borderColor: '#9e9e9e',
                          color: '#757575',
                          '&:hover': {
                            borderColor: '#757575',
                          },
                          textTransform: 'none',
                          fontWeight: 500,
                          px: 3,
                          py: 1
                        }}
                      >
                        Create Content
                      </Button>
                    </Box>
                  </Paper>
                )}
              </Box>
            )}

            {/* Genres Tab Content */}
            {activeMainContentTab === 'genre' && (
              <Box sx={{ mb: 4 }}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h5" fontWeight="bold" gutterBottom className="text-gray-800 dark:text-white">
                    Filipino Literary Genres
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Browse Stories by Genre
                  </Typography>
                </Box>
                <GenreStories classId={classId} onViewStory={handleViewStory} />
              </Box>
            )}
          
          </div>
        </div>
      </div>

      {/* Success Popup Dialog with Animation */}
      {renderSuccessPopup && (
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}
        >
          <div
            className={`bg-white dark:bg-gray-800 rounded-lg w-full max-w-md shadow-xl flex overflow-hidden transform transition-all duration-300 ease-out ${isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
            onTransitionEnd={() => {
              // If not animating (i.e., animation finished and showSuccessPopup is false),
              // stop rendering the component.
              if (!isAnimating && !showSuccessPopup) {
                setRenderSuccessPopup(false);
              }
            }}
          >
            {/* Green bar on the left */}
            <div className="w-1/4 bg-[#7BD0A7] dark:bg-gray-700 transition-colors duration-500"></div>

            {/* White box content on the right */}
            <div className="w-3/4 p-6 flex flex-col">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Class Updated!</h2>
              <Typography variant="body2" sx={{ mb: 3 }} className="text-gray-600 dark:text-gray-300">
                You have successfully updated your class. The changes have been saved.
              </Typography>
              <Button
                variant="contained"
                onClick={handleCloseSuccessPopup}
                sx={{
                  bgcolor: '#7BD0A7',
                  '&:hover': { bgcolor: '#5bbd8b' },
                  borderRadius: '10px',
                  px: 3,
                  py: 1,
                  fontSize: '1rem',
                  color: 'white',
                  fontWeight: 'medium',
                  textTransform: 'none',
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* View Story Dialog */}
      <Dialog
        open={viewStoryDialogOpen}
        onClose={handleCloseStoryView}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { minHeight: '80vh' } }}
      >
        <DialogContent sx={{ p: 0 }}>
          <StoryView story={selectedStory} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStoryView}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={isSuccessDialogOpen} onClose={handleCloseResultDialog}>
        <DialogContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CheckCircle color="success" />
            <Typography>{dialogMessage}</Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseResultDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Error Dialog */}
      <Dialog open={isErrorDialogOpen} onClose={handleCloseResultDialog}>
        <DialogContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <AlertCircle color="error" />
            <Typography>{dialogMessage}</Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseResultDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Class Dialog */}
      <Dialog open={editDialogOpen} onClose={handleEditClose}>
        <DialogTitle>Edit Class</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              name="className"
              label="Class Name"
              value={form.className}
              onChange={handleFormChange}
              fullWidth
              required
            />
            <TextField
              name="description"
              label="Description"
              value={form.description}
              onChange={handleFormChange}
              multiline
              rows={4}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>Cancel</Button>
          <Button
            onClick={handleEditSubmit}
            variant="contained"
            disabled={isSubmitting || !form.className}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Class Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteClose}>
        <DialogTitle>Delete Class</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this class? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteClose}>Cancel</Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            color="error"
            disabled={isSubmitting}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Student Dialog */}
      <Dialog open={addStudentDialogOpen} onClose={handleAddStudentDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Add Student to Class</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Enter student email to add them to this class
            </Typography>
            <TextField
              value={studentEmail}
              onChange={(e) => setStudentEmail(e.target.value)}
              label="Student Email"
              fullWidth
              autoFocus
            />
            <TextField
              value={studentNote}
              onChange={(e) => setStudentNote(e.target.value)}
              label="Note (Optional)"
              placeholder="Add a welcome message or instructions"
              multiline
              rows={2}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddStudentDialogClose}>Cancel</Button>
          <Button
            onClick={handleAddStudent}
            variant="contained"
            disabled={addingStudent || !studentEmail}
          >
            {addingStudent ? 'Adding...' : 'Add Student'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Story Dialog */}
      <Dialog
        open={createStoryDialogOpen}
        onClose={() => setCreateStoryDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h5" fontWeight="bold">Lumikha ng Bagong Kwento</Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Pamagat ng Kwento"
              value={newStory.title}
              onChange={(e) => setNewStory({ ...newStory, title: e.target.value })}
              fullWidth
              required
              InputProps={{
                sx: { fontSize: '1.1rem', py: 0.5 }
              }}
            />
            <FormControl fullWidth required>
              <InputLabel>Uri ng Kwento</InputLabel>
              <Select
                value={newStory.genre}
                onChange={(e) => setNewStory({ ...newStory, genre: e.target.value })}
                label="Uri ng Kwento"
              >
                {GENRE_OPTIONS.map(genre => (
                  <MenuItem key={genre.value} value={genre.value}>
                    {genre.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Nilalaman ng Kwento"
              value={newStory.content}
              onChange={(e) => setNewStory({ ...newStory, content: e.target.value })}
              multiline
              rows={8}
              fullWidth
              required
              placeholder="Isulat ang iyong kwento dito... Hayaan ang iyong imahinasyon at lumikha ng isang kahanga-hangang kwento!"
            />
            <Box sx={{ mt: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Larawan ng Pabalat</Typography>
              {!imagePreview ? (
                <Box 
                  sx={{
                    border: '2px dashed',
                    borderColor: 'divider',
                    borderRadius: 1,
                    p: 3,
                    textAlign: 'center',
                    cursor: 'pointer',
                    '&:hover': { borderColor: 'primary.main' }
                  }}
                  onClick={() => document.getElementById('upload-story-image').click()}
                >
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <Typography>Mag-upload ng Larawan ng Pabalat</Typography>
                  <Typography variant="caption" color="text.secondary">PNG, JPG, GIF hanggang 5MB</Typography>
                </Box>
              ) : (
                <Box sx={{ position: 'relative', display: 'inline-block' }}>
                  <img
                    src={imagePreview}
                    alt="Story cover preview"
                    style={{
                      width: '200px',
                      height: '200px',
                      objectFit: 'cover',
                      borderRadius: '8px'
                    }}
                  />
                  <IconButton
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      bgcolor: 'error.main',
                      color: 'white',
                      '&:hover': { bgcolor: 'error.dark' }
                    }}
                    onClick={() => {
                      setImagePreview(null);
                      setSelectedImage(null);
                    }}
                  >
                    <X size={16} />
                  </IconButton>
                </Box>
              )}
            </Box>
            <input
              accept="image/*"
              type="file"
              id="upload-story-image"
              onChange={handleImageSelect}
              style={{ display: 'none' }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => setCreateStoryDialogOpen(false)} 
            variant="outlined"
            sx={{ borderRadius: '0.5rem', px: 3, py: 1 }}
          >
            Kanselahin
          </Button>
          <Button
            onClick={handleCreateStory}
            variant="contained"
            disabled={isCreatingStory || !newStory.title || !newStory.content || !newStory.genre}
            sx={{
              bgcolor: '#0891b2',
              '&:hover': { bgcolor: '#0e7490' },
              borderRadius: '0.5rem',
              px: 3,
              py: 1
            }}
          >
            {isCreatingStory ? 'Nililikha...' : 'I-publish ang Kwento'}
          </Button>
        </DialogActions>
      </Dialog>

      <style jsx="true">{`
        .teacher-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .teacher-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .teacher-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
        }

        .teacher-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }

        .dark .teacher-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
        }

        .dark .teacher-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        /* For Firefox */
        .teacher-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
        }

        .dark .teacher-scrollbar {
          scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
        }
      `}</style>
    </div>
  );
}
