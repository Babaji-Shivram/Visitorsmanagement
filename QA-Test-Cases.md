# Visitor Management System - QA Test Cases

## Test Environment Setup
- **Backend API**: http://localhost:9524
- **Frontend**: http://localhost:5176
- **Database**: SQL Server with Entity Framework Core
- **Test Date**: August 2, 2025

## Test Credentials
```json
{
  "admin": {
    "email": "admin@company.com",
    "password": "Admin123!",
    "role": "Administrator"
  },
  "reception": {
    "email": "reception@company.com", 
    "password": "Reception123!",
    "role": "Reception"
  },
  "staff": {
    "email": "emily.watson@company.com",
    "password": "Staff123!",
    "role": "Staff"
  }
}
```

---

## Test Categories

### 1. System Health & Connectivity Tests

#### TC-001: Backend API Health Check
**Objective**: Verify backend API server is running and accessible
- **Steps**:
  1. Navigate to http://localhost:9524
  2. Verify server responds (404 expected for root endpoint)
- **Expected Result**: Server responds, confirming API is operational
- **Priority**: Critical

#### TC-002: Frontend Application Health Check
**Objective**: Verify frontend application loads correctly
- **Steps**:
  1. Navigate to http://localhost:5176
  2. Verify page loads without errors
  3. Check browser console for JavaScript errors
- **Expected Result**: Application loads successfully, no console errors
- **Priority**: Critical

#### TC-003: Database Connectivity
**Objective**: Verify database connection through API endpoints
- **Steps**:
  1. Make API call to `/api/auth/users`
  2. Verify response contains user data
- **Expected Result**: API returns user data, confirming database connectivity
- **Priority**: Critical

---

### 2. Authentication & Authorization Tests

#### TC-004: Admin Login
**Objective**: Verify admin user can log in successfully
- **Steps**:
  1. Navigate to login page
  2. Enter admin credentials (admin@company.com / Admin123!)
  3. Click login button
- **Expected Result**: 
  - Login successful
  - JWT token received
  - Redirected to admin dashboard
- **Priority**: Critical

#### TC-005: Reception Login
**Objective**: Verify reception user can log in successfully
- **Steps**:
  1. Navigate to login page
  2. Enter reception credentials (reception@company.com / Reception123!)
  3. Click login button
- **Expected Result**: 
  - Login successful
  - JWT token received
  - Redirected to reception dashboard
- **Priority**: Critical

#### TC-006: Staff Login
**Objective**: Verify staff user can log in successfully
- **Steps**:
  1. Navigate to login page
  2. Enter staff credentials (emily.watson@company.com / Staff123!)
  3. Click login button
- **Expected Result**: 
  - Login successful
  - JWT token received
  - Redirected to staff dashboard
- **Priority**: Critical

#### TC-007: Invalid Login Credentials
**Objective**: Verify system handles invalid credentials correctly
- **Steps**:
  1. Navigate to login page
  2. Enter invalid credentials
  3. Click login button
- **Expected Result**: 
  - Login fails
  - Error message displayed
  - User remains on login page
- **Priority**: High

#### TC-008: JWT Token Validation
**Objective**: Verify JWT token is properly validated for API requests
- **Steps**:
  1. Login with valid credentials
  2. Make API request with valid token
  3. Make API request with invalid/expired token
- **Expected Result**: 
  - Valid token: Request succeeds
  - Invalid token: Request fails with 401 Unauthorized
- **Priority**: High

#### TC-009: Role-Based Access Control
**Objective**: Verify users can only access features allowed for their role
- **Steps**:
  1. Login as each user type
  2. Attempt to access features outside their role
- **Expected Result**: Access restricted based on user role
- **Priority**: High

---

### 3. User Management Tests

#### TC-010: Retrieve All Users (Admin Only)
**Objective**: Verify admin can retrieve list of all users
- **Steps**:
  1. Login as admin
  2. Navigate to user management section
  3. Verify all default users are displayed
- **Expected Result**: 
  - List shows all 3 default users
  - User details correctly displayed
- **Priority**: Medium

#### TC-011: User Data Integrity
**Objective**: Verify user data is accurate and complete
- **Steps**:
  1. Login as admin
  2. Retrieve user list via API
  3. Verify each user has required fields
