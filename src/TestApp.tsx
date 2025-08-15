import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { StaffProvider } from './contexts/StaffContext';
import StaffDebugComponent from './components/debug/StaffDebugComponent';

// Simple test app to debug staff data loading
function SimpleTestApp() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Staff Data Test</h1>
      <StaffDebugComponent />
    </div>
  );
}

function TestApp() {
  return (
    <Router>
      <StaffProvider>
        <Routes>
          <Route path="*" element={<SimpleTestApp />} />
        </Routes>
      </StaffProvider>
    </Router>
  );
}

export default TestApp;
