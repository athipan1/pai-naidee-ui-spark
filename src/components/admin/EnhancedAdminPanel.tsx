// Enhanced Admin Panel with new management features
import { useState, useEffect } from 'react';
import { ArrowLeft, Shield, History, Activity, TestTube, Users, FileText, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

import { authService } from '@/shared/services/authService';
import { Permission } from '@/shared/types/auth';
import type { User } from '@/shared/types/auth';

// Import new components (to be created)
import AuthenticationManager from '@/components/admin/AuthenticationManager';
import VersionControlManager from '@/components/admin/VersionControlManager';
import SecurityManager from '@/components/admin/SecurityManager';
import QueueMonitor from '@/components/admin/QueueMonitor';
import TestingInterface from '@/components/admin/TestingInterface';
import SystemMonitor from '@/components/admin/SystemMonitor';
import ContentManagement from '@/components/dashboard/ContentManagement';

interface EnhancedAdminPanelProps {
  currentLanguage: 'th' | 'en';
}

const EnhancedAdminPanel = ({ currentLanguage }: EnhancedAdminPanelProps) => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    await authService.initialize();
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    setIsAuthenticated(authService.isAuthenticated());
  };

  const content = {
    th: {
      title: 'แผงควบคุมผู้ดูแลระบบขั้นสูง',
      subtitle: 'จัดการระบบข้อมูล, ความปลอดภัย, และการทดสอบ',
      backToHome: 'กลับหน้าแรก',
      
      // Tabs
      overview: 'ภาพรวม',
      authentication: 'การยืนยันตัวตน',
      versionControl: 'การจัดการเวอร์ชัน',
      security: 'ความปลอดภัย',
      queue: 'การจัดการคิว',
      testing: 'การทดสอบ',
      mediaManagement: 'จัดการสื่อ',
      systemMonitor: 'ตรวจสอบระบบ',
      
      // Overview
      systemStatus: 'สถานะระบบ',
      userRole: 'บทบาทผู้ใช้',
      permissions: 'สิทธิ์การใช้งาน',
      quickActions: 'การดำเนินการด่วน',
      
      // Status indicators
      online: 'ออนไลน์',
      offline: 'ออฟไลน์',
      maintenance: 'กำลังบำรุงรักษา'
    },
    en: {
      title: 'Enhanced Admin Control Panel',
      subtitle: 'Manage data system, security, and testing capabilities',
      backToHome: 'Back to Home',
      
      // Tabs
      overview: 'Overview',
      authentication: 'Authentication',
      versionControl: 'Version Control',
      security: 'Security',
      queue: 'Queue Management',
      testing: 'Testing',
      mediaManagement: 'Media Management',
      systemMonitor: 'System Monitor',
      
      // Overview
      systemStatus: 'System Status',
      userRole: 'User Role',
      permissions: 'Permissions',
      quickActions: 'Quick Actions',
      
      // Status indicators
      online: 'Online',
      offline: 'Offline',
      maintenance: 'Maintenance'
    }
  };

  const t = content[currentLanguage];

  // Check permissions for tabs
  const hasPermission = (permission: Permission) => {
    return authService.hasPermission(permission);
  };

  const getAvailableTabs = () => {
    const tabs = [
      { id: 'overview', label: t.overview, icon: Activity, permission: null },
      { id: 'mediaManagement', label: t.mediaManagement, icon: FileText, permission: Permission.MEDIA_READ },
      { id: 'authentication', label: t.authentication, icon: Users, permission: Permission.SYSTEM_ADMIN },
      { id: 'versionControl', label: t.versionControl, icon: History, permission: Permission.VERSION_READ },
      { id: 'security', label: t.security, icon: Shield, permission: Permission.SYSTEM_ADMIN },
      { id: 'queue', label: t.queue, icon: Activity, permission: Permission.SYSTEM_MONITOR },
      { id: 'testing', label: t.testing, icon: TestTube, permission: Permission.SYSTEM_TEST },
      { id: 'systemMonitor', label: t.systemMonitor, icon: Settings, permission: Permission.SYSTEM_MONITOR }
    ];

    return tabs.filter(tab => !tab.permission || hasPermission(tab.permission));
  };

  const availableTabs = getAvailableTabs();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">{t.title}</CardTitle>
            <CardDescription className="text-center">
              Please authenticate to access admin features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AuthenticationManager 
              currentLanguage={currentLanguage}
              onAuthSuccess={initializeAuth}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="flex items-center gap-2 mobile-touch-target"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">{t.backToHome}</span>
            </Button>
            
            <div className="flex items-center gap-4">
              {currentUser && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{currentUser.role}</Badge>
                  <span className="text-sm font-medium hidden md:inline">
                    {currentUser.username}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Title */}
          <div>
            <h1 className="text-3xl font-bold">{t.title}</h1>
            <p className="text-muted-foreground mt-2">{t.subtitle}</p>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 w-full">
              {availableTabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <TabsTrigger 
                    key={tab.id} 
                    value={tab.id}
                    className="flex items-center gap-2 mobile-touch-target"
                  >
                    <IconComponent className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* System Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      {t.systemStatus}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span>API Server</span>
                        <Badge variant="default">{t.online}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Queue Service</span>
                        <Badge variant="default">{t.online}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Auth Service</span>
                        <Badge variant="default">{t.online}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* User Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      {t.userRole}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {currentUser && (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Role:</span>
                          <Badge>{currentUser.role}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Permissions:</span>
                          <span className="text-sm">{currentUser.permissions.length}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      {t.quickActions}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {hasPermission(Permission.SYSTEM_TEST) && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => setActiveTab('testing')}
                        >
                          Run System Tests
                        </Button>
                      )}
                      {hasPermission(Permission.SYSTEM_MONITOR) && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => setActiveTab('queue')}
                        >
                          View Queue Status
                        </Button>
                      )}
                      {hasPermission(Permission.VERSION_READ) && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => setActiveTab('versionControl')}
                        >
                          Version History
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Media Management Tab */}
            <TabsContent value="mediaManagement">
              <ContentManagement currentLanguage={currentLanguage} />
            </TabsContent>

            {/* Authentication Tab */}
            {hasPermission(Permission.SYSTEM_ADMIN) && (
              <TabsContent value="authentication">
                <AuthenticationManager 
                  currentLanguage={currentLanguage}
                  onAuthSuccess={initializeAuth}
                />
              </TabsContent>
            )}

            {/* Version Control Tab */}
            {hasPermission(Permission.VERSION_READ) && (
              <TabsContent value="versionControl">
                <VersionControlManager currentLanguage={currentLanguage} />
              </TabsContent>
            )}

            {/* Security Tab */}
            {hasPermission(Permission.SYSTEM_ADMIN) && (
              <TabsContent value="security">
                <SecurityManager currentLanguage={currentLanguage} />
              </TabsContent>
            )}

            {/* Queue Management Tab */}
            {hasPermission(Permission.SYSTEM_MONITOR) && (
              <TabsContent value="queue">
                <QueueMonitor currentLanguage={currentLanguage} />
              </TabsContent>
            )}

            {/* Testing Tab */}
            {hasPermission(Permission.SYSTEM_TEST) && (
              <TabsContent value="testing">
                <TestingInterface currentLanguage={currentLanguage} />
              </TabsContent>
            )}

            {/* System Monitor Tab */}
            {hasPermission(Permission.SYSTEM_MONITOR) && (
              <TabsContent value="systemMonitor">
                <SystemMonitor currentLanguage={currentLanguage} />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default EnhancedAdminPanel;