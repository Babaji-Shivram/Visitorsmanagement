# BABAJI SHIVRAM Visitor Management System

A comprehensive, modern visitor management system built with .NET 8 backend API and React TypeScript frontend. This system provides complete visitor lifecycle management with integrated email notifications and role-based security.

## 🌟 System Overview

The BABAJI SHIVRAM Visitor Management System is a full-stack application designed for modern organizational visitor management needs. It features real-time visitor tracking, automated email notifications, role-based access control, and multi-location support.

### ✅ Recent Major Updates (August 2025)

- **🔧 Authentication Fix** - Resolved superadmin role mapping issue (now correctly shows as Admin)
- **🛠️ Route Architecture Update** - Simplified API routes (removed `/api` prefix for direct access)
- **🧹 Workspace Cleanup** - Removed 200+ redundant files and organized project structure
- **🔐 ASP.NET Identity Integration** - Enhanced authentication using proper Identity role management
- **📡 Frontend-Backend Integration** - Fixed 404 errors and improved API connectivity

### Key Features

- **Complete Visitor Lifecycle Management** - From registration to check-out
- **Real-time Dashboard** - Live visitor tracking and analytics
- **Email Integration** - Automated notifications via Office 365
- **Multi-location Support** - Manage visitors across multiple locations
- **Role-based Security** - Admin, Staff, and Reception user roles with proper Identity mapping
- **Modern UI/UX** - Responsive React frontend with Tailwind CSS
- **RESTful API** - Comprehensive .NET 8 Web API backend with simplified routing

## 🏗️ Architecture

### Technology Stack

**Frontend:**
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Context API for state management
- Axios for HTTP requests

**Backend:**
- .NET 8 Web API
- Entity Framework Core 8.0
- SQL Server 2016 SP2 Express
- JWT Authentication
- AutoMapper for object mapping
- Serilog for logging

**Infrastructure:**
- Office 365 for email integration
- Windows Authentication for database
- CORS enabled for cross-origin requests
- Swagger/OpenAPI documentation

### System Architecture Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React App     │───▶│   .NET 8 API    │───▶│  SQL Server     │
│   (Port 5173)   │    │   (Port 5000)   │    │  2016 SP2       │
│                 │    │                 │    │                 │
│ • Components    │    │ • Controllers   │    │ • 19 Tables     │
│ • Contexts      │    │ • Services      │    │ • Migrations    │
│ • Tailwind CSS  │    │ • Entity Models │    │ • Seed Data     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Roles    │    │ Email Service   │    │  Database       │
│                 │    │                 │    │                 │
│ • Admin         │    │ • Office 365    │    │ • Windows Auth  │
│ • Staff         │    │ • SMTP Settings │    │ • EF Core       │
│ • Reception     │    │ • HTML Templates│    │ • Relationships │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 🔄 API Route Architecture (Updated August 2025)

**New Simplified Routes:**
- Authentication: `/auth/login`, `/auth/register`
- Visitors: `/visitors`, `/visitors/{id}`
- Staff: `/staff`, `/staff/{id}`
- Locations: `/locations`, `/locations/{id}`
- Health Check: `/health`

**Previous Routes (Deprecated):**
- ~~`/api/auth/login`~~ → Now `/auth/login`
- ~~`/api/visitors`~~ → Now `/visitors`
- ~~`/api/staff`~~ → Now `/staff`

> **Note:** All API endpoints now use direct controller routes without the `/api` prefix for simplified frontend integration.

## 📋 Prerequisites

### System Requirements
- Windows 10/11 or Windows Server 2016+
- .NET 8 SDK
- Node.js 18+ and npm
- SQL Server 2016 SP2 Express or higher
- Visual Studio Code or Visual Studio 2022

### Office 365 Requirements
- Office 365 Business Account
- SMTP access enabled
- App password configured for 2FA

## 🚀 Quick Start Guide

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Visitor
```

### 2. Backend Setup (.NET API)

1. **Navigate to API directory**
   ```bash
   cd VisitorManagement.API
   ```

2. **Restore NuGet packages**
   ```bash
   dotnet restore
   ```

3. **Update database connection string**
   - Edit `appsettings.json`
   - Update the connection string for your SQL Server instance

4. **Run database migrations**
   ```bash
   dotnet ef database update
   ```

5. **Start the API server**
   ```bash
   dotnet run
   ```
   
   The API will be available at `https://localhost:5000`

