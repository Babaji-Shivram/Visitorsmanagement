import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  extension?: string;
  role: 'reception' | 'admin' | 'staff';
  department?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Mock users for demonstration
const mockUsers: User[] = [
  { id: '1', name: 'Sarah Johnson', email: 'reception@company.com', phone: '+1 (555) 100-1001', extension: '1001', role: 'reception' },
  { id: '2', name: 'Michael Chen', email: 'admin@company.com', phone: '+1 (555) 100-1002', extension: '1002', role: 'admin' },
  { id: '3', name: 'Dr. Emily Watson', email: 'emily.watson@company.com', phone: '+1 (555) 100-1003', extension: '1003', role: 'staff', department: 'Engineering' },
  { id: '4', name: 'David Rodriguez', email: 'david.rodriguez@company.com', phone: '+1 (555) 100-1004', extension: '1004', role: 'staff', department: 'Marketing' },
  { id: '5', name: 'Lisa Thompson', email: 'lisa.thompson@company.com', phone: '+1 (555) 100-1005', extension: '1005', role: 'staff', department: 'HR' },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock authentication - in production, this would call your API
    const foundUser = mockUsers.find(u => u.email === email);
    if (foundUser) {
      setUser(foundUser);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};