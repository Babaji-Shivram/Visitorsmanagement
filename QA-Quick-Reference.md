# Visitor Management System - Test Execution Checklist

## Quick Start Guide for QA Team

### Pre-Testing Setup (5 minutes)
1. **Environment Check**:
   ```bash
   # Run this first - it validates everything is working
   cd d:\Visitor
   node test-integration.js
   ```
   ✅ **Must show**: "ALL TESTS PASSED! Your local integration is working perfectly!"

2. **Manual Verification**:
   - Backend API: http://localhost:9524 (should show 404 - this is correct)
   - Frontend App: http://localhost:5176 (should load visitor management interface)

---

## Daily Testing Routine

### Phase 1: Smoke Tests (15 minutes)
**Goal**: Verify system is operational

#### ✅ System Health
- [ ] Backend server responds (http://localhost:9524)
- [ ] Frontend loads without errors (http://localhost:5176)
- [ ] No console errors in browser

#### ✅ Authentication Quick Test
- [ ] Admin login: `admin@company.com` / `Admin123!`
- [ ] Reception login: `reception@company.com` / `Reception123!`
- [ ] Staff login: `emily.watson@company.com` / `Staff123!`

### Phase 2: Core Functionality (30 minutes)
**Goal**: Test main user workflows

#### ✅ Visitor Registration Flow
1. **Login as Reception**
2. **Register New Visitor**:
   ```
   Name: QA Test Visitor [Current Date/Time]
   Phone: +1555000[last 4 digits of timestamp]
   Email: qatest[timestamp]@example.com
   Company: QA Test Company
   Purpose: Daily QA Testing
   Meeting: Development Team
   Location: Corporate Office
   ```
3. **Verify**: Visitor appears in pending list

#### ✅ Approval Workflow
1. **Login as Staff**
2. **Find**: Test visitor from previous step
3. **Approve**: Set status to "Approved"
4. **Verify**: Status updated, approver recorded

#### ✅ Statistics Validation
1. **Login as Admin**
2. **Check**: Dashboard shows updated counts
3. **Verify**: Total, pending, and approved numbers are logical

### Phase 3: Edge Cases (20 minutes)
**Goal**: Test error conditions and validations

#### ✅ Input Validation
- [ ] Try to create visitor with missing required fields
- [ ] Test invalid email format: `invalid-email`
- [ ] Test invalid phone: `abc123`
- [ ] Verify appropriate error messages shown

#### ✅ Authentication Edge Cases
- [ ] Try invalid login credentials
- [ ] Test access to protected pages without login
- [ ] Verify proper error handling

---

## Weekly Deep Testing (2 hours)

### API Testing with PowerShell
```powershell
# Copy and paste this entire script to test all APIs

# Test 1: Get authentication token
Write-Host "🔐 Testing Authentication..." -ForegroundColor Yellow
$loginBody = @{
    email = "admin@company.com"
    password = "Admin123!"
} | ConvertTo-Json

try {
    $authResponse = Invoke-RestMethod -Uri "http://localhost:9524/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $token = $authResponse.token
    Write-Host "✅ Authentication successful" -ForegroundColor Green
} catch {
    Write-Host "❌ Authentication failed: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# Test 2: Get users
Write-Host "`n👥 Testing User Management..." -ForegroundColor Yellow
$headers = @{ "Authorization" = "Bearer $token" }
try {
    $users = Invoke-RestMethod -Uri "http://localhost:9524/api/auth/users" -Headers $headers
    Write-Host "✅ Retrieved $($users.Length) users" -ForegroundColor Green
} catch {
    Write-Host "❌ User retrieval failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Create visitor
Write-Host "`n🚶 Testing Visitor Creation..." -ForegroundColor Yellow
$visitorData = @{
    fullName = "PowerShell Test Visitor $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
    phoneNumber = "+1555$(Get-Random -Minimum 100000 -Maximum 999999)"
    email = "pstest$(Get-Random)@example.com"
    companyName = "PowerShell Test Co"
    purposeOfVisit = "Automated API Testing"
    whomToMeet = "QA Team"
    dateTime = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
    locationId = 3
} | ConvertTo-Json

try {
    $visitor = Invoke-RestMethod -Uri "http://localhost:9524/api/visitors" -Method POST -Body $visitorData -Headers @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    Write-Host "✅ Created visitor with ID: $($visitor.id)" -ForegroundColor Green
    $visitorId = $visitor.id
} catch {
    Write-Host "❌ Visitor creation failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Get visitors
Write-Host "`n📋 Testing Visitor Retrieval..." -ForegroundColor Yellow
try {
    $visitors = Invoke-RestMethod -Uri "http://localhost:9524/api/visitors" -Headers $headers
    Write-Host "✅ Retrieved $($visitors.Length) visitors" -ForegroundColor Green
} catch {
    Write-Host "❌ Visitor retrieval failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Update visitor status
if ($visitorId) {
    Write-Host "`n✅ Testing Visitor Status Update..." -ForegroundColor Yellow
    $statusUpdate = @{
        status = "approved"
        approvedBy = "PowerShell QA Test"
    } | ConvertTo-Json

    try {
        Invoke-RestMethod -Uri "http://localhost:9524/api/visitors/$visitorId/status" -Method PUT -Body $statusUpdate -Headers @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json"
        }
        Write-Host "✅ Visitor status updated successfully" -ForegroundColor Green
    } catch {
        Write-Host "❌ Status update failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 6: Get statistics
Write-Host "`n📊 Testing Statistics..." -ForegroundColor Yellow
try {
    $stats = Invoke-RestMethod -Uri "http://localhost:9524/api/visitors/stats" -Headers $headers
    Write-Host "✅ Statistics retrieved: Total=$($stats.total), Awaiting=$($stats.awaiting), Approved=$($stats.approved)" -ForegroundColor Green
} catch {
    Write-Host "❌ Statistics retrieval failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 API Testing Complete!" -ForegroundColor Cyan
```

### Browser Testing Matrix
Test in each supported browser:

#### Chrome Testing
1. Open Chrome
2. Navigate to http://localhost:5176
3. Open Developer Tools (F12)
4. Run through core workflows
5. Check for console errors

#### Firefox Testing
1. Open Firefox
2. Navigate to http://localhost:5176
3. Open Developer Tools (F12)
4. Run through core workflows
5. Check for console errors

#### Edge Testing
1. Open Edge
2. Navigate to http://localhost:5176
3. Open Developer Tools (F12)
4. Run through core workflows
5. Check for console errors

---

## Security Testing Checklist

### Input Security Tests
```javascript
// Test these inputs in visitor registration form:
// Copy each line and paste into form fields to test

// SQL Injection attempts:
'; DROP TABLE Visitors; --
' OR '1'='1
1; DELETE FROM Users WHERE 1=1; --

// XSS attempts:
<script>alert('XSS')</script>
javascript:alert('XSS')
<img src=x onerror=alert('XSS')>

// Expected Result: All should be safely handled without executing
```

### Authentication Security
- [ ] Try accessing admin features as reception user
- [ ] Try accessing protected APIs without token
- [ ] Test with expired/invalid JWT tokens
- [ ] Verify password complexity requirements

---

## Performance Testing

### Load Testing Script
```bash
# Install Apache Bench (if not available)
# Windows: Download from Apache website
# Mac: brew install httpd
# Linux: sudo apt-get install apache2-utils

# Test login endpoint under load
ab -n 100 -c 10 -H "Content-Type: application/json" -p login-data.json http://localhost:9524/api/auth/login

# Create login-data.json file:
echo '{"email":"admin@company.com","password":"Admin123!"}' > login-data.json
```

### Performance Benchmarks
- API Response Time: < 2 seconds ✅
- Page Load Time: < 3 seconds ✅
- Database Operations: < 500ms ✅

---

## Bug Reporting Quick Template

```markdown
**Bug ID**: BUG-2025-08-02-XXX
**Severity**: Critical/High/Medium/Low
**Found By**: [Your Name]
**Date**: [Date]

**Summary**: Brief description

**Steps to Reproduce**:
1. Login as [role]
2. Navigate to [page]
3. Perform [action]
4. Observe [result]

**Expected**: What should happen
**Actual**: What actually happened

**Environment**:
- Browser: [Chrome/Firefox/Edge + version]
- OS: Windows
- Backend: Running on localhost:9524
- Frontend: Running on localhost:5176

**Screenshots**: [Attach if applicable]
**Console Errors**: [Copy any JavaScript errors]
```

---

## Test Status Dashboard

### Current System Status
| Component | Status | Last Tested | Notes |
|-----------|--------|-------------|-------|
| Backend API | ✅ | [Date] | All endpoints functional |
| Frontend | ✅ | [Date] | No console errors |
| Database | ✅ | [Date] | All operations working |
| Authentication | ✅ | [Date] | All roles working |
| Visitor Management | ✅ | [Date] | Full CRUD working |
| Statistics | ✅ | [Date] | Real-time updates |

### Test Coverage Summary
- **Unit Tests**: Automated (test-integration.js)
- **Integration Tests**: Automated + Manual
- **UI Tests**: Manual
- **API Tests**: PowerShell scripts
- **Security Tests**: Manual checklist
- **Performance**: Load testing available

---

## Emergency Procedures

### If System is Down
1. **Check Services**:
   ```bash
   # Check if processes are running
   netstat -ano | findstr :9524  # Backend
   netstat -ano | findstr :5176  # Frontend
   ```

2. **Restart Backend**:
   ```bash
   cd VisitorManagement.API
   dotnet run
   ```

3. **Restart Frontend**:
   ```bash
   npm run dev
   ```

4. **Verify with Integration Test**:
   ```bash
   node test-integration.js
   ```

### If Database Issues
1. **Reset Database**:
   ```bash
   cd VisitorManagement.API
   dotnet ef database drop
   dotnet ef database update
   ```

2. **Verify with Test**:
   ```bash
   node test-integration.js
   ```

---

## Contact for Issues

### Escalation Path
1. **First**: Run `node test-integration.js` to verify issue
2. **Second**: Check this troubleshooting guide
3. **Third**: Contact development team with:
   - Screenshot of error
   - Console logs
   - Steps to reproduce
   - Results of integration test

---

**Remember**: Always run `node test-integration.js` first - if it shows "ALL TESTS PASSED", the system is working correctly for development and testing!
