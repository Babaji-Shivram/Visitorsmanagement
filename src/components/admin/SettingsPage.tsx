import React, { useState, useEffect } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from '../../contexts/LocationContext';
import FormBuilder from './FormBuilder';
import { 
  Settings, 
  MapPin,
  Wrench,
  Bell,
  Shield,
  Users,
  Database,
  Mail,
  Clock,
  Save,
  RefreshCw,
  AlertCircle,
  Check,
  Eye,
  EyeOff
} from 'lucide-react';

const SettingsPage: React.FC = () => {
  const { 
    settings,
    saveAllSettings
  } = useSettings();
  const { user } = useAuth();
  const { locations } = useLocation();

  const [selectedLocationId, setSelectedLocationId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'form' | 'notifications' | 'security' | 'system'>('form');
  const [systemSettings, setSystemSettings] = useState({
    autoApprovalEnabled: false,
    maxVisitDuration: 8,
    reminderTimeBeforeVisit: 30,
    allowWalkIns: true,
    requireApprovalForAllVisits: true,
    enableSMSNotifications: true,
    enableEmailNotifications: true,
    enableCheckInReminders: true,
    dataRetentionDays: 90,
    enableAuditLogs: true
  });

  // Load settings when location changes or component mounts
  useEffect(() => {
    const loadLocationSettings = async () => {
      // TODO: Load location-specific settings from API
      // For now, use default values
    };
    
    loadLocationSettings();
  }, [selectedLocationId]);

  // Save notifications settings
  const saveNotificationSettings = async () => {
    const notificationSettings = {
      enableEmailNotifications: systemSettings.enableEmailNotifications,
      enableSMSNotifications: systemSettings.enableSMSNotifications,
      enableCheckInReminders: systemSettings.enableCheckInReminders,
      reminderTimeBeforeVisit: systemSettings.reminderTimeBeforeVisit
    };

    const success = await saveAllSettings(notificationSettings, selectedLocationId);
    if (success) {
      alert('Notification settings saved successfully!');
    } else {
      alert('Failed to save notification settings. Please try again.');
    }
  };

  // Save security settings
  const saveSecuritySettings = async () => {
    const securitySettings = {
      requireApprovalForAllVisits: systemSettings.requireApprovalForAllVisits,
      autoApprovalEnabled: systemSettings.autoApprovalEnabled,
      allowWalkIns: systemSettings.allowWalkIns,
      dataRetentionDays: systemSettings.dataRetentionDays,
      enableAuditLogs: systemSettings.enableAuditLogs
    };

    const success = await saveAllSettings(securitySettings, selectedLocationId);
    if (success) {
      alert('Security settings saved successfully!');
    } else {
      alert('Failed to save security settings. Please try again.');
    }
  };

  // Save system settings
  const saveSystemSettings = async () => {
    const systemSettingsData = {
      maxVisitDuration: systemSettings.maxVisitDuration
    };

    const success = await saveAllSettings(systemSettingsData, selectedLocationId);
    if (success) {
      alert('System settings saved successfully!');
    } else {
      alert('Failed to save system settings. Please try again.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#2d4170] to-[#3a4f7a] px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Settings className="w-8 h-8 text-white mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-white">System Settings</h1>
                <div className="flex items-center space-x-4 text-blue-100 opacity-80">
                  <span>Configure visitor management system settings</span>
                  {settings.locationName && user?.role !== 'admin' && (
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{settings.locationName}</span>
                    </div>
                  )}
                  {user?.role === 'admin' && (
                    <div className="flex items-center">
                      <Settings className="w-4 h-4 mr-1" />
                      <span>Global Settings</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Location Selector for Admin */}
              {user?.role === 'admin' && (
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-blue-100" />
                  <select
                    value={selectedLocationId}
                    onChange={(e) => setSelectedLocationId(e.target.value)}
                    className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:ring-2 focus:ring-white/30 focus:border-transparent"
                  >
                    <option value="" className="text-gray-900">All Locations (Global)</option>
                    {locations.map(location => (
                      <option key={location.id} value={location.id} className="text-gray-900">
                        {location.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-8">
            <button
              onClick={() => setActiveTab('form')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition duration-200 ${
                activeTab === 'form'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Wrench className="inline w-4 h-4 mr-2" />
              Form Configuration
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition duration-200 ${
                activeTab === 'notifications'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Bell className="inline w-4 h-4 mr-2" />
              Notifications
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition duration-200 ${
                activeTab === 'security'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Shield className="inline w-4 h-4 mr-2" />
              Security & Access
            </button>
            <button
              onClick={() => setActiveTab('system')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition duration-200 ${
                activeTab === 'system'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Database className="inline w-4 h-4 mr-2" />
              System Settings
            </button>
          </nav>
        </div>

        <div className="p-8">
          {activeTab === 'form' && (
            <div className="space-y-8">
              {/* Form Field Settings Section */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                      <Wrench className="w-6 h-6 mr-3 text-indigo-600" />
                      Form Configuration
                    </h3>
                    <p className="text-gray-600 mt-1">
                      Configure visitor registration form fields and dropdown options. All settings are saved together.
                    </p>
                  </div>
                </div>
                
                <FormBuilder 
                  locationId={selectedLocationId ? parseInt(selectedLocationId) : undefined}
                  onSave={() => {
                    // The FormBuilder already broadcasts the update via CustomEvent
                    // The SettingsContext will pick it up automatically
                    // No need to call updateSettings here to avoid conflicts
                  }}
                />
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-8">
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                      <Bell className="w-6 h-6 mr-3 text-indigo-600" />
                      Notification Settings
                    </h3>
                    <p className="text-gray-600 mt-1">
                      Configure how and when notifications are sent to staff and visitors.
                    </p>
                  </div>
                  <button
                    onClick={saveNotificationSettings}
                    className="flex items-center px-4 py-2 bg-[#EB6E38] hover:bg-[#d85a2a] text-white rounded-lg transition duration-200"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Settings
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Email Notifications */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-gray-900 flex items-center">
                      <Mail className="w-5 h-5 mr-2 text-blue-600" />
                      Email Notifications
                    </h4>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={systemSettings.enableEmailNotifications}
                          onChange={(e) => setSystemSettings(prev => ({
                            ...prev,
                            enableEmailNotifications: e.target.checked
                          }))}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">Enable email notifications</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={systemSettings.enableCheckInReminders}
                          onChange={(e) => setSystemSettings(prev => ({
                            ...prev,
                            enableCheckInReminders: e.target.checked
                          }))}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">Send check-in reminders</span>
                      </label>
                    </div>
                  </div>

                  {/* SMS Notifications */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-gray-900 flex items-center">
                      <Bell className="w-5 h-5 mr-2 text-green-600" />
                      SMS Notifications
                    </h4>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={systemSettings.enableSMSNotifications}
                          onChange={(e) => setSystemSettings(prev => ({
                            ...prev,
                            enableSMSNotifications: e.target.checked
                          }))}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">Enable SMS notifications</span>
                      </label>
                    </div>
                  </div>

                  {/* Reminder Settings */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-gray-900 flex items-center">
                      <Clock className="w-5 h-5 mr-2 text-yellow-600" />
                      Reminder Settings
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <label className="text-sm text-gray-700 min-w-fit">Reminder time before visit:</label>
                        <select
                          value={systemSettings.reminderTimeBeforeVisit}
                          onChange={(e) => setSystemSettings(prev => ({
                            ...prev,
                            reminderTimeBeforeVisit: parseInt(e.target.value)
                          }))}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="15">15 minutes</option>
                          <option value="30">30 minutes</option>
                          <option value="60">1 hour</option>
                          <option value="120">2 hours</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-8">
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                      <Shield className="w-6 h-6 mr-3 text-indigo-600" />
                      Security & Access Control
                    </h3>
                    <p className="text-gray-600 mt-1">
                      Configure security settings and access control policies.
                    </p>
                  </div>
                  <button
                    onClick={saveSecuritySettings}
                    className="flex items-center px-4 py-2 bg-[#EB6E38] hover:bg-[#d85a2a] text-white rounded-lg transition duration-200"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Settings
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Approval Settings */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-gray-900 flex items-center">
                      <Check className="w-5 h-5 mr-2 text-blue-600" />
                      Approval Settings
                    </h4>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={systemSettings.requireApprovalForAllVisits}
                          onChange={(e) => setSystemSettings(prev => ({
                            ...prev,
                            requireApprovalForAllVisits: e.target.checked
                          }))}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">Require approval for all visits</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={systemSettings.autoApprovalEnabled}
                          onChange={(e) => setSystemSettings(prev => ({
                            ...prev,
                            autoApprovalEnabled: e.target.checked
                          }))}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">Enable auto-approval for trusted visitors</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={systemSettings.allowWalkIns}
                          onChange={(e) => setSystemSettings(prev => ({
                            ...prev,
                            allowWalkIns: e.target.checked
                          }))}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">Allow walk-in visitors</span>
                      </label>
                    </div>
                  </div>

                  {/* Data Privacy */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-gray-900 flex items-center">
                      <Eye className="w-5 h-5 mr-2 text-green-600" />
                      Data Privacy
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <label className="text-sm text-gray-700 min-w-fit">Data retention period:</label>
                        <select
                          value={systemSettings.dataRetentionDays}
                          onChange={(e) => setSystemSettings(prev => ({
                            ...prev,
                            dataRetentionDays: parseInt(e.target.value)
                          }))}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="30">30 days</option>
                          <option value="90">90 days</option>
                          <option value="180">6 months</option>
                          <option value="365">1 year</option>
                        </select>
                      </div>
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={systemSettings.enableAuditLogs}
                          onChange={(e) => setSystemSettings(prev => ({
                            ...prev,
                            enableAuditLogs: e.target.checked
                          }))}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">Enable audit logs</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="space-y-8">
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                      <Database className="w-6 h-6 mr-3 text-indigo-600" />
                      System Configuration
                    </h3>
                    <p className="text-gray-600 mt-1">
                      Configure system-wide settings and operational parameters.
                    </p>
                  </div>
                  <button
                    onClick={saveSystemSettings}
                    className="flex items-center px-4 py-2 bg-[#EB6E38] hover:bg-[#d85a2a] text-white rounded-lg transition duration-200"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Settings
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Visit Duration Settings */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-gray-900 flex items-center">
                      <Clock className="w-5 h-5 mr-2 text-blue-600" />
                      Visit Duration
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <label className="text-sm text-gray-700 min-w-fit">Maximum visit duration:</label>
                        <select
                          value={systemSettings.maxVisitDuration}
                          onChange={(e) => setSystemSettings(prev => ({
                            ...prev,
                            maxVisitDuration: parseInt(e.target.value)
                          }))}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="2">2 hours</option>
                          <option value="4">4 hours</option>
                          <option value="8">8 hours</option>
                          <option value="24">24 hours</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* System Status */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-gray-900 flex items-center">
                      <AlertCircle className="w-5 h-5 mr-2 text-green-600" />
                      System Status
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                        <span className="text-sm text-green-800">Database Connection</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-green-700">Online</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                        <span className="text-sm text-green-800">API Service</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-green-700">Running</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">System Actions</h4>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => alert('Cache cleared successfully!')}
                      className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-200"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Clear Cache
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to reset all settings to defaults?')) {
                          alert('Settings reset to defaults!');
                        }
                      }}
                      className="flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition duration-200"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Reset to Defaults
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;