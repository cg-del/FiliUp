"use client"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Book } from "lucide-react"

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
  const { classId, genre } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
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
          <div>
            <h1 style={{
              fontSize: "1.5rem",
              fontWeight: "600",
              margin: 0,
            }}>
              {className || 'Class Stories'}
            </h1>
            {genre && (
              <p style={{
                fontSize: "1rem",
                margin: "0.25rem 0 0 0",
                opacity: 0.9,
              }}>
                {getGenreLabel(genre)}
              </p>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        maxWidth: "1200px",
        margin: "2rem auto",
        padding: "0 1rem",
      }}>
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
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1.5rem",
          }}>
            {stories.map((story) => (
              <div
                key={story.storyId}
                style={{
                  backgroundColor: "#d1fae5",
                  borderRadius: "0.5rem",
                  overflow: "hidden",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  cursor: "pointer",
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
                <div style={{
                  backgroundColor: "#e3f2fd",
                  padding: "1.5rem",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}>
                  <Book size={32} color="#2196f3" />
                </div>
                <div style={{ padding: "1.5rem" }}>
                  <h3 style={{
                    fontSize: "1.125rem",
                    fontWeight: "600",
                    marginBottom: "0.5rem",
                    color: "#1e293b",
                  }}>
                    {story.title}
                  </h3>
                  {!genre && (
                    <p style={{
                      fontSize: "0.875rem",
                      color: "#64748b",
                    }}>
                      Genre: {getGenreLabel(story.genre)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
} 