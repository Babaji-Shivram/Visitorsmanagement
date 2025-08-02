# Visitor Management System - Test Data & Scenarios

## Test User Accounts

### Default System Users
```json
{
  "admin": {
    "email": "admin@company.com",
    "password": "Admin123!",
    "role": "Administrator",
    "permissions": [
      "user_management",
      "visitor_management", 
      "system_settings",
      "view_statistics",
      "approve_visitors"
    ]
  },
  "reception": {
    "email": "reception@company.com",
    "password": "Reception123!",
    "role": "Reception",
    "permissions": [
      "visitor_registration",
      "visitor_management",
      "view_statistics"
    ]
  },
  "staff": {
    "email": "emily.watson@company.com",
    "password": "Staff123!",
    "role": "Staff",
    "permissions": [
      "approve_visitors",
      "reject_visitors",
      "view_visitors"
    ]
  }
}
```

---

## Test Visitor Data Sets

### Valid Visitor Data

#### Scenario 1: Standard Business Visitor
```json
{
  "fullName": "John Anderson",
  "phoneNumber": "+1234567890",
  "email": "john.anderson@businesscorp.com",
  "companyName": "Business Corp",
  "purposeOfVisit": "Business Meeting",
  "whomToMeet": "Sarah Johnson",
  "dateTime": "2025-08-02T14:30:00Z",
  "locationId": 3,
  "expectedDuration": "2 hours",
  "notes": "Important client meeting regarding Q3 contracts"
}
```

#### Scenario 2: Contractor/Vendor Visit
```json
{
  "fullName": "Mike Rodriguez",
  "phoneNumber": "+1555123456",
  "email": "mike.rodriguez@techsolutions.com",
  "companyName": "Tech Solutions Inc",
  "purposeOfVisit": "System Maintenance",
  "whomToMeet": "IT Department",
  "dateTime": "2025-08-02T09:00:00Z",
  "locationId": 3,
  "expectedDuration": "4 hours",
  "notes": "Scheduled server maintenance and security updates"
}
```

#### Scenario 3: Delivery/Courier
```json
{
  "fullName": "Lisa Chen",
  "phoneNumber": "+1444987654",
  "email": "lisa.chen@expressdelivery.com",
  "companyName": "Express Delivery Service",
  "purposeOfVisit": "Package Delivery",
  "whomToMeet": "Reception Desk",
  "dateTime": "2025-08-02T11:15:00Z",
  "locationId": 3,
  "expectedDuration": "15 minutes",
  "notes": "Urgent package delivery for Finance Department"
}
```

#### Scenario 4: Job Interview
```json
{
  "fullName": "David Thompson",
  "phoneNumber": "+1333654321",
  "email": "david.thompson@email.com",
  "companyName": "N/A",
  "purposeOfVisit": "Job Interview",
  "whomToMeet": "HR Department - Amanda Wilson",
  "dateTime": "2025-08-02T16:00:00Z",
  "locationId": 3,
  "expectedDuration": "1 hour",
  "notes": "Senior Developer position interview"
}
```

#### Scenario 5: VIP/Executive Visit
```json
{
  "fullName": "Robert Sterling",
  "phoneNumber": "+1777888999",
  "email": "robert.sterling@globalpartners.com",
  "companyName": "Global Partners LLC",
  "purposeOfVisit": "Executive Meeting",
  "whomToMeet": "CEO - Executive Team",
  "dateTime": "2025-08-02T10:00:00Z",
  "locationId": 3,
  "expectedDuration": "3 hours",
  "notes": "High-priority partnership discussion - VIP treatment required"
}
```

### Edge Case Data Sets

#### Scenario 6: International Visitor
```json
{
  "fullName": "Hiroshi Tanaka",
  "phoneNumber": "+81-3-1234-5678",
  "email": "hiroshi.tanaka@japancorp.co.jp",
  "companyName": "Japan Corp Ltd",
  "purposeOfVisit": "International Partnership",
  "whomToMeet": "International Relations",
  "dateTime": "2025-08-02T13:00:00Z",
  "locationId": 3,
  "expectedDuration": "2 hours",
  "notes": "Requires Japanese translator - cultural considerations needed"
}
```

