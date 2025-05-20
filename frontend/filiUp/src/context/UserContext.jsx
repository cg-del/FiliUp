import axios from 'axios';
import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = () => {
      if (typeof window === 'undefined') {
        setLoading(false);
        return;
      }

      try {
        const accessToken = localStorage.getItem('accessToken');
        const storedUser = localStorage.getItem('user');
        
        if (accessToken && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser && parsedUser.userName) {
            setUser(parsedUser);
            setIsAuthenticated(true);
          } else {
            clearAuthData();
          }
        } else {
          clearAuthData();
        }
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
  };

  // Updated login function: accepts tokens, fetches user info
  const login = async (tokens) => {
    if (typeof window === 'undefined') return;
    
    if (!tokens || !tokens.accessToken) {
      console.error('No access token received');
      return;
    }
    
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);

    try {
      // Fetch user info using the access token
      const res = await axios.get('http://localhost:8080/api/user/info', {
        headers: { Authorization: `Bearer ${tokens.accessToken}` }
      });
      const userData = res.data;
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData));
    
    if (userData.userRole === 'ADMIN') {
      navigate('/admin', { replace: true });
    } else if (userData.userRole === 'TEACHER') {
      navigate('/teacher', { replace: true });
    } else {
      navigate('/home', { replace: true });
    }
    } catch (error) {
      console.error('Failed to fetch user info:', error);
      clearAuthData();
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

            // Call refresh token endpoint
            const response = await axios.post('http://localhost:8080/api/user/refresh', {
              refreshToken
            });

            const { accessToken, refreshToken: newRefreshToken } = response.data;

            // Update tokens in localStorage
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', newRefreshToken);

            // Update the original request with new token
            originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;

            // Retry the original request
            return axios(originalRequest);
          } catch (refreshError) {
            // If refresh token fails, logout the user
            clearAuthData();
            navigate('/sign-in', { replace: true });
            return Promise.reject(refreshError);
          }
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