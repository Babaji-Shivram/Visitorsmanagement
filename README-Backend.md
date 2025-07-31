# Visitor Management System - .NET 8 Backend API

A comprehensive visitor management system backend built with .NET 8, Entity Framework Core, and JWT authentication.

## Features

### Core Functionality
- **User Authentication & Authorization** - JWT-based auth with role-based access control
- **Visitor Registration** - Complete visitor registration with custom fields support
- **Staff Management** - Manage staff members across multiple locations
- **Location Management** - Multi-location support with QR code generation
- **Real-time Dashboard** - Live visitor tracking and analytics
- **Custom Fields** - Configurable form fields for visitor registration
- **Bulk Operations** - Bulk staff upload via CSV
- **Comprehensive Reporting** - Visitor statistics and analytics

### Security Features
- JWT token-based authentication
- Role-based authorization (Admin, Reception, Staff)
- Password hashing with BCrypt
- CORS configuration for frontend integration
- Input validation and sanitization

### Technical Features
- .NET 8 Web API
- Entity Framework Core with SQL Server
- AutoMapper for object mapping
- Serilog for structured logging
- Swagger/OpenAPI documentation
- FluentValidation for request validation

## Project Structure

```
VisitorManagement.API/
├── Controllers/           # API Controllers
│   ├── AuthController.cs
│   └── VisitorsController.cs
├── Data/                 # Database Context
│   └── ApplicationDbContext.cs
├── Models/               # Data Models
│   ├── Entities/         # Database Entities
│   └── DTOs/            # Data Transfer Objects
├── Services/            # Business Logic Services
│   ├── IAuthService.cs
│   ├── AuthService.cs
│   ├── IVisitorService.cs
│   └── VisitorService.cs
├── Profiles/            # AutoMapper Profiles
│   └── MappingProfile.cs
└── Program.cs           # Application Entry Point
```

## Database Schema

### Core Entities
- **Users** - System users with role-based access
- **Locations** - Physical locations for visitor registration
- **StaffMembers** - Staff members who can receive visitors
- **Visitors** - Visitor registration records
- **CustomFields** - Configurable form fields
- **VisitorCustomFieldValues** - Custom field values for visitors
- **SystemSettings** - Application configuration settings

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register new user (Admin only)
- `GET /api/auth/users` - Get all users (Admin only)
- `PUT /api/auth/user/{id}` - Update user (Admin only)
- `DELETE /api/auth/user/{id}` - Delete user (Admin only)

### Visitors
- `POST /api/visitors` - Create new visitor registration
- `GET /api/visitors` - Get visitors with filtering
- `GET /api/visitors/{id}` - Get visitor by ID
- `GET /api/visitors/staff/{staffName}` - Get visitors for specific staff
- `GET /api/visitors/today` - Get today's visitors
- `GET /api/visitors/stats` - Get visitor statistics
- `PUT /api/visitors/{id}/status` - Update visitor status
- `POST /api/visitors/{id}/checkin` - Check in visitor
- `POST /api/visitors/{id}/checkout` - Check out visitor
- `DELETE /api/visitors/{id}` - Delete visitor (Admin only)

## Setup Instructions

### Prerequisites
- .NET 8 SDK
- SQL Server or SQL Server LocalDB
- Visual Studio 2022 or VS Code

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd VisitorManagement.API
   ```

2. **Install dependencies**
   ```bash
   dotnet restore
   ```

3. **Update connection string**
   - Edit `appsettings.json` and update the `DefaultConnection` string
   - For development, you can use SQL Server LocalDB (default configuration)

4. **Run database migrations**
   ```bash
   dotnet ef database update
   ```

5. **Run the application**
   ```bash
   dotnet run
   ```

6. **Access Swagger UI**
   - Navigate to `https://localhost:7000` (or the port shown in console)
   - Swagger UI will be available at the root URL

### Default Users

The system seeds with default users:

| Email | Password | Role | Description |
|-------|----------|------|-------------|
| admin@company.com | Admin123! | Admin | System administrator |
| reception@company.com | Reception123! | Reception | Reception desk user |
| emily.watson@company.com | Staff123! | Staff | Staff member |

## Configuration

### JWT Settings
Update the JWT configuration in `appsettings.json`:
```json
{
  "Jwt": {
    "Key": "YourSuperSecretKeyThatIsAtLeast32CharactersLong!",
    "Issuer": "VisitorManagementAPI",
    "Audience": "VisitorManagementClient"
  }
}
```

### Database Connection
Update the connection string for your environment:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=your-server;Database=VisitorManagementDB;Trusted_Connection=true;"
  }
}
```

### CORS Configuration
The API is configured to allow requests from:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000` (React dev server)

Update the CORS policy in `Program.cs` if needed.

## Development

### Adding New Features

1. **Create Entity** - Add new entity in `Models/Entities/`
2. **Create DTOs** - Add corresponding DTOs in `Models/DTOs/`
3. **Update DbContext** - Add DbSet and configure relationships
4. **Create Service** - Implement business logic in `Services/`
5. **Create Controller** - Add API endpoints in `Controllers/`
6. **Update Mapping** - Add AutoMapper profiles
7. **Run Migration** - Create and apply database migration

### Database Migrations

```bash
# Add new migration
dotnet ef migrations add MigrationName

# Update database
dotnet ef database update

# Remove last migration (if not applied)
dotnet ef migrations remove
```

### Testing

The API includes comprehensive logging with Serilog. Logs are written to:
- Console (Development)
- File: `logs/log-{date}.txt`

## Deployment

### Production Considerations

1. **Update Connection String** - Use production database
2. **Update JWT Secret** - Use a secure, random key
3. **Configure HTTPS** - Ensure HTTPS is properly configured
4. **Update CORS** - Configure for production frontend URL
5. **Environment Variables** - Use environment variables for sensitive data
6. **Logging** - Configure appropriate log levels and destinations

### Docker Support

Create a `Dockerfile` for containerization:
```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["VisitorManagement.API.csproj", "."]
RUN dotnet restore
COPY . .
RUN dotnet build -c Release -o /app/build

FROM build AS publish
RUN dotnet publish -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "VisitorManagement.API.dll"]
```

## Support

For issues and questions:
1. Check the logs in the `logs/` directory
2. Verify database connectivity
3. Ensure all required environment variables are set
4. Check Swagger UI for API documentation

## License

This project is licensed under the MIT License.