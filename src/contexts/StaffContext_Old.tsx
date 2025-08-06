import React, { createContext, useContext, useState, useEffect } from 'react';

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
const API_BASE_URL = 'http://localhost:7000/api';

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
      'Authorization': token ? `Bearer ${token}` : '',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

// Mock staff data for demonstration - starting with some sample data for development
const mockStaffMembers: StaffMember[] = [
  {
    id: 'dev-1',
    firstName: 'John',
    lastName: 'Reception',
    locationId: 'default-location',
    email: 'john@company.com',
    password: 'Welcome!23',
    mobileNumber: '+1234567890',
    phoneNumber: '+1234567890',
    extension: '1003',
    designation: 'Receptionist',
    role: 'reception',
    photoUrl: '',
    isActive: true,
    canLogin: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'dev-2',
    firstName: 'Lalit',
    lastName: 'Pachpande',
    locationId: 'default-location',
    email: 'lalit.pachpande@babajishivram.com',
    password: 'Welcome!23',
    mobileNumber: '7718810990',
    phoneNumber: '7718810990',
    extension: '1002',
    designation: 'Receptionist',
    role: 'reception',
    photoUrl: '',
    isActive: true,
    canLogin: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const StaffProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>(mockStaffMembers);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load staff members from localStorage on component mount
  useEffect(() => {
    console.log('👥 StaffContext: Loading staff from localStorage...');
    const savedStaff = localStorage.getItem('staffMembers');
    console.log('📊 Raw staff localStorage data:', savedStaff);
    
    // Debug: Log all stored data keys
    console.log('🔍 All localStorage keys:', Object.keys(localStorage));
    console.log('🔐 Staff data with passwords:', savedStaff ? JSON.parse(savedStaff).map((s: any) => ({
      name: `${s.firstName} ${s.lastName}`,
      email: s.email,
      hasPassword: !!s.password,
      passwordLength: s.password ? s.password.length : 0,
      canLogin: s.canLogin,
      isActive: s.isActive
    })) : 'No staff data');
    
    if (savedStaff) {
      try {
        const parsed = JSON.parse(savedStaff);
        
        // Quick fix: Enable login for Lalit if it's disabled
        const fixedStaff = parsed.map((staff: any) => {
          if (staff.email === 'lalit.pachpande@babajishivram.com' && staff.canLogin === false) {
            console.log('🔧 Fixing login permissions for Lalit Pachpande');
            return { ...staff, canLogin: true, updatedAt: new Date().toISOString() };
          }
          return staff;
        });
        
        console.log('✅ Loaded staff members:', fixedStaff.length, 'members');
        setStaffMembers(fixedStaff);
      } catch (error) {
        console.error('❌ Error loading staff members:', error);
        console.log('🏗️ Initializing with sample staff data for development');
        setStaffMembers(mockStaffMembers);
      }
    } else {
      console.log('📭 No saved staff members found');
      console.log('🏗️ Initializing with sample staff data for development');
      setStaffMembers(mockStaffMembers);
    }
    setIsInitialized(true);
  }, []);

  // Save staff to localStorage whenever they change (but not on initial load)
  useEffect(() => {
    if (isInitialized) {
      console.log('💾 Saving', staffMembers.length, 'staff members to localStorage');
      localStorage.setItem('staffMembers', JSON.stringify(staffMembers));
    }
  }, [staffMembers, isInitialized]);

  const addStaffMember = (staffData: Omit<StaffMember, 'id' | 'createdAt' | 'updatedAt'>) => {
    console.log('➕ Adding new staff member:', staffData);
    const newStaff: StaffMember = {
      ...staffData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    console.log('✅ Generated staff member:', newStaff);
    setStaffMembers(prev => {
      const updated = [...prev, newStaff];
      console.log('🔄 Updated staff array:', updated.length, 'members');
      return updated;
    });
  };

  const updateStaffMember = (id: string, updates: Partial<StaffMember>) => {
    setStaffMembers(prev => prev.map(staff => 
      staff.id === id 
        ? { ...staff, ...updates, updatedAt: new Date().toISOString() }
        : staff
    ));
  };

  const deleteStaffMember = (id: string) => {
    setStaffMembers(prev => prev.filter(staff => staff.id !== id));
  };

  const getStaffMemberById = (id: string) => {
    return staffMembers.find(staff => staff.id === id);
  };

  const getStaffMembersByLocation = (locationId: string) => {
    return staffMembers.filter(staff => staff.locationId === locationId && staff.isActive);
  };

  const getActiveStaffMembers = () => {
    return staffMembers.filter(staff => staff.isActive);
  };

  const getStaffMemberByName = (name: string) => {
    return staffMembers.find(staff => 
      `${staff.firstName} ${staff.lastName}` === name || 
      `Dr. ${staff.firstName} ${staff.lastName}` === name
    );
  };

  const validateStaffLogin = (email: string, password: string): StaffMember | null => {
    const staff = staffMembers.find(s => 
      s.email.toLowerCase() === email.toLowerCase() && 
      s.password === password && 
      s.isActive && 
      s.canLogin
    );
    return staff || null;
  };

  const resetStaffPassword = (id: string, newPassword: string) => {
    updateStaffMember(id, { password: newPassword });
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
    }}>
      {children}
    </StaffContext.Provider>
  );
};