import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService, type VisitorDto } from '../services/apiService';
import { useAuth } from './AuthContext';

export interface Visitor {
  id: string;
  locationId: string;
  fullName: string;
  phoneNumber: string;
  email?: string;
  companyName?: string;
  purposeOfVisit: string;
  whomToMeet: string;
  dateTime: string;
  idProofType?: string;
  idProofNumber?: string;
  photoUrl?: string;
  status: 'awaiting_approval' | 'approved' | 'rejected' | 'checked_in' | 'checked_out' | 'rescheduled';
  createdAt: string;
  updatedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  checkInTime?: string;
  checkOutTime?: string;
  notes?: string;
}

interface VisitorContextType {
  visitors: Visitor[];
  isLoading: boolean;
  addVisitor: (visitor: Omit<Visitor, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  updateVisitorStatus: (id: string, status: Visitor['status'], notes?: string) => Promise<boolean>;
  getVisitorsByDate: (date: string, locationId?: string) => Visitor[];
  getVisitorById: (id: string) => Visitor | undefined;
  checkInVisitor: (id: string) => Promise<boolean>;
  checkOutVisitor: (id: string) => Promise<boolean>;
  getStaffInfo: (staffName: string) => { name: string; phone: string; email: string; extension: string } | undefined;
  refreshVisitors: () => Promise<void>;
}

const VisitorContext = createContext<VisitorContextType | undefined>(undefined);

export const useVisitor = () => {
  const context = useContext(VisitorContext);
  if (context === undefined) {
    throw new Error('useVisitor must be used within a VisitorProvider');
  }
  return context;
};

// Convert numeric status from API to string status for frontend
const convertStatusFromApi = (status: number | string): Visitor['status'] => {
  if (typeof status === 'string') return status as Visitor['status'];
  
  switch (status) {
    case 1: return 'awaiting_approval';
    case 2: return 'approved';
    case 3: return 'rejected';
    case 4: return 'checked_in';
    case 5: return 'checked_out';
    case 6: return 'rescheduled';
    default: return 'awaiting_approval';
  }
};

// Convert API VisitorDto to local Visitor interface
const convertApiVisitorToLocal = (apiVisitor: VisitorDto): Visitor => ({
  id: apiVisitor.id.toString(),
  locationId: apiVisitor.locationId.toString(),
  fullName: apiVisitor.fullName,
  phoneNumber: apiVisitor.phoneNumber,
  email: apiVisitor.email,
  companyName: apiVisitor.companyName,
  purposeOfVisit: apiVisitor.purposeOfVisit,
  whomToMeet: apiVisitor.whomToMeet,
  dateTime: apiVisitor.dateTime,
  idProofType: apiVisitor.idProofType,
  idProofNumber: apiVisitor.idProofNumber,
  photoUrl: apiVisitor.photoUrl,
  status: convertStatusFromApi(apiVisitor.status as any), // Handle both number and string from API
  createdAt: apiVisitor.createdAt,
  updatedAt: apiVisitor.updatedAt,
  approvedBy: apiVisitor.approvedBy,
  approvedAt: apiVisitor.approvedAt,
  checkInTime: apiVisitor.checkInTime,
  checkOutTime: apiVisitor.checkOutTime,
  notes: apiVisitor.notes,
});

export const VisitorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Load visitors from API when user is authenticated
  useEffect(() => {
    if (user) {
      refreshVisitors();
    }
  }, [user]);

  const refreshVisitors = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      let apiVisitors: VisitorDto[] = [];
      
      // Admin can see all visitors from all locations
      if (user.role === 'admin') {
        apiVisitors = await apiService.getVisitors();
      } 
      // Reception and staff can only see visitors from their assigned location
      else if ((user.role === 'reception' || user.role === 'staff') && user.locationId) {
        apiVisitors = await apiService.getVisitors(user.locationId);
      }
      // Fallback: no location assigned or invalid role
      else {
        console.warn('User has no location assigned or invalid role for visitor access');
        apiVisitors = [];
      }
      
