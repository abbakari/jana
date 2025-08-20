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
  Person,
  DirectionsCar,
  Security,
  Speed
} from '@mui/icons-material';

// Enhanced keyframe animation for realistic tyre rotation
const rotateTyre = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

// Continuous horizontal movement animation
const continuousHorizontalMove = keyframes`
  0% {
    transform: translateX(-200px);
  }
  100% {
    transform: translateX(calc(100vw + 200px));
  }
`;

// Continuous rotation animation
const continuousRotation = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

// Container for the moving tyre
const TyreContainer = styled('div')(() => ({
  position: 'relative',
  width: '100%',
  height: '150px',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  margin: '20px 0'
}));

// Real tyre component using actual image
const RealTyre = styled('img')(() => ({
  width: '120px',
  height: '120px',
  borderRadius: '50%',
  position: 'absolute',
  top: '50%',
  left: '0',
  transform: 'translateY(-50%)',
  animation: `
    ${continuousHorizontalMove} 8s linear infinite,
    ${continuousRotation} 1s linear infinite
  `,
  filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.3))',
  border: '4px solid #333',
  boxShadow: `
    0 0 20px rgba(255, 193, 7, 0.2),
    inset 0 0 20px rgba(0,0,0,0.3)
  `,
  objectFit: 'cover',

  // Add realistic shadow and effects
  '&::before': {
    content: '""',
    position: 'absolute',
    bottom: '-15px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100px',
    height: '15px',
    background: 'radial-gradient(ellipse, rgba(0,0,0,0.3) 0%, transparent 70%)',
    borderRadius: '50%',
    animation: `${continuousHorizontalMove} 8s linear infinite`
  }
}));

// Track/road effect
const RoadTrack = styled('div')(() => ({
  position: 'absolute',
  bottom: '30px',
  left: '0',
  right: '0',
  height: '8px',
  background: `
    repeating-linear-gradient(
      90deg,
      rgba(0,0,0,0.1) 0px,
      rgba(0,0,0,0.1) 15px,
      transparent 15px,
      transparent 30px
    )
  `,
  borderRadius: '4px',
  opacity: 0.6,
  animation: 'trackMove 2s linear infinite',

  '@keyframes trackMove': {
    '0%': {
      backgroundPosition: '0px 0px'
    },
    '100%': {
      backgroundPosition: '30px 0px'
    }
  }
}));

// Enhanced yellow form with advanced styling and animations
const AdvancedYellowForm = styled(Paper)(({ theme }) => ({
  background: `
    linear-gradient(135deg, 
      rgba(255, 235, 59, 0.95) 0%, 
      rgba(255, 193, 7, 0.95) 30%, 
      rgba(255, 160, 0, 0.95) 70%, 
      rgba(255, 193, 7, 0.95) 100%
    )
  `,
  padding: theme.spacing(4),
  borderRadius: theme.spacing(3),
  boxShadow: `
    0 15px 35px rgba(255, 193, 7, 0.3),
    0 5px 15px rgba(0,0,0,0.1),
    inset 0 1px 0 rgba(255,255,255,0.4)
  `,
  border: '3px solid #F57F17',
  position: 'relative',
  overflow: 'hidden',
  animation: `${yellowGlow} 4s ease-in-out infinite`,
  
  // Animated background pattern
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    background: `
      linear-gradient(45deg, 
        #FFD54F 0%, 
        #FFC107 25%, 
        #FF8F00 50%, 
        #FFC107 75%, 
        #FFD54F 100%
      )
    `,
    borderRadius: theme.spacing(3),
    zIndex: -1,
    backgroundSize: '400% 400%',
    animation: 'gradientFlow 6s ease infinite'
  },
  
  // Inner glow effect
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '10px',
    left: '10px',
    right: '10px',
    bottom: '10px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: theme.spacing(2),
    pointerEvents: 'none'
  },
  
  '@keyframes gradientFlow': {
    '0%': { backgroundPosition: '0% 50%' },
    '50%': { backgroundPosition: '100% 50%' },
    '100%': { backgroundPosition: '0% 50%' }
  }
}));

