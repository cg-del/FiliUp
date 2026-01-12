import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, Users, GraduationCap, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { SimpleThemeToggle } from '@/components/ui/theme-toggle';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { LoadingSpinner, CenteredLoading } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FloatingLabelInput } from '@/components/ui/floating-label-input';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSessionExpired, setShowSessionExpired] = useState(false);
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Check for session expired flag in URL
    if (searchParams.get('sessionExpired') === 'true') {
      setShowSessionExpired(true);
      // Remove the query parameter from URL without refreshing
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      await login(email, password);
      // Navigate to root to trigger role-based routing in Index.tsx
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error);
      const message = error instanceof Error ? error.message : 'Invalid credentials';
      setError(message);
      // Stay on login page with error message
    }
  };

  const demoUsers = [
    { role: 'Admin', email: 'admin@filiup.com',password:'admin123', icon: Users, color: 'bg-gradient-teal-cyan' },
    { role: 'Teacher', email: 'joshcervantes@gmail.com',password:'iamnumber123', icon: GraduationCap, color: 'bg-gradient-warm' },
    { role: 'Student', email: 'mike@gmail.com',password:'iamnumber123', icon: BookOpen, color: 'bg-gradient-success' },
  ];

  if (isLoading) {
    return <CenteredLoading message="Logging in..." />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Theme toggle in top right corner */}
      <div className="absolute top-4 right-4 z-50">
        <SimpleThemeToggle />
      </div>

      {showSessionExpired && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 w-full max-w-md z-50 px-4">
          <Alert variant="destructive" className="animate-fade-in">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Session Expired</AlertTitle>
            <AlertDescription>
              Your session has expired. Please log in again to continue.
            </AlertDescription>
          </Alert>
        </div>
      )}
      <div className="grid lg:grid-cols-[40%_60%] min-h-screen">
        {/* Left side - Branding */}
        <div className="hidden lg:flex flex-col justify-center items-center p-8 bg-gradient-primary relative overflow-hidden shadow-2xl rounded-tr-3xl rounded-br-3xl">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-b from-teal-400/20 via-teal-500/30 to-cyan-400/20"></div>

          <div className="relative z-10 text-center text-white max-w-md">
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-4">Hi! I'm Joy!</h1>
              <p className="text-xl text-white/90 mb-8">I'm excited to help you learn Filipino!</p>

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

        {/* Right side - Login Form */}
        <div className="flex items-center justify-center p-8 bg-background">
          <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-4 mb-2">
            <img 
              src="/filiLogo.png" 
              alt="FiliUp Logo"
              className="h-12 w-auto"
            />
            <h1 className="text-3xl font-bold text-primary">FiliUp</h1>
          </div>
          <p className="text-muted-foreground">Learn Filipino with joy!</p>
        </div>

        <Card className="learning-card border border-border bg-card">
          <CardHeader>
            <CardTitle>Login to your account</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-6">
                <FloatingLabelInput
                  id="email"
                  label="Email"
                  type="email"
                  value={email}
                  onValueChange={setEmail}
                  autoComplete="email"
                  required
                />
                
                <div className="relative">
                  <FloatingLabelInput
                    id="password"
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onValueChange={setPassword}
                    autoComplete="current-password"
                    required
                    hasToggle
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button 
                type="submit" 
                variant="hero"
                className="w-full btn-bounce"
              >
Login
              </Button>
              <div className="mt-2 text-sm text-muted-foreground text-center">
Don't have an account?{' '}
                <Link to="/register" className="text-primary hover:text-primary/80 font-medium hover:underline">Register</Link>
              </div>
            </form>

            {/* Demo Accounts Section */}
            {/* <div className="mt-6">
              <div className="text-sm text-muted-foreground text-center mb-4">
                Demo Accounts 
              </div>
              <div className="grid gap-3">
                {demoUsers.map((user) => {
                  const Icon = user.icon;
                  return (
                    <Button
                      key={user.role}
                      variant="outline"
                      className="justify-start space-x-3"
                      onClick={() => {
                        setEmail(user.email);
                        setPassword(user.password);
                      }}
                    >
                      <div className={`p-2 rounded-md ${user.color}`}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium">{user.role}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </div> */}
          </CardContent>
        </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
