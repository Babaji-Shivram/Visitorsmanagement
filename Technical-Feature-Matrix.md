# Technical Feature Implementation Matrix

## Document Overview
This document provides a comprehensive mapping between business features and their technical implementations in the BABAJI SHIVRAM Visitor Management System.

## Feature-to-Code Mapping

### Authentication & Authorization Features

| Feature ID | Feature Name | Implementation Class | API Endpoint | Database Table |
|------------|-------------|---------------------|--------------|----------------|
| F004.1 | JWT Authentication | `AuthService.cs` | `/api/auth/login` | `Users` |
| F004.2 | Role-Based Access | `AuthController.cs` | `/api/auth/register` | `Users`, `Roles` |
| F004.3 | Permission Management | `RoleConfigurationService.cs` | `/api/roles` | `RolePermissions` |

#### Code Implementation Examples

```csharp
// F004.1: JWT Authentication Implementation
[HttpPost("login")]
public async Task<ActionResult<LoginResponseDto>> Login([FromBody] LoginRequestDto request)
{
    var result = await _authService.LoginAsync(request);
    if (result == null)
    {
        // Try staff login if regular user login fails
        var staffResult = await _authService.StaffLoginAsync(request);
        if (staffResult == null)
            return Unauthorized(new { message = "Invalid credentials" });
        
        return Ok(staffResult);
    }
    return Ok(result);
}
```

### Email Notification Features

| Feature ID | Feature Name | Implementation Class | API Endpoint | Related Service |
|------------|-------------|---------------------|--------------|-----------------|
| F006.1 | Office 365 Integration | `EmailService.cs` | `/api/email/test-connection` | SMTP Client |
| F006.2 | Staff Notifications | `EmailService.cs` | `/api/email/notify-staff/{id}` | Template Engine |
| F006.3 | Approval Emails | `EmailService.cs` | `/api/email/send-approval` | Template Processor |
| F006.4 | Rejection Emails | `EmailService.cs` | `/api/email/send-rejection` | Template Processor |
| F007.1 | Template Management | `EmailTemplateSeeder.cs` | N/A | Database Seeding |

#### Email Feature Implementation

```csharp
// F006.2: Staff Notification Implementation
public async Task<bool> SendVisitorNotificationToStaffAsync(int visitorId, string staffEmail)
{
    var visitor = await _context.Visitors.FindAsync(visitorId);
    if (visitor == null) return false;

    var template = await GetEmailTemplateAsync(EmailTemplateType.StaffNotification);
    var processedTemplate = await ProcessEmailTemplateAsync(template, new
    {
        VisitorName = $"{visitor.FirstName} {visitor.LastName}",
        StaffEmail = staffEmail,
        VisitPurpose = visitor.PurposeOfVisit,
        ExpectedArrival = visitor.ExpectedArrival.ToString("yyyy-MM-dd HH:mm"),
        CompanyName = "BABAJI SHIVRAM"
    });

    return await SendEmailAsync(new EmailNotificationRequest
    {
        ToEmail = staffEmail,
        Subject = processedTemplate.Subject,
        HtmlBody = processedTemplate.HtmlBody,
        PlainTextBody = processedTemplate.PlainTextBody
    });
}
```

### Visitor Management Features

| Feature ID | Feature Name | Implementation Class | API Endpoint | Database Operations |
|------------|-------------|---------------------|--------------|-------------------|
| F001.1 | Visitor Registration | `VisitorService.cs` | `/api/visitors` | INSERT into Visitors |
| F002.1 | Approval Workflow | `VisitorService.cs` | `/api/visitors/{id}/approve` | UPDATE Visitors.Status |
| F002.2 | Rejection Workflow | `VisitorService.cs` | `/api/visitors/{id}/reject` | UPDATE Visitors.Status |
| F003.1 | Check-In Process | `VisitorService.cs` | `/api/visitors/{id}/checkin` | UPDATE CheckInTime |
| F003.2 | Check-Out Process | `VisitorService.cs` | `/api/visitors/{id}/checkout` | UPDATE CheckOutTime |

#### Visitor Workflow Implementation

