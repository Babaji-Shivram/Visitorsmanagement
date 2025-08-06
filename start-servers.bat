@echo off
echo Starting Visitor Management System...

REM Start API Server
echo Starting API Server on port 9524...
start "API Server" cmd /k "cd /d d:\Visitor\VisitorManagement.API && dotnet run"

REM Wait for API to start
timeout /t 5 /nobreak

REM Start Frontend Server
echo Starting Frontend Server on port 5173...
start "Frontend Server" cmd /k "cd /d d:\Visitor && npm run dev"

echo.
echo ========================================
echo  Visitor Management System Started
echo ========================================
echo API Server: http://localhost:9524
echo Frontend: http://localhost:5173
echo.
echo 📍 Location Registration URLs:
echo Main Office: http://localhost:5173/visit/main-office
echo Corporate Office: http://localhost:5173/visit/corporate-office
echo Research Lab: http://localhost:5173/visit/research-lab
echo.
echo 📋 View all locations: http://localhost:5173/locations.html
echo.
echo To access from other computers on the network:
echo Replace 'localhost' with this computer's IP address
echo.
pause
