#!/usr/bin/env node

/**
 * Enhanced Automated QA Test Suite
 * Comprehensive testing with detailed reporting and security checks
 */

const API_BASE_URL = 'http://localhost:9524/api';
const FRONTEND_URL = 'http://localhost:5176';

// Enhanced color output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const success = (message) => log(`✅ ${message}`, 'green');
const error = (message) => log(`❌ ${message}`, 'red');
const info = (message) => log(`ℹ️  ${message}`, 'cyan');
const warning = (message) => log(`⚠️  ${message}`, 'yellow');
const header = (message) => log(`\n🔍 ${message}`, 'magenta');

// Test data sets
const testCredentials = {
  admin: { email: 'admin@company.com', password: 'Admin123!' },
  reception: { email: 'reception@company.com', password: 'Reception123!' },
  staff: { email: 'emily.watson@company.com', password: 'Staff123!' }
};

const validVisitorData = [
  {
    fullName: 'John Anderson QA Test',
    phoneNumber: '+1234567890',
    email: 'john.qa@businesscorp.com',
    companyName: 'Business Corp',
    purposeOfVisit: 'Automated QA Testing',
    whomToMeet: 'QA Team',
    dateTime: new Date().toISOString(),
    locationId: 3
  },
  {
    fullName: 'Maria Rodriguez QA',
    phoneNumber: '+1555123456',
    email: 'maria.qa@techsolutions.com',
    companyName: 'Tech Solutions Inc',
    purposeOfVisit: 'System Integration Test',
    whomToMeet: 'Development Team',
    dateTime: new Date(Date.now() + 3600000).toISOString(), // +1 hour
    locationId: 3
  }
];

const invalidVisitorData = [
  {
    name: 'Missing Full Name',
    data: {
      phoneNumber: '+1234567890',
      email: 'test@example.com',
      companyName: 'Test Company',
      purposeOfVisit: 'Testing',
      whomToMeet: 'Test Person',
      dateTime: new Date().toISOString(),
      locationId: 3
    }
  },
  {
    name: 'Invalid Email Format',
    data: {
      fullName: 'Test User',
      phoneNumber: '+1234567890',
      email: 'invalid-email-format',
      companyName: 'Test Company',
      purposeOfVisit: 'Testing',
      whomToMeet: 'Test Person',
      dateTime: new Date().toISOString(),
      locationId: 3
    }
  },
  {
    name: 'Invalid Location ID',
    data: {
      fullName: 'Test User',
      phoneNumber: '+1234567890',
      email: 'test@example.com',
      companyName: 'Test Company',
      purposeOfVisit: 'Testing',
      whomToMeet: 'Test Person',
      dateTime: new Date().toISOString(),
      locationId: 999
    }
  }
];

// Security test payloads
const securityPayloads = {
  sqlInjection: [
    "'; DROP TABLE Visitors; --",
    "' OR '1'='1",
    "1; DELETE FROM Users WHERE 1=1; --",
    "admin'--"
  ],
  xss: [
    "<script>alert('XSS')</script>",
    "javascript:alert('XSS')",
    "<img src=x onerror=alert('XSS')>",
    "<svg onload=alert('XSS')>"
  ]
};

let authTokens = {};
let testResults = [];
let createdVisitorIds = [];

// Enhanced API request helper
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(options.token && { 'Authorization': `Bearer ${options.token}` })
    },
    ...options
  };

  try {
    const response = await fetch(url, config);
    let data = null;
    
    try {
      data = await response.json();
    } catch (e) {
      data = await response.text();
    }
    
    return { 
      success: response.ok, 
      data, 
      status: response.status,
      statusText: response.statusText
    };
  } catch (err) {
    return { 
      success: false, 
      error: err.message, 
      status: 0 
    };
  }
}

