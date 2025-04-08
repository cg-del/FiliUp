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
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser && parsedUser.userName) {
            setUser(parsedUser);
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem('user');
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (userData) => {
    if (typeof window === 'undefined') return;
    
    if (!userData || !userData.userName) {
      console.error('Invalid user data');
      return;
    }
    
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData));
    
    if (userData.userRole === 'TEACHER') {
      navigate('/teacher', { replace: true });
    } else {
      navigate('/home', { replace: true });
    }
  };

  const logout = () => {
    if (typeof window === 'undefined') return;
    
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
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