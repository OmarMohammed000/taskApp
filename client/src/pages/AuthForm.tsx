import React, { useState } from 'react';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  Link,
  CircularProgress
} from '@mui/material';

interface AuthFormProps {
  isRegister?: boolean;
}

export default function AuthForm({ isRegister = false }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const { login, register, loading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Show success message from registration redirect
  React.useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);
    setSuccessMessage(null);
    
    try {
      if (isRegister) {
        
        const result = await register(email, name, password);
        
        if (result.success) {
          // After successful registration, redirect to login
          navigate('/login', { 
            state: { message: result.message || 'Registration successful! Please login.' }
          });
        } else {
          // Registration failed
          setSubmitError(result.message || 'Registration failed');
        }
      } else {
        const result = await login(email, password);
        
        if (result.success) {
          // After successful login, redirect to home
          navigate('/');
        } else {
          // Login failed
          setSubmitError(result.message || 'Login failed');
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      setSubmitError('An unexpected error occurred');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ mt: 8, p: 4 }}>
        <Typography component="h1" variant="h5" align="center" gutterBottom>
          {isRegister ? 'Register' : 'Sign In'}
        </Typography>
        
        {/* Success message */}
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}
        
        {/* Error from context */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {/* Error from form submission */}
        {submitError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {submitError}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          
          {isRegister && (
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Name"
              name="name"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          )}
          
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              isRegister ? 'Register' : 'Sign In'
            )}
          </Button>
          
          <Box sx={{ textAlign: 'center' }}>
            <Link
              component={RouterLink}
              to={isRegister ? '/login' : '/register'}
              variant="body2"
            >
              {isRegister
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up"}
            </Link>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}