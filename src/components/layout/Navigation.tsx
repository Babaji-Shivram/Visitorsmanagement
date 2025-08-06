import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRoleConfiguration } from '../../contexts/RoleConfigurationContext';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, Users, Shield, UserCheck, UserPlus, Settings } from 'lucide-react';

const Navigation: React.FC = () => {
  const { user, logout } = useAuth();
  const { getCurrentUserRoleConfig, hasRoute } = useRoleConfiguration();
  const location = useLocation();

  const getNavItems = () => {
    const currentRoleConfig = getCurrentUserRoleConfig();
    
    let items: any[] = [];

    // If we have role configuration, use routes from there
    if (currentRoleConfig?.routes) {
      const roleRoutes = currentRoleConfig.routes
        .filter(route => route.isActive)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map(route => ({
          path: route.routePath,
          label: route.routeLabel,
          icon: getIconForRoute(route.routePath)
        }));
      
      items.push(...roleRoutes);
    } else {
      // Fallback to hardcoded routes based on role
      items.push({ path: '/register', label: 'Register Visitor', icon: UserPlus });
      
      if (user?.role === 'reception') {
        items.push({ path: '/reception', label: 'Reception Dashboard', icon: Users });
      } else if (user?.role === 'admin') {
        items.push(
          { path: '/admin', label: 'Admin Dashboard', icon: Shield },
          { path: '/settings', label: 'Settings', icon: Settings }
        );
      } else if (user?.role === 'staff') {
        items.push({ path: '/approval', label: 'Approvals', icon: UserCheck });
      }
    }

    // Filter items based on route permissions if available
    return items.filter(item => {
      // Always allow register route
      if (item.path === '/register') return true;
      // Check if user has access to this route
      return hasRoute(item.path);
    });
  };

  const getIconForRoute = (routePath: string) => {
    const iconMap: Record<string, any> = {
      '/reception': Users,
      '/admin': Shield,
      '/approval': UserCheck,
      '/settings': Settings,
      '/register': UserPlus,
    };
    return iconMap[routePath] || Users;
  };

  const getRoleStyles = () => {
    const currentRoleConfig = getCurrentUserRoleConfig();
    
    if (currentRoleConfig?.colorClass) {
      return currentRoleConfig.colorClass;
    }
    
    // Fallback colors
    const roleColors = {
      reception: 'bg-blue-500',
      admin: 'bg-purple-500',
      staff: 'bg-green-500',
    };
    
    return user?.role ? roleColors[user.role] : 'bg-gray-500';
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg overflow-hidden">
                  <img 
                    src="/Babaji Icon.png" 
                    alt="Babaji Icon" 
                    className="w-8 h-8 object-contain"
                  />
                </div>
              </div>
              <div className="ml-3">
                <div className="text-lg font-semibold text-gray-900">Babaji Shivram</div>
              </div>
            </div>

            <div className="hidden md:flex space-x-4">
              {getNavItems().map((item) => {
                const IconComponent = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition duration-200 ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <IconComponent className="w-4 h-4 mr-2" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {user && (
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 ${getRoleStyles()} rounded-full flex items-center justify-center`}>
                  <span className="text-white text-sm font-medium">
                    {user.name ? user.name.split(' ').map(n => n[0]).join('') : 'U'}
                  </span>
                </div>
                <div className="hidden md:block">
                  <div className="text-sm font-medium text-gray-700">{user.name || 'Unknown User'}</div>
                  <div className="text-xs text-gray-500 capitalize">
                    {getCurrentUserRoleConfig()?.displayName || user.role}
                    {user.locationName && user.role !== 'admin' && (
                      <span> - {user.locationName}</span>
                    )}
                  </div>
                </div>
              </div>
            )}
            <button
              onClick={logout}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition duration-200"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;