// Enhanced company branding with 3D effect
const CompanyBranding = styled(Typography)(({ theme }) => ({
  background: `
    linear-gradient(45deg, 
      #1976D2 0%, 
      #42A5F5 30%, 
      #1976D2 60%, 
      #0D47A1 100%
    )
  `,
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  color: 'transparent',
  fontWeight: 900,
  textAlign: 'center',
  fontSize: '3.5rem',
  letterSpacing: '4px',
  textShadow: `
    2px 2px 4px rgba(0,0,0,0.3),
    0 0 20px rgba(25, 118, 210, 0.3)
  `,
  marginBottom: theme.spacing(2),
  position: 'relative',
  backgroundSize: '200% 200%',
  animation: 'textShimmer 4s ease-in-out infinite',
  
  '&::before': {
    content: '"SUPERDOLL"',
    position: 'absolute',
    top: '3px',
    left: '3px',
    zIndex: -1,
    background: 'linear-gradient(45deg, rgba(0,0,0,0.3), rgba(0,0,0,0.1))',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    color: 'transparent'
  },
  
  '@keyframes textShimmer': {
    '0%': { backgroundPosition: '0% 50%' },
    '50%': { backgroundPosition: '100% 50%' },
    '100%': { backgroundPosition: '0% 50%' }
  }
}));

// Enhanced background with tyre track pattern
const StyledBackground = styled(Box)(() => ({
  background: `
    linear-gradient(135deg, 
      #FFD54F 0%, 
      #FFC107 25%, 
      #FF8F00 50%, 
      #FFC107 75%, 
      #FFD54F 100%
    ),
    repeating-linear-gradient(
      90deg,
      transparent,
      transparent 40px,
      rgba(0,0,0,0.05) 40px,
      rgba(0,0,0,0.05) 42px
    )
  `,
  backgroundSize: '400% 400%, 60px 60px',
  animation: 'backgroundShift 8s ease infinite',
  
  '@keyframes backgroundShift': {
    '0%': { backgroundPosition: '0% 50%, 0 0' },
    '50%': { backgroundPosition: '100% 50%, 30px 0' },
    '100%': { backgroundPosition: '0% 50%, 60px 0' }
  }
}));

