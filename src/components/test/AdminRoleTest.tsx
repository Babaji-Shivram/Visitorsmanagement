import React, { useEffect, useState } from 'react';

const AdminRoleTest = () => {
  const [testResults, setTestResults] = useState([]);

  const addResult = (message, type = 'info') => {
    setTestResults(prev => [...prev, { message, type, timestamp: new Date().toLocaleTimeString() }]);
  };

  const testAdminFlow = async () => {
    try {
      addResult('🔍 Testing admin login and role configuration...', 'info');

      // Test login
      const loginResponse = await fetch('http://localhost:9524/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@company.com',
          password: 'Admin123!'
        })
      });

      if (!loginResponse.ok) {
        addResult('❌ Login failed', 'error');
        return;
      }

      const loginData = await loginResponse.json();
      const { user, token } = loginData;

      addResult(`✅ Login successful! Role: ${user.role}, RoleConfigurationId: ${user.roleConfigurationId}`, 'success');

      // Test role configurations
      const roleResponse = await fetch('http://localhost:9524/api/roleconfiguration', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!roleResponse.ok) {
        addResult('❌ Failed to fetch role configurations', 'error');
        return;
      }

      const roleData = await roleResponse.json();
      const adminRole = roleData.value.find(r => r.roleName === 'admin');

      if (!adminRole) {
        addResult('❌ Admin role configuration not found', 'error');
        return;
      }

      addResult(`✅ Admin role configuration found with ${adminRole.routes.length} routes`, 'success');

      const settingsRoute = adminRole.routes.find(r => r.routePath === '/settings');
      if (settingsRoute) {
        addResult(`✅ Settings route is enabled: ${settingsRoute.routeLabel}`, 'success');
      } else {
        addResult('❌ Settings route not found in admin role', 'error');
      }

      // Simulate Navigation component logic
      const mockUser = { role: 'admin', roleConfigurationId: user.roleConfigurationId };
      const mockRoleConfig = adminRole;

      let navigationItems = [];

      if (mockRoleConfig && mockRoleConfig.routes) {
        // Use role configuration routes
        navigationItems = mockRoleConfig.routes.map(r => ({
          path: r.routePath,
          label: r.routeLabel,
          isActive: r.isActive
        }));
        addResult('✅ Using role configuration routes for navigation', 'success');
      } else {
        // Fallback to hardcoded routes
        if (mockUser.role === 'admin') {
          navigationItems = [
            { path: '/admin', label: 'Admin Dashboard' },
            { path: '/settings', label: 'Settings' }
          ];
        }
        addResult('⚠️ Using fallback hardcoded routes', 'warning');
      }

      const settingsVisible = navigationItems.some(item => item.path === '/settings' && item.isActive !== false);
      addResult(`🎯 Settings menu visible: ${settingsVisible ? 'YES' : 'NO'}`, settingsVisible ? 'success' : 'error');

      // Test hasRoute function simulation
      const hasRoute = (routePath) => {
        if (routePath === '/register') return true;
        if (!mockRoleConfig) return true;
        return mockRoleConfig.routes.some(r => r.routePath === routePath && r.isActive);
      };

      const hasSettingsRoute = hasRoute('/settings');
      addResult(`🔍 hasRoute('/settings'): ${hasSettingsRoute}`, hasSettingsRoute ? 'success' : 'error');

    } catch (error) {
      addResult(`❌ Test error: ${error.message}`, 'error');
    }
  };

  useEffect(() => {
    testAdminFlow();
  }, []);

  const getResultStyle = (type) => {
    const baseStyle = { padding: '8px', margin: '4px 0', borderRadius: '4px', fontSize: '14px' };
    switch (type) {
      case 'success': return { ...baseStyle, backgroundColor: '#d4edda', color: '#155724' };
      case 'error': return { ...baseStyle, backgroundColor: '#f8d7da', color: '#721c24' };
      case 'warning': return { ...baseStyle, backgroundColor: '#fff3cd', color: '#856404' };
      default: return { ...baseStyle, backgroundColor: '#d1ecf1', color: '#0c5460' };
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Admin Role Configuration Test Results</h2>
      <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px' }}>
        {testResults.map((result, index) => (
          <div key={index} style={getResultStyle(result.type)}>
            <span style={{ fontSize: '12px', opacity: 0.7 }}>[{result.timestamp}]</span> {result.message}
          </div>
        ))}
      </div>
      <button 
        onClick={() => { setTestResults([]); testAdminFlow(); }}
        style={{ marginTop: '10px', padding: '10px 20px', cursor: 'pointer' }}
      >
        Run Test Again
      </button>
    </div>
  );
};

export default AdminRoleTest;
