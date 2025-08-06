using System.ComponentModel.DataAnnotations;

namespace VisitorManagement.API.Models.Email
{
    public class EmailTemplate
    {
        public int Id { get; set; }
        
        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(500)]
        public string Subject { get; set; } = string.Empty;
        
        [Required]
        public string Body { get; set; } = string.Empty;
        
        [Required]
        public EmailTemplateType Type { get; set; }
        
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    public enum EmailTemplateType
    {
        VisitorNotificationToStaff = 1,
        VisitorApprovalConfirmation = 2,
        VisitorRejectionNotice = 3,
        VisitorCheckInNotification = 4,
        VisitorCheckOutNotification = 5,
        VisitorRescheduledNotification = 6
    }

    public class EmailNotificationRequest
    {
        public string ToEmail { get; set; } = string.Empty;
        public string ToName { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string Body { get; set; } = string.Empty;
        public EmailTemplateType TemplateType { get; set; }
        public Dictionary<string, string> TemplateData { get; set; } = new();
        public List<string>? CcEmails { get; set; }
        public List<string>? BccEmails { get; set; }
        public List<EmailAttachment>? Attachments { get; set; }
        public bool IsHighPriority { get; set; } = false;
    }

    public class EmailAttachment
    {
        public string FileName { get; set; } = string.Empty;
        public byte[] Content { get; set; } = Array.Empty<byte>();
        public string ContentType { get; set; } = "application/octet-stream";
    }

    public class VisitorNotificationData
    {
        public string VisitorName { get; set; } = string.Empty;
        public string VisitorEmail { get; set; } = string.Empty;
        public string VisitorPhone { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;
        public string PurposeOfVisit { get; set; } = string.Empty;
        public string VisitDateTime { get; set; } = string.Empty;
        public string StaffName { get; set; } = string.Empty;
        public string LocationName { get; set; } = string.Empty;
        public string ApprovalUrl { get; set; } = string.Empty;
        public string Notes { get; set; } = string.Empty;
    }
}
