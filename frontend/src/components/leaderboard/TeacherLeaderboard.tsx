import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { teacherAPI, SectionLeaderboardResponse, SectionResponse } from '../../lib/api';
import LeaderboardTable from './LeaderboardTable';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, User } from 'lucide-react';
import { SimpleThemeToggle } from '@/components/ui/theme-toggle';
import { CenteredLoading, InlineLoading } from '@/components/ui/loading-spinner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const TeacherLeaderboard: React.FC = () => {
  const { sectionId } = useParams<{ sectionId?: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sections, setSections] = useState<SectionResponse[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string>(sectionId || '');
  const [leaderboardData, setLeaderboardData] = useState<SectionLeaderboardResponse | null>(null);
  const [allSectionsData, setAllSectionsData] = useState<SectionLeaderboardResponse[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'single' | 'all'>(sectionId ? 'single' : 'all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleConfirmLogout = () => {
    setShowLogoutDialog(false);
    logout();
    navigate('/login', { replace: true });
  };

  const fetchSections = useCallback(async () => {
    try {
      const sectionsData = await teacherAPI.getSections();
      setSections(sectionsData);
      if (sectionsData.length > 0 && !selectedSectionId) {
        setSelectedSectionId(sectionsData[0].id);
      }
    } catch (err) {
      console.error('Error fetching sections:', err);
      setError('Failed to load sections.');
    }
  }, [selectedSectionId]);

  const fetchSectionLeaderboard = async (sectionId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await teacherAPI.getSectionLeaderboard(sectionId);
      setLeaderboardData(data);
    } catch (err) {
      console.error('Error fetching section leaderboard:', err);
      setError('Failed to load leaderboard data.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllSectionsLeaderboard = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await teacherAPI.getAllSectionsLeaderboard();
      setAllSectionsData(data);
    } catch (err) {
      console.error('Error fetching all sections leaderboard:', err);
      setError('Failed to load leaderboard data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  useEffect(() => {
    if (viewMode === 'single' && selectedSectionId) {
      fetchSectionLeaderboard(selectedSectionId);
    } else if (viewMode === 'all') {
      fetchAllSectionsLeaderboard();
    }
  }, [selectedSectionId, viewMode]);

  const handleSectionChange = (sectionId: string) => {
    setSelectedSectionId(sectionId);
    setViewMode('single');
  };

  const handleViewModeChange = (mode: 'single' | 'all') => {
    setViewMode(mode);
  };

  const exportLeaderboard = () => {
    const data = viewMode === 'single' ? leaderboardData : allSectionsData;
    if (!data) return;

    let csvContent = '';
    
    if (viewMode === 'single' && leaderboardData) {
      csvContent = 'Rank,Student Name,Total Score,Average Percentage,Completed Activities,Completed Lessons,Badge\n';
      leaderboardData.students.forEach(student => {
        csvContent += `${student.rank},"${student.name}",${student.totalScore},${student.averageScore},${student.activitiesCompleted},${student.lessonsCompleted},""\n`;
      });
    } else if (viewMode === 'all' && allSectionsData) {
      csvContent = 'Section,Rank,Student Name,Total Score,Average Percentage,Completed Activities,Completed Lessons,Badge\n';
      allSectionsData.forEach(section => {
        section.students.forEach(student => {
          csvContent += `"${section.sectionName}",${student.rank},"${student.name}",${student.totalScore},${student.averageScore},${student.activitiesCompleted},${student.lessonsCompleted},""\n`;
        });
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leaderboard-${viewMode === 'single' ? selectedSectionId : 'all-sections'}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        {/* Navigation Header */}
        <header className="bg-card border-b border-border p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary">FiliUp</h1>
              <p className="text-muted-foreground">Welcome, {user?.name}! 👋</p>
            </div>
            {/* Desktop actions */}
            <div className="hidden md:flex items-center space-x-3">
              <Button variant="outline" onClick={() => navigate('/teacher/dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <Button variant="outline" onClick={() => navigate('/teacher/profile')}>
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
              <SimpleThemeToggle />
              <Button variant="ghost" onClick={handleLogoutClick}>
                Logout
              </Button>
            </div>
            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button variant="outline" size="sm" onClick={() => setMobileMenuOpen((o) => !o)}>☰</Button>
            </div>
          </div>
          {/* Mobile menu panel */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-3 max-w-7xl mx-auto">
              <div className="flex flex-col gap-2">
                <Button variant="outline" onClick={() => navigate('/teacher/dashboard')} className="w-full text-left">Dashboard</Button>
                <Button variant="outline" onClick={() => navigate('/teacher/profile')} className="w-full text-left">Profile</Button>
                <div className="flex justify-center py-2">
                  <SimpleThemeToggle />
                </div>
                <Button variant="ghost" onClick={handleLogoutClick} className="w-full text-left">Logout</Button>
              </div>
            </div>
          )}
        </header>

        <div className="max-w-6xl mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Leaderboard</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="bg-card border-b border-border p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">FiliUp</h1>
            <p className="text-muted-foreground">Welcome, {user?.name}! 👋</p>
          </div>
          {/* Desktop actions */}
          <div className="hidden md:flex items-center space-x-3">
            <Button variant="outline" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <Button variant="outline" onClick={() => navigate('/teacher/profile')}>
              <User className="h-4 w-4 mr-2" />
              Profile
            </Button>
            <SimpleThemeToggle />
            <Button variant="ghost" onClick={handleLogoutClick}>Logout</Button>
          </div>
          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="outline" size="sm" onClick={() => setMobileMenuOpen((o) => !o)}>☰</Button>
          </div>
        </div>
        {/* Mobile menu panel */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 max-w-7xl mx-auto">
            <div className="flex flex-col gap-2">
              <Button variant="outline" onClick={() => navigate('/')} className="w-full text-left">Dashboard</Button>
              <Button variant="outline" onClick={() => navigate('/teacher/profile')} className="w-full text-left">Profile</Button>
              <div className="flex justify-center py-2">
                <SimpleThemeToggle />
              </div>
              <Button variant="ghost" onClick={handleLogoutClick} className="w-full text-left">Logout</Button>
            </div>
          </div>
        )}
      </header>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Class Leaderboards</h1>
          <p className="text-muted-foreground mt-1">Monitor student performance and progress</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* View Mode Toggle */}
          <div className="bg-muted rounded-lg p-1 flex">
            <button
              onClick={() => handleViewModeChange('single')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'single'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Single Section
            </button>
            <button
              onClick={() => handleViewModeChange('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'all'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              All Sections
            </button>
          </div>

          {/* Export Button */}
          <button
            onClick={exportLeaderboard}
            disabled={isLoading || (!leaderboardData && !allSectionsData)}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            <span>📊</span>
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Section Selector (for single section view) */}
      {viewMode === 'single' && (
        <div className="bg-card rounded-lg shadow-sm border border-border p-4">
          <div className="flex items-center space-x-4">
            <label htmlFor="section-select" className="text-sm font-medium text-foreground">
              Select Section:
            </label>
            <select
              id="section-select"
              value={selectedSectionId}
              onChange={(e) => handleSectionChange(e.target.value)}
              className="border border-border rounded-md px-3 py-2 bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            >
              {sections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.name} ({section.gradeLevel}) - {section.studentCount} students
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Single Section View */}
      {viewMode === 'single' && leaderboardData && (
        <>
          {/* Section Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-card rounded-lg shadow-sm border border-border p-4">
              <div className="text-2xl font-bold text-foreground">{leaderboardData.students.length}</div>
              <div className="text-sm text-muted-foreground">Total Students</div>
            </div>
            <div className="bg-card rounded-lg shadow-sm border border-border p-4">
              <div className="text-2xl font-bold text-foreground">
                {leaderboardData.students.length > 0 
                  ? Math.round(leaderboardData.students.reduce((sum, s) => sum + s.totalScore, 0) / leaderboardData.students.length)
                  : 0}
              </div>
              <div className="text-sm text-muted-foreground">Average Score</div>
            </div>
            <div className="bg-card rounded-lg shadow-sm border border-border p-4">
              <div className="text-2xl font-bold text-foreground">
                {leaderboardData.students.length > 0 
                  ? Math.max(...leaderboardData.students.map(s => s.totalScore)).toLocaleString()
                  : 0}
              </div>
              <div className="text-sm text-muted-foreground">Highest Score</div>
            </div>
            <div className="bg-card rounded-lg shadow-sm border border-border p-4">
              <div className="text-2xl font-bold text-foreground">
                {leaderboardData.students.length > 0 
                  ? (leaderboardData.students.reduce((sum, s) => sum + s.averageScore, 0) / leaderboardData.students.length).toFixed(1)
                  : 0}%
              </div>
              <div className="text-sm text-muted-foreground">Avg Percentage</div>
            </div>
          </div>

          {/* Leaderboard Table */}
          <LeaderboardTable
            rankings={leaderboardData.students}
            showFullDetails={true}
            isLoading={isLoading}
          />
        </>
      )}

      {/* All Sections View */}
      {viewMode === 'all' && allSectionsData && (
        <div className="space-y-8">
          {allSectionsData.map((section) => (
            <div key={section.sectionId} className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">{section.sectionName}</h2>
                <div className="text-sm text-muted-foreground">
                  {section.students.length} students • Avg: {section.students.length > 0 ? Math.round(section.students.reduce((sum, s) => sum + s.totalScore, 0) / section.students.length) : 0} points
                </div>
              </div>
              
              <LeaderboardTable
                rankings={section.students}
                showFullDetails={true}
                isLoading={false}
              />
            </div>
          ))}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="py-12">
          <InlineLoading message="Loading leaderboard data..." />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && viewMode === 'single' && leaderboardData?.students.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground text-6xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-foreground mb-2">No student data yet</h3>
          <p className="text-muted-foreground">Students need to complete activities to appear on the leaderboard.</p>
        </div>
      )}

      {/* Teacher Insights */}
      {(leaderboardData || allSectionsData) && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">📈 Teaching Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-card rounded-lg p-4 border border-border">
              <h4 className="font-medium text-foreground mb-2">🎯 Engagement Tips</h4>
              <ul className="text-muted-foreground space-y-1">
                <li>• Celebrate top performers publicly</li>
                <li>• Encourage struggling students privately</li>
                <li>• Set class-wide completion goals</li>
              </ul>
            </div>
            <div className="bg-card rounded-lg p-4 border border-border">
              <h4 className="font-medium text-foreground mb-2">📊 Performance Tracking</h4>
              <ul className="text-muted-foreground space-y-1">
                <li>• Monitor weekly progress trends</li>
                <li>• Identify students needing extra help</li>
                <li>• Use data for parent conferences</li>
              </ul>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to logout? You will need to login again to access the leaderboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmLogout} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TeacherLeaderboard;