#### Scenario 7: Group Visit
```json
{
  "fullName": "Maria Gonzalez (Group Leader)",
  "phoneNumber": "+1666777888",
  "email": "maria.gonzalez@universitycorp.edu",
  "companyName": "University Corp - Business School",
  "purposeOfVisit": "Educational Tour",
  "whomToMeet": "Public Relations",
  "dateTime": "2025-08-02T15:30:00Z",
  "locationId": 3,
  "expectedDuration": "90 minutes",
  "notes": "Group of 15 business students - tour and presentation"
}
```

#### Scenario 8: Emergency/Urgent Visit
```json
{
  "fullName": "James Wilson",
  "phoneNumber": "+1999888777",
  "email": "james.wilson@legalfirm.com",
  "companyName": "Wilson & Associates Legal",
  "purposeOfVisit": "Urgent Legal Matter",
  "whomToMeet": "Legal Department - Chief Counsel",
  "dateTime": "2025-08-02T08:30:00Z",
  "locationId": 3,
  "expectedDuration": "Unknown",
  "notes": "URGENT - Time-sensitive legal documentation"
}
```

---

## Invalid Data Test Cases

### Missing Required Fields
```json
{
  "testCase": "Missing Full Name",
  "data": {
    "phoneNumber": "+1234567890",
    "email": "test@example.com",
    "companyName": "Test Company",
    "purposeOfVisit": "Testing",
    "whomToMeet": "Test Person",
    "dateTime": "2025-08-02T14:00:00Z",
    "locationId": 3
  },
  "expectedError": "Full name is required"
}
```

```json
{
  "testCase": "Missing Email",
  "data": {
    "fullName": "Test User",
    "phoneNumber": "+1234567890",
    "companyName": "Test Company",
    "purposeOfVisit": "Testing",
    "whomToMeet": "Test Person",
    "dateTime": "2025-08-02T14:00:00Z",
    "locationId": 3
  },
  "expectedError": "Email is required"
}
```

### Invalid Format Data
```json
{
  "testCase": "Invalid Email Format",
  "data": {
    "fullName": "Test User",
    "phoneNumber": "+1234567890",
    "email": "invalid-email-format",
    "companyName": "Test Company",
    "purposeOfVisit": "Testing",
    "whomToMeet": "Test Person",
    "dateTime": "2025-08-02T14:00:00Z",
    "locationId": 3
  },
  "expectedError": "Invalid email format"
}
```

```json
{
  "testCase": "Invalid Phone Number",
  "data": {
    "fullName": "Test User",
    "phoneNumber": "invalid-phone",
    "email": "test@example.com",
    "companyName": "Test Company",
    "purposeOfVisit": "Testing",
    "whomToMeet": "Test Person",
    "dateTime": "2025-08-02T14:00:00Z",
    "locationId": 3
  },
  "expectedError": "Invalid phone number format"
}
```

### Invalid Location ID
```json
{
  "testCase": "Non-existent Location",
  "data": {
    "fullName": "Test User",
    "phoneNumber": "+1234567890", 
    "email": "test@example.com",
    "companyName": "Test Company",
    "purposeOfVisit": "Testing",
    "whomToMeet": "Test Person",
    "dateTime": "2025-08-02T14:00:00Z",
    "locationId": 999
  },
  "expectedError": "Invalid location ID"
}
```

---

## Security Test Data

### SQL Injection Attempts
```javascript
const sqlInjectionPayloads = [
  "'; DROP TABLE Visitors; --",
  "' OR '1'='1",
  "1; DELETE FROM Users WHERE 1=1; --",
  "admin'--",
  "' UNION SELECT * FROM Users --",
  "'; EXEC xp_cmdshell('dir'); --"
];

// Test each payload in visitor form fields
// Expected: All should be safely escaped/rejected
```

