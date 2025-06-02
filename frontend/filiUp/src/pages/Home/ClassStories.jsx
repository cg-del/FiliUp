"use client"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { BookOpen, Award, Play, Users, Home, FileText, Target, User, Bell, Settings, ChevronLeft, LogOut, GraduationCap, Code } from "lucide-react"
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material'
import { Button, Typography } from '@mui/material'
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

export default function ClassStories() {
  const [stories, setStories] = useState([])
  const [className, setClassName] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedStory, setSelectedStory] = useState(null)
  const [userName, setUserName] = useState("")
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      return savedMode ? JSON.parse(savedMode) : false;
    }
    return false;
  })
  const [openUserMenu, setOpenUserMenu] = useState(false)
  const [myClassesOpen, setMyClassesOpen] = useState(true)
  const [activeItem, setActiveItem] = useState('my-classes')
  const { classId, genre } = useParams()
  const navigate = useNavigate()
  const { logout } = useUser()

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
    setUserName(userInfo.userName || '');
    fetchStories()
  }, [classId, genre])

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

  const fetchStories = async () => {
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

      const data = await response.json()
      const filteredStories = genre 
        ? data.filter(story => story.genre === genre)
        : data
      
      setStories(filteredStories)
      
      if (data.length > 0 && data[0].classEntity) {
        setClassName(data[0].classEntity.className)
      }
    } catch (error) {
      console.error('Error fetching stories:', error)
      setError('Failed to load stories. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    if (genre) {
      navigate(`/class/${classId}/genres`, { state: { className: className } });
    } else {
      navigate(-1)
    }
  }

  const getGenreLabel = (genreValue) => {
    return GENRE_OPTIONS.find(opt => opt.value === genreValue)?.label || genreValue
  }

  const openModal = (story) => {
    setSelectedStory(story)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setSelectedStory(null)
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
          {/* My Classes */}
          <div
            className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg font-semibold cursor-pointer transition-colors duration-500 ${activeItem === 'my-classes' ? 'bg-white dark:bg-gray-700 text-cyan-600 dark:text-white' : 'text-black dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            onClick={() => handleMenuItemClick('my-classes')}
          >
            <GraduationCap size={22} color={activeItem === 'my-classes' ? "#0891b2" : (isDarkMode ? "#d1d5db" : "#6b7280")} />
            <span className="text-black dark:text-white">My Classes</span>
          </div>
          {/* Collapsible sub-items */}
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
          {/* Study Area */}
          <div
            className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg cursor-pointer transition-colors duration-500 ${activeItem === 'study-area' ? 'text-cyan-600 dark:text-white' : 'text-black dark:text-gray-300'} hover:bg-gray-100 dark:hover:bg-gray-700`}
            onClick={() => handleMenuItemClick('study-area')}
          >
            <BookOpen size={20} color={activeItem === 'study-area' ? (isDarkMode ? "#d1d5db" : "#0891b2") : (isDarkMode ? "#d1d5db" : "#6b7280")} />
            <span className="font-semibold">Study area</span>
          </div>
          {/* Playground */}
          <div
            className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg cursor-pointer transition-colors duration-500 ${activeItem === 'playground' ? 'text-cyan-600 dark:text-white' : 'text-black dark:text-gray-300'} hover:bg-gray-100 dark:hover:bg-gray-700`}
            onClick={() => handleMenuItemClick('playground')}
          >
            <Code size={20} color={activeItem === 'playground' ? (isDarkMode ? "#d1d5db" : "#0891b2") : (isDarkMode ? "#d1d5db" : "#6b7280")} />
            <span className="font-semibold">Playground</span>
          </div>
          {/* Certifications */}
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
                {genre ? getGenreLabel(genre) : "Stories"} <span className="text-gray-500 dark:text-gray-400 font-normal">Collection</span>
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
                  onClick={() => setOpenUserMenu(!openUserMenu)}
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
            {/* Description */}
            <div className="mb-8">
              <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2 transition-colors duration-500">
                Explore {genre ? getGenreLabel(genre) : "Stories"}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 transition-colors duration-500">
                Choose a story that sparks your curiosity and imagination—let the adventure begin!
              </p>
            </div>

            {/* Stories Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-4 rounded-lg">
                {error}
              </div>
            ) : stories.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No stories available</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {genre ? `No stories found for ${getGenreLabel(genre)}` : 'No stories available for this class yet.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 p-4">
                {stories.map((story) => (
                  <div key={story.storyId} className="book-wrapper perspective-1000">
                    {/* Book Container */}
                    <div className="book-container">
                      {/* Front Cover */}
                      <div className="book-front">
                        {/* Spine */}
                        <div className="book-spine">
                          <div className="spine-title">{story.title}</div>
                        </div>
                        
                        {/* Cover */}
                        <div className="book-cover">
                          {/* Genre Badge */}
                          <div className="absolute top-4 left-4 z-10">
                            <span className="bg-emerald-900/90 backdrop-blur-sm text-white text-sm px-3 py-1 rounded-full border border-white/20">
                              {getGenreLabel(story.genre)}
                            </span>
                          </div>

                          {/* Cover Image & Overlay */}
                          <div className="w-full h-full relative overflow-hidden rounded-r-lg">
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/90 via-emerald-800/80 to-emerald-900/90 z-[1]" />
                            <div className="absolute inset-0 bg-[url('/patterns/filipino-pattern.png')] opacity-40 z-[2]" />
                            <img
                              src={story.coverPictureUrl || 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'}
                              alt={story.title}
                              className="w-full h-full object-cover"
                            />
                            
                            {/* Content Overlay */}
                            <div className="absolute inset-0 flex flex-col justify-end p-6 z-10">
                              {/* Decorative Line */}
                              <div className="w-16 h-1 bg-white/30 mb-4 rounded-full" />
                              
                              {/* Title */}
                              <h2 className="text-2xl font-bold text-white mb-3 font-serif">{story.title}</h2>
                              
                              

                              {/* Action Button */}
                              <button
                                onClick={() => openModal(story)}
                                className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-lg py-3 flex items-center justify-center gap-2 transition-all duration-300 backdrop-blur-sm hover:scale-105"
                              >
                                <BookOpen className="w-4 h-4" />
                                Buksan ang Libro
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Back Cover (Details Panel) */}
                      <div className="book-back">
                        <div className="p-6 bg-emerald-900/95 backdrop-blur-md h-full rounded-lg border border-white/10">
                          <h3 className="text-lg font-bold text-white mb-3">Tungkol sa Kwento</h3>
                          <p className="text-white/80 text-sm line-clamp-6 mb-4">{story.content}</p>
                          <div className="absolute bottom-6 left-6 right-6">
                            <button
                              onClick={() => openModal(story)}
                              className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-lg py-3 flex items-center justify-center gap-2 transition-all duration-300 backdrop-blur-sm"
                            >
                              <BookOpen className="w-4 h-4" />
                              Simulan ang Pagbabasa
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Story Modal */}
      <Dialog
        open={modalOpen}
        onClose={closeModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          className: "dark:bg-gray-800",
          style: { borderRadius: '12px' }
        }}
      >
        <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
          {selectedStory?.title}
        </DialogTitle>
        <DialogContent>
          <Typography
            variant="body1"
            className="text-gray-700 dark:text-gray-300"
            style={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}
          >
            {selectedStory?.content}
          </Typography>
        </DialogContent>
        <DialogActions className="p-4 border-t dark:border-gray-700">
          <button
            onClick={closeModal}
            className="px-4 py-2 text-emerald-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            Isara
          </button>
          <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg">
            Simulan ang Quiz
          </button>
        </DialogActions>
      </Dialog>

      <style jsx="true">{`
        .perspective-1000 {
          perspective: 1000px;
          height: 480px;
        }

        .book-container {
          position: relative;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          transition: transform 1s;
        }

        .book-wrapper:hover .book-container {
          transform: rotateY(-180deg);
        }

        .book-front,
        .book-back {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          transform-style: preserve-3d;
        }

        .book-front {
          display: flex;
          transform: translateZ(20px);
        }

        .book-back {
          transform: rotateY(180deg);
        }

        .book-spine {
          width: 40px;
          background: linear-gradient(to right, #064e3b, #065f46);
          border-radius: 4px 0 0 4px;
          display: flex;
          align-items: center;
          padding: 20px 0;
          box-shadow: inset -2px 0 5px rgba(0, 0, 0, 0.2);
        }

        .spine-title {
          writing-mode: vertical-rl;
          transform: rotate(180deg);
          color: white;
          font-weight: bold;
          text-align: center;
          width: 100%;
          font-size: 0.9rem;
          opacity: 0.9;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }

        .book-cover {
          flex: 1;
          background: #065f46;
          border-radius: 0 4px 4px 0;
          overflow: hidden;
          position: relative;
          box-shadow: 
            0 10px 20px rgba(0, 0, 0, 0.2),
            0 6px 6px rgba(0, 0, 0, 0.1),
            inset -1px 0 0 rgba(255, 255, 255, 0.1);
        }

        .book-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 40px;
          width: calc(100% - 40px);
          height: 100%;
          background: linear-gradient(to right, rgba(0, 0, 0, 0.1) 0%, transparent 5%);
          z-index: 2;
          pointer-events: none;
        }

        .book-wrapper::after {
          content: '';
          position: absolute;
          bottom: -20px;
          left: 10%;
          width: 80%;
          height: 20px;
          background: rgba(0, 0, 0, 0.2);
          filter: blur(10px);
          border-radius: 50%;
        }

        .teacher-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .teacher-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .teacher-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(16, 185, 129, 0.3);
          border-radius: 3px;
        }

        .teacher-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(16, 185, 129, 0.5);
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
          scrollbar-color: rgba(16, 185, 129, 0.3) transparent;
        }

        .dark .teacher-scrollbar {
          scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
        }
      `}</style>
    </div>
  )
} 