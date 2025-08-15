using SimpleAPI.Models.Entities;

namespace SimpleAPI.Models.DTOs
{
    public class VisitorResponse
    {
        public int Id { get; set; }
        public int LocationId { get; set; }
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
        
        // Location info without circular reference
        public LocationInfo? Location { get; set; }
    }

    public class LocationInfo
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string? Description { get; set; }
    }

    public static class VisitorExtensions
    {
        public static VisitorResponse ToResponse(this Visitor visitor)
        {
            return new VisitorResponse
            {
                Id = visitor.Id,
                LocationId = visitor.LocationId,
                FullName = visitor.FullName,
                PhoneNumber = visitor.PhoneNumber,
                Email = visitor.Email,
                CompanyName = visitor.CompanyName,
                PurposeOfVisit = visitor.PurposeOfVisit,
                WhomToMeet = visitor.WhomToMeet,
                DateTime = visitor.DateTime,
                IdProofType = visitor.IdProofType,
                IdProofNumber = visitor.IdProofNumber,
                PhotoUrl = visitor.PhotoUrl,
                Status = visitor.Status,
                CreatedAt = visitor.CreatedAt,
                UpdatedAt = visitor.UpdatedAt,
                ApprovedBy = visitor.ApprovedBy,
                ApprovedAt = visitor.ApprovedAt,
                CheckInTime = visitor.CheckInTime,
                CheckOutTime = visitor.CheckOutTime,
                Notes = visitor.Notes,
                Location = visitor.Location != null ? new LocationInfo
                {
                    Id = visitor.Location.Id,
                    Name = visitor.Location.Name,
                    Address = visitor.Location.Address,
                    Description = visitor.Location.Description
                } : null
            };
        }
    }
}
