# Windows LAN Server Setup - Complete Dependencies Guide

## System Requirements
- Windows 10/11 or Windows Server 2019/2022
- Minimum 4GB RAM, 8GB+ recommended
- 10GB+ free disk space
- Network connectivity (LAN/Wi-Fi)

## Required Software Components

### 1. Node.js & NPM (for React Frontend)
**Download:** https://nodejs.org/
**Version:** LTS (Latest Stable) - Currently v18.x or v20.x
**What it includes:**
- Node.js runtime
- NPM package manager
- npx command

**Installation verification:**
```powershell
node --version    # Should show v18.x.x or v20.x.x
npm --version     # Should show 9.x.x or 10.x.x
```

### 2. .NET 8 SDK (for API Backend)
**Download:** https://dotnet.microsoft.com/download/dotnet/8.0
**Choose:** .NET 8.0 SDK (not just Runtime)
**What it includes:**
- .NET 8 Runtime
- ASP.NET Core Runtime
- Development tools
- Entity Framework Core tools

**Installation verification:**
```powershell
dotnet --version  # Should show 8.0.x
dotnet --list-sdks # Should show 8.0.x
```

### 3. SQL Server (Database)
**Options:**
- **SQL Server Express** (FREE) - https://www.microsoft.com/sql-server/sql-server-downloads
- **SQL Server Developer** (FREE for dev) 
- **SQL Server LocalDB** (Lightweight option)

**What it includes:**
- Database engine
- SQL Server Management Studio (SSMS) - optional but recommended

**Installation verification:**
```powershell
# Test connection via appsettings.json connection string
sqlcmd -S localhost -E -Q "SELECT @@VERSION"
```

### 4. Git (Optional but recommended)
**Download:** https://git-scm.com/download/win
**For:** Version control and updates

## React/Frontend Dependencies (Auto-installed via NPM)

### Package.json Dependencies
The following will be automatically installed when you run `npm install`:

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "lucide-react": "^0.263.1",
    "tailwindcss": "^3.3.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.0.0",
    "typescript": "^5.0.0",
    "vite": "^4.4.0"
  }
}
```

### Key React Libraries Used:
- **React 18** - Core framework
- **React Router** - Navigation/routing
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Vite** - Build tool/dev server

## .NET API Dependencies (Auto-restored)

These are automatically restored when you run `dotnet restore`:

```xml
<PackageReference Include="Microsoft.AspNetCore.OpenApi" Version="8.0.0" />
<PackageReference Include="Microsoft.EntityFrameworkCore.SqlServer" Version="8.0.0" />
<PackageReference Include="Microsoft.EntityFrameworkCore.Tools" Version="8.0.0" />
<PackageReference Include="Microsoft.EntityFrameworkCore.Design" Version="8.0.0" />
<PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="8.0.0" />
<PackageReference Include="Microsoft.AspNetCore.Identity.EntityFrameworkCore" Version="8.0.0" />
<PackageReference Include="AutoMapper" Version="12.0.1" />
<PackageReference Include="AutoMapper.Extensions.Microsoft.DependencyInjection" Version="12.0.1" />
<PackageReference Include="FluentValidation" Version="11.8.0" />
<PackageReference Include="Serilog" Version="3.1.1" />
<PackageReference Include="Serilog.Sinks.File" Version="5.0.0" />
```

## Installation Order & Commands

### Step 1: Install System Requirements
1. Download and install Node.js LTS
2. Download and install .NET 8 SDK  
3. Download and install SQL Server Express
4. Restart computer

### Step 2: Setup Project Dependencies
```powershell
# Navigate to project folder
cd d:\Visitor

# Install React/Frontend dependencies
npm install

# Restore .NET packages
cd VisitorManagement.API
dotnet restore

# Setup database
dotnet ef database update
```

### Step 3: Verify Installation
```powershell
# Check all installations
node --version
npm --version
dotnet --version
dotnet --list-sdks

# Test database connection
sqlcmd -S localhost -E -Q "SELECT @@VERSION"
```

## Network Configuration

### Windows Firewall Ports
- **5173** - React development server
- **9524** - .NET API server
- **1433** - SQL Server (if remote access needed)
- **80/443** - Production web server (optional)

### Run Firewall Setup
```powershell
# Run as Administrator
PowerShell -ExecutionPolicy Bypass -File d:\Visitor\setup-firewall.ps1
```

## Quick Start Commands

### Development Mode
```powershell
# Terminal 1: Start API
cd d:\Visitor\VisitorManagement.API
dotnet run

# Terminal 2: Start Frontend  
cd d:\Visitor
npm run dev
```

### Or use the batch file:
```batch
d:\Visitor\start-servers.bat
```

## Production Deployment (Optional)

### IIS Requirements (if using IIS)
- Enable IIS via Windows Features
- Install ASP.NET Core Hosting Bundle
- Configure IIS site

### Build for Production
```powershell
d:\Visitor\build-production.bat
```

## Troubleshooting Common Issues

### "Node is not recognized"
- Restart PowerShell/Command Prompt after Node.js installation
- Add Node.js to PATH manually if needed

### "dotnet is not recognized"  
- Restart PowerShell/Command Prompt after .NET installation
- Verify .NET SDK (not just Runtime) is installed

### Database connection errors
- Ensure SQL Server is running
- Check connection string in appsettings.json
- Run `dotnet ef database update`

### Port conflicts
- Check if ports 5173 or 9524 are already in use
- Use `netstat -an | findstr :5173` to check
