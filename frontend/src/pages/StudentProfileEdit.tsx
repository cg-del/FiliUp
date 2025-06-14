import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Loader2, User, Mail, ArrowLeft, Target, Award, BookOpen, Save, UserPlus } from 'lucide-react';
import { studentProfileService, StudentProfile, UpdateStudentProfileRequest, CreateStudentProfileRequest } from '@/lib/services/studentProfileService';
import { useErrorHandler } from '@/hooks/useErrorHandler';

const StudentProfileEdit = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { safeExecute } = useErrorHandler();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileExists, setProfileExists] = useState<boolean | null>(null);
  const [formData, setFormData] = useState({
    parentsEmail: '',
    section: ''
  });

  // Load profile data on component mount
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    console.log("Loading profile...");
    
    // Check if token exists
    const token = localStorage.getItem('accessToken') || 
                  localStorage.getItem('authToken') || 
                  localStorage.getItem('token');
    
    console.log("Token exists:", !!token);
    
    if (token) {
      try {
        // Decode token to check role
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        console.log("Token payload:", tokenPayload);
      } catch (e) {
        console.error("Error decoding token:", e);
      }
    }
    
    setLoading(true);
    const { data: profileData, error } = await safeExecute(
      () => studentProfileService.getMyProfile(),
      {
        customMessage: "Hindi nakuha ang profile. Subukang i-refresh ang page.",
        preventAutoRedirect: true,
        onError: (appError) => {
          console.error('Error loading profile:', appError);
          // Check if the error is a 404 (profile not found)
          if (appError.statusCode === 404) {
            setProfileExists(false);
          }
        }
      }
    );

    if (profileData) {
      setProfile(profileData);
      setProfileExists(true);
      setFormData({
        parentsEmail: profileData.parentsEmail || '',
        section: profileData.section || ''
      });
    } else if (error && error.statusCode !== 404) {
      // If there was an error other than 404, we're not sure if profile exists
      setProfileExists(null);
    } else {
      // No profile data and no error (or 404 error) means profile doesn't exist
      setProfileExists(false);
    }
    setLoading(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCreateProfile = async () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "User information is missing. Please log in again.",
        variant: "destructive"
      });
      return;
    }

    // Basic validation
    if (formData.parentsEmail && !isValidEmail(formData.parentsEmail)) {
      toast({
        title: "Invalid Email",
        description: "Maglagay ng valid na email address para sa parents email.",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    const createData: CreateStudentProfileRequest = {
      userId: user.id,
      parentsEmail: formData.parentsEmail || undefined,
      section: formData.section || undefined
    };

    const { data: createdProfile, error } = await safeExecute(
      () => studentProfileService.createProfile(createData),
      {
        customMessage: "Hindi na-create ang profile. Subukang ulit.",
        preventAutoRedirect: true,
        onError: (appError) => {
          console.error('Error creating profile:', appError);
        }
      }
    );

    if (createdProfile) {
      setProfile(createdProfile);
      setProfileExists(true);
      toast({
        title: "Profile Created",
        description: "Matagumpay na na-create ang inyong profile!",
      });
      // Navigate back to dashboard after successful creation
      navigate('/dashboard');
    }
    setSaving(false);
  };

  const handleSave = async () => {
    if (!profile) return;

    // Basic validation
    if (formData.parentsEmail && !isValidEmail(formData.parentsEmail)) {
      toast({
        title: "Invalid Email",
        description: "Maglagay ng valid na email address para sa parents email.",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    const updateData: UpdateStudentProfileRequest = {
      parentsEmail: formData.parentsEmail || undefined,
      section: formData.section || undefined
    };

    const { data: updatedProfile, error } = await safeExecute(
      () => studentProfileService.updateProfile(profile.profileId, updateData),
      {
        customMessage: "Hindi na-update ang profile. Subukang ulit.",
        preventAutoRedirect: true,
        onError: (appError) => {
          console.error('Error updating profile:', appError);
        }
      }
    );

    if (updatedProfile) {
      setProfile(updatedProfile);
      toast({
        title: "Profile Updated",
        description: "Matagumpay na na-update ang inyong profile!",
      });
      // Navigate back to dashboard after successful update
      navigate('/dashboard');
    }
    setSaving(false);
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number): "default" | "secondary" | "destructive" | "outline" => {
    if (score >= 90) return 'default';
    if (score >= 80) return 'secondary';
    if (score >= 70) return 'outline';
    return 'destructive';
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-teal-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/dashboard')}
                className="text-teal-600 hover:bg-teal-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-lg flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  {profileExists === false ? "Create Profile" : "Edit Profile"}
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-gray-600" />
              <span className="text-sm font-medium">{user.name}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-teal-600 mr-3" />
            <p className="text-gray-600">Loading profile...</p>
          </div>
        ) : profileExists === false ? (
          // Create profile form
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Create Student Profile
              </h1>
              <p className="text-gray-600">
                Please complete your student profile to continue
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <UserPlus className="h-5 w-5" />
                  <span>Profile Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="parentsEmail">Parent's Email (Optional)</Label>
                    <Input
                      id="parentsEmail"
                      type="email"
                      placeholder="parent@example.com"
                      value={formData.parentsEmail}
                      onChange={(e) => handleInputChange('parentsEmail', e.target.value)}
                      className="h-10"
                    />
                    <p className="text-xs text-gray-500">
                      We'll use this to send updates about your child's progress
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="section">Section (Optional)</Label>
                    <Input
                      id="section"
                      type="text"
                      placeholder="e.g. Matatag, Masigla"
                      value={formData.section}
                      onChange={(e) => handleInputChange('section', e.target.value)}
                      className="h-10"
                    />
                  </div>

                  <Button
                    onClick={handleCreateProfile}
                    disabled={saving}
                    className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Create Profile
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : profile ? (
          // Edit existing profile
          <div className="space-y-8">
            {/* Page Header */}
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Student Profile
              </h1>
              <p className="text-gray-600">
                View and update your profile information
              </p>
            </div>

            {/* Profile Overview Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Target className="h-5 w-5" />
                    <span>Academic Performance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Average Score:</span>
                      <Badge 
                        variant={getScoreBadgeVariant(profile.averageScore)} 
                        className={`${getScoreColor(profile.averageScore)} font-semibold text-sm px-3 py-1`}
                      >
                        {profile.averageScore.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Quiz Takes:</span>
                      <Badge variant="outline" className="text-teal-600 font-semibold">
                        {profile.numberOfQuizTakes}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Award className="h-5 w-5" />
                    <span>Account Status</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Account Status:</span>
                      <Badge variant={profile.isAccepted ? "default" : "secondary"}>
                        {profile.isAccepted ? "Accepted" : "Pending"}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Email Verified:</span>
                      <Badge variant={profile.emailVerified ? "default" : "outline"}>
                        {profile.emailVerified ? "Yes" : "No"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Editable Profile Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5" />
                  <span>Profile Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="parentsEmail">Parent's Email (Optional)</Label>
                    <Input
                      id="parentsEmail"
                      type="email"
                      placeholder="parent@example.com"
                      value={formData.parentsEmail}
                      onChange={(e) => handleInputChange('parentsEmail', e.target.value)}
                      className="h-10"
                    />
                    <p className="text-xs text-gray-500">
                      We'll use this to send updates about your child's progress
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="section">Section (Optional)</Label>
                    <Input
                      id="section"
                      type="text"
                      placeholder="e.g. Matatag, Masigla"
                      value={formData.section}
                      onChange={(e) => handleInputChange('section', e.target.value)}
                      className="h-10"
                    />
                  </div>

                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-red-50 p-6 rounded-lg inline-block">
              <div className="text-red-500 mb-4">
                <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-red-800">Error Loading Profile</h3>
              <p className="mt-2 text-sm text-red-700">
                There was an error loading your profile. Please try again later.
              </p>
              <div className="mt-4">
                <Button
                  onClick={loadProfile}
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-50"
                >
                  Retry
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentProfileEdit; 