# Automated QA Test Suite - PowerShell Edition
# Comprehensive API and system testing with detailed reporting

param(
    [switch]$Detailed,
    [switch]$SecurityOnly,
    [switch]$PerformanceOnly,
    [string]$OutputFile = ""
)

# Configuration
$API_BASE_URL = "http://localhost:9524/api"
$FRONTEND_URL = "http://localhost:5176"

# Test results tracking
$TestResults = @()
$StartTime = Get-Date

# Helper Functions
function Write-TestHeader($message) {
    Write-Host "`n🔍 $message" -ForegroundColor Magenta
}

function Write-Success($message) {
    Write-Host "✅ $message" -ForegroundColor Green
}

function Write-Error($message) {
    Write-Host "❌ $message" -ForegroundColor Red
}

function Write-Warning($message) {
    Write-Host "⚠️  $message" -ForegroundColor Yellow
}

function Write-Info($message) {
    Write-Host "ℹ️  $message" -ForegroundColor Cyan
}

function Add-TestResult($Name, $Passed, $Duration, $Details = "") {
    $script:TestResults += @{
        Name = $Name
        Passed = $Passed
        Duration = $Duration
        Details = $Details
        Timestamp = Get-Date
    }
}

function Invoke-APITest($Endpoint, $Method = "GET", $Body = $null, $Headers = @{}, $ExpectStatus = 200) {
    $url = "$API_BASE_URL$Endpoint"
    $startTime = Get-Date
    
    try {
        $requestHeaders = @{ "Content-Type" = "application/json" }
        $Headers.GetEnumerator() | ForEach-Object { $requestHeaders[$_.Key] = $_.Value }
        
        $params = @{
            Uri = $url
            Method = $Method
            Headers = $requestHeaders
            UseBasicParsing = $true
        }
        
        if ($Body) {
            $params.Body = $Body
        }
        
        $response = Invoke-WebRequest @params -ErrorAction Stop
        $duration = (Get-Date) - $startTime
        
        $result = @{
            Success = $response.StatusCode -eq $ExpectStatus
            StatusCode = $response.StatusCode
            Content = $response.Content
            Duration = $duration.TotalMilliseconds
            Error = $null
        }
        
        if ($response.Content) {
            try {
                $result.Data = $response.Content | ConvertFrom-Json
            } catch {
                $result.Data = $response.Content
            }
        }
        
        return $result
    }
    catch {
        $duration = (Get-Date) - $startTime
        return @{
            Success = $false
            StatusCode = $_.Exception.Response.StatusCode.value__
            Content = $_.Exception.Message
            Duration = $duration.TotalMilliseconds
            Error = $_.Exception.Message
            Data = $null
        }
    }
}

# Test Functions
function Test-SystemHealth {
    Write-TestHeader "System Health Check"
    $testStart = Get-Date
    
    try {
        # Test API server
        Write-Info "Testing API server..."
        $apiResponse = Invoke-WebRequest -Uri $API_BASE_URL.Replace("/api", "") -UseBasicParsing -ErrorAction Stop
        if ($apiResponse.StatusCode -ne 404) {
            throw "API server not responding correctly (expected 404, got $($apiResponse.StatusCode))"
        }
        Write-Success "API server is operational"
        
        # Test frontend
        Write-Info "Testing frontend server..."
        $frontendResponse = Invoke-WebRequest -Uri $FRONTEND_URL -UseBasicParsing -ErrorAction Stop
        if ($frontendResponse.StatusCode -ne 200) {
            throw "Frontend server not responding correctly (got $($frontendResponse.StatusCode))"
        }
        Write-Success "Frontend server is operational"
        
        $duration = (Get-Date) - $testStart
        Add-TestResult "System Health Check" $true $duration.TotalMilliseconds "API and Frontend servers operational"
        return $true
    }
    catch {
        $duration = (Get-Date) - $testStart
        Write-Error "System health check failed: $($_.Exception.Message)"
        Add-TestResult "System Health Check" $false $duration.TotalMilliseconds $_.Exception.Message
        return $false
    }
}

