import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
  Grid,
  Chip,
  Divider,
  Card,
  CardContent,
  CardActions,
  styled,
  keyframes
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person
} from '@mui/icons-material';

// Keyframe animation for the rotating tyre
const rotateTyre = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

// Keyframe animation for horizontal movement
const moveHorizontal = keyframes`
  0% {
    transform: translateX(-100px);
  }
  50% {
    transform: translateX(100px);
  }
  100% {
    transform: translateX(-100px);
  }
`;

// Styled component for the moving tyre with enhanced design
const MovingTyre = styled('div')(({ theme }) => ({
  width: '80px',
  height: '80px',
  borderRadius: '50%',
  background: `
    radial-gradient(circle at 25% 25%, #444 15%, transparent 15%),
    radial-gradient(circle at 75% 25%, #444 15%, transparent 15%),
    radial-gradient(circle at 25% 75%, #444 15%, transparent 15%),
    radial-gradient(circle at 75% 75%, #444 15%, transparent 15%),
    radial-gradient(circle at 50% 50%, #666 25%, transparent 25%),
    conic-gradient(from 0deg, #111 0deg, #333 30deg, #111 60deg, #333 90deg, #111 120deg, #333 150deg, #111 180deg, #333 210deg, #111 240deg, #333 270deg, #111 300deg, #333 330deg, #111 360deg)
  `,
  backgroundColor: '#000',
  border: '6px solid #333',
  boxShadow: `
    0 0 0 3px #666,
    0 4px 12px rgba(0,0,0,0.4),
    inset 0 0 0 15px rgba(255,255,255,0.05),
    inset 0 0 20px rgba(0,0,0,0.3)
  `,
  animation: `${rotateTyre} 1s linear infinite, ${moveHorizontal} 4s ease-in-out infinite`,
  margin: '0 auto 20px auto',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '25px',
    height: '25px',
    backgroundColor: '#333',
    borderRadius: '50%',
    transform: 'translate(-50%, -50%)',
    border: '3px solid #666',
    boxShadow: 'inset 0 0 5px rgba(0,0,0,0.5)'
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '12px',
    height: '12px',
    backgroundColor: '#888',
    borderRadius: '50%',
    transform: 'translate(-50%, -50%)',
    boxShadow: 'inset 0 0 3px rgba(0,0,0,0.7)'
  }
}));

// Styled component for the yellow form with enhanced styling
const YellowFormPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: '#FFF176', // Bright yellow background
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
  border: '3px solid #F57F17', // Dark yellow border
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
    background: 'linear-gradient(45deg, #FFD54F, #FFC107, #FF8F00, #FFD54F)',
    borderRadius: theme.spacing(2),
    zIndex: -1,
    backgroundSize: '400% 400%',
    animation: 'gradientShift 3s ease infinite'
  },
  '@keyframes gradientShift': {
    '0%': {
      backgroundPosition: '0% 50%'
    },
    '50%': {
      backgroundPosition: '100% 50%'
    },
    '100%': {
      backgroundPosition: '0% 50%'
    }
  }
}));