// Enhanced demo card with yellow accents
const EnhancedDemoCard = styled(Card)(({ theme }) => ({
  background: `
    linear-gradient(135deg, 
      rgba(255, 255, 255, 0.98) 0%, 
      rgba(255, 248, 225, 0.98) 100%
    )
  `,
  borderRadius: theme.spacing(2),
  border: '2px solid #FFC107',
  cursor: 'pointer',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255, 193, 7, 0.2), transparent)',
    transition: 'left 0.5s ease'
  },
  
  '&:hover': {
    transform: 'translateY(-5px) scale(1.02)',
    boxShadow: `
      0 10px 25px rgba(255, 193, 7, 0.3),
      0 5px 15px rgba(0,0,0,0.1)
    `,
    borderColor: '#FF8F00',
    
    '&::before': {
      left: '100%'
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
    { 
      email: 'admin@example.com', 
      password: 'password', 
      role: 'Administrator', 
      color: 'error' as const,
      icon: <Security />,
      description: 'Full system access'
    },
    { 
      email: 'salesman@example.com', 
      password: 'password', 
      role: 'Salesman', 
      color: 'primary' as const,
      icon: <Person />,
      description: 'Sales & budgets'
    },
    { 
      email: 'manager@example.com', 
      password: 'password', 
      role: 'Manager', 
      color: 'success' as const,
      icon: <DirectionsCar />,
      description: 'Team management'
    },
    { 
      email: 'supply@example.com', 
      password: 'password', 
      role: 'Supply Chain', 
      color: 'warning' as const,
      icon: <Speed />,
      description: 'Inventory & logistics'
    }
  ];

  const fillDemoCredentials = (email: string, password: string) => {
    setEmail(email);
    setPassword(password);
  };

  return (
    <StyledBackground
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        py: 3,
        overflow: 'auto'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={6} alignItems="center">
          {/* Left Column - Enhanced Branding and Realistic Tyre */}
          <Grid item xs={12} md={5}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              {/* Enhanced Realistic Moving Tyre */}
              <Box sx={{ position: 'relative', mb: 3 }}>
                <RealisticTyre />
                
                {/* Tyre track/shadow effect */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: '-10px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '200px',
                    height: '8px',
                    background: 'repeating-linear-gradient(90deg, rgba(0,0,0,0.1) 0px, rgba(0,0,0,0.1) 10px, transparent 10px, transparent 20px)',
                    borderRadius: '4px',
                    opacity: 0.6
                  }}
                />
              </Box>
              
              {/* Enhanced Company Name */}
              <CompanyBranding variant="h3" component="h1">
                SUPERDOLL
              </CompanyBranding>
              
              <Typography 
                variant="h4" 
                component="h2" 
                sx={{ 
                  color: '#1565C0', 
                  mb: 2, 
                  fontWeight: 'bold',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
                  background: 'linear-gradient(45deg, #1565C0, #42A5F5)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent'
                }}
              >
                Welcome Back
              </Typography>
              
              <Typography 
                variant="h6" 
                sx={{ 
                  color: '#424242',
                  fontWeight: 'medium',
                  mb: 2,
                  textShadow: '1px 1px 2px rgba(255,255,255,0.5)'
                }}
              >
                🚗 Premium Tyre & Auto Parts Management System
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Chip 
                  label="🔒 Secure Login" 
                  sx={{ 
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    color: '#1976D2',
                    fontWeight: 'bold'
                  }} 
                />
                <Chip 
                  label="⚡ Real-time Dashboard" 
                  sx={{ 
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    color: '#FF8F00',
                    fontWeight: 'bold'
                  }} 
                />
              </Box>
            </Box>
          </Grid>

          {/* Right Column - Enhanced Login Form and Demo Users */}
          <Grid item xs={12} md={7}>
            {/* Enhanced Login Form */}
            <AdvancedYellowForm elevation={24}>
              <Typography 
                variant="h5" 
                component="h3" 
                sx={{ 
                  textAlign: 'center', 
                  mb: 3, 
                  fontWeight: 'bold',
                  color: '#E65100',
                  textShadow: '1px 1px 2px rgba(255,255,255,0.3)'
                }}
              >
                🔐 Secure Access Portal
              </Typography>
              
              <Box component="form" onSubmit={handleSubmit}>
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
                        <Email sx={{ color: '#FF8F00' }} />
                      </InputAdornment>
                    ),
                    sx: {
                      backgroundColor: 'rgba(255,255,255,0.95)',
                      borderRadius: 2,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#FFC107',
                        borderWidth: 2
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#FF8F00'
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#E65100'
                      }
                    }
                  }}
                  InputLabelProps={{
                    sx: { 
                      color: '#E65100', 
                      fontWeight: 'bold',
                      '&.Mui-focused': {
                        color: '#E65100'
                      }
                    }
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
                        <Lock sx={{ color: '#FF8F00' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          sx={{ color: '#FF8F00' }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                    sx: {
                      backgroundColor: 'rgba(255,255,255,0.95)',
                      borderRadius: 2,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#FFC107',
                        borderWidth: 2
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#FF8F00'
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#E65100'
                      }
                    }
                  }}
                  InputLabelProps={{
                    sx: { 
                      color: '#E65100', 
                      fontWeight: 'bold',
                      '&.Mui-focused': {
                        color: '#E65100'
                      }
                    }
                  }}
                />

                {error && (
                  <Alert 
                    severity="error" 
                    sx={{ 
                      mb: 3, 
                      borderRadius: 2,
                      backgroundColor: 'rgba(255,255,255,0.95)',
                      border: '2px solid #f44336'
                    }}
                  >
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
                    py: 2,
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    borderRadius: 2,
                    background: 'linear-gradient(45deg, #1976D2 0%, #42A5F5 50%, #1976D2 100%)',
                    boxShadow: '0 6px 20px rgba(25,118,210,0.4)',
                    border: '2px solid #1565C0',
                    backgroundSize: '200% 200%',
                    animation: 'buttonShimmer 3s ease infinite',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #1565C0 0%, #1976D2 50%, #1565C0 100%)',
                      boxShadow: '0 8px 25px rgba(25,118,210,0.5)',
                      transform: 'translateY(-2px)'
                    },
                    '&:disabled': {
                      background: '#ccc',
                      boxShadow: 'none'
                    },
                    '@keyframes buttonShimmer': {
                      '0%': { backgroundPosition: '0% 50%' },
                      '50%': { backgroundPosition: '100% 50%' },
                      '100%': { backgroundPosition: '0% 50%' }
                    }
                  }}
                >
                  {isLoading || authLoading ? '🔄 Signing in...' : '🚀 Sign In Now'}
                </Button>
              </Box>
            </AdvancedYellowForm>

            {/* Enhanced Demo Users Section */}
            <Box sx={{ mt: 4 }}>
              <Divider sx={{ mb: 3 }}>
                <Chip 
                  label="🎯 Quick Demo Access" 
                  sx={{ 
                    backgroundColor: 'rgba(255,255,255,0.95)', 
                    fontWeight: 'bold',
                    color: '#E65100',
                    fontSize: '1rem',
                    px: 2,
                    py: 1,
                    border: '2px solid #FFC107'
                  }} 
                />
              </Divider>

              <Grid container spacing={2}>
                {demoUsers.map((user) => (
                  <Grid item xs={6} sm={3} key={user.email}>
                    <EnhancedDemoCard
                      onClick={() => fillDemoCredentials(user.email, user.password)}
                    >
                      <CardContent sx={{ textAlign: 'center', py: 2, px: 1 }}>
                        <Box sx={{ color: '#FF8F00', mb: 1 }}>
                          {user.icon}
                        </Box>
                        <Typography 
                          variant="subtitle2" 
                          component="div" 
                          fontWeight="bold" 
                          sx={{ fontSize: '0.9rem', color: '#E65100' }}
                        >
                          {user.role}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          color="text.secondary" 
                          sx={{ fontSize: '0.75rem' }}
                        >
                          {user.description}
                        </Typography>
                      </CardContent>
                      <CardActions sx={{ justifyContent: 'center', pt: 0, pb: 2 }}>
                        <Chip
                          label="👆 Click to Login"
                          color={user.color}
                          size="small"
                          sx={{ 
                            fontWeight: 'bold', 
                            fontSize: '0.75rem',
                            '&:hover': {
                              transform: 'scale(1.05)'
                            }
                          }}
                        />
                      </CardActions>
                    </EnhancedDemoCard>
                  </Grid>
                ))}
              </Grid>

              {/* Enhanced Instructions */}
              <Card sx={{ 
                mt: 3, 
                background: 'rgba(255,255,255,0.95)', 
                borderRadius: 2,
                border: '2px solid #FFC107'
              }}>
                <CardContent sx={{ py: 3 }}>
                  <Typography 
                    variant="h6" 
                    component="div" 
                    fontWeight="bold" 
                    color="#E65100" 
                    gutterBottom
                    sx={{ textAlign: 'center' }}
                  >
                    🎯 Demo Access Instructions
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" sx={{ lineHeight: 1.6, color: '#424242' }}>
                        <strong>🔹 Quick Access:</strong> Click any user card above<br />
                        <strong>🔹 Password:</strong> All accounts use "password"<br />
                        <strong>🔹 Roles:</strong> Different access levels per user
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" sx={{ lineHeight: 1.6, color: '#424242' }}>
                        <strong>🔹 Security:</strong> Role-based permissions<br />
                        <strong>🔹 Features:</strong> Full system functionality<br />
                        <strong>🔹 Support:</strong> Real-time dashboard updates
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </StyledBackground>
  );
};

export default Login;
