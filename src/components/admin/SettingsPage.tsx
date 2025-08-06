import React, { useState } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from '../../contexts/LocationContext';
import EmailTester from './EmailTester';
import { 
  Settings, 
  Plus, 
  X, 
  Save, 
  Eye, 
  EyeOff, 
  GripVertical,
  Edit,
  Trash2,
  Camera,
  FileText,
  CheckSquare,
  Calendar,
  List,
  Type,
  MapPin,
  Building,
  Users,
  Mail,
  Phone,
  CreditCard
} from 'lucide-react';

const SettingsPage: React.FC = () => {
  const { 
    settings, 
    updateSettings, 
    addPurposeOption, 
    removePurposeOption,
    addIdTypeOption,
    removeIdTypeOption,
    addCustomField,
    updateCustomField,
    removeCustomField
  } = useSettings();
  const { user } = useAuth();
  const { locations } = useLocation();

  const [activeTab, setActiveTab] = useState<'general' | 'fields' | 'custom' | 'email'>('general');
  const [selectedLocationId, setSelectedLocationId] = useState<string>('');
  const [newPurpose, setNewPurpose] = useState('');
  const [newIdType, setNewIdType] = useState('');
  const [showCustomFieldForm, setShowCustomFieldForm] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [customFieldForm, setCustomFieldForm] = useState({
    name: '',
    type: 'text' as 'text' | 'select' | 'textarea' | 'checkbox' | 'date',
    label: '',
    placeholder: '',
    required: false,
    options: ['']
  });

  const handleSaveSettings = () => {
    // Settings are automatically saved via context
    alert('Settings saved successfully!');
  };

  const handleAddPurpose = () => {
    if (newPurpose.trim()) {
      addPurposeOption(newPurpose);
      setNewPurpose('');
    }
  };

  const handleAddIdType = () => {
    if (newIdType.trim()) {
      addIdTypeOption(newIdType);
      setNewIdType('');
    }
  };

  const handleCustomFieldSubmit = () => {
    if (customFieldForm.name && customFieldForm.label) {
      const fieldData = {
        ...customFieldForm,
        options: customFieldForm.type === 'select' ? customFieldForm.options.filter(o => o.trim()) : undefined
      };

      if (editingField) {
        updateCustomField(editingField, fieldData);
        setEditingField(null);
      } else {
        addCustomField(fieldData);
      }

      setCustomFieldForm({
        name: '',
        type: 'text' as 'text' | 'select' | 'textarea' | 'checkbox' | 'date',
        label: '',
        placeholder: '',
        required: false,
        options: ['']
      });
      setShowCustomFieldForm(false);
    }
  };

  const handleEditCustomField = (field: any) => {
    setCustomFieldForm({
      name: field.name,
      type: field.type,
      label: field.label,
      placeholder: field.placeholder || '',
      required: field.required,
      options: field.options || ['']
    });
    setEditingField(field.id);
    setShowCustomFieldForm(true);
  };

  const addOptionToCustomField = () => {
    setCustomFieldForm(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  const updateCustomFieldOption = (index: number, value: string) => {
    setCustomFieldForm(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }));
  };

  const removeCustomFieldOption = (index: number) => {
    setCustomFieldForm(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const getFieldTypeIcon = (type: string) => {
    switch (type) {
      case 'text': return <Type className="w-4 h-4" />;
      case 'select': return <List className="w-4 h-4" />;
      case 'textarea': return <FileText className="w-4 h-4" />;
      case 'checkbox': return <CheckSquare className="w-4 h-4" />;
      case 'date': return <Calendar className="w-4 h-4" />;
      default: return <Type className="w-4 h-4" />;
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
                  <span>Configure visitor registration form and options</span>
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
              <button
                onClick={handleSaveSettings}
                className="flex items-center px-4 py-2 bg-[#EB6E38] hover:bg-[#d85a2a] text-white rounded-lg transition duration-200"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-8">
            <button
              onClick={() => setActiveTab('general')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition duration-200 ${
                activeTab === 'general'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              General Settings
            </button>
            <button
              onClick={() => setActiveTab('fields')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition duration-200 ${
                activeTab === 'fields'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Form Fields
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition duration-200 ${
                activeTab === 'custom'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Custom Fields
            </button>
            <button
              onClick={() => setActiveTab('email')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition duration-200 ${
                activeTab === 'email'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Email Settings
            </button>
          </nav>
        </div>

        <div className="p-8">
          {activeTab === 'general' && (
            <div className="space-y-8">
              {/* Purpose of Visit Options */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Purpose of Visit Options</h3>
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <input
                      type="text"
                      value={newPurpose}
                      onChange={(e) => setNewPurpose(e.target.value)}
                      placeholder="Add new purpose option"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddPurpose()}
                    />
                    <button
                      onClick={handleAddPurpose}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition duration-200"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {settings.purposeOfVisitOptions.map((purpose) => (
                      <div key={purpose} className="flex items-center bg-white rounded-lg px-3 py-2 border border-gray-200">
                        <span className="text-sm text-gray-700">{purpose}</span>
                        <button
                          onClick={() => removePurposeOption(purpose)}
                          className="ml-2 text-gray-400 hover:text-red-500 transition duration-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ID Type Options */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">ID Type Options</h3>
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <input
                      type="text"
                      value={newIdType}
                      onChange={(e) => setNewIdType(e.target.value)}
                      placeholder="Add new ID type"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddIdType()}
                    />
                    <button
                      onClick={handleAddIdType}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition duration-200"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {settings.idTypeOptions.map((idType) => (
                      <div key={idType} className="flex items-center bg-white rounded-lg px-3 py-2 border border-gray-200">
                        <span className="text-sm text-gray-700">{idType}</span>
                        <button
                          onClick={() => removeIdTypeOption(idType)}
                          className="ml-2 text-gray-400 hover:text-red-500 transition duration-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'fields' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Form Field Configuration</h3>
                <div className="text-sm text-gray-500">
                  Control which fields appear in visitor registration forms
                </div>
              </div>

              {/* Core Fields */}
              <div>
                <h4 className="text-md font-semibold text-gray-800 mb-4">Core Information Fields</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Full Name - Always required */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Users className="w-5 h-5 text-blue-600 mr-3" />
                        <div>
                          <p className="font-medium text-gray-900">Full Name</p>
                          <p className="text-sm text-gray-600">Visitor's complete name (Required)</p>
                        </div>
                      </div>
                      <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                        Required
                      </div>
                    </div>
                  </div>

                  {/* Phone Number - Always required */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Phone className="w-5 h-5 text-blue-600 mr-3" />
                        <div>
                          <p className="font-medium text-gray-900">Phone Number</p>
                          <p className="text-sm text-gray-600">Contact number (Required)</p>
                        </div>
                      </div>
                      <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                        Required
                      </div>
                    </div>
                  </div>

                  {/* Email Field */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {settings.enabledFields.email ? (
                          <Eye className="w-5 h-5 text-green-600 mr-3" />
                        ) : (
                          <EyeOff className="w-5 h-5 text-gray-400 mr-3" />
                        )}
                        <div>
                          <p className="font-medium text-gray-900">Email Address</p>
                          <p className="text-sm text-gray-600">Visitor email address (Optional)</p>
                        </div>
                      </div>
                      <button
                        onClick={() => updateSettings({
                          enabledFields: {
                            ...settings.enabledFields,
                            email: !settings.enabledFields.email
                          }
                        })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.enabledFields.email ? 'bg-indigo-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.enabledFields.email ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Company Name Field */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {settings.enabledFields.companyName ? (
                          <Eye className="w-5 h-5 text-green-600 mr-3" />
                        ) : (
                          <EyeOff className="w-5 h-5 text-gray-400 mr-3" />
                        )}
                        <div>
                          <p className="font-medium text-gray-900">Company Name</p>
                          <p className="text-sm text-gray-600">Visitor's company or organization</p>
                        </div>
                      </div>
                      <button
                        onClick={() => updateSettings({
                          enabledFields: {
                            ...settings.enabledFields,
                            companyName: !settings.enabledFields.companyName
                          }
                        })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.enabledFields.companyName ? 'bg-indigo-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.enabledFields.companyName ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Visit Information Fields */}
              <div>
                <h4 className="text-md font-semibold text-gray-800 mb-4">Visit Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Purpose of Visit - Always required */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Building className="w-5 h-5 text-blue-600 mr-3" />
                        <div>
                          <p className="font-medium text-gray-900">Purpose of Visit</p>
                          <p className="text-sm text-gray-600">Why the visitor is here (Required)</p>
                        </div>
                      </div>
                      <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                        Required
                      </div>
                    </div>
                  </div>

                  {/* Whom to Meet - Always required */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Users className="w-5 h-5 text-blue-600 mr-3" />
                        <div>
                          <p className="font-medium text-gray-900">Whom to Meet</p>
                          <p className="text-sm text-gray-600">Staff member to visit (Required)</p>
                        </div>
                      </div>
                      <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                        Required
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security & Verification Fields */}
              <div>
                <h4 className="text-md font-semibold text-gray-800 mb-4">Security & Verification</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* ID Proof Field */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {settings.enabledFields.idProof ? (
                          <Eye className="w-5 h-5 text-green-600 mr-3" />
                        ) : (
                          <EyeOff className="w-5 h-5 text-gray-400 mr-3" />
                        )}
                        <div>
                          <p className="font-medium text-gray-900">ID Proof</p>
                          <p className="text-sm text-gray-600">ID type and number verification</p>
                        </div>
                      </div>
                      <button
                        onClick={() => updateSettings({
                          enabledFields: {
                            ...settings.enabledFields,
                            idProof: !settings.enabledFields.idProof
                          }
                        })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.enabledFields.idProof ? 'bg-indigo-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.enabledFields.idProof ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Photo Field */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {settings.enabledFields.photo ? (
                          <Eye className="w-5 h-5 text-green-600 mr-3" />
                        ) : (
                          <EyeOff className="w-5 h-5 text-gray-400 mr-3" />
                        )}
                        <div>
                          <p className="font-medium text-gray-900">Photo Capture</p>
                          <p className="text-sm text-gray-600">Visitor photo for identification</p>
                        </div>
                      </div>
                      <button
                        onClick={() => updateSettings({
                          enabledFields: {
                            ...settings.enabledFields,
                            photo: !settings.enabledFields.photo
                          }
                        })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.enabledFields.photo ? 'bg-indigo-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.enabledFields.photo ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Photo Requirements (only show if photo is enabled) */}
              {settings.enabledFields.photo && (
                <div>
                  <h4 className="text-md font-semibold text-gray-800 mb-4">Photo Settings</h4>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Camera className="w-5 h-5 text-indigo-600 mr-3" />
                        <div>
                          <p className="font-medium text-gray-900">Make Photo Mandatory</p>
                          <p className="text-sm text-gray-600">Require visitors to take a photo during registration</p>
                        </div>
                      </div>
                      <button
                        onClick={() => updateSettings({ isPhotoMandatory: !settings.isPhotoMandatory })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.isPhotoMandatory ? 'bg-indigo-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.isPhotoMandatory ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'email' && (
            <div className="px-6 py-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Settings & Testing</h3>
                  <p className="text-gray-600 mb-6">
                    Use this section to test the email notification system and configure email settings.
                    You can send test emails to verify that your email configuration is working properly.
                  </p>
                  
                  <div className="mb-8">
                    <h4 className="text-md font-medium text-gray-800 mb-2">Current Email Configuration</h4>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">SMTP Server</p>
                          <p className="font-medium">{settings.emailSettings?.smtpServer || 'Not configured'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">SMTP Port</p>
                          <p className="font-medium">{settings.emailSettings?.smtpPort || 'Not configured'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Sender Email</p>
                          <p className="font-medium">{settings.emailSettings?.fromEmail || 'Not configured'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Sender Name</p>
                          <p className="font-medium">{settings.emailSettings?.fromName || 'Not configured'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <EmailTester />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'custom' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Custom Fields</h3>
                <button
                  onClick={() => setShowCustomFieldForm(true)}
                  className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition duration-200"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Custom Field
                </button>
              </div>

              {/* Custom Field Form */}
              {showCustomFieldForm && (
                <div className="bg-gray-50 rounded-lg p-6 border-2 border-indigo-200">
                  <h4 className="text-md font-semibold text-gray-900 mb-4">
                    {editingField ? 'Edit Custom Field' : 'Add New Custom Field'}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Field Name *</label>
                      <input
                        type="text"
                        value={customFieldForm.name}
                        onChange={(e) => setCustomFieldForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., department, emergency_contact"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Field Type *</label>
                      <select
                        value={customFieldForm.type}
                        onChange={(e) => setCustomFieldForm(prev => ({ ...prev, type: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="text">Text Input</option>
                        <option value="select">Dropdown</option>
                        <option value="textarea">Text Area</option>
                        <option value="checkbox">Checkbox</option>
                        <option value="date">Date</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Display Label *</label>
                      <input
                        type="text"
                        value={customFieldForm.label}
                        onChange={(e) => setCustomFieldForm(prev => ({ ...prev, label: e.target.value }))}
                        placeholder="e.g., Department, Emergency Contact"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Placeholder</label>
                      <input
                        type="text"
                        value={customFieldForm.placeholder}
                        onChange={(e) => setCustomFieldForm(prev => ({ ...prev, placeholder: e.target.value }))}
                        placeholder="Placeholder text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {customFieldForm.type === 'select' && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
                      {customFieldForm.options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-2 mb-2">
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => updateCustomFieldOption(index, e.target.value)}
                            placeholder={`Option ${index + 1}`}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                          <button
                            onClick={() => removeCustomFieldOption(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition duration-200"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={addOptionToCustomField}
                        className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                      >
                        + Add Option
                      </button>
                    </div>
                  )}

                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      id="required"
                      checked={customFieldForm.required}
                      onChange={(e) => setCustomFieldForm(prev => ({ ...prev, required: e.target.checked }))}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="required" className="ml-2 text-sm text-gray-700">
                      Required field
                    </label>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={handleCustomFieldSubmit}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition duration-200"
                    >
                      {editingField ? 'Update Field' : 'Add Field'}
                    </button>
                    <button
                      onClick={() => {
                        setShowCustomFieldForm(false);
                        setEditingField(null);
                        setCustomFieldForm({
                          name: '',
                          type: 'text',
                          label: '',
                          placeholder: '',
                          required: false,
                          options: ['']
                        });
                      }}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Custom Fields List */}
              <div className="space-y-4">
                {settings.customFields.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No custom fields created yet</p>
                    <p className="text-sm">Add custom fields to collect additional visitor information</p>
                  </div>
                ) : (
                  settings.customFields.map((field) => (
                    <div key={field.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <GripVertical className="w-5 h-5 text-gray-400" />
                          {getFieldTypeIcon(field.type)}
                          <div>
                            <p className="font-medium text-gray-900">{field.label}</p>
                            <p className="text-sm text-gray-500">
                              {field.name} • {field.type} • {field.required ? 'Required' : 'Optional'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditCustomField(field)}
                            className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition duration-200"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeCustomField(field.id)}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition duration-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;