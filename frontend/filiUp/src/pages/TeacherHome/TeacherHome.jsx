import {
  Add as AddIcon,
  Assessment as AssessmentIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Group as GroupIcon,
  Logout as LogoutIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  TextField,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useUser } from '../../context/UserContext';

// Add axios base configuration
axios.defaults.baseURL = 'http://localhost:8080';
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Create axios instance with auth interceptor
const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default function TeacherHome() {
  const theme = useTheme();
  const { user, logout } = useUser();
  const [classes, setClasses] = useState([
    {
      classId: 1,
      className: "1",
      description: "1",
      createdAt: "2025-05-08T09:31:10",
      isActive: true
    },
    {
      classId: 2,
      className: "Java Certification Exam",
      description: "CodeChum Java Programming 1",
      createdAt: "2025-05-08T09:31:10",
      isActive: true
    }
  ]);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create'); // 'create' or 'edit'
  const [selectedClass, setSelectedClass] = useState(null);
  const [form, setForm] = useState({ className: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleOpenDialog = (mode, classObj = null) => {
    setDialogMode(mode);
    setSelectedClass(classObj);
    setForm(classObj ? { className: classObj.className, description: classObj.description } : { className: '', description: '' });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedClass(null);
    setForm({ className: '', description: '' });
    setIsSubmitting(false);
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Create or update class
  const handleSubmit = async () => {
    if (!form.className.trim()) {
      alert('Class name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      if (dialogMode === 'create') {
        const response = await api.post(`/api/classes?teacherId=${user.userId}`, {
          className: form.className,
          description: form.description,
          isActive: true
        });
        setClasses([...classes, response.data]);
      } else if (dialogMode === 'edit' && selectedClass) {
        const response = await api.put(`/api/classes/${selectedClass.classId}`, {
          className: form.className,
          description: form.description,
          isActive: selectedClass.isActive
        });
        setClasses(classes.map(c => c.classId === selectedClass.classId ? response.data : c));
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving class:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        if (error.response.status === 401) {
          alert('Session expired. Please login again.');
          logout();
          return;
        }
      }
      alert('Error saving class. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete class
  const handleDelete = async (classId) => {
    if (!window.confirm('Are you sure you want to delete this class?')) return;
    
    try {
      await api.delete(`/api/classes/${classId}`);
      setClasses(classes.filter(c => c.classId !== classId));
    } catch (error) {
      console.error('Error deleting class:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        if (error.response.status === 401) {
          alert('Session expired. Please login again.');
          logout();
          return;
        }
      }
      alert('Error deleting class. Please try again.');
    }
  };

  // Fetch teacher's classes
  useEffect(() => {
    const fetchClasses = async () => {
      if (!user?.userId) return;
      
      try {
        const response = await api.get(`/api/classes/teacher/${user.userId}`);
        setClasses(response.data);
      } catch (error) {
        console.error('Error fetching classes:', error);
        if (error.response?.status === 401) {
          alert('Session expired. Please login again.');
          logout();
          return;
        }
        setError('Failed to fetch classes. Please try again later.');
      }
    };

    fetchClasses();
  }, [user, logout]);

  const getInitials = (name) => {
    return name
      ? name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
      : '?';
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: alpha(theme.palette.primary.main, 0.02),
        pt: 3,
        pb: 6,
      }}
    >
      <Container maxWidth="lg">
        {/* Teacher Profile Section */}
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
            <Grid container spacing={3} alignItems="center">
              <Grid>
                <Avatar
                  sx={{
                    width: 64,
                    height: 64,
                    bgcolor: 'white',
                    color: theme.palette.primary.main,
                    fontSize: '1.5rem',
                  }}
                >
                  {getInitials(user?.userName)}
                </Avatar>
              </Grid>
              <Grid xs>
                <Typography variant="h4" gutterBottom>
                  Maligayang pagbabalik, {user?.userName}!
                </Typography>
                <Typography variant="subtitle1">
                  {user?.userEmail} • Guro
                </Typography>
              </Grid>
              <Grid>
                <Button
                  variant="outlined"
                  startIcon={<LogoutIcon />}
                  onClick={logout}
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    '&:hover': {
                      borderColor: alpha(theme.palette.common.white, 0.9),
                      bgcolor: alpha(theme.palette.common.white, 0.1),
                    },
                  }}
                >
                  Mag-sign Out
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>

        {/* Classes Section */}
        <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 3, px: 1 }}>
          Mga Klase
        </Typography>
        <Box sx={{ mb: 4 }}>
          {Array.isArray(classes) && classes.length === 0 ? (
            <Paper
              sx={{
                p: 4,
                textAlign: 'center',
                color: 'text.secondary',
                borderRadius: 2,
                boxShadow: 0,
                bgcolor: 'background.paper',
              }}
            >
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Wala pang klase
              </Typography>
              <Typography variant="body2">
                Magdagdag ng klase gamit ang quick action sa itaas.
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {Array.isArray(classes) && classes.map((classObj, idx) => (
                <Grid item xs={12} sm={6} md={4} key={classObj.classId || idx}>
                  <Paper
                    sx={{
                      p: 3,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1,
                      position: 'relative',
                      borderRadius: 2,
                      boxShadow: 2,
                      bgcolor: 'white',
                      minWidth: 220,
                      minHeight: 120,
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                        {classObj.className}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          aria-label="Edit class"
                          color="primary"
                          onClick={() => handleOpenDialog('edit', classObj)}
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          aria-label="Delete class"
                          color="error"
                          onClick={() => handleDelete(classObj.classId)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {classObj.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Created: {classObj.createdAt ? new Date(classObj.createdAt).toLocaleString() : ''}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>

        {/* Dialog for Create/Edit Class */}
        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>{dialogMode === 'create' ? 'Magdagdag ng Klase' : 'I-edit ang Klase'}</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              name="className"
              label="Pangalan ng Klase"
              type="text"
              fullWidth
              value={form.className}
              onChange={handleFormChange}
              sx={{ mb: 2 }}
              required
              error={!form.className.trim()}
              helperText={!form.className.trim() ? 'Class name is required' : ''}
            />
            <TextField
              margin="dense"
              name="description"
              label="Deskripsyon"
              type="text"
              fullWidth
              value={form.description}
              onChange={handleFormChange}
              multiline
              rows={3}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} disabled={isSubmitting}>
              Kanselahin
            </Button>
            <Button 
              onClick={handleSubmit} 
              variant="contained" 
              disabled={isSubmitting || !form.className.trim()}
            >
              {isSubmitting ? 'Saving...' : dialogMode === 'create' ? 'Gumawa' : 'I-save'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Quick Actions */}
        <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 3, px: 1 }}>
          Mga Mabilis na Aksyon
        </Typography>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Add Class Quick Action */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              onClick={() => handleOpenDialog('create')}
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
                <AddIcon sx={{ color: 'white', fontSize: 32 }} />
              </Box>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                Magdagdag ng Klase
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Lumikha ng bagong klase
              </Typography>
            </Paper>
          </Grid>

          {/* Other quick actions... */}
          <Grid>
            <Paper
              sx={{
                p: 3,
                textAlign: 'center',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <IconButton
                color="primary"
                sx={{ mb: 1, bgcolor: 'primary.light', p: 2 }}
              >
                <GroupIcon />
              </IconButton>
              <Typography variant="h6" gutterBottom>
                Mga Mag-aaral
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tingnan ang mga mag-aaral
              </Typography>
            </Paper>
          </Grid>

          <Grid>
            <Paper
              sx={{
                p: 3,
                textAlign: 'center',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <IconButton
                color="primary"
                sx={{ mb: 1, bgcolor: 'primary.light', p: 2 }}
              >
                <AssessmentIcon />
              </IconButton>
              <Typography variant="h6" gutterBottom>
                Mga Ulat
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tingnan ang mga ulat at progreso
              </Typography>
            </Paper>
          </Grid>

          <Grid>
            <Paper
              sx={{
                p: 3,
                textAlign: 'center',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <IconButton
                color="primary"
                sx={{ mb: 1, bgcolor: 'primary.light', p: 2 }}
              >
                <SchoolIcon />
              </IconButton>
              <Typography variant="h6" gutterBottom>
                Mga Aralin
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pamahalaan ang mga aralin
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Recent Activity Section */}
        <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 3, px: 1 }}>
          Mga Kamakailang Gawain
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 4,
                bgcolor: 'background.paper',
              }}
            >
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Walang kamakailang gawain.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
} 