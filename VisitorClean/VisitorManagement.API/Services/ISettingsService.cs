using VisitorManagement.API.Models.DTOs;

namespace VisitorManagement.API.Services
{
    public interface ISettingsService
    {
        Task<LocationSettingsDto?> GetLocationSettingsAsync(int? locationId);
        Task<LocationSettingsDto> CreateLocationSettingsAsync(CreateLocationSettingsDto request);
        Task<LocationSettingsDto?> UpdateLocationSettingsAsync(int? locationId, UpdateLocationSettingsDto request);
        Task<bool> DeleteLocationSettingsAsync(int? locationId);
        Task<List<LocationSettingsDto>> GetAllLocationSettingsAsync();
    }
}
