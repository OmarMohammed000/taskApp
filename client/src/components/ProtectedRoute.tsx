import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';

export  const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const {user}= useUser();
  if (loading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated && user?.isAdmin?  <>{children}</> : <Navigate to="/login" replace />;
};
  