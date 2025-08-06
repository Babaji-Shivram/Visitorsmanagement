@echo off
echo Building Visitor Management System for Production...

REM Build API
echo Building API...
cd /d d:\Visitor\VisitorManagement.API
dotnet publish -c Release -o ../publish/api

REM Build Frontend
echo Building Frontend...
cd /d d:\Visitor
npm run build

echo.
echo ========================================
echo  Build completed successfully!
echo ========================================
echo API published to: d:\Visitor\publish\api
echo Frontend built to: d:\Visitor\dist
echo.
pause