// Styled component for the company name
const CompanyName = styled(Typography)(({ theme }) => ({
  background: 'linear-gradient(45deg, #1976D2, #42A5F5, #1976D2)',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  color: 'transparent',
  fontWeight: 'bold',
  textAlign: 'center',
  textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
  marginBottom: theme.spacing(1),
  letterSpacing: '3px',
  backgroundSize: '200% 200%',
  animation: 'textGradient 3s ease infinite',
  '@keyframes textGradient': {
    '0%': {
      backgroundPosition: '0% 50%'
    },
    '50%': {
      backgroundPosition: '100% 50%'
    },
    '100%': {
      backgroundPosition: '0% 50%'
    }
  }
}));

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, error, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      // Error is handled by the auth context
    } finally {
      setIsLoading(false);
    }
  };

  const demoUsers = [
    { email: 'admin@example.com', password: 'password', role: 'Administrator', color: 'error' },
    { email: 'salesman@example.com', password: 'password', role: 'Salesman', color: 'primary' },
    { email: 'manager@example.com', password: 'password', role: 'Manager', color: 'success' },
    { email: 'supply@example.com', password: 'password', role: 'Supply Chain', color: 'warning' }
  ] as const;

  const fillDemoCredentials = (email: string, password: string) => {
    setEmail(email);
    setPassword(password);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #FFD54F 0%, #FFC107 50%, #FF8F00 100%)', // Full yellow background
        display: 'flex',
        alignItems: 'center',
        py: 2,
        overflow: 'auto'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center">
          {/* Left Column - Branding and Tyre */}
          <Grid item xs={12} md={5}>
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              {/* Moving Tyre Animation */}
              <MovingTyre />
              
              {/* Company Name */}
              <CompanyName variant="h3" component="h1">
                SUPERDOLL
              </CompanyName>
              
              <Typography 
                variant="h5" 
                component="h2" 
                sx={{ 
                  color: '#1565C0', 
                  mb: 1, 
                  fontWeight: 'bold',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
                }}
              >
                Welcome Back
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: '#424242',
                  fontWeight: 'medium'
                }}
              >
                Sign in to access your dashboard
              </Typography>
            </Box>
          </Grid>

          {/* Right Column - Login Form and Demo Users */}
          <Grid item xs={12} md={7}>
            {/* Login Form with Yellow Background */}
            <YellowFormPaper elevation={24}>
              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  size="small"
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color="primary" />
                      </InputAdornment>
                    ),
                    sx: {
                      backgroundColor: 'rgba(255,255,255,0.95)',
                      borderRadius: 1
                    }
                  }}
                  InputLabelProps={{
                    sx: { color: '#E65100', fontWeight: 'bold' }
                  }}
                />

                <TextField
                  fullWidth
                  variant="outlined"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  size="small"
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="primary" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          color="primary"
                          size="small"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                    sx: {
                      backgroundColor: 'rgba(255,255,255,0.95)',
                      borderRadius: 1
                    }
                  }}
                  InputLabelProps={{
                    sx: { color: '#E65100', fontWeight: 'bold' }
                  }}
                />

                {error && (
                  <Alert severity="error" sx={{ mb: 2, borderRadius: 1 }}>
                    <Typography variant="body2" fontWeight="bold">
                      {error}
                    </Typography>
                  </Alert>
                )}

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={isLoading || authLoading}
                  sx={{
                    py: 1.2,
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    borderRadius: 1,
                    background: 'linear-gradient(45deg, #1976D2, #42A5F5)',
                    boxShadow: '0 4px 16px rgba(25,118,210,0.3)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #1565C0, #1976D2)',
                      boxShadow: '0 6px 20px rgba(25,118,210,0.4)'
                    }
                  }}
                >
                  {isLoading || authLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </Box>
            </YellowFormPaper>

            {/* Demo Users Section */}
            <Box sx={{ mt: 3 }}>
              <Divider sx={{ mb: 2 }}>
                <Chip 
                  label="Demo Users" 
                  sx={{ 
                    backgroundColor: 'rgba(255,255,255,0.95)', 
                    fontWeight: 'bold',
                    color: '#1976D2',
                    fontSize: '0.85rem'
                  }} 
                />
              </Divider>

              <Grid container spacing={1.5}>
                {demoUsers.map((user) => (
                  <Grid item xs={6} key={user.email}>
                    <Card
                      sx={{
                        backgroundColor: 'rgba(255,255,255,0.95)',
                        borderRadius: 1.5,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 16px rgba(0,0,0,0.15)'
                        }
                      }}
                      onClick={() => fillDemoCredentials(user.email, user.password)}
                    >
                      <CardContent sx={{ textAlign: 'center', py: 1.5, px: 1 }}>
                        <Person color="primary" sx={{ fontSize: 28, mb: 0.5 }} />
                        <Typography variant="subtitle2" component="div" fontWeight="bold" sx={{ fontSize: '0.85rem' }}>
                          {user.role}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                          {user.email}
                        </Typography>
                      </CardContent>
                      <CardActions sx={{ justifyContent: 'center', pt: 0, pb: 1 }}>
                        <Chip
                          label="Click to Login"
                          color={user.color}
                          size="small"
                          sx={{ fontWeight: 'bold', fontSize: '0.7rem' }}
                        />
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {/* Instructions */}
              <Card sx={{ mt: 2, backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 1.5 }}>
                <CardContent sx={{ py: 2 }}>
                  <Typography variant="subtitle2" component="div" fontWeight="bold" color="primary" gutterBottom>
                    📋 Demo Instructions
                  </Typography>
                  <Typography variant="caption" component="div" sx={{ lineHeight: 1.4 }}>
                    • Click any demo user card to auto-fill credentials<br />
                    • All users use password: <strong>password</strong><br />
                    • Each role has different access levels and features<br />
                    • 🔒 Secure authentication with role-based permissions
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Login;
