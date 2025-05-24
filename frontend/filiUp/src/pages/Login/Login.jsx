import {
    Email as EmailIcon,
    Lock as LockIcon,
    Visibility,
    VisibilityOff,
} from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Container,
    IconButton,
    InputAdornment,
    Link,
    Paper,
    Snackbar,
    TextField,
    Typography,
    alpha,
    useTheme,
} from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.svg';
import { useUser } from '../../context/UserContext';
import { Mail, Lock } from 'lucide-react';

export default function Login() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { login, isAuthenticated } = useUser();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user?.userRole === 'ADMIN') {
        navigate('/admin', { replace: true });
      } else if (user?.userRole === 'TEACHER') {
        navigate('/teacher', { replace: true });
      } else {
        navigate('/home', { replace: true });
      }
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    // Validate required fields
    if (!formData.email || !formData.password) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      setLoading(true);
      
      // Prepare login data
      const loginData = {
        userEmail: formData.email,
        userPassword: formData.password,
      };

      // Make API call to login
      const response = await axios.post('http://localhost:8080/api/user/login', loginData);

      if (response.data) {
        const { accessToken, refreshToken } = response.data;
        // Check if response has the required fields
        if (!accessToken || !refreshToken) {
          throw new Error('Invalid response data');
        }
        // Use the login function from context with tokens only
        await login({ accessToken, refreshToken });
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err.response?.status === 401
          ? 'Incorrect email or password.'
          : err.message === 'Invalid response data'
          ? 'Server response error. Please try again.'
          : 'Error signing in. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#95dfc1]">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-10 relative flex flex-col items-center">
        {/* Green accent bar */}
        <div className="absolute top-0 left-0 w-full h-2 rounded-t-2xl bg-[#5fcba4]" />
        {/* Logo and Title */}
        <div className="flex flex-col items-center mt-4 mb-6 w-full">
          <div className="bg-white rounded-full shadow p-1 flex items-center justify-center mb-2" style={{ width: 40, height: 40 }}>
            <img src={logo} alt="FiliUp Logo" className="w-12 h-12 object-contain" />
          </div>
          <span className="text-2xl font-bold text-[#5fcba4] mb-1">FiliUp</span>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Sign In</h2>
          <p className="text-gray-500 text-base">Welcome back! Sign in to continue.</p>
        </div>
        {/* Form */}
        <form className="w-full" onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 font-medium mb-1 text-base">Email Address <span className="text-red-500">*</span></label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Mail className="h-5 w-5" />
              </span>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                autoFocus
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5fcba4] text-gray-800 text-base"
              />
            </div>
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="block text-gray-700 font-medium mb-1 text-base">Password <span className="text-red-500">*</span></label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Lock className="h-5 w-5" />
              </span>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5fcba4] text-gray-800 text-base"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.336-3.234.938-4.675M15 12a3 3 0 11-6 0 3 3 0 016 0zm6.062-4.675A9.956 9.956 0 0122 9c0 5.523-4.477 10-10 10a9.956 9.956 0 01-4.675-.938" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm2.121-2.121A9.969 9.969 0 0122 12c0 5.523-4.477 10-10 10S2 17.523 2 12c0-2.21.896-4.21 2.343-5.657" /></svg>
                )}
              </button>
            </div>
          </div>
          <div className="flex justify-end mb-4">
            <a href="/forgot-password" className="text-sm text-[#5fcba4] hover:underline">Forgot password?</a>
          </div>
          {error && (
            <div className="mb-3 w-full">
              <div className="bg-red-100 text-red-700 px-3 py-2 rounded-lg text-sm text-center">{error}</div>
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-[#5fcba4] hover:bg-[#4bbd97] text-white font-semibold py-2 rounded-lg shadow transition-colors mb-2 text-base disabled:opacity-70"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center"><svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>Signing In...</span>
            ) : (
              'Sign In'
            )}
          </button>
          <div className="text-center mt-2 text-gray-500 text-base">
            Don't have an account?{' '}
            <a href="/sign-up" className="text-[#5fcba4] font-semibold hover:underline">Sign Up</a>
          </div>
        </form>
      </div>
    </div>
  );
} 