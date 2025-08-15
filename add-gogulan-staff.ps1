Write-Host "Adding Staff Members to Location-Specific Database..." -ForegroundColor Cyan

# Add Gogulan to Corporate Office (LocationId = 2)
$gogulannStaff = @{
    locationId = 2
    firstName = "Gogulan"
    lastName = "A"
    email = "gogulan.a@babajishivram.com"
    mobileNumber = "7718810990"
    phoneNumber = "7718810990"
    extension = "1005"
    designation = "Technical Manager"
    role = "staff"
    canLogin = $true
    isActive = $true
} | ConvertTo-Json

Write-Host "Adding Gogulan to Corporate Office..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "https://visitor.solutionsnextwave.com/api/staffmembers" -Method POST -Body $gogulannStaff -ContentType "application/json"
    Write-Host "SUCCESS: Gogulan added with ID: $($response.id)" -ForegroundColor Green
} catch {
    Write-Host "ERROR adding Gogulan: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Staff setup complete!" -ForegroundColor Green
