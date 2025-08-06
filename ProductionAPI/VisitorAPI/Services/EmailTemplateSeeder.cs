using Microsoft.EntityFrameworkCore;
using VisitorManagement.API.Data;
using VisitorManagement.API.Models.Email;

namespace VisitorManagement.API.Services
{
    public static class EmailTemplateSeeder
    {
        public static async Task SeedDefaultTemplatesAsync(ApplicationDbContext context)
        {
            // Check if templates already exist
            var existingTemplates = await context.EmailTemplates.AnyAsync();
            if (existingTemplates)
                return;

            var templates = GetDefaultTemplates();
            
            context.EmailTemplates.AddRange(templates);
            await context.SaveChangesAsync();
        }

        private static List<EmailTemplate> GetDefaultTemplates()
        {
            return new List<EmailTemplate>
            {
                new EmailTemplate
                {
                    Name = "Visitor Notification to Staff",
                    Subject = "New Visitor Request - {{VisitorName}} wants to meet you",
                    Body = GetStaffNotificationTemplate(),
                    Type = EmailTemplateType.VisitorNotificationToStaff,
                    IsActive = true
                },
                new EmailTemplate
                {
                    Name = "Visitor Approval Confirmation",
                    Subject = "Your visit to {{LocationName}} has been approved",
                    Body = GetApprovalConfirmationTemplate(),
                    Type = EmailTemplateType.VisitorApprovalConfirmation,
                    IsActive = true
                },
                new EmailTemplate
                {
                    Name = "Visitor Rejection Notice",
                    Subject = "Your visit request to {{LocationName}} requires attention",
                    Body = GetRejectionNoticeTemplate(),
                    Type = EmailTemplateType.VisitorRejectionNotice,
                    IsActive = true
                },
                new EmailTemplate
                {
                    Name = "Visitor Check-In Notification",
                    Subject = "{{VisitorName}} has checked in at {{LocationName}}",
                    Body = GetCheckInNotificationTemplate(),
                    Type = EmailTemplateType.VisitorCheckInNotification,
                    IsActive = true
                },
                new EmailTemplate
                {
                    Name = "Visitor Check-Out Notification",
                    Subject = "{{VisitorName}} has checked out from {{LocationName}}",
                    Body = GetCheckOutNotificationTemplate(),
                    Type = EmailTemplateType.VisitorCheckOutNotification,
                    IsActive = true
                }
            };
        }

