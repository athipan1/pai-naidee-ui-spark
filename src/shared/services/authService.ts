// Authentication and Authorization Service
import { 
  UserRole, 
  Permission, 
  DEFAULT_ROLE_PERMISSIONS,
  type User, 
  type AuthenticationResult
} from '../types/auth';
import { SecurityAction, RiskLevel, type SecurityAuditLog } from '../types/security';

class AuthService {
  private currentUser: User | null = null;
  private authToken: string | null = null;
  private apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

  // Mock users for development - replace with real API calls
  private mockUsers: User[] = [
    {
      id: 'admin-1',
      username: 'admin',
      email: 'admin@painaidee.com',
      role: UserRole.ADMIN,
      permissions: DEFAULT_ROLE_PERMISSIONS[UserRole.ADMIN],
      createdAt: new Date('2024-01-01'),
      isActive: true
    },
    {
      id: 'editor-1', 
      username: 'editor',
      email: 'editor@painaidee.com',
      role: UserRole.EDITOR,
      permissions: DEFAULT_ROLE_PERMISSIONS[UserRole.EDITOR],
      createdAt: new Date('2024-01-01'),
      isActive: true
    },
    {
      id: 'moderator-1',
      username: 'moderator', 
      email: 'moderator@painaidee.com',
      role: UserRole.MODERATOR,
      permissions: DEFAULT_ROLE_PERMISSIONS[UserRole.MODERATOR],
      createdAt: new Date('2024-01-01'),
      isActive: true
    }
  ];

  /**
   * Initialize the auth service
   */
  async initialize(): Promise<void> {
    // Check for stored auth token
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('current_user');
    
    if (storedToken && storedUser) {
      try {
        this.authToken = storedToken;
        this.currentUser = JSON.parse(storedUser);
        
        // Validate token with server
        const isValid = await this.validateToken(storedToken);
        if (!isValid) {
          this.clearAuth();
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        this.clearAuth();
      }
    }
  }

  /**
   * Authenticate user with username/password
   */
  async login(username: string, password: string): Promise<AuthenticationResult> {
    try {
      // In development, use mock authentication
      if (import.meta.env.DEV) {
        return this.mockLogin(username, password);
      }

      const response = await fetch(`${this.apiBaseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();

      if (result.success && result.user && result.token) {
        this.currentUser = result.user;
        this.authToken = result.token;
        
        // Store auth data
        localStorage.setItem('auth_token', result.token);
        localStorage.setItem('current_user', JSON.stringify(result.user));
        
        // Log security event
        await this.logSecurityEvent(
          SecurityAction.LOGIN,
          'user',
          result.user.id,
          true,
          { loginMethod: 'password' }
        );

        return result;
      }

      return {
        success: false,
        message: result.message || 'Authentication failed'
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Network error during authentication'
      };
    }
  }

  /**
   * Mock login for development
   */
  private async mockLogin(username: string, password: string): Promise<AuthenticationResult> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const user = this.mockUsers.find(u => u.username === username);
    
    if (!user || password !== 'password') {
      await this.logSecurityEvent(
        SecurityAction.LOGIN,
        'user',
        username,
        false,
        { reason: 'invalid_credentials', loginMethod: 'password' }
      );

      return {
        success: false,
        message: 'Invalid username or password'
      };
    }

    if (!user.isActive) {
      return {
        success: false,
        message: 'Account is inactive'
      };
    }

    // Generate mock token
    const token = `mock_token_${user.id}_${Date.now()}`;
    
    this.currentUser = {
      ...user,
      lastLoginAt: new Date()
    };
    this.authToken = token;

    // Store auth data
    localStorage.setItem('auth_token', token);
    localStorage.setItem('current_user', JSON.stringify(this.currentUser));

    await this.logSecurityEvent(
      SecurityAction.LOGIN,
      'user',
      user.id,
      true,
      { loginMethod: 'password' }
    );

    return {
      success: true,
      user: this.currentUser,
      token,
      message: 'Login successful'
    };
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    if (this.currentUser) {
      await this.logSecurityEvent(
        SecurityAction.LOGOUT,
        'user',
        this.currentUser.id,
        true
      );
    }

    this.clearAuth();
  }

  /**
   * Clear authentication data
   */
  private clearAuth(): void {
    this.currentUser = null;
    this.authToken = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
  }

  /**
   * Get current authenticated user
   */
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * Get current auth token
   */
  getAuthToken(): string | null {
    return this.authToken;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.currentUser !== null && this.authToken !== null;
  }

  /**
   * Check if user has specific permission
   */
  hasPermission(permission: Permission): boolean {
    if (!this.currentUser) return false;
    return this.currentUser.permissions.includes(permission);
  }

  /**
   * Check if user has any of the specified permissions
   */
  hasAnyPermission(permissions: Permission[]): boolean {
    if (!this.currentUser) return false;
    return permissions.some(permission => this.currentUser!.permissions.includes(permission));
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: UserRole): boolean {
    if (!this.currentUser) return false;
    return this.currentUser.role === role;
  }

  /**
   * Validate auth token with server
   */
  private async validateToken(token: string): Promise<boolean> {
    try {
      if (import.meta.env.DEV) {
        // In development, just check if token format is valid
        return token.startsWith('mock_token_');
      }

      const response = await fetch(`${this.apiBaseUrl}/auth/validate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }

  /**
   * Log security event
   */
  private async logSecurityEvent(
    action: SecurityAction,
    resourceType: string,
    resourceId: string,
    success: boolean,
    details?: Record<string, any>
  ): Promise<void> {
    try {
      const auditLog: Omit<SecurityAuditLog, 'id'> = {
        userId: this.currentUser?.id || 'anonymous',
        action,
        resourceType,
        resourceId,
        timestamp: new Date(),
        ipAddress: 'unknown', // Would be populated by server
        userAgent: navigator.userAgent,
        success,
        details,
        riskLevel: this.calculateRiskLevel(action, success)
      };

      // In production, send to server
      if (!import.meta.env.DEV) {
        await fetch(`${this.apiBaseUrl}/security/audit`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.authToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(auditLog),
        });
      } else {
        console.log('Security audit log:', auditLog);
      }
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  /**
   * Calculate risk level for security events
   */
  private calculateRiskLevel(action: SecurityAction, success: boolean): RiskLevel {
    if (!success) {
      switch (action) {
        case SecurityAction.LOGIN:
          return RiskLevel.MEDIUM;
        case SecurityAction.FILE_UPLOAD:
        case SecurityAction.FILE_DELETE:
          return RiskLevel.HIGH;
        default:
          return RiskLevel.LOW;
      }
    }

    switch (action) {
      case SecurityAction.PERMISSION_CHANGE:
      case SecurityAction.ACCOUNT_LOCK:
        return RiskLevel.HIGH;
      case SecurityAction.FILE_DELETE:
        return RiskLevel.MEDIUM;
      default:
        return RiskLevel.LOW;
    }
  }
}

export const authService = new AuthService();