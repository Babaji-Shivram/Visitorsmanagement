using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SimpleAPI.Data;
using SimpleAPI.Models.Entities;
using SimpleAPI.Services;
using System.Security.Cryptography;
using System.Text;

namespace SimpleAPI.Controllers
{
    [ApiController]
    [Route("email-actions")]
    public class EmailActionsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IEmailService _emailService;
        private readonly IConfiguration _configuration;

        public EmailActionsController(ApplicationDbContext context, IEmailService emailService, IConfiguration configuration)
        {
            _context = context;
            _emailService = emailService;
            _configuration = configuration;
        }

        [HttpGet("approve/{visitorId}/{token}")]
        public async Task<IActionResult> ApproveVisitor(int visitorId, string token)
        {
            try
            {
                // Validate token
                if (!IsValidToken(visitorId, token))
                {
                    return Content(GenerateResponsePage("Error", "Invalid or expired approval link.", false), "text/html");
                }

                var visitor = await _context.Visitors.FindAsync(visitorId);
                if (visitor == null)
                {
                    return Content(GenerateResponsePage("Error", "Visitor not found.", false), "text/html");
                }

                if (visitor.Status != VisitorStatus.AwaitingApproval)
                {
                    return Content(GenerateResponsePage("Already Processed", 
                        $"This visitor request has already been {visitor.Status.ToString().ToLower()}.", false), "text/html");
                }

                // Update visitor status
                visitor.Status = VisitorStatus.Approved;
                visitor.ApprovedBy = "Email Action";
                visitor.ApprovedAt = DateTime.Now;
                visitor.UpdatedAt = DateTime.Now;

                await _context.SaveChangesAsync();

                // Send approval email to visitor
                try
                {
                    await _emailService.SendStatusUpdateEmailAsync(
                        visitor.Email ?? "",
                        visitor.FullName,
                        visitor.CompanyName ?? "",
                        visitor.PurposeOfVisit,
                        "Approved"
                    );
                }
                catch (Exception emailEx)
                {
                    Console.WriteLine($"❌ Failed to send approval email to visitor: {emailEx.Message}");
                }

                return Content(GenerateResponsePage("Approved!", 
                    $"Visitor {visitor.FullName} has been successfully approved. They will receive a confirmation email.", true), "text/html");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error approving visitor: {ex.Message}");
                return Content(GenerateResponsePage("Error", "An error occurred while processing the approval.", false), "text/html");
            }
        }

        [HttpGet("reject/{visitorId}/{token}")]
        public async Task<IActionResult> RejectVisitor(int visitorId, string token, [FromQuery] string? reason = null)
        {
            try
            {
                // Validate token
                if (!IsValidToken(visitorId, token))
                {
                    return Content(GenerateResponsePage("Error", "Invalid or expired rejection link.", false), "text/html");
                }

                var visitor = await _context.Visitors.FindAsync(visitorId);
                if (visitor == null)
                {
                    return Content(GenerateResponsePage("Error", "Visitor not found.", false), "text/html");
                }

                if (visitor.Status != VisitorStatus.AwaitingApproval)
                {
                    return Content(GenerateResponsePage("Already Processed", 
                        $"This visitor request has already been {visitor.Status.ToString().ToLower()}.", false), "text/html");
                }

                // Update visitor status
                visitor.Status = VisitorStatus.Rejected;
                visitor.UpdatedAt = DateTime.Now;
                if (!string.IsNullOrEmpty(reason))
                {
                    visitor.Notes = $"Rejected via email: {reason}";
                }

                await _context.SaveChangesAsync();

                // Send rejection email to visitor
                try
                {
                    await _emailService.SendStatusUpdateEmailAsync(
                        visitor.Email ?? "",
                        visitor.FullName,
                        visitor.CompanyName ?? "",
                        visitor.PurposeOfVisit,
                        "Rejected",
                        reason
                    );
                }
                catch (Exception emailEx)
                {
                    Console.WriteLine($"❌ Failed to send rejection email to visitor: {emailEx.Message}");
                }

                return Content(GenerateResponsePage("Rejected", 
                    $"Visitor {visitor.FullName} has been rejected. They will receive a notification email.", true), "text/html");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error rejecting visitor: {ex.Message}");
                return Content(GenerateResponsePage("Error", "An error occurred while processing the rejection.", false), "text/html");
            }
        }