### Cross-Site Scripting (XSS) Attempts
```javascript
const xssPayloads = [
  "<script>alert('XSS')</script>",
  "javascript:alert('XSS')",
  "<img src=x onerror=alert('XSS')>",
  "<svg onload=alert('XSS')>",
  "<iframe src=javascript:alert('XSS')></iframe>",
  "'\"><script>alert('XSS')</script>"
];

// Test each payload in visitor form fields
// Expected: All should be safely escaped in output
```

### Authentication Bypass Attempts
```javascript
const authBypassPayloads = [
  {
    "email": "admin@company.com' OR '1'='1",
    "password": "anything"
  },
  {
    "email": "'; DROP TABLE Users; --",
    "password": "password"
  },
  {
    "email": "",
    "password": ""
  }
];

// Expected: All should fail authentication properly
```

---

## Performance Test Data

### Load Testing Scenarios

#### Scenario A: Peak Registration Hours
```javascript
// Simulate reception desk during busy morning hours
const peakHourData = {
  concurrentUsers: 5,
  operationsPerMinute: 20,
  duration: "30 minutes",
  operations: [
    "visitor_registration", 
    "visitor_lookup",
    "status_update"
  ]
};
```

#### Scenario B: Staff Approval Rush
```javascript
// Simulate multiple staff members processing approvals
const approvalRushData = {
  concurrentUsers: 3,
  operationsPerMinute: 15,
  duration: "15 minutes", 
  operations: [
    "get_pending_visitors",
    "approve_visitor",
    "reject_visitor",
    "update_status"
  ]
};
```

#### Scenario C: Report Generation Load
```javascript
// Simulate multiple users accessing statistics
const reportLoadData = {
  concurrentUsers: 10,
  operationsPerMinute: 30,
  duration: "10 minutes",
  operations: [
    "get_visitor_stats",
    "get_visitor_list",
    "generate_reports"
  ]
};
```

---

## Database Test Scenarios

### Data Integrity Tests

#### Scenario 1: Foreign Key Constraints
```sql
-- Test visitor with invalid locationId
INSERT INTO Visitors (FullName, Email, LocationId) 
VALUES ('Test User', 'test@example.com', 999);
-- Expected: Foreign key constraint violation
```

#### Scenario 2: Unique Constraints
```sql  
-- Test duplicate user emails
INSERT INTO Users (Email, Password, Role)
VALUES ('admin@company.com', 'password', 'Admin');
-- Expected: Unique constraint violation
```

#### Scenario 3: Required Field Constraints
```sql
-- Test null values in required fields
INSERT INTO Visitors (PhoneNumber, Email) 
VALUES ('+1234567890', 'test@example.com');
-- Expected: Not null constraint violation for FullName
```

---

## Workflow Test Scenarios

### End-to-End User Journeys

#### Journey 1: Complete Visitor Lifecycle
1. **Reception**: Register new visitor
2. **System**: Send notification to staff
3. **Staff**: Review and approve visitor
4. **Reception**: Check visitor in upon arrival
5. **System**: Update statistics
6. **Reception**: Check visitor out upon departure
7. **Admin**: Review daily statistics

#### Journey 2: Visitor Rejection Flow
1. **Reception**: Register visitor with suspicious details
2. **Staff**: Review visitor information
3. **Staff**: Reject visitor with reason
4. **System**: Send rejection notification
5. **Reception**: Inform visitor of rejection
6. **Admin**: Review rejection statistics

#### Journey 3: Emergency/VIP Processing
1. **Reception**: Register VIP/urgent visitor
2. **System**: Flag as high priority
3. **Staff**: Fast-track approval
4. **Reception**: Immediate check-in
5. **System**: Special handling protocols
6. **Admin**: Monitor VIP experience

---

## Browser Compatibility Test Matrix

### Test Scenarios by Browser

#### Chrome (Primary Support)
- [ ] All form submissions work
- [ ] File uploads function (if applicable)
- [ ] Real-time updates display
- [ ] Print functionality works
- [ ] Mobile responsive design

