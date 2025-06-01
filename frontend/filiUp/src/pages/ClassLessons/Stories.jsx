import { Box, CircularProgress, Paper, Stack, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { teacherService } from '../../services';
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

  // Fetch stories for this class
  useEffect(() => {
    const fetchStories = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await teacherService.getClassStories(classId);
        setStories(data);
      } catch (err) {
        setError('Failed to load stories.');
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, [classId]);

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
      const storyData = {
        ...currentStory,
        classId
      };

      let savedStory;
      if (editMode && selectedStoryId) {
        savedStory = await teacherService.updateStory(selectedStoryId, storyData);
        setStories(stories.map(story => 
          story.storyId === selectedStoryId ? savedStory : story
        ));
      } else {
        savedStory = await teacherService.createStory(storyData);
        setStories([...stories, savedStory]);
      }

      handleCloseDialog();
    } catch (err) {
      setError('Failed to save story.');
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deleteStoryId) return;

    try {
      await teacherService.deleteStory(deleteStoryId);
      setStories(stories.filter(story => story.storyId !== deleteStoryId));
      setDeleteDialogOpen(false);
      setDeleteStoryId(null);
    } catch (err) {
      setError('Failed to delete story.');
    }
  };

  const handleOpenDeleteDialog = (storyId) => {
    setDeleteStoryId(storyId);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setDeleteStoryId(null);
  };

  const handleViewStory = (story) => {
    setSelectedStory(story);
    setViewDialogOpen(true);
  };

  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    setSelectedStory(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">Stories</Typography>
        <Button variant="contained" color="primary" onClick={() => handleOpenDialog()}>
          Add Story
        </Button>
      </Box>

      {/* Story Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 3 }}>
        {stories.map(story => (
          <Paper
            key={story.storyId}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              cursor: 'pointer',
              '&:hover': { boxShadow: 6 }
            }}
          >
            <Box
              onClick={() => handleViewStory(story)}
              sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}
            >
              {getImageUrl(story) && (
                <Box
                  component="img"
                  src={getImageUrl(story)}
                  alt={story.title}
                  sx={{
                    width: '100%',
                    height: 150,
                    objectFit: 'cover',
                    borderRadius: 1,
                    mb: 2
                  }}
                />
              )}
              <Typography variant="h6" gutterBottom>{story.title}</Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {story.content}
              </Typography>
            </Box>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button size="small" onClick={() => handleOpenDialog(story)}>Edit</Button>
              <Button size="small" color="error" onClick={() => handleOpenDeleteDialog(story.storyId)}>
                Delete
              </Button>
            </Box>
          </Paper>
        ))}
      </Box>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editMode ? 'Edit Story' : 'Create Story'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Title"
              value={currentStory.title}
              onChange={(e) => setCurrentStory({ ...currentStory, title: e.target.value })}
              fullWidth
              required
            />
            <FormControl fullWidth required>
              <InputLabel>Genre</InputLabel>
              <Select
                value={currentStory.genre}
                onChange={(e) => setCurrentStory({ ...currentStory, genre: e.target.value })}
                label="Genre"
              >
                {GENRE_OPTIONS.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Content"
              value={currentStory.content}
              onChange={(e) => setCurrentStory({ ...currentStory, content: e.target.value })}
              multiline
              rows={4}
              fullWidth
              required
            />
            <input
              accept="image/*"
              type="file"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              id="cover-picture-input"
            />
            <label htmlFor="cover-picture-input">
              <Button variant="outlined" component="span">
                Upload Cover Picture
              </Button>
            </label>
            {previewUrl && (
              <Box
                component="img"
                src={previewUrl}
                alt="Cover preview"
                sx={{
                  width: '100%',
                  maxHeight: 200,
                  objectFit: 'contain'
                }}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={!currentStory.title || !currentStory.content || !currentStory.genre}
          >
            {editMode ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete Story</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this story?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Story Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={handleCloseViewDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { minHeight: '70vh' } }}
      >
        <DialogContent>
          {selectedStory && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {getImageUrl(selectedStory) && (
                <Box
                  component="img"
                  src={getImageUrl(selectedStory)}
                  alt={selectedStory.title}
                  sx={{
                    width: '100%',
                    maxHeight: 300,
                    objectFit: 'contain'
                  }}
                />
              )}
              <Typography variant="h4" gutterBottom>{selectedStory.title}</Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {selectedStory.content}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 