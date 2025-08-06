import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';

export interface EmailSettings {
  smtpServer: string;
  smtpPort: number;
  enableSsl: boolean;
  username: string;
  password: string;
  fromName: string;
  fromEmail: string;
}

export interface VisitorFormSettings {
  locationId?: number;
  locationName?: string;
  purposeOfVisitOptions: string[];
  idTypeOptions: string[];
  isPhotoMandatory: boolean;
  customFields: CustomField[];
  enabledFields: {
    email: boolean;
    companyName: boolean;
    idProof: boolean;
    photo: boolean;
  };
  emailSettings?: EmailSettings;
}

export interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'select' | 'textarea' | 'checkbox' | 'date';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // For select fields
  order: number;
}

interface SettingsContextType {
  settings: VisitorFormSettings;
  updateSettings: (newSettings: Partial<VisitorFormSettings>) => void;
  addPurposeOption: (purpose: string) => void;
  removePurposeOption: (purpose: string) => void;
  addIdTypeOption: (idType: string) => void;
  removeIdTypeOption: (idType: string) => void;
  addCustomField: (field: Omit<CustomField, 'id' | 'order'>) => void;
  updateCustomField: (id: string, updates: Partial<CustomField>) => void;
  removeCustomField: (id: string) => void;
  reorderCustomFields: (fields: CustomField[]) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

// Default settings
const defaultSettings: VisitorFormSettings = {
  purposeOfVisitOptions: [
    'Business Meeting',
    'Interview',
    'Consultation',
    'Delivery',
    'Maintenance',
    'Training',
    'Casual',
    'Other'
  ],
  idTypeOptions: [
    'Driver\'s License',
    'Passport',
    'National ID',
    'Employee ID',
    'Student ID'
  ],
  isPhotoMandatory: false,
  customFields: [],
  enabledFields: {
    email: true,
    companyName: true,
    idProof: true,
    photo: true,
  },
  emailSettings: {
    smtpServer: 'smtp.office365.com',
    smtpPort: 587,
    enableSsl: true,
    username: 'notification@example.com',
    password: '********',
    fromName: 'Visitor Management System',
    fromEmail: 'notification@example.com'
  }
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<VisitorFormSettings>(defaultSettings);
  const [isUpdatingFromAPI, setIsUpdatingFromAPI] = useState(false);
  const hasInitialLoadedRef = useRef(false);

  // Get settings key based on user's location (admin sees global, others see location-specific)
  const getSettingsKey = () => {
    if (user?.role === 'admin') {
      return 'visitorFormSettings_global';
    } else if (user?.locationId) {
      return `visitorFormSettings_location_${user.locationId}`;
    }
    return 'visitorFormSettings_default';
  };

  // Load settings from API on mount or when user changes
  useEffect(() => {
    if (user) {
      loadSettingsFromAPI();
    }
  }, [user]);

  const loadSettingsFromAPI = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const locationParam = user?.role === 'admin' ? '' : `?locationId=${user?.locationId || ''}`;
      
      // Try multiple API ports similar to AuthContext
      const apiUrls = [
        'http://localhost:9524',
        'http://localhost:5000',
        'http://localhost:5001',
        'https://localhost:7000',
        'https://localhost:7001'
      ];

      for (const baseUrl of apiUrls) {
        try {
          const response = await fetch(`${baseUrl}/api/settings${locationParam}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const apiSettings = await response.json();
            setIsUpdatingFromAPI(true);
            setSettings({
              locationId: apiSettings.locationId,
              locationName: apiSettings.locationName,
              purposeOfVisitOptions: apiSettings.purposeOfVisitOptions || defaultSettings.purposeOfVisitOptions,
              idTypeOptions: apiSettings.idTypeOptions || defaultSettings.idTypeOptions,
              isPhotoMandatory: apiSettings.isPhotoMandatory || false,
              customFields: apiSettings.customFields || [],
              enabledFields: apiSettings.enabledFields || defaultSettings.enabledFields
            });
            
            // Reset the flag after a short delay
            setTimeout(() => setIsUpdatingFromAPI(false), 100);
            return; // Success, exit the loop
          }
        } catch (apiError) {
          console.log(`Failed to connect to ${baseUrl}:`, apiError);
          continue; // Try next URL
        }
      }
      
      // If all API attempts failed, fall back to defaults
      console.error('Failed to load settings from all API endpoints');
      setSettings({
        ...defaultSettings,
        locationId: user?.locationId,
        locationName: user?.locationName
      });
    } catch (error) {
      console.error('Error loading settings from API:', error);
      setSettings({
        ...defaultSettings,
        locationId: user?.locationId,
        locationName: user?.locationName
      });
    }
  };

  const saveSettingsToAPI = async (newSettings: VisitorFormSettings) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No token found, cannot save settings to API');
        return false;
      }

      const locationParam = user?.role === 'admin' ? '' : `?locationId=${user?.locationId || ''}`;
      
      // Try multiple API ports similar to loadSettingsFromAPI
      const apiUrls = [
        'http://localhost:9524',
        'http://localhost:5000',
        'http://localhost:5001',
        'https://localhost:7000',
        'https://localhost:7001'
      ];

      for (const baseUrl of apiUrls) {
        try {
          console.log(`Attempting to save settings to ${baseUrl}/api/settings${locationParam}`);
          
          const response = await fetch(`${baseUrl}/api/settings${locationParam}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              purposeOfVisitOptions: newSettings.purposeOfVisitOptions,
              idTypeOptions: newSettings.idTypeOptions,
              isPhotoMandatory: newSettings.isPhotoMandatory,
              customFields: newSettings.customFields,
              enabledFields: newSettings.enabledFields
            })
          });

