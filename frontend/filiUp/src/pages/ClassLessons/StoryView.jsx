import { Avatar, Box, Button, Paper, Typography } from '@mui/material';
import React from 'react';

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

export default function StoryView({ story, onAttemptQuiz }) {
  if (!story) return null;
  const genreLabel = GENRE_OPTIONS.find(opt => opt.value === story.genre)?.label || story.genre;

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
      {/* Attempt Quiz button fixed at bottom right */}
      <Box sx={{ position: 'absolute', bottom: 32, right: 32 }}>
        <Button variant="contained" color="primary" size="large" onClick={onAttemptQuiz}>
          Attempt Quiz
        </Button>
      </Box>
    </Box>
  );
} 