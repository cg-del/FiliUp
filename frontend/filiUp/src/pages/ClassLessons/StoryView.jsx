import { Avatar, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Paper, Select, TextField, Typography } from '@mui/material';
import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

  if (!story) return null;
  const genreLabel = GENRE_OPTIONS.find(opt => opt.value === story.genre)?.label || story.genre;

  const handleCreateQuiz = () => {
    // Navigate to the create quiz page with this story ID
    navigate(`/teacher/story/${story.storyId}/create-quiz`);
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
          onClick={handleCreateQuiz}
        >
          Create Quiz
        </Button>
      </Box>
    </Box>
  );
} 