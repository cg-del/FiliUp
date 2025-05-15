import { Avatar, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Paper, Select, TextField, Typography } from '@mui/material';
import axios from 'axios';
import React, { useState } from 'react';

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

const DIFFICULTY_LEVELS = [
    { value: 'EASY', label: 'Easy' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HARD', label: 'Hard' }
];

const QUIZ_CATEGORIES = [
    { value: 'GRAMMAR', label: 'Grammar' },
    { value: 'VOCABULARY', label: 'Vocabulary' },
    { value: 'READING', label: 'Reading' },
    { value: 'WRITING', label: 'Writing' },
    { value: 'LISTENING', label: 'Listening' },
    { value: 'SPEAKING', label: 'Speaking' },
    { value: 'CULTURE', label: 'Culture' }
];

export default function StoryView({ story, onAttemptQuiz }) {
  const [createQuizDialogOpen, setCreateQuizDialogOpen] = useState(false);
  const [quizForm, setQuizForm] = useState({
    title: `${story?.title} Quiz`,
    description: `Quiz for ${story?.title}`,
    timeLimitMinutes: 30
  });

  if (!story) return null;
  const genreLabel = GENRE_OPTIONS.find(opt => opt.value === story.genre)?.label || story.genre;

  const handleCreateQuiz = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      await axios.post(
        `http://localhost:8080/api/stories/${story.storyId}/quiz`,
        quizForm,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
      setCreateQuizDialogOpen(false);
      // You might want to refresh the story data here
    } catch (error) {
      console.error('Failed to create quiz:', error);
      alert('Failed to create quiz. Please try again.');
    }
  };

  const handleFormChange = (e) => {
    setQuizForm({
      ...quizForm,
      [e.target.name]: e.target.value
    });
  };

  return (
    <Box sx={{ position: 'relative', height: '80vh', display: 'flex', flexDirection: 'column', bgcolor: '#e3f2fd' }}>
      {/* Title at the top */}
      <Box sx={{ p: 4, pb: 2, bgcolor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
        <Typography variant="h4" fontWeight={700} align="center" gutterBottom>
          {story.title}
        </Typography>
      </Box>
      {/* Content area */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 4, pb: 8, bgcolor: '#f8f9fa' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
          {story.coverPicture && (
            <Avatar
              src={`data:${story.coverPictureType};base64,${story.coverPicture}`}
              sx={{ width: 120, height: 120, mb: 2 }}
              variant="rounded"
            />
          )}
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            {genreLabel}
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ whiteSpace: 'pre-line', maxWidth: 800, mx: 'auto' }}>{story.content}</Typography>
      </Box>
      {/* Create Quiz button fixed at bottom right */}
      <Box sx={{ position: 'absolute', bottom: 32, right: 32 }}>
        <Button 
          variant="contained" 
          color="primary" 
          size="large" 
          onClick={() => setCreateQuizDialogOpen(true)}
        >
          Create Quiz
        </Button>
      </Box>

      {/* Create Quiz Dialog */}
      <Dialog 
        open={createQuizDialogOpen} 
        onClose={() => setCreateQuizDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create Quiz for {story.title}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              name="title"
              label="Quiz Title"
              value={quizForm.title}
              onChange={handleFormChange}
              fullWidth
            />
            <TextField
              name="description"
              label="Description"
              value={quizForm.description}
              onChange={handleFormChange}
              multiline
              rows={2}
              fullWidth
            />
            <TextField
              name="timeLimitMinutes"
              label="Time Limit (minutes)"
              type="number"
              value={quizForm.timeLimitMinutes}
              onChange={handleFormChange}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateQuizDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateQuiz} variant="contained" color="primary">
            Create Quiz
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 