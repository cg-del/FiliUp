import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Avatar, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Paper, TextField, Typography } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';

export default function ClassManagement() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newClass, setNewClass] = useState({ className: '', description: '' });
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [teachers, setTeachers] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState(null);
  const [classTeachers, setClassTeachers] = useState({});

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
  const refreshToken = localStorage.getItem('refreshToken');

  // Function to refresh the access token
  const refreshAccessToken = async () => {
    try {
      const response = await axios.post('http://localhost:8080/api/user/refresh', {
        refreshToken: refreshToken
      });
      const { accessToken: newAccessToken } = response.data;
      localStorage.setItem('accessToken', newAccessToken);
      return newAccessToken;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      navigate('/sign-in');
      return null;
    }
  };

  // Function to fetch classes with token handling
  const fetchClasses = async (token) => {
    try {
      const response = await axios.get('http://localhost:8080/api/classes', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setClasses(response.data);
      setLoading(false);
      setError('');
    } catch (error) {
      if (error.response?.status === 401) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          return fetchClasses(newToken);
        }
      }
      setError('Failed to load classes. Please try again.');
      setClasses([]);
      setLoading(false);
    }
  };

  // Function to fetch teachers with token handling
  const fetchTeachers = async (token) => {
    try {
      const response = await axios.get('http://localhost:8080/api/user/getAllUser', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const teacherList = response.data.filter(user => user.userRole === 'TEACHER');
      setTeachers(teacherList);
    } catch (error) {
      if (error.response?.status === 401) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          return fetchTeachers(newToken);
        }
      }
      console.error('Failed to load teachers:', error);
    }
  };

  // Function to fetch teacher info for a class
  const fetchClassTeacher = async (classId, token) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/classes/${classId}/teacher`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setClassTeachers(prev => ({
        ...prev,
        [classId]: response.data
      }));
    } catch (error) {
      if (error.response?.status === 401) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          return fetchClassTeacher(classId, newToken);
        }
      }
      console.error('Failed to load teacher info:', error);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    if (accessToken) {
      fetchClasses(accessToken);
      fetchTeachers(accessToken);
    } else {
      setError('No authentication token found. Please log in again.');
      setLoading(false);
      navigate('/sign-in');
    }
  }, [accessToken, navigate]);

  // Update useEffect to fetch teacher info for each class
  useEffect(() => {
    if (classes.length > 0 && accessToken) {
      classes.forEach(classItem => {
        fetchClassTeacher(classItem.classId, accessToken);
      });
    }
  }, [classes, accessToken]);

  const handleCreateClass = async () => {
    try {
      const response = await axios.post(
        `http://localhost:8080/api/classes?teacherId=${selectedTeacher}`,
        newClass,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
      setClasses([...classes, response.data]);
      setDialogOpen(false);
      setNewClass({ className: '', description: '' });
      setSelectedTeacher('');
    } catch (error) {
      if (error.response?.status === 401) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          return handleCreateClass();
        }
      }
      setError('Failed to create class. Please try again.');
    }
  };

  const handleDeleteClass = async (classId) => {
    try {
      await axios.delete(`http://localhost:8080/api/classes/${classId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      setClasses(classes.filter(c => c.classId !== classId));
      setDeleteDialogOpen(false);
      setClassToDelete(null);
    } catch (error) {
      if (error.response?.status === 401) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          return handleDeleteClass(classId);
        }
      }
      setError('Failed to delete class. Please try again.');
    }
  };

  const handleRegenerateCode = async (classId) => {
    try {
      const response = await axios.post(
        `http://localhost:8080/api/classes/${classId}/regenerate-code`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
      setClasses(classes.map(c => c.classId === classId ? response.data : c));
    } catch (error) {
      if (error.response?.status === 401) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          return handleRegenerateCode(classId);
        }
      }
      setError('Failed to regenerate class code. Please try again.');
    }
  };

  const handleViewClass = (classId) => {
    navigate(`/admin/class/${classId}/lessons`);
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
      {/* Header with back button */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/admin')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4">Class Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
          sx={{ ml: 'auto' }}
        >
          Create Class
        </Button>
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 3 }}>
          {error}
        </Typography>
      )}

      {/* Class List */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 3 }}>
        {classes.map((classItem) => (
          <Paper
            key={classItem.classId}
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 6
              }
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">{classItem.className}</Typography>
              <Box>
                <IconButton
                  size="small"
                  onClick={() => handleViewClass(classItem.classId)}
                  title="View Class"
                  color="primary"
                >
                  <VisibilityIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleRegenerateCode(classItem.classId)}
                  title="Regenerate Code"
                >
                  <RefreshIcon />
                </IconButton>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => {
                    setClassToDelete(classItem);
                    setDeleteDialogOpen(true);
                  }}
                  title="Delete Class"
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {classItem.description}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Class Code: {classItem.classCode}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Students: {classItem.students?.length || 0}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Teacher: {classTeachers[classItem.classId]?.teacherName || 'Loading...'}
            </Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<VisibilityIcon />}
              onClick={() => handleViewClass(classItem.classId)}
              sx={{ mt: 1 }}
            >
              View Class Details
            </Button>
          </Paper>
        ))}
      </Box>

      {/* Create Class Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Create New Class</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Class Name"
            fullWidth
            value={newClass.className}
            onChange={(e) => setNewClass({ ...newClass, className: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={newClass.description}
            onChange={(e) => setNewClass({ ...newClass, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            select
            margin="dense"
            label="Teacher"
            fullWidth
            value={selectedTeacher}
            onChange={(e) => setSelectedTeacher(e.target.value)}
            SelectProps={{
              native: true
            }}
          >
            <option value="">Select a teacher</option>
            {teachers.map((teacher) => (
              <option key={teacher.userId} value={teacher.userId}>
                {teacher.userName}
              </option>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateClass} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Class</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {classToDelete?.className}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => handleDeleteClass(classToDelete?.classId)}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 