        [HttpGet("reject-form/{visitorId}/{token}")]
        public async Task<IActionResult> ShowRejectForm(int visitorId, string token)
        {
            try
            {
                // Validate token
                if (!IsValidToken(visitorId, token))
                {
                    return Content(GenerateResponsePage("Error", "Invalid or expired rejection link.", false), "text/html");
                }

                var visitor = await _context.Visitors.FindAsync(visitorId);
                if (visitor == null)
                {
                    return Content(GenerateResponsePage("Error", "Visitor not found.", false), "text/html");
                }

                if (visitor.Status != VisitorStatus.AwaitingApproval)
                {
                    return Content(GenerateResponsePage("Already Processed", 
                        $"This visitor request has already been {visitor.Status.ToString().ToLower()}.", false), "text/html");
                }

                var rejectForm = $@"
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Reject Visitor Request</title>
                    <meta charset='utf-8'>
                    <meta name='viewport' content='width=device-width, initial-scale=1'>
                    <style>
                        body {{ 
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                            margin: 0; 
                            padding: 20px; 
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            min-height: 100vh;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        }}
                        .container {{ 
                            max-width: 500px; 
                            background: white; 
                            padding: 30px; 
                            border-radius: 15px; 
                            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                            text-align: center;
                        }}
                        .header {{ 
                            background: linear-gradient(135deg, #dc3545, #c82333);
                            color: white; 
                            padding: 20px; 
                            margin: -30px -30px 20px -30px; 
                            border-radius: 15px 15px 0 0;
                        }}
                        .visitor-info {{ 
                            background: #f8f9fa; 
                            padding: 15px; 
                            border-radius: 8px; 
                            margin: 20px 0; 
                            text-align: left;
                        }}
                        .form-group {{ 
                            margin: 20px 0; 
                            text-align: left;
                        }}
                        label {{ 
                            display: block; 
                            margin-bottom: 8px; 
                            font-weight: bold; 
                            color: #333;
                        }}
                        textarea {{ 
                            width: 100%; 
                            padding: 12px; 
                            border: 2px solid #ddd; 
                            border-radius: 8px; 
                            font-family: inherit; 
                            resize: vertical;
                            min-height: 100px;
                            box-sizing: border-box;
                        }}
                        textarea:focus {{ 
                            border-color: #dc3545; 
                            outline: none; 
                            box-shadow: 0 0 0 3px rgba(220,53,69,0.1);
                        }}
                        .button-group {{ 
                            margin-top: 30px; 
                            display: flex; 
                            gap: 15px;
                            justify-content: center;
                        }}
                        .btn {{ 
                            padding: 12px 30px; 
                            border: none; 
                            border-radius: 8px; 
                            font-size: 16px; 
                            font-weight: bold; 
                            cursor: pointer; 
                            transition: all 0.3s ease;
                            text-decoration: none;
                            display: inline-block;
                        }}
                        .btn-reject {{ 
                            background: linear-gradient(135deg, #dc3545, #c82333); 
                            color: white; 
                        }}
                        .btn-reject:hover {{ 
                            background: linear-gradient(135deg, #c82333, #a71e2a); 
                            transform: translateY(-2px);
                            box-shadow: 0 5px 15px rgba(220,53,69,0.4);
                        }}
                        .btn-cancel {{ 
                            background: #6c757d; 
                            color: white; 
                        }}
                        .btn-cancel:hover {{ 
                            background: #5a6268; 
                            transform: translateY(-2px);
                        }}
                        .info-row {{ 
                            display: flex; 
                            justify-content: space-between; 
                            margin: 8px 0; 
                            padding: 5px 0;
                            border-bottom: 1px solid #eee;
                        }}
                        .info-row:last-child {{ 
                            border-bottom: none; 
                        }}
                        .info-label {{ 
                            font-weight: bold; 
                            color: #666; 
                        }}
                        .info-value {{ 
                            color: #333; 
                        }}
                    </style>
                </head>
                <body>
                    <div class='container'>
                        <div class='header'>
                            <h2 style='margin: 0;'>🚫 Reject Visitor Request</h2>
                        </div>
                        
                        <div class='visitor-info'>
                            <h4 style='margin-top: 0; color: #333;'>Visitor Details:</h4>
                            <div class='info-row'>
                                <span class='info-label'>Name:</span>
                                <span class='info-value'>{visitor.FullName}</span>
                            </div>
                            <div class='info-row'>
                                <span class='info-label'>Company:</span>
                                <span class='info-value'>{visitor.CompanyName ?? "N/A"}</span>
                            </div>
                            <div class='info-row'>
                                <span class='info-label'>Purpose:</span>
                                <span class='info-value'>{visitor.PurposeOfVisit}</span>
                            </div>
                            <div class='info-row'>
                                <span class='info-label'>Whom to Meet:</span>
                                <span class='info-value'>{visitor.WhomToMeet}</span>
                            </div>
                            <div class='info-row'>
                                <span class='info-label'>Date & Time:</span>
                                <span class='info-value'>{visitor.DateTime:yyyy-MM-dd HH:mm}</span>
                            </div>
                        </div>

                        <form method='GET' action='/email-actions/reject/{visitorId}/{token}'>
                            <div class='form-group'>
                                <label for='reason'>Reason for Rejection (Optional):</label>
                                <textarea name='reason' id='reason' placeholder='Please provide a reason for rejecting this visitor request...'></textarea>
                            </div>
                            
                            <div class='button-group'>
                                <button type='submit' class='btn btn-reject'>
                                    🚫 Confirm Rejection
                                </button>
                                <a href='javascript:history.back()' class='btn btn-cancel'>
                                    ↩️ Cancel
                                </a>
                            </div>
                        </form>
                    </div>
                </body>
                </html>";

                return Content(rejectForm, "text/html");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error showing reject form: {ex.Message}");
                return Content(GenerateResponsePage("Error", "An error occurred while loading the rejection form.", false), "text/html");
            }
        }

        private bool IsValidToken(int visitorId, string token)
        {
            try
            {
                // Generate expected token and compare
                var expectedToken = GenerateToken(visitorId);
                return token == expectedToken;
            }
            catch
            {
                return false;
            }
        }

        public static string GenerateToken(int visitorId)
        {
            // Generate a simple but secure token based on visitor ID and a secret
            var secret = "VISITOR_EMAIL_ACTION_SECRET_2024"; // In production, use a proper secret from configuration
            var data = $"{visitorId}:{secret}:{DateTime.Now:yyyy-MM-dd}"; // Include date to make tokens daily-expire
            
            using var sha256 = SHA256.Create();
            var hashBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(data));
            return Convert.ToBase64String(hashBytes).Substring(0, 16).Replace("+", "-").Replace("/", "_");
        }

        private static string GenerateResponsePage(string title, string message, bool isSuccess)
        {
            var backgroundColor = isSuccess ? "linear-gradient(135deg, #10b981, #059669)" : "linear-gradient(135deg, #ef4444, #dc2626)";
            var icon = isSuccess ? "✅" : "❌";
            var statusColor = isSuccess ? "#10b981" : "#ef4444";
            
            return $@"
            <!DOCTYPE html>
            <html>
            <head>
                <title>{title} - BABAJI SHIVRAM Visitor Management</title>
                <meta charset='utf-8'>
                <meta name='viewport' content='width=device-width, initial-scale=1'>
                <style>
                    body {{ 
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                        margin: 0; 
                        padding: 20px; 
                        background: {backgroundColor};
                        min-height: 100vh;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }}
                    .container {{ 
                        max-width: 500px; 
                        background: white; 
                        padding: 40px; 
                        border-radius: 20px; 
                        box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                        text-align: center;
                        border-top: 4px solid {statusColor};
                    }}
                    .icon {{ 
                        font-size: 4rem; 
                        margin-bottom: 20px; 
                        animation: bounce 1s ease-in-out;
                    }}
                    @keyframes bounce {{
                        0%, 20%, 50%, 80%, 100% {{ transform: translateY(0); }}
                        40% {{ transform: translateY(-10px); }}
                        60% {{ transform: translateY(-5px); }}
                    }}
                    .status-badge {{
                        display: inline-block;
                        background: {statusColor};
                        color: white;
                        padding: 8px 16px;
                        border-radius: 20px;
                        font-size: 0.9rem;
                        font-weight: bold;
                        margin-bottom: 20px;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                    }}
                    h1 {{ 
                        color: #1f2937; 
                        margin-bottom: 20px; 
                        font-size: 2rem;
                        font-weight: 700;
                    }}
                    p {{ 
                        color: #6b7280; 
                        font-size: 1.1rem; 
                        line-height: 1.6; 
                        margin-bottom: 30px;
                    }}
                    .btn {{ 
                        background: linear-gradient(135deg, #3b82f6, #1d4ed8); 
                        color: white; 
                        padding: 14px 32px; 
                        border: none; 
                        border-radius: 12px; 
                        font-size: 16px; 
                        font-weight: 600;
                        cursor: pointer; 
                        text-decoration: none; 
                        display: inline-block;
                        transition: all 0.3s ease;
                        margin: 0 8px;
                    }}
                    .btn:hover {{ 
                        background: linear-gradient(135deg, #1d4ed8, #1e40af); 
                        transform: translateY(-2px);
                        box-shadow: 0 8px 25px rgba(59,130,246,0.4);
                    }}
                    .btn-secondary {{
                        background: linear-gradient(135deg, #6b7280, #4b5563);
                    }}
                    .btn-secondary:hover {{
                        background: linear-gradient(135deg, #4b5563, #374151);
                        box-shadow: 0 8px 25px rgba(107,114,128,0.4);
                    }}
                    .timestamp {{ 
                        color: #9ca3af; 
                        font-size: 0.9rem; 
                        margin-top: 30px; 
                        border-top: 1px solid #e5e7eb; 
                        padding-top: 20px;
                    }}
                    .logo {{
                        color: {statusColor};
                        font-weight: bold;
                        font-size: 0.9rem;
                        margin-bottom: 30px;
                        letter-spacing: 0.5px;
                    }}
                </style>
            </head>
            <body>
                <div class='container'>
                    <div class='logo'>🏢 BABAJI SHIVRAM</div>
                    <div class='icon'>{icon}</div>
                    <div class='status-badge'>{(isSuccess ? "Success" : "Error")}</div>
                    <h1>{title}</h1>
                    <p>{message}</p>
                    <div>
                        <a href='javascript:window.close()' class='btn'>✨ Close Window</a>
                        <a href='javascript:history.back()' class='btn btn-secondary'>↩️ Go Back</a>
                    </div>
                    <div class='timestamp'>
                        📅 Action completed: {DateTime.Now:MMM dd, yyyy 'at' hh:mm tt}
                    </div>
                </div>
                
                <script>
                    // Auto-close after 5 seconds if user doesn't interact
                    setTimeout(function() {{
                        if (confirm('Window will close automatically. Click Cancel to keep it open.')) {{
                            window.close();
                        }}
                    }}, 5000);
                </script>
            </body>
            </html>";
        }
    }
}
