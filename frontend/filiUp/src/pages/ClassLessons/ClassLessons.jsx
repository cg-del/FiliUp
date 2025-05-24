import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import GroupIcon from '@mui/icons-material/Group';
import { Avatar, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Paper, Select, Stack, TextField, Typography, alpha, useTheme, IconButton } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ClassRecord from './ClassRecord';
import CommonStories from './CommonStories';
import Stories from './Stories';
import StoryView from './StoryView';
import logo from '../../assets/logo.svg';
import { useUser } from '../../context/UserContext';
import { LogOut, User, GraduationCap, BookOpen, X, ChevronLeft } from 'lucide-react';

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
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const userDropdownRef = useRef(null);
  const [activeSidebarItem, setActiveSidebarItem] = useState('my-classes');
  const [activeMainContentTab, setActiveMainContentTab] = useState('genre');

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
        setClassInfo(res.data);
        setForm({ className: res.data.className, description: res.data.description });
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

  return (
    <div className="min-h-screen w-full flex bg-[#95dfc1] dark:bg-gray-900 transition-colors duration-500">
      {/* Sidebar */}
      <div className="w-56 flex flex-col items-center py-8 bg-[#7BD0A7] dark:bg-gray-900 transition-colors duration-500">
        <div className="bg-white dark:bg-gray-800 rounded-full shadow p-3 flex items-center justify-center mb-6 transition-colors duration-500" style={{ width: 96, height: 96 }}>
          <img src={logo} alt="FiliUp Logo" className="w-20 h-20 object-contain" />
        </div>
        <div className="flex flex-col gap-2 w-full px-2">
          <div
            className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg font-semibold cursor-pointer transition-colors duration-500 bg-white dark:bg-gray-900 text-[#7BD0A7] dark:text-white`}
          >
            <GraduationCap size={22} color={isDarkMode ? "#d1d5db" : "#7BD0A7"} />
            <span className="text-black dark:text-white">My Classes</span>
          </div>
          <div
            className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg font-semibold cursor-pointer transition-colors duration-500 text-black dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700`}
          >
            <BookOpen size={20} color={isDarkMode ? "#d1d5db" : "#6b7280"} />
            <span className="text-black dark:text-gray-300">Question Bank</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-[#7BD0A7] dark:bg-gray-900 transition-colors duration-500 min-h-screen">
        <div className="flex-1 flex flex-col justify-start items-center px-6 py-10">
          <div className="main-content w-full max-w-8xl bg-white dark:bg-gray-800 rounded-2xl shadow-lg flex flex-col transition-colors duration-500 teacher-scrollbar" style={{ 
            height: 'calc(100vh - 80px)',
            overflow: 'hidden'
          }}>
            {/* Top Navigation within White Box */}
            <div className="flex items-center justify-between mb-6 w-full sticky top-0 bg-white dark:bg-gray-800 z-10 px-8 pt-8 pb-0 transition-colors duration-500">
              <div className="flex items-center">
                <Button
                  variant="text"
                  startIcon={<ChevronLeft size={24} />}
                  onClick={() => navigate('/teacher')}
                  sx={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: '#7BD0A7',
                    minWidth: 'auto',
                    padding: '4px',
                  }}
                >
                </Button>
              </div>

              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="flex items-center gap-4">
                  <Button
                    variant={activeMainContentTab === 'genre' ? 'contained' : 'outlined'}
                    onClick={() => setActiveMainContentTab('genre')}
                    sx={{
                      minWidth: '120px',
                      bgcolor: activeMainContentTab === 'genre' ? '#7BD0A7' : 'transparent',
                      color: activeMainContentTab === 'genre' ? 'black' : '#6b7280',
                      borderColor: '#7BD0A7',
                      fontWeight: 'bold',
                      '&:hover': {
                        bgcolor: activeMainContentTab === 'genre' ? '#5bbd8b' : alpha('#7BD0A7', 0.1),
                        borderColor: '#5bbd8b',
                      },
                      fontSize: '0.9rem',
                      px: 3,
                      py: 1.5,
                      borderRadius: '10px',
                      opacity: activeMainContentTab === 'genre' ? 1 : 0.7,
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    Class
                  </Button>
                  <Button
                    variant={activeMainContentTab === 'dashboard' ? 'contained' : 'outlined'}
                    onClick={() => setActiveMainContentTab('dashboard')}
                    sx={{
                      minWidth: '120px',
                      bgcolor: activeMainContentTab === 'dashboard' ? '#7BD0A7' : 'transparent',
                      color: activeMainContentTab === 'dashboard' ? 'black' : '#6b7280',
                      borderColor: '#7BD0A7',
                      fontWeight: 'bold',
                      '&:hover': {
                        bgcolor: activeMainContentTab === 'dashboard' ? '#5bbd8b' : alpha('#7BD0A7', 0.1),
                        borderColor: '#5bbd8b',
                      },
                      fontSize: '0.9rem',
                      px: 3,
                      py: 1.5,
                      borderRadius: '10px',
                      opacity: activeMainContentTab === 'dashboard' ? 1 : 0.7,
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    Dashboard
                  </Button>
                </div>

                {/* Icons and User Profile */}
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
                  <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 7.165 6 9.388 6 12v2.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                  </button>
                  <div className="relative flex items-center">
                    <div
                      className="flex items-center gap-3 bg-gray-100 rounded-full px-3 py-1 cursor-pointer dark:bg-gray-700 transition-colors duration-500"
                      onClick={toggleUserMenu}
                    >
                      <div className="flex flex-col items-end mr-2">
                        <span className="font-bold text-gray-800 leading-tight text-md dark:text-white transition-colors duration-500">{user?.userName || 'Teacher Name'}</span>
                        <span className="text-xs text-gray-500 leading-tight dark:text-gray-400 transition-colors duration-500">Guro</span>
                      </div>
                      <img
                        src="https://randomuser.me/api/portraits/lego/1.jpg"
                        alt="Profile"
                        className="w-10 h-10 rounded-full object-cover border-2 border-white shadow"
                      />
                    </div>
                    {openUserMenu && (
                      <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg z-50 transition-colors duration-500">
                        <div className="flex items-center gap-3 p-3 text-gray-700 dark:text-gray-200 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-500" onClick={handleLogoutClick}>
                          <LogOut size={18} color={isDarkMode ? "#d1d5db" : "#4b5563"} />
                          <span>Mag-sign Out</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Content Area (Genre/Dashboard) */}
            <Box className="flex-1 p-8 overflow-y-auto teacher-scrollbar" style={{ height: 'calc(100% - 80px)' }}>
              {activeMainContentTab === 'genre' && (
                <div className="w-full">
                  <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 1 }} className="text-gray-800 dark:text-white">
                    {classInfo?.className} <span className="text-gray-600 dark:text-gray-400" style={{ fontWeight: 'normal' }}>Genre</span>
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, justifyContent: 'space-between', width: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="h6" sx={{ mr: 2 }} className="text-gray-800 dark:text-white">
                        Class Code: <span style={{ color: '#7BD0A7' }}>{classInfo?.classCode}</span>
                      </Typography>
                      <IconButton
                        aria-label="Regenerate class code"
                        onClick={handleRegenerateCode}
                        disabled={regenLoading}
                        size="small"
                        sx={{
                          color: regenLoading ? 'gray' : '#7BD0A7',
                          '&:hover': { color: regenLoading ? 'gray' : '#5bbd8b' },
                          transition: 'color 0.3s',
                        }}
                      >
                        <AutorenewIcon />
                      </IconButton>
                    </Box>
                    <Button
                      size="small"
                      onClick={handleEditOpen}
                      sx={{
                        fontSize: '1rem',
                        bgcolor: '#7BD0A7',
                        color: 'black',
                        fontWeight: 'bold',
                        '&:hover': { bgcolor: '#5bbd8b' },
                        borderRadius: '10px',
                        px: 3,
                        py: 1.5,
                        textTransform: 'none',
                      }}
                    >
                      Edit Class
                    </Button>
                  </Box>

                  {/* Genre Cards */}
                  <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
                    <Paper
                      sx={{
                        p: 3,
                        textAlign: 'center',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 2,
                        boxShadow: 2,
                        bgcolor: '#a9e6c8',
                        cursor: 'pointer',
                        minWidth: 'calc(25% - 18px)',
                        minHeight: 200,
                        transition: 'box-shadow 0.2s',
                        '&:hover': { 
                          boxShadow: 6,
                          bgcolor: '#FFF9C4'
                        },
                      }}
                    >
                      <Typography variant="h5" fontWeight="bold" sx={{ color: 'black' }}>Maikling Kwento</Typography>
                    </Paper>
                    <Paper
                      sx={{
                        p: 3,
                        textAlign: 'center',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 2,
                        boxShadow: 2,
                        bgcolor: '#a9e6c8',
                        cursor: 'pointer',
                        minWidth: 'calc(25% - 18px)',
                        minHeight: 200,
                        transition: 'box-shadow 0.2s',
                        '&:hover': { 
                          boxShadow: 6,
                          bgcolor: '#FFF9C4'
                        },
                      }}
                    >
                      <Typography variant="h5" fontWeight="bold" sx={{ color: 'black' }}>Tula</Typography>
                    </Paper>
                    <Paper
                      sx={{
                        p: 3,
                        textAlign: 'center',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 2,
                        boxShadow: 2,
                        bgcolor: '#a9e6c8',
                        cursor: 'pointer',
                        minWidth: 'calc(25% - 18px)',
                        minHeight: 200,
                        transition: 'box-shadow 0.2s',
                        '&:hover': { 
                          boxShadow: 6,
                          bgcolor: '#FFF9C4'
                        },
                      }}
                    >
                      <Typography variant="h5" fontWeight="bold" sx={{ color: 'black' }}>Dula</Typography>
                    </Paper>
                    <Paper
                      sx={{
                        p: 3,
                        textAlign: 'center',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 2,
                        boxShadow: 2,
                        bgcolor: '#a9e6c8',
                        cursor: 'pointer',
                        minWidth: 'calc(25% - 18px)',
                        minHeight: 200,
                        transition: 'box-shadow 0.2s',
                        '&:hover': { 
                          boxShadow: 6,
                          bgcolor: '#FFF9C4'
                        },
                      }}
                    >
                      <Typography variant="h5" fontWeight="bold" sx={{ color: 'black' }}>Nobela</Typography>
                    </Paper>
                    <Paper
                      sx={{
                        p: 3,
                        textAlign: 'center',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 2,
                        boxShadow: 2,
                        bgcolor: '#a9e6c8',
                        cursor: 'pointer',
                        minWidth: 'calc(25% - 18px)',
                        minHeight: 200,
                        transition: 'box-shadow 0.2s',
                        '&:hover': { 
                          boxShadow: 6,
                          bgcolor: '#FFF9C4'
                        },
                      }}
                    >
                      <Typography variant="h5" fontWeight="bold" sx={{ color: 'black' }}>Sanaysay</Typography>
                    </Paper>
                    <Paper
                      sx={{
                        p: 3,
                        textAlign: 'center',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 2,
                        boxShadow: 2,
                        bgcolor: '#a9e6c8',
                        cursor: 'pointer',
                        minWidth: 'calc(25% - 18px)',
                        minHeight: 200,
                        transition: 'box-shadow 0.2s',
                        '&:hover': { 
                          boxShadow: 6,
                          bgcolor: '#FFF9C4'
                        },
                      }}
                    >
                      <Typography variant="h5" fontWeight="bold" sx={{ color: 'black' }}>Awit</Typography>
                    </Paper>
                    <Paper
                      sx={{
                        p: 3,
                        textAlign: 'center',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 2,
                        boxShadow: 2,
                        bgcolor: '#a9e6c8',
                        cursor: 'pointer',
                        minWidth: 'calc(25% - 18px)',
                        minHeight: 200,
                        transition: 'box-shadow 0.2s',
                        '&:hover': { 
                          boxShadow: 6,
                          bgcolor: '#FFF9C4'
                        },
                      }}
                    >
                      <Typography variant="h5" fontWeight="bold" sx={{ color: 'black' }}>Korido</Typography>
                    </Paper>
                    <Paper
                      sx={{
                        p: 3,
                        textAlign: 'center',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 2,
                        boxShadow: 2,
                        bgcolor: '#a9e6c8',
                        cursor: 'pointer',
                        minWidth: 'calc(25% - 18px)',
                        minHeight: 200,
                        transition: 'box-shadow 0.2s',
                        '&:hover': { 
                          boxShadow: 6,
                          bgcolor: '#FFF9C4'
                        },
                      }}
                    >
                      <Typography variant="h5" fontWeight="bold" sx={{ color: 'black' }}>Epiko</Typography>
                    </Paper>
                    <Paper
                      sx={{
                        p: 3,
                        textAlign: 'center',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 2,
                        boxShadow: 2,
                        bgcolor: '#a9e6c8',
                        cursor: 'pointer',
                        minWidth: 'calc(25% - 18px)',
                        minHeight: 200,
                        transition: 'box-shadow 0.2s',
                        '&:hover': { 
                          boxShadow: 6,
                          bgcolor: '#FFF9C4'
                        },
                      }}
                    >
                      <Typography variant="h5" fontWeight="bold" sx={{ color: 'black' }}>Bugtong</Typography>
                    </Paper>
                    <Paper
                      sx={{
                        p: 3,
                        textAlign: 'center',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 2,
                        boxShadow: 2,
                        bgcolor: '#a9e6c8',
                        cursor: 'pointer',
                        minWidth: 'calc(25% - 18px)',
                        minHeight: 200,
                        transition: 'box-shadow 0.2s',
                        '&:hover': { 
                          boxShadow: 6,
                          bgcolor: '#FFF9C4'
                        },
                      }}
                    >
                      <Typography variant="h5" fontWeight="bold" sx={{ color: 'black' }}>Salawikain</Typography>
                    </Paper>
                    <Paper
                      sx={{
                        p: 3,
                        textAlign: 'center',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 2,
                        boxShadow: 2,
                        bgcolor: '#a9e6c8',
                        cursor: 'pointer',
                        minWidth: 'calc(25% - 18px)',
                        minHeight: 200,
                        transition: 'box-shadow 0.2s',
                        '&:hover': { 
                          boxShadow: 6,
                          bgcolor: '#FFF9C4'
                        },
                      }}
                    >
                      <Typography variant="h5" fontWeight="bold" sx={{ color: 'black' }}>Talumpati</Typography>
                    </Paper>
                    <Paper
                      sx={{
                        p: 3,
                        textAlign: 'center',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 2,
                        boxShadow: 2,
                        bgcolor: '#a9e6c8',
                        cursor: 'pointer',
                        minWidth: 'calc(25% - 18px)',
                        minHeight: 200,
                        transition: 'box-shadow 0.2s',
                        '&:hover': { 
                          boxShadow: 6,
                          bgcolor: '#FFF9C4'
                        },
                      }}
                    >
                      <Typography variant="h5" fontWeight="bold" sx={{ color: 'black' }}>Mitolohiya</Typography>
                    </Paper>
                    <Paper
                      sx={{
                        p: 3,
                        textAlign: 'center',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 2,
                        boxShadow: 2,
                        bgcolor: '#a9e6c8',
                        cursor: 'pointer',
                        minWidth: 'calc(25% - 18px)',
                        minHeight: 200,
                        transition: 'box-shadow 0.2s',
                        '&:hover': { 
                          boxShadow: 6,
                          bgcolor: '#FFF9C4'
                        },
                      }}
                    >
                      <Typography variant="h5" fontWeight="bold" sx={{ color: 'black' }}>Alamat</Typography>
                    </Paper>
                    <Paper
                      sx={{
                        p: 3,
                        textAlign: 'center',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 2,
                        boxShadow: 2,
                        bgcolor: '#a9e6c8',
                        cursor: 'pointer',
                        minWidth: 'calc(25% - 18px)',
                        minHeight: 200,
                        transition: 'box-shadow 0.2s',
                        '&:hover': { 
                          boxShadow: 6,
                          bgcolor: '#FFF9C4'
                        },
                      }}
                    >
                      <Typography variant="h5" fontWeight="bold" sx={{ color: 'black' }}>Parabula</Typography>
                    </Paper>
                    <Paper
                      sx={{
                        p: 3,
                        textAlign: 'center',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 2,
                        boxShadow: 2,
                        bgcolor: '#a9e6c8',
                        cursor: 'pointer',
                        minWidth: 'calc(25% - 18px)',
                        minHeight: 200,
                        transition: 'box-shadow 0.2s',
                        '&:hover': { 
                          boxShadow: 6,
                          bgcolor: '#FFF9C4'
                        },
                      }}
                    >
                      <Typography variant="h5" fontWeight="bold" sx={{ color: 'black' }}>Pabula</Typography>
                    </Paper>
                  </Box>

                  <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 3, px: 1 }} className="text-gray-800 dark:text-white">
                    Quick Actions
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 3, mb: 4 }}>
                    <Paper
                      onClick={handleAddStudentDialogOpen}
                      sx={{
                        p: 3,
                        textAlign: 'center',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 2,
                        boxShadow: 2,
                        bgcolor: isDarkMode ? theme.palette.grey[700] : 'white',
                        cursor: 'pointer',
                        minWidth: 220,
                        minHeight: 180,
                        transition: 'box-shadow 0.2s, background-color 0.3s',
                        '&:hover': { 
                          boxShadow: 6, 
                          bgcolor: isDarkMode ? theme.palette.grey[600] : alpha(theme.palette.grey[300], 0.2) 
                        },
                      }}
                    >
                      <Box
                        sx={{
                          bgcolor: '#2196f3',
                          width: 56,
                          height: 56,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 2,
                        }}
                      >
                        <GroupIcon sx={{ color: 'white', fontSize: 32 }} />
                      </Box>
                      <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }} className="text-gray-800 dark:text-white">
                        Add Student
                      </Typography>
                      <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                        Add a student to the class
                      </Typography>
                    </Paper>

                    <Paper
                      onClick={handleDeleteOpen}
                      sx={{
                        p: 3,
                        textAlign: 'center',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 2,
                        boxShadow: 2,
                        bgcolor: isDarkMode ? theme.palette.grey[700] : 'white',
                        cursor: 'pointer',
                        minWidth: 220,
                        minHeight: 180,
                        transition: 'box-shadow 0.2s, background-color 0.3s',
                        '&:hover': { boxShadow: 6, bgcolor: isDarkMode ? theme.palette.grey[600] : alpha(theme.palette.grey[300], 0.2) },
                      }}
                    >
                      <Box
                        sx={{
                          bgcolor: '#ef5350',
                          width: 56,
                          height: 56,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 2,
                        }}
                      >
                        <DeleteIcon sx={{ color: 'white', fontSize: 32 }} />
                      </Box>
                      <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }} className="text-gray-800 dark:text-white">
                        Delete Class
                      </Typography>
                      <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                        Permanently delete the class
                      </Typography>
                    </Paper>
                  </Box>
                </div>
              )}

              {activeMainContentTab === 'dashboard' && (
                <div className="w-full max-w-6xl p-8">
                  <ClassRecord
                    students={students}
                    stories={stories}
                    scores={scores}
                    studentsLoading={studentsLoading}
                    studentsError={studentsError}
                  />
                </div>
              )}
            </Box>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      {editDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl shadow-xl transition-colors duration-500">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-600">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Edit Class</h3>
              <button className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" onClick={handleEditClose}>
                <X size={18} color="#ef4444" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4 p-3 bg-[#a9e6c8] rounded-lg dark:bg-gray-700 transition-colors duration-300">
                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }} className="text-gray-800 dark:text-white">
                  Class Name:
                </Typography>
                <input
                  autoFocus
                  type="text"
                  name="className"
                  placeholder="Enter name of class..."
                  value={form.className}
                  onChange={handleFormChange}
                  className="w-full p-2 bg-white rounded-md border border-gray-300 dark:bg-gray-600 dark:border-gray-500 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7BD0A7] transition-colors duration-300"
                  required
                />
              </div>
              <div className="mb-4 p-3 bg-[#a9e6c8] rounded-lg dark:bg-gray-700 transition-colors duration-300">
                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }} className="text-gray-800 dark:text-white">
                  Class Description:
                </Typography>
                <textarea
                  name="description"
                  placeholder="Add class description..."
                  value={form.description}
                  onChange={handleFormChange}
                  rows={3}
                  className="w-full p-2 bg-white rounded-md border border-gray-300 dark:bg-gray-600 dark:border-gray-500 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7BD0A7] transition-colors duration-300 resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end p-4">
              <Button 
                onClick={handleEditSubmit} 
                variant="contained" 
                disabled={isSubmitting || !form.className.trim()}
                sx={{
                  bgcolor: '#7BD0A7',
                  '&:hover': { bgcolor: '#5bbd8b' },
                  borderRadius: '10px',
                  px: 3,
                  py: 1.5,
                  fontSize: '1rem',
                  color: '#1A4D2E',
                  fontWeight: 'medium',
                  textTransform: 'none',
                }}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      )}

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

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteClose} PaperProps={{ className: 'dark:bg-gray-800' }}>
        <DialogTitle className="text-gray-800 dark:text-white">Delete Class</DialogTitle>
        <DialogContent>
          <Typography className="text-gray-800 dark:text-white">Are you sure you want to delete this class?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteClose} disabled={isSubmitting} className="text-gray-800 dark:text-white">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Student Dialog */}
      <Dialog open={addStudentDialogOpen} onClose={handleAddStudentDialogClose} PaperProps={{ className: 'dark:bg-gray-800' }}>
        <DialogTitle className="text-gray-800 dark:text-white">Add Student to Class</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Search Student Name"
            type="text"
            fullWidth
            value={studentSearch}
            onChange={e => {
              setStudentSearch(e.target.value);
              if (e.target.value.length >= 2) {
                handleStudentSearch(e.target.value);
              } else {
                setStudentResults([]);
              }
            }}
            disabled={addStudentLoading}
            InputLabelProps={{ className: 'dark:text-gray-300' }}
            InputProps={{ className: 'text-gray-800 dark:text-white' }}
            sx={{
              '& label': { color: theme.palette.text.secondary },
              '& label.Mui-focused': { color: theme.palette.primary.main },
              '& .MuiInput-underline:after': { borderBottomColor: theme.palette.primary.main },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: theme.palette.divider },
                '&:hover fieldset': { borderColor: theme.palette.text.primary },
                '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main },
                '& input': { color: isDarkMode ? theme.palette.common.white : theme.palette.text.primary },
              },
              '& .MuiOutlinedInput-root.dark': {
                 '& fieldset': { borderColor: theme.palette.grey[600] },
                 '&:hover fieldset': { borderColor: theme.palette.grey[400] },
                 '&.Mui-focused fieldset': { borderColor: theme.palette.grey[400] },
              },
              '& .MuiInputLabel-root.dark': {
                 color: theme.palette.grey[400],
              }
            }}
          />
          {searchLoading && <Typography className="text-gray-800 dark:text-white">Searching...</Typography>}
          {studentResults.length > 0 && (
            <Box sx={{ maxHeight: 200, overflowY: 'auto', mt: 1 }}>
              {studentResults.map(student => (
                <Box
                  key={student.userId}
                  sx={{
                    p: 1,
                    cursor: 'pointer',
                    bgcolor: selectedStudent?.userId === student.userId ? (isDarkMode ? alpha(theme.palette.grey[500], 0.3) : alpha(theme.palette.action.selected, theme.palette.action.selectedOpacity)) : (isDarkMode ? theme.palette.grey[700] : theme.palette.background.paper),
                    '&:hover': { bgcolor: isDarkMode ? alpha(theme.palette.grey[500], 0.5) : alpha(theme.palette.action.hover, theme.palette.action.hoverOpacity) }
                  }}
                  onClick={() => setSelectedStudent(student)}
                >
                  <Typography className="text-gray-800 dark:text-white">
                    {student.userName} ({student.userEmail})
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
          {addStudentMessage && (
            <Typography sx={{ mt: 1 }} color={addStudentMessage.includes('success') ? 'success.main' : 'error'} className={addStudentMessage.includes('success') ? 'dark:text-green-400' : 'dark:text-red-400'}>
              {addStudentMessage}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddStudentDialogClose} disabled={addStudentLoading} className="text-gray-800 dark:text-white">
            Cancel
          </Button>
          <Button
            onClick={handleAddStudent}
            variant="contained"
            disabled={addStudentLoading || !selectedStudent}
          >
            {addStudentLoading ? 'Adding...' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Story View Dialog */}
      <Dialog
        open={viewStoryDialogOpen}
        onClose={handleCloseStoryView}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            height: '90vh',
            maxHeight: '90vh',
            className: 'dark:bg-gray-800'
          }
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          {selectedStory && (
            <StoryView
              story={selectedStory}
              onAttemptQuiz={() => {
                handleCloseStoryView();
              }}
            />
          )}
        </DialogContent>
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