```csharp
// F002.1: Approval Workflow Implementation
public async Task<bool> ApproveVisitorAsync(int visitorId, string approvedBy, string notes = null)
{
    var visitor = await _context.Visitors.FindAsync(visitorId);
    if (visitor == null || visitor.Status != VisitorStatus.Pending)
        return false;

    visitor.Status = VisitorStatus.Approved;
    visitor.ApprovedBy = approvedBy;
    visitor.ApprovedAt = DateTime.UtcNow;
    visitor.ApprovalNotes = notes;

    await _context.SaveChangesAsync();
    
    // Send approval email notification
    await _emailService.SendApprovalEmailAsync(new ApprovalEmailRequest
    {
        VisitorId = visitorId,
        VisitorEmail = visitor.Email,
        VisitorName = $"{visitor.FirstName} {visitor.LastName}",
        VisitDate = visitor.ExpectedArrival,
        CompanyName = "BABAJI SHIVRAM"
    });

    return true;
}
```

## Database Schema Implementation

### Core Tables and Their Features

#### Users Table
```sql
-- Supports Features: F004 (Authentication), F011 (Staff Management)
CREATE TABLE Users (
    Id NVARCHAR(450) PRIMARY KEY,
    FirstName NVARCHAR(100) NOT NULL,
    LastName NVARCHAR(100) NOT NULL,
    Email NVARCHAR(256) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(MAX) NOT NULL,
    Role INT NOT NULL,                    -- F004.2: Role-Based Access
    LocationId INT NULL,                  -- F010: Multi-Location Support
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    LastLoginAt DATETIME2 NULL,
    
    CONSTRAINT FK_Users_Location FOREIGN KEY (LocationId) REFERENCES Locations(Id)
);
```

#### Visitors Table
```sql
-- Supports Features: F001 (Registration), F002 (Approval), F003 (Check-in/out)
CREATE TABLE Visitors (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    FirstName NVARCHAR(100) NOT NULL,     -- F001.1: Registration Data
    LastName NVARCHAR(100) NOT NULL,
    Email NVARCHAR(256) NOT NULL,
    Phone NVARCHAR(20),
    Company NVARCHAR(200),
    PurposeOfVisit NVARCHAR(500) NOT NULL,
    StaffToMeet NVARCHAR(256),            -- F006.2: Staff Notification Trigger
    ExpectedArrival DATETIME2 NOT NULL,   -- F001.4: Scheduling
    Status INT DEFAULT 0,                 -- F002: Approval Workflow
    CheckInTime DATETIME2 NULL,           -- F003.1: Check-In Process
    CheckOutTime DATETIME2 NULL,          -- F003.2: Check-Out Process
    ApprovedBy NVARCHAR(450) NULL,        -- F002.1: Approval Tracking
    ApprovedAt DATETIME2 NULL,
    ApprovalNotes NVARCHAR(MAX) NULL,
    RejectionReason NVARCHAR(500) NULL,   -- F002.2: Rejection Tracking
    LocationId INT NOT NULL,              -- F010: Multi-Location Support
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    
    CONSTRAINT FK_Visitors_Location FOREIGN KEY (LocationId) REFERENCES Locations(Id),
    CONSTRAINT FK_Visitors_ApprovedBy FOREIGN KEY (ApprovedBy) REFERENCES Users(Id)
);
```

#### EmailTemplates Table
```sql
-- Supports Features: F006 (Email System), F007 (Template Management)
CREATE TABLE EmailTemplates (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,          -- F007.1: Template Identification
    Subject NVARCHAR(500) NOT NULL,
    HtmlBody NTEXT NOT NULL,              -- F007.2: Rich HTML Content
    PlainTextBody NTEXT,
    TemplateType INT NOT NULL,            -- F006: Different Email Types
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE()
);
```

## API Endpoint Feature Mapping

### Authentication Endpoints
```http
POST /api/auth/login          # F004.1: JWT Authentication
POST /api/auth/register       # F004.2: User Registration (Admin only)
GET  /api/auth/me            # F004.3: Current User Information
```

### Visitor Management Endpoints
```http
GET    /api/visitors                    # F008.1: Visitor Listing
POST   /api/visitors                    # F001.1: Visitor Registration
GET    /api/visitors/{id}               # F008.2: Visitor Details
PUT    /api/visitors/{id}/approve       # F002.1: Approval Workflow
PUT    /api/visitors/{id}/reject        # F002.2: Rejection Workflow
POST   /api/visitors/{id}/checkin       # F003.1: Check-In Process
POST   /api/visitors/{id}/checkout      # F003.2: Check-Out Process
```

### Email Management Endpoints
```http
POST /api/email/test-connection         # F006.1: SMTP Testing
POST /api/email/notify-staff/{id}       # F006.2: Staff Notifications
POST /api/email/send-approval           # F006.3: Approval Emails
POST /api/email/send-rejection          # F006.4: Rejection Emails
POST /api/email/send-checkin            # F006.5: Check-In Confirmations
POST /api/email/send-checkout           # F006.6: Check-Out Thank You
```

