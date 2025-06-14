import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminSidebar } from '@/components/AdminSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { adminService, type DashboardData } from '@/lib/services/adminService';
import { useToast } from '@/components/ui/use-toast';
import {
  Users,
  BookOpen,
  GraduationCap,
  UserCheck,
  Activity,
  TrendingUp,
  AlertTriangle,
  Database,
  Clock,
  RefreshCw
} from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

function StatCard({ title, value, description, icon: Icon, trend, className }: StatCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {trend && (
          <div className="flex items-center mt-2">
            <Badge 
              variant={trend.isPositive ? "default" : "destructive"}
              className="text-xs"
            >
              {trend.isPositive ? '+' : ''}{trend.value}%
            </Badge>
            <span className="text-xs text-muted-foreground ml-2">vs last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ActivityChart({ dailyRegistrations }: { dailyRegistrations: Record<string, number> }) {
  // Safety check for undefined or null dailyRegistrations
  if (!dailyRegistrations || typeof dailyRegistrations !== 'object') {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground">
        <p>No registration data available</p>
      </div>
    );
  }

  const entries = Object.entries(dailyRegistrations);
  if (entries.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground">
        <p>No registration data available</p>
      </div>
    );
  }

  const maxValue = Math.max(...Object.values(dailyRegistrations));
  
  return (
    <div className="space-y-3">
      {entries
        .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
        .slice(0, 7)
        .map(([date, count]) => (
          <div key={date} className="flex items-center space-x-2">
            <div className="w-20 text-sm text-muted-foreground">
              {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
            <div className="flex-1 bg-teal-100 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-teal-400 to-cyan-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(count / maxValue) * 100}%` }}
              />
            </div>
            <div className="w-8 text-sm font-medium text-right">{count}</div>
          </div>
        ))}
    </div>
  );
}

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const data = await adminService.getDashboardData();
      
      // Validate the data structure before setting it
      if (data && data.userStats && data.contentStats && data.activityStats) {
        setDashboardData(data);
        setLastUpdated(new Date());
      } else {
        console.error('Invalid dashboard data structure:', data);
        setDashboardData(null);
        toast({
          title: "Error",
          description: "Received invalid dashboard data structure. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setDashboardData(null);
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    fetchDashboardData();
  };

  const formatNumber = (num: number | undefined) => {
    if (num === undefined || num === null || isNaN(num)) {
      return '0';
    }
    return new Intl.NumberFormat().format(num);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <SidebarInset className="flex-1">
          <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-teal-100">
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center space-x-4">
                  <SidebarTrigger className="text-teal-600" />
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                      Admin Dashboard
                    </h1>
                    <p className="text-gray-600 text-sm">Overview of your FiliUp system</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-600">
                    Last updated: {lastUpdated.toLocaleTimeString()}
                  </div>
                  <Button 
                    onClick={handleRefresh} 
                    disabled={isLoading}
                    size="sm"
                    variant="outline"
                    className="border-teal-200 text-teal-600 hover:bg-teal-50"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </div>
            </header>

            <div className="p-6">
              {/* Welcome Section */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Welcome back, Admin! 👑
                </h1>
                <p className="text-gray-600">Monitor and manage your FiliUp system activities.</p>
              </div>

              {isLoading ? (
                // Loading skeleton
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                      <Card key={i}>
                        <CardHeader className="space-y-0 pb-2">
                          <Skeleton className="h-4 w-24" />
                        </CardHeader>
                        <CardContent>
                          <Skeleton className="h-8 w-16 mb-2" />
                          <Skeleton className="h-3 w-32" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <Skeleton className="h-6 w-40" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-40 w-full" />
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <Skeleton className="h-6 w-32" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-40 w-full" />
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ) : dashboardData && dashboardData.userStats && dashboardData.contentStats && dashboardData.activityStats ? (
                <div className="space-y-6">
                  {/* Quick Stats */}
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                    <Card className="bg-gradient-to-r from-teal-400 to-cyan-600 text-white border-0">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-teal-100">Total Users</p>
                            <p className="text-2xl font-bold">{formatNumber(dashboardData.userStats.totalUsers)}</p>
                            <p className="text-sm text-teal-100">{dashboardData.userStats.activeUsers} active users</p>
                          </div>
                          <Users className="h-8 w-8 text-teal-100" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-cyan-400 to-teal-600 text-white border-0">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-cyan-100">Students</p>
                            <p className="text-2xl font-bold">{formatNumber(dashboardData.userStats.students)}</p>
                            <p className="text-sm text-cyan-100">Enrolled students</p>
                          </div>
                          <GraduationCap className="h-8 w-8 text-cyan-100" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-teal-500 to-cyan-400 text-white border-0">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-teal-100">Teachers</p>
                            <p className="text-2xl font-bold">{formatNumber(dashboardData.userStats.teachers)}</p>
                            <p className="text-sm text-teal-100">Active teachers</p>
                          </div>
                          <UserCheck className="h-8 w-8 text-teal-100" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-cyan-500 to-teal-400 text-white border-0">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-cyan-100">Stories</p>
                            <p className="text-2xl font-bold">{formatNumber(dashboardData.contentStats.totalStories)}</p>
                            <p className="text-sm text-cyan-100">Published stories</p>
                          </div>
                          <BookOpen className="h-8 w-8 text-cyan-100" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Charts and Activity */}
                  <div className="grid gap-6 md:grid-cols-2 mb-8">
                    {/* User Registration Activity */}
                    <Card className="bg-white shadow-sm border border-teal-100">
                      <CardHeader>
                        <CardTitle className="flex items-center text-teal-800">
                          <TrendingUp className="mr-2 h-5 w-5 text-teal-600" />
                          Recent User Registrations
                        </CardTitle>
                        <CardDescription className="text-gray-600">
                          Daily new user registrations over the past week
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ActivityChart dailyRegistrations={dashboardData.activityStats.dailyRegistrations || {}} />
                      </CardContent>
                    </Card>

                    {/* System Health */}
                    <Card className="bg-white shadow-sm border border-teal-100">
                      <CardHeader>
                        <CardTitle className="flex items-center text-teal-800">
                          <Database className="mr-2 h-5 w-5 text-teal-600" />
                          System Status
                        </CardTitle>
                        <CardDescription className="text-gray-600">
                          Current system health and performance
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Database</span>
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              Healthy
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">API Response</span>
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              Fast
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Server Load</span>
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                              Moderate
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Storage</span>
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              Available
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Quick Actions */}
                  <Card className="bg-white shadow-sm border border-teal-100">
                    <CardHeader>
                      <CardTitle className="text-teal-800">Quick Actions</CardTitle>
                      <CardDescription className="text-gray-600">
                        Common administrative tasks
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Button 
                          variant="outline" 
                          className="border-teal-200 text-teal-600 hover:bg-teal-50"
                          onClick={() => navigate('/admin/users')}
                        >
                          <Users className="mr-2 h-4 w-4" />
                          Manage Users
                        </Button>
                        <Button 
                          variant="outline" 
                          className="border-teal-200 text-teal-600 hover:bg-teal-50"
                          onClick={() => navigate('/admin/stories')}
                        >
                          <BookOpen className="mr-2 h-4 w-4" />
                          Review Stories
                        </Button>
                        <Button 
                          variant="outline" 
                          className="border-teal-200 text-teal-600 hover:bg-teal-50"
                          onClick={() => navigate('/admin/reports')}
                        >
                          <AlertTriangle className="mr-2 h-4 w-4" />
                          View Reports
                        </Button>
                        <Button 
                          variant="outline" 
                          className="border-teal-200 text-teal-600 hover:bg-teal-50"
                          onClick={() => navigate('/admin/settings')}
                        >
                          <Database className="mr-2 h-4 w-4" />
                          System Settings
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card className="bg-white shadow-sm border border-red-200">
                  <CardContent className="flex items-center justify-center h-40">
                    <div className="text-center">
                      <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                      <p className="text-red-600 mb-4">Failed to load dashboard data</p>
                      <Button onClick={handleRefresh} variant="outline" className="border-teal-200 text-teal-600 hover:bg-teal-50">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Try Again
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
} 