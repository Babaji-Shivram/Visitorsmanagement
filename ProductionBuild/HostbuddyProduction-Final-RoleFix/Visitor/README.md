# Hostbuddy Production Deployment Package

## Structure
```
/Visitor (Root application folder)
├── index.html          # Frontend entry point
├── assets/             # Frontend static assets
├── web.config          # IIS configuration for frontend
└── api/                # Backend API folder
    ├── SimpleAPI.dll   # Main API assembly
    ├── appsettings.json # Production configuration
    ├── web.config      # IIS configuration for API
    └── [other API files]
```

## Database Configuration
- Connection String: Production SQL Server at sql5054.site4now.net
- Database: db_aae2b0_sa
- Migrations will run automatically on first startup

## Deployment Steps for Hostbuddy

1. **Upload Files**
   - Upload entire `/Visitor` folder to your site root
   - Ensure file permissions allow read/write access

2. **Database Setup**
   - The application will automatically create tables on first run
   - No manual SQL scripts needed

3. **URL Configuration**
   - Frontend: https://yoursite.site4now.net/
   - API: https://yoursite.site4now.net/api/
   - Test endpoint: https://yoursite.site4now.net/api/test

4. **Configuration Updates**
   - Update `BaseUrl` in `/api/appsettings.json` to your actual domain
   - Update CORS settings if needed

## Features Included
- Staff Management (CRUD operations)
- Visitor Registration & Approval
- Email Notifications
- Location-based Filtering
- Analytics & Reporting
- Real-time Updates

## Default Seeded Data
- 3 Locations (Main Office, Delhi Branch, Mumbai Branch)
- 5 Staff Users with different roles
- Default credentials will be created automatically

## Support
- All API endpoints documented in controllers
- Logs available in IIS manager
- Email configuration pre-configured for BABAJI SHIVRAM

Built on: $(Get-Date)
Version: Production Release 1.0
