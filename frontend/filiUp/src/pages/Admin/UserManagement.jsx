import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';
import {
    Avatar,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    IconButton,
    InputAdornment,
    InputLabel,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    MenuItem,
    Paper,
    Select,
    Tab,
    Tabs,
    TextField,
    Typography,
    alpha,
    useTheme
} from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';

export default function UserManagement() {
  const navigate = useNavigate();
  const { user } = useUser();
  const theme = useTheme();
  const [users, setUsers] = useState({ TEACHERS: [], STUDENTS: [] });
  const [selectedTab, setSelectedTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    userName: '',
    userEmail: '',
    userPassword: '',
    userRole: ''
  });

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

  // Function to fetch users with token handling
  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/user/getAllUser', {
        headers: {
          Authorization: `Bearer ${accessToken}`
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
      setError('Failed to load users. Please try again.');
      setUsers({ TEACHERS: [], STUDENTS: [] });
      setLoading(false);
    }
  };

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

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

  const handleCreateUser = () => {
    setFormData({
      userName: '',
      userEmail: '',
      userPassword: '',
      userRole: selectedTab === 0 ? 'TEACHER' : 'STUDENT'
    });
    setSelectedUser(null);
    setDialogOpen(true);
  };

  const handleEditUser = (user) => {
    setFormData({
      userName: user.userName,
      userEmail: user.userEmail,
      userPassword: '', // Don't show password
      userRole: user.userRole
    });
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (selectedUser) {
        // Update existing user
        await axios.put(`http://localhost:8080/api/user/putUser?id=${selectedUser.userId}`, formData, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
      } else {
        // Create new user
        await axios.post('http://localhost:8080/api/user/postUser', formData, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
      }
      setDialogOpen(false);
      fetchUsers();
    } catch (error) {
      setError('Failed to save user.');
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:8080/api/user/deleteUser/${selectedUser.userId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      setDeleteDialogOpen(false);
      fetchUsers();
    } catch (error) {
      setError('Failed to delete user.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
          <Typography variant="h4">User Management</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateUser}
        >
          Add New User
        </Button>
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 3 }}>
          {error}
        </Typography>
      )}

      {/* Search Bar */}
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search users..."
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

      {/* Tabs */}
      <Tabs value={selectedTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Teachers" />
        <Tab label="Students" />
      </Tabs>

      {/* User List */}
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
            <Typography variant="subtitle2" sx={{ width: '30%', fontWeight: 'bold' }}>
              Name
            </Typography>
            <Typography variant="subtitle2" sx={{ width: '40%', fontWeight: 'bold' }}>
              Email
            </Typography>
            <Typography variant="subtitle2" sx={{ width: '20%', fontWeight: 'bold' }}>
              Role
            </Typography>
          </Box>
          <Box sx={{ width: 100 }} /> {/* Actions space */}
        </Box>

        <List sx={{ width: '100%' }}>
          {filterUsers(users[selectedTab === 0 ? 'TEACHERS' : 'STUDENTS']).map((user) => (
            <ListItem
              key={user.userId}
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
              secondaryAction={
                <Box>
                  <IconButton 
                    edge="end" 
                    onClick={() => handleEditUser(user)}
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    edge="end" 
                    onClick={() => handleDeleteUser(user)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              }
            >
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <PersonIcon />
                </Avatar>
              </ListItemAvatar>
              <Box sx={{ flex: 1, display: 'flex', gap: 2 }}>
                <Typography variant="body1" sx={{ width: '30%' }}>
                  {user.userName}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ width: '40%' }}>
                  {user.userEmail}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ width: '20%' }}>
                  {user.userRole}
                </Typography>
              </Box>
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Create/Edit Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedUser ? 'Edit User' : 'Create New User'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              name="userName"
              label="Name"
              value={formData.userName}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              name="userEmail"
              label="Email"
              type="email"
              value={formData.userEmail}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              name="userPassword"
              label="Password"
              type="password"
              value={formData.userPassword}
              onChange={handleInputChange}
              fullWidth
              helperText={selectedUser ? "Leave blank to keep current password" : ""}
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                name="userRole"
                value={formData.userRole}
                label="Role"
                onChange={handleInputChange}
              >
                <MenuItem value="TEACHER">Teacher</MenuItem>
                <MenuItem value="STUDENT">Student</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {selectedUser?.userName}? This action cannot be undone.
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