        private static string GetStaffNotificationTemplate()
        {
            return @"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1'>
    <title>New Visitor Request</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background-color: #007bff; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px 20px; }
        .visitor-details { background-color: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #007bff; }
        .detail-row { margin: 10px 0; }
        .label { font-weight: bold; color: #495057; }
        .value { color: #212529; }
        .action-buttons { text-align: center; margin: 30px 0; }
        .button { display: inline-block; padding: 12px 25px; margin: 5px; text-decoration: none; border-radius: 5px; font-weight: bold; }
        .approve-btn { background-color: #28a745; color: white; }
        .review-btn { background-color: #007bff; color: white; }
        .footer { background-color: #6c757d; color: white; padding: 20px; text-align: center; font-size: 12px; }
        .urgent { background-color: #fff3cd; border-left-color: #ffc107; }
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>🔔 New Visitor Request</h1>
            <p style='margin: 5px 0;'>Requires Your Attention</p>
        </div>
        
        <div class='content'>
            <p>Dear {{StaffName}},</p>
            
            <p>You have received a new visitor request that requires your review and approval.</p>
            
            <div class='visitor-details'>
                <h3 style='margin-top: 0; color: #007bff;'>👤 Visitor Information</h3>
                
                <div class='detail-row'>
                    <span class='label'>Name:</span> 
                    <span class='value'>{{VisitorName}}</span>
                </div>
                
                <div class='detail-row'>
                    <span class='label'>📧 Email:</span> 
                    <span class='value'>{{VisitorEmail}}</span>
                </div>
                
                <div class='detail-row'>
                    <span class='label'>📱 Phone:</span> 
                    <span class='value'>{{VisitorPhone}}</span>
                </div>
                
                <div class='detail-row'>
                    <span class='label'>🏢 Company:</span> 
                    <span class='value'>{{CompanyName}}</span>
                </div>
                
                <div class='detail-row'>
                    <span class='label'>📝 Purpose:</span> 
                    <span class='value'>{{PurposeOfVisit}}</span>
                </div>
                
                <div class='detail-row'>
                    <span class='label'>⏰ Requested Time:</span> 
                    <span class='value'>{{VisitDateTime}}</span>
                </div>
                
                <div class='detail-row'>
                    <span class='label'>📍 Location:</span> 
                    <span class='value'>{{LocationName}}</span>
                </div>
                
                {{#if Notes}}
                <div class='detail-row'>
                    <span class='label'>📋 Additional Notes:</span> 
                    <span class='value'>{{Notes}}</span>
                </div>
                {{/if}}
            </div>
            
            <div class='action-buttons'>
                <a href='{{ApprovalUrl}}' class='button review-btn'>📋 Review & Approve Request</a>
            </div>
            
            <p><strong>⚡ Action Required:</strong> Please review this request and take appropriate action as soon as possible to ensure a smooth visitor experience.</p>
            
            <p>If you have any questions or cannot accommodate this visitor, please contact the reception desk or respond to this email.</p>
        </div>
        
        <div class='footer'>
            <p>📧 This is an automated message from the Visitor Management System</p>
            <p>{{LocationName}} - Visitor Management</p>
            <p>Please do not reply to this email</p>
        </div>
    </div>
</body>
</html>";
        }

        private static string GetApprovalConfirmationTemplate()
        {
            return @"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1'>
    <title>Visit Approved</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background-color: #28a745; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px 20px; }
        .visit-details { background-color: #d4edda; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #28a745; }
        .detail-row { margin: 10px 0; }
        .label { font-weight: bold; color: #155724; }
        .value { color: #155724; }
        .instructions { background-color: #fff3cd; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #ffc107; }
        .footer { background-color: #6c757d; color: white; padding: 20px; text-align: center; font-size: 12px; }
        .check-icon { font-size: 48px; }
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <div class='check-icon'>✅</div>
            <h1>Your Visit Has Been Approved!</h1>
            <p style='margin: 5px 0;'>Welcome to {{LocationName}}</p>
        </div>
        
        <div class='content'>
            <p>Dear {{VisitorName}},</p>
            
            <p>Great news! Your visit request has been approved and we look forward to welcoming you.</p>
            
            <div class='visit-details'>
                <h3 style='margin-top: 0; color: #28a745;'>📅 Your Visit Details</h3>
                
                <div class='detail-row'>
                    <span class='label'>⏰ Date & Time:</span> 
                    <span class='value'>{{VisitDateTime}}</span>
                </div>
                
                <div class='detail-row'>
                    <span class='label'>📍 Location:</span> 
                    <span class='value'>{{LocationName}}</span>
                </div>
                
                <div class='detail-row'>
                    <span class='label'>👤 Meeting with:</span> 
                    <span class='value'>{{WhomToMeet}}</span>
                </div>
                
                <div class='detail-row'>
                    <span class='label'>✅ Approved by:</span> 
                    <span class='value'>{{ApprovedBy}}</span>
                </div>
                
                <div class='detail-row'>
                    <span class='label'>📝 Approved on:</span> 
                    <span class='value'>{{ApprovedAt}}</span>
                </div>
                
                {{#if LocationAddress}}
                <div class='detail-row'>
                    <span class='label'>🗺️ Address:</span> 
                    <span class='value'>{{LocationAddress}}</span>
                </div>
                {{/if}}
            </div>
            
            <div class='instructions'>
                <h4 style='margin-top: 0; color: #856404;'>📋 Important Instructions:</h4>
                <ul style='color: #856404; margin: 0; padding-left: 20px;'>
                    <li>Please arrive <strong>5-10 minutes early</strong> for your scheduled visit</li>
                    <li>Bring a <strong>valid photo ID</strong> for verification at reception</li>
                    <li>Report to the <strong>main reception desk</strong> upon arrival</li>
                    <li>Follow all safety and security protocols as directed</li>
                    <li>Your host will be notified of your arrival</li>
                </ul>
            </div>
            
            <p><strong>Need to make changes?</strong> If you need to reschedule or cancel your visit, please contact us at least 2 hours in advance.</p>
            
            <p>We look forward to your visit!</p>
        </div>
        
        <div class='footer'>
            <p>📧 Thank you for using our Visitor Management System</p>
            <p>{{LocationName}} - Visitor Management</p>
            <p>Please do not reply to this email</p>
        </div>
    </div>
</body>
</html>";
        }

        private static string GetRejectionNoticeTemplate()
        {
            return @"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1'>
    <title>Visit Request Update</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background-color: #dc3545; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px 20px; }
        .reason-box { background-color: #f8d7da; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #dc3545; }
        .contact-info { background-color: #d1ecf1; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #17a2b8; }
        .footer { background-color: #6c757d; color: white; padding: 20px; text-align: center; font-size: 12px; }
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>⚠️ Visit Request Update</h1>
            <p style='margin: 5px 0;'>Action Required</p>
        </div>
        
        <div class='content'>
            <p>Dear {{VisitorName}},</p>
            
            <p>Thank you for your interest in visiting {{LocationName}}. We regret to inform you that your visit request scheduled for <strong>{{VisitDateTime}}</strong> requires attention.</p>
            
            <div class='reason-box'>
                <h4 style='margin-top: 0; color: #721c24;'>📋 Reason for Review:</h4>
                <p style='color: #721c24; margin-bottom: 0;'>{{RejectionReason}}</p>
            </div>
            
            <div class='contact-info'>
                <h4 style='margin-top: 0; color: #0c5460;'>📞 Next Steps:</h4>
                <p style='color: #0c5460; margin-bottom: 10px;'>If you would like to:</p>
                <ul style='color: #0c5460; margin: 0; padding-left: 20px;'>
                    <li><strong>Reschedule</strong> your visit</li>
                    <li><strong>Provide additional information</strong></li>
                    <li><strong>Discuss alternative arrangements</strong></li>
                </ul>
                <p style='color: #0c5460; margin-top: 10px; margin-bottom: 0;'>Please contact us at <strong>{{ContactInfo}}</strong></p>
            </div>
            
            <p>We apologize for any inconvenience this may cause and appreciate your understanding. We remain committed to accommodating your visit and look forward to welcoming you in the future.</p>
            
            <p><strong>Please note:</strong> This decision is not final, and we encourage you to reach out to discuss possible solutions.</p>
        </div>
        
        <div class='footer'>
            <p>📧 Thank you for your understanding</p>
            <p>{{LocationName}} - Visitor Management</p>
            <p>Please do not reply to this email</p>
        </div>
    </div>
</body>
</html>";
        }

        private static string GetCheckInNotificationTemplate()
        {
            return @"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1'>
    <title>Visitor Check-In Notification</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background-color: #17a2b8; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px 20px; }
        .checkin-details { background-color: #d1ecf1; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #17a2b8; }
        .footer { background-color: #6c757d; color: white; padding: 20px; text-align: center; font-size: 12px; }
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>🎯 Visitor Check-In Notification</h1>
            <p style='margin: 5px 0;'>Your visitor has arrived</p>
        </div>
        
        <div class='content'>
            <p>Dear {{StaffName}},</p>
            
            <p>Your visitor has successfully checked in and is ready to meet with you.</p>
            
            <div class='checkin-details'>
                <h3 style='margin-top: 0; color: #0c5460;'>📋 Check-In Information</h3>
                <p><strong>Visitor:</strong> {{VisitorName}}</p>
                <p><strong>Check-In Time:</strong> {{CheckInTime}}</p>
                <p><strong>Location:</strong> {{LocationName}}</p>
                <p><strong>Purpose:</strong> {{PurposeOfVisit}}</p>
            </div>
            
            <p>Please proceed to the reception area to meet your visitor.</p>
        </div>
        
        <div class='footer'>
            <p>{{LocationName}} - Visitor Management</p>
        </div>
    </div>
</body>
</html>";
        }

        private static string GetCheckOutNotificationTemplate()
        {
            return @"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1'>
    <title>Visitor Check-Out Notification</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background-color: #6c757d; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px 20px; }
        .checkout-details { background-color: #e2e3e5; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #6c757d; }
        .footer { background-color: #6c757d; color: white; padding: 20px; text-align: center; font-size: 12px; }
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>👋 Visitor Check-Out Notification</h1>
            <p style='margin: 5px 0;'>Visit completed</p>
        </div>
        
        <div class='content'>
            <p>Dear {{StaffName}},</p>
            
            <p>Your visitor has successfully checked out. Thank you for hosting them.</p>
            
            <div class='checkout-details'>
                <h3 style='margin-top: 0; color: #495057;'>📋 Check-Out Summary</h3>
                <p><strong>Visitor:</strong> {{VisitorName}}</p>
                <p><strong>Check-Out Time:</strong> {{CheckOutTime}}</p>
                <p><strong>Total Visit Duration:</strong> {{VisitDuration}}</p>
                <p><strong>Location:</strong> {{LocationName}}</p>
            </div>
            
            <p>We hope the meeting was productive!</p>
        </div>
        
        <div class='footer'>
            <p>{{LocationName}} - Visitor Management</p>
        </div>
    </div>
</body>
</html>";
        }
    }
}
