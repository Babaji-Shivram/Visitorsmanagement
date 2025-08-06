using System.ComponentModel.DataAnnotations;

namespace VisitorManagement.API.Models.Email
{
    /// <summary>
    /// Request model for sending a test email
    /// </summary>
    public class TestEmailRequest
    {
        /// <summary>
        /// The recipient's email address
        /// </summary>
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        /// <summary>
        /// Optional custom message to include in the test email
        /// </summary>
        public string? Message { get; set; }
    }
}
