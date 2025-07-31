using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VisitorManagement.API.Models.Entities
{
    public class Visitor
    {
        public int Id { get; set; }

        [Required]
        public int LocationId { get; set; }

        [Required]
        [MaxLength(200)]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string PhoneNumber { get; set; } = string.Empty;

        [MaxLength(200)]
        public string? Email { get; set; }

        [MaxLength(200)]
        public string? CompanyName { get; set; }

        [Required]
        [MaxLength(200)]
        public string PurposeOfVisit { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        public string WhomToMeet { get; set; } = string.Empty;

        [Required]
        public DateTime DateTime { get; set; }

        [MaxLength(50)]
        public string? IdProofType { get; set; }

        [MaxLength(100)]
        public string? IdProofNumber { get; set; }

        [MaxLength(500)]
        public string? PhotoUrl { get; set; }

        [Required]
        public VisitorStatus Status { get; set; } = VisitorStatus.AwaitingApproval;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public string? ApprovedBy { get; set; }
        public DateTime? ApprovedAt { get; set; }
        public DateTime? CheckInTime { get; set; }
        public DateTime? CheckOutTime { get; set; }

        [MaxLength(1000)]
        public string? Notes { get; set; }

        // Navigation properties
        [ForeignKey("LocationId")]
        public virtual Location Location { get; set; } = null!;

        public virtual ICollection<VisitorCustomFieldValue> CustomFieldValues { get; set; } = new List<VisitorCustomFieldValue>();
    }

    public enum VisitorStatus
    {
        AwaitingApproval = 1,
        Approved = 2,
        Rejected = 3,
        CheckedIn = 4,
        CheckedOut = 5,
        Rescheduled = 6
    }
}