import BookIcon from '@mui/icons-material/Book';
import GroupIcon from '@mui/icons-material/Group';
import SchoolIcon from '@mui/icons-material/School';
import { Box, Button, Container, Grid, Paper, Typography } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useUser();

  if (!user || user.userRole !== 'ADMIN') {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="error">Access denied. Admin privileges required.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: 4 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
          Admin Dashboard
        </Typography>

        <Grid container spacing={3}>
          {/* Common Stories Management */}
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' },
              }}
              onClick={() => navigate('/admin/common-stories')}
            >
              <BookIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Common Stories
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                Manage stories available to all classes
              </Typography>
            </Paper>
          </Grid>

          {/* User Management */}
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' },
              }}
              onClick={() => navigate('/admin/users')}
            >
              <GroupIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                User Management
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                Manage users and their roles
              </Typography>
            </Paper>
          </Grid>

          {/* Class Management */}
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' },
              }}
              onClick={() => navigate('/admin/classes')}
            >
              <SchoolIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Class Management
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                Manage all classes and enrollments
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
} 