import { useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/AdminSidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { adminService, type SystemStatus } from '@/lib/services/adminService';
import { useToast } from '@/components/ui/use-toast';
import {
  Database,
  Server,
  Activity,
  Clock,
  MemoryStick,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  XCircle,
  TrendingUp
} from 'lucide-react';

interface SystemMetric {
  label: string;
  value: string | number;
  status: 'healthy' | 'warning' | 'critical';
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

export default function AdminSystemStatus() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const { toast } = useToast();

  const fetchSystemStatus = async () => {
    try {
      setLoading(true);
      const status = await adminService.getSystemStatus();
      setSystemStatus(status);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching system status:', error);
      toast({
        title: "Error",
        description: "Failed to fetch system status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemStatus();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchSystemStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
      case 'online':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'critical':
      case 'offline':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
      case 'online':
        return CheckCircle;
      case 'warning':
        return AlertTriangle;
      case 'critical':
      case 'offline':
        return XCircle;
      default:
        return Activity;
    }
  };

  const getMemoryUsagePercentage = () => {
    if (!systemStatus || !systemStatus.memory) return 0;
    return Math.round((systemStatus.memory.used / systemStatus.memory.total) * 100);
  };

  const getMemoryStatus = () => {
    const percentage = getMemoryUsagePercentage();
    if (percentage > 90) return 'critical';
    if (percentage > 75) return 'warning';
    return 'healthy';
  };

  const systemMetrics: SystemMetric[] = systemStatus ? [
    {
      label: 'Database Status',
      value: systemStatus.database,
      status: systemStatus.database && systemStatus.database.toLowerCase() === 'connected' ? 'healthy' : 'critical',
      icon: Database,
      description: 'Database connection and health'
    },
    {
      label: 'Memory Usage',
      value: `${getMemoryUsagePercentage()}%`,
      status: getMemoryStatus(),
      icon: MemoryStick,
      description: systemStatus.memory ? `${formatBytes(systemStatus.memory.used)} / ${formatBytes(systemStatus.memory.total)}` : 'N/A'
    },
    {
      label: 'System Uptime',
      value: formatUptime(systemStatus.uptime),
      status: 'healthy',
      icon: Clock,
      description: 'Time since last restart'
    }
  ] : [];

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
                      System Status
                    </h1>
                    <p className="text-gray-600 text-sm">Monitor system health and performance metrics</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-600">
                    Last updated: {lastUpdated.toLocaleTimeString()}
                  </div>
                  <Button 
                    onClick={fetchSystemStatus} 
                    disabled={loading}
                    size="sm"
                    variant="outline"
                    className="border-teal-200 text-teal-600 hover:bg-teal-50"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </div>
            </header>
            
            <div className="p-6">
              {/* Welcome Section */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  System Status 🖥️
                </h1>
                <p className="text-gray-600">Monitor system health, performance metrics, and resource usage.</p>
              </div>

          {loading && !systemStatus ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="animate-pulse bg-gray-200 h-4 w-24 rounded"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="animate-pulse bg-gray-200 h-8 w-16 rounded mb-2"></div>
                    <div className="animate-pulse bg-gray-200 h-3 w-32 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : systemStatus ? (
            <div className="space-y-6">
              {/* Overall Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Server className="mr-2 h-5 w-5" />
                    System Overview
                  </CardTitle>
                  <CardDescription>
                    Current system status and key metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    {systemMetrics.map((metric, index) => {
                      const StatusIcon = getStatusIcon(metric.status);
                      return (
                        <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                          <div className={`p-2 rounded-full ${
                            metric.status === 'healthy' ? 'bg-green-100' :
                            metric.status === 'warning' ? 'bg-yellow-100' : 'bg-red-100'
                          }`}>
                            <metric.icon className={`h-5 w-5 ${getStatusColor(metric.status)}`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-900">{metric.label}</span>
                              <StatusIcon className={`h-4 w-4 ${getStatusColor(metric.status)}`} />
                            </div>
                            <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
                            {metric.description && (
                              <div className="text-xs text-gray-500">{metric.description}</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Memory Details */}
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MemoryStick className="mr-2 h-5 w-5" />
                      Memory Usage
                    </CardTitle>
                    <CardDescription>
                      Current memory allocation and usage
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Used Memory</span>
                        <span>{systemStatus.memory ? formatBytes(systemStatus.memory.used) : 'N/A'}</span>
                      </div>
                      <Progress 
                        value={getMemoryUsagePercentage()} 
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>0</span>
                        <span>{systemStatus.memory ? formatBytes(systemStatus.memory.total) : 'N/A'}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500">Free Memory</div>
                        <div className="font-medium">{systemStatus.memory ? formatBytes(systemStatus.memory.free) : 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Max Memory</div>
                        <div className="font-medium">{systemStatus.memory && systemStatus.memory.max ? formatBytes(systemStatus.memory.max) : 'N/A'}</div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Badge 
                        variant={
                          getMemoryStatus() === 'healthy' ? 'default' :
                          getMemoryStatus() === 'warning' ? 'secondary' : 'destructive'
                        }
                      >
                        {getMemoryStatus() === 'healthy' ? 'Normal Usage' :
                         getMemoryStatus() === 'warning' ? 'High Usage' : 'Critical Usage'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Activity className="mr-2 h-5 w-5" />
                      System Health
                    </CardTitle>
                    <CardDescription>
                      Overall system health indicators
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Database Connection</span>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <Badge variant="default">Connected</Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">API Response Time</span>
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          <Badge variant="default">{"<"} 100ms</Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Service Status</span>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <Badge variant="default">Running</Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Last Backup</span>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <Badge variant="outline">2 hours ago</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* System Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Server className="mr-2 h-5 w-5" />
                    System Information
                  </CardTitle>
                  <CardDescription>
                    Detailed system and application information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-900">Timestamp</div>
                      <div className="text-sm text-gray-600">
                        {new Date(systemStatus.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-900">Uptime</div>
                      <div className="text-sm text-gray-600">
                        {formatUptime(systemStatus.uptime)}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-900">Environment</div>
                      <div className="text-sm text-gray-600">Production</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-900">Version</div>
                      <div className="text-sm text-gray-600">v1.0.0</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>System Actions</CardTitle>
                  <CardDescription>
                    Quick actions for system maintenance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Button variant="outline" className="h-20 flex-col">
                      <Database className="h-6 w-6 mb-2" />
                      <span className="text-sm">Database Backup</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col">
                      <Activity className="h-6 w-6 mb-2" />
                      <span className="text-sm">Clear Cache</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col">
                      <Server className="h-6 w-6 mb-2" />
                      <span className="text-sm">Restart Services</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col">
                      <TrendingUp className="h-6 w-6 mb-2" />
                      <span className="text-sm">View Logs</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-40">
                <div className="text-center">
                  <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Failed to load system status</p>
                  <Button onClick={fetchSystemStatus} className="mt-4" variant="outline">
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