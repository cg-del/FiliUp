import { useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/AdminSidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { adminService, type ActivitySummaryData } from '@/lib/services/adminService';
import { useToast } from '@/components/ui/use-toast';
import {
  Activity,
  Users,
  RefreshCw,
  Clock,
  TrendingUp
} from 'lucide-react';

export default function AdminActivity() {
  const [activityData, setActivityData] = useState<ActivitySummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchActivityData = async () => {
    try {
      setLoading(true);
      const data = await adminService.getActivitySummary();
      setActivityData(data);
    } catch (error) {
      console.error('Error fetching activity data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch activity analytics. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivityData();
  }, []);

  const formatNumber = (num: number | undefined) => {
    if (num === undefined || num === null || isNaN(num)) {
      return '0';
    }
    return new Intl.NumberFormat().format(num);
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
                      Activity Analytics
                    </h1>
                    <p className="text-gray-600 text-sm">Monitor user activity and engagement</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button onClick={fetchActivityData} variant="outline" size="sm" className="border-teal-200 text-teal-600 hover:bg-teal-50">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
            </header>

            <div className="p-6">
              {/* Welcome Section */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Activity Analytics 📊
                </h1>
                <p className="text-gray-600">Monitor user engagement and activity patterns.</p>
              </div>

              {loading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                  {[...Array(4)].map((_, i) => (
                    <Card key={i} className="bg-white shadow-sm border border-teal-100">
                      <CardContent className="p-6">
                        <div className="animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                          <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-32"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : activityData ? (
                <>
                  {/* Activity Stats */}
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                    <Card className="bg-gradient-to-r from-teal-400 to-cyan-600 text-white border-0">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-teal-100">Active Users (24h)</p>
                            <p className="text-2xl font-bold">{formatNumber(activityData.activeUsersLast24h)}</p>
                            <p className="text-sm text-teal-100">Last 24 hours</p>
                          </div>
                          <Clock className="h-8 w-8 text-teal-100" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-cyan-400 to-teal-600 text-white border-0">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-cyan-100">Active Users (Week)</p>
                            <p className="text-2xl font-bold">{formatNumber(activityData.activeUsersLastWeek)}</p>
                            <p className="text-sm text-cyan-100">Last 7 days</p>
                          </div>
                          <Users className="h-8 w-8 text-cyan-100" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-teal-500 to-cyan-400 text-white border-0">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-teal-100">Activity Rate</p>
                            <p className="text-2xl font-bold">
                              {activityData.activeUsersLastWeek > 0 
                                ? Math.round((activityData.activeUsersLast24h / activityData.activeUsersLastWeek) * 100)
                                : 0}%
                            </p>
                            <p className="text-sm text-teal-100">24h / Weekly</p>
                          </div>
                          <TrendingUp className="h-8 w-8 text-teal-100" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-cyan-500 to-teal-400 text-white border-0">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-cyan-100">Engagement Score</p>
                            <p className="text-2xl font-bold">
                              {activityData.activeUsersLastWeek > 0 ? Math.min(100, Math.round((activityData.activeUsersLast24h / activityData.activeUsersLastWeek) * 200)) : 0}
                            </p>
                            <p className="text-sm text-cyan-100">Out of 100</p>
                          </div>
                          <Activity className="h-8 w-8 text-cyan-100" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Activity Details */}
                  <div className="grid gap-6 md:grid-cols-2 mb-8">
                    <Card className="bg-white shadow-sm border border-teal-100">
                      <CardHeader>
                        <CardTitle className="flex items-center text-teal-800">
                          <Clock className="mr-2 h-5 w-5 text-teal-600" />
                          Recent Activity
                        </CardTitle>
                        <CardDescription className="text-gray-600">
                          User activity in the last 24 hours
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-teal-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">Active Users</p>
                              <p className="text-sm text-gray-600">Users who logged in today</p>
                            </div>
                            <div className="text-2xl font-bold text-teal-600">
                              {formatNumber(activityData.activeUsersLast24h)}
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between p-4 bg-cyan-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">Activity Level</p>
                              <p className="text-sm text-gray-600">Current engagement level</p>
                            </div>
                            <div className="text-lg font-semibold text-cyan-600">
                              {activityData.activeUsersLast24h > 50 ? 'High' : 
                               activityData.activeUsersLast24h > 20 ? 'Medium' : 'Low'}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white shadow-sm border border-teal-100">
                      <CardHeader>
                        <CardTitle className="flex items-center text-teal-800">
                          <TrendingUp className="mr-2 h-5 w-5 text-teal-600" />
                          Weekly Trends
                        </CardTitle>
                        <CardDescription className="text-gray-600">
                          User activity trends over the last week
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-teal-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">Weekly Active Users</p>
                              <p className="text-sm text-gray-600">Users active in past 7 days</p>
                            </div>
                            <div className="text-2xl font-bold text-teal-600">
                              {formatNumber(activityData.activeUsersLastWeek)}
                            </div>
                          </div>

                          <div className="flex items-center justify-between p-4 bg-cyan-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">Growth Trend</p>
                              <p className="text-sm text-gray-600">Compared to previous period</p>
                            </div>
                            <div className="text-lg font-semibold text-cyan-600">
                              {activityData.activeUsersLastWeek >= activityData.activeUsersLast24h * 5 ? 'Stable' : 'Growing'}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Activity Visualization */}
                  <Card className="bg-white shadow-sm border border-teal-100">
                    <CardHeader>
                      <CardTitle className="flex items-center text-teal-800">
                        <Activity className="mr-2 h-5 w-5 text-teal-600" />
                        Activity Comparison
                      </CardTitle>
                      <CardDescription className="text-gray-600">
                        Visual comparison of 24-hour vs weekly activity
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">24-Hour Activity</span>
                            <span className="text-sm text-gray-500">{formatNumber(activityData.activeUsersLast24h)} users</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                              className="bg-gradient-to-r from-teal-400 to-cyan-500 h-3 rounded-full transition-all duration-300"
                              style={{ 
                                width: `${activityData.activeUsersLastWeek > 0 
                                  ? Math.min(100, (activityData.activeUsersLast24h / activityData.activeUsersLastWeek) * 100)
                                  : 0}%` 
                              }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Weekly Activity</span>
                            <span className="text-sm text-gray-500">{formatNumber(activityData.activeUsersLastWeek)} users</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                              className="bg-gradient-to-r from-cyan-400 to-teal-500 h-3 rounded-full transition-all duration-300"
                              style={{ width: '100%' }}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card className="bg-white shadow-sm border border-red-200">
                  <CardContent className="flex items-center justify-center h-40">
                    <div className="text-center">
                      <Activity className="h-12 w-12 text-red-500 mx-auto mb-4" />
                      <p className="text-red-600 mb-4">Failed to load activity analytics</p>
                      <Button onClick={fetchActivityData} variant="outline" className="border-teal-200 text-teal-600 hover:bg-teal-50">
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