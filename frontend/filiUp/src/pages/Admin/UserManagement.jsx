import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';
import { Avatar, Box, IconButton, InputAdornment, Paper, Tab, Tabs, TextField, Typography } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';

export default function UserManagement() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [users, setUsers] = useState({ TEACHERS: [], STUDENTS: [] });
  const [selectedTab, setSelectedTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

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
      // If refresh fails, redirect to login
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      navigate('/sign-in');
      return null;
    }
  };

  // Function to fetch users with token handling
  const fetchUsers = async (token) => {
    try {
      const response = await axios.get('http://localhost:8080/api/user/getAllUser', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Sort users by role
      const sortedUsers = {
        TEACHERS: response.data.filter(user => user.userRole === 'TEACHER'),
        STUDENTS: response.data.filter(user => user.userRole === 'STUDENT')
      };
      setUsers(sortedUsers);
      setLoading(false);
      setError('');
    } catch (error) {
      if (error.response?.status === 401) {
        // Token expired, try to refresh
        const newToken = await refreshAccessToken();
        if (newToken) {
          // Retry the request with new token
          return fetchUsers(newToken);
        }
      }
      setError('Failed to load users. Please try again.');
      setUsers({ TEACHERS: [], STUDENTS: [] });
      setLoading(false);
    }
  };

  // Fetch users on component mount
  useEffect(() => {
    if (accessToken) {
      fetchUsers(accessToken);
    } else {
      setError('No authentication token found. Please log in again.');
      setLoading(false);
      navigate('/sign-in');
    }
  }, [accessToken, navigate]);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  // Filter users based on search query
  const filterUsers = (userList) => {
    if (!searchQuery) return userList;
    
    const query = searchQuery.toLowerCase();
    return userList.filter(user => 
      user.userName.toLowerCase().includes(query) ||
      user.userEmail.toLowerCase().includes(query)
    );
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
        <Typography variant="h4">User Management</Typography>
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 3 }}>
          {error}
        </Typography>
      )}

      {/* Search Field */}
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search by name or email..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      {/* Tabs for switching between Teachers and Students */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={selectedTab} onChange={handleTabChange}>
          <Tab label={`Teachers (${filterUsers(users.TEACHERS).length})`} />
          <Tab label={`Students (${filterUsers(users.STUDENTS).length})`} />
        </Tabs>
      </Box>

      {/* User List */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 3 }}>
        {filterUsers(selectedTab === 0 ? users.TEACHERS : users.STUDENTS).map((user) => (
          <Paper
            key={user.userId}
            sx={{
              p: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 6
              }
            }}
          >
            <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}>
              <PersonIcon />
            </Avatar>
            <Box>
              <Typography variant="h6">
                {user.userName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user.userEmail}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ID: {user.userId}
              </Typography>
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
} 