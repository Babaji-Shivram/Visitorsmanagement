# QA Command Center - Simple Version
param(
    [string]$TestType = "all",
    [switch]$Quick,
    [switch]$Help
)

function Show-Help {
    Write-Host ""
    Write-Host "QA Command Center - Help" -ForegroundColor Cyan
    Write-Host "======================="
    Write-Host ""
    Write-Host "Usage: .\qa-center.ps1 [TestType] [Options]"
    Write-Host ""
    Write-Host "Test Types:"
    Write-Host "  basic        - Quick integration test (30 seconds)"
    Write-Host "  enhanced     - Full QA suite (60 seconds)"
    Write-Host "  powershell   - PowerShell API tests (45 seconds)"
    Write-Host "  all          - Run comprehensive test suite (3 minutes)"
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  -Quick       - Run basic tests only"
    Write-Host "  -Help        - Show this help"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\qa-center.ps1              # Run all tests"
    Write-Host "  .\qa-center.ps1 basic        # Run basic tests"
    Write-Host "  .\qa-center.ps1 -Quick       # Quick verification"
    Write-Host ""
}

function Test-System {
    Write-Host ""
    Write-Host "Checking system status..." -ForegroundColor Cyan
    
    # Check backend
    try {
        Invoke-WebRequest -Uri "http://localhost:9524" -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop | Out-Null
    } catch {
        if ($_.Exception.Response.StatusCode.value__ -eq 404) {
            Write-Host "Backend API: OK (port 9524)" -ForegroundColor Green
        } else {
            Write-Host "Backend API: ERROR" -ForegroundColor Red
            return $false
        }
    }
    
    # Check frontend
    try {
        Invoke-WebRequest -Uri "http://localhost:5176" -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop | Out-Null
        Write-Host "Frontend: OK (port 5176)" -ForegroundColor Green
    } catch {
        Write-Host "Frontend: ERROR" -ForegroundColor Red
        return $false
    }
    
    return $true
}

function Run-QATest($Command, $Name) {
    Write-Host ""
    Write-Host "Running: $Name" -ForegroundColor Cyan
    Write-Host "Command: $Command" -ForegroundColor Gray
    
    $startTime = Get-Date
    
    try {
        Invoke-Expression $Command
        $success = $LASTEXITCODE -eq 0
        
        $duration = (Get-Date) - $startTime
        
        if ($success) {
            Write-Host "COMPLETED: $Name ($([math]::Round($duration.TotalSeconds, 1))s)" -ForegroundColor Green
        } else {
            Write-Host "FAILED: $Name ($([math]::Round($duration.TotalSeconds, 1))s)" -ForegroundColor Red
        }
        
        return $success
    } catch {
        $duration = (Get-Date) - $startTime
        Write-Host "ERROR: $Name - $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Main execution
Write-Host ""
Write-Host "QA Command Center Starting..." -ForegroundColor White
Write-Host "============================"

if ($Help) {
    Show-Help
    exit 0
}

# Check system
if (-not (Test-System)) {
    Write-Host "System check failed. Please ensure backend and frontend are running." -ForegroundColor Red
    exit 1
}

Write-Host "System check passed!" -ForegroundColor Green

# Determine test to run
$testCommand = ""
$testName = ""

if ($Quick -or $TestType -eq "basic") {
    $testCommand = "node test-integration.js"
    $testName = "Basic Integration Test"
} elseif ($TestType -eq "enhanced") {
    $testCommand = "node automated-qa-suite.js"
    $testName = "Enhanced QA Suite"
} elseif ($TestType -eq "powershell") {
    $testCommand = 'powershell -ExecutionPolicy Bypass -File "simple-qa-powershell.ps1"'
    $testName = "PowerShell API Tests"
} else {
    # Default to comprehensive
    $testCommand = "node qa-runner.js"
    $testName = "Comprehensive QA Suite"
}

# Run the test
$success = Run-QATest $testCommand $testName

# Final result
Write-Host ""
Write-Host "FINAL RESULT:" -ForegroundColor White
if ($success) {
    Write-Host "ALL TESTS PASSED - System ready for deployment!" -ForegroundColor Green
} else {
    Write-Host "TESTS FAILED - System needs attention!" -ForegroundColor Red
}

exit $(if ($success) { 0 } else { 1 })
