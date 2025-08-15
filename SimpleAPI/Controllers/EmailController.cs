using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using System.Net.Mail;
using SimpleAPI.Services;

namespace SimpleAPI.Controllers;

[ApiController]
[Route("[controller]")]
public class EmailController : ControllerBase
{
    private readonly IEmailService _emailService;
    private readonly IConfiguration _cfg;
    private readonly ILogger<EmailController> _log;

    public EmailController(IEmailService emailService, IConfiguration cfg, ILogger<EmailController> log)
    {
        _emailService = emailService;
        _cfg = cfg;
        _log = log;
    }

    [HttpPost("test")]
    public async Task<IActionResult> SendTestEmail([FromBody] TestEmailRequest request, CancellationToken ct)
    {
        // [ApiController] + DataAnnotations cover most validation; this is just extra guard.
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        try
        {
            await _emailService.SendTestEmailAsync(request.Email, request.Message);
            return Ok(new
            {
                ok = true,
                message = "Test email processed",
                meta = new { recipient = request.Email, at = DateTime.UtcNow }
            });
        }
        catch (SmtpException sex)
        {
            _log.LogWarning(sex, "SMTP error while sending test email to {Email}", request.Email);
            return StatusCode(502, new { ok = false, message = "SMTP send failed", code = (int)sex.StatusCode });
        }
        catch (Exception ex)
        {
            _log.LogError(ex, "SendTestEmail failed");
            return StatusCode(500, new { ok = false, message = "Internal error while sending email" });
        }
    }

    [HttpPost("visitor-notification")]
    public async Task<IActionResult> SendVisitorNotification([FromBody] VisitorNotificationRequest request, CancellationToken ct)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        try
        {
            await _emailService.SendVisitorNotificationAsync(
                request.NotificationEmail, request.VisitorName, request.VisitorEmail,
                request.Company, request.Purpose, request.DateTime, request.Status);

            return Ok(new
            {
                ok = true,
                message = "Visitor notification processed",
                meta = new { recipient = request.NotificationEmail, visitor = request.VisitorName, at = DateTime.UtcNow }
            });
        }
        catch (SmtpException sex)
        {
            _log.LogWarning(sex, "SMTP error visitor notification to {Email}", request.NotificationEmail);
            return StatusCode(502, new { ok = false, message = "SMTP send failed", code = (int)sex.StatusCode });
        }
        catch (Exception ex)
        {
            _log.LogError(ex, "SendVisitorNotification failed");
            return StatusCode(500, new { ok = false, message = "Internal error while sending email" });
        }
    }

    [HttpPost("status-update")]
    public async Task<IActionResult> SendStatusUpdateEmail([FromBody] StatusUpdateEmailRequest request, CancellationToken ct)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        try
        {
            await _emailService.SendStatusUpdateEmailAsync(
                request.VisitorEmail, request.VisitorName, request.Company,
                request.Purpose, request.Status, request.Reason);

            return Ok(new
            {
                ok = true,
                message = "Status update processed",
                meta = new { recipient = request.VisitorEmail, status = request.Status, at = DateTime.UtcNow }
            });
        }
        catch (SmtpException sex)
        {
            _log.LogWarning(sex, "SMTP error status update to {Email}", request.VisitorEmail);
            return StatusCode(502, new { ok = false, message = "SMTP send failed", code = (int)sex.StatusCode });
        }
        catch (Exception ex)
        {
            _log.LogError(ex, "SendStatusUpdateEmail failed");
            return StatusCode(500, new { ok = false, message = "Internal error while sending email" });
        }
    }

    // --- Diagnostics (safe) ---
    [HttpGet("config-check")]
    public IActionResult ConfigCheck()
    {
        try
        {
            _log.LogInformation("Email config check requested");
            
            var enabled = _cfg.GetValue<bool>("EmailSettings:Enabled", false);
            var host = _cfg["EmailSettings:SmtpServer"] ?? _cfg["EmailSettings:SmtpHost"];
            var port = _cfg.GetValue<int?>("EmailSettings:SmtpPort") ?? _cfg.GetValue<int?>("EmailSettings:Port");
            var from = _cfg["EmailSettings:FromEmail"];

            var result = new
            {
                ok = true,
                enabled,
                hostPresent = !string.IsNullOrWhiteSpace(host),
                port = port ?? 0,
                fromPresent = !string.IsNullOrWhiteSpace(from)
                // intentionally do NOT return username/password
            };
            
            _log.LogInformation("Email config check completed successfully");
            return Ok(result);
        }
        catch (Exception ex)
        {
            _log.LogError(ex, "Error in email config check");
            return StatusCode(500, new { ok = false, message = "Error checking email configuration" });
        }
    }
}

// --- DTOs with validation ---
public class TestEmailRequest
{
    [Required, EmailAddress] public string Email { get; set; } = "";
    public string? Message { get; set; }
}

public class VisitorNotificationRequest
{
    [Required, EmailAddress] public string NotificationEmail { get; set; } = "";
    [Required] public string VisitorName { get; set; } = "";
    [Required, EmailAddress] public string VisitorEmail { get; set; } = "";
    [Required] public string Company { get; set; } = "";
    [Required] public string Purpose { get; set; } = "";
    [Required] public string DateTime { get; set; } = "";   // consider DateTime type if you control client
    [Required] public string Status { get; set; } = "";
}

public class StatusUpdateEmailRequest
{
    [Required, EmailAddress] public string VisitorEmail { get; set; } = "";
    [Required] public string VisitorName { get; set; } = "";
    [Required] public string Company { get; set; } = "";
    [Required] public string Purpose { get; set; } = "";
    [Required] public string Status { get; set; } = "";
    public string? Reason { get; set; }
}