### 3. Frontend Setup (React App)

1. **Navigate to project root**
   ```bash
   cd ..
   ```

2. **Install npm dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```
   
   The frontend will be available at `http://localhost:5173`

### 4. Access the Application

- **Frontend**: http://localhost:5173
- **API Documentation**: https://localhost:5000/swagger
- **Default Admin Login**: admin@company.com / Admin123!

## 🔧 Configuration

### Database Configuration (appsettings.json)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=DESKTOP-81Q1B98\\VISITORS;Database=Visitors_manage;Integrated Security=true;TrustServerCertificate=true;MultipleActiveResultSets=true"
  }
}
```

### Email Configuration (Office 365)

```json
{
  "EmailSettings": {
    "SmtpServer": "smtp.office365.com",
    "Port": 587,
    "Username": "gogulan.a@babajishivram.com",
    "Password": "vqgbmwcrxnlccklt",
    "EnableSsl": true,
    "FromEmail": "gogulan.a@babajishivram.com",
    "FromName": "BABAJI SHIVRAM Visitor Management System"
  }
}
```

### Frontend API Configuration

The frontend is configured to connect to the API at `http://localhost:5000` using the new simplified routes. Key configuration:
- Base API URL: `http://localhost:5000`
- Authentication endpoint: `/auth/login` (not `/api/auth/login`)
- All endpoints use direct controller names without `/api` prefix
- Configuration files: `src/services/apiService.ts` and context files in `src/contexts/`

### 🔐 Authentication System (Updated August 2025)

**Enhanced Role Management:**
- Uses ASP.NET Core Identity for proper role management
- Roles are retrieved via `UserManager.GetRolesAsync()` method
- Fixed superadmin mapping to display correct "Admin" role
- JWT tokens include accurate role information
- Role priority: Admin > Reception > Staff

**Login Flow:**
1. User submits credentials to `/auth/login`
2. System validates against ASP.NET Identity
3. Roles retrieved using Identity UserManager
4. JWT token generated with correct role claims
5. Frontend receives role information for UI permissions

## 🗄️ Database Schema

The system includes 19 tables with complete visitor management data structure:

### Core Tables
- **AspNetUsers** - User authentication and roles
- **Visitors** - Visitor registration and tracking
- **Locations** - Multi-location support
- **StaffMembers** - Staff member management
- **EmailTemplates** - Email notification templates
- **SystemSettings** - Application configuration

### Seeded Data
- **5 Users**: Admin, Reception, and Staff accounts
- **3 Locations**: Multiple office locations
- **3 Staff Members**: Sample staff for testing
- **Email Templates**: Professional notification templates

## 👥 User Roles & Permissions

### Admin Role
- Complete system access
- User management
- Location management
- System settings configuration
- Staff management
- Full visitor management

### Staff Role
- Approve/reject visitor requests
- View assigned visitors
- Check visitor status
- Receive email notifications

### Reception Role
- Visitor check-in/check-out
- View today's visitors
- Basic visitor operations
- Reception dashboard access

## 📧 Email Notification System

The system includes automated email notifications for:

1. **Staff Notification** - When visitors mention staff members
2. **Approval Confirmation** - When visitor requests are approved
3. **Rejection Notification** - When visitor requests are rejected
4. **Check-in Confirmation** - When visitors check in
5. **Check-out Thank You** - When visitors check out

All emails use professional HTML templates with company branding.

## 🔐 Security Features

- **JWT Authentication** - Stateless token-based auth with enhanced role mapping
- **ASP.NET Core Identity** - Professional user and role management
- **Role-based Authorization** - Fine-grained access control with proper Identity integration
- **Password Hashing** - Identity framework secure password hashing
- **CORS Configuration** - Secure cross-origin requests
- **Input Validation** - Server-side validation
- **SQL Injection Prevention** - Entity Framework parameterized queries
- **Route Security** - Simplified route structure with maintained security

### 🔧 Recent Security Improvements
- Fixed authentication role mapping for superadmin users
- Enhanced JWT token generation with accurate role claims
- Improved Identity integration for consistent role management
- Streamlined API routes while maintaining security standards

