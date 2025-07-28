// Authentication Manager Component
import { useState, useEffect } from 'react';
import { User, Shield, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { authService } from '@/shared/services/authService';
import { UserRole, Permission, type User as UserType } from '@/shared/types/auth';

interface AuthenticationManagerProps {
  currentLanguage: 'th' | 'en';
  onAuthSuccess?: () => void;
}

const AuthenticationManager = ({ currentLanguage, onAuthSuccess }: AuthenticationManagerProps) => {
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Login form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState('');

  // Role management state
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.VIEWER);
  const [rolePermissions, setRolePermissions] = useState<Permission[]>([]);

  useEffect(() => {
    updateAuthState();
  }, []);

  const updateAuthState = () => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    setIsAuthenticated(authService.isAuthenticated());
  };

  const content = {
    th: {
      // Authentication
      loginTitle: 'เข้าสู่ระบบ',
      username: 'ชื่อผู้ใช้',
      password: 'รหัสผ่าน',
      login: 'เข้าสู่ระบบ',
      logout: 'ออกจากระบบ',
      showPassword: 'แสดงรหัสผ่าน',
      hidePassword: 'ซ่อนรหัสผ่าน',
      
      // User management
      userManagement: 'จัดการผู้ใช้',
      currentUser: 'ผู้ใช้ปัจจุบัน',
      userRole: 'บทบาทผู้ใช้',
      permissions: 'สิทธิ์การใช้งาน',
      roleManagement: 'จัดการบทบาท',
      
      // Status messages
      loginSuccess: 'เข้าสู่ระบบสำเร็จ',
      loginError: 'เข้าสู่ระบบล้มเหลว',
      logoutSuccess: 'ออกจากระบบสำเร็จ',
      
      // Roles
      admin: 'ผู้ดูแลระบบ',
      editor: 'บรรณาธิการ',
      moderator: 'ผู้ดูแล',
      viewer: 'ผู้ชม',
      
      // Demo credentials
      demoCredentials: 'ข้อมูลสำหรับทดสอบ',
      demoNote: 'ใช้ข้อมูลต่อไปนี้สำหรับการทดสอบ:'
    },
    en: {
      // Authentication
      loginTitle: 'Login',
      username: 'Username',
      password: 'Password',
      login: 'Login',
      logout: 'Logout',
      showPassword: 'Show password',
      hidePassword: 'Hide password',
      
      // User management
      userManagement: 'User Management',
      currentUser: 'Current User',
      userRole: 'User Role',
      permissions: 'Permissions',
      roleManagement: 'Role Management',
      
      // Status messages
      loginSuccess: 'Login successful',
      loginError: 'Login failed',
      logoutSuccess: 'Logout successful',
      
      // Roles
      admin: 'Administrator',
      editor: 'Editor',
      moderator: 'Moderator',
      viewer: 'Viewer',
      
      // Demo credentials
      demoCredentials: 'Demo Credentials',
      demoNote: 'Use the following credentials for testing:'
    }
  };

  const t = content[currentLanguage];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError('');
    setLoginSuccess('');

    try {
      const result = await authService.login(username, password);
      
      if (result.success) {
        setLoginSuccess(t.loginSuccess);
        updateAuthState();
        onAuthSuccess?.();
        setUsername('');
        setPassword('');
      } else {
        setLoginError(result.message);
      }
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    setLoginSuccess(t.logoutSuccess);
    updateAuthState();
    setUsername('');
    setPassword('');
  };

  const getRolePermissions = (role: UserRole): Permission[] => {
    switch (role) {
      case UserRole.ADMIN:
        return Object.values(Permission);
      case UserRole.EDITOR:
        return [
          Permission.PLACE_CREATE,
          Permission.PLACE_READ,
          Permission.PLACE_UPDATE,
          Permission.MEDIA_UPLOAD,
          Permission.MEDIA_READ,
          Permission.MEDIA_UPDATE,
          Permission.VERSION_CREATE,
          Permission.VERSION_READ
        ];
      case UserRole.MODERATOR:
        return [
          Permission.PLACE_READ,
          Permission.PLACE_UPDATE,
          Permission.MEDIA_READ,
          Permission.MEDIA_UPDATE,
          Permission.MEDIA_APPROVE,
          Permission.VERSION_READ
        ];
      case UserRole.VIEWER:
        return [
          Permission.PLACE_READ,
          Permission.MEDIA_READ,
          Permission.VERSION_READ
        ];
      default:
        return [];
    }
  };

  useEffect(() => {
    setRolePermissions(getRolePermissions(selectedRole));
  }, [selectedRole]);

  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              {t.loginTitle}
            </CardTitle>
            <CardDescription>
              {t.demoNote}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Demo Credentials */}
            <Alert className="mb-4">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-medium">{t.demoCredentials}:</p>
                  <p>admin/password, editor/password, moderator/password</p>
                </div>
              </AlertDescription>
            </Alert>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">{t.username}</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="admin, editor, moderator"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t.password}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    <span className="sr-only">
                      {showPassword ? t.hidePassword : t.showPassword}
                    </span>
                  </Button>
                </div>
              </div>

              {loginError && (
                <Alert variant="destructive">
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>{loginError}</AlertDescription>
                </Alert>
              )}

              {loginSuccess && (
                <Alert>
                  <CheckCircle className="w-4 h-4" />
                  <AlertDescription>{loginSuccess}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Loading...' : t.login}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="current" className="space-y-4">
        <TabsList>
          <TabsTrigger value="current">{t.currentUser}</TabsTrigger>
          <TabsTrigger value="roles">{t.roleManagement}</TabsTrigger>
        </TabsList>

        <TabsContent value="current">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                {t.currentUser}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentUser && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Username</Label>
                      <p className="text-sm mt-1">{currentUser.username}</p>
                    </div>
                    <div>
                      <Label>Email</Label>
                      <p className="text-sm mt-1">{currentUser.email}</p>
                    </div>
                    <div>
                      <Label>{t.userRole}</Label>
                      <div className="mt-1">
                        <Badge variant="secondary">{currentUser.role}</Badge>
                      </div>
                    </div>
                    <div>
                      <Label>Status</Label>
                      <div className="mt-1">
                        <Badge variant={currentUser.isActive ? "default" : "destructive"}>
                          {currentUser.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>{t.permissions}</Label>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {currentUser.permissions.map((permission) => (
                        <Badge key={permission} variant="outline" className="text-xs">
                          {permission.replace(':', '.')}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button variant="outline" onClick={handleLogout}>
                    {t.logout}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                {t.roleManagement}
              </CardTitle>
              <CardDescription>
                View permissions for different user roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>{t.userRole}</Label>
                  <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as UserRole)}>
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={UserRole.ADMIN}>{t.admin}</SelectItem>
                      <SelectItem value={UserRole.EDITOR}>{t.editor}</SelectItem>
                      <SelectItem value={UserRole.MODERATOR}>{t.moderator}</SelectItem>
                      <SelectItem value={UserRole.VIEWER}>{t.viewer}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>{t.permissions}</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {rolePermissions.map((permission) => (
                      <div key={permission} className="flex items-center gap-2 p-2 border rounded">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">{permission.replace(':', '.')}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Alert>
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>
                    Role permissions are managed by the system administrator.
                    Contact your admin to modify user roles.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AuthenticationManager;