import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Visitor {
  id: string;
  locationId: string;
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
  addVisitor: (visitor: Omit<Visitor, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => void;
  updateVisitorStatus: (id: string, status: Visitor['status'], notes?: string) => void;
  getVisitorsByDate: (date: string, locationId?: string) => Visitor[];
  getVisitorById: (id: string) => Visitor | undefined;
  checkInVisitor: (id: string) => void;
  checkOutVisitor: (id: string) => void;
  getStaffInfo: (staffName: string) => { name: string; phone: string; email: string; extension: string } | undefined;
}

const VisitorContext = createContext<VisitorContextType | undefined>(undefined);

export const useVisitor = () => {
  const context = useContext(VisitorContext);
  if (context === undefined) {
    throw new Error('useVisitor must be used within a VisitorProvider');
  }
  return context;
};

// Mock data for demonstration
const mockVisitors: Visitor[] = [
  {
    id: '1',
    locationId: '1',
    fullName: 'John Smith',
    phoneNumber: '+1234567890',
    email: 'john.smith@example.com',
    companyName: 'Tech Solutions Inc.',
    purposeOfVisit: 'Business Meeting',
    whomToMeet: 'Dr. Emily Watson',
    dateTime: new Date().toISOString(),
    status: 'awaiting_approval',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    locationId: '1',
    fullName: 'Maria Garcia',
    phoneNumber: '+1987654321',
    email: 'maria.garcia@consultancy.com',
    companyName: 'Strategic Consultancy',
    purposeOfVisit: 'Consultation',
    whomToMeet: 'David Rodriguez',
    dateTime: new Date().toISOString(),
    status: 'approved',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
    approvedBy: 'David Rodriguez',
    approvedAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: '3',
    locationId: '2',
    fullName: 'Robert Johnson',
    phoneNumber: '+1555666777',
    email: 'robert.j@freelance.com',
    purposeOfVisit: 'Interview',
    whomToMeet: 'Lisa Thompson',
    dateTime: new Date().toISOString(),
    status: 'checked_in',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 1200000).toISOString(),
    approvedBy: 'Lisa Thompson',
    approvedAt: new Date(Date.now() - 3600000).toISOString(),
    checkInTime: new Date(Date.now() - 1200000).toISOString(),
  },
  {
    id: '4',
    locationId: '1',
    fullName: 'Sarah Wilson',
    phoneNumber: '+1444555666',
    email: 'sarah.wilson@logistics.com',
    companyName: 'Global Logistics',
    purposeOfVisit: 'Delivery',
    whomToMeet: 'Michael Chen',
    dateTime: new Date(Date.now() - 900000).toISOString(),
    status: 'approved',
    createdAt: new Date(Date.now() - 5400000).toISOString(),
    updatedAt: new Date(Date.now() - 900000).toISOString(),
    approvedBy: 'Michael Chen',
    approvedAt: new Date(Date.now() - 900000).toISOString(),
  },
  {
    id: '5',
    locationId: '1',
    fullName: 'James Brown',
    phoneNumber: '+1333444555',
    email: 'james.brown@maintenance.co',
    companyName: 'City Maintenance Co.',
    purposeOfVisit: 'Maintenance',
    whomToMeet: 'Sarah Johnson',
    dateTime: new Date(Date.now() - 1800000).toISOString(),
    status: 'checked_out',
    createdAt: new Date(Date.now() - 9000000).toISOString(),
    updatedAt: new Date(Date.now() - 600000).toISOString(),
    approvedBy: 'Sarah Johnson',
    approvedAt: new Date(Date.now() - 7200000).toISOString(),
    checkInTime: new Date(Date.now() - 5400000).toISOString(),
    checkOutTime: new Date(Date.now() - 600000).toISOString(),
  },
  {
    id: '6',
    locationId: '2',
    fullName: 'Emma Davis',
    phoneNumber: '+1222333444',
    email: 'emma.davis@training.org',
    companyName: 'Professional Training Org',
    purposeOfVisit: 'Training',
    whomToMeet: 'Dr. Emily Watson',
    dateTime: new Date(Date.now() + 3600000).toISOString(),
    status: 'awaiting_approval',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: '7',
    locationId: '1',
    fullName: 'Alex Thompson',
    phoneNumber: '+1111222333',
    email: 'alex.thompson@consulting.biz',
    companyName: 'Business Consulting',
    purposeOfVisit: 'Business Meeting',
    whomToMeet: 'David Rodriguez',
    dateTime: new Date().toISOString(),
    status: 'rejected',
    createdAt: new Date(Date.now() - 2700000).toISOString(),
    updatedAt: new Date(Date.now() - 1200000).toISOString(),
    notes: 'Visitor did not have proper identification',
  },
  {
    id: '8',
    locationId: '1',
    fullName: 'Lisa Martinez',
    phoneNumber: '+1999888777',
    email: 'lisa.martinez@vendor.com',
    companyName: 'Office Supplies Vendor',
    purposeOfVisit: 'Business Meeting',
    whomToMeet: 'Lisa Thompson',
    dateTime: new Date(Date.now() - 600000).toISOString(),
    status: 'checked_in',
    createdAt: new Date(Date.now() - 4500000).toISOString(),
    updatedAt: new Date(Date.now() - 300000).toISOString(),
    approvedBy: 'Lisa Thompson',
    approvedAt: new Date(Date.now() - 1800000).toISOString(),
    checkInTime: new Date(Date.now() - 300000).toISOString(),
  },
  {
    id: '9',
    locationId: '2',
    fullName: 'Kevin Lee',
    phoneNumber: '+1777666555',
    email: 'kevin.lee@freelancer.net',
    purposeOfVisit: 'Interview',
    whomToMeet: 'Michael Chen',
    dateTime: new Date(Date.now() - 300000).toISOString(),
    status: 'approved',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 600000).toISOString(),
    approvedBy: 'Michael Chen',
    approvedAt: new Date(Date.now() - 600000).toISOString(),
  },
  {
    id: '10',
    locationId: '1',
    fullName: 'Rachel Green',
    phoneNumber: '+1666555444',
    email: 'rachel.green@agency.com',
    companyName: 'Marketing Agency',
    purposeOfVisit: 'Consultation',
    whomToMeet: 'Sarah Johnson',
    dateTime: new Date(Date.now() + 1800000).toISOString(),
    status: 'awaiting_approval',
    createdAt: new Date(Date.now() - 900000).toISOString(),
    updatedAt: new Date(Date.now() - 900000).toISOString(),
  },
];

export const VisitorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visitors, setVisitors] = useState<Visitor[]>(mockVisitors);

  // Auto-refresh simulation
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time updates
      setVisitors(prev => [...prev]);
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const addVisitor = (visitorData: Omit<Visitor, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => {
    const newVisitor: Visitor = {
      ...visitorData,
      id: Date.now().toString(),
      status: 'awaiting_approval',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setVisitors(prev => [newVisitor, ...prev]);
    
    // Simulate Teams notification
    console.log('Teams notification sent to:', visitorData.whomToMeet);
  };

  const updateVisitorStatus = (id: string, status: Visitor['status'], notes?: string) => {
    setVisitors(prev => prev.map(visitor => 
      visitor.id === id 
        ? { 
            ...visitor, 
            status, 
            updatedAt: new Date().toISOString(),
            notes,
            ...(status === 'approved' && { approvedAt: new Date().toISOString() })
          }
        : visitor
    ));
  };

  const checkInVisitor = (id: string) => {
    setVisitors(prev => prev.map(visitor => 
      visitor.id === id 
        ? { 
            ...visitor, 
            status: 'checked_in' as const,
            checkInTime: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        : visitor
    ));
  };

  const checkOutVisitor = (id: string) => {
    setVisitors(prev => prev.map(visitor => 
      visitor.id === id 
        ? { 
            ...visitor, 
            status: 'checked_out' as const,
            checkOutTime: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        : visitor
    ));
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
      addVisitor,
      updateVisitorStatus,
      getVisitorsByDate,
      getVisitorById,
      checkInVisitor,
      checkOutVisitor,
      getStaffInfo,
      getStaffInfo,
    }}>
      {children}
    </VisitorContext.Provider>
  );
};