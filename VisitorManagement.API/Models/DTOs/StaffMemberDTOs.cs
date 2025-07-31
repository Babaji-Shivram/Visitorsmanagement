using System.ComponentModel.DataAnnotations;

namespace VisitorManagement.API.Models.DTOs
{
    public class CreateStaffMemberDto
    {
        [Required]
        [MaxLength(100)]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string LastName { get; set; } = string.Empty;

        [Required]
        public int LocationId { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [Phone]
        public string MobileNumber { get; set; } = string.Empty;

        [Required]
        [Phone]
        public string PhoneNumber { get; set; } = string.Empty;

        [Required]
        [MaxLength(10)]
        public string Extension { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? Designation { get; set; }

        public string? PhotoUrl { get; set; }

        public bool IsActive { get; set; } = true;
    }

    public class UpdateStaffMemberDto
    {
        [Required]
        [MaxLength(100)]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string LastName { get; set; } = string.Empty;

        [Required]
        public int LocationId { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [Phone]
        public string MobileNumber { get; set; } = string.Empty;

        [Required]
        [Phone]
        public string PhoneNumber { get; set; } = string.Empty;

        [Required]
        [MaxLength(10)]
        public string Extension { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? Designation { get; set; }

        public string? PhotoUrl { get; set; }

        public bool IsActive { get; set; }
    }

    public class StaffMemberDto
    {
        public int Id { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public int LocationId { get; set; }
        public string LocationName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string MobileNumber { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Extension { get; set; } = string.Empty;
        public string? Designation { get; set; }
        public string? PhotoUrl { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public int VisitorCount { get; set; }
    }

    public class BulkStaffUploadDto
    {
        public List<CreateStaffMemberDto> StaffMembers { get; set; } = new();
    }

    public class BulkUploadResultDto
    {
        public int Total { get; set; }
        public int Success { get; set; }
        public List<string> Errors { get; set; } = new();
    }
}