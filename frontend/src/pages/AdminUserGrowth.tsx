import { useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/AdminSidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { adminService, type UserGrowthData } from '@/lib/services/adminService';
import { useToast } from '@/components/ui/use-toast';
import {
  TrendingUp,
  Users,
  RefreshCw,
  Calendar,
  BarChart3
} from 'lucide-react';

export default function AdminUserGrowth() {
  const [growthData, setGrowthData] = useState<UserGrowthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const { toast } = useToast();

  const fetchGrowthData = async () => {
    try {
      setLoading(true);
      const data = await adminService.getUserGrowthAnalytics(parseInt(selectedPeriod));
      setGrowthData(data);
    } catch (error) {
      console.error('Error fetching growth data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch user growth analytics. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrowthData();
  }, [selectedPeriod]);

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
                      User Growth Analytics
                    </h1>
                    <p className="text-gray-600 text-sm">Track user registration and growth trends</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger className="w-32 border-teal-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="14">14 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="60">60 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={fetchGrowthData} variant="outline" size="sm" className="border-teal-200 text-teal-600 hover:bg-teal-50">
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
                  User Growth Analytics 📈
                </h1>
                <p className="text-gray-600">Monitor user registration trends and growth patterns.</p>
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
              ) : growthData ? (
                <>
                  {/* Growth Stats */}
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                    <Card className="bg-gradient-to-r from-teal-400 to-cyan-600 text-white border-0">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-teal-100">Total New Users</p>
                            <p className="text-2xl font-bold">{formatNumber(growthData.totalNewUsers)}</p>
                            <p className="text-sm text-teal-100">Last {selectedPeriod} days</p>
                          </div>
                          <Users className="h-8 w-8 text-teal-100" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-cyan-400 to-teal-600 text-white border-0">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-cyan-100">Average per Day</p>
                            <p className="text-2xl font-bold">{formatNumber(Math.round(growthData.averagePerDay))}</p>
                            <p className="text-sm text-cyan-100">Daily average</p>
                          </div>
                          <TrendingUp className="h-8 w-8 text-cyan-100" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-teal-500 to-cyan-400 text-white border-0">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-teal-100">Period Length</p>
                            <p className="text-2xl font-bold">{growthData.periodDays}</p>
                            <p className="text-sm text-teal-100">Days analyzed</p>
                          </div>
                          <Calendar className="h-8 w-8 text-teal-100" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-cyan-500 to-teal-400 text-white border-0">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-cyan-100">Growth Rate</p>
                            <p className="text-2xl font-bold">
                              {growthData.totalNewUsers > 0 ? '+' : ''}{formatNumber(growthData.totalNewUsers)}
                            </p>
                            <p className="text-sm text-cyan-100">User increase</p>
                          </div>
                          <BarChart3 className="h-8 w-8 text-cyan-100" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Daily Registrations Chart */}
                  <Card className="bg-white shadow-sm border border-teal-100">
                    <CardHeader>
                      <CardTitle className="flex items-center text-teal-800">
                        <TrendingUp className="mr-2 h-5 w-5 text-teal-600" />
                        Daily Registration Activity
                      </CardTitle>
                      <CardDescription className="text-gray-600">
                        New user registrations over the selected period
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {Object.keys(growthData.dailyRegistrations).length > 0 ? (
                        <div className="space-y-3">
                          {Object.entries(growthData.dailyRegistrations)
                            .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
                            .slice(0, 10)
                            .map(([date, count]) => {
                              const maxValue = Math.max(...Object.values(growthData.dailyRegistrations));
                              return (
                                <div key={date} className="flex items-center space-x-2">
                                  <div className="w-20 text-sm text-muted-foreground">
                                    {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                  </div>
                                  <div className="flex-1 bg-teal-100 rounded-full h-2">
                                    <div 
                                      className="bg-gradient-to-r from-teal-400 to-cyan-500 h-2 rounded-full transition-all duration-300"
                                      style={{ width: `${maxValue > 0 ? (count / maxValue) * 100 : 0}%` }}
                                    />
                                  </div>
                                  <div className="w-8 text-sm font-medium text-right">{count}</div>
                                </div>
                              );
                            })}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-40 text-muted-foreground">
                          <p>No registration data available</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card className="bg-white shadow-sm border border-red-200">
                  <CardContent className="flex items-center justify-center h-40">
                    <div className="text-center">
                      <TrendingUp className="h-12 w-12 text-red-500 mx-auto mb-4" />
                      <p className="text-red-600 mb-4">Failed to load growth analytics</p>
                      <Button onClick={fetchGrowthData} variant="outline" className="border-teal-200 text-teal-600 hover:bg-teal-50">
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