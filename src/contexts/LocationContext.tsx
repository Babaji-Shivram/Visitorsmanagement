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
  addLocation: (location: Omit<Location, 'id' | 'registrationUrl' | 'qrCodeUrl' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateLocation: (id: string, updates: Partial<Location>) => Promise<void>;
  deleteLocation: (id: string) => Promise<void>;
  getLocationById: (id: string) => Location | undefined;
  getLocationByUrl: (url: string) => Location | undefined;
  isLoading: boolean;
  error: string | null;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

// API configuration
const API_BASE_URL = '/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token') || '';
};

// Helper function to make API requests
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load locations from API only
  const loadLocations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('🌐 Loading locations from API...');
      
      const data = await apiRequest('/locations');
      console.log('✅ Loaded locations from API:', data.length, 'locations');
      
      // Convert API response to our interface format
      const mappedLocations = data.map((apiLocation: any) => ({
        id: apiLocation.id.toString(),
        name: apiLocation.name,
        address: apiLocation.address,
        description: apiLocation.description,
        isActive: apiLocation.isActive,
        registrationUrl: apiLocation.registrationUrl,
        qrCodeUrl: apiLocation.qrCodeUrl,
        createdAt: apiLocation.createdAt,
        updatedAt: apiLocation.updatedAt
      }));
      
      setLocations(mappedLocations);
    } catch (err) {
      console.error('❌ Error loading locations from API:', err);
      setError('Failed to load locations. Please ensure you are logged in.');
      setLocations([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load locations on mount
  useEffect(() => {
    loadLocations();
  }, []);

  const addLocation = async (locationData: Omit<Location, 'id' | 'registrationUrl' | 'qrCodeUrl' | 'createdAt' | 'updatedAt'>) => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('➕ Adding new location via API:', locationData.name);
      
      // API data format
      const apiData = {
        name: locationData.name,
        address: locationData.address,
        description: locationData.description,
        isActive: locationData.isActive
      };
      
      await apiRequest('/locations', {
        method: 'POST',
        body: JSON.stringify(apiData),
      });
      
      console.log('✅ Location created via API');
      await loadLocations(); // Reload list
    } catch (err) {
      console.error('❌ Error creating location via API:', err);
      setError('Failed to create location. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateLocation = async (id: string, updates: Partial<Location>) => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('✏️ Updating location via API:', id);
      
      // API data format
      const apiData = {
        name: updates.name,
        address: updates.address,
        description: updates.description,
        isActive: updates.isActive
      };
      
      await apiRequest(`/locations/${id}`, {
        method: 'PUT',
        body: JSON.stringify(apiData),
      });
      
      console.log('✅ Location updated via API');
      await loadLocations(); // Reload list  
    } catch (err) {
      console.error('❌ Error updating location via API:', err);
      setError('Failed to update location. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteLocation = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('🗑️ Deleting location via API:', id);
      
      // Convert string ID to number for API
      const numericId = parseInt(id, 10);
      if (isNaN(numericId)) {
        throw new Error('Invalid location ID');
      }
      
      await apiRequest(`/locations/${numericId}`, {
        method: 'DELETE',
      });
      
      console.log('✅ Location deleted via API');
      await loadLocations(); // Reload list
    } catch (err) {
      console.error('❌ Error deleting location via API:', err);
      setError('Failed to delete location. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions (these work with local state)
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
      isLoading,
      error
    }}>
      {children}
    </LocationContext.Provider>
  );
};
