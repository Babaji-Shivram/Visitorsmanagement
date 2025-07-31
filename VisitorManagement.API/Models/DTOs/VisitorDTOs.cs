using System.ComponentModel.DataAnnotations;
using VisitorManagement.API.Models.Entities;

namespace VisitorManagement.API.Models.DTOs
{
    public class CreateVisitorDto
    {
        [Required]
        public int LocationId { get; set; }

        [Required]
        [MaxLength(200)]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [Phone]
        public string PhoneNumber { get; set; } = string.Empty;

        [EmailAddress]
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

        public string? PhotoUrl { get; set; }

        public Dictionary<string, string>? CustomFields { get; set; }
    }

    public class UpdateVisitorStatusDto
    {
        [Required]
        public VisitorStatus Status { get; set; }

        [MaxLength(1000)]
        public string? Notes { get; set; }
    }

    public class VisitorDto
    {
        public int Id { get; set; }
        public int LocationId { get; set; }
        public string LocationName { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? CompanyName { get; set; }
        public string PurposeOfVisit { get; set; } = string.Empty;
        public string WhomToMeet { get; set; } = string.Empty;
        public DateTime DateTime { get; set; }
        public string? IdProofType { get; set; }
        public string? IdProofNumber { get; set; }
        public string? PhotoUrl { get; set; }
        public VisitorStatus Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public string? ApprovedBy { get; set; }
        public DateTime? ApprovedAt { get; set; }
        public DateTime? CheckInTime { get; set; }
        public DateTime? CheckOutTime { get; set; }
        public string? Notes { get; set; }
        public Dictionary<string, string>? CustomFields { get; set; }
    }

    public class VisitorStatsDto
    {
        public int Total { get; set; }
        public int AwaitingApproval { get; set; }
        public int Approved { get; set; }
        public int CheckedIn { get; set; }
        public int CheckedOut { get; set; }
        public int Rejected { get; set; }
        public decimal ApprovalRate { get; set; }
    }
}