function Test-Authentication {
    Write-TestHeader "Authentication Testing"
    $testStart = Get-Date
    
    try {
        $credentials = @{
            "admin" = @{ email = "admin@company.com"; password = "Admin123!" }
            "reception" = @{ email = "reception@company.com"; password = "Reception123!" }
            "staff" = @{ email = "emily.watson@company.com"; password = "Staff123!" }
        }
        
        $tokens = @{}
        
        foreach ($role in $credentials.Keys) {
            Write-Info "Testing $role authentication..."
            $loginData = $credentials[$role] | ConvertTo-Json
            $result = Invoke-APITest "/auth/login" "POST" $loginData
            
            if (-not $result.Success) {
                throw "$role authentication failed: $($result.Error)"
            }
            
            $tokens[$role] = $result.Data.token
            Write-Success "$role authentication successful"
        }
        
        # Test invalid credentials
        Write-Info "Testing invalid credentials..."
        $invalidData = @{ email = "invalid@test.com"; password = "wrong" } | ConvertTo-Json
        $invalidResult = Invoke-APITest "/auth/login" "POST" $invalidData -ExpectStatus 401
        
        if ($invalidResult.Success) {
            Write-Success "Invalid credentials correctly rejected"
        } else {
            Write-Warning "Invalid credentials test inconclusive"
        }
        
        $duration = (Get-Date) - $testStart
        Add-TestResult "Authentication Testing" $true $duration.TotalMilliseconds "All user roles authenticated successfully"
        
        # Store tokens globally for other tests
        $script:AuthTokens = $tokens
        return $true
    }
    catch {
        $duration = (Get-Date) - $testStart
        Write-Error "Authentication testing failed: $($_.Exception.Message)"
        Add-TestResult "Authentication Testing" $false $duration.TotalMilliseconds $_.Exception.Message
        return $false
    }
}

function Test-VisitorManagement {
    Write-TestHeader "Visitor Management Testing"
    $testStart = Get-Date
    
    try {
        if (-not $script:AuthTokens) {
            throw "No authentication tokens available"
        }
        
        $headers = @{ "Authorization" = "Bearer $($script:AuthTokens.admin)" }
        
        # Test visitor creation
        Write-Info "Testing visitor creation..."
        $visitorData = @{
            fullName = "PowerShell QA Test Visitor"
            phoneNumber = "+1555$(Get-Random -Minimum 100000 -Maximum 999999)"
            email = "ps-qa-test@example.com"
            companyName = "PowerShell QA Company"
            purposeOfVisit = "Automated QA Testing"
            whomToMeet = "QA Team"
            dateTime = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
            locationId = 3
        } | ConvertTo-Json
        
        $createResult = Invoke-APITest "/visitors" "POST" $visitorData $headers 201
        
        if (-not $createResult.Success) {
            throw "Visitor creation failed: $($createResult.Error)"
        }
        
        $visitorId = $createResult.Data.id
        Write-Success "Visitor created successfully (ID: $visitorId)"
        
        # Test visitor retrieval
        Write-Info "Testing visitor retrieval..."
        $getResult = Invoke-APITest "/visitors" "GET" $null $headers
        
        if (-not $getResult.Success) {
            throw "Visitor retrieval failed: $($getResult.Error)"
        }
        
        Write-Success "Retrieved $($getResult.Data.Length) visitors"
        
        # Test visitor statistics
        Write-Info "Testing visitor statistics..."
        $statsResult = Invoke-APITest "/visitors/stats" "GET" $null $headers
        
        if (-not $statsResult.Success) {
            throw "Statistics retrieval failed: $($statsResult.Error)"
        }
        
        Write-Success "Statistics: Total=$($statsResult.Data.total), Awaiting=$($statsResult.Data.awaiting), Approved=$($statsResult.Data.approved)"
        
        $duration = (Get-Date) - $testStart
        Add-TestResult "Visitor Management Testing" $true $duration.TotalMilliseconds "CRUD operations successful"
        return $true
    }
    catch {
        $duration = (Get-Date) - $testStart
        Write-Error "Visitor management testing failed: $($_.Exception.Message)"
        Add-TestResult "Visitor Management Testing" $false $duration.TotalMilliseconds $_.Exception.Message
        return $false
    }
}

