import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
    Avatar,
    Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton,
    MenuItem,
    Paper, Stack,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    TextField, Typography
} from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import StoryView from './StoryView';

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
];

export default function Stories({ classId }) {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentStory, setCurrentStory] = useState({ 
    title: '', 
    content: '', 
    genre: '',
    coverPicture: null,
    coverPictureType: ''
  });
  const [selectedStoryId, setSelectedStoryId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteStoryId, setDeleteStoryId] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);

  // Get JWT token and userId
  const accessToken = localStorage.getItem('accessToken');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user.userId;

  // Fetch stories for this class
  useEffect(() => {
    setLoading(true);
    setError('');
    axios.get(`http://localhost:8080/api/stories/class/${classId}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
      .then(res => {
        setStories(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load stories.');
        setLoading(false);
      });
  }, [classId, accessToken]);

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result.split(',')[1];
        setCurrentStory({
          ...currentStory,
          coverPicture: base64String,
          coverPictureType: file.type
        });
        setPreviewUrl(URL.createObjectURL(file));
      };
      reader.readAsDataURL(file);
    }
  };

  // Function to get image URL
  const getImageUrl = (story) => {
    if (story.coverPicture && story.coverPictureType) {
      return `data:${story.coverPictureType};base64,${story.coverPicture}`;
    }
    return null;
  };

  // Open dialog for create or edit
  const handleOpenDialog = (story = null) => {
    if (story) {
      setEditMode(true);
      setCurrentStory({
        title: story.title,
        content: story.content,
        genre: story.genre || '',
        coverPicture: story.coverPicture,
        coverPictureType: story.coverPictureType
      });
      setSelectedStoryId(story.storyId);
      setPreviewUrl(story.coverPicture ? 
        `data:${story.coverPictureType};base64,${story.coverPicture}` : null);
    } else {
      setEditMode(false);
      setCurrentStory({ 
        title: '', 
        content: '', 
        genre: '',
        coverPicture: null,
        coverPictureType: ''
      });
      setSelectedStoryId(null);
      setPreviewUrl(null);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setPreviewUrl(null);
  };

  // Handle create or update
  const handleSave = async () => {
    try {
      // Ensure classId is a number
      const classIdNum = parseInt(classId);
      if (isNaN(classIdNum)) {
        throw new Error('Invalid Class ID');
      }

      const storyData = {
        title: currentStory.title.trim(),
        content: currentStory.content.trim(),
        genre: currentStory.genre,
        coverPicture: currentStory.coverPicture,
        coverPictureType: currentStory.coverPictureType,
        classEntity: {
          classId: classIdNum
        }
      };

      console.log('Sending story data:', JSON.stringify(storyData, null, 2));

      if (editMode) {
        // Update
        const response = await axios.put(
          `http://localhost:8080/api/stories/${selectedStoryId}`,
          storyData,
          { 
            headers: { 
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            } 
          }
        );
        console.log('Update response:', response.data);
      } else {
        // Create
        const response = await axios.post(
          `http://localhost:8080/api/stories?userId=${userId}`,
          storyData,
          { 
            headers: { 
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            } 
          }
        );
        console.log('Create response:', response.data);
      }

      // Refresh stories
      const res = await axios.get(`http://localhost:8080/api/stories/class/${classId}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setStories(res.data);
      setDialogOpen(false);
      setPreviewUrl(null);
    } catch (error) {
      console.error('Error saving story:', error);
      console.error('Request data:', error.config?.data);
      console.error('Response data:', error.response?.data);
      alert(error.response?.data || 'Failed to save story.');
    }
  };

  // Delete
  const handleDelete = async () => {
    try {
      await axios.delete(
        `http://localhost:8080/api/stories/${deleteStoryId}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      // Refresh stories
      const res = await axios.get(`http://localhost:8080/api/stories/class/${classId}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setStories(res.data);
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting story:', error);
      alert('Failed to delete story.');
    }
  };

  // Add handler for viewing a story
  const handleViewStory = (story) => {
    setSelectedStory(story);
    setViewDialogOpen(true);
  };

  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    setSelectedStory(null);
  };

  return (
    <Paper sx={{ p: 4, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" gutterBottom>Created By Me</Typography>
        <Button startIcon={<AddIcon />} variant="contained" onClick={() => handleOpenDialog()}>
          Add Story
        </Button>
      </Box>
      {loading ? (
        <Stack alignItems="center"><Typography>Loading...</Typography></Stack>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : stories.length === 0 ? (
        <Typography>No stories found for this class.</Typography>
      ) : (
        <Box>
          {stories.map(story => (
            <Paper key={story.storyId} sx={{ p: 2, mb: 2, backgroundColor: '#e3f2fd', cursor: 'pointer' }} onClick={() => handleViewStory(story)}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {story.coverPicture && (
                    <Avatar
                      src={getImageUrl(story)}
                      sx={{ width: 60, height: 60 }}
                      variant="rounded"
                    />
                  )}
                  <Box>
                    <Typography variant="h6">{story.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{
                      GENRE_OPTIONS.find(opt => opt.value === story.genre)?.label || story.genre
                    }</Typography>
                  </Box>
                </Box>
                <Box>
                  <IconButton onClick={e => { e.stopPropagation(); handleOpenDialog(story); }}><EditIcon /></IconButton>
                  <IconButton color="error" onClick={e => { e.stopPropagation(); setDeleteDialogOpen(true); setDeleteStoryId(story.storyId); }}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editMode ? 'Edit Story' : 'Add Story'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <TextField
                autoFocus
                margin="dense"
                label="Title"
                type="text"
                fullWidth
                value={currentStory.title}
                onChange={e => setCurrentStory({ ...currentStory, title: e.target.value })}
                sx={{ mb: 2 }}
                required
              />
              <TextField
                margin="dense"
                label="Content"
                type="text"
                fullWidth
                multiline
                rows={3}
                value={currentStory.content}
                onChange={e => setCurrentStory({ ...currentStory, content: e.target.value })}
                sx={{ mb: 2 }}
                required
              />
              <TextField
                select
                margin="dense"
                label="Genre"
                fullWidth
                value={currentStory.genre}
                onChange={e => setCurrentStory({ ...currentStory, genre: e.target.value })}
                sx={{ mb: 2 }}
              >
                {GENRE_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <Box sx={{ width: 200 }}>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="cover-picture-upload"
                type="file"
                onChange={handleFileSelect}
              />
              <label htmlFor="cover-picture-upload">
                <Box
                  sx={{
                    width: 200,
                    height: 200,
                    border: '2px dashed #ccc',
                    borderRadius: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    '&:hover': {
                      borderColor: 'primary.main',
                    },
                  }}
                >
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Cover preview"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <>
                      <Typography variant="body2" color="text.secondary" align="center">
                        Click to upload cover picture
                      </Typography>
                      <Typography variant="caption" color="text.secondary" align="center">
                        (Max size: 5MB)
                      </Typography>
                    </>
                  )}
                </Box>
              </label>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            {editMode ? 'Save Changes' : 'Add Story'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Story</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this story?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Story View Dialog */}
      <Dialog open={viewDialogOpen} onClose={handleCloseViewDialog} maxWidth="xl" fullWidth>
        <StoryView story={selectedStory} onClose={handleCloseViewDialog} />
      </Dialog>
    </Paper>
  );
} 