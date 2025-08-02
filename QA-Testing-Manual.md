# Visitor Management System - QA Testing Manual

## Executive Summary
This document provides comprehensive testing guidelines for the Visitor Management System. The system consists of a React frontend, .NET 8 Web API backend, and SQL Server database, designed to manage visitor registration, approval workflows, and statistics.

---

## Table of Contents
1. [System Overview](#system-overview)
2. [Test Environment Setup](#test-environment-setup)
3. [Testing Methodology](#testing-methodology)
4. [Automated Testing Tools](#automated-testing-tools)
5. [Manual Testing Procedures](#manual-testing-procedures)
6. [API Testing Guide](#api-testing-guide)
7. [Browser Testing Matrix](#browser-testing-matrix)
8. [Performance Testing Guidelines](#performance-testing-guidelines)
9. [Security Testing Checklist](#security-testing-checklist)
10. [Troubleshooting Guide](#troubleshooting-guide)

---

## System Overview

### Architecture Components
- **Frontend**: React + TypeScript (Port 5176)
- **Backend**: .NET 8 Web API (Port 9524)
- **Database**: SQL Server with Entity Framework Core
- **Authentication**: JWT Token-based

### User Roles
1. **Administrator**: Full system access, user management
2. **Reception**: Visitor registration, basic management
3. **Staff**: Visitor approval/rejection, status updates

### Core Features
- User authentication and role-based access
- Visitor registration and management
- Approval workflow system
- Real-time statistics dashboard
- Location-based visitor tracking

---

## Test Environment Setup

### Prerequisites
- Node.js (v18 or higher)
- .NET 8 SDK
- SQL Server (LocalDB or full instance)
- Modern web browser (Chrome, Firefox, Edge)

### Environment Configuration
```bash
# Backend Server
URL: http://localhost:9524
API Base: http://localhost:9524/api

# Frontend Application  
URL: http://localhost:5176

# Database
Server: localhost
Database: VisitorManagement
Authentication: Windows/SQL Server
```

### Setup Verification Script
Before testing, run the automated verification:
```bash
cd d:\Visitor
node test-integration.js
```
✅ **Expected Output**: "ALL TESTS PASSED! Your local integration is working perfectly!"

---

## Testing Methodology

### Testing Phases
1. **Smoke Testing**: Basic functionality verification
2. **Functional Testing**: Feature-specific testing
3. **Integration Testing**: Cross-component testing
4. **User Acceptance Testing**: End-to-end workflows
5. **Performance Testing**: Load and stress testing
6. **Security Testing**: Vulnerability assessment

### Test Execution Strategy
- **Critical Path First**: Authentication → Visitor Management → Statistics
- **Role-Based Testing**: Test each user role separately
- **Data-Driven Testing**: Use multiple data sets
- **Regression Testing**: Verify existing functionality after changes

---

## Automated Testing Tools

### Integration Test Suite
**File**: `test-integration.js`
**Purpose**: Automated validation of all system components

```bash
# Run full test suite
node test-integration.js

# Expected output shows 6/6 tests passing:
# ✅ API Health Check - PASSED
# ✅ Frontend Health Check - PASSED  
# ✅ Authentication System - PASSED
# ✅ User Management - PASSED
# ✅ Visitor Management - PASSED
# ✅ Visitor Statistics - PASSED
```

### Custom Test Scripts

#### Quick API Health Check
```powershell
# Test API server status
$response = Invoke-WebRequest -Uri "http://localhost:9524" -ErrorAction SilentlyContinue
if ($response.StatusCode -eq 404) {
    Write-Host "✅ API Server is running" -ForegroundColor Green
} else {
    Write-Host "❌ API Server issue" -ForegroundColor Red
}
```

#### Database Connection Test
```powershell
# Test database connectivity via API
$response = Invoke-RestMethod -Uri "http://localhost:9524/api/auth/users" -Headers @{
    "Authorization" = "Bearer YOUR_ADMIN_TOKEN"
}
Write-Host "Database contains $($response.Length) users" -ForegroundColor Cyan
```

---

## Manual Testing Procedures

### Login Testing Workflow

#### Test 1: Admin Login
1. **Navigate**: http://localhost:5176
2. **Enter Credentials**:
   - Email: `admin@company.com`
   - Password: `Admin123!`
3. **Verify**: Redirected to admin dashboard
4. **Check**: JWT token stored in browser storage

#### Test 2: Role Verification
1. **Login as Reception**: `reception@company.com` / `Reception123!`
2. **Verify Access**: Can register visitors, cannot manage users
3. **Login as Staff**: `emily.watson@company.com` / `Staff123!`
4. **Verify Access**: Can approve/reject visitors

### Visitor Management Testing

#### Test 3: Visitor Registration
1. **Login**: As reception or admin
2. **Navigate**: To visitor registration form
3. **Fill Form**:
   ```
   Full Name: John Doe
   Phone: +1234567890
   Email: john.doe@example.com
   Company: Test Company
   Purpose: Business Meeting
   Meeting With: Jane Smith
   Date/Time: Current date + 1 hour
   Location: Corporate Office
   ```
4. **Submit**: Form
5. **Verify**: Success message and visitor ID generated

#### Test 4: Visitor Approval Workflow
1. **Login**: As staff user
2. **Navigate**: To pending visitors list
3. **Select**: Visitor from Test 3
4. **Action**: Click "Approve"
5. **Verify**: Status changes to "Approved", timestamp updated

### Statistics Testing

#### Test 5: Dashboard Verification
1. **Login**: As admin
2. **Navigate**: To statistics dashboard
3. **Verify Counts**:
   - Total visitors (should include test visitor)
   - Pending count (should decrease after approval)
   - Approved count (should increase after approval)

---

## API Testing Guide

### Authentication Endpoints

#### POST /api/auth/login
```powershell
$body = @{
    email = "admin@company.com"
    password = "Admin123!"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:9524/api/auth/login" -Method POST -Body $body -ContentType "application/json"
$token = $response.token
Write-Host "Token received: $($token.Substring(0,20))..." -ForegroundColor Green
```

#### GET /api/auth/users
```powershell
$headers = @{ "Authorization" = "Bearer $token" }
$users = Invoke-RestMethod -Uri "http://localhost:9524/api/auth/users" -Headers $headers
Write-Host "Retrieved $($users.Length) users" -ForegroundColor Cyan
```

### Visitor Management Endpoints

#### POST /api/visitors
```powershell
$visitorData = @{
    fullName = "API Test Visitor"
    phoneNumber = "+1555999888"
    email = "apitest@example.com"
    companyName = "API Test Company"
    purposeOfVisit = "API Testing"
    whomToMeet = "Development Team"
    dateTime = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
    locationId = 3
} | ConvertTo-Json

$headers = @{ 
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$visitor = Invoke-RestMethod -Uri "http://localhost:9524/api/visitors" -Method POST -Body $visitorData -Headers $headers
Write-Host "Created visitor with ID: $($visitor.id)" -ForegroundColor Green
```

#### GET /api/visitors
```powershell
$visitors = Invoke-RestMethod -Uri "http://localhost:9524/api/visitors" -Headers $headers
Write-Host "Retrieved $($visitors.Length) visitors" -ForegroundColor Cyan
```

#### PUT /api/visitors/{id}/status
```powershell
$statusUpdate = @{
    status = "approved"
    approvedBy = "API Tester"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:9524/api/visitors/$($visitor.id)/status" -Method PUT -Body $statusUpdate -Headers $headers
Write-Host "Visitor status updated successfully" -ForegroundColor Green
```

#### GET /api/visitors/stats
```powershell
$stats = Invoke-RestMethod -Uri "http://localhost:9524/api/visitors/stats" -Headers $headers
Write-Host "Statistics: Total=$($stats.total), Awaiting=$($stats.awaiting), Approved=$($stats.approved)" -ForegroundColor Cyan
```

---

## Browser Testing Matrix

### Supported Browsers
| Browser | Version | Status | Notes |
|---------|---------|---------|-------|
| Chrome | 120+ | ✅ Primary | Full testing required |
| Firefox | 115+ | ✅ Secondary | Core functionality testing |
| Edge | 120+ | ✅ Secondary | Windows compatibility |
| Safari | 16+ | ⚠️ Limited | Mac testing only |

### Browser-Specific Tests
1. **Cookie/Storage**: Verify JWT token persistence
2. **CORS**: Test cross-origin requests
3. **Responsive Design**: Test on different screen sizes
4. **JavaScript Compatibility**: Verify ES6+ features work

---

## Performance Testing Guidelines

### Load Testing Scenarios

#### Scenario 1: Concurrent Logins
```bash
# Use Apache Bench or similar tool
ab -n 100 -c 10 -H "Content-Type: application/json" -p login-data.json http://localhost:9524/api/auth/login
```

#### Scenario 2: Visitor Creation Load
```bash
# Test visitor registration under load
ab -n 50 -c 5 -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -p visitor-data.json http://localhost:9524/api/visitors
```

### Performance Benchmarks
- **API Response Time**: < 2 seconds
- **Page Load Time**: < 3 seconds
- **Database Query Time**: < 500ms
- **Concurrent Users**: Support 50+ simultaneous users

---

## Security Testing Checklist

### Authentication Security
- [ ] Password complexity requirements enforced
- [ ] JWT tokens expire appropriately
- [ ] Invalid tokens properly rejected
- [ ] Session management secure

### Input Validation
- [ ] SQL injection prevention tested
- [ ] XSS prevention verified
- [ ] Input sanitization working
- [ ] File upload restrictions (if applicable)

### API Security
- [ ] CORS properly configured
- [ ] Rate limiting implemented
- [ ] Sensitive data not exposed in responses
- [ ] HTTPS enforced (production)

### Security Test Commands
```powershell
# Test SQL injection
$maliciousInput = "'; DROP TABLE Visitors; --"
# Verify this input is safely handled in all form fields

# Test XSS
$xssPayload = "<script>alert('XSS')</script>"
# Verify script tags are escaped in output
```

---

## Troubleshooting Guide

### Common Issues

#### Issue 1: API Server Not Starting
**Symptoms**: Connection refused errors, frontend can't reach backend
**Solutions**:
1. Check if port 9524 is available: `netstat -ano | findstr :9524`
2. Verify .NET 8 SDK installed: `dotnet --version`
3. Check application logs in VisitorManagement.API folder

#### Issue 2: Database Connection Errors
**Symptoms**: 500 errors on API calls, authentication failures
**Solutions**:
1. Verify SQL Server running: `services.msc` → SQL Server
2. Check connection string in `appsettings.json`
3. Run database migrations: `dotnet ef database update`

#### Issue 3: Frontend Build Issues
**Symptoms**: Frontend won't start, build errors
**Solutions**:
1. Clear node modules: `rm -rf node_modules; npm install`
2. Check Node.js version: `node --version` (should be 18+)
3. Verify all dependencies installed: `npm install`

#### Issue 4: CORS Errors
**Symptoms**: Frontend can't call API, preflight request failures
**Solutions**:
1. Verify CORS configuration in `Program.cs`
2. Check frontend API base URL matches backend
3. Ensure credentials included in requests

### Debugging Commands
```bash
# Check process status
netstat -ano | findstr :9524  # Backend
netstat -ano | findstr :5176  # Frontend

# View application logs
Get-Content "VisitorManagement.API\bin\Debug\net8.0\logs\*" -Tail 50

# Test connectivity
Test-NetConnection localhost -Port 9524
Test-NetConnection localhost -Port 5176
```

### Recovery Procedures
1. **Full System Reset**:
   ```bash
   # Stop all processes
   taskkill /f /im dotnet.exe
   taskkill /f /im node.exe
   
   # Restart backend
   cd VisitorManagement.API
   dotnet run
   
   # Restart frontend (new terminal)
   npm run dev
   ```

2. **Database Reset**:
   ```bash
   cd VisitorManagement.API
   dotnet ef database drop
   dotnet ef database update
   ```

---

## Test Reporting

### Test Execution Report Template
```markdown
# Test Execution Report
**Date**: [Date]
**Tester**: [Name]
**Environment**: Local Development
**Build**: [Version]

## Summary
- Total Test Cases: X
- Passed: X
- Failed: X
- Blocked: X
- Not Executed: X

## Test Results by Category
| Category | Total | Passed | Failed | Pass Rate |
|----------|-------|--------|--------|-----------|
| Authentication | 6 | 6 | 0 | 100% |
| Visitor Management | 6 | 5 | 1 | 83% |
| Statistics | 2 | 2 | 0 | 100% |

## Failed Test Cases
1. **TC-XXX**: Description of failure
   - **Impact**: High/Medium/Low
   - **Root Cause**: Analysis
   - **Recommendation**: Fix suggestion

## Overall Assessment
✅ **READY FOR PRODUCTION** / ⚠️ **NEEDS FIXES** / ❌ **NOT READY**
```

---

## Contact Information

### Development Team
- **Lead Developer**: [Name]
- **Backend Developer**: [Name]  
- **Frontend Developer**: [Name]
- **QA Lead**: [Name]

### Escalation Path
1. **Level 1**: QA Team Lead
2. **Level 2**: Development Team Lead
3. **Level 3**: Project Manager
4. **Level 4**: Technical Director

---

*This document should be updated with each release and maintained by the QA team in collaboration with the development team.*
