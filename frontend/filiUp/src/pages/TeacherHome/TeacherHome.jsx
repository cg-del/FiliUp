import {
  Add as AddIcon,
  Assessment as AssessmentIcon,
  Group as GroupIcon,
  Logout as LogoutIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { CircleUserRound, BookOpen, GraduationCap, LogOut, User, Plus, X } from 'lucide-react';
import logo from '../../assets/logo.svg';

// Add axios base configuration
axios.defaults.baseURL = 'http://localhost:8080';
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Create axios instance with auth interceptor
const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add page transition styles
const pageTransitionStyles = `
  @keyframes slideOut {
    0% {
      transform: translateX(0);
      opacity: 1;
    }
    100% {
      transform: translateX(-100%);
      opacity: 0;
    }
  }

  .page-transition {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #7BD0A7;
    animation: slideOut 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    z-index: 9999;
  }
`;

export default function TeacherHome() {
  const theme = useTheme();
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [form, setForm] = useState({ className: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [storyDialogOpen, setStoryDialogOpen] = useState(false);
  const [activeItem, setActiveItem] = useState('my-classes'); // State for active sidebar item
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      return savedMode ? JSON.parse(savedMode) : false;
    }
    return false;
  });
  const [showSuccessPopup, setShowSuccessPopup] = useState(false); // State for success popup visibility
  const [renderSuccessPopup, setRenderSuccessPopup] = useState(false); // State to control rendering
  const [isAnimating, setIsAnimating] = useState(false); // State to control animation classes
  const [storyForm, setStoryForm] = useState({
    title: '',
    content: '',
    difficultyLevel: '',
    coverPicture: null,
    coverPicturePreview: null,
  });
  const [selectedStoryClass, setSelectedStoryClass] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [openUserMenu, setOpenUserMenu] = useState(false); // State for the user profile dropdown menu
  const userDropdownRef = useRef(null); // Ref for the user profile dropdown area
  const [isTransitioning, setIsTransitioning] = useState(false);

  const classCardImage = 'https://img.freepik.com/free-vector/kids-education-concept_23-2148498370.jpg?size=626&ext=jpg'; // Define classCardImage

  // Update effect to use html element for dark mode
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

  // Update the dark mode toggle handler
  const handleDarkModeToggle = () => {
    setIsDarkMode(prev => !prev);
  };

  // Function to toggle the user dropdown menu
  const toggleUserMenu = () => {
    setOpenUserMenu(prev => !prev);
  };

  const handleLogoutClick = () => {
    logout();
    setOpenUserMenu(false); // Close the menu after logout
  };

  const handleOpenDialog = (mode, classObj = null) => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setForm({ className: '', description: '' });
    setIsSubmitting(false);
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Create or update class
  const handleSubmit = async () => {
    if (!form.className.trim()) {
      alert('Class name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      if (openDialog) {
        const response = await api.post(`/api/classes?teacherId=${user.userId}`, {
          className: form.className,
          description: form.description,
          isActive: true
        });
        setClasses([...classes, response.data]);
        setOpenDialog(false); // Close create dialog
        setShowSuccessPopup(true); // Open success popup
      } else if (openDialog) {
        const response = await api.put(`/api/classes/${selectedStoryClass.classId}`, {
          className: form.className,
          description: form.description,
          isActive: selectedStoryClass.isActive
        });
        setClasses(classes.map(c => c.classId === selectedStoryClass.classId ? response.data : c));
      }
    } catch (error) {
      console.error('Error saving class:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        if (error.response.status === 401) {
          alert('Session expired. Please login again.');
          logout();
          return;
        }
      }
      alert('Error saving class. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fetch teacher's classes
  useEffect(() => {
    const fetchClasses = async () => {
      if (!user?.userId) return;
      
      try {
        const response = await api.get(`/api/classes/teacher/${user.userId}`);
        setClasses(response.data);
      } catch (error) {
        console.error('Error fetching classes:', error);
        if (error.response?.status === 401) {
          alert('Session expired. Please login again.');
          logout();
          return;
        }
        console.error('Failed to fetch classes. Please try again later.');
      }
    };

    fetchClasses();
  }, [user, logout]);

  const getInitials = (name) => {
    return name
      ? name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
      : '?';
  };

  // Handle class card click: navigate to lessons page
  const handleClassCardClick = (classObj) => {
    navigate(`/teacher/class/${classObj.classId}/lessons`);
  };

  // Handle story form changes
  const handleStoryFormChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'coverPicture' && files && files[0]) {
      setStoryForm((prev) => ({
        ...prev,
        coverPicture: files[0],
        coverPicturePreview: URL.createObjectURL(files[0]),
      }));
    } else {
      setStoryForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle story dialog close
  const handleStoryDialogClose = () => {
    setStoryDialogOpen(false);
    setSelectedStoryClass(null);
    setStoryForm({ title: '', content: '', difficultyLevel: '', coverPicture: null, coverPicturePreview: null });
  };

  // Handle story submit (scaffold only)
  const handleStorySubmit = (e) => {
    e.preventDefault();
    // TODO: Implement API call to create story
    alert('Story created! (API integration needed)');
    handleStoryDialogClose();
  };

  const handleMenuItemClick = (item) => { // Handler for menu item clicks
    setActiveItem(item);
    // Add navigation logic here if needed for other items
    // e.g., if (item === 'question-bank') navigate('/teacher/question-bank');
  };

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

  return (
    <div className="min-h-screen w-full flex bg-[#95dfc1] dark:bg-gray-900 transition-colors duration-500">
      {/* Sidebar */}
      <div className="w-56 flex flex-col items-center py-8 bg-[#7BD0A7] dark:bg-gray-900 transition-colors duration-500">
        <div className="bg-white dark:bg-gray-800 rounded-full shadow p-3 flex items-center justify-center mb-6 transition-colors duration-500" style={{ width: 96, height: 96 }}>
          <img src={logo} alt="FiliUp Logo" className="w-20 h-20 object-contain" />
        </div>
        <div className="flex flex-col gap-2 w-full px-2">
          {/* My Classes */}
          <div
            className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg font-semibold cursor-pointer transition-colors duration-500 ${activeItem === 'my-classes' ? 'bg-white dark:bg-gray-900 text-[#7BD0A7] dark:text-white' : 'text-black dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            onClick={() => handleMenuItemClick('my-classes')}
          >
            <GraduationCap size={22} color={activeItem === 'my-classes' ? "#7BD0A7" : (isDarkMode ? "#d1d5db" : "#6b7280")} />
            <span className="text-black dark:text-white">My Classes</span>
          </div>
          {/* Question Bank */}
          <div
            className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg font-semibold cursor-pointer transition-colors duration-500 ${activeItem === 'question-bank' ? 'bg-white dark:bg-gray-900 text-[#7BD0A7] dark:text-white' : 'text-black dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            onClick={() => handleMenuItemClick('question-bank')}
          >
            <BookOpen size={20} color={activeItem === 'question-bank' ? (isDarkMode ? "#d1d5db" : "#7BD0A7") : (isDarkMode ? "#d1d5db" : "#6b7280")} />
            <span className="text-black dark:text-gray-300">Question Bank</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-[#7BD0A7] dark:bg-gray-900 transition-colors duration-500 h-screen">
        <div className="flex-1 flex justify-center items-start py-10 px-6 overflow-hidden">
          <div className="main-content w-full max-w-8xl bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 flex flex-col transition-colors duration-500 h-[calc(100vh-5rem)] overflow-y-scroll teacher-scrollbar">
            {/* Top Navigation */}
            <div className="flex items-center justify-between mb-6 w-full sticky top-0 bg-white dark:bg-gray-800 z-10 pb-4 pr-[calc(100%-100vw+8px)] transition-colors duration-500">
              <h2 className="text-4xl font-bold text-gray-800 dark:text-white transition-colors duration-500">Classes</h2>
              <div className="flex items-center gap-4 flex-shrink-0">
                <button
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400"
                  onClick={handleDarkModeToggle}
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
                <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 7.165 6 9.388 6 12v2.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                </button>
                <div className="relative">
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
            {/* Dashboard Content */}
            <div className="flex flex-col items-center w-full mt-2 flex-1 overflow-y-auto teacher-scrollbar">
              <div className="w-full max-w-6xl">
                {Array.isArray(classes) && classes.length > 0 ? (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 transition-colors duration-500">Active Classes</h3>
                      <Button
                        variant="contained"
                        onClick={() => handleOpenDialog(true)}
                        sx={{
                           bgcolor: '#7BD0A7',
                          '&:hover': {
                            bgcolor: '#5bbd8b',
                          },
                          borderRadius: '10px',
                          px: 3,
                          py: 1.5,
                          fontSize: '1rem',
                          color: 'white',
                          fontWeight: 'bold',
                          textTransform: 'none',
                        }}
                      >
                        Create Class
                      </Button>
                    </div>
                    <div className="flex flex-col gap-6 w-full">
                      {Array.isArray(classes) && classes.map((classObj, idx) => (
                        <div
                          key={classObj.classId || idx}
                          onClick={() => handleClassCardClick(classObj)}
                          className="bg-white dark:bg-gray-700 rounded-xl shadow-sm cursor-pointer w-full overflow-hidden border border-gray-100 dark:border-gray-600 hover:shadow-md transition-all duration-300 ease-in-out transform hover:-translate-y-1 active:scale-[0.98] active:translate-y-0"
                        >
                          <div className="w-full h-36 bg-gray-200 dark:bg-gray-600 object-cover transition-transform duration-300 ease-in-out transform hover:scale-[1.02]" style={{backgroundImage: `url(${classCardImage})`, backgroundSize: 'cover', backgroundPosition: 'center', borderTopLeftRadius: '0.75rem', borderTopRightRadius: '0.75rem'}} />
                          <div className="flex items-center justify-between px-6 py-6 bg-[#C8F2DF] dark:bg-gray-600 transition-colors duration-500" style={{ borderBottomLeftRadius: '0.75rem', borderBottomRightRadius: '0.75rem' }}>
                            <h4 className="text-lg font-semibold text-gray-800 dark:text-white transition-colors duration-500">{classObj.className}</h4>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center w-full py-24">
                    <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-4 transition-colors duration-500">No classes yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 transition-colors duration-500">You haven't created any classes yet.</p>
                    <Button
                      variant="contained"
                      onClick={() => handleOpenDialog(true)}
                      sx={{
                         bgcolor: '#7BD0A7',
                        '&:hover': {
                          bgcolor: '#5bbd8b',
                        },
                        borderRadius: '25px',
                        px: 3,
                        py: 1.5,
                        fontSize: '1rem',
                        color: 'white',
                        fontWeight: 'medium',
                        textTransform: 'none',
                      }}
                    >
                      Create Class
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
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

      {/* Dialog for Create Class */}
      {openDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl shadow-xl transition-colors duration-500">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-600">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Create Class</h3>
              <button className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" onClick={handleCloseDialog}>
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
                onClick={handleSubmit} 
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
                Create Class
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Story Management Dialog */}
      <Dialog open={storyDialogOpen} onClose={handleStoryDialogClose} maxWidth="md" fullWidth PaperProps={{ className: 'dark:bg-gray-800' }}>
        <DialogTitle className="text-gray-800 dark:text-white">
          {selectedStoryClass ? `Stories for ${selectedStoryClass.className}` : 'Stories'}
        </DialogTitle>
        <DialogContent>
          {/* Create Story Form */}
          <Box component="form" onSubmit={handleStorySubmit} sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom className="text-gray-800 dark:text-white">Create a New Story</Typography>
            <TextField
              name="title"
              label="Title"
              value={storyForm.title}
              onChange={handleStoryFormChange}
              fullWidth
              required
              sx={{
                mb: 2,
                '& .MuiInputLabel-root': { color: isDarkMode ? alpha(theme.palette.common.white, 0.7) : theme.palette.text.secondary },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: isDarkMode ? theme.palette.grey[600] : theme.palette.divider },
                  '&:hover fieldset': { borderColor: isDarkMode ? theme.palette.grey[400] : theme.palette.text.primary },
                  '&.Mui-focused fieldset': { borderColor: isDarkMode ? theme.palette.grey[400] : theme.palette.primary.main },
                  '& input': { color: isDarkMode ? theme.palette.common.white : theme.palette.text.primary },
                },
              }}
            />
            <TextField
              name="content"
              label="Content"
              value={storyForm.content}
              onChange={handleStoryFormChange}
              fullWidth
              required
              multiline
              rows={4}
              sx={{
                mb: 2,
                '& .MuiInputLabel-root': { color: isDarkMode ? alpha(theme.palette.common.white, 0.7) : theme.palette.text.secondary },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: isDarkMode ? theme.palette.grey[600] : theme.palette.divider },
                  '&:hover fieldset': { borderColor: isDarkMode ? theme.palette.grey[400] : theme.palette.text.primary },
                  '&.Mui-focused fieldset': { borderColor: isDarkMode ? theme.palette.grey[400] : theme.palette.primary.main },
                  '& textarea': { color: isDarkMode ? theme.palette.common.white : theme.palette.text.primary },
                },
              }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="difficulty-label" sx={{ color: isDarkMode ? alpha(theme.palette.common.white, 0.7) : theme.palette.text.secondary }}>Difficulty</InputLabel>
              <Select
                labelId="difficulty-label"
                name="difficultyLevel"
                value={storyForm.difficultyLevel}
                label="Difficulty"
                onChange={handleStoryFormChange}
                required
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: isDarkMode ? theme.palette.grey[600] : theme.palette.divider },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: isDarkMode ? theme.palette.grey[400] : theme.palette.text.primary },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: isDarkMode ? theme.palette.grey[400] : theme.palette.primary.main },
                  '& .MuiSelect-select': { color: isDarkMode ? theme.palette.common.white : theme.palette.text.primary },
                  '& .MuiSvgIcon-root': { color: isDarkMode ? alpha(theme.palette.common.white, 0.7) : theme.palette.action.active },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      bgcolor: isDarkMode ? theme.palette.grey[700] : theme.palette.background.paper,
                      '& .MuiMenuItem-root': {
                        color: isDarkMode ? theme.palette.common.white : theme.palette.text.primary,
                        '&:hover': { bgcolor: isDarkMode ? alpha(theme.palette.common.white, 0.1) : theme.palette.action.hover },
                      },
                    },
                  },
                }}
              >
                <MenuItem value="BEGINNER">Beginner</MenuItem>
                <MenuItem value="INTERMEDIATE">Intermediate</MenuItem>
                <MenuItem value="ADVANCED">Advanced</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              component="label"
              sx={{
                mb: 2,
                bgcolor: '#7BD0A7',
                '&:hover': { bgcolor: '#5bbd8b' },
                color: 'white',
                fontWeight: 'medium',
                textTransform: 'none',
              }}
            >
              Upload Cover Image
              <input
                type="file"
                accept="image/*"
                hidden
                name="coverPicture"
                onChange={handleStoryFormChange}
              />
            </Button>
            {storyForm.coverPicturePreview && (
              <Box sx={{ mb: 2 }}>
                <img
                  src={storyForm.coverPicturePreview}
                  alt="Cover Preview"
                  style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8 }}
                />
              </Box>
            )}
            <DialogActions>
              <Button onClick={handleStoryDialogClose} className="text-gray-800 dark:text-white">Cancel</Button>
              <Button type="submit" variant="contained" sx={{
                 bgcolor: '#7BD0A7',
                 '&:hover': { bgcolor: '#5bbd8b' },
                 color: 'white',
                 fontWeight: 'medium',
                 textTransform: 'none',
              }}>Create Story</Button>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>

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
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Class Created!</h2>
              <Typography variant="body2" sx={{ mb: 3 }} className="text-gray-600 dark:text-gray-300">
                You have successfully created a class. You can now view your classes by clicking the button below.
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
                View Classes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 