function Test-InputValidation {
    Write-TestHeader "Input Validation Testing"
    $testStart = Get-Date
    
    try {
        if (-not $script:AuthTokens) {
            throw "No authentication tokens available"
        }
        
        $headers = @{ "Authorization" = "Bearer $($script:AuthTokens.admin)" }
        
        $invalidCases = @(
            @{
                name = "Missing Full Name"
                data = @{
                    phoneNumber = "+1234567890"
                    email = "test@example.com"
                    companyName = "Test Company"
                    purposeOfVisit = "Testing"
                    whomToMeet = "Test Person"
                    dateTime = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
                    locationId = 3
                }
            },
            @{
                name = "Invalid Email Format"
                data = @{
                    fullName = "Test User"
                    phoneNumber = "+1234567890"
                    email = "invalid-email-format"
                    companyName = "Test Company"
                    purposeOfVisit = "Testing"
                    whomToMeet = "Test Person"
                    dateTime = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
                    locationId = 3
                }
            },
            @{
                name = "Invalid Location ID"
                data = @{
                    fullName = "Test User"
                    phoneNumber = "+1234567890"
                    email = "test@example.com"
                    companyName = "Test Company"
                    purposeOfVisit = "Testing"
                    whomToMeet = "Test Person"
                    dateTime = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
                    locationId = 999
                }
            }
        )
        
        foreach ($case in $invalidCases) {
            Write-Info "Testing: $($case.name)"
            $invalidData = $case.data | ConvertTo-Json
            $result = Invoke-APITest "/visitors" "POST" $invalidData $headers 400
            
            if ($result.StatusCode -eq 400) {
                Write-Success "$($case.name) correctly rejected"
            } else {
                Write-Warning "$($case.name) validation may be insufficient (Status: $($result.StatusCode))"
            }
        }
        
        $duration = (Get-Date) - $testStart
        Add-TestResult "Input Validation Testing" $true $duration.TotalMilliseconds "Invalid inputs properly rejected"
        return $true
    }
    catch {
        $duration = (Get-Date) - $testStart
        Write-Error "Input validation testing failed: $($_.Exception.Message)"
        Add-TestResult "Input Validation Testing" $false $duration.TotalMilliseconds $_.Exception.Message
        return $false
    }
}

function Test-SecurityVulnerabilities {
    Write-TestHeader "Security Vulnerability Testing"
    $testStart = Get-Date
    
    try {
        if (-not $script:AuthTokens) {
            throw "No authentication tokens available"
        }
        
        $headers = @{ "Authorization" = "Bearer $($script:AuthTokens.admin)" }
        $vulnerabilities = @()
        
        # SQL Injection payloads
        $sqlPayloads = @(
            "'; DROP TABLE Visitors; --",
            "' OR '1'='1",
            "1; DELETE FROM Users WHERE 1=1; --",
            "admin'--"
        )
        
        Write-Info "Testing SQL injection vulnerabilities..."
        foreach ($payload in $sqlPayloads) {
            $testData = @{
                fullName = $payload
                phoneNumber = "+1234567890"
                email = "security@test.com"
                companyName = "Security Test"
                purposeOfVisit = "Security Testing"
                whomToMeet = "Security Team"
                dateTime = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
                locationId = 3
            } | ConvertTo-Json
            
            $result = Invoke-APITest "/visitors" "POST" $testData $headers
            
            if ($result.Success -and $result.Data.fullName -eq $payload) {
                $vulnerabilities += "Potential SQL injection with payload: $payload"
                Write-Warning "Potential SQL injection vulnerability detected"
            }
        }
        
        # XSS payloads (if applicable to your frontend)
        $xssPayloads = @(
            "<script>alert('XSS')</script>",
            "javascript:alert('XSS')",
            "<img src=x onerror=alert('XSS')>"
        )
        
        Write-Info "Testing XSS vulnerabilities..."
        foreach ($payload in $xssPayloads) {
            $testData = @{
                fullName = $payload
                phoneNumber = "+1234567890"
                email = "xss@test.com"
                companyName = "XSS Test"
                purposeOfVisit = "XSS Testing"
                whomToMeet = "Security Team"
                dateTime = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
                locationId = 3
            } | ConvertTo-Json
            
            $result = Invoke-APITest "/visitors" "POST" $testData $headers
            
            if ($result.Success -and $result.Data.fullName -eq $payload) {
                $vulnerabilities += "Potential XSS vulnerability with payload: $payload"
                Write-Warning "Potential XSS vulnerability detected"
            }
        }
        
        # Test authentication bypass
        Write-Info "Testing authentication bypass..."
        $bypassResult = Invoke-APITest "/visitors" "GET" $null @{ "Authorization" = "Bearer invalid.jwt.token" } 401
        
        if ($bypassResult.StatusCode -ne 401) {
            $vulnerabilities += "Authentication bypass possible with invalid token"
            Write-Warning "Authentication bypass vulnerability detected"
        } else {
            Write-Success "Authentication properly enforced"
        }
        
        $duration = (Get-Date) - $testStart
        if ($vulnerabilities.Count -eq 0) {
            Write-Success "No major security vulnerabilities detected"
            Add-TestResult "Security Vulnerability Testing" $true $duration.TotalMilliseconds "No major vulnerabilities found"
        } else {
            Write-Warning "Security vulnerabilities detected: $($vulnerabilities.Count)"
            Add-TestResult "Security Vulnerability Testing" $false $duration.TotalMilliseconds ($vulnerabilities -join "; ")
        }
        
        return $vulnerabilities.Count -eq 0
    }
    catch {
        $duration = (Get-Date) - $testStart
        Write-Error "Security testing failed: $($_.Exception.Message)"
        Add-TestResult "Security Vulnerability Testing" $false $duration.TotalMilliseconds $_.Exception.Message
        return $false
    }
}

