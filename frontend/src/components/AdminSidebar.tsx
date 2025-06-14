import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  BookOpen, 
  Users, 
  Settings,
  Activity,
  FileText,
  Shield,
  User,
  LogOut,
  Database,
  UserCheck,
  FileBarChart,
  TrendingUp,
  AlertTriangle,
  Globe
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';

const menuItems = [
  {
    title: "Dashboard",
    url: "/admin-dashboard",
    icon: BarChart3,
  },
  {
    title: "User Management",
    url: "/admin/users",
    icon: Users,
  },
  {
    title: "Content Management",
    url: "/admin/stories",
    icon: BookOpen,
    submenu: [
      {
        title: "Class Stories",
        url: "/admin/stories",
        icon: BookOpen,
      },
      {
        title: "Common Stories",
        url: "/admin/common-stories",
        icon: Globe,
      }
    ]
  },
  {
    title: "Reports",
    url: "/admin/reports",
    icon: FileText,
  },
  {
    title: "Analytics",
    url: "/admin/analytics",
    icon: TrendingUp,
    submenu: [
      {
        title: "User Growth",
        url: "/admin/analytics/user-growth",
        icon: TrendingUp,
      },
      {
        title: "Activity",
        url: "/admin/analytics/activity",
        icon: Activity,
      }
    ]
  },
  {
    title: "System",
    url: "/admin/system",
    icon: Database,
    submenu: [
      {
        title: "System Status",
        url: "/admin/system/status",
        icon: Activity,
      },
      {
        title: "Settings",
        url: "/admin/settings",
        icon: Settings,
      }
    ]
  },
];

export function AdminSidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const isActiveRoute = (url: string) => {
    return location.pathname === url || location.pathname.startsWith(url + '/');
  };

  const renderMenuItem = (item: any, isSubmenu = false) => {
    const isActive = isActiveRoute(item.url);
    
    return (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton 
          asChild 
          className={`
            w-full justify-start px-3 py-2 rounded-lg transition-all duration-200
            ${isSubmenu ? 'ml-4 text-sm' : ''}
            ${isActive 
              ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md hover:from-teal-600 hover:to-cyan-600' 
              : 'text-gray-600 hover:bg-teal-50 hover:text-teal-700'
            }
          `}
        >
          <Link to={item.url} className="flex items-center space-x-3">
            <item.icon className="h-5 w-5" />
            <span className="font-medium">{item.title}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar className="border-r border-teal-100">
      <SidebarHeader className="p-6 border-b border-teal-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              FiliUp
            </h2>
            <p className="text-xs text-gray-500">Admin Portal</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">
            Administration
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <div key={item.title}>
                  {renderMenuItem(item)}
                  {item.submenu && (
                    <div className="ml-2 mt-1 space-y-1">
                      {item.submenu.map((subItem: any) => renderMenuItem(subItem, true))}
                    </div>
                  )}
                </div>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-teal-100">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full flex items-center justify-center text-white font-semibold text-sm">
            {user?.name?.split(' ').map(n => n[0]).join('') || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name || 'Admin User'}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email || 'admin@filiup.com'}</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start text-gray-600 hover:bg-teal-50 hover:text-teal-700"
          >
            <User className="h-4 w-4 mr-2" />
            Profile
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start text-gray-600 hover:bg-teal-50 hover:text-teal-700"
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLogout}
            className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
} 