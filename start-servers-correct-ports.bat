@echo off
echo Killing existing processes...
taskkill /IM dotnet.exe /F 2>nul
taskkill /IM node.exe /F 2>nul

echo Waiting 3 seconds...
timeout /t 3 /nobreak

echo Starting API Server on port 9524...
cd /d "d:\Visitor\VisitorManagement.API"
start "API Server - Port 9524" cmd /k "dotnet run --urls=http://localhost:9524"

echo Waiting 5 seconds for API to start...
timeout /t 5 /nobreak

echo Starting Frontend Server on port 5173...
cd /d "d:\Visitor"
start "Frontend Server - Port 5173" cmd /k "npm run dev -- --port 5173"

echo.
echo ========================================
echo  Servers Starting...
echo ========================================
echo API Server: http://localhost:9524
echo Frontend: http://localhost:5173
echo.
echo Checking ports in 10 seconds...
timeout /t 10 /nobreak

echo.
echo Checking if servers are running:
netstat -ano | findstr ":9524"
netstat -ano | findstr ":5173"
echo.
pause
