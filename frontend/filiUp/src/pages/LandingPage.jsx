import {
    ArrowForward as ArrowForwardIcon,
    EmojiEvents as AwardIcon,
    MenuBook as BookIcon,
    Facebook as FacebookIcon,
    GitHub as GitHubIcon,
    People as PeopleIcon,
    School as SchoolIcon,
    Twitter as TwitterIcon,
} from "@mui/icons-material";
import {
    alpha,
    AppBar,
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    CardMedia,
    Container,
    Divider,
    Grid,
    IconButton,
    Link,
    Toolbar,
    Typography,
    useTheme,
} from "@mui/material";
import { Link as RouterLink } from 'react-router-dom';
import filiupLogo from '../assets/filiup-logo-svg.svg';

// Logo components remain the same
const JavaLogo = () => (
  <Box sx={{ width: 80, height: 48 }}>
    <svg viewBox="0 0 300 200" width="100%" height="100%">
      <path
        d="M120,20 C120,20 150,50 180,20 C215,-15 250,15 250,50 C250,85 215,115 180,80 C150,50 120,80 120,50 C120,15 85,-15 50,20 C15,55 50,85 85,50 C120,20 120,20 120,20 Z"
        fill="#5B9BD5"
      />
      <path d="M120,20 C120,20 150,50 180,20 C215,-15 250,15 250,50" stroke="#D4232C" strokeWidth="8" fill="none" />
    </svg>
  </Box>
);

const PythonLogo = () => (
  <Box sx={{ width: 80, height: 80 }}>
    <svg viewBox="0 0 256 255" width="100%" height="100%">
      <path
        d="M126.916.072c-64.832 0-60.784 28.115-60.784 28.115l.072 29.128h61.868v8.745H41.631S.145 61.355.145 126.77c0 65.417 36.21 63.097 36.21 63.097h21.61v-30.356s-1.165-36.21 35.632-36.21h61.362s34.475.557 34.475-33.319V33.97S194.67.072 126.916.072zM92.802 19.66a11.12 11.12 0 0 1 11.13 11.13 11.12 11.12 0 0 1-11.13 11.13 11.12 11.12 0 0 1-11.13-11.13 11.12 11.12 0 0 1 11.13-11.13z"
        fill="#3572A5"
      />
      <path
        d="M128.757 254.126c64.832 0 60.784-28.115 60.784-28.115l-.072-29.127H127.6v-8.745h86.441s41.486 4.705 41.486-60.712c0-65.416-36.21-63.096-36.21-63.096h-21.61v30.355s1.165 36.21-35.632 36.21h-61.362s-34.475-.557-34.475 33.32v56.013s-5.235 33.897 62.518 33.897zm34.114-19.586a11.12 11.12 0 0 1-11.13-11.13 11.12 11.12 0 0 1 11.13-11.131 11.12 11.12 0 0 1 11.13 11.13 11.12 11.12 0 0 1-11.13 11.13z"
        fill="#FFD43B"
      />
    </svg>
  </Box>
);

