using System.ComponentModel.DataAnnotations;

namespace SimpleAPI.Models.Entities
{
    public class CustomField
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        public CustomFieldType Type { get; set; }

        [Required]
        [MaxLength(200)]
        public string Label { get; set; } = string.Empty;

        [MaxLength(200)]
        public string? Placeholder { get; set; }

        public bool Required { get; set; }

        public string? Options { get; set; } // JSON string for select options

        public int Order { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual ICollection<VisitorCustomFieldValue> Values { get; set; } = new List<VisitorCustomFieldValue>();
    }

    public enum CustomFieldType
    {
        Text = 1,
        Select = 2,
        Textarea = 3,
        Checkbox = 4,
        Date = 5
    }
}
