# Email Testing Guide

## How to Test Email Notifications

### Prerequisites
1. Both servers must be running:
   - **Frontend**: Run `npm run dev` (usually starts on port 5173 or 5174)
   - **API Server**: Run `cd VisitorManagement.API && dotnet run` (starts on port 9524)

2. You must be logged in as an **Administrator** to access email testing features.

### Using the Email Tester Interface

1. **Access the Email Settings:**
   - Log in as an administrator
   - Navigate to Settings (gear icon in the navigation)
   - Click on the "Email Settings" tab

2. **Test SMTP Connection:**
   - Click "Test SMTP Connection" button
   - This verifies if the email server configuration is working
   - You should see either "SMTP server connection successful" or an error message

3. **Send a Test Email:**
   - Enter a valid email address in the "Recipient Email" field
   - Optionally add a custom message
   - Click "Send Test Email"
   - Check the specified email inbox (including spam folder)

### Email Configuration
The system is currently configured to use Office 365 SMTP:
- **SMTP Server**: smtp.office365.com
- **Port**: 587
- **SSL**: Enabled
- **From Email**: gogulan.a@babajishivram.com

### Testing Visitor Registration Email Notifications

1. **Create a Test Visitor Registration:**
   - Go to a public visitor registration URL (e.g., `http://localhost:5173/visit/main-office`)
   - Fill out the visitor form
   - In the "Whom to Meet" field, select or enter a staff member's name
   - Submit the registration

2. **Check Staff Email Notifications:**
   - The system should automatically send an email to the specified staff member
   - The email includes visitor details and an approval link
   - Staff can approve the visitor directly from the email

### Troubleshooting

**If emails are not being sent:**
1. Check the browser console for any error messages
2. Verify both servers are running and accessible
3. Check the API server logs for email-related errors
4. Ensure the email configuration in `appsettings.json` is correct
5. Verify the Office 365 account credentials are valid

**If test emails fail:**
- Make sure you're logged in as an administrator
- Check that the API server is running on port 9524
- Verify the SMTP connection test passes first
- Check your internet connection

**Email delivery issues:**
- Check spam/junk folders
- Verify the recipient email address is correct
- Ensure the Office 365 account has proper permissions
- Check Office 365 security settings (may block automated emails)

### API Endpoints for Email Testing

- **Test Email**: `POST /api/email/test`
- **Test Connection**: `GET /api/email/test-connection`
- **Staff Notification**: `POST /api/email/notify-staff/{visitorId}`

### Expected Email Flow

1. **Visitor Registration** → **Staff Notification Email**
2. **Staff Clicks Approval Link** → **Visitor Approval Confirmation Email**
3. **Admin Test** → **Test Email Delivery**

All emails use professional HTML templates with company branding and include relevant visitor information.