export default function LandingPage() {
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
              filiUp
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
            <Link component={RouterLink} to="#features" color="inherit" underline="hover" sx={{ fontWeight: 500 }}>
              Features
            </Link>
            <Link component={RouterLink} to="#courses" color="inherit" underline="hover" sx={{ fontWeight: 500 }}>
              Courses
            </Link>
            <Link component={RouterLink} to="#about" color="inherit" underline="hover" sx={{ fontWeight: 500 }}>
              About
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

      {/* Hero Section */}
      <Container sx={{ py: 10 }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box sx={{ maxWidth: 600 }}>
              <Typography 
                variant="h1" 
                component="h1" 
                fontWeight="bold" 
                gutterBottom
                sx={{ 
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  lineHeight: 1.2,
                  mb: 2,
                  background: `linear-gradient(90deg, ${theme.palette.text.primary}, ${theme.palette.primary.main})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                Learn Programming{" "}
                <Box component="span" color="primary.main">
                  Effectively
                </Box>
              </Typography>
              <Typography 
                variant="h6" 
                color="text.secondary" 
                paragraph
                sx={{ 
                  fontSize: { xs: '1rem', md: '1.25rem' },
                  mb: 4,
                  lineHeight: 1.6,
                }}
              >
                Master coding skills with interactive lessons, real-time feedback, and certification exams that prepare
                you for the industry.
              </Typography>
              <Box sx={{ mt: 4, display: "flex", gap: 2 }}>
                <Button 
                  component={RouterLink} 
                  to="/sign-up" 
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
                  Get Started
                </Button>
                <Button 
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
                  Explore Courses
                </Button>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6} sx={{ display: "flex", justifyContent: "center" }}>
            <Box 
              sx={{ 
                width: '100%', 
                maxWidth: 700,
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: -20,
                  right: -20,
                  width: '100%',
                  height: '100%',
                  borderRadius: '30px',
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
                  zIndex: -1,
                }
              }}
            >
              <img 
                src={filiupLogo} 
                alt="FiliUp Logo" 
                style={{ 
                  width: '100%', 
                  height: 'auto', 
                  maxHeight: '500px',
                  filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.1))'
                }} 
              />
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Features Section */}
      <Box 
        sx={{ 
          bgcolor: alpha(theme.palette.background.paper, 0.8), 
          py: 10,
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '100%',
            background: `radial-gradient(circle at 50% 0%, ${alpha(theme.palette.primary.main, 0.05)}, transparent 70%)`,
            zIndex: 0,
          }
        }}
      >
        <Container sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: "center", mb: 8 }}>
            <Typography 
              variant="h3" 
              component="h2" 
              fontWeight="bold" 
              gutterBottom
              sx={{ 
                mb: 2,
                background: `linear-gradient(90deg, ${theme.palette.text.primary}, ${theme.palette.primary.main})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
              }}
            >
              Why Choose filiUp?
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary" 
              sx={{ 
                maxWidth: 700, 
                mx: "auto",
                lineHeight: 1.6,
              }}
            >
              Our platform offers everything you need to succeed in your programming journey
            </Typography>
          </Box>

          <Grid container spacing={4}>
            <Grid item xs={12} sm={6} md={3}>
              <Box 
                sx={{ 
                  textAlign: "center", 
                  p: 4, 
                  bgcolor: alpha(theme.palette.secondary.main, 0.05),
                  borderRadius: 4,
                  transition: 'all 0.3s ease',
                  boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.05)}`,
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: `0 12px 30px ${alpha(theme.palette.common.black, 0.1)}`,
                  }
                }}
              >
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    mb: 3,
                    boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.2)}`,
                  }}
                >
                  <SchoolIcon fontSize="large" />
                </Avatar>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Certification Exams
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  Earn industry-recognized certifications to boost your career
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Box 
                sx={{ 
                  textAlign: "center", 
                  p: 4, 
                  bgcolor: alpha(theme.palette.secondary.main, 0.05),
                  borderRadius: 4,
                  transition: 'all 0.3s ease',
                  boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.05)}`,
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: `0 12px 30px ${alpha(theme.palette.common.black, 0.1)}`,
                  }
                }}
              >
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    mb: 3,
                    boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.2)}`,
                  }}
                >
                  <BookIcon fontSize="large" />
                </Avatar>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Interactive Learning
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  Learn by doing with our hands-on coding exercises
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Box 
                sx={{ 
                  textAlign: "center", 
                  p: 4, 
                  bgcolor: alpha(theme.palette.secondary.main, 0.05),
                  borderRadius: 4,
                  transition: 'all 0.3s ease',
                  boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.05)}`,
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: `0 12px 30px ${alpha(theme.palette.common.black, 0.1)}`,
                  }
                }}
              >
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    mb: 3,
                    boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.2)}`,
                  }}
                >
                  <AwardIcon fontSize="large" />
                </Avatar>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Expert Instructors
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  Learn from industry professionals with years of experience
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Box 
                sx={{ 
                  textAlign: "center", 
                  p: 4, 
                  bgcolor: alpha(theme.palette.secondary.main, 0.05),
                  borderRadius: 4,
                  transition: 'all 0.3s ease',
                  boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.05)}`,
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: `0 12px 30px ${alpha(theme.palette.common.black, 0.1)}`,
                  }
                }}
              >
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    mb: 3,
                    boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.2)}`,
                  }}
                >
                  <PeopleIcon fontSize="large" />
                </Avatar>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Community Support
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  Connect with peers and mentors for guidance and collaboration
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Popular Courses Section */}
      <Container sx={{ py: 10 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 6 }}>
          <Typography 
            variant="h3" 
            component="h2" 
            fontWeight="bold"
            sx={{ 
              background: `linear-gradient(90deg, ${theme.palette.text.primary}, ${theme.palette.primary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
            }}
          >
            Popular Courses
          </Typography>
          <Link
            component={RouterLink}
            to="#"
            color="primary"
            sx={{ 
              display: "flex", 
              alignItems: "center", 
              textDecoration: "none",
              fontWeight: 600,
              '&:hover': {
                textDecoration: 'underline',
              }
            }}
          >
            View All <ArrowForwardIcon sx={{ ml: 0.5, fontSize: 18 }} />
          </Link>
        </Box>

        <Grid container spacing={4}>
          {/* Java Course Card */}
          <Grid item xs={12} sm={6} md={4}>
            <Card 
              sx={{ 
                borderRadius: 4, 
                boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.05)}`,
                transition: 'all 0.3s ease',
                overflow: 'hidden',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: `0 12px 30px ${alpha(theme.palette.common.black, 0.1)}`,
                }
              }}
            >
              <CardMedia sx={{ bgcolor: "#ffcdd2", p: 4, display: "flex", justifyContent: "center" }}>
                <JavaLogo />
              </CardMedia>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Java Certification Exam
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  filiUp Java Programming 1
                </Typography>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="body2" color="primary.main" fontWeight="bold">
                    4.8 ★★★★★
                  </Typography>
                  <Button 
                    component={RouterLink} 
                    to="/sign-up" 
                    variant="contained" 
                    size="small"
                    sx={{ 
                      borderRadius: 2,
                      px: 2,
                      fontWeight: 600,
                    }}
                  >
                    Enroll
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Python Course Card */}
          <Grid item xs={12} sm={6} md={4}>
            <Card 
              sx={{ 
                borderRadius: 4, 
                boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.05)}`,
                transition: 'all 0.3s ease',
                overflow: 'hidden',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: `0 12px 30px ${alpha(theme.palette.common.black, 0.1)}`,
                }
              }}
            >
              <CardMedia sx={{ bgcolor: "#e3f2fd", p: 4, display: "flex", justifyContent: "center" }}>
                <PythonLogo />
              </CardMedia>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Python for Data Science
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  filiUp Python Fundamentals
                </Typography>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="body2" color="primary.main" fontWeight="bold">
                    4.9 ★★★★★
                  </Typography>
                  <Button 
                    component={RouterLink} 
                    to="/sign-up" 
                    variant="contained" 
                    size="small"
                    sx={{ 
                      borderRadius: 2,
                      px: 2,
                      fontWeight: 600,
                    }}
                  >
                    Enroll
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Web Dev Course Card */}
          <Grid item xs={12} sm={6} md={4}>
            <Card 
              sx={{ 
                borderRadius: 4, 
                boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.05)}`,
                transition: 'all 0.3s ease',
                overflow: 'hidden',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: `0 12px 30px ${alpha(theme.palette.common.black, 0.1)}`,
                }
              }}
            >
              <CardMedia sx={{ bgcolor: "#fff3e0", p: 4, display: "flex", justifyContent: "center" }}>
                <Avatar 
                  sx={{ 
                    width: 80, 
                    height: 80, 
                    bgcolor: "#ff9800", 
                    fontSize: "1.5rem",
                    boxShadow: `0 4px 20px ${alpha("#ff9800", 0.3)}`,
                  }}
                >
                  JS
                </Avatar>
              </CardMedia>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Web Development
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  filiUp JavaScript & React
                </Typography>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="body2" color="primary.main" fontWeight="bold">
                    4.7 ★★★★★
                  </Typography>
                  <Button 
                    component={RouterLink} 
                    to="/sign-up" 
                    variant="contained" 
                    size="small"
                    sx={{ 
                      borderRadius: 2,
                      px: 2,
                      fontWeight: 600,
                    }}
                  >
                    Enroll
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box
        sx={{
          py: 10,
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
          color: "white",
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(circle at 70% 30%, ${alpha(theme.palette.common.white, 0.1)}, transparent 70%)`,
            zIndex: 0,
          }
        }}
      >
        <Container maxWidth="md" sx={{ textAlign: "center", position: 'relative', zIndex: 1 }}>
          <Typography 
            variant="h2" 
            component="h2" 
            fontWeight="bold" 
            gutterBottom
            sx={{ 
              mb: 3,
              fontSize: { xs: '2rem', md: '3rem' },
            }}
          >
            Ready to Start Your Learning Journey?
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 6, 
              opacity: 0.9,
              maxWidth: 700,
              mx: 'auto',
              lineHeight: 1.6,
            }}
          >
            Join thousands of students who are already mastering programming with filiUp
          </Typography>
          <Box sx={{ display: "flex", gap: 3, justifyContent: "center" }}>
            <Button
              component={RouterLink}
              to="/sign-up"
              variant="contained"
              size="large"
              sx={{
                bgcolor: "white",
                color: "primary.main",
                borderRadius: 3,
                px: 5,
                py: 1.5,
                fontWeight: 600,
                boxShadow: `0 4px 14px ${alpha(theme.palette.common.black, 0.2)}`,
                "&:hover": { 
                  bgcolor: "rgba(255,255,255,0.9)",
                  boxShadow: `0 6px 20px ${alpha(theme.palette.common.black, 0.3)}`,
                },
              }}
            >
              Sign Up Now
            </Button>
            <Button
              variant="outlined"
              size="large"
              sx={{
                borderColor: "white",
                color: "white",
                borderRadius: 3,
                px: 5,
                py: 1.5,
                fontWeight: 600,
                borderWidth: 2,
                "&:hover": { 
                  bgcolor: "rgba(255,255,255,0.1)",
                  borderWidth: 2,
                },
              }}
            >
              Learn More
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box 
        component="footer" 
        sx={{ 
          bgcolor: "#1e293b", 
          color: "white", 
          py: 8,
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '100%',
            background: `radial-gradient(circle at 30% 70%, ${alpha(theme.palette.primary.main, 0.1)}, transparent 70%)`,
            zIndex: 0,
          }
        }}
      >
        <Container sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={5}>
            <Grid item xs={12} md={3}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
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
                  filiUp
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>
                The complete platform for learning programming and preparing for certification exams.
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Courses
              </Typography>
              <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0 }}>
                <Box component="li" sx={{ mb: 1.5 }}>
                  <Link component={RouterLink} to="#" color="inherit" underline="hover" sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}>
                    Java
                  </Link>
                </Box>
                <Box component="li" sx={{ mb: 1.5 }}>
                  <Link component={RouterLink} to="#" color="inherit" underline="hover" sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}>
                    Python
                  </Link>
                </Box>
                <Box component="li" sx={{ mb: 1.5 }}>
                  <Link component={RouterLink} to="#" color="inherit" underline="hover" sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}>
                    JavaScript
                  </Link>
                </Box>
                <Box component="li" sx={{ mb: 1.5 }}>
                  <Link component={RouterLink} to="#" color="inherit" underline="hover" sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}>
                    C++
                  </Link>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Resources
              </Typography>
              <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0 }}>
                <Box component="li" sx={{ mb: 1.5 }}>
                  <Link component={RouterLink} to="#" color="inherit" underline="hover" sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}>
                    Blog
                  </Link>
                </Box>
                <Box component="li" sx={{ mb: 1.5 }}>
                  <Link component={RouterLink} to="#" color="inherit" underline="hover" sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}>
                    Documentation
                  </Link>
                </Box>
                <Box component="li" sx={{ mb: 1.5 }}>
                  <Link component={RouterLink} to="#" color="inherit" underline="hover" sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}>
                    Community
                  </Link>
                </Box>
                <Box component="li" sx={{ mb: 1.5 }}>
                  <Link component={RouterLink} to="#" color="inherit" underline="hover" sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}>
                    Help Center
                  </Link>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Company
              </Typography>
              <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0 }}>
                <Box component="li" sx={{ mb: 1.5 }}>
                  <Link component={RouterLink} to="#" color="inherit" underline="hover" sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}>
                    About Us
                  </Link>
                </Box>
                <Box component="li" sx={{ mb: 1.5 }}>
                  <Link component={RouterLink} to="#" color="inherit" underline="hover" sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}>
                    Careers
                  </Link>
                </Box>
                <Box component="li" sx={{ mb: 1.5 }}>
                  <Link component={RouterLink} to="#" color="inherit" underline="hover" sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}>
                    Contact
                  </Link>
                </Box>
                <Box component="li" sx={{ mb: 1.5 }}>
                  <Link component={RouterLink} to="#" color="inherit" underline="hover" sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}>
                    Privacy Policy
                  </Link>
                </Box>
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 6, borderColor: "rgba(255,255,255,0.1)" }} />

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)" }}>
              © {new Date().getFullYear()} filiUp. All rights reserved.
            </Typography>
            <Box sx={{ display: "flex", gap: 2 }}>
              <IconButton 
                color="inherit" 
                sx={{ 
                  color: "rgba(255,255,255,0.7)",
                  '&:hover': { 
                    color: "white",
                    bgcolor: "rgba(255,255,255,0.1)",
                  }
                }}
              >
                <FacebookIcon />
              </IconButton>
              <IconButton 
                color="inherit" 
                sx={{ 
                  color: "rgba(255,255,255,0.7)",
                  '&:hover': { 
                    color: "white",
                    bgcolor: "rgba(255,255,255,0.1)",
                  }
                }}
              >
                <TwitterIcon />
              </IconButton>
              <IconButton 
                color="inherit" 
                sx={{ 
                  color: "rgba(255,255,255,0.7)",
                  '&:hover': { 
                    color: "white",
                    bgcolor: "rgba(255,255,255,0.1)",
                  }
                }}
              >
                <GitHubIcon />
              </IconButton>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}