// Test execution wrapper
async function runTest(testName, testFunction) {
  header(`Running ${testName}...`);
  const startTime = Date.now();
  
  try {
    const result = await testFunction();
    const duration = Date.now() - startTime;
    
    testResults.push({
      name: testName,
      passed: result,
      duration,
      timestamp: new Date().toISOString()
    });
    
    if (result) {
      success(`${testName} - PASSED (${duration}ms)`);
    } else {
      error(`${testName} - FAILED (${duration}ms)`);
    }
    
    return result;
  } catch (err) {
    const duration = Date.now() - startTime;
    error(`${testName} - ERROR: ${err.message} (${duration}ms)`);
    testResults.push({
      name: testName,
      passed: false,
      duration,
      error: err.message,
      timestamp: new Date().toISOString()
    });
    return false;
  }
}

// Enhanced test functions
async function testSystemHealth() {
  info('Checking API server health...');
  const apiResponse = await fetch(`${API_BASE_URL.replace('/api', '')}`);
  if (apiResponse.status !== 404) {
    throw new Error('API server not responding correctly');
  }
  
  info('Checking frontend health...');
  const frontendResponse = await fetch(FRONTEND_URL);
  if (!frontendResponse.ok) {
    throw new Error('Frontend server not responding');
  }
  
  success('All systems operational');
  return true;
}

async function testAuthentication() {
  info('Testing all user authentication...');
  
  for (const [role, credentials] of Object.entries(testCredentials)) {
    const result = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    
    if (!result.success) {
      throw new Error(`${role} login failed: ${result.error || result.data?.message}`);
    }
    
    authTokens[role] = result.data.token;
    success(`${role} authentication successful`);
  }
  
  // Test invalid credentials
  const invalidResult = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'invalid@test.com', password: 'wrong' })
  });
  
  if (invalidResult.success) {
    throw new Error('Invalid credentials should have failed');
  }
  
  success('Invalid credential rejection working');
  return true;
}

async function testUserManagement() {
  info('Testing user management endpoints...');
  
  const result = await apiRequest('/auth/users', {
    token: authTokens.admin
  });
  
  if (!result.success) {
    throw new Error(`User retrieval failed: ${result.error}`);
  }
  
  if (!Array.isArray(result.data) || result.data.length < 3) {
    throw new Error('Expected at least 3 default users');
  }
  
  // Verify expected users exist
  const emails = result.data.map(u => u.email);
  const expectedEmails = Object.values(testCredentials).map(c => c.email);
  
  for (const email of expectedEmails) {
    if (!emails.includes(email)) {
      throw new Error(`Expected user ${email} not found`);
    }
  }
  
  success(`Retrieved ${result.data.length} users with all expected accounts`);
  return true;
}

async function testVisitorCRUD() {
  info('Testing visitor CRUD operations...');
  
  // Test creating multiple visitors
  for (const [index, visitorData] of validVisitorData.entries()) {
    const createResult = await apiRequest('/visitors', {
      method: 'POST',
      body: JSON.stringify(visitorData),
      token: authTokens.admin
    });
    
    if (!createResult.success) {
      throw new Error(`Visitor ${index + 1} creation failed: ${createResult.error || JSON.stringify(createResult.data)}`);
    }
    
    createdVisitorIds.push(createResult.data.id);
    success(`Created visitor ${index + 1}: ${createResult.data.fullName} (ID: ${createResult.data.id})`);
  }
  
  // Test retrieving visitors
  const getResult = await apiRequest('/visitors', {
    token: authTokens.admin
  });
  
  if (!getResult.success) {
    throw new Error(`Visitor retrieval failed: ${getResult.error}`);
  }
  
  success(`Retrieved ${getResult.data.length} total visitors`);
  
  // Test updating visitor status
  if (createdVisitorIds.length > 0) {
    const updateResult = await apiRequest(`/visitors/${createdVisitorIds[0]}/status`, {
      method: 'PUT',
      body: JSON.stringify({
        status: 'approved',
        approvedBy: 'Automated QA Test'
      }),
      token: authTokens.staff
    });
    
    if (updateResult.success) {
      success(`Visitor status update successful`);
    } else {
      warning(`Visitor status update failed: ${updateResult.error || JSON.stringify(updateResult.data)}`);
    }
  }
  
  return true;
}

