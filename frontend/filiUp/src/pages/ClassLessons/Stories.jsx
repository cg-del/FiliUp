import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
    Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton,
    Paper, Stack, TextField, Typography
} from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';

export default function Stories({ classId }) {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentStory, setCurrentStory] = useState({ title: '', content: '', difficultyLevel: '' });
  const [selectedStoryId, setSelectedStoryId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteStoryId, setDeleteStoryId] = useState(null);

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

  // Open dialog for create or edit
  const handleOpenDialog = (story = null) => {
    if (story) {
      setEditMode(true);
      setCurrentStory({
        title: story.title,
        content: story.content,
        difficultyLevel: story.difficultyLevel || ''
      });
      setSelectedStoryId(story.storyId);
    } else {
      setEditMode(false);
      setCurrentStory({ title: '', content: '', difficultyLevel: '' });
      setSelectedStoryId(null);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => setDialogOpen(false);

  // Handle create or update
  const handleSave = async () => {
    try {
      if (editMode) {
        // Update
        await axios.put(
          `http://localhost:8080/api/stories/${selectedStoryId}`,
          { ...currentStory, classEntity: { classId: classId } },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
      } else {
        // Create
        await axios.post(
          `http://localhost:8080/api/stories?userId=${userId}`,
          { ...currentStory, classEntity: { classId: classId } },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
      }
      // Refresh stories
      const res = await axios.get(`http://localhost:8080/api/stories/class/${classId}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setStories(res.data);
      setDialogOpen(false);
    } catch {
      alert('Failed to save story.');
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
    } catch {
      alert('Failed to delete story.');
    }
  };

  return (
    <Paper sx={{ p: 4, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" gutterBottom>Stories</Typography>
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
            <Paper key={story.storyId} sx={{ p: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6">{story.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{story.difficultyLevel}</Typography>
                  <Typography variant="body1" sx={{ mt: 1 }}>{story.content}</Typography>
                </Box>
                <Box>
                  <IconButton onClick={() => handleOpenDialog(story)}><EditIcon /></IconButton>
                  <IconButton color="error" onClick={() => { setDeleteDialogOpen(true); setDeleteStoryId(story.storyId); }}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>{editMode ? 'Edit Story' : 'Add Story'}</DialogTitle>
        <DialogContent>
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
            margin="dense"
            label="Difficulty Level"
            type="text"
            fullWidth
            value={currentStory.difficultyLevel}
            onChange={e => setCurrentStory({ ...currentStory, difficultyLevel: e.target.value })}
            sx={{ mb: 2 }}
            placeholder="e.g. BEGINNER, INTERMEDIATE, ADVANCED"
          />
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
    </Paper>
  );
} 