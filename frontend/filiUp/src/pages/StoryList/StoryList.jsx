"use client"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ChevronLeft, Book, Clock, User } from "lucide-react"
import { useUser } from "../../context/UserContext"

// Get genre details from the constant list
const STORY_GENRES = {
  "folk-tales": {
    name: "Folk Tales",
    description: "Traditional stories passed down through generations",
    color: "#4CAF50"
  },
  "myths": {
    name: "Myths",
    description: "Ancient stories explaining natural phenomena",
    color: "#2196F3"
  },
  "legends": {
    name: "Legends",
    description: "Historical tales with a touch of fantasy",
    color: "#9C27B0"
  },
  "fables": {
    name: "Fables",
    description: "Short stories with moral lessons",
    color: "#FF9800"
  },
  "contemporary": {
    name: "Contemporary",
    description: "Modern Filipino stories",
    color: "#E91E63"
  }
}

export default function StoryList() {
  const { classId, genreId } = useParams()
  const navigate = useNavigate()
  const { user } = useUser()
  const [stories, setStories] = useState([])
  const [classDetails, setClassDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const genreDetails = STORY_GENRES[genreId] || {
    name: "Stories",
    description: "Reading materials",
    color: "#64748b"
  }

  useEffect(() => {
    fetchData()
  }, [classId, genreId])

  const fetchData = async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch class details
      const classResponse = await fetch(`http://localhost:8080/api/classes/${classId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        credentials: 'include'
      })

      if (!classResponse.ok) throw new Error('Failed to fetch class details')
      const classData = await classResponse.json()
      setClassDetails(classData)

      // Fetch stories for this class and genre
      const storiesResponse = await fetch(
        `http://localhost:8080/api/stories/class/${classId}/genre/${genreId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
          credentials: 'include'
        }
      )

      if (!storiesResponse.ok) throw new Error('Failed to fetch stories')
      const storiesData = await storiesResponse.json()
      setStories(storiesData)
    } catch (error) {
      console.error('Error:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleStoryClick = (storyId) => {
    navigate(`/class/${classId}/story/${storyId}`)
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
          onClick={() => navigate(`/class/${classId}/stories`)}
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
          Back to Genres
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
          <Book size={32} color={genreDetails.color} />
          <div>
            <h1 style={{ fontSize: "2rem", fontWeight: "600", color: "#1e293b", margin: 0 }}>
              {genreDetails.name}
            </h1>
            <p style={{ color: "#64748b", margin: "0.25rem 0 0 0" }}>
              {classDetails?.className}
            </p>
          </div>
        </div>
        <p style={{ color: "#64748b", margin: "0" }}>
          {genreDetails.description}
        </p>
      </div>

      {/* Stories List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {stories.length === 0 ? (
          <div style={{
            padding: "2rem",
            textAlign: "center",
            color: "#64748b",
            backgroundColor: "#f8fafc",
            borderRadius: "0.5rem",
          }}>
            No stories available in this genre yet.
          </div>
        ) : (
          stories.map((story) => (
            <div
              key={story.id}
              onClick={() => handleStoryClick(story.id)}
              style={{
                backgroundColor: "white",
                borderRadius: "0.5rem",
                padding: "1.5rem",
                cursor: "pointer",
                transition: "transform 0.2s, box-shadow 0.2s",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateX(4px)"
                e.currentTarget.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)"
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateX(0)"
                e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.1)"
              }}
            >
              <h3 style={{
                fontSize: "1.25rem",
                fontWeight: "600",
                color: "#1e293b",
                marginBottom: "0.5rem",
              }}>
                {story.title}
              </h3>
              <p style={{
                color: "#64748b",
                fontSize: "0.875rem",
                marginBottom: "1rem",
              }}>
                {story.description || "No description available"}
              </p>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "1.5rem",
                fontSize: "0.75rem",
                color: "#94a3b8",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  <Clock size={14} />
                  <span>{story.readingTime || "5-10"} mins</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  <User size={14} />
                  <span>{story.author || "Unknown"}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
} 