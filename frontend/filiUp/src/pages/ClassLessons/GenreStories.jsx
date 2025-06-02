import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import * as Separator from '@radix-ui/react-separator';
import { Book, BookOpen, Star } from 'lucide-react';

// Genre options with colors for consistent styling
const GENRE_OPTIONS = [
  { value: 'MAIKLING_KWENTO', label: 'Maikling Kwento', shortLabel: 'M', color: '#e74c3c' },
  { value: 'TULA', label: 'Tula', shortLabel: 'T', color: '#e91e63' },
  { value: 'DULA', label: 'Dula', shortLabel: 'D', color: '#9c27b0' },
  { value: 'NOBELA', label: 'Nobela', shortLabel: 'N', color: '#3f51b5' },
  { value: 'SANAYSAY', label: 'Sanaysay', shortLabel: 'S', color: '#2196f3' },
  { value: 'AWIT', label: 'Awit', shortLabel: 'A', color: '#00bcd4' },
  { value: 'KORIDO', label: 'Korido', shortLabel: 'K', color: '#009688' },
  { value: 'EPIKO', label: 'Epiko', shortLabel: 'E', color: '#4caf50' },
  { value: 'BUGTONG', label: 'Bugtong', shortLabel: 'B', color: '#8bc34a' },
  { value: 'SALAWIKAIN', label: 'Salawikain', shortLabel: 'S', color: '#cddc39' },
  { value: 'TALUMPATI', label: 'Talumpati', shortLabel: 'T', color: '#ffc107' },
  { value: 'MITOLOHIYA', label: 'Mitolohiya', shortLabel: 'M', color: '#ff9800' },
  { value: 'ALAMAT', label: 'Alamat', shortLabel: 'A', color: '#ff5722' },
  { value: 'PARABULA', label: 'Parabula', shortLabel: 'P', color: '#795548' },
  { value: 'PABULA', label: 'Pabula', shortLabel: 'P', color: '#607d8b' }
];

// Define motion component for book to fix linter error
const MotionDiv = motion.div;

