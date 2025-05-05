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
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (token && storedUser) {
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
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const login = (userData, token) => {
    if (typeof window === 'undefined') return;
    
    if (!userData || !userData.userName || !token) {
      console.error('Invalid user data or token');
      return;
    }
    
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    
    if (userData.userRole === 'TEACHER') {
      navigate('/teacher', { replace: true });
    } else {
      navigate('/home', { replace: true });
    }
  };

  const logout = () => {
    if (typeof window === 'undefined') return;
    
    clearAuthData();
    navigate('/sign-in', { replace: true });
  };

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