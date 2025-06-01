import React, { useState, useEffect } from 'react';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import teacherService from '../../services/teacherService';

import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectValue } from '../../components/ui/select';
import { Card, CardContent } from '../../components/ui/card';

const GENRE_OPTIONS = [
  { value: 'MAIKLING_KWENTO', label: 'Maikling Kwento' },
  { value: 'TULA', label: 'Tula' },
  { value: 'DULA', label: 'Dula' },
  { value: 'NOBELA', label: 'Nobela' },
  { value: 'SANAYSAY', label: 'Sanaysay' },
  { value: 'AWIT', label: 'Awit' },
  { value: 'KORIDO', label: 'Korido' },
  { value: 'EPIKO', label: 'Epiko' },
  { value: 'BUGTONG', label: 'Bugtong' },
  { value: 'SALAWIKAIN', label: 'Salawikain' },
  { value: 'TALUMPATI', label: 'Talumpati' },
  { value: 'MITOLOHIYA', label: 'Mitolohiya' },
  { value: 'ALAMAT', label: 'Alamat' },
  { value: 'PARABULA', label: 'Parabula' },
  { value: 'PABULA', label: 'Pabula' }
];

const DIFFICULTY_LEVELS = [
  { value: 'BEGINNER', label: 'Nagsisimula' },
  { value: 'INTERMEDIATE', label: 'Gitnang Antas' },
  { value: 'ADVANCED', label: 'Abante' }
];

export default function CreateStory() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { classId } = useParams();
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    genre: '',
    difficultyLevel: 'BEGINNER',
    coverPicture: null,
    coverPictureType: ''
  });
  
  const [coverPreview, setCoverPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Check if user is a teacher
  useEffect(() => {
    if (!user || (user.userRole !== 'TEACHER' && user.userRole !== 'ADMIN')) {
      navigate('/home');
    }
  }, [user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Mangyaring pumili ng tamang uri ng larawan.');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Ang sukat ng file ay dapat mas mababa sa 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target.result.split(',')[1];
        setFormData(prev => ({
          ...prev,
          coverPicture: base64String,
          coverPictureType: file.type
        }));
        setCoverPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeCoverImage = () => {
    setCoverPreview(null);
    setFormData(prev => ({
      ...prev,
      coverPicture: null,
      coverPictureType: ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      setError('Kinakailangan ang pamagat ng kwento.');
      return;
    }
    
    if (!formData.content.trim()) {
      setError('Kinakailangan ang nilalaman ng kwento.');
      return;
    }
    
    if (!formData.genre) {
      setError('Mangyaring pumili ng uri ng kwento.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const storyData = {
        ...formData,
        classId: classId || null, // Include classId if provided
        teacherId: user.userId
      };
      
      await teacherService.createStory(storyData);
      
      setSuccess('Matagumpay na nalikha ang kwento!');
      
      // Redirect after successful creation
      setTimeout(() => {
        if (classId) {
          navigate(`/teacher/class/${classId}/lessons`);
        } else {
          navigate('/teacher');
        }
      }, 2000);
      
    } catch (error) {
      console.error('Error creating story:', error);
      setError(error.message || 'Hindi matagumpay ang paglikha ng kwento. Pakisubukang muli.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    if (classId) {
      navigate(`/teacher/class/${classId}/lessons`);
    } else {
      navigate('/teacher');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" className="rounded-full" onClick={handleGoBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Lumikha ng Bagong Kwento</h1>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/50 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-green-800 dark:text-green-200">{success}</p>
          </div>
        )}

        {/* Main Form */}
        <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Story Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-base font-semibold text-slate-700 dark:text-slate-300">
                  Pamagat ng Kwento <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Ilagay ang pamagat ng iyong kwento..."
                  value={formData.title}
                  onChange={handleInputChange}
                  className="text-lg h-12 border-slate-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400"
                  required
                />
              </div>

              {/* Genre */}
              <div className="space-y-2">
                <Label htmlFor="genre" className="text-base font-semibold text-slate-700 dark:text-slate-300">
                  Uri ng Kwento <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <select
                    id="genre"
                    name="genre"
                    value={formData.genre}
                    onChange={handleInputChange}
                    className="w-full h-12 rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                    required
                  >
                    <option value="" disabled>Pumili ng uri ng kwento</option>
                    {GENRE_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Cover Picture */}
              <div className="space-y-4">
                <Label className="text-base font-semibold text-slate-700 dark:text-slate-300">Larawan ng Pabalat</Label>

                {!coverPreview ? (
                  <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <Upload className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Mag-upload ng Larawan ng Pabalat
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">PNG, JPG, GIF hanggang 5MB</p>
                      </div>
                      <Button type="button" variant="outline" className="relative">
                        Pumili ng File
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="relative inline-block">
                    <img
                      src={coverPreview}
                      alt="Preview ng pabalat"
                      className="w-48 h-48 object-cover rounded-lg border border-slate-200 dark:border-slate-600"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 w-8 h-8 rounded-full"
                      onClick={removeCoverImage}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Story Content */}
              <div className="space-y-2">
                <Label htmlFor="content" className="text-base font-semibold text-slate-700 dark:text-slate-300">
                  Nilalaman ng Kwento <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="content"
                  name="content"
                  placeholder="Isulat ang iyong kwento dito... Hayaan ang iyong imahinasyon at lumikha ng isang kahanga-hangang kwento!"
                  value={formData.content}
                  onChange={handleInputChange}
                  className="min-h-[300px] text-base border-slate-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 resize-none"
                  required
                />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Tip: Magsimula sa nakaka-engganyong panimula na makukuha ang atensyon ng iyong mga mambabasa mula sa unang pangungusap.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Button 
                  type="submit" 
                  size="lg" 
                  className="flex-1 h-12 text-base font-semibold"
                  disabled={loading}
                >
                  {loading ? 'Nililikha...' : 'I-publish ang Kwento'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="lg" 
                  className="flex-1 h-12 text-base"
                  onClick={handleGoBack}
                  disabled={loading}
                >
                  Kanselahin
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