#### Firefox (Secondary Support)  
- [ ] Core functionality works
- [ ] CSS renders correctly
- [ ] JavaScript executes properly
- [ ] Form validation works

#### Edge (Windows Compatibility)
- [ ] Integration with Windows features
- [ ] Corporate network compatibility
- [ ] Group policy compliance
- [ ] ActiveDirectory integration (if applicable)

#### Safari (Limited Support)
- [ ] Basic functionality works
- [ ] WebKit-specific features
- [ ] iOS Safari compatibility
- [ ] Mac-specific behaviors

---

## Accessibility Test Scenarios

### WCAG 2.1 Compliance Tests

#### Keyboard Navigation
- [ ] Tab through all form elements
- [ ] Access all buttons via Enter/Space
- [ ] Navigate menus with arrow keys
- [ ] Skip links work properly

#### Screen Reader Compatibility
- [ ] Form labels properly associated
- [ ] Error messages announced
- [ ] Status updates communicated
- [ ] Navigation landmarks defined

#### Visual Accessibility
- [ ] Color contrast meets standards
- [ ] Text scales to 200% without scrolling
- [ ] Focus indicators visible
- [ ] Alternative text for images

---

## Mobile Responsiveness Test Data

### Device Test Matrix
```javascript
const deviceTests = [
  {
    device: "iPhone 12",
    viewport: "390x844",
    userAgent: "Mobile Safari",
    tests: ["touch_navigation", "form_input", "responsive_layout"]
  },
  {
    device: "Samsung Galaxy S21",
    viewport: "384x854", 
    userAgent: "Chrome Mobile",
    tests: ["android_compatibility", "touch_gestures", "keyboard_input"]
  },
  {
    device: "iPad Pro",
    viewport: "1024x1366",
    userAgent: "Safari",
    tests: ["tablet_layout", "split_screen", "apple_pencil"]
  }
];
```

### Mobile User Scenarios
1. **Reception on Tablet**: Register visitors using tablet interface
2. **Staff on Phone**: Approve visitors during mobile rounds
3. **Admin on Mobile**: Check statistics during travel

---

## Integration Test Scenarios

### Third-Party Service Integration
```javascript
// Test scenarios for external integrations
const integrationTests = [
  {
    service: "Email Notifications",
    tests: [
      "visitor_registration_email",
      "approval_notification_email", 
      "rejection_notification_email"
    ]
  },
  {
    service: "SMS Notifications", 
    tests: [
      "visitor_arrival_sms",
      "approval_status_sms",
      "meeting_reminder_sms"
    ]
  },
  {
    service: "Badge Printing",
    tests: [
      "print_visitor_badge",
      "print_temporary_id",
      "print_access_card"
    ]
  }
];
```

---

## Error Handling Test Cases

### Network Error Scenarios
```javascript
const networkErrorTests = [
  {
    scenario: "API Server Down",
    simulation: "Stop backend server",
    expectedBehavior: "Show offline message, cache data locally"
  },
  {
    scenario: "Slow Network",
    simulation: "Throttle connection to 2G speeds", 
    expectedBehavior: "Show loading indicators, timeout gracefully"
  },
  {
    scenario: "Intermittent Connection",
    simulation: "Random network drops",
    expectedBehavior: "Retry failed requests, sync when reconnected"
  }
];
```

### Database Error Scenarios
```javascript
const dbErrorTests = [
  {
    scenario: "Database Connection Lost",
    simulation: "Stop SQL Server service",
    expectedBehavior: "Return 500 error, log issue, attempt reconnection"
  },
  {
    scenario: "Database Lock/Timeout", 
    simulation: "Long-running query blocking",
    expectedBehavior: "Timeout gracefully, return appropriate error"
  },
  {
    scenario: "Disk Space Full",
    simulation: "Fill database drive to capacity",
    expectedBehavior: "Prevent data corruption, alert administrators"
  }
];
```

---

This comprehensive test data document provides your QA team with realistic scenarios, edge cases, and systematic test approaches to thoroughly validate the Visitor Management System.
