import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  EyeOff, 
  Save,
  RotateCcw,
  Mail,
  Building,
  CreditCard,
  Camera,
  User,
  Phone,
  MapPin,
  Clock
} from 'lucide-react';
import { apiService, type LocationSettings } from '../../services/apiService';

interface FormBuilderProps {
  locationId?: number;
  onSave?: (settings: LocationSettings) => void;
}

interface FormFieldConfig {
  key: keyof LocationSettings['enabledFields'];
  label: string;
  description: string;
  icon: React.ReactNode;
}

const formFields: FormFieldConfig[] = [
  {
    key: 'email',
    label: 'Email Address',
    description: 'Visitor email address for notifications',
    icon: <Mail className="w-5 h-5 text-blue-600" />
  },
  {
    key: 'companyName',
    label: 'Company Name',
    description: 'Visitor\'s company or organization',
    icon: <Building className="w-5 h-5 text-blue-600" />
  },
  {
    key: 'idProof',
    label: 'ID Proof',
    description: 'ID type and number verification',
    icon: <CreditCard className="w-5 h-5 text-blue-600" />
  },
  {
    key: 'photo',
    label: 'Photo Capture',
    description: 'Visitor photo for identification',
    icon: <Camera className="w-5 h-5 text-blue-600" />
  }
];

const alwaysRequiredFields = [
  { label: 'Full Name', icon: <User className="w-5 h-5 text-blue-600" />, description: 'Always required for identification' },
  { label: 'Phone Number', icon: <Phone className="w-5 h-5 text-blue-600" />, description: 'Always required for contact' },
  { label: 'Purpose of Visit', icon: <MapPin className="w-5 h-5 text-blue-600" />, description: 'Always required for tracking' },
  { label: 'Whom to Meet', icon: <User className="w-5 h-5 text-blue-600" />, description: 'Always required for notifications' },
  { label: 'Date & Time', icon: <Clock className="w-5 h-5 text-blue-600" />, description: 'Always required for scheduling' }
];

