using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SimpleAPI.Models.Entities
{
    public class VisitorCustomFieldValue
    {
        public int Id { get; set; }

        [Required]
        public int VisitorId { get; set; }

        [Required]
        public int CustomFieldId { get; set; }

        [MaxLength(1000)]
        public string? Value { get; set; }

        // Navigation properties
        [ForeignKey("VisitorId")]
        public virtual Visitor Visitor { get; set; } = null!;

        [ForeignKey("CustomFieldId")]
        public virtual CustomField CustomField { get; set; } = null!;
    }
}
