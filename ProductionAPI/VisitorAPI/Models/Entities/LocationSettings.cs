using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VisitorManagement.API.Models.Entities
{
    public class LocationSettings
    {
        public int Id { get; set; }

        public int? LocationId { get; set; } // null for global settings

        [Required]
        public string PurposeOfVisitOptions { get; set; } = string.Empty; // JSON array

        [Required]
        public string IdTypeOptions { get; set; } = string.Empty; // JSON array

        public bool IsPhotoMandatory { get; set; } = false;

        public string CustomFields { get; set; } = string.Empty; // JSON array

        public string EnabledFields { get; set; } = string.Empty; // JSON object

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("LocationId")]
        public virtual Location? Location { get; set; }
    }
}
