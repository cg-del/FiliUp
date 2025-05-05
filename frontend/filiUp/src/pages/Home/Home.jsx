import {
    Assessment as AssessmentIcon,
    Book as BookIcon,
    MenuBook as LessonIcon,
    Logout as LogoutIcon,
    Person as PersonIcon,
    Timeline as ProgressIcon,
    PlayCircle as StartIcon,
    EmojiEvents as TrophyIcon,
} from '@mui/icons-material';
import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Container,
    Grid,
    LinearProgress,
    Paper,
    Typography,
    alpha,
    useTheme,
} from '@mui/material';
import React from 'react';
import { useUser } from '../../context/UserContext';

const featuredLessons = [
  {
    title: 'Mga Pangunahing Salita',
    description: 'Matutunan ang mga basic na salita sa Filipino',
    progress: 0,
    icon: <BookIcon />,
  },
  {
    title: 'Mga Pangungusap',
    description: 'Paano bumuo ng mga simpleng pangungusap',
    progress: 0,
    icon: <LessonIcon />,
  },
  {
    title: 'Mga Kwentong Bayan',
    description: 'Mga tradisyunal na kwento ng Pilipinas',
    progress: 0,
    icon: <BookIcon />,
  },
];

const achievements = [
  {
    title: 'Baguhan',
    description: 'Nakumpleto ang unang aralin',
    icon: <TrophyIcon />,
    unlocked: false,
  },
  {
    title: 'Masigasig',
    description: '7 araw sunod-sunod na pag-aaral',
    icon: <AssessmentIcon />,
    unlocked: false,
  },
  {
    title: 'Matalino',
    description: 'Perpektong marka sa pagsusulit',
    icon: <TrophyIcon />,
    unlocked: false,
  },
];

export default function Home() {
  const theme = useTheme();
  const { user, isAuthenticated, loading, logout } = useUser();

  // Safely get the user's initials
  const getInitials = () => {
    if (!user?.userName) return 'U';
    try {
      return user.userName.charAt(0) || 'U';
    } catch {
      return 'U';
    }
  };

  // Safely get the user's full name
  const getFullName = () => {
    if (!user) return 'User';
    try {
      return user.userName || 'User';
    } catch {
      return 'User';
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: alpha(theme.palette.primary.main, 0.02),
        pt: 8,
        pb: 12,
      }}
    >
      <Container maxWidth="lg">
        {/* Welcome Section */}
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
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={8}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar
                    sx={{
                      width: 64,
                      height: 64,
                      bgcolor: 'white',
                      color: theme.palette.primary.main,
                    }}
                  >
                    {getInitials()}
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                      Magandang Araw, {getFullName()}!
                    </Typography>
                    <Typography variant="subtitle1">
                      {user?.userEmail || 'No email provided'}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<StartIcon />}
                    sx={{
                      mt: 2,
                      bgcolor: 'white',
                      color: theme.palette.primary.main,
                      '&:hover': {
                        bgcolor: alpha(theme.palette.common.white, 0.9),
                      },
                    }}
                  >
                    Magpatuloy sa Pag-aaral
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<LogoutIcon />}
                    onClick={logout}
                    sx={{
                      mt: 2,
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
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Kabuuang Progreso
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={0}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: alpha(theme.palette.common.white, 0.2),
                      '& .MuiLinearProgress-bar': {
                        bgcolor: 'white',
                      },
                    }}
                  />
                  <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                    0% nakumpleto
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>

        {/* Lessons Section */}
        <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
          Mga Aralin
        </Typography>
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {featuredLessons.map((lesson, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  borderRadius: 4,
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 12px 24px ${alpha(theme.palette.common.black, 0.1)}`,
                  },
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      mb: 2,
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                      }}
                    >
                      {lesson.icon}
                    </Avatar>
                    <Typography variant="h6" fontWeight="bold">
                      {lesson.title}
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    {lesson.description}
                  </Typography>
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mb: 1, display: 'block' }}
                    >
                      Progreso: {lesson.progress}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={lesson.progress}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Achievements Section */}
        <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
          Mga Nakamit
        </Typography>
        <Grid container spacing={3}>
          {achievements.map((achievement, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 4,
                  bgcolor: achievement.unlocked
                    ? 'white'
                    : alpha(theme.palette.common.black, 0.02),
                  color: achievement.unlocked
                    ? 'inherit'
                    : theme.palette.text.disabled,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: achievement.unlocked
                        ? alpha(theme.palette.primary.main, 0.1)
                        : alpha(theme.palette.common.black, 0.05),
                      color: achievement.unlocked
                        ? theme.palette.primary.main
                        : theme.palette.text.disabled,
                    }}
                  >
                    {achievement.icon}
                  </Avatar>
                  <Box>
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      gutterBottom
                    >
                      {achievement.title}
                    </Typography>
                    <Typography variant="body2" color="inherit">
                      {achievement.description}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
} 