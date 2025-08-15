using System.ComponentModel.DataAnnotations;

namespace SimpleAPI.Models.Entities
{
    public class Location
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [MaxLength(500)]
        public string Address { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string? Description { get; set; }

        public bool IsActive { get; set; } = true;

        [Required]
        [MaxLength(100)]
        public string RegistrationUrl { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? QrCodeUrl { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual ICollection<Visitor> Visitors { get; set; } = new List<Visitor>();
        public virtual ICollection<StaffMember> StaffMembers { get; set; } = new List<StaffMember>();
    }
}
