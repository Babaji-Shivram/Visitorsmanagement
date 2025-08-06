using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VisitorManagement.API.Models.Entities
{
    public class StaffMember
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string LastName { get; set; } = string.Empty;

        [Required]
        public int LocationId { get; set; }

        [Required]
        [MaxLength(200)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string MobileNumber { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string PhoneNumber { get; set; } = string.Empty;

        [Required]
        [MaxLength(10)]
        public string Extension { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? Designation { get; set; }

        [MaxLength(200)]
        public string? Password { get; set; }

        [MaxLength(50)]
        public string Role { get; set; } = "staff";

        public bool CanLogin { get; set; } = false;

        [MaxLength(500)]
        public string? PhotoUrl { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("LocationId")]
        public virtual Location Location { get; set; } = null!;

        public virtual ICollection<Visitor> Visitors { get; set; } = new List<Visitor>();

        [NotMapped]
        public string FullName => $"{FirstName} {LastName}";
    }
}