## Service Layer Architecture

### Core Services and Their Features

#### AuthService.cs
```csharp
// Features Implemented: F004 (Authentication & Authorization)
public class AuthService : IAuthService
{
    // F004.1: JWT Token Generation
    public async Task<LoginResponseDto> LoginAsync(LoginRequestDto request)
    
    // F004.2: Staff Authentication
    public async Task<LoginResponseDto> StaffLoginAsync(LoginRequestDto request)
    
    // F004.3: User Registration
    public async Task<UserDto> RegisterAsync(RegisterRequestDto request)
    
    // F004.4: Token Validation
    public async Task<bool> ValidateTokenAsync(string token)
}
```

#### EmailService.cs
```csharp
// Features Implemented: F006 (Email System), F007 (Templates)
public class EmailService : IEmailService
{
    // F006.1: SMTP Connection Testing
    public async Task<bool> TestConnectionAsync()
    
    // F006.2: Staff Notification System
    public async Task<bool> SendVisitorNotificationToStaffAsync(int visitorId, string staffEmail)
    
    // F006.3-6: Various Email Types
    public async Task<bool> SendApprovalEmailAsync(ApprovalEmailRequest request)
    public async Task<bool> SendRejectionEmailAsync(RejectionEmailRequest request)
    
    // F007.1: Template Processing
    private async Task<EmailTemplate> ProcessEmailTemplateAsync(EmailTemplate template, object data)
}
```

#### VisitorService.cs
```csharp
// Features Implemented: F001 (Registration), F002 (Approval), F003 (Check-in/out)
public class VisitorService : IVisitorService
{
    // F001.1: Visitor Registration
    public async Task<VisitorDto> CreateVisitorAsync(CreateVisitorRequestDto request)
    
    // F002.1: Approval Workflow
    public async Task<bool> ApproveVisitorAsync(int visitorId, string approvedBy, string notes)
    
    // F002.2: Rejection Workflow  
    public async Task<bool> RejectVisitorAsync(int visitorId, string rejectedBy, string reason)
    
    // F003.1: Check-In Process
    public async Task<bool> CheckInVisitorAsync(int visitorId, CheckInRequestDto request)
    
    // F003.2: Check-Out Process
    public async Task<bool> CheckOutVisitorAsync(int visitorId, CheckOutRequestDto request)
    
    // F008.1: Visitor Analytics
    public async Task<VisitorAnalyticsDto> GetVisitorAnalyticsAsync(AnalyticsRequestDto request)
}
```

## Configuration and Environment Features

### Feature F013: Business Rules Configuration
```json
// appsettings.json - Business Rules Implementation
{
  "BusinessRules": {
    "DefaultVisitDuration": 120,           // F013.1: Visit Duration Limits
    "RequireApprovalForAllVisits": true,   // F013.2: Approval Requirements
    "MaxVisitorsPerDay": 100,              // F013.3: Capacity Management
    "AutoApproveReturnVisitors": false,    // F013.4: Repeat Visitor Rules
    "ApprovalTimeoutHours": 24,            // F013.5: Approval Deadlines
    "MaxConcurrentVisitors": 50            // F013.6: Real-time Capacity
  }
}
```

### Feature F012: Email Configuration
```json
// EmailSettings Configuration - F006 Implementation
{
  "EmailSettings": {
    "SmtpServer": "smtp.office365.com",    // F006.1: Office 365 Integration
    "Port": 587,
    "Username": "gogulan.a@babajishivram.com",
    "Password": "Sri23ram",
    "EnableSsl": true,
    "FromEmail": "gogulan.a@babajishivram.com",
    "FromName": "BABAJI SHIVRAM Visitor Management System"
  }
}
```

## Testing and Quality Assurance

### Feature Testing Matrix

| Feature Category | Unit Tests | Integration Tests | API Tests | UI Tests |
|-----------------|------------|-------------------|-----------|----------|
| Authentication | ✅ AuthService Tests | ✅ Login Flow | ✅ JWT Validation | ✅ Login Page |
| Email System | ✅ Template Processing | ✅ SMTP Connection | ✅ Email Endpoints | ✅ Email Preview |
| Visitor Management | ✅ Business Logic | ✅ Database Operations | ✅ CRUD Operations | ✅ Forms & Lists |
| Authorization | ✅ Role Validation | ✅ Permission Checks | ✅ Protected Endpoints | ✅ Access Control |

### Test Implementation Examples