      const convertedVisitors = apiVisitors.map(convertApiVisitorToLocal);
      setVisitors(convertedVisitors);
    } catch (error) {
      console.error('Error loading visitors:', error);
      setVisitors([]);
    } finally {
      setIsLoading(false);
    }
  };

  const addVisitor = async (visitorData: Omit<Visitor, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<boolean> => {
    try {
      const registrationData = {
        locationId: parseInt(visitorData.locationId),
        fullName: visitorData.fullName,
        phoneNumber: visitorData.phoneNumber,
        email: visitorData.email,
        companyName: visitorData.companyName,
        purposeOfVisit: visitorData.purposeOfVisit,
        whomToMeet: visitorData.whomToMeet,
        dateTime: visitorData.dateTime,
        idProofType: visitorData.idProofType,
        idProofNumber: visitorData.idProofNumber,
        photoUrl: visitorData.photoUrl,
      };

      const success = await apiService.registerVisitor(registrationData);
      if (success) {
        // Refresh the visitors list to get the latest data
        await refreshVisitors();
      }
      return success;
    } catch (error) {
      console.error('Error adding visitor:', error);
      return false;
    }
  };

  const updateVisitorStatus = async (id: string, status: Visitor['status'], notes?: string): Promise<boolean> => {
    try {
      console.log(`🔄 VisitorContext: Starting status update for visitor ${id} to ${status}`);
      const success = await apiService.updateVisitorStatus(parseInt(id), status, notes);
      console.log(`📡 VisitorContext: API response for visitor ${id}:`, success);
      
      if (success) {
        console.log(`🔄 VisitorContext: Refreshing visitors after successful status update`);
        await refreshVisitors();
        console.log(`✅ VisitorContext: Visitor list refreshed`);
      } else {
        console.error(`❌ VisitorContext: Failed to update visitor ${id} status to ${status}`);
      }
      return success;
    } catch (error) {
      console.error('❌ VisitorContext: Error updating visitor status:', error);
      return false;
    }
  };

  const checkInVisitor = async (id: string): Promise<boolean> => {
    try {
      const success = await apiService.checkInVisitor(parseInt(id));
      if (success) {
        await refreshVisitors();
      }
      return success;
    } catch (error) {
      console.error('Error checking in visitor:', error);
      return false;
    }
  };

  const checkOutVisitor = async (id: string): Promise<boolean> => {
    try {
      const success = await apiService.checkOutVisitor(parseInt(id));
      if (success) {
        await refreshVisitors();
      }
      return success;
    } catch (error) {
      console.error('Error checking out visitor:', error);
      return false;
    }
  };

  const getVisitorsByDate = (date: string, locationId?: string) => {
    const targetDate = new Date(date).toDateString();
    return visitors.filter(visitor => {
      const matchesDate = new Date(visitor.dateTime).toDateString() === targetDate;
      const matchesLocation = !locationId || visitor.locationId === locationId;
      return matchesDate && matchesLocation;
    });
  };

  const getVisitorById = (id: string) => {
    return visitors.find(visitor => visitor.id === id);
  };

  // Staff directory for contact information
  const staffDirectory = [
    { name: 'Dr. Emily Watson', phone: '+1 (555) 100-1003', email: 'emily.watson@company.com', extension: '1003' },
    { name: 'David Rodriguez', phone: '+1 (555) 100-1004', email: 'david.rodriguez@company.com', extension: '1004' },
    { name: 'Lisa Thompson', phone: '+1 (555) 100-1005', email: 'lisa.thompson@company.com', extension: '1005' },
    { name: 'Michael Chen', phone: '+1 (555) 100-1006', email: 'michael.chen@company.com', extension: '1006' },
    { name: 'Sarah Johnson', phone: '+1 (555) 100-1001', email: 'sarah.johnson@company.com', extension: '1001' },
  ];

  const getStaffInfo = (staffName: string) => {
    return staffDirectory.find(staff => staff.name === staffName);
  };

  return (
    <VisitorContext.Provider value={{
      visitors,
      isLoading,
      addVisitor,
      updateVisitorStatus,
      getVisitorsByDate,
      getVisitorById,
      checkInVisitor,
      checkOutVisitor,
      getStaffInfo,
      refreshVisitors,
    }}>
      {children}
    </VisitorContext.Provider>
  );
};