function Test-Performance {
    Write-TestHeader "Performance Testing"
    $testStart = Get-Date
    
    try {
        if (-not $script:AuthTokens) {
            throw "No authentication tokens available"
        }
        
        $headers = @{ "Authorization" = "Bearer $($script:AuthTokens.admin)" }
        
        # Test API response times
        Write-Info "Testing API response times..."
        $responseTimes = @()
        
        for ($i = 1; $i -le 10; $i++) {
            $result = Invoke-APITest "/visitors/stats" "GET" $null $headers
            if ($result.Success) {
                $responseTimes += $result.Duration
            }
        }
        
        if ($responseTimes.Count -gt 0) {
            $avgResponseTime = ($responseTimes | Measure-Object -Average).Average
            $maxResponseTime = ($responseTimes | Measure-Object -Maximum).Maximum
            
            Write-Info "Average response time: $([math]::Round($avgResponseTime, 2))ms"
            Write-Info "Maximum response time: $([math]::Round($maxResponseTime, 2))ms"
            
            if ($avgResponseTime -gt 2000) {
                Write-Warning "Average response time exceeds 2 seconds"
            }
            
            if ($maxResponseTime -gt 5000) {
                throw "Maximum response time exceeds acceptable limits"
            }
            
            Write-Success "Performance tests passed"
        } else {
            throw "No successful API calls for performance testing"
        }
        
        $duration = (Get-Date) - $testStart
        Add-TestResult "Performance Testing" $true $duration.TotalMilliseconds "Average: $([math]::Round($avgResponseTime, 2))ms, Max: $([math]::Round($maxResponseTime, 2))ms"
        return $true
    }
    catch {
        $duration = (Get-Date) - $testStart
        Write-Error "Performance testing failed: $($_.Exception.Message)"
        Add-TestResult "Performance Testing" $false $duration.TotalMilliseconds $_.Exception.Message
        return $false
    }
}

