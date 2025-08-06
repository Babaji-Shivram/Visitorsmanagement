using System.ComponentModel.DataAnnotations;
using VisitorManagement.API.Models.Entities;

namespace VisitorManagement.API.Models.DTOs
{
    public class LocationSettingsDto
    {
        public int Id { get; set; }
        public int? LocationId { get; set; }
        public string? LocationName { get; set; }
        public List<string> PurposeOfVisitOptions { get; set; } = new();
        public List<string> IdTypeOptions { get; set; } = new();
        public bool IsPhotoMandatory { get; set; }
        public List<CustomFieldDto> CustomFields { get; set; } = new();
        public EnabledFieldsDto EnabledFields { get; set; } = new();
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateLocationSettingsDto
    {
        public int? LocationId { get; set; }
        public List<string> PurposeOfVisitOptions { get; set; } = new();
        public List<string> IdTypeOptions { get; set; } = new();
        public bool IsPhotoMandatory { get; set; }
        public List<CustomFieldDto> CustomFields { get; set; } = new();
        public EnabledFieldsDto EnabledFields { get; set; } = new();
    }

    public class UpdateLocationSettingsDto
    {
        public List<string>? PurposeOfVisitOptions { get; set; }
        public List<string>? IdTypeOptions { get; set; }
        public bool? IsPhotoMandatory { get; set; }
        public List<CustomFieldDto>? CustomFields { get; set; }
        public EnabledFieldsDto? EnabledFields { get; set; }
    }

    public class CustomFieldDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public CustomFieldType Type { get; set; }
        public string Label { get; set; } = string.Empty;
        public string? Placeholder { get; set; }
        public bool Required { get; set; }
        public List<string>? Options { get; set; }
        public int Order { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateCustomFieldDto
    {
        public string Name { get; set; } = string.Empty;
        public CustomFieldType Type { get; set; }
        public string Label { get; set; } = string.Empty;
        public string? Placeholder { get; set; }
        public bool Required { get; set; }
        public List<string>? Options { get; set; }
        public int Order { get; set; }
    }

    public class UpdateCustomFieldDto
    {
        public string Name { get; set; } = string.Empty;
        public CustomFieldType Type { get; set; }
        public string Label { get; set; } = string.Empty;
        public string? Placeholder { get; set; }
        public bool Required { get; set; }
        public List<string>? Options { get; set; }
        public int Order { get; set; }
        public bool IsActive { get; set; }
    }

    public class EnabledFieldsDto
    {
        public bool Email { get; set; } = true;
        public bool CompanyName { get; set; } = true;
        public bool IdProof { get; set; } = true;
        public bool Photo { get; set; } = true;
    }
}
