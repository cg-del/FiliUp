import AssessmentIcon from '@mui/icons-material/Assessment';
import BookIcon from '@mui/icons-material/Book';
import GroupIcon from '@mui/icons-material/Group';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PeopleIcon from '@mui/icons-material/People';
import QuizIcon from '@mui/icons-material/Quiz';
import SchoolIcon from '@mui/icons-material/School';
import { Avatar, Box, Button, Card, CardContent, Chip, Container, Divider, Grid, List, ListItem, ListItemAvatar, ListItemText, Paper, Tab, Tabs, Typography, alpha, useTheme } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useUser();
  const theme = useTheme();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0
  });
  const [stories, setStories] = useState({
    teacherStories: [],
    commonStories: []
  });
  const [recentAccounts, setRecentAccounts] = useState([]);
  const [recentStories, setRecentStories] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [userMap, setUserMap] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        const [usersRes, classesRes, storiesRes, commonStoriesRes] = await Promise.all([
          axios.get('http://localhost:8080/api/user/getAllUser', {
            headers: { Authorization: `Bearer ${accessToken}` }
          }),
          axios.get('http://localhost:8080/api/classes', {
            headers: { Authorization: `Bearer ${accessToken}` }
          }),
          axios.get('http://localhost:8080/api/stories', {
            headers: { Authorization: `Bearer ${accessToken}` }
          }),
          axios.get('http://localhost:8080/api/common-stories', {
            headers: { Authorization: `Bearer ${accessToken}` }
          })
        ]);

        const users = usersRes.data;
        // Create a map of user IDs to user data
        const userDataMap = users.reduce((acc, user) => {
          acc[user.userId] = user;
          return acc;
        }, {});
        setUserMap(userDataMap);

        setStats({
          totalStudents: users.filter(u => u.userRole === 'STUDENT').length,
          totalTeachers: users.filter(u => u.userRole === 'TEACHER').length,
          totalClasses: classesRes.data.length
        });

        // Set recent accounts (last 5 created)
        setRecentAccounts(users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5));

        // Set stories
        const allStories = storiesRes.data;
        const commonStories = commonStoriesRes.data;
        setStories({
          teacherStories: allStories,
          commonStories: commonStories
        });

        // Set recent stories (last 5 created)
        const allRecentStories = [...allStories, ...commonStories]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);
        setRecentStories(allRecentStories);

      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const getInitials = (name) => {
    return name
      ? name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
      : '?';
  };

  if (!user || user.userRole !== 'ADMIN') {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="error">Access denied. Admin privileges required.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: alpha(theme.palette.primary.main, 0.02), pt: 3, pb: 6 }}>
      <Container maxWidth="lg">
        {/* Admin Profile Section */}
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
                  Welcome back, {user?.userName}!
                </Typography>
                <Typography variant="subtitle1">
                  {user?.userEmail} • Administrator
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
                  Sign Out
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>

        {/* Statistics Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', width: '100%', p: 2 }}>
              <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: '16px !important' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <PeopleIcon sx={{ color: 'primary.main', mr: 2, fontSize: 48 }} />
                  <Typography variant="h5" fontWeight="bold">Students</Typography>
                </Box>
                <Box sx={{ ml: 4 }}>
                  <Typography variant="h3" color="primary.main" fontWeight="bold">{stats.totalStudents}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', width: '100%', p: 2 }}>
              <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: '16px !important' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <GroupIcon sx={{ color: 'primary.main', mr: 2, fontSize: 48 }} />
                  <Typography variant="h5" fontWeight="bold">Teachers</Typography>
                </Box>
                <Box sx={{ ml: 4 }}>
                  <Typography variant="h3" color="primary.main" fontWeight="bold">{stats.totalTeachers}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', width: '100%', p: 2 }}>
              <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: '16px !important' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <SchoolIcon sx={{ color: 'primary.main', mr: 2, fontSize: 48 }} />
                  <Typography variant="h5" fontWeight="bold">Classes</Typography>
                </Box>
                <Box sx={{ ml: 4 }}>
                  <Typography variant="h3" color="primary.main" fontWeight="bold">{stats.totalClasses}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Quick Access Section */}
        <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 4 }}>
          Quick Access
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Common Stories Management */}
          <Grid item xs={12} md={3}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' },
                height: '100%',
              }}
              onClick={() => navigate('/admin/common-stories')}
            >
              <BookIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Common Story Bank
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                Manage stories available to all classes
              </Typography>
            </Paper>
          </Grid>

          {/* Story Bank */}
          <Grid item xs={12} md={3}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' },
                height: '100%',
              }}
              onClick={() => navigate('/admin/story-bank')}
            >
              <MenuBookIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Teacher Story Bank
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                View all stories created by teachers
              </Typography>
            </Paper>
          </Grid>

          {/* Question Bank */}
          <Grid item xs={12} md={3}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' },
                height: '100%',
              }}
              onClick={() => navigate('/admin/question-bank')}
            >
              <QuizIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Question Bank
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                Manage multiple choice questions
              </Typography>
            </Paper>
          </Grid>

          {/* User Management */}
          <Grid item xs={12} md={3}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' },
                height: '100%',
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
          <Grid item xs={12} md={3}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' },
                height: '100%',
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

        {/* Recent Activity Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Recent Accounts
              </Typography>
              <List>
                {recentAccounts.map((account) => (
                  <ListItem key={account.userId} sx={{ mb: 1 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: account.userRole === 'TEACHER' ? 'primary.main' : 'secondary.main' }}>
                        {getInitials(account.userName)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={account.userName}
                      secondary={
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <Chip label={account.userRole} size="small" />
                          <Typography variant="caption" color="text.secondary">
                            {new Date(account.createdAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Recent Stories
              </Typography>
              <List>
                {recentStories.map((story) => (
                  <ListItem key={story.storyId} sx={{ mb: 1 }}>
                    <ListItemAvatar>
                      {story.coverPicture ? (
                        <Avatar
                          src={`data:${story.coverPictureType};base64,${story.coverPicture}`}
                          variant="rounded"
                          sx={{ width: 40, height: 40 }}
                        />
                      ) : (
                        <Avatar variant="rounded" sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>
                          <BookIcon />
                        </Avatar>
                      )}
                    </ListItemAvatar>
                    <ListItemText
                      primary={story.title}
                      secondary={
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <Chip label={story.genre} size="small" />
                          <Typography variant="caption" color="text.secondary">
                            {new Date(story.createdAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>

        {/* Story Catalog Section */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Story Catalog
          </Typography>
          <Tabs value={selectedTab} onChange={handleTabChange} sx={{ mb: 2 }}>
            <Tab label={`Teacher Stories (${stories.teacherStories.length})`} />
            <Tab label={`Common Stories (${stories.commonStories.length})`} />
          </Tabs>
          
          {selectedTab === 0 && (
            <List>
              {stories.teacherStories.map((story) => {
                const creator = userMap[story.createdBy?.userId];
                return (
                  <ListItem
                    key={story.storyId}
                    sx={{
                      mb: 2,
                      bgcolor: 'background.paper',
                      borderRadius: 1,
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                  >
                    <ListItemAvatar>
                      {story.coverPicture ? (
                        <Avatar
                          src={`data:${story.coverPictureType};base64,${story.coverPicture}`}
                          variant="rounded"
                          sx={{ width: 56, height: 56 }}
                        />
                      ) : (
                        <Avatar variant="rounded" sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}>
                          <BookIcon />
                        </Avatar>
                      )}
                    </ListItemAvatar>
                    <ListItemText
                      primary={story.title}
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            {story.content.substring(0, 100)}...
                          </Typography>
                          <Box sx={{ mt: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Chip label={story.genre} size="small" />
                            <Chip 
                              label={`By: ${creator ? creator.userName : 'Loading...'}`} 
                              size="small"
                              avatar={
                                <Avatar sx={{ width: 20, height: 20, fontSize: '0.75rem' }}>
                                  {creator ? getInitials(creator.userName) : '?'}
                                </Avatar>
                              }
                            />
                            <Chip label={`Class: ${story.classEntity?.className || 'Unknown'}`} size="small" />
                            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                              {new Date(story.createdAt).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                );
              })}
            </List>
          )}
          
          {selectedTab === 1 && (
            <List>
              {stories.commonStories.map((story) => {
                const creator = userMap[story.createdBy?.userId];
                return (
                  <ListItem
                    key={story.storyId}
                    sx={{
                      mb: 2,
                      bgcolor: 'background.paper',
                      borderRadius: 1,
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                  >
                    <ListItemAvatar>
                      {story.coverPicture ? (
                        <Avatar
                          src={`data:${story.coverPictureType};base64,${story.coverPicture}`}
                          variant="rounded"
                          sx={{ width: 56, height: 56 }}
                        />
                      ) : (
                        <Avatar variant="rounded" sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}>
                          <BookIcon />
                        </Avatar>
                      )}
                    </ListItemAvatar>
                    <ListItemText
                      primary={story.title}
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            {story.content.substring(0, 100)}...
                          </Typography>
                          <Box sx={{ mt: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Chip label={story.genre} size="small" />
                            <Chip 
                              label={`By: ${creator ? creator.userName : 'Loading...'}`} 
                              size="small"
                              avatar={
                                <Avatar sx={{ width: 20, height: 20, fontSize: '0.75rem' }}>
                                  {creator ? getInitials(creator.userName) : '?'}
                                </Avatar>
                              }
                            />
                            <Chip label="Common Story" size="small" color="primary" />
                            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                              {new Date(story.createdAt).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                );
              })}
            </List>
          )}
        </Paper>
      </Container>
    </Box>
  );
} 