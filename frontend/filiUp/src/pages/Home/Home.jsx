"use client"
import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  GraduationCap,
  BookOpen,
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
import { authService, classService } from "../../services"

export default function StudentDashboard() {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [joinClassModalOpen, setJoinClassModalOpen] = useState(false)
  const [classCode, setClassCode] = useState("")
  const [enrolledClasses, setEnrolledClasses] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [myClassesOpen, setMyClassesOpen] = useState(true)
  const [activeItem, setActiveItem] = useState('my-classes');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      return savedMode ? JSON.parse(savedMode) : false;
    }
    return false;
  })
  const modalRef = useRef(null)
  const { user, logout } = useUser()
  const navigate = useNavigate()
  const [showStatusPopup, setShowStatusPopup] = useState(false);
  const [renderStatusPopup, setRenderStatusPopup] = useState(false);
  const [isStatusAnimating, setIsStatusAnimating] = useState(false);
  const [statusPopupMessage, setStatusPopupMessage] = useState('');
  const [isSuccessStatus, setIsSuccessStatus] = useState(true);

  // Check authentication and verify user on mount
  useEffect(() => {
    const checkAuthentication = async () => {
      if (!authService.isAuthenticated()) {
        navigate('/sign-in', { replace: true });
        return;
      }

      try {
        // First verify the token
        const verifiedUser = await authService.verifyUser();
        if (!verifiedUser) {
          authService.logout();
          navigate('/sign-in', { replace: true });
          return;
        }

        // Then get current user info
        const userInfo = await authService.getCurrentUser();
        if (!userInfo || !userInfo.data) {
          authService.logout();
          navigate('/sign-in', { replace: true });
          return;
        }

        // Check user role and redirect if necessary
        const userData = userInfo.data;
        if (userData.userRole === 'ADMIN') {
          navigate('/admin', { replace: true });
        } else if (userData.userRole === 'TEACHER') {
          navigate('/teacher', { replace: true });
        }
      } catch (error) {
        console.error('Authentication error:', error);
        authService.logout();
        navigate('/sign-in', { replace: true });
      }
    };

    checkAuthentication();
  }, [navigate]);

  // Fetch enrolled classes when component mounts
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setIsLoading(true);
        const response = await classService.getMyClasses();
        if (response.data) {
          setEnrolledClasses(response.data);
        }
      } catch (error) {
        console.error('Error fetching classes:', error);
        setStatusPopupMessage("Failed to fetch classes. Please try again.");
        setIsSuccessStatus(false);
        setShowStatusPopup(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (authService.isAuthenticated()) {
      fetchClasses();
    }
  }, []);

  // Effect to manage popup rendering and animation states
  useEffect(() => {
    if (showStatusPopup) {
      setRenderStatusPopup(true);
      const timeoutId = setTimeout(() => setIsStatusAnimating(true), 10);
      return () => clearTimeout(timeoutId);
    } else {
      setIsStatusAnimating(false);
    }
  }, [showStatusPopup]);

  const toggleMyClasses = () => {
    setMyClassesOpen(!myClassesOpen);
  };

  const handleLogout = () => {
    authService.logout();
    logout();
    setDropdownOpen(false);
    navigate('/login', { replace: true });
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

  // Join class logic
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
        // Fetch updated classes after successful enrollment
        const updatedClasses = await classService.getMyClasses();
        if (updatedClasses.data) {
          setEnrolledClasses(updatedClasses.data);
        }
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
      navigate(`/class/${classId}/genres`);
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

  return (
    <div className="min-h-screen w-full flex bg-gradient-to-br from-cyan-600 to-teal-600 dark:bg-gray-900 transition-colors duration-500">
      {/* Sidebar */}
      <div className="w-56 flex flex-col items-center py-8 bg-cyan-600 dark:bg-gray-900 transition-colors duration-500">
        {/* Logo */}
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
      {/* Main Content White Box */}
      <div className="flex-1 flex justify-center items-start py-10 px-6 bg-cyan-600 dark:bg-gray-900 transition-colors duration-500 h-screen overflow-hidden">
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
              <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300 text-gray-600 dark:text-gray-400 flex items-center relative">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 7.165 6 9.388 6 12v2.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">3</span>
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
              {/* Quick Stats Dashboard */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gradient-to-r from-cyan-500 to-teal-500 rounded-xl p-4 text-white shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/80 text-sm">Total Classes</p>
                      <p className="text-3xl font-bold">{enrolledClasses.length}</p>
                    </div>
                    <div className="bg-white/20 p-3 rounded-full">
                      <GraduationCap size={24} color="white" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-4 text-white shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/80 text-sm">Assignments</p>
                      <p className="text-3xl font-bold">{Math.floor(Math.random() * 15)}</p>
                    </div>
                    <div className="bg-white/20 p-3 rounded-full">
                      <BookOpen size={24} color="white" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-4 text-white shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/80 text-sm">Quizzes</p>
                      <p className="text-3xl font-bold">{Math.floor(Math.random() * 10)}</p>
                    </div>
                    <div className="bg-white/20 p-3 rounded-full">
                      <Award size={24} color="white" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl p-4 text-white shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/80 text-sm">Average Grade</p>
                      <p className="text-3xl font-bold">B+</p>
                    </div>
                    <div className="bg-white/20 p-3 rounded-full">
                      <Code size={24} color="white" />
                    </div>
                  </div>
                </div>
              </div>
              
              {enrolledClasses.length > 0 ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">Active Classes</h3>
                    <button
                      className="bg-gradient-to-r from-cyan-600 to-teal-600 text-white px-6 py-2 rounded-full font-medium hover:from-cyan-700 hover:to-teal-700 transition-colors flex items-center gap-2"
                      onClick={openJoinClassModal}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Join Class
                    </button>
                  </div>
                  <div className="flex flex-col gap-6 w-full">
                    {enrolledClasses.map((classItem) => (
                      <div
                        key={classItem.classId}
                        onClick={() => handleClassClick(classItem.classId)}
                        className="bg-white dark:bg-gray-700 rounded-xl shadow-md hover:shadow-lg cursor-pointer w-full overflow-hidden border border-gray-100 dark:border-gray-600 transition-all duration-300"
                      >
                        <div className="flex flex-col md:flex-row">
                          {/* Left section with gradient and course info */}
                          <div className="w-full md:w-2/3 p-6 bg-gradient-to-r from-cyan-500 to-teal-500 dark:from-cyan-600 dark:to-teal-600">
                            <div className="flex flex-col h-full">
                              <div className="flex items-center mb-2">
                                <span className="px-3 py-1 bg-white/20 text-white text-xs font-medium rounded-full">
                                  {classItem.classId.toString().slice(0, 6).toUpperCase()}
                                </span>
                              </div>
                              <h4 className="text-2xl font-bold text-white mb-2">{classItem.className}</h4>
                              <p className="text-white/80 text-sm mb-3">{classItem.description || 'Learn about Filipino language and culture'}</p>
                              <div className="flex items-center mt-auto">
                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white">
                                  <GraduationCap size={20} />
                                </div>
                                <div className="ml-3">
                                  <p className="text-white text-sm font-medium">{classItem.teacherName || 'Teacher'}</p>
                                  <p className="text-white/70 text-xs">Instructor</p>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Right section with stats */}
                          <div className="w-full md:w-1/3 p-6 bg-white dark:bg-gray-700">
                            <div className="flex flex-col h-full">
                              <div className="mb-4">
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Course Progress</p>
                                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                  <div 
                                    className="bg-gradient-to-r from-cyan-500 to-teal-500 h-2 rounded-full" 
                                    style={{ width: `${Math.floor(Math.random() * 100)}%` }}
                                  ></div>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between mb-3">
                                <div>
                                  <p className="text-xl font-bold text-gray-800 dark:text-white">{Math.floor(Math.random() * 12)}/{Math.floor(Math.random() * 20 + 12)}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">Assignments</p>
                                </div>
                                <div>
                                  <p className="text-xl font-bold text-gray-800 dark:text-white">{classItem.currentGrade || 'B+'}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">Current Grade</p>
                                </div>
                              </div>
                              
                              <button className="mt-auto bg-gradient-to-r from-cyan-600 to-teal-600 text-white px-4 py-2 rounded-lg font-medium hover:from-cyan-700 hover:to-teal-700 transition-colors flex items-center justify-center">
                                <span>View Class</span>
                                <ChevronRight size={16} className="ml-1" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center w-full py-24">
                  <div className="bg-white/50 dark:bg-gray-700/50 p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
                    <div className="bg-gradient-to-r from-cyan-500 to-teal-500 w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center">
                      <GraduationCap size={36} color="white" />
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-4 transition-colors duration-500">No classes yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 transition-colors duration-500">You are not enrolled in any classes. Join a class using a class code provided by your teacher to get started!</p>
                    <button
                      className="bg-gradient-to-r from-cyan-600 to-teal-600 text-white px-6 py-3 rounded-full font-medium hover:from-cyan-700 hover:to-teal-700 transition-colors flex items-center gap-2 mx-auto"
                      onClick={openJoinClassModal}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Join Class
                    </button>
                  </div>
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
            <div className="bg-gradient-to-r from-cyan-600 to-teal-600 p-6 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-full">
                    <GraduationCap size={24} color="white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Join a Class</h3>
                </div>
                <button 
                  className="bg-white/20 p-1 rounded-full hover:bg-white/30 transition-colors duration-300" 
                  onClick={closeJoinClassModal}
                >
                  <X size={18} color="white" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-600 dark:text-gray-300 mb-6">Enter the class code given to you by your teacher to join their class.</p>
              <div className="mb-6">
                <label htmlFor="classCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Class Code</label>
                <input
                  id="classCode"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={classCode}
                  onChange={(e) => setClassCode(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md text-gray-800 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-teal-400 transition-colors duration-300"
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  className="px-5 py-2 rounded-full font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={closeJoinClassModal}
                >
                  Cancel
                </button>
                <button
                  className="px-6 py-2 rounded-full font-medium text-white bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 disabled:opacity-70 transition-colors flex items-center gap-2"
                  onClick={handleJoinClass}
                  disabled={isLoading || !classCode.trim()}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Joining...
                    </>
                  ) : (
                    <>Join Class</>
                  )}
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
            {/* Status icon on the left */}
            <div className={`w-1/4 ${isSuccessStatus ? 'bg-gradient-to-b from-cyan-500 to-teal-500' : 'bg-gradient-to-b from-red-500 to-pink-600'} flex items-center justify-center`}>
              <div className="bg-white/20 p-4 rounded-full">
                {isSuccessStatus ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
            </div>

            {/* Content on the right */}
            <div className="w-3/4 p-6 flex flex-col">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{isSuccessStatus ? 'Success!' : 'Error'}</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">{statusPopupMessage}</p>
              <button
                onClick={() => setShowStatusPopup(false)}
                className={`px-6 py-2 rounded-full font-medium text-white ${isSuccessStatus ? 'bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700' : 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700'} transition-colors self-end`}
              >
                Close
              </button>
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