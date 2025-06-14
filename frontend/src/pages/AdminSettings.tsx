import { useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/AdminSidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { adminService, type SystemSettings } from '@/lib/services/adminService';
import { useToast } from '@/components/ui/use-toast';
import {
  Settings,
  Save,
  RefreshCw,
  Shield,
  Users,
  Clock,
  Database
} from 'lucide-react';

export default function AdminSettings() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await adminService.getSystemSettings();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveSettings = async () => {
    if (!settings) return;
    
    try {
      setSaving(true);
      await adminService.updateSystemSettings(settings);
      toast({
        title: "Success",
        description: "Settings updated successfully",
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = <K extends keyof SystemSettings>(key: K, value: SystemSettings[K]) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
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
                      System Settings
                    </h1>
                    <p className="text-gray-600 text-sm">Configure system-wide settings and preferences</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button onClick={fetchSettings} variant="outline" size="sm" disabled={loading} className="border-teal-200 text-teal-600 hover:bg-teal-50">
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  <Button onClick={handleSaveSettings} disabled={!settings || saving} size="sm">
                    <Save className={`w-4 h-4 mr-2 ${saving ? 'animate-spin' : ''}`} />
                    Save Changes
                  </Button>
                </div>
              </div>
            </header>
            
            <div className="p-6">
              {/* Welcome Section */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  System Settings ⚙️
                </h1>
                <p className="text-gray-600">Configure and customize your FiliUp system settings.</p>
              </div>

          {loading ? (
            <div className="space-y-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="animate-pulse bg-gray-200 h-6 w-48 rounded"></div>
                    <div className="animate-pulse bg-gray-200 h-4 w-96 rounded"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="animate-pulse bg-gray-200 h-10 w-full rounded"></div>
                      <div className="animate-pulse bg-gray-200 h-10 w-full rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : settings ? (
            <div className="space-y-6">
              {/* User Management Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="mr-2 h-5 w-5" />
                    User Management
                  </CardTitle>
                  <CardDescription>
                    Configure user registration and management settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="maxUsersPerClass">Maximum Users per Class</Label>
                    <Input
                      id="maxUsersPerClass"
                      type="number"
                      value={settings.maxUsersPerClass}
                      onChange={(e) => updateSetting('maxUsersPerClass', parseInt(e.target.value) || 0)}
                      min="1"
                      max="100"
                    />
                    <p className="text-sm text-muted-foreground">
                      Maximum number of students that can be enrolled in a single class
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="defaultUserRole">Default User Role</Label>
                    <Select 
                      value={settings.defaultUserRole} 
                      onValueChange={(value) => updateSetting('defaultUserRole', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="STUDENT">Student</SelectItem>
                        <SelectItem value="TEACHER">Teacher</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      Default role assigned to new users during registration
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enableRegistration"
                      checked={settings.enableRegistration}
                      onCheckedChange={(checked) => updateSetting('enableRegistration', checked)}
                    />
                    <Label htmlFor="enableRegistration">Enable User Registration</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Allow new users to register for accounts
                  </p>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enableGuestAccess"
                      checked={settings.enableGuestAccess}
                      onCheckedChange={(checked) => updateSetting('enableGuestAccess', checked)}
                    />
                    <Label htmlFor="enableGuestAccess">Enable Guest Access</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Allow users to access certain features without logging in
                  </p>
                </CardContent>
              </Card>

              {/* Session Management */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="mr-2 h-5 w-5" />
                    Session Management
                  </CardTitle>
                  <CardDescription>
                    Configure user session and authentication settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={settings.sessionTimeoutMinutes}
                      onChange={(e) => updateSetting('sessionTimeoutMinutes', parseInt(e.target.value) || 0)}
                      min="5"
                      max="1440"
                    />
                    <p className="text-sm text-muted-foreground">
                      How long user sessions remain active without activity (5-1440 minutes)
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Security Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="mr-2 h-5 w-5" />
                    Security Settings
                  </CardTitle>
                  <CardDescription>
                    Configure security and access control settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Password Policy</Label>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p>• Minimum 8 characters</p>
                        <p>• At least one uppercase letter</p>
                        <p>• At least one number</p>
                        <p>• At least one special character</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Account Lockout</Label>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p>• Lock after 5 failed attempts</p>
                        <p>• Lockout duration: 30 minutes</p>
                        <p>• Email notification on lockout</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* System Maintenance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Database className="mr-2 h-5 w-5" />
                    System Maintenance
                  </CardTitle>
                  <CardDescription>
                    System maintenance and backup settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Backup Schedule</Label>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p>• Daily database backup at 2:00 AM</p>
                        <p>• Weekly full system backup</p>
                        <p>• Retention: 30 days</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Log Retention</Label>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p>• Application logs: 90 days</p>
                        <p>• Access logs: 30 days</p>
                        <p>• Error logs: 180 days</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>System Actions</CardTitle>
                  <CardDescription>
                    Quick actions for system maintenance and management
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Button variant="outline" className="h-20 flex-col">
                      <Database className="h-6 w-6 mb-2" />
                      <span className="text-sm">Backup Now</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col">
                      <RefreshCw className="h-6 w-6 mb-2" />
                      <span className="text-sm">Clear Cache</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col">
                      <Settings className="h-6 w-6 mb-2" />
                      <span className="text-sm">Restart Services</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col">
                      <Shield className="h-6 w-6 mb-2" />
                      <span className="text-sm">Security Scan</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-40">
                <div className="text-center">
                  <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Failed to load settings</p>
                  <Button onClick={fetchSettings} className="mt-4" variant="outline">
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