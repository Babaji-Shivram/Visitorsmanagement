import React, { createContext, useContext, useState, useEffect } from 'react';
import { RoleConfiguration } from '../types/roleTypes';
import { roleConfigurationService } from '../services/roleConfigurationService';
import { useAuth } from './AuthContext';

interface RoleConfigurationContextType {
  roleConfigurations: RoleConfiguration[];
  loading: boolean;
  error: string | null;
  getCurrentUserRoleConfig: () => RoleConfiguration | null;
  getRoleConfigByName: (roleName: string) => RoleConfiguration | null;
  refreshRoleConfigurations: () => Promise<void>;
  hasPermission: (permissionName: string) => boolean;
  hasRoute: (routePath: string) => boolean;
}

const RoleConfigurationContext = createContext<RoleConfigurationContextType | undefined>(undefined);

export const useRoleConfiguration = () => {
  const context = useContext(RoleConfigurationContext);
  if (context === undefined) {
    throw new Error('useRoleConfiguration must be used within a RoleConfigurationProvider');
  }
  return context;
};

export const RoleConfigurationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [roleConfigurations, setRoleConfigurations] = useState<RoleConfiguration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const loadRoleConfigurations = async () => {
    try {
      setLoading(true);
      setError(null);
      const configs = await roleConfigurationService.getAllRoleConfigurations();
      setRoleConfigurations(configs);
    } catch (err) {
      console.error('Failed to load role configurations:', err);
      setError(err instanceof Error ? err.message : 'Failed to load role configurations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoleConfigurations();
  }, []);

  const getCurrentUserRoleConfig = (): RoleConfiguration | null => {
    if (!user) return null;
    
    // Try to get from user's roleConfiguration first
    if (user.roleConfiguration) {
      return user.roleConfiguration;
    }
    
    // Fallback to finding by role name
    return getRoleConfigByName(user.role);
  };

  const getRoleConfigByName = (roleName: string): RoleConfiguration | null => {
    return roleConfigurations.find(config => 
      config.roleName.toLowerCase() === roleName.toLowerCase() && config.isActive
    ) || null;
  };

  const refreshRoleConfigurations = async () => {
    await loadRoleConfigurations();
  };

  const hasPermission = (permissionName: string): boolean => {
    const currentRoleConfig = getCurrentUserRoleConfig();
    if (!currentRoleConfig) return false;
    
    return currentRoleConfig.permissions?.some(p => 
      p.permissionName === permissionName && p.isActive
    ) || false;
  };

  const hasRoute = (routePath: string): boolean => {
    const currentRoleConfig = getCurrentUserRoleConfig();
    if (!currentRoleConfig) return false;
    
    return currentRoleConfig.routes?.some(r => 
      r.routePath === routePath && r.isActive
    ) || false;
  };

  return (
    <RoleConfigurationContext.Provider value={{
      roleConfigurations,
      loading,
      error,
      getCurrentUserRoleConfig,
      getRoleConfigByName,
      refreshRoleConfigurations,
      hasPermission,
      hasRoute
    }}>
      {children}
    </RoleConfigurationContext.Provider>
  );
};
