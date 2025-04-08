import {
  Add as AddIcon,
  Assessment as AssessmentIcon,
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
  CircularProgress,
  Container,
  Grid,
  IconButton,
  Paper,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import React from 'react';
import { useUser } from '../../context/UserContext';

export default function TeacherHome() {
  const theme = useTheme();
  const { user, loading, logout } = useUser();

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

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
              <Grid item>
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
              <Grid item xs>
                <Typography variant="h4" gutterBottom>
                  Maligayang pagbabalik, {user?.userName}!
                </Typography>
                <Typography variant="subtitle1">
                  {user?.userEmail} • Guro
                </Typography>
              </Grid>
              <Grid item>
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

        {/* Quick Actions */}
        <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 3, px: 1 }}>
          Mga Mabilis na Aksyon
        </Typography>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
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
                <AddIcon />
              </IconButton>
              <Typography variant="h6" gutterBottom>
                Bagong Pagsusulit
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Lumikha ng bagong pagsusulit
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
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

          <Grid item xs={12} sm={6} md={3}>
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

          <Grid item xs={12} sm={6} md={3}>
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