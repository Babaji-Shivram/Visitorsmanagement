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
    
    console.log('🔍 AuthContext useEffect - checking localStorage user:', storedUser);
    console.log('🔍 AuthContext useEffect - checking localStorage token:', storedToken ? 'Present' : 'Missing');
    
    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log('🔄 Restoring user session with valid token:', parsedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('❌ Error parsing stored user data:', error);
        // Clear invalid data
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    } else {
      console.log('❌ No valid session found - missing user data or token');
      // Clear any incomplete data
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('🔐 Login attempt:', { email, password: '***' });
    
    try {
      // Try API authentication - using our running API server
      const getApiUrls = () => {
        const serverIP = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
          ? 'localhost' 
          : window.location.hostname;
        return [`http://${serverIP}:9524/api/auth/login`];
      };
      
      const apiUrls = getApiUrls();
      
      console.log('🌐 Trying API authentication...');
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
            
            // Map numeric role to string
            const roleMap: Record<number, 'reception' | 'admin' | 'staff'> = {
              1: 'reception',
              2: 'admin', 
              3: 'staff'
            };
            
            const apiUser: User = {
              id: data.user.id,
              name: `${data.user.firstName} ${data.user.lastName}`,
              email: data.user.email,
              phone: data.user.phoneNumber,
              extension: data.user.extension,
              role: roleMap[data.user.role] || 'staff',
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
            
            console.log('✅ API authentication successful:', apiUser);
            setUser(apiUser);
            setIsAuthenticated(true);
            localStorage.setItem('user', JSON.stringify(apiUser));
            localStorage.setItem('token', data.token);
            return true;
          }
        } catch (urlError) {
          // Continue to next URL if this one fails
          console.log(`Failed to connect to ${url}:`, urlError);
        }
      }
    } catch (error) {
      console.log('API login failed:', error);
    }

    // No fallback - API authentication only
    console.log('❌ Login failed: Invalid credentials or API unavailable');
    return false;
  };

  const logout = () => {
    console.log('🚪 Logging out user:', user);
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    console.log('✅ Logout complete');
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
      console.error('Error checking permission:', error);
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