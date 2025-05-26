import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import QuizIcon from '@mui/icons-material/Quiz';
import SearchIcon from '@mui/icons-material/Search';
import { Avatar, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, IconButton, InputAdornment, InputLabel, List, ListItem, ListItemAvatar, ListItemText, MenuItem, Paper, Select, TextField, Typography, alpha, useTheme } from '@mui/material';
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
  { value: 'PABULA', label: 'Pabula' },
  { value: 'ROMSA', label: 'Romsa' },
  { value: 'PANTASYA', label: 'Pantasya' },
  { value: 'MISTERYO', label: 'Misteryo' }
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
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [questionDialogOpen, setQuestionDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    genre: '',
    coverPicture: null,
    coverPictureType: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [questionForm, setQuestionForm] = useState({
    title: '',
    questionText: '',
    options: ['', '', '', ''],
    correctAnswer: ''
  });
  const theme = useTheme();

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

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result.split(',')[1];
        setFormData(prev => ({
          ...prev,
          coverPicture: base64String,
          coverPictureType: file.type
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateStory = () => {
    setFormData({
      title: '',
      content: '',
      genre: '',
      coverPicture: null,
      coverPictureType: ''
    });
    setEditDialogOpen(true);
  };

  const handleEditStory = (story) => {
    setFormData({
      title: story.title,
      content: story.content,
      genre: story.genre,
      coverPicture: story.coverPicture,
      coverPictureType: story.coverPictureType
    });
    setSelectedStory(story);
    setEditDialogOpen(true);
  };

  const handleDeleteStory = (story) => {
    setSelectedStory(story);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (selectedStory) {
        // Update existing story
        await axios.put(`http://localhost:8080/api/common-stories/${selectedStory.storyId}`, formData, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
      } else {
        // Create new story
        await axios.post('http://localhost:8080/api/common-stories', formData, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
      }
      setEditDialogOpen(false);
      fetchStories();
    } catch (error) {
      setError('Failed to save story.');
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:8080/api/common-stories/${selectedStory.storyId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      setDeleteDialogOpen(false);
      fetchStories();
    } catch (error) {
      setError('Failed to delete story.');
    }
  };

  const fetchStories = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('http://localhost:8080/api/common-stories', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      setCommonStories(response.data);
    } catch (error) {
      setError('Failed to load stories.');
      setCommonStories([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStories();
  }, [accessToken]);

  // Filter stories by genre and search query
  const filteredStories = commonStories.filter(story => {
    const matchesGenre = selectedGenre === 'ALL' || story.genre === selectedGenre;
    const matchesSearch = searchQuery === '' || 
      story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGenre && matchesSearch;
  });

  const handleStoryClick = (story) => {
    setSelectedStory(story);
    setViewDialogOpen(true);
  };

  const handleAddQuestion = (story) => {
    navigate(`/admin/story-questions/${story.storyId}/COMMON`);
  };

  const handleQuestionInputChange = (e, index) => {
    const { name, value } = e.target;
    if (name === 'options') {
      const newOptions = [...questionForm.options];
      newOptions[index] = value;
      setQuestionForm(prev => ({
        ...prev,
        options: newOptions
      }));
    } else {
      setQuestionForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleQuestionSubmit = async () => {
    try {
      const requestData = {
        title: questionForm.title,
        questionText: questionForm.questionText,
        options: JSON.stringify(questionForm.options),
        correctAnswer: questionForm.correctAnswer,
        storyId: selectedStory.storyId
      };

      await axios.post('http://localhost:8080/api/question-bank', requestData, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      setQuestionDialogOpen(false);
      setQuestionForm({
        title: '',
        questionText: '',
        options: ['', '', '', ''],
        correctAnswer: ''
      });
    } catch (error) {
      setError('Failed to add question.');
    }
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
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton 
            onClick={() => navigate('/admin')} 
            sx={{ 
              mr: 2,
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': {
                bgcolor: 'primary.dark',
              }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4">Common Stories Management</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateStory}
        >
          Add New Story
        </Button>
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 3 }}>
          {error}
        </Typography>
      )}

      {/* Search and Filter Section */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search stories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <FormControl sx={{ minWidth: 200 }}>
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
      </Box>

      {/* Stories List */}
      <Paper sx={{ width: '100%', bgcolor: 'background.paper' }}>
        {/* Header Row */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            px: 2,
            py: 1.5,
            bgcolor: alpha(theme.palette.primary.main, 0.08),
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box sx={{ width: 60 }} /> {/* Avatar space */}
          <Box sx={{ flex: 1, display: 'flex', gap: 2 }}>
            <Typography variant="subtitle2" sx={{ width: '40%', fontWeight: 'bold' }}>
              Title
            </Typography>
            <Typography variant="subtitle2" sx={{ width: '30%', fontWeight: 'bold' }}>
              Genre
            </Typography>
            <Typography variant="subtitle2" sx={{ width: '30%', fontWeight: 'bold' }}>
              Actions
            </Typography>
          </Box>
        </Box>

        <List sx={{ width: '100%' }}>
          {filteredStories.map((story) => (
            <ListItem
              key={story.storyId}
              sx={{
                borderBottom: '1px solid',
                borderColor: 'divider',
                '&:last-child': {
                  borderBottom: 'none'
                },
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.04)
                }
              }}
            >
              <ListItemAvatar>
                {story.coverPicture ? (
                  <Avatar
                    src={`data:${story.coverPictureType};base64,${story.coverPicture}`}
                    sx={{ 
                      width: 40, 
                      height: 40,
                      cursor: 'pointer'
                    }}
                    onClick={() => handleStoryClick(story)}
                  />
                ) : (
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <BookIcon />
                  </Avatar>
                )}
              </ListItemAvatar>
              <Box sx={{ flex: 1, display: 'flex', gap: 2, alignItems: 'center' }}>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    width: '40%',
                    cursor: 'pointer',
                    '&:hover': {
                      color: 'primary.main'
                    }
                  }}
                  onClick={() => handleStoryClick(story)}
                >
                  {story.title}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ width: '30%' }}
                >
                  {GENRE_OPTIONS.find(opt => opt.value === story.genre)?.label || story.genre}
                </Typography>
                <Box sx={{ width: '30%', display: 'flex', gap: 1 }}>
                  <IconButton 
                    onClick={() => handleAddQuestion(story)} 
                    color="primary"
                    size="small"
                    title="Add Questions"
                  >
                    <QuizIcon />
                  </IconButton>
                  <IconButton 
                    onClick={() => handleEditStory(story)} 
                    color="primary"
                    size="small"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    onClick={() => handleDeleteStory(story)} 
                    color="error"
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
            </ListItem>
          ))}
        </List>
      </Paper>

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

      {/* Edit/Create Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedStory ? 'Edit Story' : 'Create New Story'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              name="title"
              label="Title"
              value={formData.title}
              onChange={handleInputChange}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Genre</InputLabel>
              <Select
                name="genre"
                value={formData.genre}
                label="Genre"
                onChange={handleInputChange}
              >
                {GENRE_OPTIONS.filter(opt => opt.value !== 'ALL').map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              name="content"
              label="Content"
              value={formData.content}
              onChange={handleInputChange}
              multiline
              rows={10}
              fullWidth
            />
            <Button
              variant="outlined"
              component="label"
              fullWidth
            >
              Upload Cover Picture
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleFileChange}
              />
            </Button>
            {formData.coverPicture && (
              <Avatar
                src={`data:${formData.coverPictureType};base64,${formData.coverPicture}`}
                sx={{ width: 200, height: 200, alignSelf: 'center' }}
                variant="rounded"
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Story</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedStory?.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 