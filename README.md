# BABAJI SHIVRAM Visitor Management System

A comprehensive, modern visitor management system built with .NET 8 backend API and React TypeScript frontend. This system provides complete visitor lifecycle management with integrated email notifications and role-based security.

## 🌟 System Overview

The BABAJI SHIVRAM Visitor Management System is a full-stack application designed for modern organizational visitor management needs. It features real-time visitor tracking, automated email notifications, role-based access control, and multi-location support.

### Key Features

- **Complete Visitor Lifecycle Management** - From registration to check-out
- **Real-time Dashboard** - Live visitor tracking and analytics
- **Email Integration** - Automated notifications via Office 365
- **Multi-location Support** - Manage visitors across multiple locations
- **Role-based Security** - Admin, Staff, and Reception user roles
- **Modern UI/UX** - Responsive React frontend with Tailwind CSS
- **RESTful API** - Comprehensive .NET 8 Web API backend

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

The frontend is configured to connect to the API at `http://localhost:5000`. This is set in:
- `src/services/apiService.ts`
- Context files in `src/contexts/`

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

- **JWT Authentication** - Stateless token-based auth
- **Role-based Authorization** - Fine-grained access control
- **Password Hashing** - BCrypt with salt
- **CORS Configuration** - Secure cross-origin requests
- **Input Validation** - Server-side validation
- **SQL Injection Prevention** - Parameterized queries

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

3. **Email Issues**
   - Verify Office 365 credentials
   - Check app password configuration
   - Ensure SMTP settings are correct

4. **Frontend Build Issues**
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

### Documentation
- **API Documentation**: `/API-Documentation.md`
- **Backend Documentation**: `/README-Backend.md`
- **Swagger UI**: Available at API `/swagger` endpoint

## 📄 License

This project is proprietary software of BABAJI SHIVRAM. All rights reserved.

---

*Last Updated: August 5, 2025*  
*Version: 1.0.0*  
*System Status: ✅ Fully Operational*
