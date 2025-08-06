@echo off
echo ========================================
echo  Visitor Management System Setup
echo ========================================
echo.

echo Checking system requirements...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed!
    echo Please download and install Node.js LTS from: https://nodejs.org/
    echo.
    pause
    exit /b 1
) else (
    echo ✅ Node.js found: 
    node --version
)

REM Check if .NET is installed
dotnet --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ .NET 8 SDK is not installed!
    echo Please download and install .NET 8 SDK from: https://dotnet.microsoft.com/download/dotnet/8.0
    echo.
    pause
    exit /b 1
) else (
    echo ✅ .NET found: 
    dotnet --version
)

echo.
echo Installing React/Frontend dependencies...
cd /d d:\Visitor
npm install

if %errorlevel% neq 0 (
    echo ❌ Failed to install React dependencies!
    pause
    exit /b 1
)

echo.
echo Installing .NET/API dependencies...
cd /d d:\Visitor\VisitorManagement.API
dotnet restore

if %errorlevel% neq 0 (
    echo ❌ Failed to restore .NET packages!
    pause
    exit /b 1
)

echo.
echo Setting up database...
dotnet ef database update

if %errorlevel% neq 0 (
    echo ❌ Database setup failed!
    echo Please ensure SQL Server is installed and running.
    pause
    exit /b 1
)

echo.
echo ========================================
echo  ✅ Setup completed successfully!
echo ========================================
echo.
echo Next steps:
echo 1. Run: start-servers.bat
echo 2. Access: http://localhost:5173
echo 3. Location URLs: http://localhost:5173/visit/main-office
echo.
pause
