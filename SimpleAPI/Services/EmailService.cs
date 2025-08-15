using System;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace SimpleAPI.Services
{
    public interface IEmailService
    {
        Task SendTestEmailAsync(string email, string? message);
        Task SendVisitorNotificationAsync(string notificationEmail, string visitorName, string visitorEmail, 
            string company, string purpose, string dateTime, string status);
        Task SendVisitorNotificationWithActionsAsync(string notificationEmail, int visitorId, string visitorName, 
            string visitorEmail, string company, string purpose, string dateTime, string status);
        Task SendStatusUpdateEmailAsync(string visitorEmail, string visitorName, string company, 
            string purpose, string status, string? reason = null);
        Task SendVisitorRegistrationNotificationAsync(string visitorEmail, string visitorName, string company, 
            string purpose, string whomToMeet, string dateTime);
    }

    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;
        private readonly bool _emailEnabled;

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;
            _emailEnabled = _configuration.GetValue<bool>("EmailSettings:Enabled", false);
        }

        public async Task SendTestEmailAsync(string email, string? message)
        {
            try
            {
                var subject = "Visitor Management System - Test Email";
                var body = $@"
                    <html>
                    <body>
                        <h2>Test Email from Visitor Management System</h2>
                        <p>This is a test email to verify email functionality.</p>
                        <p>Message: {message ?? "Email service is working correctly!"}</p>
                        <p><strong>Sent at:</strong> {DateTime.Now:yyyy-MM-dd HH:mm:ss}</p>
                    </body>
                    </html>";

                await SendEmailAsync(email, subject, body);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send test email to {Email}", email);
            }
        }

        public async Task SendVisitorNotificationWithActionsAsync(string notificationEmail, int visitorId, 
            string visitorName, string visitorEmail, string company, string purpose, string dateTime, string status)
        {
            try
            {
                // Generate secure tokens for email actions
                var token = Controllers.EmailActionsController.GenerateToken(visitorId);
                var baseUrl = _configuration["BaseUrl"] ?? "http://localhost:5001";
                var approveUrl = $"{baseUrl}/email-actions/approve/{visitorId}/{token}";
                var rejectUrl = $"{baseUrl}/email-actions/reject-form/{visitorId}/{token}";

                var subject = $"🔔 New Visitor Registration - {visitorName} - ACTION REQUIRED";
                var body = $@"
                    <html>
                    <head>
                        <style>
                            body {{ 
                                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                                line-height: 1.6; 
                                color: #333; 
                                margin: 0; 
                                padding: 20px; 
                                background-color: #f8f9fa;
                            }}
                            .email-container {{ 
                                max-width: 600px; 
                                margin: 0 auto; 
                                background: white; 
                                border-radius: 10px; 
                                overflow: hidden; 
                                box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                            }}
                            .header {{ 
                                background: linear-gradient(135deg, #007bff, #0056b3); 
                                color: white; 
                                padding: 25px; 
                                text-align: center;
                            }}
                            .header h2 {{ 
                                margin: 0; 
                                font-size: 1.5rem; 
                            }}
                            .content {{ 
                                padding: 30px; 
                            }}
                            .visitor-info {{ 
                                background: #f8f9fa; 
                                border-radius: 8px; 
                                padding: 20px; 
                                margin: 20px 0;
                            }}
                            .info-table {{ 
                                width: 100%; 
                                border-collapse: collapse; 
                                margin: 15px 0;
                            }}
                            .info-table td {{ 
                                padding: 12px; 
                                border-bottom: 1px solid #e9ecef; 
                                vertical-align: top;
                            }}
                            .info-table td:first-child {{ 
                                font-weight: bold; 
                                color: #495057; 
                                width: 35%; 
                            }}
                            .info-table td:last-child {{ 
                                color: #212529; 
                            }}
                            .action-buttons {{ 
                                text-align: center; 
                                margin: 30px 0; 
                                padding: 25px; 
                                background: linear-gradient(135deg, #f8f9fa, #e9ecef); 
                                border-radius: 8px;
                            }}
                            .btn {{ 
                                display: inline-block; 
                                padding: 15px 30px; 
                                margin: 0 10px; 
                                text-decoration: none; 
                                border-radius: 8px; 
                                font-weight: bold; 
                                font-size: 16px; 
                                text-align: center; 
                                transition: all 0.3s ease;
                                border: none;
                                cursor: pointer;
                            }}
                            .btn-approve {{ 
                                background: linear-gradient(135deg, #28a745, #20c997); 
                                color: white; 
                                box-shadow: 0 4px 15px rgba(40,167,69,0.3);
                            }}
                            .btn-approve:hover {{ 
                                background: linear-gradient(135deg, #218838, #1e7e34); 
                                transform: translateY(-2px);
                                box-shadow: 0 6px 20px rgba(40,167,69,0.4);
                            }}
                            .btn-reject {{ 
                                background: linear-gradient(135deg, #dc3545, #c82333); 
                                color: white; 
                                box-shadow: 0 4px 15px rgba(220,53,69,0.3);
                            }}
                            .btn-reject:hover {{ 
                                background: linear-gradient(135deg, #c82333, #a71e2a); 
                                transform: translateY(-2px);
                                box-shadow: 0 6px 20px rgba(220,53,69,0.4);
                            }}
                            .status-badge {{ 
                                background: #ffc107; 
                                color: #212529; 
                                padding: 6px 12px; 
                                border-radius: 20px; 
                                font-weight: bold; 
                                font-size: 0.9rem;
                            }}
                            .footer {{ 
                                background: #f8f9fa; 
                                padding: 20px; 
                                text-align: center; 
                                color: #6c757d; 
                                font-size: 0.9rem; 
                                border-top: 1px solid #e9ecef;
                            }}
                            .urgent-notice {{ 
                                background: #fff3cd; 
                                border: 1px solid #ffeaa7; 
                                border-radius: 8px; 
                                padding: 15px; 
                                margin: 20px 0; 
                                color: #856404;
                            }}
                            .quick-info {{ 
                                background: linear-gradient(135deg, #e3f2fd, #bbdefb); 
                                border-radius: 8px; 
                                padding: 15px; 
                                margin: 20px 0;
                            }}
                        </style>
                    </head>
                    <body>
                        <div class='email-container'>
                            <div class='header'>
                                <h2>🔔 New Visitor Registration</h2>
                                <p style='margin: 10px 0 0 0; opacity: 0.9;'>Action Required - Awaiting Your Approval</p>
                            </div>
                            
                            <div class='content'>
                                <div class='urgent-notice'>
                                    <strong>⏰ Quick Action Required:</strong> A new visitor has registered and needs your approval to proceed with their visit.
                                </div>
                                
                                <div class='visitor-info'>
                                    <h3 style='margin-top: 0; color: #495057; border-bottom: 2px solid #007bff; padding-bottom: 10px;'>
                                        👤 Visitor Details
                                    </h3>
                                    <table class='info-table'>
                                        <tr>
                                            <td>📝 Full Name:</td>
                                            <td><strong>{visitorName}</strong></td>
                                        </tr>
                                        <tr>
                                            <td>📧 Email Address:</td>
                                            <td>{visitorEmail}</td>
                                        </tr>
                                        <tr>
                                            <td>🏢 Company:</td>
                                            <td>{company}</td>
                                        </tr>
                                        <tr>
                                            <td>🎯 Purpose of Visit:</td>
                                            <td>{purpose}</td>
                                        </tr>
                                        <tr>
                                            <td>📅 Expected Arrival:</td>
                                            <td><strong>{dateTime}</strong></td>
                                        </tr>
                                        <tr>
                                            <td>📊 Current Status:</td>
                                            <td><span class='status-badge'>{status}</span></td>
                                        </tr>
                                    </table>
                                </div>

                                <div class='quick-info'>
                                    <h4 style='margin-top: 0; color: #1565c0;'>🚀 One-Click Actions Available</h4>
                                    <p style='margin-bottom: 0;'>You can approve or reject this visitor request directly from this email. No need to log into the system!</p>
                                </div>

                                <div class='action-buttons'>
                                    <h3 style='color: #495057; margin-bottom: 20px;'>Choose Your Action:</h3>
                                    
                                    <a href='{approveUrl}' class='btn btn-approve' 
                                       style='text-decoration: none; color: white;'>
                                        ✅ APPROVE VISITOR
                                    </a>
                                    
                                    <a href='{rejectUrl}' class='btn btn-reject' 
                                       style='text-decoration: none; color: white;'>
                                        ❌ REJECT VISITOR
                                    </a>
                                </div>

                                <div style='background: #f8f9fa; border-radius: 8px; padding: 15px; margin: 20px 0;'>
                                    <h4 style='margin-top: 0; color: #495057;'>📋 What happens next?</h4>
                                    <ul style='margin-bottom: 0; color: #6c757d;'>
                                        <li><strong>If you APPROVE:</strong> The visitor will receive a confirmation email and can proceed with their visit</li>
                                        <li><strong>If you REJECT:</strong> The visitor will be notified that their request was declined</li>
                                        <li><strong>No action needed:</strong> You can also manage this visitor request through the admin dashboard</li>
                                    </ul>
                                </div>
                            </div>
                            
                            <div class='footer'>
                                <p style='margin: 0;'>
                                    🤖 This is an automated notification from the Visitor Management System<br>
                                    📅 Sent on {DateTime.Now:yyyy-MM-dd HH:mm:ss}<br>
                                    🔐 Secure email action links expire daily for security
                                </p>
                            </div>
                        </div>
                    </body>
                    </html>";

                await SendEmailAsync(notificationEmail, subject, body);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send visitor notification with actions to {Email}", notificationEmail);
            }
        }

        public async Task SendVisitorNotificationAsync(string notificationEmail, string visitorName, 
            string visitorEmail, string company, string purpose, string dateTime, string status)
        {
            try
            {
                var subject = $"New Visitor Registration - {visitorName}";
                var body = $@"
                    <html>
                    <body>
                        <h2>New Visitor Notification</h2>
                        <p>A new visitor has registered and requires your attention.</p>
                        <br>
                        <table border='1' cellpadding='5' cellspacing='0' style='border-collapse: collapse;'>
                            <tr><td><strong>Visitor Name:</strong></td><td>{visitorName}</td></tr>
                            <tr><td><strong>Email:</strong></td><td>{visitorEmail}</td></tr>
                            <tr><td><strong>Company:</strong></td><td>{company}</td></tr>
                            <tr><td><strong>Purpose of Visit:</strong></td><td>{purpose}</td></tr>
                            <tr><td><strong>Expected Arrival:</strong></td><td>{dateTime}</td></tr>
                            <tr><td><strong>Status:</strong></td><td><span style='color: orange; font-weight: bold;'>{status}</span></td></tr>
                        </table>
                        <br>
                        <p><strong>Action Required:</strong> Please review and approve/reject this visitor request.</p>
                        <hr>
                        <p><em>This is an automated notification from the Visitor Management System.</em></p>
                    </body>
                    </html>";

                await SendEmailAsync(notificationEmail, subject, body);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send visitor notification to {Email}", notificationEmail);
            }
        }

        public async Task SendVisitorRegistrationNotificationAsync(string visitorEmail, string visitorName, 
            string company, string purpose, string whomToMeet, string dateTime)
        {
            try
            {
                var subject = "Visitor Registration Confirmation";
                var body = $@"
                    <html>
                    <body>
                        <h2>Visitor Registration Confirmation</h2>
                        <p>Dear {visitorName},</p>
                        <p>Thank you for registering your visit. Your registration has been received and is currently being processed.</p>
                        <br>
                        <table border='1' cellpadding='5' cellspacing='0' style='border-collapse: collapse;'>
                            <tr><td><strong>Visitor Name:</strong></td><td>{visitorName}</td></tr>
                            <tr><td><strong>Company:</strong></td><td>{company}</td></tr>
                            <tr><td><strong>Purpose of Visit:</strong></td><td>{purpose}</td></tr>
                            <tr><td><strong>Whom to Meet:</strong></td><td>{whomToMeet}</td></tr>
                            <tr><td><strong>Scheduled Time:</strong></td><td>{dateTime}</td></tr>
                            <tr><td><strong>Status:</strong></td><td><span style='color: orange; font-weight: bold;'>Awaiting Approval</span></td></tr>
                        </table>
                        <br>
                        <p><strong>Next Steps:</strong></p>
                        <ul>
                            <li>Your visit request will be reviewed by our staff</li>
                            <li>You will receive a confirmation email once approved</li>
                            <li>Please bring a valid ID when you arrive</li>
                        </ul>
                        <hr>
                        <p><em>This is an automated confirmation from the Visitor Management System.</em></p>
                    </body>
                    </html>";

                await SendEmailAsync(visitorEmail, subject, body);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send visitor registration confirmation to {Email}", visitorEmail);
            }
        }

        public async Task SendStatusUpdateEmailAsync(string visitorEmail, string visitorName, 
            string company, string purpose, string status, string? reason = null)
        {
            try
            {
                string statusMessage = status.ToLower() switch
                {
                    "approved" => "Great news! Your visit has been approved. Please proceed to the reception desk upon arrival.",
                    "rejected" => $"We regret to inform you that your visit request has been declined.",
                    "checked_in" => "Welcome! You have successfully checked in.",
                    "checked_out" => "Thank you for your visit. You have been checked out successfully.",
                    "rescheduled" => "Your visit has been rescheduled. Please check the new date and time below.",
                    _ => $"Your visit status has been updated."
                };

                string statusColor = status.ToLower() switch
                {
                    "approved" => "green",
                    "rejected" => "red",
                    "checked_in" => "blue",
                    "checked_out" => "purple",
                    "rescheduled" => "orange",
                    _ => "black"
                };

                var subject = $"Visit Status Update - {status.ToUpper()}";
                var body = $@"
                    <html>
                    <body>
                        <h2>Visit Status Update</h2>
                        <p>Dear {visitorName},</p>
                        <p>{statusMessage}</p>
                        {(!string.IsNullOrEmpty(reason) ? $"<p><strong>Reason:</strong> {reason}</p>" : "")}
                        <br>
                        <table border='1' cellpadding='5' cellspacing='0' style='border-collapse: collapse;'>
                            <tr><td><strong>Visitor:</strong></td><td>{visitorName}</td></tr>
                            <tr><td><strong>Company:</strong></td><td>{company}</td></tr>
                            <tr><td><strong>Purpose:</strong></td><td>{purpose}</td></tr>
                            <tr><td><strong>Status:</strong></td><td><span style='color: {statusColor}; font-weight: bold;'>{status.ToUpper()}</span></td></tr>
                            <tr><td><strong>Updated At:</strong></td><td>{DateTime.Now:yyyy-MM-dd HH:mm:ss}</td></tr>
                        </table>
                        <hr>
                        <p><em>This is an automated notification from the Visitor Management System.</em></p>
                    </body>
                    </html>";

                await SendEmailAsync(visitorEmail, subject, body);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send status update email to {Email}", visitorEmail);
            }
        }

        private async Task SendEmailAsync(string toEmail, string subject, string body)
        {
            try
            {
                if (!_emailEnabled)
                {
                    // Log to console when email is disabled
                    _logger.LogInformation("📧 EMAIL SIMULATION (Email Disabled):");
                    _logger.LogInformation("   TO: {ToEmail}", toEmail);
                    _logger.LogInformation("   SUBJECT: {Subject}", subject);
                    _logger.LogInformation("   SENT AT: {SentAt}", DateTime.Now);
                    return;
                }

                var smtpHost = _configuration["EmailSettings:SmtpServer"] ?? _configuration["EmailSettings:SmtpHost"];
                var smtpPort = _configuration.GetValue<int>("EmailSettings:Port", _configuration.GetValue<int>("EmailSettings:SmtpPort", 587));
                var smtpUsername = _configuration["EmailSettings:Username"] ?? _configuration["EmailSettings:SmtpUsername"];
                // Prefer AppPassword for Office 365 SMTP, fallback to regular Password
                var smtpPassword = _configuration["EmailSettings:AppPassword"] ?? 
                                   _configuration["EmailSettings:Password"] ?? 
                                   _configuration["EmailSettings:SmtpPassword"];
                var fromEmail = _configuration["EmailSettings:FromEmail"];
                var fromName = _configuration["EmailSettings:FromName"] ?? "Visitor Management System";
                var enableSsl = _configuration.GetValue<bool>("EmailSettings:EnableSsl", true);

                if (string.IsNullOrEmpty(smtpHost) || string.IsNullOrEmpty(smtpUsername) || 
                    string.IsNullOrEmpty(smtpPassword) || string.IsNullOrEmpty(fromEmail))
                {
                    _logger.LogWarning("Email settings are not properly configured. Falling back to console logging.");
                    _logger.LogInformation("📧 EMAIL FALLBACK:");
                    _logger.LogInformation("   TO: {ToEmail}", toEmail);
                    _logger.LogInformation("   SUBJECT: {Subject}", subject);
                    _logger.LogInformation("   SENT AT: {SentAt}", DateTime.Now);
                    return;
                }

                _logger.LogInformation("📧 Attempting to send email to {ToEmail}", toEmail);
                _logger.LogInformation("   SMTP Host: {SmtpHost}:{SmtpPort}", smtpHost, smtpPort);
                _logger.LogInformation("   Username: {Username}", smtpUsername);
                _logger.LogInformation("   SSL Enabled: {EnableSsl}", enableSsl);
                _logger.LogInformation("   From: {FromEmail}", fromEmail);

                // Enhanced Office365 compatible SMTP configuration
                using var client = new SmtpClient();
                client.Host = smtpHost;
                client.Port = smtpPort;
                client.EnableSsl = enableSsl;
                client.UseDefaultCredentials = false;
                client.DeliveryMethod = SmtpDeliveryMethod.Network;
                client.Timeout = 30000; // 30 seconds timeout
                
                // Set credentials - critical for Office365
                client.Credentials = new NetworkCredential(smtpUsername, smtpPassword);
                
                _logger.LogInformation("📤 Configuring SMTP credentials...");

                var mailMessage = new MailMessage();
                mailMessage.From = new MailAddress(fromEmail, fromName);
                mailMessage.To.Add(new MailAddress(toEmail));
                mailMessage.Subject = subject;
                mailMessage.Body = body;
                mailMessage.IsBodyHtml = true;
                
                // Additional headers for better Office365 compatibility
                mailMessage.Headers.Add("X-Mailer", "Visitor Management System");
                mailMessage.Headers.Add("X-Priority", "3");

                _logger.LogInformation("📤 Sending email via enhanced SMTP...");
                
                // Use SendMailAsync for better async handling
                await client.SendMailAsync(mailMessage);
                
                _logger.LogInformation("✅ Email sent successfully to {ToEmail}", toEmail);
            }
            catch (SmtpException smtpEx)
            {
                _logger.LogError(smtpEx, "❌ SMTP Error sending email to {ToEmail}: {StatusCode} - {Message}", 
                    toEmail, smtpEx.StatusCode, smtpEx.Message);
                
                // Final fallback to console logging
                _logger.LogInformation("📧 EMAIL FALLBACK (SMTP Error):");
                _logger.LogInformation("   TO: {ToEmail}", toEmail);
                _logger.LogInformation("   SUBJECT: {Subject}", subject);
                _logger.LogInformation("   SMTP ERROR: {Error}", smtpEx.Message);
                _logger.LogInformation("   STATUS CODE: {StatusCode}", smtpEx.StatusCode);
                _logger.LogInformation("   SENT AT: {SentAt}", DateTime.Now);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ General error sending email to {ToEmail}", toEmail);
                
                // Final fallback to console logging
                _logger.LogInformation("📧 EMAIL FALLBACK (General Error):");
                _logger.LogInformation("   TO: {ToEmail}", toEmail);
                _logger.LogInformation("   SUBJECT: {Subject}", subject);
                _logger.LogInformation("   ERROR: {Error}", ex.Message);
                _logger.LogInformation("   SENT AT: {SentAt}", DateTime.Now);
            }
        }
    }
}
