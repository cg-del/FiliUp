"use client"
import { useState, useRef, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import {
  Menu,
  GraduationCap,
  BookOpen,
  Plus,
  User,
  LogOut,
  X,
  Code,
  Award,
  ChevronRight,
} from "lucide-react"
import { useUser } from "../../context/UserContext"
import logo from '../../assets/logo.svg';
import { Typography, Button } from "@mui/material"

export default function StudentDashboard() {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [joinClassModalOpen, setJoinClassModalOpen] = useState(false)
  const [classCode, setClassCode] = useState("")
  const [enrolledClasses, setEnrolledClasses] = useState([])
  const [enrollmentError, setEnrollmentError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [myClassesOpen, setMyClassesOpen] = useState(true)
  const [activeItem, setActiveItem] = useState('my-classes');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      return savedMode ? JSON.parse(savedMode) : false; // Default to light mode if no preference is saved
    } else {
      return false; // Default to light mode on the server
    }
  })
  const dropdownRef = useRef(null)
  const modalRef = useRef(null)
  const { user, isAuthenticated, loading, logout } = useUser()
  const navigate = useNavigate()
  const classCardImage = 'https://img.freepik.com/free-vector/kids-education-concept_23-2148498370.jpg?size=626&ext=jpg';
  const [showStatusPopup, setShowStatusPopup] = useState(false);
  const [renderStatusPopup, setRenderStatusPopup] = useState(false);
  const [isStatusAnimating, setIsStatusAnimating] = useState(false);
  const [statusPopupMessage, setStatusPopupMessage] = useState('');
  const [isSuccessStatus, setIsSuccessStatus] = useState(true); // true for success, false for error

  // Effect to manage popup rendering and animation states
  useEffect(() => {
    if (showStatusPopup) {
      setRenderStatusPopup(true); // Start rendering immediately
      // Use a timeout to allow the component to be mounted before starting the animation
      const timeoutId = setTimeout(() => setIsStatusAnimating(true), 10);
      return () => clearTimeout(timeoutId);
    } else {
      setIsStatusAnimating(false); // Start exit animation
    }
  }, [showStatusPopup]);

  const toggleMyClasses = () => { setMyClassesOpen(!myClassesOpen); }

  // Fetch enrolled classes when component mounts
  useEffect(() => {
    if (user?.userId) {
      fetchEnrolledClasses()
    }
  }, [user])

  const fetchEnrolledClasses = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/classes/student/${user.userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        credentials: 'include'
      })
      if (response.ok) {
        const classes = await response.json()
        setEnrolledClasses(classes)
      } else {
        console.error('Failed to fetch enrolled classes:', await response.text())
      }
    } catch (error) {
      console.error('Error fetching enrolled classes:', error)
    }
  }

  // Manage dark mode class on html element and save preference
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

  const getInitials = () => {
    if (!user?.userName) return "U"
    try {
      return user.userName.charAt(0) || "U"
    } catch {
      return "U"
    }
  }

  const handleLogout = () => {
    logout()
    setDropdownOpen(false)
  }

  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  const handleMenuItemClick = (item) => {
    setActiveItem(item);
    if (item === 'my-classes') {
      toggleMyClasses();
    }
  };

  const openJoinClassModal = () => {
    setJoinClassModalOpen(true)
    setClassCode("")
  }

  const closeJoinClassModal = () => {
    setJoinClassModalOpen(false)
  }

  // Join class logic (original)
  const handleJoinClass = async () => {
    if (!classCode.trim()) {
      setStatusPopupMessage("Please enter a class code");
      setIsSuccessStatus(false);
      setShowStatusPopup(true);
      return;
    }
    setIsLoading(true);
    try {
      const userIdInt = parseInt(user.userId, 10);
      const response = await fetch('http://localhost:8080/api/enrollments/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          userId: userIdInt,
          classCode: classCode.trim()
        })
      });
      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error('Non-JSON response from server');
      }
      if (response.ok) {
        await fetchEnrolledClasses();
        setJoinClassModalOpen(false);
        setClassCode("");
        setStatusPopupMessage("Class joined successfully!");
        setIsSuccessStatus(true);
        setShowStatusPopup(true);
      } else {
        if (data.error === "Class not found with code: " + classCode.trim()) {
          setStatusPopupMessage("Invalid class code. Please check and try again.");
          setIsSuccessStatus(false);
        } else if (data.error === "User is already enrolled in this class") {
          setStatusPopupMessage("You are already enrolled in this class.");
          setIsSuccessStatus(false);
        } else if (data.error === "User not found") {
          setStatusPopupMessage("User authentication error. Please try logging in again.");
          setIsSuccessStatus(false);
        } else if (data.error === "Only students can enroll in classes") {
          setStatusPopupMessage("Only students can enroll in classes.");
          setIsSuccessStatus(false);
        } else {
          setStatusPopupMessage(data.error || "Failed to join class. Please try again.");
          setIsSuccessStatus(false);
        }
        console.error('Enrollment error:', data);
        setShowStatusPopup(true);
      }
    } catch (error) {
      console.error('Error joining class:', error);
      setStatusPopupMessage("An error occurred while joining the class. Please try again.");
      setIsSuccessStatus(false);
      setShowStatusPopup(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClassClick = (classId) => {
    const classItem = enrolledClasses.find(item => item.classId === classId);
    if (classItem) {
      navigate(`/class/${classId}/genres`, { state: { className: classItem.className } });
    } else {
      // Fallback just in case the classItem isn't found in state (shouldn't happen if data is consistent)
      navigate(`/class/${classId}/genres`);
    }
  }

  // Debug: log enrolledClasses before rendering
  console.log('enrolledClasses:', enrolledClasses);

  return (
    <div className="min-h-screen w-full flex bg-[#95dfc1] dark:bg-gray-900 transition-colors duration-500">
      {/* Sidebar */}
      <div className="w-56 flex flex-col items-center py-8 bg-[#7BD0A7] dark:bg-gray-900 transition-colors duration-500">
        {/* Logo */}
        <div className="bg-white dark:bg-gray-800 rounded-full shadow p-3 flex items-center justify-center mb-6 transition-colors duration-500" style={{ width: 96, height: 96 }}>
          <img src={logo} alt="FiliUp Logo" className="w-20 h-20 object-contain" />
        </div>
        <div className="flex flex-col gap-2 w-full px-2">
          {/* My Classes */}
          <div
            className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg font-semibold cursor-pointer transition-colors duration-500 ${activeItem === 'my-classes' ? 'bg-white dark:bg-gray-700 text-[#7BD0A7] dark:text-white' : 'text-black dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            onClick={() => handleMenuItemClick('my-classes')}
          >
            <GraduationCap size={22} color={activeItem === 'my-classes' ? "#7BD0A7" : (isDarkMode ? "#d1d5db" : "#6b7280")} />
            <span className="text-black dark:text-white">My Classes</span>
          </div>
          {/* Display Enrolled Classes */}
          {myClassesOpen && (
            <div className="flex flex-col gap-1 pl-6">
              {enrolledClasses.length > 0 ? (
                enrolledClasses.map((classItem) => (
                  <div 
                    key={classItem.classId} 
                    className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-gray-800 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-500"
                    onClick={() => navigate(`/class/${classItem.classId}/genres`)} // Navigate to genres
                  >
                    <GraduationCap size={24} color={isDarkMode ? "#d1d5db" : "#6b7280"} />
                    <span className="font-semibold">{classItem.className}</span>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 dark:text-gray-400">No classes enrolled.</div>
              )}
            </div>
          )}
          {/* Study Area */}
          <div
            className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg cursor-pointer transition-colors duration-500 ${activeItem === 'study-area' ? 'text-[#7BD0A7] dark:text-white' : 'text-black dark:text-gray-300'} hover:bg-gray-100 dark:hover:bg-gray-700`}
            onClick={() => handleMenuItemClick('study-area')}
          >
            <BookOpen size={20} color={activeItem === 'study-area' ? (isDarkMode ? "#d1d5db" : "#7BD0A7") : (isDarkMode ? "#d1d5db" : "#6b7280")} />
            <span className="font-semibold">Study area</span>
          </div>
          {/* Playground */}
          <div
            className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg cursor-pointer transition-colors duration-500 ${activeItem === 'playground' ? 'text-[#7BD0A7] dark:text-white' : 'text-black dark:text-gray-300'} hover:bg-gray-100 dark:hover:bg-gray-700`}
            onClick={() => handleMenuItemClick('playground')}
          >
            <Code size={20} color={activeItem === 'playground' ? (isDarkMode ? "#d1d5db" : "#7BD0A7") : (isDarkMode ? "#d1d5db" : "#6b7280")} />
            <span className="font-semibold">Playground</span>
          </div>
          {/* Certifications */}
          <div
            className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg cursor-pointer transition-colors duration-500 ${activeItem === 'certifications' ? 'text-[#7BD0A7] dark:text-white' : 'text-black dark:text-gray-300'} hover:bg-gray-100 dark:hover:bg-gray-700`}
            onClick={() => handleMenuItemClick('certifications')}
          >
            <Award size={20} color={activeItem === 'certifications' ? (isDarkMode ? "#d1d5db" : "#7BD0A7") : (isDarkMode ? "#d1d5db" : "#6b7280")} />
            <span className="font-semibold">Certifications</span>
          </div>
        </div>
      </div>
      {/* Main Content White Box */}
      <div className="flex-1 flex justify-center items-start py-10 px-6 bg-[#7BD0A7] dark:bg-gray-900 transition-colors duration-500 h-screen overflow-hidden">
        <div className="w-full max-w-8xl bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 flex flex-col justify-start pb-16 transition-colors duration-500 h-full overflow-y-auto">
          {/* Top Navigation */}
          <div className="flex items-center justify-between mb-6 w-full">
            <h2 className="text-4xl font-bold text-gray-800 dark:text-white transition-colors duration-500">Classes</h2>
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
              <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300 text-gray-600 dark:text-gray-400 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 7.165 6 9.388 6 12v2.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              </button>
              <div className="relative">
                <div
                  className="flex items-center gap-3 bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1 cursor-pointer transition-colors duration-300"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <div className="flex flex-col items-end mr-2">
                    <span className="font-bold text-gray-800 dark:text-white leading-tight text-md">{user?.userName || 'Student Name'}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-500 leading-tight">Mag-aaral</span>
                  </div>
                  <img
                    src="https://randomuser.me/api/portraits/lego/1.jpg"
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover border-2 border-white shadow"
                  />
                </div>
                {dropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg z-50">
                    <div className="flex items-center gap-3 p-3 text-gray-700 dark:text-gray-200 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-500" onClick={() => setDropdownOpen(false)}>
                      <User size={18} color={isDarkMode ? "#d1d5db" : "#4b5563"} />
                      <span>Aking Account</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 text-gray-700 dark:text-gray-200 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-500" onClick={handleLogout}>
                      <LogOut size={18} color={isDarkMode ? "#d1d5db" : "#4b5563"} />
                      <span>Mag-sign Out</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Dashboard Content */}
          <div className="flex flex-col items-center w-full mt-2">
            <div className="w-full max-w-6xl">
              {enrolledClasses.length > 0 ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">Active Classes</h3>
                    <button
                      className="bg-[#7BD0A7] text-white px-6 py-2 rounded-full font-medium hover:bg-[#5bbd8b] transition-colors"
                      onClick={openJoinClassModal}
                    >
                      Join Class
                    </button>
                  </div>
                  <div className="flex flex-col gap-6 w-full">
                    {enrolledClasses.map((classItem) => (
                      <div
                        key={classItem.classId}
                        onClick={() => handleClassClick(classItem.classId)}
                        className="bg-white dark:bg-gray-700 rounded-xl shadow-sm cursor-pointer w-full overflow-hidden border border-gray-100 dark:border-gray-600 hover:shadow-md transition-colors duration-500"
                      >
                        <div className="w-full h-36 bg-gray-200 dark:bg-gray-600 object-cover" style={{backgroundImage: `url(${classCardImage})`, backgroundSize: 'cover', backgroundPosition: 'center', borderTopLeftRadius: '0.75rem', borderTopRightRadius: '0.75rem'}} />
                        <div className="flex items-center justify-between px-6 py-6 bg-[#C8F2DF] dark:bg-gray-600 transition-colors duration-500" style={{ borderBottomLeftRadius: '0.75rem', borderBottomRightRadius: '0.75rem' }}>
                          <h4 className="text-lg font-semibold text-gray-800 dark:text-white transition-colors duration-500">{classItem.className}</h4>
                          <button className="bg-[#7BD0A7] w-8 h-8 rounded-full flex items-center justify-center text-white shadow hover:bg-[#5bbd8b] transition-colors">
                            <ChevronRight size={20} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center w-full py-24">
                  <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-4 transition-colors duration-500">No classes yet</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6 transition-colors duration-500">You are not enrolled in any classes. Join a class to get started!</p>
                  <button
                    className="bg-[#7BD0A7] text-white px-6 py-3 rounded-full font-medium hover:bg-[#5bbd8b] transition-colors"
                    onClick={openJoinClassModal}
                  >
                    Join Class
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Join Class Modal */}
      {joinClassModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div ref={modalRef} className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md shadow-xl transition-colors duration-500">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-600 transition-colors duration-500">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white transition-colors duration-500">Join Class</h3>
              <button className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-500" onClick={closeJoinClassModal}>
                <X size={18} color="#ef4444" />
              </button>
            </div>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 transition-colors duration-500">Enter the class code given to you by your teacher.</h2>
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Class Code"
                  value={classCode}
                  onChange={(e) => setClassCode(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md text-gray-800 dark:text-white focus:outline-none focus:border-7BD0A7 dark:focus:border-[#95dfc1] transition-colors duration-500"
                  autoFocus
                />
              </div>
              <div className="flex justify-end">
                <button
                  className="px-6 py-2 rounded-full font-medium text-white hover:opacity-90 disabled:opacity-70 transition-opacity"
                  style={{ backgroundColor: isDarkMode ? '#4b5563' : '#7BD0A7' }}
                  onClick={handleJoinClass}
                  disabled={isLoading || !classCode.trim()}
                >
                  {isLoading ? "Joining..." : "Join Class"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Popup Dialog with Animation */}
      {renderStatusPopup && (
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 ${isStatusAnimating ? 'opacity-100' : 'opacity-0'}`}
        >
          <div
            className={`bg-white dark:bg-gray-800 rounded-lg w-full max-w-md shadow-xl flex overflow-hidden transform transition-all duration-300 ease-out ${isStatusAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
            onTransitionEnd={() => {
              // If not animating (i.e., animation finished and showStatusPopup is false),
              // stop rendering the component.
              if (!isStatusAnimating && !showStatusPopup) {
                setRenderStatusPopup(false);
              }
            }}
          >
            {/* Status bar on the left */}
            <div className={`w-1/4 ${isSuccessStatus ? 'bg-[#7BD0A7]' : 'bg-red-500'} dark:bg-gray-700 transition-colors duration-500`}></div>

            {/* White box content on the right */}
            <div className="w-3/4 p-6 flex flex-col">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{isSuccessStatus ? 'Success!' : 'Error'}</h2>
              <Typography variant="body2" sx={{ mb: 3 }} className="text-gray-600 dark:text-gray-300">
                {statusPopupMessage}
              </Typography>
              <Button
                variant="contained"
                onClick={() => setShowStatusPopup(false)}
                sx={{
                  bgcolor: isSuccessStatus ? '#7BD0A7' : '#ef4444',
                  '&:hover': { bgcolor: isSuccessStatus ? '#5bbd8b' : '#dc2626' },
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

      <style jsx="true">{`
        /* Scrollbar styles from TeacherHome */
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

        /* Added modal styles - adjust as needed */
        .modal-enter {
          opacity: 0;
          transform: scale(0.95);
        }

        .modal-enter-active {
          opacity: 1;
          transform: scale(1);
          transition: opacity 300ms ease-out, transform 300ms ease-out;
        }

        .modal-exit {
          opacity: 1;
          transform: scale(1);
        }

        .modal-exit-active {
          opacity: 0;
          transform: scale(0.95);
          transition: opacity 300ms ease-out, transform 300ms ease-out;
        }
      `}</style>
    </div>
  )
}