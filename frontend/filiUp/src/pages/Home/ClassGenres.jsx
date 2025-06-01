"use client"
import { useState, useEffect } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { ArrowLeft, Search, Bell, User, LogOut, ChevronLeft, GraduationCap, BookOpen, Code, Award } from "lucide-react"
import { Button, Typography, Box, Paper } from '@mui/material'
import { alpha } from '@mui/material/styles'
import logo from '../../assets/logo.svg'
import { useUser } from '../../context/UserContext'

const GENRE_OPTIONS = [
  { value: 'MAIKLING_KWENTO', label: 'Maikling Kwento' },
  { value: 'TULA', label: 'Tula' },
  { value: 'DULA', label: 'Dula' },
  { value: 'NOBELA', label: 'Nobela' },
  { value: 'SANAYSAY', label: 'Sanaysay' },
  { value: 'AWIT', label: 'Awit' },
  { value: 'KORIDO', label: 'Korido' },
  { value: 'EPIKO', label: 'Epiko' },
  { value: 'BUGTONG', label: 'Bugtong' },
  { value: 'SALAWIKAIN', label: 'Salawikain' },
  { value: 'TALUMPATI', label: 'Talumpati' },
  { value: 'MITOLOHIYA', label: 'Mitolohiya' },
  { value: 'ALAMAT', label: 'Alamat' },
  { value: 'PARABULA', label: 'Parabula' },
  { value: 'PABULA', label: 'Pabula' }
]