          if (response.ok) {
            const updatedSettings = await response.json();
            console.log('Settings saved successfully:', updatedSettings);
            
            // Update local settings with the server response to ensure consistency
            setIsUpdatingFromAPI(true);
            setSettings(prevSettings => ({
              ...prevSettings,
              locationId: updatedSettings.locationId,
              locationName: updatedSettings.locationName,
              purposeOfVisitOptions: updatedSettings.purposeOfVisitOptions || prevSettings.purposeOfVisitOptions,
              idTypeOptions: updatedSettings.idTypeOptions || prevSettings.idTypeOptions,
              isPhotoMandatory: updatedSettings.isPhotoMandatory,
              customFields: updatedSettings.customFields || [],
              enabledFields: updatedSettings.enabledFields || prevSettings.enabledFields
            }));
            
            // Reset the flag after a short delay to allow the state update to complete
            setTimeout(() => setIsUpdatingFromAPI(false), 100);
            
            return true; // Success
          } else {
            console.error(`Failed to save settings to ${baseUrl}: ${response.status} ${response.statusText}`);
            const errorText = await response.text();
            console.error('Error response:', errorText);
          }
        } catch (apiError) {
          console.log(`Failed to save to ${baseUrl}:`, apiError);
          continue; // Try next URL
        }
      }
      
      return false; // All attempts failed
    } catch (error) {
      console.error('Error saving settings to API:', error);
      return false;
    }
  };

  // Save settings to API whenever they change (but not on initial load or API updates)
  useEffect(() => {
    // Skip if this is initial load, updating from API, or no user
    if (!user || !settings || isUpdatingFromAPI || !hasInitialLoadedRef.current) {
      if (user && settings && !hasInitialLoadedRef.current) {
        hasInitialLoadedRef.current = true; // Mark as initially loaded
      }
      return;
    }

    const saveSettings = async () => {
      const success = await saveSettingsToAPI(settings);
      if (!success) {
        console.warn('Failed to save settings to API, falling back to localStorage');
        // Fallback to localStorage
        const settingsKey = getSettingsKey();
        localStorage.setItem(settingsKey, JSON.stringify(settings));
      }
    };
    
    // Debounce the API call to avoid too many requests
    const timeoutId = setTimeout(saveSettings, 1000);
    return () => clearTimeout(timeoutId);
  }, [settings, user]); // Removed isUpdatingFromAPI from dependencies

  const updateSettings = (newSettings: Partial<VisitorFormSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const addPurposeOption = (purpose: string) => {
    if (purpose.trim() && !settings.purposeOfVisitOptions.includes(purpose.trim())) {
      setSettings(prev => ({
        ...prev,
        purposeOfVisitOptions: [...prev.purposeOfVisitOptions, purpose.trim()]
      }));
    }
  };

  const removePurposeOption = (purpose: string) => {
    setSettings(prev => ({
      ...prev,
      purposeOfVisitOptions: prev.purposeOfVisitOptions.filter(p => p !== purpose)
    }));
  };

  const addIdTypeOption = (idType: string) => {
    if (idType.trim() && !settings.idTypeOptions.includes(idType.trim())) {
      setSettings(prev => ({
        ...prev,
        idTypeOptions: [...prev.idTypeOptions, idType.trim()]
      }));
    }
  };

  const removeIdTypeOption = (idType: string) => {
    setSettings(prev => ({
      ...prev,
      idTypeOptions: prev.idTypeOptions.filter(t => t !== idType)
    }));
  };

  const addCustomField = (field: Omit<CustomField, 'id' | 'order'>) => {
    const newField: CustomField = {
      ...field,
      id: Date.now().toString(),
      order: settings.customFields.length
    };
    setSettings(prev => ({
      ...prev,
      customFields: [...prev.customFields, newField]
    }));
  };

  const updateCustomField = (id: string, updates: Partial<CustomField>) => {
    setSettings(prev => ({
      ...prev,
      customFields: prev.customFields.map(field =>
        field.id === id ? { ...field, ...updates } : field
      )
    }));
  };

  const removeCustomField = (id: string) => {
    setSettings(prev => ({
      ...prev,
      customFields: prev.customFields.filter(field => field.id !== id)
    }));
  };

  const reorderCustomFields = (fields: CustomField[]) => {
    const reorderedFields = fields.map((field, index) => ({
      ...field,
      order: index
    }));
    setSettings(prev => ({
      ...prev,
      customFields: reorderedFields
    }));
  };

  return (
    <SettingsContext.Provider value={{
      settings,
      updateSettings,
      addPurposeOption,
      removePurposeOption,
      addIdTypeOption,
      removeIdTypeOption,
      addCustomField,
      updateCustomField,
      removeCustomField,
      reorderCustomFields,
    }}>
      {children}
    </SettingsContext.Provider>
  );
};