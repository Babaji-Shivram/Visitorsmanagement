import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { VisitorProvider } from './contexts/VisitorContext';
import { LocationProvider } from './contexts/LocationContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { StaffProvider } from './contexts/StaffContext';
import LoginPage from './components/auth/LoginPage';
import Navigation from './components/layout/Navigation';
import VisitorRegistration from './components/visitor/VisitorRegistration';
import LocationSpecificRegistration from './components/visitor/LocationSpecificRegistration';
import StaffApproval from './components/staff/StaffApproval';
import ReceptionDashboard from './components/reception/ReceptionDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import SettingsPage from './components/admin/SettingsPage';

function AppContent() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/register" element={<VisitorRegistration />} />
          <Route path="/register/:locationUrl" element={<LocationSpecificRegistration />} />
          <Route path="/register/:locationUrl" element={<LocationSpecificRegistration />} />
          <Route 
            path="/dashboard" 
            element={
              user?.role === 'reception' ? <ReceptionDashboard /> :
              user?.role === 'admin' ? <AdminDashboard /> :
              user?.role === 'staff' ? <StaffApproval /> :
              <Navigate to="/register" replace />
            } 
          />
          <Route path="/approval" element={<StaffApproval />} />
          <Route path="/reception" element={<ReceptionDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route 
            path="/settings" 
            element={
              user?.role === 'admin' ? <SettingsPage /> : <Navigate to="/dashboard" replace />
            } 
          />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <SettingsProvider>
          <StaffProvider>
            <LocationProvider>
              <VisitorProvider>
                <AppContent />
              </VisitorProvider>
            </LocationProvider>
          </StaffProvider>
        </SettingsProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;