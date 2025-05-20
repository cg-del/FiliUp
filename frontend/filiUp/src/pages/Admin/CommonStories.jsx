import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Avatar, Box, Dialog, DialogContent, DialogTitle, FormControl, IconButton, InputLabel, MenuItem, Paper, Select, Typography } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';

const GENRE_OPTIONS = [
  { value: 'ALL', label: 'All Genres' },
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
];

export default function CommonStories() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [commonStories, setCommonStories] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStory, setSelectedStory] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  // Check if user is admin
  if (!user || user.userRole !== 'ADMIN') {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="error">Access denied. Admin privileges required.</Typography>
      </Box>
    );
  }

  // Get access token from localStorage
  const accessToken = localStorage.getItem('accessToken');

  // Fetch common stories
  useEffect(() => {
    setLoading(true);
    setError('');
    axios.get('http://localhost:8080/api/common-stories', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
      .then(res => {
        setCommonStories(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load stories.');
        setCommonStories([]);
        setLoading(false);
      });
  }, [accessToken]);

  // Filter stories by genre
  const filteredStories = selectedGenre === 'ALL' 
    ? commonStories 
    : commonStories.filter(story => story.genre === selectedGenre);

  const handleStoryClick = (story) => {
    setSelectedStory(story);
    setViewDialogOpen(true);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/admin')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4">Common Stories Management</Typography>
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 3 }}>
          {error}
        </Typography>
      )}

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
            onClick={() => handleStoryClick(story)}
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

      {/* Story View Dialog */}
      <Dialog 
        open={viewDialogOpen} 
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedStory && (
          <>
            <DialogTitle>
              <Typography variant="h5" component="div">
                {selectedStory.title}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {GENRE_OPTIONS.find(opt => opt.value === selectedStory.genre)?.label || selectedStory.genre}
              </Typography>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                {selectedStory.coverPicture && (
                  <Avatar
                    src={`data:${selectedStory.coverPictureType};base64,${selectedStory.coverPicture}`}
                    sx={{ 
                      width: 200, 
                      height: 200, 
                      mb: 2,
                      boxShadow: 2
                    }}
                    variant="rounded"
                  />
                )}
              </Box>
              <Typography 
                variant="body1" 
                sx={{ 
                  whiteSpace: 'pre-line',
                  lineHeight: 1.8,
                  fontSize: '1.1rem'
                }}
              >
                {selectedStory.content}
              </Typography>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
} 