export default function GenreStories({ classId }) {
  const [loading, setLoading] = useState(false);
  const [stories, setStories] = useState([]);
  const [storyCount, setStoryCount] = useState(0);
  const [mostPopularGenre, setMostPopularGenre] = useState(null);
  const accessToken = localStorage.getItem('accessToken');

  useEffect(() => {
    if (classId) {
      setLoading(true);
      axios
        .get(`http://localhost:8080/api/classes/${classId}/stories`, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        })
        .then((res) => {
          setStories(res.data || []);
          setStoryCount(res.data?.length || 0);
          
          // Calculate most popular genre
          if (res.data?.length > 0) {
            const genreCounts = {};
            res.data.forEach(story => {
              if (story.genre) {
                genreCounts[story.genre] = (genreCounts[story.genre] || 0) + 1;
              }
            });
            
            let maxCount = 0;
            let maxGenre = null;
            
            Object.entries(genreCounts).forEach(([genre, count]) => {
              if (count > maxCount) {
                maxCount = count;
                maxGenre = genre;
              }
            });
            
            setMostPopularGenre(maxGenre);
          }
        })
        .catch(() => {
          setStories([]);
          setStoryCount(0);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [classId, accessToken]);

  return (
    <div className="w-full">
      {/* Book Genre Grid */}
      <div className="grid-container mb-8">
        {GENRE_OPTIONS.map((genre) => (
          <div className="grid-item" key={genre.value}>
            <div className="book-wrapper">
              <MotionDiv
                whileHover={{ 
                  scale: 1.05, 
                  y: -5,
                  transition: { duration: 0.2 } 
                }}
                className="book-container"
                style={{ backgroundColor: genre.color }}
              >
                <div className="book-tab"></div>
                <div className="book-content">
                  <div className="book-letter">{genre.shortLabel}</div>
                  <div className="book-title">{genre.label}</div>
                </div>
                <div className="book-spine-line"></div>
              </MotionDiv>
            </div>
          </div>
        ))}
      </div>

      {/* Statistics */}
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-header">
            <Book size={20} color="#666" className="stat-icon" />
            <span className="stat-title">Total Genres</span>
          </div>
          <h2 className="stat-value">15</h2>
          <p className="stat-description">Available literary genres</p>
        </div>
        
        <div className="stat-card">
          <div className="stat-header">
            <BookOpen size={20} color="#666" className="stat-icon" />
            <span className="stat-title">Stories Available</span>
          </div>
          <h2 className="stat-value">{storyCount}</h2>
          <p className="stat-description">Stories across all genres</p>
        </div>
        
        <div className="stat-card">
          <div className="stat-header">
            <Star size={20} color="#666" className="stat-icon" />
            <span className="stat-title">Most Popular</span>
          </div>
          <h2 className="stat-value">
            {mostPopularGenre ? 
              GENRE_OPTIONS.find(g => g.value === mostPopularGenre)?.label || 'N/A' 
              : 'N/A'}
          </h2>
          <p className="stat-description">Most accessed genre</p>
        </div>
      </div>
      
      {/* Empty state or loading */}
      {loading ? (
        <div className="loader-container">
          <div className="spinner"></div>
        </div>
      ) : stories.length === 0 ? (
        <div className="empty-state">
          <BookOpen size={40} color="#9e9e9e" className="empty-icon" />
          <h3 className="empty-title">No stories yet</h3>
          <p className="empty-description">
            Start building your Filipino literature collection by adding stories to different genres.
          </p>
          <button className="add-story-button">
            Add Your First Story
          </button>
        </div>
      ) : null}

      <style jsx="true">{`
        .grid-container {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(95px, 1fr));
          gap: 3rem;
          width: 100%;
        }
        
        .grid-item {
          display: flex;
          justify-content: center;
        }
        
        .book-wrapper {
          padding: 0;
          display: flex;
          justify-content: center;
        }
        
        .book-container {
          position: relative;
          width: 95px; /* 40% wider than the original 68px */
          height: 140px;
          border-radius: 6px;
          overflow: visible;
          box-shadow: 0 10px 10px -5px rgba(0, 0, 0, 0.2);
          transition: all 0.2s ease;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        
        .book-tab {
          position: absolute;
          width: 18px;
          height: 10px;
          background-color: white;
          top: 0;
          right: 10px;
          border-radius: 0 0 4px 4px;
          box-shadow: 0 2px 2px rgba(0, 0, 0, 0.1);
        }
        
        .book-content {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          width: 100%;
          height: 100%;
          padding: 10px 0;
          z-index: 2;
        }
        
        .book-letter {
          font-size: 2.2rem;
          font-weight: bold;
          color: white;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          line-height: 1;
          margin-bottom: 8px;
        }
        
        .book-title {
          font-size: 0.65rem;
          color: white;
          font-weight: 500;
          line-height: 1.2;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
          padding: 0 2px;
        }
        
        .book-spine-line {
          position: absolute;
          bottom: 14px;
          left: 10px;
          right: 10px;
          height: 1px;
          background-color: rgba(255, 255, 255, 0.4);
        }
        
        /* Stats section */
        .stats-container {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 2rem;
        }
        
        .stat-card {
          background-color: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          padding: 1.25rem;
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        
        .stat-header {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          margin-bottom: 0.25rem;
        }
        
        .stat-icon {
          width: 1.25rem;
          height: 1.25rem;
        }
        
        .stat-title {
          font-size: 0.875rem;
          font-weight: 500;
          color: #111827;
        }
        
        .stat-value {
          font-size: 1.875rem;
          font-weight: 700;
          margin: 0.5rem 0;
          color: #111827;
        }
        
        .stat-description {
          font-size: 0.875rem;
          color: #6b7280;
        }
        
        /* Loading spinner */
        .loader-container {
          display: flex;
          justify-content: center;
          padding: 2.5rem 0;
        }
        
        .spinner {
          width: 2rem;
          height: 2rem;
          border-radius: 50%;
          border: 0.25rem solid #e2e8f0;
          border-top-color: #0891b2;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        /* Empty state */
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem 0;
          text-align: center;
          background-color: white;
          border-radius: 0.5rem;
          border: 1px solid #e2e8f0;
          margin-top: 1rem;
        }
        
        .empty-icon {
          margin-bottom: 1rem;
        }
        
        .empty-title {
          font-size: 1.125rem;
          font-weight: 500;
          margin-bottom: 0.5rem;
          color: #111827;
        }
        
        .empty-description {
          font-size: 0.875rem;
          color: #6b7280;
          max-width: 28rem;
          margin-bottom: 0.25rem;
        }
        
        .add-story-button {
          margin-top: 0.5rem;
          background-color: #0ca678;
          color: white;
          border: none;
          border-radius: 0.375rem;
          padding: 0.75rem 1.25rem;
          font-weight: 500;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          transition: background-color 0.2s;
        }
        
        .add-story-button:hover {
          background-color: #099268;
        }
        
        /* For responsive grid */
        @media (max-width: 600px) {
          .stats-container {
            grid-template-columns: 1fr;
          }
          
          .book-container {
            width: 84px; /* 40% wider than the original 60px */
            height: 120px;
          }
          
          .book-letter {
            font-size: 1.8rem;
          }
          
          .book-title {
            font-size: 0.6rem;
          }
        }
        
        @media (min-width: 601px) and (max-width: 960px) {
          .stats-container {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .grid-container {
            grid-template-columns: repeat(auto-fill, minmax(85px, 1fr));
            gap: 2rem;
          }
        }
        
        @media (min-width: 1200px) {
          .book-container {
            width: 98px; /* 40% wider than the original 70px */
            height: 150px;
          }
        }
      `}</style>
    </div>
  );
} 