- **Expected Result**: All users have complete data (email, role, etc.)
- **Priority**: Medium

---

### 4. Visitor Management Tests

#### TC-012: Create New Visitor
**Objective**: Verify new visitor can be registered successfully
- **Test Data**:
  ```json
  {
    "fullName": "John Doe",
    "phoneNumber": "+1234567890",
    "email": "john.doe@example.com",
    "companyName": "Test Company",
    "purposeOfVisit": "Business Meeting",
    "whomToMeet": "Jane Smith",
    "dateTime": "2025-08-02T14:30:00Z",
    "locationId": 3
  }
  ```
- **Steps**:
  1. Login as reception/admin
  2. Navigate to visitor registration
  3. Fill in visitor details
  4. Submit registration
- **Expected Result**: 
  - Visitor created successfully
  - Status: "Pending"
  - Visitor ID generated
  - HTTP 201 Created response
- **Priority**: Critical

#### TC-013: Retrieve Visitor List
**Objective**: Verify system can retrieve all visitors
- **Steps**:
  1. Login with appropriate credentials
  2. Navigate to visitor list
  3. Verify visitors are displayed
- **Expected Result**: All visitors displayed with complete information
- **Priority**: High

#### TC-014: Update Visitor Status - Approve
**Objective**: Verify visitor status can be updated to approved
- **Steps**:
  1. Login as staff/admin
  2. Find pending visitor
  3. Update status to "Approved"
  4. Add approver name
- **Expected Result**: 
  - Status updated to "Approved"
  - Approver name recorded
  - Timestamp updated
- **Priority**: Critical

#### TC-015: Update Visitor Status - Reject
**Objective**: Verify visitor status can be updated to rejected
- **Steps**:
  1. Login as staff/admin
  2. Find pending visitor
  3. Update status to "Rejected"
  4. Add rejection reason
- **Expected Result**: 
  - Status updated to "Rejected"
  - Rejection reason recorded
  - Timestamp updated
- **Priority**: High

#### TC-016: Visitor Data Validation
**Objective**: Verify proper validation of visitor input data
- **Steps**:
  1. Attempt to create visitor with missing required fields
  2. Attempt to create visitor with invalid email format
  3. Attempt to create visitor with invalid phone number
  4. Attempt to create visitor with invalid location ID
- **Expected Result**: 
  - Appropriate validation errors displayed
  - Visitor not created with invalid data
- **Priority**: High

#### TC-017: Location Association
**Objective**: Verify visitors are properly associated with locations
- **Steps**:
  1. Create visitor with locationId: 3 ("Corporate Office")
  2. Verify location association in response
- **Expected Result**: Visitor correctly associated with specified location
- **Priority**: Medium

---

### 5. Visitor Statistics Tests

#### TC-018: Retrieve Visitor Statistics
**Objective**: Verify visitor statistics are calculated correctly
- **Steps**:
  1. Login as admin/reception
  2. Navigate to statistics dashboard
  3. Verify statistics display
- **Expected Result**: 
  - Total visitor count displayed
  - Pending visitor count displayed
  - Approved visitor count displayed
  - Statistics match actual data
- **Priority**: Medium

#### TC-019: Statistics Real-time Update
**Objective**: Verify statistics update when visitor status changes
- **Steps**:
  1. Note current statistics
  2. Approve a pending visitor
  3. Refresh statistics
- **Expected Result**: 
  - Pending count decreases by 1
  - Approved count increases by 1
  - Total count remains same
- **Priority**: Low

---

### 6. Error Handling Tests

#### TC-020: Network Error Handling
**Objective**: Verify system handles network errors gracefully
- **Steps**:
  1. Disconnect network/stop backend server
  2. Attempt various operations in frontend
- **Expected Result**: 
  - Appropriate error messages displayed
  - System doesn't crash
  - User can retry operations
- **Priority**: Medium

#### TC-021: Invalid API Responses
**Objective**: Verify frontend handles invalid API responses
- **Steps**:
  1. Modify API to return invalid data format
  2. Perform operations that call the API
- **Expected Result**: System handles errors gracefully without crashing
- **Priority**: Low

---

### 7. Performance Tests

