import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { userService } from '@/lib/services';
import { useAuth } from '@/contexts/AuthContext';
import { ErrorType } from '@/lib/errors/types';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setUser } = useAuth();
  const { safeExecute } = useErrorHandler();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { data: response, error } = await safeExecute(
      () => userService.login({ userName: username, userPassword: password }),
      {
        customMessage: "Hindi tama ang login credentials. Pakicheck ang username at password.",
        onError: (appError) => {
          // Custom handling for specific error types
          if (appError.type === ErrorType.VALIDATION_ERROR) {
            // Handle validation errors specifically
            console.log('Validation error during login:', appError.details);
          }
        }
      }
    );

    if (error) {
      setIsLoading(false);
      return;
    }

    if (response) {
      try {
        const { accessToken, refreshToken, mustChangePassword, userId } = response.data;
        
        // Clear all existing localStorage data before setting new values
        localStorage.clear();
        
        // Store tokens
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('token', accessToken); // Also store as 'token' for compatibility
        
        // Decode JWT to get user info
        const tokenPayload = JSON.parse(atob(accessToken.split('.')[1]));
        const userRole = tokenPayload.role;
        const userName = tokenPayload.sub;

        // Create user object and store in localStorage
        const user = {
          id: tokenPayload.jti || Math.random().toString(36),
          name: userName, // Use username directly
          email: userName, // Keep email field for compatibility, using username value
          type: userRole.toLowerCase() as 'student' | 'teacher' | 'admin',
          ...(userRole === 'TEACHER' && { classes: ['3-matatag', '3-masigla', '3-mabini'] }),
          ...(userRole === 'STUDENT' && { enrollmentStatus: 'none' as const })
        };
        
        localStorage.setItem('filiup_user', JSON.stringify(user));

        // Update AuthContext with the user data
        setUser(user);

        if (mustChangePassword && userRole === 'TEACHER') {
          toast({
            title: "Change Password Required",
            description: "You must change your password before accessing the dashboard.",
          });
          navigate('/change-password', { state: { userId } });
          return;
        }

        toast({
          title: "Maligayang pagdating!",
          description: `Successfully logged in as ${userRole.toLowerCase()}`,
        });

        // Navigate based on role from JWT
        navigate(
          userRole === 'STUDENT' ? '/student-dashboard' : 
          userRole === 'TEACHER' ? '/teacher-dashboard' : 
          '/admin-dashboard'
        );
      } catch (parseError) {
        toast({
          title: "Error sa token parsing",
          description: "May problema sa pag-process ng login data. Subukan ulit.",
          variant: "destructive",
        });
      }
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <Link to="/" className="inline-flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <BookOpen className="h-6 w-6 md:h-7 md:w-7 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              FiliUp
            </h1>
          </Link>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-4 p-4 md:p-6">
            <CardTitle className="text-xl md:text-2xl text-center">
              Welcome to FiliUp
            </CardTitle>
            <CardDescription className="text-center text-sm md:text-base">
              Mag-login para magsimula ng inyong Filipino learning adventure!
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm md:text-base">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="inyong-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="h-10 md:h-11 text-sm md:text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm md:text-base">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Inyong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-10 md:h-11 text-sm md:text-base"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-10 md:h-11 text-base md:text-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Mag-login'}
              </Button>
            </form>
            
            <div className="mt-4 text-center space-y-2">
              <p className="text-sm text-gray-600">
                Wala pang account?{' '}
                <Link 
                  to="/signup"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Mag-sign up dito
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
