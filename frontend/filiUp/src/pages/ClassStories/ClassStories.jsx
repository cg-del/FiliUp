"use client"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ChevronLeft, Book } from "lucide-react"
import { useUser } from "../../context/UserContext"

const STORY_GENRES = [
  {
    id: "folk-tales",
    name: "Folk Tales",
    description: "Traditional stories passed down through generations",
    color: "#4CAF50"
  },
  {
    id: "myths",
    name: "Myths",
    description: "Ancient stories explaining natural phenomena",
    color: "#2196F3"
  },
  {
    id: "legends",
    name: "Legends",
    description: "Historical tales with a touch of fantasy",
    color: "#9C27B0"
  },
  {
    id: "fables",
    name: "Fables",
    description: "Short stories with moral lessons",
    color: "#FF9800"
  },
  {
    id: "contemporary",
    name: "Contemporary",
    description: "Modern Filipino stories",
    color: "#E91E63"
  }
]

export default function ClassStories() {
  const { classId } = useParams()
  const navigate = useNavigate()
  const { user } = useUser()
  const [classDetails, setClassDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchClassDetails()
  }, [classId])

  const fetchClassDetails = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/classes/${classId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setClassDetails(data)
      } else {
        throw new Error('Failed to fetch class details')
      }
    } catch (error) {
      setError('Failed to load class details')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenreClick = (genreId) => {
    navigate(`/class/${classId}/stories/${genreId}`)
  }

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        Loading...
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "#ef4444" }}>
        {error}
      </div>
    )
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "none",
            border: "none",
            color: "#64748b",
            cursor: "pointer",
            marginBottom: "1rem",
          }}
        >
          <ChevronLeft size={20} />
          Back to Classes
        </button>
        <h1 style={{ fontSize: "2rem", fontWeight: "600", color: "#1e293b" }}>
          {classDetails?.className || 'Class Stories'}
        </h1>
        <p style={{ color: "#64748b", marginTop: "0.5rem" }}>
          {classDetails?.description}
        </p>
      </div>

      {/* Genres Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        gap: "1.5rem",
      }}>
        {STORY_GENRES.map((genre) => (
          <div
            key={genre.id}
            onClick={() => handleGenreClick(genre.id)}
            style={{
              backgroundColor: "white",
              borderRadius: "1rem",
              overflow: "hidden",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
              cursor: "pointer",
              transition: "transform 0.2s, box-shadow 0.2s",
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
              backgroundColor: genre.color,
              height: "8px",
            }} />
            <div style={{ padding: "1.5rem" }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                marginBottom: "1rem",
              }}>
                <Book size={24} color={genre.color} />
                <h3 style={{
                  fontSize: "1.25rem",
                  fontWeight: "600",
                  color: "#1e293b",
                  margin: 0,
                }}>
                  {genre.name}
                </h3>
              </div>
              <p style={{
                color: "#64748b",
                fontSize: "0.875rem",
                margin: 0,
              }}>
                {genre.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 