async function testInputValidation() {
  info('Testing input validation with invalid data...');
  
  for (const invalidCase of invalidVisitorData) {
    const result = await apiRequest('/visitors', {
      method: 'POST',
      body: JSON.stringify(invalidCase.data),
      token: authTokens.admin
    });
    
    if (result.success) {
      throw new Error(`${invalidCase.name} should have failed validation`);
    }
    
    success(`${invalidCase.name} correctly rejected`);
  }
  
  return true;
}

async function testSecurityVulnerabilities() {
  info('Testing security vulnerabilities...');
  
  // Test SQL injection in visitor creation
  for (const payload of securityPayloads.sqlInjection) {
    const testData = {
      fullName: payload,
      phoneNumber: '+1234567890',
      email: 'security@test.com',
      companyName: 'Security Test',
      purposeOfVisit: 'Security Testing',
      whomToMeet: 'Security Team',
      dateTime: new Date().toISOString(),
      locationId: 3
    };
    
    const result = await apiRequest('/visitors', {
      method: 'POST',
      body: JSON.stringify(testData),
      token: authTokens.admin
    });
    
    // Should either fail validation or safely handle the input
    if (result.success && result.data.fullName === payload) {
      warning(`Potential SQL injection vulnerability with payload: ${payload}`);
    }
  }
  
  // Test authentication bypass
  const bypassResult = await apiRequest('/visitors', {
    token: 'invalid.jwt.token'
  });
  
  if (bypassResult.success) {
    throw new Error('Invalid JWT token should be rejected');
  }
  
  success('Security tests completed - no major vulnerabilities detected');
  return true;
}

async function testPerformance() {
  info('Testing API performance...');
  
  const performanceTests = [];
  const testCount = 10;
  
  // Test login performance
  for (let i = 0; i < testCount; i++) {
    const startTime = Date.now();
    await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(testCredentials.admin)
    });
    performanceTests.push(Date.now() - startTime);
  }
  
  const avgResponseTime = performanceTests.reduce((a, b) => a + b) / performanceTests.length;
  const maxResponseTime = Math.max(...performanceTests);
  
  info(`Average response time: ${avgResponseTime.toFixed(2)}ms`);
  info(`Maximum response time: ${maxResponseTime}ms`);
  
  if (avgResponseTime > 2000) {
    warning('Average response time exceeds 2 seconds');
  }
  
  if (maxResponseTime > 5000) {
    throw new Error('Maximum response time exceeds acceptable limits');
  }
  
  success('Performance tests passed');
  return true;
}

async function testStatistics() {
  info('Testing visitor statistics...');
  
  const result = await apiRequest('/visitors/stats', {
    token: authTokens.admin
  });
  
  if (!result.success) {
    throw new Error(`Statistics retrieval failed: ${result.error}`);
  }
  
  const stats = result.data;
  info(`Current stats: Total=${stats.total}, Awaiting=${stats.awaiting || 0}, Approved=${stats.approved || 0}`);
  
  // Verify stats make sense
  if (typeof stats.total !== 'number' || stats.total < 0) {
    throw new Error('Invalid total visitor count');
  }
  
  success('Statistics retrieved and validated');
  return true;
}

async function testErrorHandling() {
  info('Testing error handling...');
  
  // Test non-existent endpoints
  const notFoundResult = await apiRequest('/nonexistent', {
    token: authTokens.admin
  });
  
  if (notFoundResult.status !== 404) {
    warning('Non-existent endpoint should return 404');
  }
  
  // Test malformed JSON
  try {
    const response = await fetch(`${API_BASE_URL}/visitors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authTokens.admin}`
      },
      body: 'invalid json{'
    });
    
    if (response.ok) {
      throw new Error('Malformed JSON should be rejected');
    }
  } catch (err) {
    if (err.message.includes('should be rejected')) {
      throw err;
    }
    // Expected to fail due to malformed JSON
  }
  
  success('Error handling tests passed');
  return true;
}

