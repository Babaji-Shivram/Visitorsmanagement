# QA Command Center - Automated Testing Hub
# Provides easy access to all QA testing capabilities

param(
    [string]$TestType = "all",
    [switch]$Quick,
    [switch]$Detailed,
    [switch]$ReportOnly,
    [switch]$Help
)

$ErrorActionPreference = "Stop"

# Configuration
$QA_SCRIPTS = @{
    "basic" = @{
        name = "Basic Integration Test"
        command = "node test-integration.js"
        description = "Quick 6-test integration verification"
        duration = "~30 seconds"
    }
    "enhanced" = @{
        name = "Enhanced QA Suite"
        command = "node automated-qa-suite.js"
        description = "Comprehensive 10-test suite with security checks"
        duration = "~60 seconds"
    }
    "powershell" = @{
        name = "PowerShell API Tests"
        command = 'powershell -ExecutionPolicy Bypass -File "simple-qa-powershell.ps1"'
        description = "API-focused testing with PowerShell"
        duration = "~45 seconds"
    }
    "comprehensive" = @{
        name = "Complete QA Runner"
        command = "node qa-runner.js"
        description = "Runs all test suites and generates detailed reports"
        duration = "~3 minutes"
    }
}

function Show-Help {
    Write-Host ""
    Write-Host "🤖 VISITOR MANAGEMENT SYSTEM - QA COMMAND CENTER" -ForegroundColor Cyan
    Write-Host "===============================================" -ForegroundColor Blue
    Write-Host ""
    Write-Host "USAGE:" -ForegroundColor Yellow
    Write-Host "  .\qa-command-center.ps1 [TestType] [Options]"
    Write-Host ""
    Write-Host "TEST TYPES:" -ForegroundColor Yellow
    foreach ($key in $QA_SCRIPTS.Keys) {
        $script = $QA_SCRIPTS[$key]
        Write-Host "  $key".PadRight(15) -ForegroundColor Green -NoNewline
        Write-Host "$($script.name)" -ForegroundColor White
        Write-Host "  ".PadRight(15) -NoNewline
        Write-Host "$($script.description)" -ForegroundColor Gray
        Write-Host "  ".PadRight(15) -NoNewline
        Write-Host "Duration: $($script.duration)" -ForegroundColor Magenta
        Write-Host ""
    }
    Write-Host "  all".PadRight(15) -ForegroundColor Green -NoNewline
    Write-Host "Run all tests (same as 'comprehensive')" -ForegroundColor White
    Write-Host ""
    Write-Host "OPTIONS:" -ForegroundColor Yellow
    Write-Host "  -Quick          Run basic tests only (fastest)"
    Write-Host "  -Detailed       Show detailed output"
    Write-Host "  -ReportOnly     Generate report from last test run"
    Write-Host "  -Help           Show this help message"
    Write-Host ""
    Write-Host "EXAMPLES:" -ForegroundColor Yellow
    Write-Host "  .\qa-command-center.ps1                    # Run all tests"
    Write-Host "  .\qa-command-center.ps1 basic              # Run basic integration tests"
    Write-Host "  .\qa-command-center.ps1 -Quick             # Run quick verification"
    Write-Host "  .\qa-command-center.ps1 enhanced -Detailed # Enhanced tests with details"
    Write-Host ""
}

function Test-Prerequisites {
    Write-Host "🔍 Checking prerequisites..." -ForegroundColor Cyan
    
    $issues = @()
    
    # Check Node.js
    try {
        $nodeVersion = node --version
        Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
    } catch {
        $issues += "Node.js not found or not working"
        Write-Host "❌ Node.js: Not found" -ForegroundColor Red
    }
    
    # Check backend server
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:9524" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
        Write-Host "❌ Backend API: Unexpected response" -ForegroundColor Red
    } catch {
        if ($_.Exception.Response.StatusCode.value__ -eq 404) {
            Write-Host "✅ Backend API: Running on port 9524" -ForegroundColor Green
        } else {
            $issues += "Backend API not responding on port 9524"
            Write-Host "❌ Backend API: Not responding" -ForegroundColor Red
        }
    }
    
    # Check frontend server
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5176" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Frontend: Running on port 5176" -ForegroundColor Green
        }
    } catch {
        $issues += "Frontend not responding on port 5176"
        Write-Host "❌ Frontend: Not responding" -ForegroundColor Red
    }
    
    # Check test files
    $requiredFiles = @("test-integration.js", "automated-qa-suite.js", "simple-qa-powershell.ps1", "qa-runner.js")
    foreach ($file in $requiredFiles) {
        if (Test-Path $file) {
            Write-Host "✅ Test file: $file" -ForegroundColor Green
        } else {
            $issues += "Missing test file: $file"
            Write-Host "❌ Test file: $file (missing)" -ForegroundColor Red
        }
    }
    
    if ($issues.Count -gt 0) {
        Write-Host ""
        Write-Host "⚠️  Issues found:" -ForegroundColor Yellow
        foreach ($issue in $issues) {
            Write-Host "   - $issue" -ForegroundColor Yellow
        }
        Write-Host ""
        Write-Host "Please resolve these issues before running tests." -ForegroundColor Yellow
        return $false
    }
    
    Write-Host "✅ All prerequisites met!" -ForegroundColor Green
    return $true
}

