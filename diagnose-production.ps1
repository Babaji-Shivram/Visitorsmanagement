#!/usr/bin/env pwsh

Write-Host "🏥 PRODUCTION DIAGNOSTIC TOOL" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "https://visitor.solutionsnextwave.com"

# Test 1: Basic connectivity
Write-Host "🔍 Test 1: Basic Connectivity" -ForegroundColor Yellow
Write-Host "------------------------------"
try {
    $response = Invoke-WebRequest -Uri $baseUrl -TimeoutSec 10
    Write-Host "✅ Website root: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Website root failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: API Endpoints Status
Write-Host ""
Write-Host "🔍 Test 2: API Endpoints" -ForegroundColor Yellow
Write-Host "-------------------------"

$endpoints = @{
    "/api/settings" = "Configuration endpoint"
    "/api/locations" = "Locations endpoint"
    "/api/auth/health" = "Auth health check"
    "/api/visitors" = "Visitors endpoint"
    "/api/staff" = "Staff endpoint"
}

foreach ($endpoint in $endpoints.Keys) {
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl$endpoint" -TimeoutSec 10
        Write-Host "✅ $endpoint ($($endpoints[$endpoint])): $($response.StatusCode)" -ForegroundColor Green
    } catch {
        $statusCode = if ($_.Exception.Response) { $_.Exception.Response.StatusCode.value__ } else { "Unknown" }
        Write-Host "❌ $endpoint ($($endpoints[$endpoint])): $statusCode" -ForegroundColor Red
    }
}

# Test 3: Database Connection Test
Write-Host ""
Write-Host "🔍 Test 3: Authentication Test" -ForegroundColor Yellow
Write-Host "-------------------------------"
try {
    $loginBody = @{
        email = "superadmin@company.com"
        password = "Admin@123"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -ContentType "application/json" -Body $loginBody -TimeoutSec 10
    if ($response.token) {
        Write-Host "✅ Login successful - Database connection working" -ForegroundColor Green
        Write-Host "✅ JWT token received" -ForegroundColor Green
        
        # Test authenticated endpoint
        $headers = @{ Authorization = "Bearer $($response.token)" }
        try {
            $locResponse = Invoke-RestMethod -Uri "$baseUrl/api/locations" -Headers $headers -TimeoutSec 10
            Write-Host "✅ Authenticated API call successful" -ForegroundColor Green
            Write-Host "✅ Found $($locResponse.Count) locations" -ForegroundColor Green
        } catch {
            Write-Host "❌ Authenticated API call failed: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "❌ Possible database connection issue" -ForegroundColor Red
}

# Test 4: Configuration File Check
Write-Host ""
Write-Host "🔍 Test 4: Configuration Analysis" -ForegroundColor Yellow
Write-Host "----------------------------------"

$configPath = "d:\Visitor\Production-Deploy\Backend\appsettings.Production.json"
if (Test-Path $configPath) {
    Write-Host "✅ Local appsettings.Production.json found" -ForegroundColor Green
    
    try {
        $config = Get-Content $configPath | ConvertFrom-Json
        Write-Host "✅ Database Server: $($config.ConnectionStrings.ProductionConnection.Split(';')[0].Split('=')[1])" -ForegroundColor Green
        Write-Host "✅ Database: $($config.ConnectionStrings.ProductionConnection.Split(';')[1].Split('=')[1])" -ForegroundColor Green
        Write-Host "✅ Email enabled: $($config.EmailSettings.Enabled)" -ForegroundColor Green
    } catch {
        Write-Host "❌ Error reading config: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Local appsettings.Production.json not found" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎯 DIAGNOSIS COMPLETE" -ForegroundColor Cyan
Write-Host "=====================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Next Steps Based on Results:" -ForegroundColor White
Write-Host "1. If login fails → Database connection issue" -ForegroundColor Gray
Write-Host "2. If 500 errors → Check Hostbuddy error logs" -ForegroundColor Gray  
Write-Host "3. If 404 errors → Routing/deployment issue" -ForegroundColor Gray
Write-Host "4. If mixed results → Partial deployment problem" -ForegroundColor Gray
