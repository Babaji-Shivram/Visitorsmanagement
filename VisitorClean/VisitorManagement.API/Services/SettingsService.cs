using AutoMapper;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using VisitorManagement.API.Data;
using VisitorManagement.API.Models.DTOs;
using VisitorManagement.API.Models.Entities;

namespace VisitorManagement.API.Services
{
    public class SettingsService : ISettingsService
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;

        public SettingsService(ApplicationDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<LocationSettingsDto?> GetLocationSettingsAsync(int? locationId)
        {
            var settings = await _context.LocationSettings
                .Include(s => s.Location)
                .FirstOrDefaultAsync(s => s.LocationId == locationId);

            if (settings == null)
            {
                // Return default settings if none exist
                return new LocationSettingsDto
                {
                    LocationId = locationId,
                    LocationName = locationId.HasValue ? 
                        (await _context.Locations.FindAsync(locationId))?.Name : null,
                    PurposeOfVisitOptions = GetDefaultPurposeOptions(),
                    IdTypeOptions = GetDefaultIdTypeOptions(),
                    IsPhotoMandatory = false,
                    CustomFields = new List<CustomFieldDto>(),
                    EnabledFields = new EnabledFieldsDto()
                };
            }

            return MapToDto(settings);
        }

        public async Task<LocationSettingsDto> CreateLocationSettingsAsync(CreateLocationSettingsDto request)
        {
            var settings = new LocationSettings
            {
                LocationId = request.LocationId,
                PurposeOfVisitOptions = JsonSerializer.Serialize(request.PurposeOfVisitOptions),
                IdTypeOptions = JsonSerializer.Serialize(request.IdTypeOptions),
                IsPhotoMandatory = request.IsPhotoMandatory,
                CustomFields = JsonSerializer.Serialize(request.CustomFields),
                EnabledFields = JsonSerializer.Serialize(request.EnabledFields)
            };

            _context.LocationSettings.Add(settings);
            await _context.SaveChangesAsync();

            // Reload with Location data
            await _context.Entry(settings).Reference(s => s.Location).LoadAsync();

            return MapToDto(settings);
        }

        public async Task<LocationSettingsDto?> UpdateLocationSettingsAsync(int? locationId, UpdateLocationSettingsDto request)
        {
            var settings = await _context.LocationSettings
                .Include(s => s.Location)
                .FirstOrDefaultAsync(s => s.LocationId == locationId);

            if (settings == null)
            {
                // Create new settings if they don't exist
                settings = new LocationSettings
                {
                    LocationId = locationId,
                    PurposeOfVisitOptions = JsonSerializer.Serialize(request.PurposeOfVisitOptions ?? GetDefaultPurposeOptions()),
                    IdTypeOptions = JsonSerializer.Serialize(request.IdTypeOptions ?? GetDefaultIdTypeOptions()),
                    IsPhotoMandatory = request.IsPhotoMandatory ?? false,
                    CustomFields = JsonSerializer.Serialize(request.CustomFields ?? new List<CustomFieldDto>()),
                    EnabledFields = JsonSerializer.Serialize(request.EnabledFields ?? new EnabledFieldsDto())
                };

                _context.LocationSettings.Add(settings);
            }
            else
            {
                // Update existing settings
                if (request.PurposeOfVisitOptions != null)
                    settings.PurposeOfVisitOptions = JsonSerializer.Serialize(request.PurposeOfVisitOptions);
                
                if (request.IdTypeOptions != null)
                    settings.IdTypeOptions = JsonSerializer.Serialize(request.IdTypeOptions);
                
                if (request.IsPhotoMandatory.HasValue)
                    settings.IsPhotoMandatory = request.IsPhotoMandatory.Value;
                
                if (request.CustomFields != null)
                    settings.CustomFields = JsonSerializer.Serialize(request.CustomFields);
                
                if (request.EnabledFields != null)
                    settings.EnabledFields = JsonSerializer.Serialize(request.EnabledFields);

                settings.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            // Reload with Location data if it was just created
            if (settings.Location == null && locationId.HasValue)
            {
                await _context.Entry(settings).Reference(s => s.Location).LoadAsync();
            }

            return MapToDto(settings);
        }

        public async Task<bool> DeleteLocationSettingsAsync(int? locationId)
        {
            var settings = await _context.LocationSettings
                .FirstOrDefaultAsync(s => s.LocationId == locationId);

            if (settings == null)
                return false;

            _context.LocationSettings.Remove(settings);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<List<LocationSettingsDto>> GetAllLocationSettingsAsync()
        {
            var settings = await _context.LocationSettings
                .Include(s => s.Location)
                .ToListAsync();

            return settings.Select(MapToDto).ToList();
        }

        private LocationSettingsDto MapToDto(LocationSettings settings)
        {
            return new LocationSettingsDto
            {
                Id = settings.Id,
                LocationId = settings.LocationId,
                LocationName = settings.Location?.Name,
                PurposeOfVisitOptions = JsonSerializer.Deserialize<List<string>>(settings.PurposeOfVisitOptions) ?? new(),
                IdTypeOptions = JsonSerializer.Deserialize<List<string>>(settings.IdTypeOptions) ?? new(),
                IsPhotoMandatory = settings.IsPhotoMandatory,
                CustomFields = JsonSerializer.Deserialize<List<CustomFieldDto>>(settings.CustomFields) ?? new(),
                EnabledFields = JsonSerializer.Deserialize<EnabledFieldsDto>(settings.EnabledFields) ?? new(),
                CreatedAt = settings.CreatedAt,
                UpdatedAt = settings.UpdatedAt
            };
        }

        private static List<string> GetDefaultPurposeOptions()
        {
            return new List<string>
            {
                "Business Meeting",
                "Interview",
                "Consultation",
                "Delivery",
                "Maintenance",
                "Training",
                "Other"
            };
        }

        private static List<string> GetDefaultIdTypeOptions()
        {
            return new List<string>
            {
                "Driver's License",
                "Passport",
                "National ID",
                "Employee ID",
                "Student ID"
            };
        }
    }
}
