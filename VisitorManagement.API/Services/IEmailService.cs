using VisitorManagement.API.Models.Email;

namespace VisitorManagement.API.Services
{
    public interface IEmailService
    {
        Task<bool> SendEmailAsync(EmailNotificationRequest request);
        Task<bool> SendVisitorNotificationToStaffAsync(int visitorId, string staffEmail);
        Task<bool> SendVisitorApprovalConfirmationAsync(int visitorId);
        Task<bool> SendVisitorRejectionNoticeAsync(int visitorId, string reason);
        Task<bool> SendVisitorCheckInNotificationAsync(int visitorId);
        Task<bool> SendVisitorCheckOutNotificationAsync(int visitorId);
        Task<bool> SendBulkEmailAsync(List<EmailNotificationRequest> requests);
        Task<string> ProcessEmailTemplateAsync(string template, Dictionary<string, string> data);
        Task<bool> TestConnectionAsync();
    }
}
