# Test visitor registration with email functionality
$headers = @{
    'Content-Type' = 'application/json'
}

$body = @{
    fullName = "Test Visitor"
    email = "testvisitor@example.com"
    phoneNumber = "1234567890"
    company = "Test Company"
    purposeOfVisit = "Business Meeting"
    whomToMeet = "Gogulan A"  # Using an actual staff member
    dateTime = (Get-Date).AddHours(1).ToString("yyyy-MM-ddTHH:mm:ss")
    locationId = 3
} | ConvertTo-Json

Write-Host "Testing visitor registration..."
Write-Host "Body: $body"

try {
    $response = Invoke-RestMethod -Uri "http://localhost:9524/api/visitors" -Method POST -Body $body -Headers $headers
    Write-Host "Success! Visitor created:"
    $response | ConvertTo-Json -Depth 5
} catch {
    Write-Host "Error occurred:"
    Write-Host $_.Exception.Message
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $responseText = $reader.ReadToEnd()
        Write-Host "Response body: $responseText"
    }
}
