Write-Host "=== ADDING GOGULAN TO STAFFMEMBERS TABLE ===" -ForegroundColor Cyan
Write-Host "This will fix the staff location filtering issue" -ForegroundColor Yellow
Write-Host ""

# First, check if Gogulan already exists in StaffMembers
Write-Host "1. Checking if Gogulan exists in StaffMembers table..." -ForegroundColor Yellow

try {
    $existingGogulan = Invoke-RestMethod -Uri "https://visitor.solutionsnextwave.com/api/staff/location/2" -Method GET
    $gogulansFound = $existingGogulan | Where-Object { $_.email -eq "gogulan.a@babajishivram.com" }
    
    if ($gogulansFound) {
        Write-Host "✅ Gogulan already exists in Corporate Office" -ForegroundColor Green
        Write-Host "Name: $($gogulansFound.firstName) $($gogulansFound.lastName)" -ForegroundColor White
        Write-Host "Email: $($gogulansFound.email)" -ForegroundColor White
        Write-Host "Location ID: $($gogulansFound.locationId)" -ForegroundColor White
    } else {
        Write-Host "❌ Gogulan not found in Corporate Office StaffMembers" -ForegroundColor Red
        Write-Host "Will add him now..." -ForegroundColor Yellow
        
        # Add Gogulan to StaffMembers table
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
        
        Write-Host "Adding Gogulan to Corporate Office (LocationId = 2)..." -ForegroundColor Yellow
        Write-Host "Payload: $gogulannStaff" -ForegroundColor Gray
        
        $addResponse = Invoke-RestMethod -Uri "https://visitor.solutionsnextwave.com/api/staff" -Method POST -Body $gogulannStaff -ContentType "application/json"
        
        Write-Host "✅ Gogulan added successfully!" -ForegroundColor Green
        Write-Host "Staff ID: $($addResponse.id)" -ForegroundColor Cyan
    }
    
} catch {
    Write-Host "❌ Error checking/adding Gogulan: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Response)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "2. Testing location filtering after update..." -ForegroundColor Yellow

# Test Corporate Office (should show only Gogulan)
Write-Host "Corporate Office staff (LocationId = 2):" -ForegroundColor Cyan
try {
    $corporateStaff = Invoke-RestMethod -Uri "https://visitor.solutionsnextwave.com/api/staff/location/2" -Method GET
    if ($corporateStaff.Count -gt 0) {
        foreach ($staff in $corporateStaff) {
            Write-Host "  - $($staff.firstName) $($staff.lastName) ($($staff.email))" -ForegroundColor White
        }
    } else {
        Write-Host "  No staff found" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
# Test Main Office
Write-Host "Main Office staff (LocationId = 1):" -ForegroundColor Cyan
try {
    $mainStaff = Invoke-RestMethod -Uri "https://visitor.solutionsnextwave.com/api/staff/location/1" -Method GET
    if ($mainStaff.Count -gt 0) {
        foreach ($staff in $mainStaff) {
            Write-Host "  - $($staff.firstName) $($staff.lastName) ($($staff.email))" -ForegroundColor White
        }
    } else {
        Write-Host "  No staff found" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "✅ STAFF LOCATION FILTERING TEST COMPLETED!" -ForegroundColor Green
