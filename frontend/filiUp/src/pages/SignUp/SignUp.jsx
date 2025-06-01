import {
  Email as EmailIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  Radio,
  RadioGroup,
  Snackbar,
  TextField,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import axios from 'axios';
import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.svg';
import { User as UserIcon, Mail, Lock } from 'lucide-react';

export default function SignUp() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'STUDENT', // default to student
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Reset error state
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.role) {
      setError('Please fill in all required fields.');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Invalid email address.');
      return;
    }

    // Validate password strength (at least 8 characters)
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    try {
      setLoading(true);
      
      // Prepare user data according to backend expectations
      const userData = {
        userName: `${formData.firstName} ${formData.lastName}`,
        userEmail: formData.email,
        userPassword: formData.password,
        userRole: formData.role,
      };

      // Make API call to register user
      const response = await axios.post('http://localhost:8080/api/user/signup', userData);

      if (response.data) {
        // Registration successful
        navigate('/sign-in');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(
        err.response?.data?.message || 
        'Error signing up. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-600 to-teal-600">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-10 relative flex flex-col items-center">
        {/* Accent bar */}
        <div className="absolute top-0 left-0 w-full h-2 rounded-t-2xl bg-teal-600" />
        {/* Logo and Title */}
        <div className="flex flex-col items-center mt-4 mb-6 w-full">
          <div className="bg-white rounded-full shadow p-1 flex items-center justify-center mb-2" style={{ width: 40, height: 40 }}>
            <img src={logo} alt="FiliUp Logo" className="w-12 h-12 object-contain" />
          </div>
          <span className="text-2xl font-bold text-teal-600 mb-1">FiliUp</span>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Create Account</h2>
          <p className="text-gray-500 text-base">Join us today! Sign up to get started.</p>
        </div>
        {/* Form */}
        <form className="w-full" onSubmit={handleSubmit} noValidate>
          <div className="flex gap-4 mb-4">
            <div className="w-1/2">
              <label htmlFor="firstName" className="block text-gray-700 font-medium mb-1 text-base">First Name <span className="text-red-500">*</span></label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <UserIcon className="h-5 w-5" />
                </span>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 text-gray-800 text-base"
                />
              </div>
            </div>
            <div className="w-1/2">
              <label htmlFor="lastName" className="block text-gray-700 font-medium mb-1 text-base">Last Name <span className="text-red-500">*</span></label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <UserIcon className="h-5 w-5" />
                </span>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 text-gray-800 text-base"
                />
              </div>
            </div>
          </div>
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
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 text-gray-800 text-base"
              />
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700 font-medium mb-1 text-base">Password <span className="text-red-500">*</span></label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Lock className="h-5 w-5" />
              </span>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 text-gray-800 text-base"
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
          <div className="mb-4">
            <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-1 text-base">Confirm Password <span className="text-red-500">*</span></label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Lock className="h-5 w-5" />
              </span>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 text-gray-800 text-base"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.336-3.234.938-4.675M15 12a3 3 0 11-6 0 3 3 0 016 0zm6.062-4.675A9.956 9.956 0 0122 9c0 5.523-4.477 10-10 10a9.956 9.956 0 01-4.675-.938" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm2.121-2.121A9.969 9.969 0 0122 12c0 5.523-4.477 10-10 10S2 17.523 2 12c0-2.21.896-4.21 2.343-5.657" /></svg>
                )}
              </button>
            </div>
          </div>
          <div className="mb-6 w-full">
            <span className="block text-gray-700 font-medium text-base mb-1 text-center">You are a:</span>
            <div className="flex gap-4 justify-center">
              <label className="flex items-center gap-1 text-base cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="STUDENT"
                  checked={formData.role === 'STUDENT'}
                  onChange={handleChange}
                  className="accent-teal-600 w-4 h-4 ring-0 focus:ring-0 outline-none border-0"
                  style={{ boxShadow: 'none' }}
                />
                Student
              </label>
              <label className="flex items-center gap-1 text-base cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="TEACHER"
                  checked={formData.role === 'TEACHER'}
                  onChange={handleChange}
                  className="accent-teal-600 w-4 h-4 ring-0 focus:ring-0 outline-none border-0"
                  style={{ boxShadow: 'none' }}
                />
                Teacher
              </label>
            </div>
          </div>
          {error && (
            <div className="mb-4 w-full">
              <div className="bg-red-100 text-red-700 px-3 py-2 rounded-lg text-sm text-center">{error}</div>
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white font-semibold py-2 rounded-lg shadow transition-colors mb-2 text-base disabled:opacity-70"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center"><svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>Creating Account...</span>
            ) : (
              'Sign Up'
            )}
          </button>
          <div className="text-center mt-2 text-gray-500 text-base">
            Already have an account?{' '}
            <a href="/sign-in" className="text-teal-600 font-semibold hover:underline">Sign In</a>
          </div>
        </form>
      </div>
    </div>
  );
} 