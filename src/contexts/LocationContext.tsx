import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Location {
  id: string;
  name: string;
  address: string;
  description?: string;
  isActive: boolean;
  registrationUrl: string;
  qrCodeUrl: string;
  createdAt: string;
  updatedAt: string;
}

interface LocationContextType {
  locations: Location[];
  addLocation: (location: Omit<Location, 'id' | 'registrationUrl' | 'qrCodeUrl' | 'createdAt' | 'updatedAt'>) => void;
  updateLocation: (id: string, updates: Partial<Location>) => void;
  deleteLocation: (id: string) => void;
  getLocationById: (id: string) => Location | undefined;
  getLocationByUrl: (url: string) => Location | undefined;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

// Mock locations for demonstration
const mockLocations: Location[] = [
  {
    id: '1',
    name: 'Main Office',
    address: '123 Business Ave, Suite 100, New York, NY 10001',
    description: 'Corporate headquarters and main reception',
    isActive: true,
    registrationUrl: 'main-office',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + encodeURIComponent(window.location.origin + '/register/main-office'),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Research Lab',
    address: '456 Innovation Dr, Building B, New York, NY 10002',
    description: 'R&D facility and testing center',
    isActive: true,
    registrationUrl: 'research-lab',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + encodeURIComponent(window.location.origin + '/register/research-lab'),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locations, setLocations] = useState<Location[]>(mockLocations);

  const generateUrlSlug = (name: string): string => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const generateQRCode = (url: string): string => {
    const fullUrl = `${window.location.origin}/register/${url}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(fullUrl)}`;
  };

  const addLocation = (locationData: Omit<Location, 'id' | 'registrationUrl' | 'qrCodeUrl' | 'createdAt' | 'updatedAt'>) => {
    const urlSlug = generateUrlSlug(locationData.name);
    const newLocation: Location = {
      ...locationData,
      id: Date.now().toString(),
      registrationUrl: urlSlug,
      qrCodeUrl: generateQRCode(urlSlug),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setLocations(prev => [...prev, newLocation]);
  };

  const updateLocation = (id: string, updates: Partial<Location>) => {
    setLocations(prev => prev.map(location => {
      if (location.id === id) {
        const updatedLocation = { ...location, ...updates, updatedAt: new Date().toISOString() };
        // Regenerate URL and QR code if name changed
        if (updates.name && updates.name !== location.name) {
          const newUrlSlug = generateUrlSlug(updates.name);
          updatedLocation.registrationUrl = newUrlSlug;
          updatedLocation.qrCodeUrl = generateQRCode(newUrlSlug);
        }
        return updatedLocation;
      }
      return location;
    }));
  };

  const deleteLocation = (id: string) => {
    setLocations(prev => prev.filter(location => location.id !== id));
  };

  const getLocationById = (id: string) => {
    return locations.find(location => location.id === id);
  };

  const getLocationByUrl = (url: string) => {
    return locations.find(location => location.registrationUrl === url);
  };

  return (
    <LocationContext.Provider value={{
      locations,
      addLocation,
      updateLocation,
      deleteLocation,
      getLocationById,
      getLocationByUrl,
    }}>
      {children}
    </LocationContext.Provider>
  );
};