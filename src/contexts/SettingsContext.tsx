import React, { createContext, useContext, useState, useEffect } from 'react';

export interface VisitorFormSettings {
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
  }
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<VisitorFormSettings>(defaultSettings);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('visitorFormSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('visitorFormSettings', JSON.stringify(settings));
  }, [settings]);

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