using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VisitorManagement.API.Models.Email;
using VisitorManagement.API.Services;

namespace VisitorManagement.API.Controllers
{
    /// <summary>
    /// Email notification management for visitor system
    /// </summary>
    /// <remarks>
    /// This controller manages all email notifications in the visitor management system.
    /// It integrates with Microsoft Office 365 Exchange Server to send professional
    /// HTML-formatted emails for various visitor lifecycle events.
    /// 
    /// Key Features:
    /// - Staff notifications when visitors mention them
    /// - Visitor approval/rejection notifications
    /// - Check-in/check-out confirmations
    /// - Professional HTML email templates
    /// - Office 365 Exchange Server integration
    /// - SMTP connectivity testing
    /// 
    /// All endpoints require authentication and appropriate role permissions.
    /// </remarks>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    [Produces("application/json")]
    public class EmailController : ControllerBase
    {
        private readonly IEmailService _emailService;
        private readonly ILogger<EmailController> _logger;

        public EmailController(IEmailService emailService, ILogger<EmailController> logger)
        {
            _emailService = emailService;
            _logger = logger;
        }

        /// <summary>
        /// Send a visitor notification email to staff member
        /// </summary>
        /// <param name="visitorId">The ID of the visitor who mentioned the staff member</param>
        /// <param name="request">Contains the staff member's email address</param>
        /// <returns>Success confirmation or error message</returns>
        /// <remarks>
        /// This endpoint sends an automated notification to a staff member when a visitor
        /// mentions them during the registration process. The email includes visitor details,
        /// purpose of visit, and expected arrival time.
        /// 
        /// Sample request:
        /// 
        ///     POST /api/email/notify-staff/123
        ///     Authorization: Bearer YOUR_JWT_TOKEN
        ///     {
        ///         "staffEmail": "john.doe@company.com"
        ///     }
        /// 
        /// The email template includes:
        /// - Visitor's name and contact information
        /// - Purpose of visit
        /// - Expected arrival time
        /// - Company branding and professional formatting
        /// </remarks>
        /// <response code="200">Email sent successfully</response>
        /// <response code="400">Invalid visitor ID or staff email</response>
        /// <response code="401">User not authenticated</response>
        /// <response code="500">Email sending failed due to server error</response>
        [HttpPost("notify-staff/{visitorId}")]
        [ProducesResponseType(200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(401)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> NotifyStaff(int visitorId, [FromBody] NotifyStaffRequest request)
        {
            try
            {
                var result = await _emailService.SendVisitorNotificationToStaffAsync(visitorId, request.StaffEmail);
                
                if (result)
                {
                    return Ok(new { message = "Notification sent successfully" });
                }
                
                return BadRequest(new { message = "Failed to send notification" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending staff notification for visitor {VisitorId}", visitorId);
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        /// <summary>
        /// Send a test email to verify email service configuration
        /// </summary>
        /// <param name="request">Contains the recipient email address and optional message</param>
        /// <returns>Success confirmation or error message</returns>
        /// <remarks>
        /// This endpoint sends a test email to verify that the email service is properly configured
        /// and working. It's useful for administrators to troubleshoot email delivery issues.
        /// 
        /// Sample request:
        /// 
        ///     POST /api/email/test
        ///     Authorization: Bearer YOUR_JWT_TOKEN
        ///     {
        ///         "email": "test@example.com",
        ///         "message": "Optional custom test message"
        ///     }
        /// </remarks>
        /// <response code="200">Test email sent successfully</response>
        /// <response code="400">Invalid email address</response>
        /// <response code="401">User not authenticated</response>
        /// <response code="403">User not authorized (admin only)</response>
        /// <response code="500">Email sending failed due to server error</response>
        [HttpPost("test")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> SendTestEmail([FromBody] TestEmailRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.Email) || !IsValidEmail(request.Email))
                {
                    return BadRequest(new { message = "Invalid email address" });
                }
                
                var subject = "Visitor Management System - Test Email";
                var message = request.Message ?? "This is a test email from the Visitor Management System to verify email service configuration.";
                
                var emailRequest = new EmailNotificationRequest
                {
                    ToEmail = request.Email,
                    ToName = "Email Administrator",
                    Subject = subject,
                    Body = $@"<html><body>
                        <h2>Test Email</h2>
                        <p>{message}</p>
                        <p>Email service appears to be working correctly if you've received this message.</p>
                        <p>Date and time: {DateTime.Now}</p>
                        <p>Server: {Environment.MachineName}</p>
                        <hr>
                        <p><em>This is an automated test email from the Visitor Management System.</em></p>
                    </body></html>",
                    IsHighPriority = true
                };
                
                var result = await _emailService.SendEmailAsync(emailRequest);
                
                if (result)
                {
                    _logger.LogInformation("Test email sent successfully to {Email}", request.Email);
                    return Ok(new { message = "Test email sent successfully" });
                }
                
                _logger.LogWarning("Failed to send test email to {Email}", request.Email);
                return BadRequest(new { message = "Failed to send test email" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending test email to {Email}", request.Email);
                return StatusCode(500, new { message = $"Internal server error: {ex.Message}" });
            }
        }
        
        /// <summary>
        /// Test SMTP server connection
        /// </summary>
        /// <returns>Connection test results</returns>
        /// <remarks>
        /// This endpoint tests the connection to the configured SMTP server without
        /// actually sending an email. It's useful for checking if the SMTP server
        /// is reachable and the credentials are valid.
        /// </remarks>
        [HttpGet("test-connection")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(200)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> TestConnection()
        {
            try
            {
                var result = await _emailService.TestConnectionAsync();
                
                if (result)
                {
                    return Ok(new { connected = true, message = "SMTP server connection successful" });
                }
                
                return Ok(new { connected = false, message = "SMTP server connection failed" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error testing SMTP connection");
                return StatusCode(500, new { message = $"Internal server error: {ex.Message}" });
            }
        }

        private bool IsValidEmail(string email)
        {
            try
            {
                var addr = new System.Net.Mail.MailAddress(email);
                return addr.Address == email;
            }
            catch
            {
                return false;
            }
        }

        /// <summary>
        /// Send approval confirmation to visitor
        /// </summary>
        [HttpPost("approval-confirmation/{visitorId}")]
        public async Task<IActionResult> SendApprovalConfirmation(int visitorId)
        {
            try
            {
                var result = await _emailService.SendVisitorApprovalConfirmationAsync(visitorId);
                
                if (result)
                {
                    return Ok(new { message = "Approval confirmation sent successfully" });
                }
                
                return BadRequest(new { message = "Failed to send approval confirmation" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending approval confirmation for visitor {VisitorId}", visitorId);
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        /// <summary>
        /// Send rejection notice to visitor
        /// </summary>
        [HttpPost("rejection-notice/{visitorId}")]
        public async Task<IActionResult> SendRejectionNotice(int visitorId, [FromBody] RejectionNoticeRequest request)
        {
            try
            {
                var result = await _emailService.SendVisitorRejectionNoticeAsync(visitorId, request.Reason);
                
                if (result)
                {
                    return Ok(new { message = "Rejection notice sent successfully" });
                }
                
                return BadRequest(new { message = "Failed to send rejection notice" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending rejection notice for visitor {VisitorId}", visitorId);
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        /// <summary>
        /// Send custom email notification
        /// </summary>
        [HttpPost("send-custom")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> SendCustomEmail([FromBody] EmailNotificationRequest request)
        {
            try
            {
                var result = await _emailService.SendEmailAsync(request);
                
                if (result)
                {
                    return Ok(new { message = "Email sent successfully" });
                }
                
                return BadRequest(new { message = "Failed to send email" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending custom email to {Email}", request.ToEmail);
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        /// <summary>
        /// Test email server connectivity and configuration
        /// </summary>
        /// <returns>Success or failure status of the email connection test</returns>
        /// <remarks>
        /// This endpoint tests the connection to the configured SMTP server (Office 365).
        /// It verifies that the email settings are correct and the server is reachable.
        /// Only administrators can perform this test.
        /// 
        /// Sample request:
        /// 
        ///     POST /api/email/test-connection
        ///     Authorization: Bearer YOUR_JWT_TOKEN
        /// 
        /// This test validates:
        /// - SMTP server connectivity (smtp.office365.com:587)
        /// - Authentication credentials
        /// - SSL/TLS configuration
        /// - Network connectivity
        /// 
        /// Use this endpoint during system setup or troubleshooting email issues.
        /// </remarks>
        /// <response code="200">Email connection test successful</response>
        /// <response code="400">Email connection test failed</response>
        /// <response code="401">User not authenticated</response>
        /// <response code="403">User doesn't have Admin role</response>
        /// <response code="500">Internal server error during test</response>
        [HttpPost("test-connection")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> TestEmailConnection()
        {
            try
            {
                var result = await _emailService.TestConnectionAsync();
                
                if (result)
                {
                    return Ok(new { message = "Email connection test successful" });
                }
                
                return BadRequest(new { message = "Email connection test failed" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error testing email connection");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        /// <summary>
        /// Send bulk notifications (for multiple visitors)
        /// </summary>
        [HttpPost("bulk-notify")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> SendBulkNotifications([FromBody] BulkNotificationRequest request)
        {
            try
            {
                var emailRequests = request.Notifications.Select(n => new EmailNotificationRequest
                {
                    ToEmail = n.ToEmail,
                    ToName = n.ToName,
                    Subject = n.Subject,
                    Body = n.Body,
                    TemplateType = n.TemplateType,
                    TemplateData = n.TemplateData
                }).ToList();

                var result = await _emailService.SendBulkEmailAsync(emailRequests);
                
                if (result)
                {
                    return Ok(new { message = "Bulk notifications sent successfully" });
                }
                
                return BadRequest(new { message = "Some notifications failed to send" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending bulk notifications");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }
    }

    public class NotifyStaffRequest
    {
        public string StaffEmail { get; set; } = string.Empty;
    }

    public class RejectionNoticeRequest
    {
        public string Reason { get; set; } = string.Empty;
    }

    public class BulkNotificationRequest
    {
        public List<EmailNotificationRequest> Notifications { get; set; } = new();
    }
}
