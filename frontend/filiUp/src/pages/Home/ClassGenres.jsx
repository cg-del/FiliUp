"use client"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Search, Bell, User } from "lucide-react"

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
  const { classId } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    // Get user info from localStorage
    const userInfo = JSON.parse(localStorage.getItem('user') || '{}')
    setUserName(userInfo.userName || '')
    fetchGenres()
  }, [classId])

  const fetchGenres = async () => {
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

      const stories = await response.json()
      
      // Get unique genres from stories
      const genres = [...new Set(stories.map(story => story.genre))]
      setAvailableGenres(genres)
      
      // Set class name if we have stories
      if (stories.length > 0 && stories[0].classEntity) {
        setClassName(stories[0].classEntity.className)
      }
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

  return (
    <div className="min-h-screen bg-white">
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
            marginRight: "50rem",
          }}>
            Genre
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
        margin: "0 auto",
        padding: "2rem",
      }}>
        {/* Welcome Message */}
        <div style={{ marginBottom: "2rem" }}>
          <h2 style={{
            fontSize: "1.5rem",
            fontWeight: "500",
            color: "#1e293b",
            marginBottom: "0.5rem",
          }}>
            Welcome back, kids! Get ready for a new adventure in learning—FiliUp is excited to have you back!
          </h2>
          <p style={{
            fontSize: "1.125rem",
            color: "#64748b",
          }}>
            Now it's time to pick a genre—choose the one that excites you most and get ready to explore stories that match your style!
          </p>
        </div>

        {loading ? (
          <div style={{
            textAlign: "center",
            padding: "2rem",
            color: "#64748b",
          }}>
            Loading genres...
          </div>
        ) : error ? (
          <div style={{
            textAlign: "center",
            padding: "2rem",
            color: "#ef4444",
          }}>
            {error}
          </div>
        ) : availableGenres.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "2rem",
            color: "#64748b",
          }}>
            No stories available for this class yet.
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1.5rem",
          }}>
            {availableGenres.map((genre, index) => {
              // Rotate between different pastel background colors
              const backgrounds = [
                'rgba(167, 243, 208, 0.2)',  // Pastel Green
                'rgba(167, 243, 208, 0.2)',  // Pastel Green
                'rgba(167, 243, 208, 0.2)',  // Pastel Green
              ]
              const bgColor = backgrounds[index % backgrounds.length]

              return (
                <div
                  key={genre}
                  onClick={() => handleGenreClick(genre)}
                  style={{
                    backgroundColor: bgColor,
                    borderRadius: "1rem",
                    padding: "2rem",
                    cursor: "pointer",
                    transition: "transform 0.2s ease",
                    minHeight: "200px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)"
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = "translateY(0)"
                  }}
                >
                  <h3 style={{
                    fontSize: "1.5rem",
                    fontWeight: "600",
                    color: "#1e293b",
                    textAlign: "center",
                  }}>
                    {getGenreLabel(genre)}
                  </h3>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
} 