export default function ClassGenres() {
  const [className, setClassName] = useState("")
  const [availableGenres, setAvailableGenres] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userName, setUserName] = useState("")
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      return savedMode ? JSON.parse(savedMode) : false;
    } else {
      return false;
    }
  })
  const [openUserMenu, setOpenUserMenu] = useState(false)
  const [myClassesOpen, setMyClassesOpen] = useState(true)
  const [activeItem, setActiveItem] = useState('my-classes')
  const { classId } = useParams()
  const navigate = useNavigate()
  const location = useLocation(); // Get location object to access state
  const { user, logout } = useUser();

  // Fetch class name
  useEffect(() => {
    const fetchClassName = async () => {
      // Use class name from navigation state if available
      if (location.state && location.state.className) {
        setClassName(location.state.className);
        // No need to fetch if we have it from state
        return;
      }

      // Fallback: Fetch class name if not available from state
      try {
        const response = await fetch(`http://localhost:8080/api/classes/${classId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
          credentials: 'include'
        });

        if (response.ok) {
          const classData = await response.json();
          setClassName(classData.className);
        } else {
          console.error('Failed to fetch class name:', await response.text());
          setClassName('Unknown Class'); // Set a default or indicate error
        }
      } catch (error) {
        console.error('Error fetching class name:', error);
        setClassName('Unknown Class'); // Set a default or indicate error
      }
    };

    fetchClassName();
  }, [classId, location.state]); // Re-fetch if classId changes or state changes

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
    const userInfo = JSON.parse(localStorage.getItem('user') || '{}')
    setUserName(userInfo.userName || '')
    fetchGenres()
  }, [classId])

  const fetchGenres = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/story/class/${classId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to fetch stories')
      }

      const stories = await response.json()
      
      const genres = [...new Set(stories.map(story => story.genre))]
      setAvailableGenres(genres)
      
    } catch (error) {
      console.error('Error fetching genres:', error)
      setError('Failed to load genres. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    navigate('/home')
  }

  const handleGenreClick = (genre) => {
    navigate(`/class/${classId}/genre/${genre}/stories`)
  }

  const getGenreLabel = (genreValue) => {
    return GENRE_OPTIONS.find(opt => opt.value === genreValue)?.label || genreValue
  }

  const toggleUserMenu = () => {
    setOpenUserMenu(prev => !prev)
  }

  const toggleMyClasses = () => { setMyClassesOpen(!myClassesOpen); }

  const handleMenuItemClick = (item) => {
    setActiveItem(item);
    if (item === 'my-classes') {
      toggleMyClasses();
    }
  };

  const getActiveItemLabel = (item) => {
    switch(item) {
      case 'my-classes': return 'My Classes';
      default: return '';
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const handleLogoutClick = () => {
    logout();
    setOpenUserMenu(false);
  };

  return (
    <div className="min-h-screen w-full flex bg-[#95dfc1] dark:bg-gray-900 transition-colors duration-300">
      {/* Sidebar */}
      <div className="w-56 flex flex-col items-center py-8 bg-[#7BD0A7] dark:bg-gray-900 transition-colors duration-300">
        <div className="bg-white dark:bg-gray-800 rounded-full shadow p-3 flex items-center justify-center mb-6 transition-colors duration-300" style={{ width: 96, height: 96 }}>
          <img src={logo} alt="FiliUp Logo" className="w-20 h-20 object-contain" />
        </div>
        <div className="flex flex-col gap-2 w-full px-2">
          <div
            className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg font-semibold cursor-pointer transition-colors duration-300 ${activeItem === 'my-classes' ? 'bg-white dark:bg-gray-900 text-[#7BD0A7] dark:text-white' : 'text-black dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            onClick={() => handleMenuItemClick('my-classes')}
          >
            <GraduationCap size={22} color={activeItem === 'my-classes' ? "#7BD0A7" : (isDarkMode ? "#d1d5db" : "#6b7280")} />
            <span className="text-black dark:text-white font-semibold">My Classes</span>
          </div>
          {myClassesOpen && (
            <div className="flex flex-col gap-1 pl-6">
              <div className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-gray-800 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300">
                <GraduationCap size={24} color={isDarkMode ? "#d1d5db" : "#6b7280"} />
                <span className="font-semibold">Mga Pangunahing Salita</span>
              </div>
              <div className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-gray-800 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300">
                <GraduationCap size={18} color={isDarkMode ? "#d1d5db" : "#6b7280"} />
                <span className="font-semibold">Mga Pangungusap</span>
              </div>
            </div>
          )}
          <div
            className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg cursor-pointer transition-colors duration-300 ${activeItem === 'study-area' ? 'text-[#7BD0A7] dark:text-white' : 'text-black dark:text-gray-300'} hover:bg-gray-100 dark:hover:bg-gray-700`}
            onClick={() => handleMenuItemClick('study-area')}
          >
            <BookOpen size={20} color={activeItem === 'study-area' ? (isDarkMode ? "#d1d5db" : "#7BD0A7") : (isDarkMode ? "#d1d5db" : "#6b7280")} />
            <span className="font-semibold">Study area</span>
          </div>
          <div
            className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg cursor-pointer transition-colors duration-300 ${activeItem === 'playground' ? 'text-[#7BD0A7] dark:text-white' : 'text-black dark:text-gray-300'} hover:bg-gray-100 dark:hover:bg-gray-700`}
            onClick={() => handleMenuItemClick('playground')}
          >
            <Code size={20} color={activeItem === 'playground' ? (isDarkMode ? "#d1d5db" : "#7BD0A7") : (isDarkMode ? "#d1d5db" : "#6b7280")} />
            <span className="font-semibold">Playground</span>
          </div>
          <div
            className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg cursor-pointer transition-colors duration-300 ${activeItem === 'certifications' ? 'text-[#7BD0A7] dark:text-white' : 'text-black dark:text-gray-300'} hover:bg-gray-100 dark:hover:bg-gray-700`}
            onClick={() => handleMenuItemClick('certifications')}
          >
            <Award size={20} color={activeItem === 'certifications' ? (isDarkMode ? "#d1d5db" : "#7BD0A7") : (isDarkMode ? "#d1d5db" : "#6b7280")} />
            <span className="font-semibold">Certifications</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-[#7BD0A7] dark:bg-gray-900 transition-colors duration-300 min-h-screen">
        <div className="flex-1 flex flex-col justify-start items-center px-6 py-10">
          <div className="main-content w-full max-w-8xl bg-white dark:bg-gray-800 rounded-2xl shadow-lg flex flex-col transition-colors duration-300 teacher-scrollbar" style={{ 
            height: 'calc(100vh - 80px)',
            overflow: 'hidden'
          }}>
            {/* Top Navigation within White Box */}
            <div className="flex items-center justify-between mb-6 w-full sticky top-0 bg-white dark:bg-gray-800 z-10 px-8 pt-8 pb-0 transition-colors duration-300">
              <div className="flex items-center">
                <Button
                  variant="text"
                  startIcon={<ChevronLeft size={24} />}
                  onClick={handleBack}
                  sx={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: '#7BD0A7',
                    minWidth: 'auto',
                    padding: '4px',
                  }}
                >
                </Button>
                <Typography variant="h4" fontWeight="bold" sx={{ ml: 2 }} className="text-gray-800 dark:text-white">
                  {className} <span style={{ color: 'gray', fontWeight: 'normal' }}>Genre</span>
                </Typography>
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
                <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300 text-gray-600 dark:text-gray-400 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 7.165 6 9.388 6 12v2.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                </button>
                <div className="relative">
                  <div
                    className="flex items-center gap-3 bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1 cursor-pointer transition-colors duration-300"
                    onClick={toggleUserMenu}
                  >
                    <div className="flex flex-col items-end mr-2">
                      <span className="font-bold text-gray-800 dark:text-white leading-tight text-md">{userName}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 leading-tight">Mag-aaral</span>
                    </div>
                    <img
                      src="https://randomuser.me/api/portraits/lego/1.jpg"
                      alt="Profile"
                      className="w-10 h-10 rounded-full object-cover border-2 border-white shadow"
                    />
                  </div>
                  {openUserMenu && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg z-50 transition-colors duration-300">
                      <div className="flex items-center gap-3 p-3 text-gray-700 dark:text-gray-200 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-300">
                        <User size={18} color={isDarkMode ? "#d1d5db" : "#4b5563"} />
                        <span>Aking Account</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 text-gray-700 dark:text-gray-200 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-300" onClick={handleLogoutClick}>
                        <LogOut size={18} color={isDarkMode ? "#d1d5db" : "#4b5563"} />
                        <span>Mag-sign Out</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Content Area */}
            <Box className="flex-1 p-8 overflow-y-auto teacher-scrollbar" style={{ height: 'calc(100% - 80px)' }}>
              {/* Welcome Description - Always render */}
              <Typography variant="h6" fontWeight="medium" gutterBottom sx={{ mb: 1 }} className="text-gray-800 dark:text-white">
                Welcome back, kids! Get ready for a new adventure in learning—FiliUp is excited to have you back!
              </Typography>
              <Typography variant="body1" sx={{ mb: 4, color: 'gray' }} className="text-gray-600 dark:text-gray-300">
                Now it's time to pick a genre—choose the one that excites you most and get ready to explore stories that match your style!
              </Typography>

              {/* Genre Cards - Conditional Rendering */}
              {loading ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Loading genres...
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-500">
                  {error}
                </div>
              ) : (
                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                  {GENRE_OPTIONS.map((genre, index) => (
                    <Paper
                      key={genre.value}
                      onClick={() => handleGenreClick(genre.value)}
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
                        transition: 'box-shadow 0.2s, background-color 0.3s',
                        '&:hover': { boxShadow: 6, bgcolor: '#FFF9C4' },
                      }}
                    >
                      <Typography variant="h5" fontWeight="bold" className="text-gray-800 dark:text-gray-800">
                        {genre.label}
                      </Typography>
                    </Paper>
                  ))}
                </Box>
              )}
            </Box>
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
  )
} 