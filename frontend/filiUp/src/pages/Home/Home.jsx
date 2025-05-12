"use client"
import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Menu,
  Settings,
  Moon,
  Bell,
  GraduationCap,
  FileText,
  Code,
  MessageSquare,
  Plus,
  User,
  LogOut,
  BookOpen,
  Award,
  X,
} from "lucide-react"
import { useUser } from "../../context/UserContext"

export default function StudentDashboard() {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  const [joinClassModalOpen, setJoinClassModalOpen] = useState(false)
  const [classCode, setClassCode] = useState("")
  const [enrolledClasses, setEnrolledClasses] = useState([])
  const [enrollmentError, setEnrollmentError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const dropdownRef = useRef(null)
  const modalRef = useRef(null)
  const { user, isAuthenticated, loading, logout } = useUser()
  const navigate = useNavigate()

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

  // Handle clicking outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }

      if (modalRef.current && !modalRef.current.contains(event.target) && joinClassModalOpen) {
        // Only close if clicking outside the modal and not on the join class card
        const joinClassCard = document.getElementById("join-class-card")
        if (!joinClassCard.contains(event.target)) {
          setJoinClassModalOpen(false)
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [joinClassModalOpen])

  // Handle escape key to close modal
  useEffect(() => {
    function handleEscKey(event) {
      if (event.key === "Escape" && joinClassModalOpen) {
        setJoinClassModalOpen(false)
      }
    }

    document.addEventListener("keydown", handleEscKey)
    return () => {
      document.removeEventListener("keydown", handleEscKey)
    }
  }, [joinClassModalOpen])

  // Safely get the user's initials
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

  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded)
  }

  const openJoinClassModal = () => {
    setJoinClassModalOpen(true)
    setClassCode("")
  }

  const closeJoinClassModal = () => {
    setJoinClassModalOpen(false)
  }

  const handleJoinClass = async () => {
    if (!classCode.trim()) {
      setEnrollmentError("Please enter a class code")
      return
    }

    setIsLoading(true)
    setEnrollmentError("")

    try {
      // First, convert userId to integer to match backend expectation
      const userIdInt = parseInt(user.userId, 10)
      
      const response = await fetch('http://localhost:8080/api/enrollments/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          userId: userIdInt, // Send as integer
          classCode: classCode.trim()
        })
      })

      let data
      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("application/json")) {
        data = await response.json()
      } else {
        const text = await response.text()
        console.error('Non-JSON response:', text)
        throw new Error('Non-JSON response from server')
      }

      if (response.ok) {
        // Refresh the enrolled classes list
        await fetchEnrolledClasses()
        setJoinClassModalOpen(false)
        setClassCode("")
      } else {
        // More specific error handling
        if (data.error === "Class not found with code: " + classCode.trim()) {
          setEnrollmentError("Invalid class code. Please check and try again.")
        } else if (data.error === "User is already enrolled in this class") {
          setEnrollmentError("You are already enrolled in this class.")
        } else if (data.error === "User not found") {
          setEnrollmentError("User authentication error. Please try logging in again.")
        } else if (data.error === "Only students can enroll in classes") {
          setEnrollmentError("Only students can enroll in classes.")
        } else {
          setEnrollmentError(data.error || "Failed to join class. Please try again.")
        }
        
        // Log the error for debugging
        console.error('Enrollment error:', data)
      }
    } catch (error) {
      console.error('Error joining class:', error)
      setEnrollmentError("An error occurred while joining the class. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClassClick = (classId) => {
    navigate(`/class/${classId}/genres`)
  }

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        fontFamily: "Inter, system-ui, sans-serif",
        backgroundColor: "rgba(33, 150, 243, 0.02)",
      }}
    >
      {/* Left Sidebar */}
      <div
        style={{
          width: sidebarExpanded ? "240px" : "54px",
          backgroundColor: "white",
          borderRight: "1px solid #e5e7eb",
          display: "flex",
          flexDirection: "column",
          transition: "width 0.3s ease",
          overflow: "hidden",
          zIndex: 10,
        }}
      >
        {/* Sidebar Header */}
        <div
          style={{
            background: "linear-gradient(90deg, #2196f3 0%, #1976d2 100%)",
            padding: "1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: sidebarExpanded ? "space-between" : "center",
            height: "60px",
          }}
        >
          <div
            style={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              backgroundColor: "rgba(255, 255, 255, 0.2)",
            }}
            onClick={toggleSidebar}
          >
            <Menu size={20} color="white" />
          </div>

          
        </div>

        {/* Sidebar Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            overflowY: "auto",
          }}
        >
          {/* My Classes Section */}
          <div
            style={{
              padding: sidebarExpanded ? "1rem" : "1rem 0",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                color: "#2196f3",
                padding: sidebarExpanded ? "0.5rem" : "0.5rem 0",
                borderRadius: "0.375rem",
                backgroundColor: "#e3f2fd",
                justifyContent: sidebarExpanded ? "flex-start" : "center",
                cursor: "pointer",
              }}
            >
              <GraduationCap size={20} color="#2196f3" />
              {sidebarExpanded && <span style={{ fontWeight: 500 }}>My classes</span>}
            </div>

            {sidebarExpanded && (
              <>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    color: "#64748b",
                    padding: "0.5rem 0.5rem 0.5rem 2rem",
                    cursor: "pointer",
                  }}
                >
                  <GraduationCap size={16} color="#64748b" />
                  <span style={{ fontSize: "0.875rem" }}>Mga Pangunahing Salita</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    color: "#64748b",
                    padding: "0.5rem 0.5rem 0.5rem 2rem",
                    cursor: "pointer",
                  }}
                >
                  <GraduationCap size={16} color="#64748b" />
                  <span style={{ fontSize: "0.875rem" }}>Mga Pangungusap</span>
                </div>
              </>
            )}
          </div>

          {/* Study Area */}
          <div
            style={{
              padding: sidebarExpanded ? "0.5rem 1rem" : "1rem 0",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              color: "#64748b",
              justifyContent: sidebarExpanded ? "flex-start" : "center",
              cursor: "pointer",
            }}
          >
            <BookOpen size={20} color="#64748b" />
            {sidebarExpanded && <span style={{ fontWeight: 500 }}>Study area</span>}
          </div>

          {/* Playground */}
          <div
            style={{
              padding: sidebarExpanded ? "0.5rem 1rem" : "1rem 0",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              color: "#64748b",
              justifyContent: sidebarExpanded ? "flex-start" : "center",
              cursor: "pointer",
            }}
          >
            <Code size={20} color="#64748b" />
            {sidebarExpanded && <span style={{ fontWeight: 500 }}>Playground</span>}
          </div>

          {/* Certifications */}
          <div
            style={{
              padding: sidebarExpanded ? "0.5rem 1rem" : "1rem 0",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              color: "#64748b",
              justifyContent: sidebarExpanded ? "flex-start" : "center",
              cursor: "pointer",
            }}
          >
            <Award size={20} color="#64748b" />
            {sidebarExpanded && <span style={{ fontWeight: 500 }}>Certifications</span>}
          </div>
        </div>

        {/* Chat with us */}
        <div
          style={{
            padding: "1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: sidebarExpanded ? "flex-start" : "center",
            gap: "0.75rem",
            borderTop: "1px solid #e5e7eb",
            backgroundColor: "#2196f3",
            color: "white",
            cursor: "pointer",
          }}
        >
          <MessageSquare size={20} color="white" />
          {sidebarExpanded && <span style={{ fontWeight: 500 }}>Chat with us!</span>}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Top Navigation */}
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0.75rem 1rem",
            background: "linear-gradient(135deg, #2196f3, #1976d2)",
            color: "white",
            height: "60px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div
              style={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onClick={toggleSidebar}
            >
              
            </div>
            
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.875rem",
                fontWeight: 500,
              }}
            >
              <span
                style={{
                  color: "#2196f3",
                  backgroundColor: "white",
                  padding: "0.125rem 0.375rem",
                  borderRadius: "0.25rem",
                }}
              >
                !
              </span>
              <span>371ms</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <div
              style={{
                backgroundColor: "#4caf50",
                color: "white",
                padding: "0.25rem 0.75rem",
                borderRadius: "0.375rem",
                fontSize: "0.75rem",
                fontWeight: 600,
              }}
            >
              MAG-AARAL
            </div>
            <Moon size={20} color="white" />
            <Bell size={20} color="white" />

            {/* Profile Dropdown */}
            <div style={{ position: "relative" }} ref={dropdownRef}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  backgroundColor: "#e5e7eb",
                  overflow: "hidden",
                  border: "2px solid white",
                  cursor: "pointer",
                }}
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {user?.profileImage ? (
                  <img
                    src={user.profileImage || "/placeholder.svg"}
                    alt="User avatar"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#2196f3",
                      color: "white",
                      fontSize: "14px",
                      fontWeight: "bold",
                    }}
                  >
                    {getInitials()}
                  </div>
                )}
              </div>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    right: 0,
                    width: "200px",
                    backgroundColor: "white",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                    zIndex: 50,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      padding: "12px 16px",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      cursor: "pointer",
                      color: "#334155",
                      transition: "background-color 0.2s",
                    }}
                    onClick={() => setDropdownOpen(false)}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <User size={18} />
                    <span>Aking Account</span>
                  </div>
                  <div
                    style={{
                      padding: "12px 16px",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      cursor: "pointer",
                      color: "#334155",
                      transition: "background-color 0.2s",
                    }}
                    onClick={handleLogout}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <LogOut size={18} />
                    <span>Mag-sign Out</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main
          style={{
            flex: 1,
            backgroundColor: "#f1f5f9",
            padding: "1.5rem",
          }}
        >
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: 500,
              color: "#64748b",
              marginBottom: "1.5rem",
            }}
          >
            Mga Aktibong Aralin
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {/* Enrolled Classes */}
            {enrolledClasses.map((classItem) => (
              <div
                key={classItem.classId}
                onClick={() => handleClassClick(classItem.classId)}
                style={{
                  backgroundColor: "white",
                  borderRadius: "0.5rem",
                  overflow: "hidden",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                  cursor: "pointer",
                  transition: "transform 0.2s ease",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)"
                  e.currentTarget.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)"
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)"
                  e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.1)"
                }}
              >
                <div
                  style={{
                    backgroundColor: "#e3f2fd",
                    height: "100px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <GraduationCap size={40} color="#2196f3" />
                </div>
                <div style={{ padding: "1rem" }}>
                  <h3
                    style={{
                      fontSize: "1.125rem",
                      fontWeight: 600,
                      marginBottom: "0.25rem",
                    }}
                  >
                    {classItem.className}
                  </h3>
                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "#64748b",
                    }}
                  >
                    {classItem.description || "No description available"}
                  </p>
                </div>
              </div>
            ))}

            {/* Join Class Card */}
            <div
              id="join-class-card"
              style={{
                border: "2px dashed #cbd5e1",
                borderRadius: "0.5rem",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                height: "200px",
                backgroundColor: "transparent",
                color: "#94a3b8",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onClick={openJoinClassModal}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = "#2196f3"
                e.currentTarget.style.color = "#2196f3"
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = "#cbd5e1"
                e.currentTarget.style.color = "#94a3b8"
              }}
            >
              <Plus size={24} />
              <span
                style={{
                  marginTop: "0.5rem",
                  fontSize: "1rem",
                  fontWeight: 500,
                }}
              >
                Sumali sa klase
              </span>
            </div>
          </div>
        </main>
      </div>

      {/* Join Class Modal */}
      {joinClassModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
          }}
        >
          <div
            ref={modalRef}
            style={{
              backgroundColor: "#1e293b",
              borderRadius: "0.5rem",
              width: "90%",
              maxWidth: "500px",
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "1rem 1.5rem",
                borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <h3
                style={{
                  fontSize: "1.125rem",
                  fontWeight: 600,
                  color: "white",
                  margin: 0,
                }}
              >
                Join Class
              </h3>
              <button
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0.25rem",
                  borderRadius: "50%",
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                }}
                onClick={closeJoinClassModal}
              >
                <X size={18} color="white" />
              </button>
            </div>

            {/* Modal Content */}
            <div
              style={{
                padding: "1.5rem",
              }}
            >
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 600,
                  color: "white",
                  marginBottom: "1.5rem",
                }}
              >
                Enter the class code given to you by your teacher.
              </h2>

              {/* Error Message */}
              {enrollmentError && (
                <div
                  style={{
                    backgroundColor: "rgba(239, 68, 68, 0.1)",
                    color: "#ef4444",
                    padding: "0.75rem",
                    borderRadius: "0.375rem",
                    marginBottom: "1rem",
                    fontSize: "0.875rem",
                  }}
                >
                  {enrollmentError}
                </div>
              )}

              {/* Class Code Input */}
              <div
                style={{
                  marginBottom: "2rem",
                }}
              >
                <input
                  type="text"
                  placeholder="Class Code"
                  value={classCode}
                  onChange={(e) => setClassCode(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.75rem 0",
                    fontSize: "1rem",
                    backgroundColor: "transparent",
                    border: "none",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.3)",
                    color: "white",
                    outline: "none",
                  }}
                  autoFocus
                />
              </div>

              {/* Join Button */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  style={{
                    backgroundColor: "#4caf50",
                    color: "white",
                    border: "none",
                    borderRadius: "2rem",
                    padding: "0.75rem 2rem",
                    fontSize: "1rem",
                    fontWeight: 500,
                    cursor: isLoading ? "not-allowed" : "pointer",
                    opacity: isLoading ? 0.7 : 1,
                    transition: "background-color 0.2s",
                  }}
                  onClick={handleJoinClass}
                  disabled={isLoading || !classCode.trim()}
                >
                  {isLoading ? "Joining..." : "Join class"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}