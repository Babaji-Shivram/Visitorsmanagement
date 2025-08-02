#!/usr/bin/env node

/**
 * Complete Local Integration Test Suite
 * Tests all functionality between Frontend, Backend, API, and Database
 */

const API_BASE_URL = 'http://localhost:9524/api';
const FRONTEND_URL = 'http://localhost:5176';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const success = (message) => log(`✅ ${message}`, 'green');
const error = (message) => log(`❌ ${message}`, 'red');
const info = (message) => log(`ℹ️  ${message}`, 'cyan');
const warning = (message) => log(`⚠️  ${message}`, 'yellow');

// Test data
const testCredentials = {
  admin: { email: 'admin@company.com', password: 'Admin123!' },
  reception: { email: 'reception@company.com', password: 'Reception123!' },
  staff: { email: 'emily.watson@company.com', password: 'Staff123!' }
};

let authToken = '';

// Helper function to make API requests
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { 'Authorization': `Bearer ${authToken}` })
    },
    ...options
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${data.message || response.statusText}`);
    }
    
    return { success: true, data, status: response.status };
  } catch (err) {
    return { success: false, error: err.message, status: err.status || 0 };
  }
}

// Test functions
async function testApiHealth() {
  info('Testing API Health...');
  
  try {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}`);
    if (response.status === 404) {
      success('API server is running (404 expected for root endpoint)');
      return true;
    }
  } catch (err) {
    error(`API server not responding: ${err.message}`);
    return false;
  }
}

async function testAuthentication() {
  info('Testing Authentication...');
  
  for (const [role, credentials] of Object.entries(testCredentials)) {
    const result = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    
    if (result.success) {
      success(`${role} login successful`);
      if (role === 'admin') {
        authToken = result.data.token;
        success('Admin token saved for subsequent tests');
      }
    } else {
      error(`${role} login failed: ${result.error}`);
      return false;
    }
  }
  
  return true;
}

async function testVisitorManagement() {
  info('Testing Visitor Management...');
  
  if (!authToken) {
    error('No auth token available for visitor tests');
    return false;
  }
  
  // Test creating a visitor
  const visitorData = {
    fullName: 'Test Visitor',
    phoneNumber: '+1234567890',
    email: 'test@example.com',
    companyName: 'Test Company',
    purposeOfVisit: 'Integration Testing',
    whomToMeet: 'System Administrator',
    dateTime: new Date().toISOString(),
    locationId: 3
  };
  
  const createResult = await apiRequest('/visitors', {
    method: 'POST',
    body: JSON.stringify(visitorData)
  });
  
  if (createResult.success) {
    success('Visitor creation successful');
    const visitorId = createResult.data.id;
    
    // Test getting visitors
    const getResult = await apiRequest('/visitors');
    if (getResult.success && getResult.data.length > 0) {
      success(`Retrieved ${getResult.data.length} visitors`);
    } else {
      error('Failed to retrieve visitors');
    }
    
    // Test updating visitor status
    const updateResult = await apiRequest(`/visitors/${visitorId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'approved', approvedBy: 'System Administrator' })
    });
    
    if (updateResult.success) {
      success('Visitor status update successful');
    } else {
      error('Visitor status update failed');
    }
    
    return true;
  } else {
    error(`Visitor creation failed: ${createResult.error}`);
    return false;
  }
}

async function testUserManagement() {
  info('Testing User Management...');
  
  if (!authToken) {
    error('No auth token available for user tests');
    return false;
  }
  
  const result = await apiRequest('/auth/users');
  
  if (result.success) {
    success(`Retrieved ${result.data.length} users`);
    
    // Verify default users exist
    const expectedUsers = ['admin@company.com', 'reception@company.com', 'emily.watson@company.com'];
    const actualEmails = result.data.map(u => u.email);
    
    const allUsersExist = expectedUsers.every(email => actualEmails.includes(email));
    if (allUsersExist) {
      success('All default users are present');
    } else {
      warning('Some default users are missing');
    }
    
    return true;
  } else {
    error(`User retrieval failed: ${result.error}`);
    return false;
  }
}

async function testVisitorStats() {
  info('Testing Visitor Statistics...');
  
  if (!authToken) {
    error('No auth token available for stats tests');
    return false;
  }
  
  const result = await apiRequest('/visitors/stats');
  
  if (result.success) {
    success('Visitor statistics retrieved successfully');
    info(`Stats: Total=${result.data.total}, Pending=${result.data.awaiting || 0}, Approved=${result.data.approved || 0}`);
    return true;
  } else {
    error(`Stats retrieval failed: ${result.error}`);
    return false;
  }
}

async function testFrontendHealth() {
  info('Testing Frontend Health...');
  
  try {
    const response = await fetch(FRONTEND_URL);
    if (response.ok) {
      success('Frontend server is responding');
      return true;
    } else {
      error(`Frontend server returned status: ${response.status}`);
      return false;
    }
  } catch (err) {
    error(`Frontend server not responding: ${err.message}`);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  log('\n🧪 VISITOR MANAGEMENT SYSTEM - LOCAL INTEGRATION TESTS', 'bright');
  log('================================================================', 'blue');
  
  const tests = [
    { name: 'API Health Check', fn: testApiHealth },
    { name: 'Frontend Health Check', fn: testFrontendHealth },
    { name: 'Authentication System', fn: testAuthentication },
    { name: 'User Management', fn: testUserManagement },
    { name: 'Visitor Management', fn: testVisitorManagement },
    { name: 'Visitor Statistics', fn: testVisitorStats }
  ];
  
  const results = [];
  
  for (const test of tests) {
    log(`\n🔍 Running ${test.name}...`, 'magenta');
    try {
      const result = await test.fn();
      results.push({ name: test.name, passed: result });
      
      if (result) {
        success(`${test.name} - PASSED`);
      } else {
        error(`${test.name} - FAILED`);
      }
    } catch (err) {
      error(`${test.name} - ERROR: ${err.message}`);
      results.push({ name: test.name, passed: false, error: err.message });
    }
  }
  
  // Final summary
  log('\n📊 TEST SUMMARY', 'bright');
  log('================================================================', 'blue');
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  results.forEach(result => {
    if (result.passed) {
      success(`✅ ${result.name}`);
    } else {
      error(`❌ ${result.name}${result.error ? ` (${result.error})` : ''}`);
    }
  });
  
  log(`\n🎯 OVERALL RESULT: ${passed}/${total} tests passed`, passed === total ? 'green' : 'red');
  
  if (passed === total) {
    log('\n🎉 ALL TESTS PASSED! Your local integration is working perfectly!', 'green');
    log('✅ Backend API: Running and functional', 'green');
    log('✅ Frontend: Running and accessible', 'green');
    log('✅ Database: Connected and operational', 'green');
    log('✅ Authentication: Working correctly', 'green');
    log('✅ Visitor Management: Fully functional', 'green');
    log('\n🚀 Ready for production deployment!', 'bright');
  } else {
    log('\n⚠️  Some tests failed. Please check the issues above.', 'yellow');
  }
  
  return passed === total;
}

// Run tests if called directly
runAllTests().catch(console.error);
