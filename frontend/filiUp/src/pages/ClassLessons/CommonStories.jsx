import { Avatar, Box, FormControl, InputLabel, MenuItem, Paper, Select, Typography } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';

const GENRE_OPTIONS = [
  { value: 'ALL', label: 'All Genres' },
  { value: 'PANTASYA', label: 'Pantasya' },
  { value: 'ROMANSA', label: 'Romansa' },
  { value: 'MISTERYO', label: 'Misteryo' }
];

const CommonStories = ({ onViewStory }) => {
  const [commonStories, setCommonStories] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('ALL');

  // Get access token from localStorage
  const accessToken = localStorage.getItem('accessToken');

  // Fetch common stories
  useEffect(() => {
    axios.get('http://localhost:8080/api/common-stories', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
      .then(res => {
        setCommonStories(res.data);
      })
      .catch(() => {
        setCommonStories([]);
      });
  }, [accessToken]);

  // Filter stories by genre
  const filteredStories = selectedGenre === 'ALL' 
    ? commonStories 
    : commonStories.filter(story => story.genre === selectedGenre);

  return (
    <Box>
      {/* Genre Filter */}
      <FormControl sx={{ minWidth: 200, mb: 3 }}>
        <InputLabel>Genre</InputLabel>
        <Select
          value={selectedGenre}
          label="Genre"
          onChange={(e) => setSelectedGenre(e.target.value)}
        >
          {GENRE_OPTIONS.map(option => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Stories Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 3 }}>
        {filteredStories.map(story => (
          <Paper
            key={story.storyId}
            onClick={() => onViewStory(story)}
            sx={{
              p: 3,
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 6
              }
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {story.coverPicture && (
                <Avatar
                  src={`data:${story.coverPictureType};base64,${story.coverPicture}`}
                  sx={{ 
                    width: 200, 
                    height: 200, 
                    mb: 2,
                    boxShadow: 2,
                    '&:hover': {
                      boxShadow: 4
                    }
                  }}
                  variant="rounded"
                />
              )}
              <Typography variant="h6" gutterBottom align="center">
                {story.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                {GENRE_OPTIONS.find(opt => opt.value === story.genre)?.label || story.genre}
              </Typography>
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

export default CommonStories; 