"use client"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Book, Search, Bell, User } from "lucide-react"
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Button, Typography } from '@mui/material';

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
  const [expandedStory, setExpandedStory] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedStory, setSelectedStory] = useState(null)
  const { classId, genre } = useParams()
  const navigate = useNavigate()
  const [userName, setUserName] = useState("")

  useEffect(() => {
    // Fetch user info from localStorage
    const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
    setUserName(userInfo.userName || '');

    fetchStories()
  }, [classId, genre])

  const fetchStories = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/stories/class/${classId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to fetch stories')
      }

      const data = await response.json()
      
      // Filter stories by genre if specified
      const filteredStories = genre 
        ? data.filter(story => story.genre === genre)
        : data
      
      setStories(filteredStories)
      
      // Set class name if we have stories
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
      // If we're viewing stories of a specific genre, go back to genres view
      navigate(`/class/${classId}/genres`)
    } else {
      // Otherwise go back to home
      navigate(-1)
    }
  }

  const getGenreLabel = (genreValue) => {
    return GENRE_OPTIONS.find(opt => opt.value === genreValue)?.label || genreValue
  }

  const toggleStory = (storyId) => {
    setExpandedStory(expandedStory === storyId ? null : storyId)
  }

  const openModal = (story) => {
    setSelectedStory(story)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setSelectedStory(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header style={{
        padding: "1rem 2rem",
        backgroundColor: "#d1fae5",
        borderBottom: "1px solid #e5e7eb",
      }}>
        <div style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          gap: "1rem",
        }}>
          <button
            onClick={handleBack}
            style={{
              background: "#34d399",
              border: "none",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <ArrowLeft size={24} color="#ffffff" />
          </button>
          <h1 style={{
            fontSize: "1.75rem",
            fontWeight: "600",
            color: "#1e293b",
            marginRight: "43rem",
          }}>
            Story {genre ? `- ${getGenreLabel(genre)}` : ''}
          </h1>
          
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "1.5rem",
          }}>
            <Search size={20} color="#64748b" style={{ cursor: "pointer" }} />
            <Bell size={20} color="#64748b" style={{ cursor: "pointer" }} />
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}>
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
              }}>
                <span style={{ fontWeight: "500", color: "#1e293b" }}>{userName}</span>
                <span style={{ fontSize: "0.875rem", color: "#64748b" }}>Student</span>
              </div>
              <div style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: "#f1f5f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <User size={24} color="#64748b" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        maxWidth: "1200px",
        margin: "2rem auto",
        padding: "0 1rem",
      }}>
        <div style={{
          marginBottom: "1.5rem",
          fontSize: "1.125rem",
          color: "#4a5568",
          textAlign: "left",
        }}>
          Awesome choice! Now go ahead and pick a story that sparks your curiosity and imagination—let the adventure begin!
        </div>

        {/* Buttons for Created By */}
        <div style={{
          display: "flex",
          justifyContent: "flex-start",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}>
          <button style={{
            backgroundColor: "#34d399", // Green color
            color: "#ffffff",
            border: "none",
            borderRadius: "0.375rem",
            padding: "0.5rem 1rem",
            cursor: "pointer",
            fontSize: "1rem",
          }}>
            Created by FiliUp
          </button>
          <button style={{
            backgroundColor: "#fefcbf", // Light color
            color: "#1e293b",
            border: "none",
            borderRadius: "0.375rem",
            padding: "0.5rem 1rem",
            cursor: "pointer",
            fontSize: "1rem",
          }}>
            Created by Teacher
          </button>
        </div>

        {loading ? (
          <div style={{
            textAlign: "center",
            padding: "2rem",
            color: "#64748b",
          }}>
            Loading stories...
          </div>
        ) : error ? (
          <div style={{
            textAlign: "center",
            padding: "2rem",
            color: "#ef4444",
          }}>
            {error}
          </div>
        ) : stories.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "2rem",
            color: "#64748b",
          }}>
            {genre 
              ? `No stories available for ${getGenreLabel(genre)}`
              : 'No stories available for this class yet.'
            }
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(800px, 1fr))",
            gap: "1.5rem",
          }}>
            {stories.map((story, index) => (
              <div
                key={story.storyId}
                style={{
                  backgroundColor: "#d1fae5",
                  borderRadius: "0.5rem",
                  overflow: "hidden",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  cursor: "pointer",
                  padding: "1rem",
                  marginBottom: "0.5rem",
                }}
                onClick={() => toggleStory(story.storyId)}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span style={{ marginRight: "1.5rem", marginLeft: "1rem", fontSize: "1.3rem", color: "#1e293b" }}>
                    ▼
                  </span>
                  <div style={{ display: "block" }}>
                    <p style={{
                      fontSize: "0.875rem",
                      color: "#64748b",
                      margin: 0,
                    }}>
                      Story {index + 1}
                    </p>
                    <h3 style={{
                      fontSize: "1.35rem",
                      fontWeight: "700",
                      marginBottom: "0.5rem",
                      color: "#1e293b",
                    }}>
                      {story.title}
                    </h3>
                  </div>
                </div>

                {expandedStory === story.storyId && (
                  <div style={{ marginTop: "1rem", borderLeft: "2px solid #1e293b", paddingLeft: "1rem" }}>
                    <button 
                      style={{ 
                        marginBottom: "0.5rem", 
                        padding: "0.5rem 1rem", 
                        backgroundColor: "#fefcbf", 
                        border: "none", 
                        borderRadius: "0.25rem" 
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        openModal(story)
                      }}
                    >
                      Read Story
                    </button>
                    <div style={{ marginTop: "0.5rem", fontWeight: "bold", backgroundColor: "#fefcbf", padding: "0.5rem", borderRadius: "0.25rem" }}>
                      {story.title} Quiz
                    </div>
                    <p>Date & Time Started:</p>
                    <p>Date & Time Finished:</p>
                    <p>Score: -/12</p>
                    <button style={{ padding: "0.5rem 1rem", backgroundColor: "#34d399", border: "none", borderRadius: "0.25rem" }}>
                      Attempt Quiz
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Story Modal */}
      <Dialog open={modalOpen} onClose={closeModal} maxWidth="md" fullWidth>
        <DialogTitle>{selectedStory?.title}</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
            {selectedStory?.content}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModal} color="primary">Close</Button>
          <Button onClick={() => {/* Handle Attempt Quiz logic */}} color="primary">Attempt Quiz</Button>
        </DialogActions>
      </Dialog>
    </div>
  )
} 