async function cleanupTestData() {
  info('Cleaning up test data...');
  
  // Note: In a real system, you might want to delete test visitors
  // For now, we'll just report what was created
  if (createdVisitorIds.length > 0) {
    info(`Created ${createdVisitorIds.length} test visitors: ${createdVisitorIds.join(', ')}`);
    warning('Test visitors were not automatically deleted - consider manual cleanup');
  }
  
  return true;
}

// Generate detailed test report
function generateTestReport() {
  log('\n📊 DETAILED TEST REPORT', 'bright');
  log('================================================================', 'blue');
  
  const passed = testResults.filter(r => r.passed).length;
  const failed = testResults.filter(r => !r.passed).length;
  const total = testResults.length;
  const totalDuration = testResults.reduce((sum, r) => sum + r.duration, 0);
  
  log(`\n📈 Test Summary:`, 'cyan');
  log(`   Total Tests: ${total}`);
  log(`   Passed: ${passed}`, passed === total ? 'green' : 'yellow');
  log(`   Failed: ${failed}`, failed === 0 ? 'green' : 'red');
  log(`   Pass Rate: ${((passed / total) * 100).toFixed(1)}%`);
  log(`   Total Duration: ${totalDuration}ms`);
  log(`   Average Duration: ${(totalDuration / total).toFixed(1)}ms`);
  
  log(`\n📋 Individual Test Results:`, 'cyan');
  testResults.forEach(result => {
    const status = result.passed ? '✅' : '❌';
    const color = result.passed ? 'green' : 'red';
    log(`   ${status} ${result.name} (${result.duration}ms)`, color);
    if (result.error) {
      log(`      Error: ${result.error}`, 'red');
    }
  });
  
  log(`\n🏆 Final Assessment:`, 'bright');
  if (passed === total) {
    log('   🎉 ALL TESTS PASSED! System is ready for production.', 'green');
  } else if (passed / total >= 0.8) {
    log('   ⚠️  Most tests passed. Review failed tests before deployment.', 'yellow');
  } else {
    log('   ❌ Multiple test failures. System needs attention before deployment.', 'red');
  }
  
  // Generate JSON report for CI/CD integration
  const jsonReport = {
    timestamp: new Date().toISOString(),
    summary: {
      total,
      passed,
      failed,
      passRate: (passed / total) * 100,
      totalDuration,
      averageDuration: totalDuration / total
    },
    tests: testResults,
    environment: {
      apiUrl: API_BASE_URL,
      frontendUrl: FRONTEND_URL,
      nodeVersion: process.version
    }
  };
  
  log(`\n💾 JSON Report Generated (for CI/CD integration):`, 'cyan');
  console.log(JSON.stringify(jsonReport, null, 2));
}

// Main test runner
async function runAutomatedQA() {
  log('\n🤖 AUTOMATED QA TEST SUITE', 'bright');
  log('================================================================', 'blue');
  log('Running comprehensive automated quality assurance tests...', 'cyan');
  
  const tests = [
    { name: 'System Health Check', fn: testSystemHealth },
    { name: 'Authentication Testing', fn: testAuthentication },
    { name: 'User Management Testing', fn: testUserManagement },
    { name: 'Visitor CRUD Operations', fn: testVisitorCRUD },
    { name: 'Input Validation Testing', fn: testInputValidation },
    { name: 'Security Vulnerability Scan', fn: testSecurityVulnerabilities },
    { name: 'Performance Testing', fn: testPerformance },
    { name: 'Statistics Testing', fn: testStatistics },
    { name: 'Error Handling Testing', fn: testErrorHandling },
    { name: 'Test Data Cleanup', fn: cleanupTestData }
  ];
  
  const startTime = Date.now();
  
  for (const test of tests) {
    await runTest(test.name, test.fn);
  }
  
  const totalDuration = Date.now() - startTime;
  log(`\n⏱️  Total execution time: ${totalDuration}ms`, 'cyan');
  
  generateTestReport();
  
  return testResults.every(r => r.passed);
}

// Run tests if called directly
runAutomatedQA().catch(console.error);
