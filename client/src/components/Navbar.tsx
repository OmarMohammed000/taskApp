import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Avatar,
  Chip,
  useTheme,
  useMediaQuery,
  Tooltip
} from '@mui/material';
import {
  Logout,
  Assignment,
  Dashboard,
  Person,
  Settings,
  EmojiEvents
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Navigation handlers
  const handleNavigation = (path: string) => navigate(path);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Check if current path is active
  const isActive = (path: string) => location.pathname === path;

  // Authenticated navbar content
  const AuthenticatedContent = () => (
    <>
      <Typography
        variant="h6"
        component="div"
        sx={{
          flexGrow: isMobile ? 1 : 0,
          fontWeight: 'bold',
          cursor: 'pointer'
        }}
        onClick={() => navigate('/')}
      >
        TaskApp
      </Typography>

      {!isMobile && (
        <Box sx={{ flexGrow: 1, display: 'flex', ml: 4 }}>
          <Button
            color="inherit"
            startIcon={<Dashboard />}
            onClick={() => handleNavigation('/')}
            sx={{
              mr: 2,
              backgroundColor: isActive('/') ? 'rgba(255,255,255,0.1)' : 'transparent',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
            }}
          >
            Dashboard
          </Button>

          <Button
            color="inherit"
            startIcon={<EmojiEvents />}
            onClick={() => handleNavigation('/leaderboard')}
            sx={{
              backgroundColor: isActive('/leaderboard') ? 'rgba(255,255,255,0.1)' : 'transparent',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
            }}
          >
            Leaderboard
          </Button>
        </Box>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {!isMobile && (
          <Chip
            label={`Level ${user?.level_number ?? 1} • ${user?.xp ?? 0} XP`}
            size="small"
            variant="outlined"
            sx={{
              mr: 1,
              color: 'white',
              borderColor: 'rgba(255,255,255,0.3)',
              backgroundColor: 'rgba(255,255,255,0.1)'
            }}
          />
        )}

        {/* Profile links directly to /profile instead of opening a dropdown */}
        <Tooltip title="Profile">
          <IconButton
            onClick={() => handleNavigation('/profile')}
            size="small"
            sx={{ ml: 1 }}
            aria-label="profile"
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
              <Person />
            </Avatar>
          </IconButton>
        </Tooltip>

      

        {/* Logout as a separate action */}
        <Tooltip title="Logout">
          <IconButton
            onClick={handleLogout}
            size="small"
            sx={{ ml: 0.5, color: 'error.main' }}
            aria-label="logout"
          >
            <Logout />
          </IconButton>
        </Tooltip>
      </Box>
    </>
  );

  // Unauthenticated navbar content (unchanged)
  const UnauthenticatedContent = () => (
    <>
      <Typography
        variant="h6"
        component="div"
        sx={{
          flexGrow: 1,
          fontWeight: 'bold',
          cursor: 'pointer'
        }}
        onClick={() => navigate('/')}
      >
        TaskApp
      </Typography>

      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          color="inherit"
          onClick={() => navigate('/login')}
          sx={{ '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}
        >
          Login
        </Button>
        <Button
          variant="outlined"
          color="inherit"
          onClick={() => navigate('/register')}
          sx={{
            borderColor: 'rgba(255,255,255,0.5)',
            '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255,255,255,0.1)' }
          }}
        >
          Register
        </Button>
      </Box>
    </>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" elevation={2}>
        <Toolbar sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
          {isAuthenticated ? <AuthenticatedContent /> : <UnauthenticatedContent />}
        </Toolbar>
      </AppBar>
    </Box>
  );
}
