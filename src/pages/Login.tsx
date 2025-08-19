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

// Keyframe animation for the bouncing effect
const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
`;

// Styled component for the moving tyre
const MovingTyre = styled('div')(({ theme }) => ({
  width: '120px',
  height: '120px',
  borderRadius: '50%',
  background: `
    radial-gradient(circle at 30% 30%, #333 20%, transparent 20%),
    radial-gradient(circle at 70% 30%, #333 20%, transparent 20%),
    radial-gradient(circle at 30% 70%, #333 20%, transparent 20%),
    radial-gradient(circle at 70% 70%, #333 20%, transparent 20%),
    radial-gradient(circle at 50% 50%, #666 30%, transparent 30%),
    linear-gradient(45deg, #1a1a1a 25%, transparent 25%),
    linear-gradient(-45deg, #1a1a1a 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #1a1a1a 75%),
    linear-gradient(-45deg, transparent 75%, #1a1a1a 75%)
  `,
  backgroundColor: '#000',
  border: '8px solid #333',
  boxShadow: `
    0 0 0 4px #666,
    0 8px 16px rgba(0,0,0,0.3),
    inset 0 0 0 20px rgba(255,255,255,0.1)
  `,
  animation: `${rotateTyre} 3s linear infinite, ${bounce} 2s ease-in-out infinite`,
  margin: '0 auto 30px auto',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '40px',
    height: '40px',
    backgroundColor: '#333',
    borderRadius: '50%',
    transform: 'translate(-50%, -50%)',
    border: '4px solid #666'
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '20px',
    height: '20px',
    backgroundColor: '#999',
    borderRadius: '50%',
    transform: 'translate(-50%, -50%)'
  }
}));

// Styled component for the yellow form
const YellowFormPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: '#FFF59D', // Light yellow background
  padding: theme.spacing(4),
  borderRadius: theme.spacing(2),
  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
  border: '2px solid #F9A825', // Darker yellow border
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    background: 'linear-gradient(45deg, #FFD54F, #FFC107, #FF8F00)',
    borderRadius: theme.spacing(2),
    zIndex: -1
  }
}));

// Styled component for the company name
const CompanyName = styled(Typography)(({ theme }) => ({
  background: 'linear-gradient(45deg, #1976D2, #42A5F5)',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  color: 'transparent',
  fontWeight: 'bold',
  textAlign: 'center',
  textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
  marginBottom: theme.spacing(2),
  letterSpacing: '2px'
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
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        py: 4
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          {/* Moving Tyre Animation */}
          <MovingTyre />
          
          {/* Company Name */}
          <CompanyName variant="h2" component="h1">
            SUPERDOLL
          </CompanyName>
          
          <Typography variant="h4" component="h2" sx={{ color: 'white', mb: 1, fontWeight: 'bold' }}>
            Welcome Back
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
            Sign in to access your role-specific dashboard and tools
          </Typography>
        </Box>

        {/* Login Form with Yellow Background */}
        <YellowFormPaper elevation={24}>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              variant="outlined"
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="primary" />
                  </InputAdornment>
                ),
                sx: {
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  borderRadius: 2
                }
              }}
              InputLabelProps={{
                sx: { color: '#F57F17', fontWeight: 'bold' }
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
              sx={{ mb: 3 }}
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
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
                sx: {
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  borderRadius: 2
                }
              }}
              InputLabelProps={{
                sx: { color: '#F57F17', fontWeight: 'bold' }
              }}
            />

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                <Typography variant="body2" fontWeight="bold">
                  Login Error: {error}
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
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                borderRadius: 2,
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
        <Box sx={{ mt: 4 }}>
          <Divider sx={{ mb: 3 }}>
            <Chip 
              label="Demo Users" 
              sx={{ 
                backgroundColor: 'rgba(255,255,255,0.9)', 
                fontWeight: 'bold',
                color: '#1976D2'
              }} 
            />
          </Divider>

          <Grid container spacing={2}>
            {demoUsers.map((user) => (
              <Grid item xs={6} key={user.email}>
                <Card
                  sx={{
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    borderRadius: 2,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
                    }
                  }}
                  onClick={() => fillDemoCredentials(user.email, user.password)}
                >
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <Person color="primary" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h6" component="div" fontWeight="bold">
                      {user.role}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                      {user.email}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'center', pt: 0 }}>
                    <Chip
                      label="Click to Login"
                      color={user.color}
                      size="small"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Instructions */}
          <Card sx={{ mt: 3, backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" component="div" fontWeight="bold" color="primary" gutterBottom>
                📋 Demo Instructions
              </Typography>
              <Typography variant="body2" component="div">
                • Click any demo user card to auto-fill credentials<br />
                • All users use password: <strong>password</strong><br />
                • Each role has different access levels and features<br />
                • 🔒 Secure authentication with role-based permissions
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Box>
  );
};

export default Login;
