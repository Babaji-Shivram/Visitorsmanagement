# PowerShell Email Service for Production
param(
    [Parameter(Mandatory=$true)]
    [string]$ToEmail,
    
    [Parameter(Mandatory=$true)]
    [string]$Subject,
    
    [Parameter(Mandatory=$true)]
    [string]$Body,
    
    [Parameter(Mandatory=$false)]
    [string]$FromName = "BABAJI SHIVRAM Visitor Management System"
)

# Office365 SMTP Configuration (from appsettings.json)
$smtpServer = "smtp.office365.com"
$port = 587
$username = "gogulan.a@babajishivram.com"
$appPassword = "tmmbvmyqfkvrrcnz"
$fromEmail = "gogulan.a@babajishivram.com"
$enableSsl = $true

try {
    # Create SMTP client
    $smtp = New-Object System.Net.Mail.SmtpClient($smtpServer, $port)
    $smtp.EnableSsl = $enableSsl
    $smtp.UseDefaultCredentials = $false
    $smtp.DeliveryMethod = [System.Net.Mail.SmtpDeliveryMethod]::Network
    $smtp.Credentials = New-Object System.Net.NetworkCredential($username, $appPassword)
    
    # Create message
    $message = New-Object System.Net.Mail.MailMessage
    $message.From = New-Object System.Net.Mail.MailAddress($fromEmail, $FromName)
    $message.To.Add($ToEmail)
    $message.Subject = $Subject
    $message.IsBodyHtml = $true
    $message.Body = $Body
    
    # Send email
    $smtp.Send($message)
    
    # Return success
    Write-Output "SUCCESS: Email sent to $ToEmail"
    exit 0
    
} catch {
    # Return error
    Write-Error "FAILED: $($_.Exception.Message)"
    exit 1
    
} finally {
    if ($smtp) { $smtp.Dispose() }
    if ($message) { $message.Dispose() }
}
