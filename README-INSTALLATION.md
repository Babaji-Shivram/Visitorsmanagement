# Quick Installation Guide

## What You Need to Install

### 1. **Node.js** (for React)
- **Download:** https://nodejs.org/
- **Choose:** LTS version (Long Term Support)
- **Why:** Required to run React development server and build tools

### 2. **NET 8 SDK** (for API)
- **Download:** https://dotnet.microsoft.com/download/dotnet/8.0
- **Choose:** SDK (not just Runtime)
- **Why:** Required to run the backend API server

### 3. **SQL Server Express** (for Database)
- **Download:** https://www.microsoft.com/sql-server/sql-server-downloads
- **Choose:** Express edition (Free)
- **Why:** Required for storing visitor and location data

## Automatic Setup

### Option 1: Run Setup Script
```batch
# Run this to automatically install React dependencies
d:\Visitor\setup.bat
```

### Option 2: Manual Installation
```powershell
# Install React dependencies
cd d:\Visitor
npm install

# Install .NET dependencies
cd VisitorManagement.API
dotnet restore

# Setup database
dotnet ef database update
```

## Start the Application

```batch
# Start both servers
d:\Visitor\start-servers.bat
```

**Or manually:**
```powershell
# Terminal 1: API Server
cd d:\Visitor\VisitorManagement.API
dotnet run

# Terminal 2: React Server
cd d:\Visitor
npm run dev
```

## Access URLs

- **Main App:** http://localhost:5173
- **Location Registration:** http://localhost:5173/visit/main-office
- **API Documentation:** http://localhost:9524/swagger

## For LAN Access

Replace `localhost` with your server's IP address:
- **From other computers:** http://[SERVER-IP]:5173/visit/main-office

## React Dependencies Included

✅ **react** - Core React framework  
✅ **react-dom** - React DOM rendering  
✅ **react-router-dom** - Navigation between pages  
✅ **typescript** - Type safety  
✅ **tailwindcss** - CSS styling framework  
✅ **lucide-react** - Icon library  
✅ **vite** - Fast development server and build tool  

All React dependencies are automatically installed when you run `npm install` - no need to install them separately!
