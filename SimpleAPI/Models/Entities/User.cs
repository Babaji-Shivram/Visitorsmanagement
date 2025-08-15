using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SimpleAPI.Models.Entities
{
    public class User : IdentityUser
    {
        [Required]
        [MaxLength(100)]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string LastName { get; set; } = string.Empty;

        [MaxLength(20)]
        public string? Extension { get; set; }

        [Required]
        public UserRole Role { get; set; }

        [MaxLength(100)]
        public string? Department { get; set; }

        public int LocationId { get; set; } = 1; // Default to Main Office
        public int? RoleConfigurationId { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties  
        public virtual ICollection<Visitor> ApprovedVisitors { get; set; } = new List<Visitor>();
        public virtual ICollection<StaffMember> StaffMembers { get; set; } = new List<StaffMember>();
    }

    public enum UserRole
    {
        Reception = 1,
        Admin = 2,
        Staff = 3
    }
}
