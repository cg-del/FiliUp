import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import GroupIcon from '@mui/icons-material/Group';
import { Avatar, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Paper, Select, Stack, TextField, Typography, alpha, useTheme } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ClassRecord from './ClassRecord';
import CommonStories from './CommonStories';
import Stories from './Stories';
import StoryView from './StoryView';

export default function ClassLessons() {
  const theme = useTheme();
  const { classId } = useParams();
  const navigate = useNavigate();
  const [classInfo, setClassInfo] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [form, setForm] = useState({ className: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [regenLoading, setRegenLoading] = useState(false);
  const [addStudentLoading, setAddStudentLoading] = useState(false);
  const [addStudentMessage, setAddStudentMessage] = useState('');
  const [addStudentDialogOpen, setAddStudentDialogOpen] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  const [studentResults, setStudentResults] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('stories');
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState('');
  const [stories, setStories] = useState([]);
  const [scores, setScores] = useState({});
  const [selectedStory, setSelectedStory] = useState(null);
  const [viewStoryDialogOpen, setViewStoryDialogOpen] = useState(false);

  // Get access token from localStorage
  const accessToken = localStorage.getItem('accessToken');

  // Fetch class info
  useEffect(() => {
    axios.get(`http://localhost:8080/api/classes/${classId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
      .then(res => {
        setClassInfo(res.data);
        setForm({ className: res.data.className, description: res.data.description });
      })
      .catch(() => {
        // setError('Failed to load class information.');
      });
  }, [classId, accessToken]);

  // Fetch stories for the class
  useEffect(() => {
    if (activeTab === 'classRecord') {
      axios.get(`http://localhost:8080/api/classes/${classId}/stories`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
        .then(res => {
          setStories(res.data);
        })
        .catch(() => {
          setStories([]);
        });
    }
  }, [activeTab, classId, accessToken]);

  // Fetch students when Class Record tab is selected
  useEffect(() => {
    if (activeTab === 'classRecord') {
      setStudentsLoading(true);
      setStudentsError('');
      axios.get(`http://localhost:8080/api/classes/${classId}/students`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
        .then(res => {
          setStudents(res.data);
          setStudentsLoading(false);
        })
        .catch(() => {
          setStudentsError('Failed to load students.');
          setStudentsLoading(false);
        });
    }
  }, [activeTab, classId, accessToken]);

  // Mock/fetch scores for students and stories
  useEffect(() => {
    if (activeTab === 'classRecord' && students.length > 0 && stories.length > 0) {
      // TODO: Replace this with real API call for scores
      // For now, generate random scores for demo
      const newScores = {};
      students.forEach(student => {
        newScores[student.userId] = {};
        stories.forEach(story => {
          // Random score between 60 and 100 or null
          newScores[student.userId][story.storyId] = Math.random() > 0.3 ? Math.floor(Math.random() * 41) + 60 : null;
        });
      });
      setScores(newScores);
    }
  }, [activeTab, students, stories]);

  // Edit handlers
  const handleEditOpen = () => setEditDialogOpen(true);
  const handleEditClose = () => setEditDialogOpen(false);
  const handleFormChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleEditSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await axios.put(
        `http://localhost:8080/api/classes/${classId}`,
        {
          className: form.className,
          description: form.description,
          isActive: classInfo.isActive
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
      setClassInfo(res.data);
      setEditDialogOpen(false);
    } catch {
      alert('Failed to update class.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete handlers
  const handleDeleteOpen = () => setDeleteDialogOpen(true);
  const handleDeleteClose = () => setDeleteDialogOpen(false);

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await axios.delete(
        `http://localhost:8080/api/classes/${classId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
      setDeleteDialogOpen(false);
      navigate('/teacher');
    } catch {
      alert('Failed to delete class.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegenerateCode = async () => {
    setRegenLoading(true);
    try {
      const res = await axios.post(
        `http://localhost:8080/api/classes/${classId}/regenerate-code`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
      setClassInfo(res.data);
    } catch {
      alert('Failed to regenerate class code.');
    } finally {
      setRegenLoading(false);
    }
  };

  // Add Student Modal Handlers
  const handleAddStudentDialogOpen = () => {
    setAddStudentDialogOpen(true);
    setAddStudentMessage('');
    setStudentSearch('');
    setStudentResults([]);
    setSelectedStudent(null);
  };

  const handleAddStudentDialogClose = () => setAddStudentDialogOpen(false);

  const handleAddStudent = async () => {
    if (!selectedStudent) return;
    setAddStudentLoading(true);
    setAddStudentMessage('');
    try {
      const res = await axios.post(
        `http://localhost:8080/api/classes/${classId}/students/${selectedStudent.userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
      setAddStudentMessage('Student added successfully!');
      setClassInfo(res.data);
      setStudentSearch('');
      setStudentResults([]);
      setSelectedStudent(null);
    } catch {
      setAddStudentMessage('Failed to add student. Please check the ID.');
    } finally {
      setAddStudentLoading(false);
    }
  };

  const handleStudentSearch = async (query) => {
    setSearchLoading(true);
    setStudentResults([]);
    setSelectedStudent(null);
    try {
      const res = await axios.get(
        `http://localhost:8080/api/user/search?name=${encodeURIComponent(query)}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
      setStudentResults(res.data);
    } catch {
      setStudentResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle story view
  const handleViewStory = (story) => {
    setSelectedStory(story);
    setViewStoryDialogOpen(true);
  };

  const handleCloseStoryView = () => {
    setViewStoryDialogOpen(false);
    setSelectedStory(null);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: alpha(theme.palette.primary.main, 0.02), p: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Button component={Link} to="/teacher" startIcon={<ArrowBackIcon />} variant="text">
          Back to Classes
        </Button>
      </Box>
      {/* Class Info Header */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          mb: 4,
          borderRadius: 4,
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Stack direction="row" spacing={3} alignItems="center">
            <Avatar
              sx={{
                width: 64,
                height: 64,
                bgcolor: 'white',
                color: theme.palette.primary.main,
                fontSize: '1.5rem',
              }}
            >
              <GroupIcon sx={{ fontSize: 32 }} />
            </Avatar>
            <Box flex={1}>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                {classInfo?.className}
              </Typography>
              <Typography variant="subtitle1">
                {classInfo?.description}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>Class Code:</strong> {classInfo?.classCode}
                <Button
                  size="small"
                  startIcon={<AutorenewIcon />}
                  onClick={handleRegenerateCode}
                  disabled={regenLoading}
                  sx={{ ml: 2, color: 'white', borderColor: 'white', '&:hover': { bgcolor: alpha(theme.palette.common.white, 0.1) } }}
                  variant="outlined"
                >
                  {regenLoading ? 'Regenerating...' : 'Regenerate'}
                </Button>
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>Created At:</strong> {classInfo?.createdAt ? new Date(classInfo.createdAt).toLocaleString() : ''}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>Status:</strong> {classInfo?.isActive ? 'Active' : 'Inactive'}
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Paper>
      <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 3, px: 1 }}>
        Quick Actions
      </Typography>
      <Box sx={{ display: 'flex', gap: 3, mb: 4 }}>
        {/* Edit Class Quick Action */}
        <Paper
          onClick={handleEditOpen}
          sx={{
            p: 3,
            textAlign: 'center',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: 2,
            boxShadow: 2,
            bgcolor: 'white',
            cursor: 'pointer',
            minWidth: 220,
            minHeight: 180,
            transition: 'box-shadow 0.2s',
            '&:hover': { boxShadow: 6 },
          }}
        >
          <Box
            sx={{
              bgcolor: '#2196f3',
              width: 56,
              height: 56,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
            }}
          >
            <EditIcon sx={{ color: 'white', fontSize: 32 }} />
          </Box>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
            Edit Class
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Edit class details
          </Typography>
        </Paper>

        {/* Add Student Quick Action */}
        <Paper
          onClick={handleAddStudentDialogOpen}
          sx={{
            p: 3,
            textAlign: 'center',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: 2,
            boxShadow: 2,
            bgcolor: 'white',
            cursor: 'pointer',
            minWidth: 220,
            minHeight: 180,
            transition: 'box-shadow 0.2s',
            '&:hover': { boxShadow: 6 },
          }}
        >
          <Box
            sx={{
              bgcolor: '#2196f3',
              width: 56,
              height: 56,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
            }}
          >
            <GroupIcon sx={{ color: 'white', fontSize: 32 }} />
          </Box>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
            Add Student
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Add a student to the class
          </Typography>
        </Paper>

        {/* Delete Class Quick Action */}
        <Paper
          onClick={handleDeleteOpen}
          sx={{
            p: 3,
            textAlign: 'center',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: 2,
            boxShadow: 2,
            bgcolor: 'white',
            cursor: 'pointer',
            minWidth: 220,
            minHeight: 180,
            transition: 'box-shadow 0.2s',
            '&:hover': { boxShadow: 6 },
          }}
        >
          <Box
            sx={{
              bgcolor: '#2196f3',
              width: 56,
              height: 56,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
            }}
          >
            <DeleteIcon sx={{ color: 'white', fontSize: 32 }} />
          </Box>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
            Delete Class
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Permanently delete the class
          </Typography>
        </Paper>
      </Box>
      {/* Tabs Heading */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          variant={activeTab === 'stories' ? 'contained' : 'outlined'}
          onClick={() => setActiveTab('stories')}
          sx={{ mr: 2 }}
        >
          Created by Teacher
        </Button>
        <Button
          variant={activeTab === 'commonStories' ? 'contained' : 'outlined'}
          onClick={() => setActiveTab('commonStories')}
          sx={{ mr: 2 }}
        >
          Created By FiliUp
        </Button>
        <Button
          variant={activeTab === 'classRecord' ? 'contained' : 'outlined'}
          onClick={() => setActiveTab('classRecord')}
        >
          Class Record
        </Button>
      </Box>
      {activeTab === 'stories' ? (
        <Stories classId={classId} />
      ) : activeTab === 'commonStories' ? (
        <CommonStories onViewStory={handleViewStory} />
      ) : (
        <ClassRecord
          students={students}
          stories={stories}
          scores={scores}
          studentsLoading={studentsLoading}
          studentsError={studentsError}
        />
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={handleEditClose}>
        <DialogTitle>Edit Class</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="className"
            label="Class Name"
            type="text"
            fullWidth
            value={form.className}
            onChange={handleFormChange}
            sx={{ mb: 2 }}
            required
          />
          <TextField
            margin="dense"
            name="description"
            label="Description"
            type="text"
            fullWidth
            value={form.description}
            onChange={handleFormChange}
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleEditSubmit} variant="contained" disabled={isSubmitting || !form.className.trim()}>
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteClose}>
        <DialogTitle>Delete Class</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this class?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Student Dialog */}
      <Dialog open={addStudentDialogOpen} onClose={handleAddStudentDialogClose}>
        <DialogTitle>Add Student to Class</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Search Student Name"
            type="text"
            fullWidth
            value={studentSearch}
            onChange={e => {
              setStudentSearch(e.target.value);
              if (e.target.value.length >= 2) {
                handleStudentSearch(e.target.value);
              } else {
                setStudentResults([]);
              }
            }}
            disabled={addStudentLoading}
          />
          {searchLoading && <Typography>Searching...</Typography>}
          {studentResults.length > 0 && (
            <Box sx={{ maxHeight: 200, overflowY: 'auto', mt: 1 }}>
              {studentResults.map(student => (
                <Box
                  key={student.userId}
                  sx={{
                    p: 1,
                    cursor: 'pointer',
                    bgcolor: selectedStudent?.userId === student.userId ? 'action.selected' : 'background.paper',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                  onClick={() => setSelectedStudent(student)}
                >
                  <Typography>
                    {student.userName} ({student.userEmail})
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
          {addStudentMessage && (
            <Typography sx={{ mt: 1 }} color={addStudentMessage.includes('success') ? 'success.main' : 'error'}>
              {addStudentMessage}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddStudentDialogClose} disabled={addStudentLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleAddStudent}
            variant="contained"
            disabled={addStudentLoading || !selectedStudent}
          >
            {addStudentLoading ? 'Adding...' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Story View Dialog */}
      <Dialog
        open={viewStoryDialogOpen}
        onClose={handleCloseStoryView}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            height: '90vh',
            maxHeight: '90vh'
          }
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          {selectedStory && (
            <StoryView
              story={selectedStory}
              onAttemptQuiz={() => {
                // Handle quiz attempt if needed
                handleCloseStoryView();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
} 