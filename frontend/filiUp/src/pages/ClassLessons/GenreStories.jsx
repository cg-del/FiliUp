import { Box, Typography, Grid, CircularProgress, Paper } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { teacherService } from '../../services';

const GENRE_OPTIONS = [
  { value: 'MAIKLING_KWENTO', label: 'Maikling Kwento', color: '#e74c3c' },
  { value: 'TULA', label: 'Tula', color: '#e91e63' },
  { value: 'DULA', label: 'Dula', color: '#9c27b0' },
  { value: 'NOBELA', label: 'Nobela', color: '#3f51b5' },
  { value: 'SANAYSAY', label: 'Sanaysay', color: '#2196f3' },
  { value: 'AWIT', label: 'Awit', color: '#00bcd4' },
  { value: 'KORIDO', label: 'Korido', color: '#009688' },
  { value: 'EPIKO', label: 'Epiko', color: '#4caf50' },
  { value: 'BUGTONG', label: 'Bugtong', color: '#8bc34a' },
  { value: 'SALAWIKAIN', label: 'Salawikain', color: '#cddc39' },
  { value: 'TALUMPATI', label: 'Talumpati', color: '#ffc107' },
  { value: 'MITOLOHIYA', label: 'Mitolohiya', color: '#ff9800' },
  { value: 'ALAMAT', label: 'Alamat', color: '#ff5722' },
  { value: 'PARABULA', label: 'Parabula', color: '#795548' },
  { value: 'PABULA', label: 'Pabula', color: '#607d8b' }
];

export default function GenreStories({ classId, onViewStory }) {
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch stories when genre is selected
  useEffect(() => {
    if (selectedGenre) {
      fetchStoriesByGenre(selectedGenre);
    }
  }, [selectedGenre, classId]);

  const fetchStoriesByGenre = async (genre) => {
    setLoading(true);
    setError('');
    try {
      const data = await teacherService.getClassStories(classId);
      // Filter stories by the selected genre
      const filteredStories = data.filter(story => story.genre === genre.value);
      setStories(filteredStories);
    } catch (err) {
      setError('Failed to load stories.');
    } finally {
      setLoading(false);
    }
  };

  // Function to get image URL
  const getImageUrl = (story) => {
    if (story.coverPicture && story.coverPictureType) {
      return `data:${story.coverPictureType};base64,${story.coverPicture}`;
    }
    return null;
  };

  const handleGenreClick = (genre) => {
    setSelectedGenre(genre);
  };

  const handleBackToGenres = () => {
    setSelectedGenre(null);
  };

  return (
    <Box>
      {!selectedGenre ? (
        // Display genre cards
        <Box>
          <Grid container spacing={2}>
            {GENRE_OPTIONS.map((genre) => (
              <Grid item xs={6} sm={4} md={3} lg={2} key={genre.value}>
                <Paper
                  elevation={1}
                  sx={{
                    textAlign: 'center',
                    cursor: 'pointer',
                    borderRadius: 1,
                    overflow: 'hidden',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      boxShadow: 3,
                      transform: 'translateY(-4px)'
                    }
                  }}
                  onClick={() => handleGenreClick(genre)}
                >
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    bgcolor: genre.color,
                    color: 'white',
                    height: 60,
                  }}>
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        bgcolor: 'white',
                        color: genre.color
                      }}
                    >
                      <Typography variant="subtitle2" component="span">
                        {genre.label.charAt(0)}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ py: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {genre.label}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      ) : (
        // Display stories filtered by genre
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography 
              variant="body2" 
              sx={{ 
                cursor: 'pointer', 
                color: 'primary.main',
                '&:hover': { textDecoration: 'underline' }
              }}
              onClick={handleBackToGenres}
            >
              « Back to Genres
            </Typography>
            <Typography variant="h6" sx={{ ml: 2, fontWeight: 500 }}>
              {selectedGenre.label} Stories
            </Typography>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress size={30} />
            </Box>
          ) : error ? (
            <Box sx={{ p: 2 }}>
              <Typography color="error" variant="body2">{error}</Typography>
            </Box>
          ) : stories.length === 0 ? (
            <Typography variant="body2" sx={{ p: 2 }}>
              No stories found for this genre. Try another genre or create a new story.
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {stories.map(story => (
                <Grid item xs={12} sm={6} md={4} key={story.storyId}>
                  <Paper
                    elevation={1}
                    sx={{ 
                      p: 2,
                      cursor: 'pointer',
                      borderRadius: 1,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.1s, box-shadow 0.1s',
                      '&:hover': { 
                        boxShadow: 3,
                        bgcolor: '#fafafa'
                      }
                    }}
                    onClick={() => onViewStory(story)}
                  >
                    <Typography variant="subtitle1" component="div" gutterBottom fontWeight={500}>
                      {story.title}
                    </Typography>
                    <Box 
                      sx={{ 
                        bgcolor: selectedGenre.color,
                        color: 'white',
                        py: 0.5,
                        px: 1,
                        borderRadius: 0.5,
                        alignSelf: 'flex-start',
                        mb: 1,
                        fontSize: '0.75rem'
                      }}
                    >
                      {selectedGenre.label}
                    </Box>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical'
                      }}
                    >
                      {story.content}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}
    </Box>
  );
} 