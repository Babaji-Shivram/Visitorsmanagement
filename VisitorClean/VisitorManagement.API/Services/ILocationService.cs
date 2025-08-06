using VisitorManagement.API.Models.DTOs;

namespace VisitorManagement.API.Services
{
    public interface ILocationService
    {
        Task<List<LocationDto>> GetAllLocationsAsync();
        Task<LocationDto?> GetLocationByIdAsync(int id);
        Task<LocationDto?> GetLocationByUrlAsync(string url);
        Task<LocationDto?> CreateLocationAsync(CreateLocationDto request);
        Task<bool> UpdateLocationAsync(int id, UpdateLocationDto request);
        Task<bool> DeleteLocationAsync(int id);
        Task<bool> ToggleLocationStatusAsync(int id);
    }
}
