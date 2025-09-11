import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (email: string, name: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
  getAccessToken: () => string | null;
  makeRequest: (url: string, options?: any) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = 'http://localhost:4000';
  const ACCESS_TOKEN_KEY = 'access_token';

  // Token management
  const getAccessToken = () => {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  const setAccessTokenState = (newAccessToken: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken);
    setIsAuthenticated(true);
  }

  const clearAccessToken = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    setIsAuthenticated(false);
  }

  // Generic request function with automatic token handling
  const makeRequest = async (url: string, options: any = {}) => {
    const token = getAccessToken();
    
    const config = {
      url: `${API_BASE_URL}${url}`,
      withCredentials: true,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth header if token exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      console.log('➡️ Making request:', config.method || 'GET', url);
      const response = await axios(config);
      return response;
    } catch (error: any) {
      // Handle 401 errors with token refresh
      if (error.response?.status === 401 && !url.includes('/auth/refresh')) {
        console.log('🔄 Token expired, attempting refresh...');
        const refreshSuccess = await refreshToken();
        
        if (refreshSuccess) {
          // Retry the request with new token
          const newToken = getAccessToken();
          if (newToken) {
            config.headers.Authorization = `Bearer ${newToken}`;
          }
          console.log('🔄 Retrying request with new token...');
          return await axios(config);
        } else {
          logout();
          throw error;
        }
      }
      throw error;
    }
  };

  // Refresh token function
  const refreshToken = async (): Promise<boolean> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
        withCredentials: true,
        timeout: 5000
      });

      const { newAccessToken } = response.data;

      if (newAccessToken) {
        setAccessTokenState(newAccessToken);
        console.log('✅ Token refreshed successfully');
        return true;
      } else {
        throw new Error('No access token in response');
      }
    } catch (error: any) {
      console.error('❌ Error refreshing token:', error);
      clearAccessToken();
      return false;
    }
  };

  // Register function
  const register = async (email: string, name: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        email,
        name,
        password
      }, {
        withCredentials: true,
        timeout: 10000
      });

      return { success: true, message: response.data.message || 'Registration successful. Please log in.' };

    } catch (error: any) {
      console.error('❌ Registration error:', error);
      const message = error.response?.data?.message || 'Registration failed';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }

  // Login function
  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password
      }, {
        withCredentials: true,
        timeout: 10000
      });

      const { accessToken } = response.data;

      if (!accessToken) {
        throw new Error('No access token received');
      }

      setAccessTokenState(accessToken);
      console.log('✅ Login successful');
      return { success: true };
    } catch (error: any) {
      console.error('❌ Login error:', error);
      const message = error.response?.data?.message || 'Login failed';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }

  // Logout function
  const logout = async () => {
    try {
      // Try to logout from server
      await axios.post(`${API_BASE_URL}/auth/logout`, {}, {
        withCredentials: true,
        timeout: 5000,
        headers: {
          Authorization: `Bearer ${getAccessToken()}`
        }
      });
      console.log('✅ Server logout successful');
    } catch (error) {
      console.log('⚠️ Server logout failed, continuing with local logout');
    } finally {
      clearAccessToken();
      setError(null);
      console.log('✅ Local logout complete');
    }
  };

  // Initialization
  useEffect(() => {
    console.log('🔄 AuthProvider initializing...');
    
    const storedToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    
    if (storedToken) {
      setIsAuthenticated(true);
      console.log('✅ Found stored token, user is authenticated');
    } else {
      setIsAuthenticated(false);
      console.log('ℹ️ No stored token found');
    }
    
    setLoading(false);
    console.log('✅ AuthProvider initialization complete');
  }, []);

  // Auto-refresh timer
  useEffect(() => {
    if (!isAuthenticated) return;

    console.log('⏰ Setting up auto-refresh timer...');
    const refreshInterval = setInterval(() => {
      console.log('⏰ Auto-refresh triggered');
      refreshToken();
    }, 14 * 60 * 1000); // 14 minutes

    return () => {
      clearInterval(refreshInterval);
      console.log('⏰ Auto-refresh timer cleared');
    };
  }, [isAuthenticated]);

  const value: AuthContextType = {
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
    refreshToken,
    getAccessToken,
    makeRequest,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};