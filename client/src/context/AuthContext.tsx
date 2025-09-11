import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import axios, { AxiosInstance } from 'axios';

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{success: boolean; message?: string}>;
  register: (email: string, name: string, password: string) => Promise<{success: boolean; message?: string}>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
  getAccessToken: () => string | null; 
  api: AxiosInstance | undefined;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export const AuthProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | undefined>(undefined);
  const [apiClient, setApiClient] = useState<AxiosInstance | undefined>(undefined);
  
  // FIXED: Remove trailing slash
  const API_BASE_URL = 'http://localhost:4000';
  const ACCESS_TOKEN_KEY = 'access_token';
  
  // Token management
  const getAccessToken = () => {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }
  
  const setAccessTokenState = (newAccessToken: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken);
    setAccessToken(newAccessToken);
    setIsAuthenticated(true);
  }
  
  const clearAccessToken = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    setAccessToken(undefined);
    setIsAuthenticated(false);
  }

  // FIXED: Axios instance with proper interceptors
  const createApiClient = useCallback((token?: string) => {
    const client = axios.create({
      baseURL: API_BASE_URL,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
      maxRedirects: 0,
      // Prevent automatic requests on initialization
      validateStatus: () => true
    });

    // REQUEST INTERCEPTOR - Simplified and prevents auto requests
    client.interceptors.request.use(
      (config) => {
        // Only proceed if there's an explicit URL path
        if (!config.url || config.url === '/') {
          return Promise.reject(new Error('No endpoint specified'));
        }

        const currentToken = token || getAccessToken();
        if (currentToken && config.headers) {
          config.headers.Authorization = `Bearer ${currentToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // RESPONSE INTERCEPTOR - Only handle 401s
    client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (!error.config) return Promise.reject(error);

        // Only attempt refresh for 401s that aren't refresh token requests
        if (error.response?.status === 401 && 
            !error.config._retry && 
            !error.config.url?.includes('/auth/refresh')) {
          error.config._retry = true;
          const refreshSuccess = await refreshToken();
          if (refreshSuccess) {
            const newToken = getAccessToken();
            if (newToken && error.config.headers) {
              error.config.headers.Authorization = `Bearer ${newToken}`;
            }
            return client(error.config);
          }
          logout();
        }
        return Promise.reject(error);
      }
    );
    
    return client;
  }, []);

  // FIXED: Refresh token function
  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, { 
        withCredentials: true, 
        timeout: 5000 
      });
      
      // FIXED: Your backend returns { newAccessToken }, not { accessToken }
      const { newAccessToken } = response.data;
      
      if (newAccessToken) {
        setAccessTokenState(newAccessToken);
        const newApiClient = createApiClient(newAccessToken);
        setApiClient(newApiClient);
        console.log('✅ Token refreshed');
        return true;
      } else {
        throw new Error('No access token in response');
      }
    } catch (error: any) {
      console.error('❌ Error refreshing token:', error);
      clearAccessToken();
      setApiClient(createApiClient());
      return false;
    }
  }, [createApiClient]);

  // Register function
  const register = async (email: string, name: string, password: string): Promise<{success: boolean; message?: string}> => {
    try {
      setLoading(true);
      setError(null);
      
      // FIXED: Remove extra slash
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
  const login = async (email: string, password: string): Promise<{success: boolean; message?: string}> => {
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
      const newApiClient = createApiClient(accessToken);
      setApiClient(newApiClient);
      
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

  const logout = useCallback(async () => {
    try {
      if (apiClient) {
        try {
          await apiClient.post('/auth/logout');
          console.log('✅ Server logout successful');
        } catch (error) {
          console.log('⚠️ Server logout failed, continuing with local logout');
        }
      }
    } finally {
      clearAccessToken();
      setError(null);
      setApiClient(createApiClient());
      console.log('✅ Local logout complete');
    }
  }, [apiClient, createApiClient]); 

  // Initialization
 useEffect(() => {
  const initializeAuth = () => {
    const storedToken = getAccessToken() || undefined;
    
    if (storedToken) {
      setIsAuthenticated(true);
    }
    
    // Create API client without making any requests
    setApiClient(createApiClient(storedToken));
    setLoading(false);
  };

  initializeAuth();
}, [createApiClient]);

  // Auto-refresh timer
  useEffect(() => {
    if (!isAuthenticated) return;

    console.log('⏰ Setting up auto-refresh timer...');
    const refreshInterval = setInterval(() => {
      console.log('⏰ Auto-refresh triggered');
      refreshToken();
    }, 14 * 60 * 1000);

    return () => {
      clearInterval(refreshInterval);
      console.log('⏰ Auto-refresh timer cleared');
    };
  }, [isAuthenticated, ]);

  const value: AuthContextType = {
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
    refreshToken,
    api: apiClient!,
    getAccessToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};