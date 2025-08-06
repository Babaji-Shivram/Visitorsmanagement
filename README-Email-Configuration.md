# Email Notification System Configuration

## Overview
This document provides instructions for configuring the email notification system with Exchange Server for the Visitor Management System.

## Exchange Server Configuration Requirements

### 1. Exchange Server Connection Methods

#### Option A: SMTP Configuration (Recommended)
For most Exchange Server setups, SMTP is the simplest approach:

```json
{
  "EmailSettings": {
    "SmtpServer": "your-exchange-server.domain.com",
    "SmtpPort": 587,
    "EnableSsl": true,
    "Username": "service-account@yourdomain.com",
    "Password": "service-account-password",
    "FromName": "Visitor Management System",
    "FromEmail": "noreply@yourdomain.com",
    "TimeoutSeconds": 30,
    "UseExchangeWebServices": false
  }
}
```

#### Option B: Exchange Web Services (EWS)
For advanced Exchange integration:

```json
{
  "EmailSettings": {
    "UseExchangeWebServices": true,
    "ExchangeServerUrl": "https://your-exchange-server.domain.com/EWS/Exchange.asmx",
    "ExchangeDomain": "YOURDOMAIN",
    "ExchangeVersion": "Exchange2016",
    "Username": "service-account@yourdomain.com",
    "Password": "service-account-password",
    "FromName": "Visitor Management System",
    "FromEmail": "noreply@yourdomain.com"
  }
}
```

### 2. Exchange Server Prerequisites

#### Service Account Setup
1. Create a dedicated service account in Active Directory
2. Grant the following permissions:
   - **Send As** permission on the mailbox/distribution group
   - **Send on Behalf** permission (if using shared mailbox)
   - **Impersonation** rights (for EWS only)

#### Network Configuration
1. Ensure the application server can reach Exchange Server on required ports:
   - **SMTP**: Port 587 (with STARTTLS) or 25
   - **EWS**: Port 443 (HTTPS)
2. Configure firewall rules if necessary
3. Verify DNS resolution for Exchange Server FQDN

#### Exchange Server Settings
1. **Enable SMTP AUTH** (if using SMTP):
   ```powershell
   Set-TransportConfig -SmtpClientAuthenticationDisabled $false
   ```

2. **Configure receive connector** (if using SMTP):
   ```powershell
   Set-ReceiveConnector "Client Frontend ServerName" -AuthMechanism Tls, BasicAuth, BasicAuthRequireTLS
   ```

3. **Enable EWS** (if using EWS):
   ```powershell
   Set-WebServicesVirtualDirectory -Identity "EWS (Default Web Site)" -ExternalUrl "https://your-exchange-server.domain.com/EWS/Exchange.asmx"
   ```

### 3. Common Exchange Server Configurations

#### Exchange 2016/2019 On-Premises
```json
{
  "SmtpServer": "mail.yourdomain.com",
  "SmtpPort": 587,
  "EnableSsl": true,
  "ExchangeVersion": "Exchange2016"
}
```

#### Exchange Online (Office 365)
```json
{
  "SmtpServer": "smtp.office365.com",
  "SmtpPort": 587,
  "EnableSsl": true,
  "ExchangeVersion": "ExchangeOnline"
}
```

#### Exchange 2013
```json
{
  "SmtpServer": "your-exchange-2013.domain.com",
  "SmtpPort": 587,
  "EnableSsl": true,
  "ExchangeVersion": "Exchange2013"
}
```

### 4. Authentication Methods

#### Basic Authentication
Most common for service accounts:
```json
{
  "Username": "service-account@yourdomain.com",
  "Password": "your-secure-password"
}
```

#### Modern Authentication (OAuth 2.0)
For Exchange Online with modern auth:
```json
{
  "ClientId": "your-app-registration-id",
  "ClientSecret": "your-app-secret",
  "TenantId": "your-tenant-id"
}
```

### 5. Security Best Practices

#### Service Account Security
1. Use a dedicated service account (not a user account)
2. Apply principle of least privilege
3. Use strong, unique passwords
4. Enable MFA where possible (not for SMTP AUTH)
5. Regular password rotation

#### Network Security
1. Use TLS/SSL encryption (EnableSsl: true)
2. Restrict access to Exchange Server
3. Monitor for unauthorized access
4. Use secure connection strings

#### Application Security
1. Store credentials securely (Azure Key Vault, environment variables)
2. Never hardcode credentials
3. Use connection string encryption
4. Implement proper error handling

### 6. Troubleshooting

#### Common Issues and Solutions

**SMTP Authentication Failed**
- Verify username/password
- Check if SMTP AUTH is enabled on Exchange
- Ensure service account has proper permissions

**Connection Timeout**
- Verify Exchange Server URL/IP
- Check firewall rules
- Increase timeout values

**SSL/TLS Errors**
- Verify certificate validity
- Check SSL/TLS version compatibility
- Ensure proper certificate chain

**Permission Denied**
- Verify Send As permissions
- Check impersonation rights (for EWS)
- Ensure account is not disabled

#### Testing Configuration
Use the API endpoint to test email connectivity:
```bash
POST /api/email/test-connection
Authorization: Bearer {admin-token}
```

### 7. PowerShell Commands for Exchange Setup

#### Grant Send As Permission
```powershell
Add-ADPermission -Identity "CN=YourMailbox,OU=Users,DC=domain,DC=com" -User "service-account" -ExtendedRights "Send-As"
```

#### Grant Impersonation Rights (EWS)
```powershell
New-ManagementRoleAssignment -Role "ApplicationImpersonation" -User "service-account"
```

#### Enable SMTP Authentication
```powershell
Set-CasMailbox -Identity "service-account" -SmtpClientAuthenticationDisabled $false
```

### 8. Environment Variables (Production)

For production deployments, use environment variables instead of hardcoded values:

```bash
EXCHANGE_SMTP_SERVER=mail.yourdomain.com
EXCHANGE_SMTP_PORT=587
EXCHANGE_USERNAME=service-account@yourdomain.com
EXCHANGE_PASSWORD=your-secure-password
EXCHANGE_ENABLE_SSL=true
```

### 9. Monitoring and Logging

#### Email Delivery Monitoring
1. Monitor SMTP queue status
2. Track delivery failures
3. Set up alerts for configuration issues
4. Log all email attempts

#### Exchange Server Monitoring
1. Monitor Exchange Server health
2. Track authentication failures
3. Monitor certificate expiration
4. Set up performance counters

### 10. Sample Email Templates

The system includes default templates for:
- Visitor notification to staff
- Approval confirmation to visitor
- Rejection notice to visitor
- Check-in/Check-out notifications

Templates support placeholders like:
- `{{VisitorName}}`
- `{{StaffName}}`
- `{{LocationName}}`
- `{{VisitDateTime}}`
- `{{PurposeOfVisit}}`

### 11. API Endpoints

#### Send Staff Notification
```http
POST /api/email/notify-staff/{visitorId}
Content-Type: application/json

{
  "staffEmail": "staff@yourdomain.com"
}
```

#### Send Approval Confirmation
```http
POST /api/email/approval-confirmation/{visitorId}
```

#### Send Rejection Notice
```http
POST /api/email/rejection-notice/{visitorId}
Content-Type: application/json

{
  "reason": "Insufficient documentation provided"
}
```

#### Test Email Connection
```http
POST /api/email/test-connection
Authorization: Bearer {admin-token}
```
