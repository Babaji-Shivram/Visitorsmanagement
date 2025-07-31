import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, Users, Shield, UserCheck, UserPlus, BarChart3, Settings } from 'lucide-react';

const Navigation: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const getNavItems = () => {
    const items = [
      { path: '/register', label: 'Register Visitor', icon: UserPlus },
    ];

    if (user?.role === 'reception') {
      items.push({ path: '/reception', label: 'Reception Dashboard', icon: Users });
    } else if (user?.role === 'admin') {
      items.push(
        { path: '/admin', label: 'Admin Dashboard', icon: Shield },
        { path: '/reception', label: 'Live View', icon: Users },
        { path: '/settings', label: 'Settings', icon: Settings }
      );
    } else if (user?.role === 'staff') {
      items.push({ path: '/approval', label: 'Approvals', icon: UserCheck });
    }

    return items;
  };

  const roleColors = {
    reception: 'bg-blue-500',
    admin: 'bg-purple-500',
    staff: 'bg-green-500',
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="inline-flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg">
                  <Users className="w-5 h-5 text-white" />
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
                <div className={`w-8 h-8 ${roleColors[user.role]} rounded-full flex items-center justify-center`}>
                  <span className="text-white text-sm font-medium">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="hidden md:block">
                  <div className="text-sm font-medium text-gray-700">{user.name}</div>
                  <div className="text-xs text-gray-500 capitalize">{user.role}</div>
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