function Invoke-QATest($TestKey) {
    if (-not $QA_SCRIPTS.ContainsKey($TestKey)) {
        Write-Host "❌ Unknown test type: $TestKey" -ForegroundColor Red
        return $false
    }
    
    $script = $QA_SCRIPTS[$TestKey]
    
    Write-Host ""
    Write-Host "🚀 Running: $($script.name)" -ForegroundColor Cyan
    Write-Host "📝 Description: $($script.description)" -ForegroundColor Gray
    Write-Host "⏱️  Expected duration: $($script.duration)" -ForegroundColor Gray
    Write-Host "💻 Command: $($script.command)" -ForegroundColor DarkGray
    Write-Host ""
    
    $startTime = Get-Date
    
    try {
        if ($Detailed) {
            # Run with detailed output
            Invoke-Expression $script.command
        } else {
            # Run with minimal output
            $output = Invoke-Expression $script.command 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ $($script.name) completed successfully" -ForegroundColor Green
            } else {
                Write-Host "❌ $($script.name) failed (exit code: $LASTEXITCODE)" -ForegroundColor Red
                if ($output) {
                    Write-Host "Last few lines of output:" -ForegroundColor Yellow
                    $output | Select-Object -Last 5 | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
                }
            }
        }
        
        $duration = (Get-Date) - $startTime
        Write-Host "⏱️  Completed in $([math]::Round($duration.TotalSeconds, 1)) seconds" -ForegroundColor Cyan
        
        return $LASTEXITCODE -eq 0
    } catch {
        $duration = (Get-Date) - $startTime
        Write-Host "❌ $($script.name) failed with error: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "⏱️  Failed after $([math]::Round($duration.TotalSeconds, 1)) seconds" -ForegroundColor Cyan
        return $false
    }
}

function Show-TestMenu {
    Write-Host ""
    Write-Host "🤖 QA TEST SELECTION MENU" -ForegroundColor Cyan
    Write-Host "=========================" -ForegroundColor Blue
    Write-Host ""
    
    $i = 1
    $menuOptions = @{}
    
    foreach ($key in $QA_SCRIPTS.Keys) {
        $script = $QA_SCRIPTS[$key]
        Write-Host "[$i] $($script.name)" -ForegroundColor Green
        Write-Host "    $($script.description)" -ForegroundColor Gray
        Write-Host "    Duration: $($script.duration)" -ForegroundColor Magenta
        Write-Host ""
        $menuOptions[$i] = $key
        $i++
    }
    
    Write-Host "[0] Exit" -ForegroundColor Red
    Write-Host ""
    
    do {
        $choice = Read-Host "Select test to run (0-$($menuOptions.Keys.Count))"
        if ($choice -eq "0") {
            Write-Host "Exiting..." -ForegroundColor Yellow
            return $null
        }
        
        $choiceNum = $null
        if ([int]::TryParse($choice, [ref]$choiceNum) -and $menuOptions.ContainsKey($choiceNum)) {
            return $menuOptions[$choiceNum]
        }
        
        Write-Host "❌ Invalid choice. Please select 0-$($menuOptions.Keys.Count)" -ForegroundColor Red
    } while ($true)
}

