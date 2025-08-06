import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  locationId: string;
  email: string;
  password: string;
  mobileNumber: string;
  phoneNumber: string;
  extension: string;
  designation?: string;
  role: 'admin' | 'reception' | 'staff';
  photoUrl?: string;
  isActive: boolean;
  canLogin: boolean;
  createdAt: string;
  updatedAt: string;
}

interface StaffContextType {
  staffMembers: StaffMember[];
  addStaffMember: (staff: Omit<StaffMember, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateStaffMember: (id: string, updates: Partial<StaffMember>) => Promise<void>;
  deleteStaffMember: (id: string) => Promise<void>;
  getStaffMemberById: (id: string) => StaffMember | undefined;
  getStaffMembersByLocation: (locationId: string) => StaffMember[];
  getActiveStaffMembers: () => StaffMember[];
  getStaffMemberByName: (name: string) => StaffMember | undefined;
  validateStaffLogin: (email: string, password: string) => StaffMember | null;
  resetStaffPassword: (id: string, newPassword: string) => Promise<void>;
  reloadStaffMembers: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const StaffContext = createContext<StaffContextType | undefined>(undefined);

export const useStaff = () => {
  const context = useContext(StaffContext);
  if (context === undefined) {
    throw new Error('useStaff must be used within a StaffProvider');
  }
  return context;
};

// API configuration
const API_BASE_URL = 'http://localhost:9524/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token') || '';
};

// Helper function to make API requests
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  console.log('🌐 Making API request to:', `${API_BASE_URL}${endpoint}`);
  console.log('🔑 Using token:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      ...options.headers,
    },
  });

  console.log('📡 API Response status:', response.status, response.statusText);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ API Error response:', errorText);
    throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const result = await response.json();
  console.log('✅ API Success response:', result);
  return result;
};

export const StaffProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  // Load staff members from API only
  const loadStaffMembers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('🌐 Loading staff members from API...');
      
      const data = await apiRequest('/staff');
      console.log('✅ Loaded staff members from API:', data.length, 'members');
      
      // Convert API response to our interface format
      const mappedStaff = data.map((apiStaff: any) => ({
        id: apiStaff.id.toString(),
        firstName: apiStaff.firstName,
        lastName: apiStaff.lastName,
        locationId: apiStaff.locationId.toString(),
        email: apiStaff.email,
        password: apiStaff.password || '', // API might not return password
        mobileNumber: apiStaff.mobileNumber,
        phoneNumber: apiStaff.phoneNumber,
        extension: apiStaff.extension,
        designation: apiStaff.designation,
        role: apiStaff.role || 'staff',
        photoUrl: apiStaff.photoUrl,
        isActive: apiStaff.isActive,
        canLogin: apiStaff.canLogin || false,
        createdAt: apiStaff.createdAt,
        updatedAt: apiStaff.updatedAt
      }));
      
      setStaffMembers(mappedStaff);
    } catch (err) {
      console.error('❌ Error loading staff members from API:', err);
      setError('Failed to load staff members. Please ensure you are logged in.');
      setStaffMembers([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load staff members when authenticated
  useEffect(() => {
    const token = getAuthToken();
    console.log('🔑 StaffContext useEffect - authenticated:', isAuthenticated);
    console.log('🔑 StaffContext useEffect - token available:', !!token);
    
    if (isAuthenticated && token) {
      console.log('🚀 Starting staff members load...');
      loadStaffMembers();
    } else {
      console.log('🔒 Skipping staff load - not authenticated or no token');
      setStaffMembers([]);
      setError(null); // Don't show error if just not authenticated yet
    }
  }, [isAuthenticated]);

  const addStaffMember = async (staffData: Omit<StaffMember, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('➕ Adding new staff member via API:', staffData);
      
      const apiData = {
        firstName: staffData.firstName,
        lastName: staffData.lastName,
        locationId: parseInt(staffData.locationId),
        email: staffData.email,
        mobileNumber: staffData.mobileNumber,
        phoneNumber: staffData.phoneNumber,
        extension: staffData.extension,
        designation: staffData.designation,
        password: staffData.password,
        role: staffData.role,
        canLogin: staffData.canLogin,
        photoUrl: staffData.photoUrl,
        isActive: staffData.isActive
      };
      
      await apiRequest('/staff', {
        method: 'POST',
        body: JSON.stringify(apiData),
      });
      
      console.log('✅ Staff member created via API');
      await loadStaffMembers(); // Reload list
    } catch (err) {
      console.error('❌ Error creating staff member via API:', err);
      setError('Failed to create staff member. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateStaffMember = async (id: string, updates: Partial<StaffMember>) => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('🔄 Updating staff member via API:', id, updates);
      
      const apiData = {
        firstName: updates.firstName,
        lastName: updates.lastName,
        locationId: updates.locationId ? parseInt(updates.locationId) : undefined,
        email: updates.email,
        mobileNumber: updates.mobileNumber,
        phoneNumber: updates.phoneNumber,
        extension: updates.extension,
        designation: updates.designation,
        password: updates.password,
        role: updates.role,
        canLogin: updates.canLogin,
        photoUrl: updates.photoUrl,
        isActive: updates.isActive
      };
      
      await apiRequest(`/staff/${id}`, {
        method: 'PUT',
        body: JSON.stringify(apiData),
      });
      
      console.log('✅ Staff member updated via API');
      await loadStaffMembers(); // Reload list
    } catch (err) {
      console.error('❌ Error updating staff member via API:', err);
      setError('Failed to update staff member. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteStaffMember = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('🗑️ Deleting staff member via API:', id);
      
      await apiRequest(`/staff/${id}`, {
        method: 'DELETE',
      });
      
      console.log('✅ Staff member deleted via API');
      await loadStaffMembers(); // Reload list
    } catch (err) {
      console.error('❌ Error deleting staff member via API:', err);
      setError('Failed to delete staff member. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetStaffPassword = async (id: string, newPassword: string) => {
    await updateStaffMember(id, { password: newPassword });
  };

  // Helper functions (these work with local state)
  const getStaffMemberById = (id: string) => {
    return staffMembers.find(staff => staff.id === id);
  };

  const getStaffMembersByLocation = (locationId: string) => {
    return staffMembers.filter(staff => staff.locationId === locationId);
  };

  const getActiveStaffMembers = () => {
    return staffMembers.filter(staff => staff.isActive);
  };

  const getStaffMemberByName = (name: string) => {
    return staffMembers.find(staff => 
      `${staff.firstName} ${staff.lastName}`.toLowerCase().includes(name.toLowerCase())
    );
  };

  const validateStaffLogin = (email: string, password: string) => {
    const staff = staffMembers.find(s => 
      s.email.toLowerCase() === email.toLowerCase() && 
      s.password === password && 
      s.isActive && 
      s.canLogin
    );
    return staff || null;
  };

  return (
    <StaffContext.Provider value={{
      staffMembers,
      addStaffMember,
      updateStaffMember,
      deleteStaffMember,
      getStaffMemberById,
      getStaffMembersByLocation,
      getActiveStaffMembers,
      getStaffMemberByName,
      validateStaffLogin,
      resetStaffPassword,
      reloadStaffMembers: loadStaffMembers,
      isLoading,
      error
    }}>
      {children}
    </StaffContext.Provider>
  );
};
