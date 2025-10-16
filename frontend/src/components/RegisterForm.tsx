import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import { SimpleThemeToggle } from '@/components/ui/theme-toggle';
import { Link, useNavigate } from 'react-router-dom';
import { LoadingSpinner, CenteredLoading } from '@/components/ui/loading-spinner';

export const RegisterForm: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await register({ fullName, email, password });
      navigate('/');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
    }
  };

  if (isLoading) {
    return <CenteredLoading message="Creating account..." />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Theme toggle in top right corner */}
      <div className="absolute top-4 right-4 z-50">
        <SimpleThemeToggle />
      </div>
      <div className="grid lg:grid-cols-[40%_60%] min-h-screen">
        {/* Left side - Branding */}
        <div className="hidden lg:flex flex-col justify-center items-center p-8 bg-gradient-primary relative overflow-hidden shadow-2xl rounded-tr-3xl rounded-br-3xl">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-b from-teal-400/20 via-teal-500/30 to-cyan-400/20"></div>

          <div className="relative z-10 text-center text-white max-w-md">
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-4">FiliUp</h1>
              <p className="text-xl text-white/90 mb-8">"Welcome! Let's start your learning journey!"</p>

              {/* Child-friendly illustration */}
              <div className="mb-8 flex justify-center">
                <div className="relative">
                  <img
                    src="https://res.cloudinary.com/dxygu2aeh/image/upload/v1759940468/Remove_background_project-1_hidqxj.png"
                    alt="FiliUp Learning Illustration"
                    className="w-100 h-auto rounded-2xl transform hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Registration Form */}
        <div className="flex items-center justify-center p-8 bg-background">
          <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="h-16 w-16 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold text-white">F</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2 text-primary">FiliUp</h1>
          <p className="text-muted-foreground">Create your student account</p>
        </div>

        <Card className="learning-card border border-border bg-card">
          <CardHeader>
            <CardTitle>Register as Student</CardTitle>
            <CardDescription>
              Fill in your details to start learning
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Juan Dela Cruz"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@filipino.edu"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    required
                  />
                  <button
                    type="button"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-sm text-red-500">{error}</div>
              )}

              <Button 
                type="submit" 
                variant="hero"
                className="w-full btn-bounce"
              >
                Create Account
              </Button>
            </form>

            <div className="mt-6 text-sm text-muted-foreground text-center">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:text-primary/80 font-medium hover:underline">Log in</Link>
            </div>
          </CardContent>
        </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