#### TC-022: Response Time Test
**Objective**: Verify API response times are acceptable
- **Steps**:
  1. Make multiple API calls
  2. Measure response times
- **Expected Result**: API responses within acceptable time limits (<2 seconds)
- **Priority**: Low

#### TC-023: Concurrent User Test
**Objective**: Verify system handles multiple simultaneous users
- **Steps**:
  1. Simulate multiple users logging in simultaneously
  2. Perform visitor operations concurrently
- **Expected Result**: System handles concurrent operations without errors
- **Priority**: Low

---

### 8. Security Tests

#### TC-024: SQL Injection Prevention
**Objective**: Verify system is protected against SQL injection
- **Steps**:
  1. Attempt SQL injection in visitor form fields
  2. Attempt SQL injection in login fields
- **Expected Result**: System rejects malicious input safely
- **Priority**: High

#### TC-025: XSS Prevention
**Objective**: Verify system prevents cross-site scripting
- **Steps**:
  1. Attempt to inject JavaScript in visitor form fields
  2. Verify output is properly sanitized
- **Expected Result**: JavaScript code not executed, properly escaped
- **Priority**: High

#### TC-026: Authentication Bypass
**Objective**: Verify protected endpoints require authentication
- **Steps**:
  1. Attempt to access protected APIs without token
  2. Attempt to access admin features as regular user
- **Expected Result**: Access denied, appropriate error codes returned
- **Priority**: Critical

---

## Test Execution Checklist

### Pre-Testing Requirements
- [ ] Backend server running on port 9524
- [ ] Frontend server running on port 5176
- [ ] Database properly seeded with test data
- [ ] All test credentials verified working

### Test Execution Order
1. **System Health Tests** (TC-001 to TC-003)
2. **Authentication Tests** (TC-004 to TC-009)
3. **User Management Tests** (TC-010 to TC-011)
4. **Visitor Management Tests** (TC-012 to TC-017)
5. **Statistics Tests** (TC-018 to TC-019)
6. **Error Handling Tests** (TC-020 to TC-021)
7. **Performance Tests** (TC-022 to TC-023)
8. **Security Tests** (TC-024 to TC-026)

### Test Environment Validation
Run the automated integration test before manual testing:
```bash
node test-integration.js
```
Expected result: "ALL TESTS PASSED! Your local integration is working perfectly!"

---

## Bug Reporting Template

### Bug Report Format
```
Bug ID: BUG-YYYY-MM-DD-XXX
Test Case: TC-XXX
Severity: Critical/High/Medium/Low
Priority: Critical/High/Medium/Low

Summary: Brief description of the issue

Steps to Reproduce:
1. Step 1
2. Step 2
3. Step 3

Expected Result: What should happen

Actual Result: What actually happened

Environment:
- Browser: [Chrome/Firefox/Edge version]
- OS: [Windows/Mac/Linux]
- Backend Version: [Version]
- Frontend Version: [Version]

Screenshots/Logs: [Attach relevant files]

Additional Notes: Any other relevant information
```

---

## Test Data

### Valid Test Visitor Data
```json
{
  "fullName": "Test Visitor QA",
  "phoneNumber": "+1555123456",
  "email": "qa.test@example.com",
  "companyName": "QA Test Company",
  "purposeOfVisit": "Quality Assurance Testing",
  "whomToMeet": "Development Team",
  "dateTime": "2025-08-02T15:00:00Z",
  "locationId": 3
}
```

### Invalid Test Data Examples
```json
{
  "missingFields": {
    "email": "incomplete@test.com"
  },
  "invalidEmail": {
    "fullName": "Test User",
    "email": "invalid-email-format",
    "phoneNumber": "+1234567890"
  },
  "invalidLocationId": {
    "fullName": "Test User",
    "email": "test@example.com",
    "phoneNumber": "+1234567890",
    "locationId": 999
  }
}
```

---

## Success Criteria

### Definition of Done
- All Critical and High priority test cases pass
- No blocking bugs identified
- System performance meets requirements
- Security vulnerabilities addressed
- All user roles function correctly
- Data integrity maintained

### Acceptance Criteria
- ✅ 100% of Critical test cases pass
- ✅ 95% of High priority test cases pass
- ✅ 90% of Medium priority test cases pass
- ✅ System ready for production deployment
