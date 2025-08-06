# Configure Windows Firewall for Visitor Management System
# Run this script as Administrator

Write-Host "Configuring Windows Firewall for Visitor Management System..." -ForegroundColor Green

# Allow inbound connections for API (port 9524)
New-NetFirewallRule -DisplayName "Visitor Management API" -Direction Inbound -Protocol TCP -LocalPort 9524 -Action Allow

# Allow inbound connections for Frontend (port 5173 for dev, 80 for production)
New-NetFirewallRule -DisplayName "Visitor Management Frontend Dev" -Direction Inbound -Protocol TCP -LocalPort 5173 -Action Allow
New-NetFirewallRule -DisplayName "Visitor Management Frontend" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow

# Allow SQL Server (port 1433)
New-NetFirewallRule -DisplayName "SQL Server" -Direction Inbound -Protocol TCP -LocalPort 1433 -Action Allow

Write-Host "Firewall rules configured successfully!" -ForegroundColor Green
Write-Host "API will be accessible on: http://[SERVER-IP]:9524" -ForegroundColor Yellow
Write-Host "Frontend will be accessible on: http://[SERVER-IP]:5173 (dev) or http://[SERVER-IP] (production)" -ForegroundColor Yellow