## 🧪 Testing

### API Testing
- Swagger UI available at `/swagger`
- All endpoints documented with examples
- JWT token testing support

### Frontend Testing
- Component unit tests (to be implemented)
- Integration tests (to be implemented)
- E2E tests (to be implemented)

## 📱 Responsive Design

The frontend is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- Different screen resolutions

## 🔄 Development Workflow

### Adding New Features

1. **Backend Changes**
   - Create/update entities in `Models/Entities/`
   - Add DTOs in `Models/DTOs/`
   - Update `ApplicationDbContext`
   - Create/update services
   - Add/update controllers
   - Run migrations

2. **Frontend Changes**
   - Create/update components
   - Update contexts for state management
   - Add new routes if needed
   - Update API service calls

### Database Migrations

```bash
# Add new migration
dotnet ef migrations add MigrationName

# Update database
dotnet ef database update

# View migration history
dotnet ef migrations list
```

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Verify SQL Server is running
   - Check connection string format
   - Ensure Windows Authentication is configured

2. **API Not Responding**
   - Check if API is running on port 5000
   - Verify CORS configuration
   - Check firewall settings

3. **Frontend API Connection Issues (Updated)**
   - Ensure API endpoints use new route format (without `/api` prefix)
   - Verify frontend is calling `/auth/login` not `/api/auth/login`
   - Check browser network tab for 404 errors on API calls
   - Confirm API base URL is `http://localhost:5000`

4. **Authentication Issues (Fixed)**
   - ✅ Superadmin role mapping issue resolved
   - ✅ Users now see correct roles (Admin/Staff/Reception)
   - ✅ JWT tokens contain accurate role information
   - If issues persist, verify Identity database seeding

5. **Email Issues**
   - Verify Office 365 credentials
   - Check app password configuration
   - Ensure SMTP settings are correct

6. **Frontend Build Issues**
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and reinstall
   - Check Node.js version compatibility

### Log Files

- **API Logs**: Check console output or log files
- **Frontend Logs**: Check browser developer console
- **Database Logs**: Check SQL Server logs

## 📚 API Documentation

Comprehensive API documentation is available in `API-Documentation.md` and includes:

- Complete endpoint reference
- Authentication examples
- Request/response schemas
- Error handling
- Code samples

## 🚀 Deployment

### Production Deployment

1. **Build for production**
   ```bash
   # Frontend
   npm run build
   
   # Backend
   dotnet publish -c Release
   ```

2. **Configure production settings**
   - Update connection strings
   - Set production URLs
   - Configure HTTPS
   - Set environment variables

3. **Deploy to server**
   - Use IIS for .NET API
   - Serve React build files
   - Configure reverse proxy if needed

## 📞 Support & Contact

### Development Team
- **Email**: gogulan.a@babajishivram.com
- **System**: BABAJI SHIVRAM Visitor Management System
- **Repository**: https://github.com/Babaji-Shivram/Visitorsmanagement

### Recent Updates & Fixes (August 2025)
- ✅ Authentication role mapping fixed
- ✅ API route structure simplified
- ✅ Frontend-backend integration improved
- ✅ Workspace cleaned and organized
- ✅ All changes pushed to GitHub

### Documentation
- **API Documentation**: `/API-Documentation.md`
- **Backend Documentation**: `/README-Backend.md`
- **Swagger UI**: Available at API `/swagger` endpoint

## 📄 License

This project is proprietary software of BABAJI SHIVRAM. All rights reserved.

---

*Last Updated: August 15, 2025*  
*Version: 2.0.0*  
*System Status: ✅ Fully Operational with Recent Major Updates*

### 📋 Change Log

**v2.0.0 (August 15, 2025)**
- 🔧 Fixed authentication role mapping for superadmin users
- 🛠️ Updated API route architecture (removed `/api` prefix)
- 🧹 Major workspace cleanup (removed 200+ redundant files)
- 🔐 Enhanced ASP.NET Identity integration
- 📡 Improved frontend-backend connectivity
- 🚀 All changes synchronized with GitHub repository

**v1.0.0 (August 5, 2025)**
- 🎉 Initial release with complete visitor management system
- 📧 Office 365 email integration
- 👥 Multi-role user management
- 📊 Real-time dashboard and analytics
