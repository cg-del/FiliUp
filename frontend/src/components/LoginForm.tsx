import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, Users, GraduationCap, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { SimpleThemeToggle } from '@/components/ui/theme-toggle';
import { Link, useNavigate } from 'react-router-dom';
import { LoadingSpinner, CenteredLoading } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

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
      <div className="grid lg:grid-cols-[40%_60%] min-h-screen">
        {/* Left side - Branding */}
        <div className="hidden lg:flex flex-col justify-center items-center p-8 bg-gradient-primary relative overflow-hidden shadow-2xl rounded-tr-3xl rounded-br-3xl">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-b from-teal-400/20 via-teal-500/30 to-cyan-400/20"></div>

          <div className="relative z-10 text-center text-white max-w-md">
            <div className="mb-8">
 
              <h1 className="text-4xl font-bold mb-4">FiliUp</h1>
              <p className="text-xl text-white/90 mb-8">"Welcome! I'm excited to help you learn Filipino!"</p>

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
          <div className="flex items-center justify-center mb-4">
            <div className="h-16 w-16 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold text-white">F</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2 text-primary">FiliUp</h1>
          <p className="text-muted-foreground">Learn Filipino with joy!</p>
        </div>

        <Card className="learning-card border border-border bg-card">
          <CardHeader>
            <CardTitle>Login to your account</CardTitle>
            <CardDescription>
              Choose your user type below or login with your email
            </CardDescription>
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
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
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
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground"
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
