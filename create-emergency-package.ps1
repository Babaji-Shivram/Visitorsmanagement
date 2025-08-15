# Emergency Production Package Creator
Write-Host "🚨 Creating Emergency Production Package..." -ForegroundColor Red

# Create a clean production package with just essential files
$emergencyDir = "d:\Visitor\Release\emergency-production"
New-Item -ItemType Directory -Path $emergencyDir -Force | Out-Null

Write-Host "📁 Copying essential files..." -ForegroundColor Yellow

# Copy the working API files
Copy-Item "d:\Visitor\Release\api-publish\*" $emergencyDir -Recurse -Force

# Ensure the correct appsettings.Production.json is included
Copy-Item "d:\Visitor\Production-Deploy\Backend\appsettings.Production.json" "$emergencyDir\appsettings.Production.json" -Force

Write-Host "📦 Emergency package ready at: $emergencyDir" -ForegroundColor Green
Write-Host "💡 This package contains:" -ForegroundColor Cyan
Write-Host "   - Updated API with custom fields fix" -ForegroundColor White
Write-Host "   - Updated API with location filtering fix" -ForegroundColor White  
Write-Host "   - Correct appsettings.Production.json" -ForegroundColor White
Write-Host "   - All required DLL files and dependencies" -ForegroundColor White

Write-Host "`n🎯 Upload this entire folder to Hostbuddy:" -ForegroundColor Yellow
Write-Host "   $emergencyDir" -ForegroundColor White
Write-Host "`n⚠️  Make sure to:" -ForegroundColor Red
Write-Host "   1. Backup your current Hostbuddy files first" -ForegroundColor White
Write-Host "   2. Upload ALL files from the emergency package" -ForegroundColor White
Write-Host "   3. Restart the application in Hostbuddy" -ForegroundColor White
