import React, { createContext, useContext, useState, useEffect } from 'react';

export interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  locationId: string;
  email: string;
  mobileNumber: string;
  phoneNumber: string;
  extension: string;
  designation?: string;
  photoUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface StaffContextType {
  staffMembers: StaffMember[];
  addStaffMember: (staff: Omit<StaffMember, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateStaffMember: (id: string, updates: Partial<StaffMember>) => void;
  deleteStaffMember: (id: string) => void;
  getStaffMemberById: (id: string) => StaffMember | undefined;
  getStaffMembersByLocation: (locationId: string) => StaffMember[];
  getActiveStaffMembers: () => StaffMember[];
  getStaffMemberByName: (name: string) => StaffMember | undefined;
}

const StaffContext = createContext<StaffContextType | undefined>(undefined);

export const useStaff = () => {
  const context = useContext(StaffContext);
  if (context === undefined) {
    throw new Error('useStaff must be used within a StaffProvider');
  }
  return context;
};

// Mock staff data for demonstration
const mockStaffMembers: StaffMember[] = [
  {
    id: '1',
    firstName: 'Emily',
    lastName: 'Watson',
    locationId: '1',
    email: 'emily.watson@company.com',
    mobileNumber: '+1 (555) 200-1003',
    phoneNumber: '+1 (555) 100-1003',
    extension: '1003',
    designation: 'Senior Engineer',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    firstName: 'David',
    lastName: 'Rodriguez',
    locationId: '1',
    email: 'david.rodriguez@company.com',
    mobileNumber: '+1 (555) 200-1004',
    phoneNumber: '+1 (555) 100-1004',
    extension: '1004',
    designation: 'Marketing Manager',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    firstName: 'Lisa',
    lastName: 'Thompson',
    locationId: '1',
    email: 'lisa.thompson@company.com',
    mobileNumber: '+1 (555) 200-1005',
    phoneNumber: '+1 (555) 100-1005',
    extension: '1005',
    designation: 'HR Director',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    firstName: 'Michael',
    lastName: 'Chen',
    locationId: '2',
    email: 'michael.chen@company.com',
    mobileNumber: '+1 (555) 200-1006',
    phoneNumber: '+1 (555) 100-1006',
    extension: '1006',
    designation: 'Operations Manager',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '5',
    firstName: 'Sarah',
    lastName: 'Johnson',
    locationId: '1',
    email: 'sarah.johnson@company.com',
    mobileNumber: '+1 (555) 200-1001',
    phoneNumber: '+1 (555) 100-1001',
    extension: '1001',
    designation: 'Receptionist',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const StaffProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>(mockStaffMembers);

  // Load staff from localStorage on mount
  useEffect(() => {
    const savedStaff = localStorage.getItem('staffMembers');
    if (savedStaff) {
      try {
        const parsed = JSON.parse(savedStaff);
        setStaffMembers(parsed);
      } catch (error) {
        console.error('Error loading staff members:', error);
      }
    }
  }, []);

  // Save staff to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('staffMembers', JSON.stringify(staffMembers));
  }, [staffMembers]);

  const addStaffMember = (staffData: Omit<StaffMember, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newStaff: StaffMember = {
      ...staffData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setStaffMembers(prev => [...prev, newStaff]);
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
    }}>
      {children}
    </StaffContext.Provider>
  );
};