const FormBuilder: React.FC<FormBuilderProps> = ({ locationId, onSave }) => {
  const [locationSettings, setLocationSettings] = useState<LocationSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadLocationSettings();
  }, [locationId]);

  const loadLocationSettings = async () => {
    setIsLoading(true);
    try {
      const settings = await apiService.getLocationSettings(locationId);
      
      if (settings) {
        setLocationSettings(settings);
      } else {
        setLocationSettings({
          id: 0,
          locationId: locationId,
          locationName: undefined,
          purposeOfVisitOptions: ['Business Meeting', 'Interview', 'Consultation', 'Other'],
          idTypeOptions: ['Driver\'s License', 'Passport', 'National ID'],
          isPhotoMandatory: false,
          customFields: [],
          enabledFields: {
            email: false,
            companyName: false,
            idProof: false,
            photo: false
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    } catch (error) {
      setLocationSettings({
        id: 0,
        locationId: locationId,
        locationName: undefined,
        purposeOfVisitOptions: ['Business Meeting', 'Interview', 'Consultation', 'Other'],
        idTypeOptions: ['Driver\'s License', 'Passport', 'National ID'],
        isPhotoMandatory: false,
        customFields: [],
        enabledFields: {
          email: false,
          companyName: false,
          idProof: false,
          photo: false
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleField = (fieldKey: keyof LocationSettings['enabledFields']) => {
    if (!locationSettings) return;
    
    const updatedEnabledFields = {
      ...locationSettings.enabledFields,
      [fieldKey]: !locationSettings.enabledFields[fieldKey]
    };

    setLocationSettings({
      ...locationSettings,
      enabledFields: updatedEnabledFields
    });
  };

  const togglePhotoMandatory = () => {
    if (!locationSettings) return;
    
    setLocationSettings({
      ...locationSettings,
      isPhotoMandatory: !locationSettings.isPhotoMandatory
    });
  };

  const saveSettings = async () => {
    if (!locationSettings) return;
    
    setIsSaving(true);
    try {
      const response = await apiService.updateLocationSettings(locationId, {
        purposeOfVisitOptions: locationSettings.purposeOfVisitOptions,
        idTypeOptions: locationSettings.idTypeOptions,
        isPhotoMandatory: locationSettings.isPhotoMandatory,
        enabledFields: locationSettings.enabledFields,
        customFields: [] // Remove all custom fields
      });
      
      if (response) {
        // Success - update local state with server response
        setLocationSettings(response);
        onSave?.(response);
        
        // Broadcast the update to all visitor forms and other components
        window.dispatchEvent(new CustomEvent('formBuilderSettingsUpdated', { 
          detail: { 
            locationId, 
            settings: response,
            enabledFields: response.enabledFields,
            isPhotoMandatory: response.isPhotoMandatory,
            purposeOfVisitOptions: response.purposeOfVisitOptions,
            idTypeOptions: response.idTypeOptions
          } 
        }));
        
        // Show success message
        alert('Settings saved successfully!');
      } else {
        // API returned null - error case
        alert('Failed to save settings. Please try again.');
      }
    } catch (error) {
      alert('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const resetToDefaults = () => {
    if (confirm('Are you sure you want to reset to default form settings? This will enable all optional fields and reset dropdown options.')) {
      setLocationSettings(prev => prev ? {
        ...prev,
        enabledFields: {
          email: true,
          companyName: true,
          idProof: true,
          photo: true
        },
        isPhotoMandatory: false,
        purposeOfVisitOptions: ['Business Meeting', 'Interview', 'Consultation', 'Other'],
        idTypeOptions: ['Driver\'s License', 'Passport', 'National ID']
      } : null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading form settings...</span>
      </div>
    );
  }

  if (!locationSettings) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">No location settings found. Please select a location first.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Form Configuration</h2>
            <p className="text-gray-600">
              Configure visitor registration form fields and options
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={resetToDefaults}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
            <button
              onClick={saveSettings}
              disabled={isSaving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save All Settings'}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Optional Fields Configuration */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Optional Fields</h3>
          <p className="text-gray-600 text-sm mb-4">Configure which optional fields to show in the registration form.</p>
          <div className="space-y-4">
            {formFields.map((field) => (
              <div key={field.key} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {field.icon}
                    <div>
                      <p className="font-medium text-gray-900">{field.label}</p>
                      <p className="text-sm text-gray-600">{field.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Field Enabled Toggle */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Enabled:</span>
                      <button
                        onClick={() => toggleField(field.key)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          locationSettings.enabledFields[field.key] ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            locationSettings.enabledFields[field.key] ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Photo Mandatory Toggle (only for photo field) */}
                    {field.key === 'photo' && locationSettings.enabledFields.photo && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Mandatory:</span>
                        <button
                          onClick={togglePhotoMandatory}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            locationSettings.isPhotoMandatory ? 'bg-red-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              locationSettings.isPhotoMandatory ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    )}

                    {/* Status Indicator */}
                    <div className="flex items-center gap-1">
                      {locationSettings.enabledFields[field.key] ? (
                        <Eye className="w-4 h-4 text-green-600" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Configuration Summary */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-4">Current Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-green-800 mb-2">Always Required Fields:</h4>
              <ul className="text-sm text-green-700 space-y-1">
                {alwaysRequiredFields.map((field, index) => (
                  <li key={index}>• {field.label}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-green-800 mb-2">Optional Fields:</h4>
              <ul className="text-sm text-green-700 space-y-1">
                {Object.entries(locationSettings.enabledFields)
                  .filter(([_, enabled]) => enabled)
                  .map(([key, _]) => {
                    const field = formFields.find(f => f.key === key);
                    const isMandatory = key === 'photo' && locationSettings.isPhotoMandatory;
                    return (
                      <li key={key}>
                        • {field?.label} {isMandatory ? '(Mandatory)' : '(Optional)'}
                      </li>
                    );
                  })}
                {Object.values(locationSettings.enabledFields).every(v => !v) && (
                  <li>• No optional fields enabled</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormBuilder;