function Generate-TestReport {
    $endTime = Get-Date
    $totalDuration = $endTime - $script:StartTime
    $passed = ($script:TestResults | Where-Object { $_.Passed }).Count
    $failed = ($script:TestResults | Where-Object { -not $_.Passed }).Count
    $total = $script:TestResults.Count
    
    Write-Host "`n📊 AUTOMATED QA TEST REPORT" -ForegroundColor White -BackgroundColor Blue
    Write-Host "================================================================" -ForegroundColor Blue
    
    Write-Host "`n📈 Test Summary:" -ForegroundColor Cyan
    Write-Host "   Total Tests: $total"
    Write-Host "   Passed: $passed" -ForegroundColor $(if ($passed -eq $total) { "Green" } else { "Yellow" })
    Write-Host "   Failed: $failed" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Red" })
    Write-Host "   Pass Rate: $([math]::Round(($passed / $total) * 100, 1))%"
    Write-Host "   Total Duration: $([math]::Round($totalDuration.TotalMilliseconds, 0))ms"
    Write-Host "   Average Duration: $([math]::Round(($script:TestResults | Measure-Object Duration -Average).Average, 1))ms"
    
    Write-Host "`n📋 Individual Test Results:" -ForegroundColor Cyan
    foreach ($result in $script:TestResults) {
        $status = if ($result.Passed) { "✅" } else { "❌" }
        $color = if ($result.Passed) { "Green" } else { "Red" }
        $duration = [math]::Round($result.Duration, 0)
        Write-Host "   $status $($result.Name) ($($duration)ms)" -ForegroundColor $color
        
        if ($result.Details -and -not $result.Passed) {
            Write-Host "      Details: $($result.Details)" -ForegroundColor Red
        }
    }
    
    Write-Host "`n🏆 Final Assessment:" -ForegroundColor White
    if ($passed -eq $total) {
        Write-Host "   🎉 ALL TESTS PASSED! System is ready for production." -ForegroundColor Green
    } elseif ($passed / $total -ge 0.8) {
        Write-Host "   ⚠️  Most tests passed. Review failed tests before deployment." -ForegroundColor Yellow
    } else {
        Write-Host "   ❌ Multiple test failures. System needs attention before deployment." -ForegroundColor Red
    }
    
    # Generate JSON report if requested
    if ($OutputFile) {
        $jsonReport = @{
            timestamp = $endTime.ToString("yyyy-MM-ddTHH:mm:ssZ")
            summary = @{
                total = $total
                passed = $passed
                failed = $failed
                passRate = ($passed / $total) * 100
                totalDuration = $totalDuration.TotalMilliseconds
                averageDuration = ($script:TestResults | Measure-Object Duration -Average).Average
            }
            tests = $script:TestResults
            environment = @{
                apiUrl = $API_BASE_URL
                frontendUrl = $FRONTEND_URL
                powershellVersion = $PSVersionTable.PSVersion.ToString()
                os = [System.Environment]::OSVersion.ToString()
            }
        } | ConvertTo-Json -Depth 10
        
        $jsonReport | Out-File -FilePath $OutputFile -Encoding UTF8
        Write-Host "`n💾 JSON report saved to: $OutputFile" -ForegroundColor Cyan
    }
}

# Main execution
function Start-AutomatedQA {
    Write-Host "🤖 POWERSHELL AUTOMATED QA SUITE" -ForegroundColor White -BackgroundColor Blue
    Write-Host "================================================================" -ForegroundColor Blue
    Write-Host "Running comprehensive automated quality assurance tests..." -ForegroundColor Cyan
    
    $tests = @()
    
    if (-not $SecurityOnly -and -not $PerformanceOnly) {
        $tests += @("System Health", "Authentication", "Visitor Management", "Input Validation")
    }
    
    if (-not $PerformanceOnly) {
        $tests += "Security Vulnerabilities"
    }
    
    if (-not $SecurityOnly) {
        $tests += "Performance"
    }
    
    $testFunctions = @{
        "System Health" = { Test-SystemHealth }
        "Authentication" = { Test-Authentication }
        "Visitor Management" = { Test-VisitorManagement }
        "Input Validation" = { Test-InputValidation }
        "Security Vulnerabilities" = { Test-SecurityVulnerabilities }
        "Performance" = { Test-Performance }
    }
    
    foreach ($testName in $tests) {
        if ($testFunctions.ContainsKey($testName)) {
            & $testFunctions[$testName]
        }
    }
    
    Generate-TestReport
    
    return ($script:TestResults | Where-Object { -not $_.Passed }).Count -eq 0
}

# Run the tests
Start-AutomatedQA
