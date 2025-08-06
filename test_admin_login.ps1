# Test Admin Login
$loginData = @{
    email = "admin@company.com"
    password = "Admin123!"
} | ConvertTo-Json

Write-Host "Testing admin login..."
Write-Host "Login data: $loginData"

try {
    $response = Invoke-RestMethod -Uri "http://localhost:9524/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    
    Write-Host "✅ Login successful!"
    Write-Host "User details:"
    $response | ConvertTo-Json -Depth 3
    
    # Test if user has access to settings
    $headers = @{
        'Authorization' = "Bearer $($response.token)"
        'Content-Type' = 'application/json'
    }
    
    Write-Host "`nTesting settings access..."
    $settingsResponse = Invoke-RestMethod -Uri "http://localhost:9524/api/settings" -Method GET -Headers $headers
    Write-Host "✅ Settings accessible!"
    $settingsResponse | ConvertTo-Json -Depth 2
    
} catch {
    Write-Host "❌ Login failed:"
    Write-Host $_.Exception.Message
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $responseText = $reader.ReadToEnd()
        Write-Host "Response: $responseText"
    }
}
