import axios from 'axios';
import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (typeof window === 'undefined') {
        setLoading(false);
        return;
      }

      try {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
          clearAuthData();
          return;
        }

        // Verify token and get user info
        const verifiedUser = await authService.verifyUser();
        if (!verifiedUser) {
          clearAuthData();
          return;
        }

        const userInfo = await authService.getCurrentUser();
        if (!userInfo?.data) {
          clearAuthData();
          return;
        }

        setUser(userInfo.data);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error checking auth:', error);
        clearAuthData();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const clearAuthData = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    setLoading(false);
  };

  // Updated login function: accepts tokens, fetches user info
  const login = async (tokens) => {
    if (typeof window === 'undefined') return;
    
    if (!tokens || !tokens.accessToken) {
      console.error('No access token received');
      return;
    }
    
    try {
      // Store tokens
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);

      // Get user info
      const userInfo = await authService.getCurrentUser();
      if (!userInfo?.data) {
        throw new Error('Failed to get user info');
      }

      const userData = userInfo.data;
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(userData));
    
      // Navigate based on role
      if (userData.userRole === 'ADMIN') {
        navigate('/admin', { replace: true });
      } else if (userData.userRole === 'TEACHER') {
        navigate('/teacher', { replace: true });
      } else {
        navigate('/home', { replace: true });
      }
    } catch (error) {
      console.error('Login error:', error);
      clearAuthData();
      throw error;
    }
  };

  const logout = () => {
    if (typeof window === 'undefined') return;
    clearAuthData();
    navigate('/sign-in', { replace: true });
  };

  // Add axios interceptor for token refresh
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // If the error is 401 and we haven't tried to refresh the token yet
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
              throw new Error('No refresh token available');
            }

            // Try to refresh the token
            const response = await authService.refreshToken(refreshToken);
            if (!response?.data) {
              throw new Error('Invalid refresh response');
            }

            const { accessToken, refreshToken: newRefreshToken } = response.data;
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', newRefreshToken);

            // Update the original request with new token
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return axios(originalRequest);
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            clearAuthData();
            navigate('/sign-in', { replace: true });
            return Promise.reject(refreshError);
          }
        }

        // Only clear auth data and redirect for authentication-related 403 errors
        if (error.response?.status === 403 && error.response?.data?.message?.includes('authentication')) {
          clearAuthData();
          navigate('/sign-in', { replace: true });
        }

        return Promise.reject(error);
      }
    );

    // Cleanup interceptor on unmount
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [navigate]);

  const value = {
    user,
    setUser,
    login,
    logout,
    isAuthenticated,
    loading
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
} 