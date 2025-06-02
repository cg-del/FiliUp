import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, User, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { userService } from '@/lib/services';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState<'STUDENT' | 'TEACHER'>('STUDENT');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  useState(() => {
    const type = searchParams.get('type');
    if (type === 'teacher') {
      setUserType('TEACHER');
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Hindi magkatugma ang password",
        description: "Pakitiyak na pareho ang password at confirm password.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await userService.register(username, email, password, userType);
      
      toast({
        title: "Maligayang pagdating!",
        description: "Successfully created your account. Please log in.",
      });

      // Redirect to login page
      navigate(`/login?type=${userType.toLowerCase()}`);
    } catch (error) {
      toast({
        title: "Hindi matagumpay ang pag-sign up",
        description: "May error sa pag-create ng account. Pakisubukan ulit.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
            <div className="flex justify-center space-x-2">
              <Button
                variant={userType === 'STUDENT' ? 'default' : 'outline'}
                onClick={() => setUserType('STUDENT')}
                className={`flex items-center space-x-2 text-sm md:text-base ${
                  userType === 'STUDENT' 
                    ? 'bg-gradient-to-r from-green-500 to-blue-500' 
                    : 'border-green-500 text-green-600 hover:bg-green-50'
                }`}
                size="sm"
              >
                <User className="h-4 w-4" />
                <span>Estudyante</span>
              </Button>
              <Button
                variant={userType === 'TEACHER' ? 'default' : 'outline'}
                onClick={() => setUserType('TEACHER')}
                className={`flex items-center space-x-2 text-sm md:text-base ${
                  userType === 'TEACHER' 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                    : 'border-purple-500 text-purple-600 hover:bg-purple-50'
                }`}
                size="sm"
              >
                <Users className="h-4 w-4" />
                <span>Guro</span>
              </Button>
            </div>
            <CardTitle className="text-xl md:text-2xl text-center">
              {userType === 'STUDENT' ? 'Student Sign Up' : 'Teacher Sign Up'}
            </CardTitle>
            <CardDescription className="text-center text-sm md:text-base">
              {userType === 'STUDENT' 
                ? 'Gumawa ng account para magsimula ng inyong Filipino learning adventure!'
                : 'Gumawa ng account para magturo at mag-guide ng mga estudyante.'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm md:text-base">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Inyong username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="h-10 md:h-11 text-sm md:text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm md:text-base">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="inyong-email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm md:text-base">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Ulitin ang password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="h-10 md:h-11 text-sm md:text-base"
                />
              </div>
              <Button
                type="submit"
                className={`w-full h-10 md:h-11 text-base md:text-lg ${
                  userType === 'STUDENT'
                    ? 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                }`}
                disabled={isLoading}
              >
                {isLoading ? 'Creating account...' : 'Mag-sign up'}
              </Button>
            </form>
            
            <div className="mt-4 text-center space-y-2">
              <p className="text-sm text-gray-600">
                May account na?{' '}
                <Link 
                  to={`/login?type=${userType.toLowerCase()}`}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Mag-login dito
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Signup; 