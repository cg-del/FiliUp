import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, BookOpen, TrendingUp, Settings, Plus, Eye, Key, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { CreateSectionDialog } from './CreateSectionDialog';
import { InviteCodeDialog } from './InviteCodeDialog';
import { teacherApi, TeacherDashboard as TeacherDashboardData } from '@/lib/teacherApi';
import { useToast } from '@/hooks/use-toast';
import { CenteredLoading } from '@/components/ui/loading-spinner';

export const TeacherDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showCreateSection, setShowCreateSection] = useState(false);
  const [showInviteCode, setShowInviteCode] = useState(false);
  const [selectedSection, setSelectedSection] = useState<{ id: string; name: string; inviteCode: string } | null>(null);
  const [dashboardData, setDashboardData] = useState<TeacherDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Pagination state for recent activity
  const [currentPage, setCurrentPage] = useState(1);
  const activitiesPerPage = 5;

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const data = await teacherApi.getDashboard();
      setDashboardData(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const statsConfig = [
    { label: 'Total Students', key: 'totalStudents', icon: Users, color: 'text-[#00B4A3]' },
    { label: 'Active Sections', key: 'activeSections', icon: BookOpen, color: 'text-success' },
    { label: 'Average Progress', key: 'averageProgress', icon: TrendingUp, color: 'text-warning', suffix: '%' },
   
  ];

  // Sort activities by timestamp (most recent first) and paginate
  const sortedActivities = dashboardData?.recentActivity
    ? [...dashboardData.recentActivity].sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
    : [];

  const totalPages = Math.ceil(sortedActivities.length / activitiesPerPage);
  const startIndex = (currentPage - 1) * activitiesPerPage;
  const endIndex = startIndex + activitiesPerPage;
  const currentActivities = sortedActivities.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return <CenteredLoading message="Loading teacher dashboard..." />;
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Failed to load dashboard</p>
          <Button onClick={loadDashboard} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">Teacher Dashboard</h1>
            <p className="text-muted-foreground">Welcome, {user?.name}! 👩‍🏫</p>
          </div>
          {/* Desktop actions */}
          <div className="hidden md:flex items-center space-x-3">
            <Button 
              variant="outline" 
              onClick={() => navigate('/teacher/leaderboard')}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              All Leaderboards
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/teacher/profile')}
            >
              <Settings className="h-4 w-4 mr-2" />
              Profile
            </Button>
            <Button variant="ghost" onClick={handleLogout}>
              Logout
            </Button>
          </div>
          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="outline" size="sm" onClick={() => setMobileMenuOpen((o) => !o)}>
              ☰
            </Button>
          </div>
        </div>
        {/* Mobile menu panel */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 max-w-6xl mx-auto">
            <div className="flex flex-col gap-2">
              <Button variant="outline" onClick={() => navigate('/teacher/leaderboard')} className="w-full text-left">
                All Leaderboards
              </Button>
              <Button variant="outline" onClick={() => navigate('/teacher/profile')} className="w-full text-left">
                Profile
              </Button>
              <Button variant="ghost" onClick={handleLogout} className="w-full text-left">
                Logout
              </Button>
            </div>
          </div>
        )}
      </header>

      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statsConfig.map((statConfig, index) => {
            const Icon = statConfig.icon;
            const value = dashboardData.stats[statConfig.key as keyof typeof dashboardData.stats];
            const displayValue = statConfig.suffix ? `${Math.round(value)}${statConfig.suffix}` : value.toString();
            
            return (
              <Card key={index} className="learning-card">
                <CardContent className="flex items-center p-4">
                  <div className="p-2 rounded-lg bg-gradient-primary mr-3">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{displayValue}</div>
                    <div className="text-xs text-muted-foreground">{statConfig.label}</div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Sections */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold">Sections</h2>
              <Button variant="outline" size="sm" onClick={() => setShowCreateSection(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Section
              </Button>
            </div>
            
            <div className="space-y-4">
              {dashboardData.sections.map((section) => (
                <Card key={section.id} className="learning-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">{section.name}</h3>
                      <Badge variant="secondary">
                        {section.activeStudents}/{section.totalStudents} active
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Average Progress</span>
                        <span className="font-medium">{Math.round(section.averageProgress)}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${section.averageProgress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between mt-4 space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/teacher/section/${section.id}`)}
                        className="flex-1"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Details
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/teacher/leaderboard/${section.id}`)}
                        className="flex-1"
                      >
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Rankings
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedSection({ id: section.id, name: section.name, inviteCode: section.inviteCode });
                          setShowInviteCode(true);
                        }}
                        className="flex-1"
                      >
                        <Key className="h-4 w-4 mr-2" />
                        Code
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Recent Student Activity</h2>
              <div className="text-sm text-muted-foreground">
                {sortedActivities.length} total activities
              </div>
            </div>
            <Card className="learning-card">
              <CardHeader>
                <CardTitle className="text-lg">Latest Updates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentActivities.length > 0 ? (
                  <>
                    {currentActivities.map((activity, index) => (
                      <div key={`${activity.studentId}-${activity.timestamp}-${index}`} className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg">
                        <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            {activity.studentName.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{activity.studentName}</div>
                          <div className="text-sm text-muted-foreground">{activity.activity}</div>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-muted-foreground">{activity.timeAgo}</span>
                            {activity.score && (
                              <Badge variant={activity.score >= 80 ? "default" : "secondary"}>
                                {activity.score}%
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="text-sm text-muted-foreground">
                          Showing {startIndex + 1}-{Math.min(endIndex, sortedActivities.length)} of {sortedActivities.length}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                          >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                          </Button>
                          
                          <div className="flex items-center space-x-1">
                            {(() => {
                              const maxVisiblePages = 3;
                              const pages = [];
                              
                              if (totalPages <= 3) {
                                // Show all pages if 3 or fewer
                                for (let i = 1; i <= totalPages; i++) {
                                  pages.push(
                                    <Button
                                      key={i}
                                      variant={currentPage === i ? "default" : "outline"}
                                      size="sm"
                                      onClick={() => handlePageChange(i)}
                                      className="w-8 h-8 p-0"
                                    >
                                      {i}
                                    </Button>
                                  );
                                }
                              } else {
                                // Always show first page
                                pages.push(
                                  <Button
                                    key={1}
                                    variant={currentPage === 1 ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => handlePageChange(1)}
                                    className="w-8 h-8 p-0"
                                  >
                                    1
                                  </Button>
                                );
                                
                                // Show ellipsis if current page is far from start
                                if (currentPage > 3) {
                                  pages.push(
                                    <span key="start-ellipsis" className="px-2 text-muted-foreground">
                                      ...
                                    </span>
                                  );
                                }
                                
                                // Show pages around current page
                                const start = Math.max(2, currentPage - 1);
                                const end = Math.min(totalPages - 1, currentPage + 1);
                                
                                for (let i = start; i <= end; i++) {
                                  if (i !== 1 && i !== totalPages) {
                                    pages.push(
                                      <Button
                                        key={i}
                                        variant={currentPage === i ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => handlePageChange(i)}
                                        className="w-8 h-8 p-0"
                                      >
                                        {i}
                                      </Button>
                                    );
                                  }
                                }
                                
                                // Show ellipsis if current page is far from end
                                if (currentPage < totalPages - 2) {
                                  pages.push(
                                    <span key="end-ellipsis" className="px-2 text-muted-foreground">
                                      ...
                                    </span>
                                  );
                                }
                                
                                // Always show last page
                                if (totalPages > 1) {
                                  pages.push(
                                    <Button
                                      key={totalPages}
                                      variant={currentPage === totalPages ? "default" : "outline"}
                                      size="sm"
                                      onClick={() => handlePageChange(totalPages)}
                                      className="w-8 h-8 p-0"
                                    >
                                      {totalPages}
                                    </Button>
                                  );
                                }
                              }
                              
                              return pages;
                            })()}
                          </div>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                          >
                            Next
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No recent activity found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <CreateSectionDialog 
        open={showCreateSection} 
        onOpenChange={setShowCreateSection}
        onSectionCreated={loadDashboard}
      />
      {selectedSection && (
        <InviteCodeDialog 
          open={showInviteCode} 
          onOpenChange={setShowInviteCode}
          sectionName={selectedSection.name}
          sectionId={selectedSection.id}
          inviteCode={selectedSection.inviteCode}
        />
      )}
    </div>
  );
};