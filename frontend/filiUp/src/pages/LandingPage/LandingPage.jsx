import {
  ArrowForward as ArrowForwardIcon,
  EmojiEvents as AwardIcon,
  MenuBook as BookIcon,
  Facebook as FacebookIcon,
  GitHub as GitHubIcon,
  LocalLibrary as LibraryIcon,
  People as PeopleIcon,
  Psychology as PsychologyIcon,
  School as SchoolIcon,
  AutoStories as StoriesIcon,
  Translate as TranslateIcon,
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
import filiupLogo from '../../assets/banner.svg';

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
              Mga Tampok
            </Link>
            <Link component={RouterLink} to="#courses" color="inherit" underline="hover" sx={{ fontWeight: 500 }}>
              Mga Kwento
            </Link>
            <Link component={RouterLink} to="#about" color="inherit" underline="hover" sx={{ fontWeight: 500 }}>
              Tungkol Sa Amin
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
              Mag-sign In
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
                Matuto sa Pamamagitan ng{" "}
                <Box component="span" color="primary.main">
                  Mga Kwentong Pilipino
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
                Tuklasin ang yaman ng ating kultura sa pamamagitan ng mga kwentong-bayan, alamat, at pabula. 
                Matuto ng mga aral habang nag-e-enjoy sa mga interactive na kuwento at pagsusulit.
              </Typography>
              <Box sx={{ mt: 4, display: "flex", gap: 2 }}>
                <Button 
                  component={RouterLink} 
                  to="/sign-in" 
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
                  Simulan
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
                  Tingnan ang Mga Kwento
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
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Typography 
              variant="h3" 
              component="h2" 
              fontWeight="bold" 
              gutterBottom
              sx={{ 
                mb: 1,
                background: `linear-gradient(90deg, ${theme.palette.text.primary}, ${theme.palette.primary.main})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
              }}
            >
              Bakit Piliin ang filiUp?
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary" 
              sx={{ 
                maxWidth: 700, 
                mx: "auto",
                lineHeight: 1.4,
                mb: 2,
              }}
            >
              Ang aming platform ay nag-aalok ng lahat ng kailangan mo para matuto sa pamamagitan ng mga kwentong Pilipino
            </Typography>
          </Box>

          <Grid 
            container 
            spacing={3} 
            justifyContent="center"
            alignItems="stretch"
            sx={{ 
              width: '100%',
              maxWidth: '900px',
              mx: 'auto',
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
              },
              gap: 3,
              '& > *': {
                minHeight: '200px',
                height: '100%'
              }
            }}
          >
            <Box 
              sx={{ 
                textAlign: "left", 
                p: 3, 
                height: '100%',
                width: '100%',
                bgcolor: 'background.paper',
                borderRadius: 3,
                transition: 'all 0.3s ease',
                boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.05)}`,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 8px 30px ${alpha(theme.palette.primary.main, 0.15)}`,
                  borderColor: alpha(theme.palette.primary.main, 0.3),
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, flexShrink: 0 }}>
                <Avatar
                  sx={{
                    width: 50,
                    height: 50,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    mr: 2,
                    boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.2)}`,
                    flexShrink: 0
                  }}
                >
                  <StoriesIcon fontSize="small" />
                </Avatar>
                <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1.2rem' }}>
                  Mga Kuwentong Pilipino
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5, flex: 1 }}>
                Maglakbay sa mundo ng mga tradisyunal na kuwento, alamat, at mitolohiyang Pilipino. Tuklasin ang mayamang kultura at kasaysayan ng ating bansa.
              </Typography>
            </Box>

            <Box 
              sx={{ 
                textAlign: "left", 
                p: 3, 
                height: '100%',
                width: '100%',
                bgcolor: 'background.paper',
                borderRadius: 3,
                transition: 'all 0.3s ease',
                boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.05)}`,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 8px 30px ${alpha(theme.palette.primary.main, 0.15)}`,
                  borderColor: alpha(theme.palette.primary.main, 0.3),
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, flexShrink: 0 }}>
                <Avatar
                  sx={{
                    width: 50,
                    height: 50,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    mr: 2,
                    boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.2)}`,
                    flexShrink: 0
                  }}
                >
                  <PsychologyIcon fontSize="small" />
                </Avatar>
                <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1.2rem' }}>
                  Interactive na Pag-aaral
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5, flex: 1 }}>
                Mag-enjoy sa mga interactive na pagsusulit, mga gawain, at mga hamon na magpapalalim ng iyong pag-unawa sa bawat kuwento.
              </Typography>
            </Box>

            <Box 
              sx={{ 
                textAlign: "left", 
                p: 3, 
                height: '100%',
                width: '100%',
                bgcolor: 'background.paper',
                borderRadius: 3,
                transition: 'all 0.3s ease',
                boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.05)}`,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 8px 30px ${alpha(theme.palette.primary.main, 0.15)}`,
                  borderColor: alpha(theme.palette.primary.main, 0.3),
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, flexShrink: 0 }}>
                <Avatar
                  sx={{
                    width: 50,
                    height: 50,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    mr: 2,
                    boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.2)}`,
                    flexShrink: 0
                  }}
                >
                  <TranslateIcon fontSize="small" />
                </Avatar>
                <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1.2rem' }}>
                  Dalawang Wika
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5, flex: 1 }}>
                Magbasa ng mga kuwento sa Filipino at Ingles. Palawakin ang iyong bokabularyo at pagkaunawa sa dalawang wika.
              </Typography>
            </Box>

            <Box 
              sx={{ 
                textAlign: "left", 
                p: 3, 
                height: '100%',
                width: '100%',
                bgcolor: 'background.paper',
                borderRadius: 3,
                transition: 'all 0.3s ease',
                boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.05)}`,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 8px 30px ${alpha(theme.palette.primary.main, 0.15)}`,
                  borderColor: alpha(theme.palette.primary.main, 0.3),
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, flexShrink: 0 }}>
                <Avatar
                  sx={{
                    width: 50,
                    height: 50,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    mr: 2,
                    boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.2)}`,
                    flexShrink: 0
                  }}
                >
                  <LibraryIcon fontSize="small" />
                </Avatar>
                <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1.2rem' }}>
                  Araw-araw na Pagbabasa
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5, flex: 1 }}>
                Subaybayan ang iyong pag-unlad at makakuha ng mga badge para sa bawat kuwentong natapos. Gawing kasanayan ang pagbabasa.
              </Typography>
            </Box>
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
            Mga Sikat na Kwento
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
            Tingnan Lahat <ArrowForwardIcon sx={{ ml: 0.5, fontSize: 18 }} />
          </Link>
        </Box>

        <Grid container spacing={4}>
          {/* Si Malakas at si Maganda */}
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
                  Si Malakas at si Maganda
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Alamat ng Pinagmulan ng mga Tao
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
                    Basahin
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Ang Alamat ng Pinya */}
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
                  Ang Alamat ng Pinya
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Kwento ng isang masipag na anak
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
                    Basahin
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Ang Matsing at ang Pagong */}
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
                  MP
                </Avatar>
              </CardMedia>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Ang Matsing at ang Pagong
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Pabula tungkol sa talino at kasipagan
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
                    Basahin
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
            Handa ka na bang Matuto?
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
            Sumali sa libu-libong mag-aaral na natututo sa pamamagitan ng mga kwentong Pilipino sa filiUp
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
              Mag-sign Up Ngayon
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
              Matuto Pa
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
                Ang kumpletong platform para sa pag-aaral ng mga kwentong Pilipino at pagsusulit.
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Mga Kwento
              </Typography>
              <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0 }}>
                <Box component="li" sx={{ mb: 1.5 }}>
                  <Link component={RouterLink} to="#" color="inherit" underline="hover" sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}>
                    Mga Alamat
                  </Link>
                </Box>
                <Box component="li" sx={{ mb: 1.5 }}>
                  <Link component={RouterLink} to="#" color="inherit" underline="hover" sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}>
                    Mga Pabula
                  </Link>
                </Box>
                <Box component="li" sx={{ mb: 1.5 }}>
                  <Link component={RouterLink} to="#" color="inherit" underline="hover" sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}>
                    Mga Kwentong-Bayan
                  </Link>
                </Box>
                <Box component="li" sx={{ mb: 1.5 }}>
                  <Link component={RouterLink} to="#" color="inherit" underline="hover" sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}>
                    Mga Epiko
                  </Link>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Mga Mapagkukunan
              </Typography>
              <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0 }}>
                <Box component="li" sx={{ mb: 1.5 }}>
                  <Link component={RouterLink} to="#" color="inherit" underline="hover" sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}>
                    Blog
                  </Link>
                </Box>
                <Box component="li" sx={{ mb: 1.5 }}>
                  <Link component={RouterLink} to="#" color="inherit" underline="hover" sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}>
                    Mga Pagsusulit
                  </Link>
                </Box>
                <Box component="li" sx={{ mb: 1.5 }}>
                  <Link component={RouterLink} to="#" color="inherit" underline="hover" sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}>
                    Komunidad
                  </Link>
                </Box>
                <Box component="li" sx={{ mb: 1.5 }}>
                  <Link component={RouterLink} to="#" color="inherit" underline="hover" sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}>
                    Tulong
                  </Link>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Kompanya
              </Typography>
              <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0 }}>
                <Box component="li" sx={{ mb: 1.5 }}>
                  <Link component={RouterLink} to="#" color="inherit" underline="hover" sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}>
                    Tungkol Sa Amin
                  </Link>
                </Box>
                <Box component="li" sx={{ mb: 1.5 }}>
                  <Link component={RouterLink} to="#" color="inherit" underline="hover" sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}>
                    Mga Trabaho
                  </Link>
                </Box>
                <Box component="li" sx={{ mb: 1.5 }}>
                  <Link component={RouterLink} to="#" color="inherit" underline="hover" sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}>
                    Contact
                  </Link>
                </Box>
                <Box component="li" sx={{ mb: 1.5 }}>
                  <Link component={RouterLink} to="#" color="inherit" underline="hover" sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}>
                    Patakaran sa Privacy
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
              © {new Date().getFullYear()} filiUp. Lahat ng karapatan ay nakalaan.
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