function Show-SystemStatus {
    Write-Host ""
    Write-Host "📊 SYSTEM STATUS OVERVIEW" -ForegroundColor Cyan
    Write-Host "=========================" -ForegroundColor Blue
    
    # Quick API test
    try {
        $apiStart = Get-Date
        $response = Invoke-WebRequest -Uri "http://localhost:9524/api/auth/login" -Method POST -Body '{"email":"admin@company.com","password":"Admin123!"}' -ContentType "application/json" -UseBasicParsing -ErrorAction Stop
        $apiDuration = (Get-Date) - $apiStart
        
        if ($response.StatusCode -eq 200) {
            Write-Host "🟢 System Status: OPERATIONAL" -ForegroundColor Green
            Write-Host "   API Response Time: $([math]::Round($apiDuration.TotalMilliseconds, 0))ms" -ForegroundColor Gray
            Write-Host "   Backend: ✅ Running" -ForegroundColor Green
            Write-Host "   Database: ✅ Connected" -ForegroundColor Green
            Write-Host "   Authentication: ✅ Working" -ForegroundColor Green
        }
    } catch {
        Write-Host "🔴 System Status: ISSUES DETECTED" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Yellow
    }
    
    # Check frontend
    try {
        Invoke-WebRequest -Uri "http://localhost:5176" -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop | Out-Null
        Write-Host "   Frontend: ✅ Running" -ForegroundColor Green
    } catch {
        Write-Host "   Frontend: ❌ Not responding" -ForegroundColor Red
    }
    
    Write-Host ""
}

# Main execution
Write-Host ""
Write-Host "🤖 VISITOR MANAGEMENT SYSTEM - QA COMMAND CENTER" -ForegroundColor White -BackgroundColor Blue
Write-Host "===============================================" -ForegroundColor Blue

if ($Help) {
    Show-Help
    exit 0
}

if ($ReportOnly) {
    Write-Host "📊 Generating report from last test run..." -ForegroundColor Cyan
    if (Test-Path "qa-reports\latest-summary.txt") {
        Get-Content "qa-reports\latest-summary.txt"
    } else {
        Write-Host "❌ No previous test reports found. Run tests first." -ForegroundColor Red
    }
    exit 0
}

# Check prerequisites
if (-not (Test-Prerequisites)) {
    exit 1
}

# Show system status
Show-SystemStatus

# Determine which test to run
$targetTest = $null

if ($Quick) {
    $targetTest = "basic"
    Write-Host "🏃 Quick mode: Running basic integration tests" -ForegroundColor Yellow
} elseif ($TestType -eq "all") {
    $targetTest = "comprehensive"
} elseif ($QA_SCRIPTS.ContainsKey($TestType)) {
    $targetTest = $TestType
} elseif ($TestType -ne "all") {
    Write-Host "❌ Unknown test type: $TestType" -ForegroundColor Red
    Write-Host "Available options: $($QA_SCRIPTS.Keys -join ', '), all" -ForegroundColor Yellow
    exit 1
}

# If no specific test chosen, show menu
if (-not $targetTest) {
    $targetTest = Show-TestMenu
    if (-not $targetTest) {
        exit 0
    }
}

# Run the selected test
Write-Host "🎯 Target test: $($QA_SCRIPTS[$targetTest].name)" -ForegroundColor Cyan

$success = Invoke-QATest $targetTest

# Final summary
Write-Host ""
Write-Host "🏁 FINAL RESULT" -ForegroundColor White -BackgroundColor Blue
if ($success) {
    Write-Host "✅ QA TESTING COMPLETED SUCCESSFULLY!" -ForegroundColor Green
    Write-Host "🚀 System is validated and ready for deployment." -ForegroundColor Green
} else {
    Write-Host "❌ QA TESTING FAILED!" -ForegroundColor Red
    Write-Host "⚠️  System requires attention before deployment." -ForegroundColor Yellow
}

# Show report location if available
if (Test-Path "qa-reports") {
    Write-Host ""
    Write-Host "📊 Detailed reports available in: qa-reports\" -ForegroundColor Cyan
    $latestReport = Get-ChildItem "qa-reports\*.json" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if ($latestReport) {
        Write-Host "   Latest JSON report: $($latestReport.Name)" -ForegroundColor Gray
    }
    if (Test-Path "qa-reports\latest-summary.txt") {
        Write-Host "   Latest summary: latest-summary.txt" -ForegroundColor Gray
    }
}

Write-Host ""
exit $(if ($success) { 0 } else { 1 })
