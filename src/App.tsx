import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { RoleConfigurationProvider } from './contexts/RoleConfigurationContext';
import { VisitorProvider } from './contexts/VisitorContext';
import { LocationProvider } from './contexts/LocationContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { StaffProvider } from './contexts/StaffContext';
import LoginPage from './components/auth/LoginPage';
import Navigation from './components/layout/Navigation';
import VisitorRegistration from './components/visitor/VisitorRegistration';
import LocationSpecificRegistration from './components/visitor/LocationSpecificRegistration';
import PublicVisitorRegistration from './components/visitor/PublicVisitorRegistration';
import StaffApproval from './components/staff/StaffApproval';
import ApprovalSuccess from './components/staff/ApprovalSuccess';
import ReceptionDashboard from './components/reception/ReceptionDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import SettingsPage from './components/admin/SettingsPage';

function AppContent() {
  const { user, isAuthenticated } = useAuth();
  
  console.log('🏗️ App render - isAuthenticated:', isAuthenticated, 'user:', user);

  return (
    <Routes>
      {/* Public routes - no authentication required */}
      <Route path="/visit/:locationUrl" element={<PublicVisitorRegistration />} />
      <Route path="/staff/approval-success/:id" element={<ApprovalSuccess />} />
      
      {/* Authentication route */}
      {!isAuthenticated ? (
        <>
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      ) : (
        <>
          {/* Protected routes - authentication required */}
          <Route path="/login" element={<Navigate to="/dashboard" replace />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={
            <div className="min-h-screen bg-gray-50">
              <Navigation />
              <main className="container mx-auto px-4 py-8">
                {user?.role === 'reception' ? <ReceptionDashboard /> :
                 user?.role === 'admin' ? <AdminDashboard /> :
                 user?.role === 'staff' ? <StaffApproval /> :
                 <Navigate to="/register" replace />}
              </main>
            </div>
          } />
          <Route path="/register" element={
            <div className="min-h-screen bg-gray-50">
              <Navigation />
              <main className="container mx-auto px-4 py-8">
                <VisitorRegistration />
              </main>
            </div>
          } />
          <Route path="/register/:locationUrl" element={
            <div className="min-h-screen bg-gray-50">
              <Navigation />
              <main className="container mx-auto px-4 py-8">
                <LocationSpecificRegistration />
              </main>
            </div>
          } />
          <Route path="/approval" element={
            <div className="min-h-screen bg-gray-50">
              <Navigation />
              <main className="container mx-auto px-4 py-8">
                <StaffApproval />
              </main>
            </div>
          } />
          <Route path="/reception" element={
            <div className="min-h-screen bg-gray-50">
              <Navigation />
              <main className="container mx-auto px-4 py-8">
                <ReceptionDashboard />
              </main>
            </div>
          } />
          <Route path="/admin" element={
            <div className="min-h-screen bg-gray-50">
              <Navigation />
              <main className="container mx-auto px-4 py-8">
                <AdminDashboard />
              </main>
            </div>
          } />
          <Route path="/settings" element={
            user?.role === 'admin' ? 
            <div className="min-h-screen bg-gray-50">
              <Navigation />
              <main className="container mx-auto px-4 py-8">
                <SettingsPage />
              </main>
            </div> : 
            <Navigate to="/dashboard" replace />
          } />
          <Route path="/staff/approval-success/:id" element={<ApprovalSuccess />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </>
      )}
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <RoleConfigurationProvider>
          <SettingsProvider>
            <StaffProvider>
              <LocationProvider>
                <VisitorProvider>
                  <AppContent />
                </VisitorProvider>
              </LocationProvider>
            </StaffProvider>
          </SettingsProvider>
        </RoleConfigurationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;