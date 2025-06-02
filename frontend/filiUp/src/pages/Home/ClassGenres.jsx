"use client"
import { useState, useEffect } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { ArrowLeft, User, LogOut, ChevronLeft, GraduationCap, BookOpen, Code, Award, ChevronRight } from "lucide-react"
import { Button, Typography, Box, Paper } from '@mui/material'
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
  const location = useLocation()
  const { logout } = useUser()

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

      await response.json() // We're fetching but not using the result to fix linter error
      
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

  const toggleUserMenu = () => {
    setOpenUserMenu(prev => !prev)
  }

  const toggleMyClasses = () => { 
    setMyClassesOpen(!myClassesOpen) 
  }

  const handleMenuItemClick = (item) => {
    setActiveItem(item);
    if (item === 'my-classes') {
      toggleMyClasses();
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
    <div className="min-h-screen w-full flex bg-gradient-to-br from-cyan-600 to-teal-600 dark:bg-gray-900 transition-colors duration-500">
      {/* Sidebar */}
      <div className="w-56 flex flex-col items-center py-8 bg-cyan-600 dark:bg-gray-900 transition-colors duration-500">
        <div className="bg-white dark:bg-gray-800 rounded-full shadow p-3 flex items-center justify-center mb-6 transition-colors duration-500" style={{ width: 96, height: 96 }}>
          <img src={logo} alt="FiliUp Logo" className="w-20 h-20 object-contain" />
        </div>
        <div className="flex flex-col gap-2 w-full px-2">
          <div
            className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg font-semibold cursor-pointer transition-colors duration-500 ${activeItem === 'my-classes' ? 'bg-white dark:bg-gray-700 text-cyan-600 dark:text-white' : 'text-black dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            onClick={() => handleMenuItemClick('my-classes')}
          >
            <GraduationCap size={22} color={activeItem === 'my-classes' ? "#0891b2" : (isDarkMode ? "#d1d5db" : "#6b7280")} />
            <span className="text-black dark:text-white">My Classes</span>
          </div>
          {myClassesOpen && (
            <div className="flex flex-col gap-1 pl-6">
              <div className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-gray-800 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-500">
                <GraduationCap size={24} color={isDarkMode ? "#d1d5db" : "#6b7280"} />
                <span className="font-semibold">Mga Pangunahing Salita</span>
              </div>
              <div className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-gray-800 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-500">
                <GraduationCap size={18} color={isDarkMode ? "#d1d5db" : "#6b7280"} />
                <span className="font-semibold">Mga Pangungusap</span>
              </div>
            </div>
          )}
          <div
            className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg cursor-pointer transition-colors duration-500 ${activeItem === 'study-area' ? 'text-cyan-600 dark:text-white' : 'text-black dark:text-gray-300'} hover:bg-gray-100 dark:hover:bg-gray-700`}
            onClick={() => handleMenuItemClick('study-area')}
          >
            <BookOpen size={20} color={activeItem === 'study-area' ? (isDarkMode ? "#d1d5db" : "#0891b2") : (isDarkMode ? "#d1d5db" : "#6b7280")} />
            <span className="font-semibold">Study area</span>
          </div>
          <div
            className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg cursor-pointer transition-colors duration-500 ${activeItem === 'playground' ? 'text-cyan-600 dark:text-white' : 'text-black dark:text-gray-300'} hover:bg-gray-100 dark:hover:bg-gray-700`}
            onClick={() => handleMenuItemClick('playground')}
          >
            <Code size={20} color={activeItem === 'playground' ? (isDarkMode ? "#d1d5db" : "#0891b2") : (isDarkMode ? "#d1d5db" : "#6b7280")} />
            <span className="font-semibold">Playground</span>
          </div>
          <div
            className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg cursor-pointer transition-colors duration-500 ${activeItem === 'certifications' ? 'text-cyan-600 dark:text-white' : 'text-black dark:text-gray-300'} hover:bg-gray-100 dark:hover:bg-gray-700`}
            onClick={() => handleMenuItemClick('certifications')}
          >
            <Award size={20} color={activeItem === 'certifications' ? (isDarkMode ? "#d1d5db" : "#0891b2") : (isDarkMode ? "#d1d5db" : "#6b7280")} />
            <span className="font-semibold">Certifications</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex justify-center items-start py-10 px-6 bg-cyan-600 dark:bg-gray-900 transition-colors duration-500 h-screen overflow-hidden">
        <div className="w-full max-w-8xl bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 flex flex-col justify-start pb-16 transition-colors duration-500 h-full overflow-y-auto">
          {/* Top Navigation */}
          <div className="flex items-center justify-between mb-6 w-full">
            <div className="flex items-center">
              <button
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-300 mr-3"
                onClick={handleBack}
              >
                <ChevronLeft size={24} className="text-gray-600 dark:text-gray-300" />
              </button>
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white transition-colors duration-500">
                {className} <span className="text-gray-500 dark:text-gray-400 font-normal">Genres</span>
              </h2>
            </div>

            <div className="flex items-center gap-4">
              {/* Dark Mode Toggle Button */}
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
              <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300 text-gray-600 dark:text-gray-400 flex items-center relative">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 7.165 6 9.388 6 12v2.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">3</span>
              </button>
              <div className="relative">
                <div
                  className="flex items-center gap-3 bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1 cursor-pointer transition-colors duration-300"
                  onClick={toggleUserMenu}
                >
                  <div className="flex flex-col items-end mr-2">
                    <span className="font-bold text-gray-800 dark:text-white leading-tight text-md">{userName}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-500 leading-tight">Mag-aaral</span>
                  </div>
                  <img
                    src="https://randomuser.me/api/portraits/lego/1.jpg"
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover border-2 border-white shadow"
                  />
                </div>
                {openUserMenu && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg z-50">
                    <div className="flex items-center gap-3 p-3 text-gray-700 dark:text-gray-200 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-500" onClick={() => setOpenUserMenu(false)}>
                      <User size={18} color={isDarkMode ? "#d1d5db" : "#4b5563"} />
                      <span>Aking Account</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 text-gray-700 dark:text-gray-200 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-500" onClick={handleLogoutClick}>
                      <LogOut size={18} color={isDarkMode ? "#d1d5db" : "#4b5563"} />
                      <span>Mag-sign Out</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto teacher-scrollbar">
            {/* Welcome Description */}
            <div className="mb-8">
              <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2 transition-colors duration-500">
                Welcome back to {className}!
              </h3>
              <p className="text-gray-600 dark:text-gray-300 transition-colors duration-500">
                Choose a genre below to explore stories and lessons. Each genre offers unique learning experiences to enhance your Filipino language skills.
              </p>
            </div>

            {/* Genre Cards Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
              </div>
            ) : error ? (
              <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
                <p className="font-medium">{error}</p>
                <p className="text-sm mt-1">Please try refreshing the page or contact support if the problem persists.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {GENRE_OPTIONS.map((genre) => (
                  <div 
                    key={genre.value}
                    onClick={() => handleGenreClick(genre.value)}
                    className="bg-white dark:bg-gray-700 rounded-xl shadow-md hover:shadow-lg overflow-hidden cursor-pointer transition-all duration-300 border border-gray-100 dark:border-gray-600"
                  >
                    <div className="h-24 bg-gradient-to-r from-cyan-500 to-teal-500 flex items-center justify-center">
                      <div className="bg-white/20 p-3 rounded-full">
                        <BookOpen size={32} color="white" />
                      </div>
                    </div>
                    <div className="p-5">
                      <h4 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">{genre.label}</h4>
                      <p className="text-gray-500 dark:text-gray-300 text-sm mb-4">
                        Explore {genre.label} stories and improve your Filipino skills.
                      </p>
                      <div className="flex justify-end">
                        <button className="bg-gradient-to-r from-cyan-600 to-teal-600 text-white px-3 py-1 rounded-lg text-sm font-medium hover:from-cyan-700 hover:to-teal-700 transition-colors flex items-center">
                          <span>View Stories</span>
                          <ChevronRight size={16} className="ml-1" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
          background: rgba(123, 208, 167, 0.3);
          border-radius: 3px;
        }

        .teacher-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(123, 208, 167, 0.5);
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
          scrollbar-color: rgba(123, 208, 167, 0.3) transparent;
        }

        .dark .teacher-scrollbar {
          scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
        }
      `}</style>
    </div>
  )
} 