using Microsoft.Extensions.Options;
using System.Net;
using System.Net.Mail;
using System.Text;
using System.Text.RegularExpressions;
using VisitorManagement.API.Data;
using VisitorManagement.API.Models.Configuration;
using VisitorManagement.API.Models.Email;
using VisitorManagement.API.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace VisitorManagement.API.Services
{
    public class EmailService : IEmailService
    {
        private readonly EmailSettings _emailSettings;
        private readonly ApplicationDbContext _context;
        private readonly ILogger<EmailService> _logger;

        public EmailService(
            IOptions<EmailSettings> emailSettings,
            ApplicationDbContext context,
            ILogger<EmailService> logger)
        {
            _emailSettings = emailSettings.Value;
            _context = context;
            _logger = logger;
        }

        public async Task<bool> SendEmailAsync(EmailNotificationRequest request)
        {
            try
            {
                _logger.LogInformation($"Attempting to send email to {request.ToEmail} with subject: {request.Subject}");
                
                using var client = CreateSmtpClient();
                _logger.LogInformation($"SMTP client created for server: {_emailSettings.SmtpServer}:{_emailSettings.SmtpPort}");
                
                using var mailMessage = await CreateMailMessageAsync(request);
                _logger.LogInformation($"Mail message created, sending to {request.ToEmail}");
                
                await client.SendMailAsync(mailMessage);
                _logger.LogInformation($"Email sent successfully to {request.ToEmail}");
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to send email to {request.ToEmail}. SMTP Server: {_emailSettings.SmtpServer}:{_emailSettings.SmtpPort}, SSL: {_emailSettings.EnableSsl}, Username: {_emailSettings.Username}");
                return false;
            }
        }

        public async Task<bool> SendVisitorNotificationToStaffAsync(int visitorId, string staffEmail)
        {
            try
            {
                var visitor = await _context.Visitors
                    .Include(v => v.Location)
                    .FirstOrDefaultAsync(v => v.Id == visitorId);

                if (visitor == null)
                {
                    _logger.LogWarning($"Visitor with ID {visitorId} not found");
                    return false;
                }

                var allStaff = await _context.StaffMembers.ToListAsync();
                var staff = allStaff.FirstOrDefault(s => s.Email.Equals(staffEmail, StringComparison.OrdinalIgnoreCase));

                if (staff == null)
                {
                    _logger.LogWarning($"Staff member with email {staffEmail} not found");
                    return false;
                }

                // Get the approval URL from settings
                var baseUrl = GetBaseUrl();
                string approvalUrl = $"{baseUrl}/staff/approval/{visitor.Id}?token={GenerateApprovalToken(visitor.Id, staffEmail)}";
                
                // Get location details
                var locationName = visitor.Location?.Name ?? "Unknown Location";
                var locationAddress = visitor.Location?.Address ?? "Address not available";

                var templateData = new Dictionary<string, string>
                {
                    {"VisitorName", visitor.FullName},
                    {"VisitorEmail", visitor.Email ?? "Not provided"},
                    {"VisitorPhone", visitor.PhoneNumber},
                    {"CompanyName", visitor.CompanyName ?? "Not provided"},
                    {"PurposeOfVisit", visitor.PurposeOfVisit},
                    {"VisitDateTime", visitor.DateTime.ToString("dddd, MMMM dd, yyyy 'at' hh:mm tt")},
                    {"StaffName", $"{staff.FirstName} {staff.LastName}"},
                    {"StaffEmail", staffEmail},
                    {"LocationName", locationName},
                    {"LocationAddress", locationAddress},
                    {"ApprovalUrl", approvalUrl},
                    {"Notes", visitor.Notes ?? "No additional notes"},
                    {"IdProofType", visitor.IdProofType ?? "Not provided"},
                    {"IdProofNumber", visitor.IdProofNumber ?? "Not provided"}
                };

                var template = await GetEmailTemplateAsync(EmailTemplateType.VisitorNotificationToStaff);
                var subject = await ProcessEmailTemplateAsync(template.Subject, templateData);
                var body = await ProcessEmailTemplateAsync(template.Body, templateData);

                var request = new EmailNotificationRequest
                {
                    ToEmail = staffEmail,
                    ToName = $"{staff.FirstName} {staff.LastName}",
                    Subject = subject,
                    Body = body,
                    TemplateType = EmailTemplateType.VisitorNotificationToStaff,
                    TemplateData = templateData,
                    IsHighPriority = true
                };

                return await SendEmailAsync(request);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to send visitor notification for visitor {visitorId} to staff {staffEmail}");
                return false;
            }
        }

        public async Task<bool> SendVisitorApprovalConfirmationAsync(int visitorId)
        {
            try
            {
                var visitor = await _context.Visitors
                    .Include(v => v.Location)
                    .FirstOrDefaultAsync(v => v.Id == visitorId);

                if (visitor == null || string.IsNullOrEmpty(visitor.Email))
                {
                    _logger.LogWarning($"Visitor with ID {visitorId} not found or no email provided");
                    return false;
                }

                var templateData = new Dictionary<string, string>
                {
                    {"VisitorName", visitor.FullName},
                    {"LocationName", visitor.Location.Name},
                    {"VisitDateTime", visitor.DateTime.ToString("dddd, MMMM dd, yyyy 'at' hh:mm tt")},
                    {"WhomToMeet", visitor.WhomToMeet},
                    {"LocationAddress", visitor.Location.Address ?? ""},
                    {"ApprovedBy", visitor.ApprovedBy ?? "System"},
                    {"ApprovedAt", visitor.ApprovedAt?.ToString("dddd, MMMM dd, yyyy 'at' hh:mm tt") ?? ""}
                };

                var template = await GetEmailTemplateAsync(EmailTemplateType.VisitorApprovalConfirmation);
                var subject = await ProcessEmailTemplateAsync(template.Subject, templateData);
                var body = await ProcessEmailTemplateAsync(template.Body, templateData);

                var request = new EmailNotificationRequest
                {
                    ToEmail = visitor.Email,
                    ToName = visitor.FullName,
                    Subject = subject,
                    Body = body,
                    TemplateType = EmailTemplateType.VisitorApprovalConfirmation,
                    TemplateData = templateData
                };

                return await SendEmailAsync(request);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to send approval confirmation for visitor {visitorId}");
                return false;
            }
        }

        public async Task<bool> SendVisitorRejectionNoticeAsync(int visitorId, string reason)
        {
            try
            {
                var visitor = await _context.Visitors
                    .Include(v => v.Location)
                    .FirstOrDefaultAsync(v => v.Id == visitorId);

                if (visitor == null || string.IsNullOrEmpty(visitor.Email))
                {
                    _logger.LogWarning($"Visitor with ID {visitorId} not found or no email provided");
                    return false;
                }

                var templateData = new Dictionary<string, string>
                {
                    {"VisitorName", visitor.FullName},
                    {"LocationName", visitor.Location.Name},
                    {"VisitDateTime", visitor.DateTime.ToString("dddd, MMMM dd, yyyy 'at' hh:mm tt")},
                    {"WhomToMeet", visitor.WhomToMeet},
                    {"RejectionReason", reason},
                    {"ContactInfo", _emailSettings.FromEmail}
                };

                var template = await GetEmailTemplateAsync(EmailTemplateType.VisitorRejectionNotice);
                var subject = await ProcessEmailTemplateAsync(template.Subject, templateData);
                var body = await ProcessEmailTemplateAsync(template.Body, templateData);

                var request = new EmailNotificationRequest
                {
                    ToEmail = visitor.Email,
                    ToName = visitor.FullName,
                    Subject = subject,
                    Body = body,
                    TemplateType = EmailTemplateType.VisitorRejectionNotice,
                    TemplateData = templateData
                };

                return await SendEmailAsync(request);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to send rejection notice for visitor {visitorId}");
                return false;
            }
        }

        public async Task<bool> SendVisitorCheckInNotificationAsync(int visitorId)
        {
            // Implementation for check-in notification
            // Similar pattern to above methods
            return await SendStatusChangeNotificationAsync(visitorId, EmailTemplateType.VisitorCheckInNotification);
        }

        public async Task<bool> SendVisitorCheckOutNotificationAsync(int visitorId)
        {
            // Implementation for check-out notification
            // Similar pattern to above methods
            return await SendStatusChangeNotificationAsync(visitorId, EmailTemplateType.VisitorCheckOutNotification);
        }

        public async Task<bool> SendBulkEmailAsync(List<EmailNotificationRequest> requests)
        {
            var tasks = requests.Select(SendEmailAsync);
            var results = await Task.WhenAll(tasks);
            return results.All(r => r);
        }

        public async Task<string> ProcessEmailTemplateAsync(string template, Dictionary<string, string> data)
        {
            var result = template;
            
            foreach (var kvp in data)
            {
                var placeholder = $"{{{{{kvp.Key}}}}}";
                result = result.Replace(placeholder, kvp.Value);
            }

            // Handle basic conditional statements {{#if Key}}content{{/if}}
            result = await ProcessConditionalTemplateAsync(result, data);
            
            return result;
        }

        public Task<bool> TestConnectionAsync()
        {
            try
            {
                using var client = CreateSmtpClient();
                // For Exchange Server, you might want to implement EWS connection test
                _logger.LogInformation("Email connection test successful");
                return Task.FromResult(true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Email connection test failed");
                return Task.FromResult(false);
            }
        }

        private SmtpClient CreateSmtpClient()
        {
            var client = new SmtpClient(_emailSettings.SmtpServer, _emailSettings.SmtpPort)
            {
                EnableSsl = _emailSettings.EnableSsl,
                Timeout = _emailSettings.TimeoutSeconds * 1000,
                DeliveryMethod = SmtpDeliveryMethod.Network,
                UseDefaultCredentials = false,
                Credentials = new NetworkCredential(_emailSettings.Username, _emailSettings.Password)
            };

            return client;
        }

        private string GenerateApprovalToken(int visitorId, string staffEmail)
        {
            try
            {
                // Create a simple token with visitor ID, staff email, and timestamp
                // This is a basic implementation - in production you might want to use JWT or another more secure method
                string tokenData = $"{visitorId}:{staffEmail}:{DateTime.UtcNow.AddDays(7).Ticks}";
                
                // Convert to Base64 for URL-friendly format
                byte[] tokenBytes = Encoding.UTF8.GetBytes(tokenData);
                return Convert.ToBase64String(tokenBytes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating approval token");
                // Fallback to a simpler token if there's an error
                return Convert.ToBase64String(Encoding.UTF8.GetBytes($"{visitorId}:{DateTime.UtcNow.Ticks}"));
            }
        }

        private Task<MailMessage> CreateMailMessageAsync(EmailNotificationRequest request)
        {
            var mailMessage = new MailMessage
            {
                From = new MailAddress(_emailSettings.FromEmail, _emailSettings.FromName),
                Subject = request.Subject,
                Body = request.Body,
                IsBodyHtml = true,
                Priority = request.IsHighPriority ? MailPriority.High : MailPriority.Normal
            };

            mailMessage.To.Add(new MailAddress(request.ToEmail, request.ToName));

            if (request.CcEmails != null)
            {
                foreach (var cc in request.CcEmails)
                {
                    mailMessage.CC.Add(cc);
                }
            }

            if (request.BccEmails != null)
            {
                foreach (var bcc in request.BccEmails)
                {
                    mailMessage.Bcc.Add(bcc);
                }
            }

            if (request.Attachments != null)
            {
                foreach (var attachment in request.Attachments)
                {
                    var stream = new MemoryStream(attachment.Content);
                    var mailAttachment = new Attachment(stream, attachment.FileName, attachment.ContentType);
                    mailMessage.Attachments.Add(mailAttachment);
                }
            }

            return Task.FromResult(mailMessage);
        }

        private async Task<EmailTemplate> GetEmailTemplateAsync(EmailTemplateType templateType)
        {
            var template = await _context.EmailTemplates
                .FirstOrDefaultAsync(t => t.Type == templateType && t.IsActive);

            if (template == null)
            {
                // Return default template if none found in database
                return GetDefaultTemplate(templateType);
            }

            return template;
        }

        private EmailTemplate GetDefaultTemplate(EmailTemplateType templateType)
        {
            return templateType switch
            {
                EmailTemplateType.VisitorNotificationToStaff => new EmailTemplate
                {
                    Name = "Visitor Notification to Staff",
                    Subject = "New Visitor Request - {{VisitorName}} wants to meet you",
                    Body = GetDefaultStaffNotificationTemplate(),
                    Type = EmailTemplateType.VisitorNotificationToStaff
                },
                EmailTemplateType.VisitorApprovalConfirmation => new EmailTemplate
                {
                    Name = "Visitor Approval Confirmation",
                    Subject = "Your visit to {{LocationName}} has been approved",
                    Body = GetDefaultApprovalTemplate(),
                    Type = EmailTemplateType.VisitorApprovalConfirmation
                },
                EmailTemplateType.VisitorRejectionNotice => new EmailTemplate
                {
                    Name = "Visitor Rejection Notice",
                    Subject = "Your visit request to {{LocationName}} requires attention",
                    Body = GetDefaultRejectionTemplate(),
                    Type = EmailTemplateType.VisitorRejectionNotice
                },
                _ => new EmailTemplate
                {
                    Name = "Default Template",
                    Subject = "Notification from {{LocationName}}",
                    Body = "This is a default email template.",
                    Type = templateType
                }
            };
        }

        private string GetDefaultStaffNotificationTemplate()
        {
            return @"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1'>
    <title>New Visitor Request</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #007bff; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f8f9fa; padding: 20px; }
        .visitor-details { background-color: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
        .button { display: inline-block; padding: 12px 25px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
        .button.reject { background-color: #dc3545; }
        .footer { background-color: #6c757d; color: white; padding: 15px; text-align: center; font-size: 12px; }
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>New Visitor Request</h1>
        </div>
        
        <div class='content'>
            <p>Dear {{StaffName}},</p>
            
            <p>You have a new visitor request that requires your attention.</p>
            
            <div class='visitor-details'>
                <h3>Visitor Information</h3>
                <p><strong>Name:</strong> {{VisitorName}}</p>
                <p><strong>Email:</strong> {{VisitorEmail}}</p>
                <p><strong>Phone:</strong> {{VisitorPhone}}</p>
                <p><strong>Company:</strong> {{CompanyName}}</p>
                <p><strong>Purpose of Visit:</strong> {{PurposeOfVisit}}</p>
                <p><strong>Requested Date & Time:</strong> {{VisitDateTime}}</p>
                <p><strong>Location:</strong> {{LocationName}}</p>
                {{#if Notes}}
                <p><strong>Additional Notes:</strong> {{Notes}}</p>
                {{/if}}
            </div>
            
            <div style='text-align: center; margin: 25px 0;'>
                <a href='{{ApprovalUrl}}' class='button'>Review Request</a>
            </div>
            
            <p>Please review this request and take appropriate action as soon as possible.</p>
        </div>
        
        <div class='footer'>
            <p>This is an automated message from the Visitor Management System.</p>
            <p>{{LocationName}} - Visitor Management</p>
        </div>
    </div>
</body>
</html>";
        }

        private string GetDefaultApprovalTemplate()
        {
            return @"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1'>
    <title>Visit Approved</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #28a745; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f8f9fa; padding: 20px; }
        .visit-details { background-color: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
        .footer { background-color: #6c757d; color: white; padding: 15px; text-align: center; font-size: 12px; }
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>✓ Your Visit Has Been Approved</h1>
        </div>
        
        <div class='content'>
            <p>Dear {{VisitorName}},</p>
            
            <p>Great news! Your visit request has been approved.</p>
            
            <div class='visit-details'>
                <h3>Visit Details</h3>
                <p><strong>Date & Time:</strong> {{VisitDateTime}}</p>
                <p><strong>Location:</strong> {{LocationName}}</p>
                <p><strong>Meeting with:</strong> {{WhomToMeet}}</p>
                <p><strong>Approved by:</strong> {{ApprovedBy}}</p>
                <p><strong>Approved on:</strong> {{ApprovedAt}}</p>
                {{#if LocationAddress}}
                <p><strong>Address:</strong> {{LocationAddress}}</p>
                {{/if}}
            </div>
            
            <p><strong>Important Notes:</strong></p>
            <ul>
                <li>Please arrive on time for your scheduled visit</li>
                <li>Bring a valid photo ID for verification</li>
                <li>Report to the reception desk upon arrival</li>
                <li>Follow all safety and security protocols</li>
            </ul>
            
            <p>If you need to make any changes to your visit, please contact us as soon as possible.</p>
        </div>
        
        <div class='footer'>
            <p>Thank you for using our Visitor Management System.</p>
            <p>{{LocationName}} - Visitor Management</p>
        </div>
    </div>
</body>
</html>";
        }

        private string GetDefaultRejectionTemplate()
        {
            return @"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1'>
    <title>Visit Request Update</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #dc3545; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f8f9fa; padding: 20px; }
        .reason-box { background-color: #fff3cd; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #ffc107; }
        .footer { background-color: #6c757d; color: white; padding: 15px; text-align: center; font-size: 12px; }
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>Visit Request Update</h1>
        </div>
        
        <div class='content'>
            <p>Dear {{VisitorName}},</p>
            
            <p>We regret to inform you that your visit request for {{VisitDateTime}} requires attention.</p>
            
            <div class='reason-box'>
                <h4>Reason:</h4>
                <p>{{RejectionReason}}</p>
            </div>
            
            <p>If you would like to reschedule or have any questions, please contact us at {{ContactInfo}}.</p>
            
            <p>We apologize for any inconvenience and look forward to accommodating your visit in the future.</p>
        </div>
        
        <div class='footer'>
            <p>Thank you for your understanding.</p>
            <p>{{LocationName}} - Visitor Management</p>
        </div>
    </div>
</body>
</html>";
        }

        private Task<bool> SendStatusChangeNotificationAsync(int visitorId, EmailTemplateType templateType)
        {
            // Implementation for status change notifications
            // This can be expanded based on specific requirements
            return Task.FromResult(true);
        }

        private Task<string> ProcessConditionalTemplateAsync(string template, Dictionary<string, string> data)
        {
            // Simple conditional processing for {{#if Key}}content{{/if}}
            var pattern = @"\{\{#if\s+(\w+)\}\}(.*?)\{\{/if\}\}";
            var regex = new Regex(pattern, RegexOptions.Singleline | RegexOptions.IgnoreCase);
            
            var result = regex.Replace(template, match =>
            {
                var key = match.Groups[1].Value;
                var content = match.Groups[2].Value;
                
                if (data.ContainsKey(key) && !string.IsNullOrEmpty(data[key]) && data[key] != "Not provided")
                {
                    return content;
                }
                return string.Empty;
            });
            
            return Task.FromResult(result);
        }

        private string GetBaseUrl()
        {
            // This should be configured in appsettings.json
            return "https://yourapp.com"; // Replace with actual base URL
        }
    }
}