```csharp
// F004.1: Authentication Feature Test
[Test]
public async Task LoginAsync_ValidCredentials_ReturnsToken()
{
    // Arrange
    var request = new LoginRequestDto 
    { 
        Email = "admin@company.com", 
        Password = "Admin123!" 
    };
    
    // Act
    var result = await _authService.LoginAsync(request);
    
    // Assert
    Assert.IsNotNull(result);
    Assert.IsNotEmpty(result.Token);
    Assert.AreEqual("admin@company.com", result.User.Email);
}

// F006.2: Email Notification Feature Test
[Test]
public async Task SendStaffNotification_ValidVisitor_SendsEmail()
{
    // Arrange
    var visitorId = 1;
    var staffEmail = "staff@company.com";
    
    // Act
    var result = await _emailService.SendVisitorNotificationToStaffAsync(visitorId, staffEmail);
    
    // Assert
    Assert.IsTrue(result);
    // Verify email was sent (mock verification)
}
```

## Performance and Scalability Implementation

### Feature F018: Performance Optimization

#### Caching Implementation
```csharp
// F019.1: Memory Caching for Templates
public async Task<EmailTemplate> GetEmailTemplateAsync(EmailTemplateType type)
{
    var cacheKey = $"email_template_{type}";
    if (_memoryCache.TryGetValue(cacheKey, out EmailTemplate cachedTemplate))
    {
        return cachedTemplate;
    }
    
    var template = await _context.EmailTemplates
        .FirstOrDefaultAsync(t => t.TemplateType == type && t.IsActive);
    
    _memoryCache.Set(cacheKey, template, TimeSpan.FromHours(1));
    return template;
}
```

#### Database Optimization
```csharp
// F018.2: Optimized Visitor Queries with Pagination
public async Task<PagedResult<VisitorDto>> GetVisitorsAsync(VisitorSearchCriteria criteria)
{
    var query = _context.Visitors
        .Include(v => v.Location)
        .Where(v => v.LocationId == criteria.LocationId);
    
    if (criteria.Status.HasValue)
        query = query.Where(v => v.Status == criteria.Status.Value);
    
    if (!string.IsNullOrEmpty(criteria.SearchTerm))
        query = query.Where(v => v.FirstName.Contains(criteria.SearchTerm) || 
                                v.LastName.Contains(criteria.SearchTerm));
    
    var totalCount = await query.CountAsync();
    var visitors = await query
        .OrderByDescending(v => v.CreatedAt)
        .Skip((criteria.Page - 1) * criteria.PageSize)
        .Take(criteria.PageSize)
        .ToListAsync();
    
    return new PagedResult<VisitorDto>
    {
        Items = _mapper.Map<List<VisitorDto>>(visitors),
        TotalCount = totalCount,
        Page = criteria.Page,
        PageSize = criteria.PageSize
    };
}
```

## Monitoring and Logging Implementation

### Feature F014: Audit Logging
```csharp
// Audit Trail Implementation for All Features
public class AuditLogger
{
    public async Task LogActionAsync(string userId, string action, string resourceType, 
                                   string resourceId, object details = null)
    {
        var auditLog = new AuditLogEntry
        {
            UserId = userId,
            Action = action,
            ResourceType = resourceType,
            ResourceId = resourceId,
            Timestamp = DateTime.UtcNow,
            IpAddress = _httpContextAccessor.HttpContext?.Connection?.RemoteIpAddress?.ToString(),
            UserAgent = _httpContextAccessor.HttpContext?.Request?.Headers["User-Agent"],
            Details = JsonSerializer.Serialize(details),
            RiskLevel = DetermineRiskLevel(action, resourceType)
        };
        
        _context.AuditLogs.Add(auditLog);
        await _context.SaveChangesAsync();
    }
}
```

---

## Summary

This Technical Feature Implementation Matrix provides a comprehensive mapping between business features and their technical implementations in the BABAJI SHIVRAM Visitor Management System. Each feature is traceable from requirements through code implementation, database design, API endpoints, and testing strategies.

### Key Implementation Highlights:

1. **Modular Architecture**: Features are implemented across distinct service layers
2. **Database Design**: Schema supports all feature requirements with proper relationships
3. **API Design**: RESTful endpoints map directly to feature capabilities
4. **Testing Coverage**: Comprehensive testing strategy covers all feature areas
5. **Performance**: Optimized implementations for scalability and responsiveness
6. **Security**: Built-in audit logging and security measures for all features

This matrix serves as both a technical reference and a validation tool to ensure all features are properly implemented and testable.

---

*Document Version: 1.0.0*  
*Last Updated: August 5, 2025*  
*© 2025 BABAJI SHIVRAM. All rights reserved.*
