import React, { createContext, useContext, useState, useEffect } from 'react';
import { RoleConfiguration } from '../types/roleTypes';
import { roleConfigurationService } from '../services/roleConfigurationService';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  extension?: string;
  role: 'reception' | 'admin' | 'staff';
  department?: string;
  staffId?: string; // Add reference to staff member if applicable
  locationId?: number;
  locationName?: string;
  roleConfigurationId?: number;
  roleConfiguration?: RoleConfiguration;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (permissionName: string) => Promise<boolean>;
  getUserRoleConfiguration: () => RoleConfiguration | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Only restore session if we have both user data AND a valid token
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        // Clear invalid data
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    } else {
      // Clear any incomplete data
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Use a relative API path so it works behind IIS reverse proxy and in HTTPS without redirects
      const apiUrls = [
        '/api/auth/login'
      ];
      for (const url of apiUrls) {
        try {
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          });

          if (response.ok) {
            const data = await response.json();
            
            // Handle both string and numeric role formats from API
            let userRole: 'reception' | 'admin' | 'staff' = 'staff';
            
            if (typeof data.user.role === 'string') {
              // API returns string role (current SimpleAPI format)
              userRole = data.user.role as 'reception' | 'admin' | 'staff';
            } else if (typeof data.user.role === 'number') {
              // Legacy numeric role mapping (if needed for other APIs)
              const roleMap: Record<number, 'reception' | 'admin' | 'staff'> = {
                1: 'reception',
                2: 'admin', 
                3: 'staff'
              };
              userRole = roleMap[data.user.role] || 'staff';
            }
            
            const apiUser: User = {
              id: data.user.id.toString(),
              name: data.user.name || `${data.user.firstName} ${data.user.lastName}`,
              email: data.user.email,
              phone: data.user.phoneNumber || data.user.phone,
              extension: data.user.extension,
              role: userRole,
              department: data.user.department,
              locationId: data.user.locationId,
              locationName: data.user.locationName,
              roleConfigurationId: data.user.roleConfigurationId
            };
            
            // Load role configuration if available
            if (apiUser.roleConfigurationId) {
              try {
                const roleConfig = await roleConfigurationService.getRoleConfigurationById(apiUser.roleConfigurationId);
                apiUser.roleConfiguration = roleConfig;
              } catch (error) {
                console.warn('Failed to load role configuration:', error);
              }
            }
            
            setUser(apiUser);
            setIsAuthenticated(true);
            localStorage.setItem('user', JSON.stringify(apiUser));
            localStorage.setItem('token', data.token);
            return true;
          }
        } catch (urlError) {
          // Continue to next URL if this one fails
        }
      }
    } catch (error) {
      // API login failed
    }

    // No fallback - API authentication only
    return false;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const hasPermission = async (permissionName: string): Promise<boolean> => {
    if (!user || !user.role) {
      return false;
    }

    try {
      // First check if we have role configuration with permissions
      if (user.roleConfiguration) {
        return user.roleConfiguration.permissions?.some(p => p.permissionName === permissionName && p.isActive) || false;
      }

      // Fallback to API check using role name
      return await roleConfigurationService.hasPermission(user.role, permissionName);
    } catch (error) {
      return false;
    }
  };

  const getUserRoleConfiguration = (): RoleConfiguration | null => {
    return user?.roleConfiguration || null;
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, hasPermission, getUserRoleConfiguration }}>
      {children}
    </AuthContext.Provider>
  );
};