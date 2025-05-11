import {
    EmojiEvents as AwardIcon,
    MenuBook as BookOpenIcon,
    SportsEsports as GameControllerIcon,
    Lightbulb as LightbulbIcon,
    Star as StarIcon,
} from '@mui/icons-material';
import { alpha, AppBar, Box, Button, Container, Grid, Link, Toolbar, Typography, useTheme } from '@mui/material';
import React from "react";
import { Link as RouterLink } from 'react-router-dom';
import logo from '../../assets/logo.svg';

export default function About() {
  const theme = useTheme();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Header */}
      <AppBar 
        position="static" 
        elevation={0} 
        sx={{ 
          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.main, 0.8)})`,
          backdropFilter: 'blur(10px)',
          borderBottom: `1px solid ${alpha(theme.palette.common.white, 0.1)}`
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                bgcolor: "white",
                borderRadius: "50%",
                p: 0.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 0 10px ${alpha(theme.palette.primary.main, 0.3)}`,
              }}
            >
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  bgcolor: "primary.main",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  "&::after": {
                    content: '""',
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    bgcolor: "white",
                  },
                }}
              />
            </Box>
            <Typography variant="h6" fontWeight="bold" sx={{ letterSpacing: 0.5 }}>
              FiliUp
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
            <Link component={RouterLink} to="/" color="inherit" underline="hover" sx={{ fontWeight: 500 }}>
              Home
            </Link>
            <Link component={RouterLink} to="/about" color="inherit" underline="hover" sx={{ fontWeight: 500 }}>
              About Us
            </Link>
            <Button 
              component={RouterLink} 
              to="/sign-in" 
              variant="contained" 
              color="secondary"
              sx={{ 
                borderRadius: 2,
                px: 2,
                py: 0.5,
                fontWeight: 600,
                boxShadow: `0 4px 14px ${alpha(theme.palette.secondary.main, 0.4)}`,
                '&:hover': {
                  boxShadow: `0 6px 20px ${alpha(theme.palette.secondary.main, 0.6)}`,
                }
              }}
            >
              Sign In
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 12 }}>
        <Box sx={{ textAlign: "center", mb: 8 }}>
          <Typography 
            variant="h1" 
            component="h1" 
            fontWeight="bold" 
            sx={{ 
              color: theme.palette.primary.main,    
              mb: 3,
              fontSize: { xs: '2.5rem', md: '3.5rem' }
            }}
          >
            About FiliUp
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary"
            sx={{ 
              maxWidth: 800,
              mx: "auto",
              fontSize: { xs: '1rem', md: '1.25rem' }
            }}
          >
            Making Filipino language learning fun and engaging for Grade 3 students
          </Typography>
        </Box>

        <Grid container spacing={6} alignItems="center" sx={{ mb: 10 }}>
          <Grid item xs={12} md={6}>
            <Typography 
              variant="h2" 
              component="h2" 
              fontWeight="bold" 
              sx={{ 
                color: theme.palette.primary.main,
                mb: 3,
                fontSize: { xs: '2rem', md: '2.5rem' }
              }}
            >
              Our Mission
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ fontSize: '1.1rem', mb: 3 }}>
              At FiliUp, we're dedicated to helping Grade 3 students develop strong Filipino language skills through
              interactive, game-based learning experiences that make education fun and effective.
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ fontSize: '1.1rem', mb: 3 }}>
              We understand that children learn best when they're engaged and enjoying themselves. That's why we've
              created a colorful, exciting digital world where students can practice reading, writing, and speaking
              Filipino while earning rewards and advancing through levels.
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
              Developed by educators and language experts, our platform aligns with the Grade 3 curriculum standards while
              providing the extra support and motivation young learners need to build confidence in their Filipino
              language abilities.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box 
              sx={{ 
                bgcolor: theme.palette.primary.main,
                borderRadius: 4,
                p: 4,
                color: "white",
                textAlign: "center"
              }}
            >
              <Box 
                sx={{ 
                  width: 200,
                  height: 200,
                  borderRadius: "50%",
                  bgcolor: "white",
                  mx: "auto",
                  mb: 3,
                  p: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.1)}`,
                  overflow: 'hidden'
                }}
              >
                <img 
                  src={logo} 
                  alt="FiliUp Logo" 
                  style={{ 
                    width: '185%', 
                    height: '185%', 
                  }}
                />
              </Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Learning Made Simpler
              </Typography>
              <Typography>
                Our gamified approach transforms Filipino language learning from a challenge into an adventure, helping
                Grade 3 students build essential skills while having fun along the way.
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ mb: 10 }}>
          <Typography 
            variant="h2" 
            component="h2" 
            fontWeight="bold" 
            textAlign="center"
            sx={{ 
              color: theme.palette.primary.main,
              mb: 6,
              fontSize: { xs: '2rem', md: '2.5rem' }
            }}
          >
            Why FiliUp Works
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box 
                sx={{ 
                  bgcolor: "background.paper",
                  borderRadius: 4,
                  p: 4,
                  boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.05)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 8px 30px ${alpha(theme.palette.primary.main, 0.15)}`,
                  }
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                  <Box 
                    sx={{ 
                      bgcolor: theme.palette.primary.main,
                      borderRadius: "50%",
                      p: 2,
                      color: "white"
                    }}
                  >
                    <GameControllerIcon fontSize="large" />
                  </Box>
                </Box>
                <Typography variant="h5" fontWeight="bold" textAlign="center" gutterBottom>
                  Gamified Learning
                </Typography>
                <Typography variant="body1" color="text.secondary" textAlign="center">
                  Our platform turns Filipino language practice into exciting games with points, badges, and levels that
                  keep students motivated and eager to learn more.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box 
                sx={{ 
                  bgcolor: "background.paper",
                  borderRadius: 4,
                  p: 4,
                  boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.05)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 8px 30px ${alpha(theme.palette.primary.main, 0.15)}`,
                  }
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                  <Box 
                    sx={{ 
                      bgcolor: theme.palette.primary.main,
                      borderRadius: "50%",
                      p: 2,
                      color: "white"
                    }}
                  >
                    <BookOpenIcon fontSize="large" />
                  </Box>
                </Box>
                <Typography variant="h5" fontWeight="bold" textAlign="center" gutterBottom>
                  Age-Appropriate Content
                </Typography>
                <Typography variant="body1" color="text.secondary" textAlign="center">
                  All our stories, activities, and challenges are specifically designed for Grade 3 students, with
                  vocabulary and themes that match their developmental stage.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box 
                sx={{ 
                  bgcolor: "background.paper",
                  borderRadius: 4,
                  p: 4,
                  boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.05)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 8px 30px ${alpha(theme.palette.primary.main, 0.15)}`,
                  }
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                  <Box 
                    sx={{ 
                      bgcolor: theme.palette.primary.main,
                      borderRadius: "50%",
                      p: 2,
                      color: "white"
                    }}
                  >
                    <StarIcon fontSize="large" />
                  </Box>
                </Box>
                <Typography variant="h5" fontWeight="bold" textAlign="center" gutterBottom>
                  Progress Tracking
                </Typography>
                <Typography variant="body1" color="text.secondary" textAlign="center">
                  Parents and teachers can easily monitor each student's progress, identifying strengths and areas that need
                  additional support through our intuitive dashboard.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Box 
          sx={{ 
            bgcolor: alpha(theme.palette.background.paper, 0.8),
            borderRadius: 4,
            p: 6,
            mb: 10
          }}
        >
          <Typography 
            variant="h2" 
            component="h2" 
            fontWeight="bold" 
            textAlign="center"
            sx={{ 
              color: theme.palette.primary.main,
              mb: 6,
              fontSize: { xs: '2rem', md: '2.5rem' }
            }}
          >
            Key Benefits
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <Box 
                  sx={{ 
                    bgcolor: theme.palette.primary.main,
                    borderRadius: "50%",
                    p: 1.5,
                    color: "white",
                    mr: 2,
                    mt: 0.5
                  }}
                >
                  <AwardIcon />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    Builds Confidence
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Our step-by-step approach helps students build confidence in their Filipino language skills through
                    consistent practice and positive reinforcement.
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <Box 
                  sx={{ 
                    bgcolor: theme.palette.primary.main,
                    borderRadius: "50%",
                    p: 1.5,
                    color: "white",
                    mr: 2,
                    mt: 0.5
                  }}
                >
                  <LightbulbIcon />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    Makes Learning Fun
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    By incorporating colorful characters, exciting stories, and interactive games, we transform Filipino
                    language learning from a chore into an activity children look forward to.
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ mb: 10 }}>
          <Typography 
            variant="h2" 
            component="h2" 
            fontWeight="bold" 
            textAlign="center"
            sx={{ 
              color: theme.palette.primary.main,
              mb: 6,
              fontSize: { xs: '2rem', md: '2.5rem' }
            }}
          >
            What Students Will Learn
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Box 
                sx={{ 
                  bgcolor: "background.paper",
                  borderRadius: 4,
                  p: 3,
                  textAlign: "center",
                  boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.05)}`,
                }}
              >
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Vocabulary
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Age-appropriate words and phrases
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box 
                sx={{ 
                  bgcolor: "background.paper",
                  borderRadius: 4,
                  p: 3,
                  textAlign: "center",
                  boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.05)}`,
                }}
              >
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Grammar
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Basic sentence structure and rules
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box 
                sx={{ 
                  bgcolor: "background.paper",
                  borderRadius: 4,
                  p: 3,
                  textAlign: "center",
                  boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.05)}`,
                }}
              >
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Reading
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Comprehension and fluency skills
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box 
                sx={{ 
                  bgcolor: "background.paper",
                  borderRadius: 4,
                  p: 3,
                  textAlign: "center",
                  boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.05)}`,
                }}
              >
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Cultural Context
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Filipino traditions and customs
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ textAlign: "center" }}>
          <Typography 
            variant="h2" 
            component="h2" 
            fontWeight="bold"
            sx={{ 
              color: theme.palette.primary.main,
              mb: 3,
              fontSize: { xs: '2rem', md: '2.5rem' }
            }}
          >
            Start Your Child's Language Journey
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary"
            sx={{ 
              mb: 6,
              maxWidth: 800,
              mx: "auto"
            }}
          >
            Give your Grade 3 student the gift of Filipino language proficiency with our engaging, effective, and fun
            learning platform. Watch as they build essential skills while enjoying every moment of the journey.
          </Typography>
          <Box sx={{ display: "flex", gap: 3, justifyContent: "center" }}>
            <Button
              component={RouterLink}
              to="/get-started"
              variant="contained"
              size="large"
              sx={{
                borderRadius: 2,
                px: 4,
                py: 1.5,
                fontWeight: 600,
                boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
                '&:hover': {
                  boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.6)}`,
                }
              }}
            >
              GET STARTED
            </Button>
            <Button
              component={RouterLink}
              to="/stories"
              variant="outlined"
              size="large"
              sx={{
                borderRadius: 2,
                px: 4,
                py: 1.5,
                fontWeight: 600,
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                }
              }}
            >
              VIEW STORIES
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
} 