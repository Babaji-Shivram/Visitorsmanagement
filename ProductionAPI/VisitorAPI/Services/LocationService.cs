using AutoMapper;
using Microsoft.EntityFrameworkCore;
using VisitorManagement.API.Data;
using VisitorManagement.API.Models.DTOs;
using VisitorManagement.API.Models.Entities;

namespace VisitorManagement.API.Services
{
    public class LocationService : ILocationService
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;

        public LocationService(ApplicationDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<List<LocationDto>> GetAllLocationsAsync()
        {
            var locations = await _context.Locations
                .Include(l => l.Visitors)
                .Include(l => l.StaffMembers)
                .ToListAsync();

            return _mapper.Map<List<LocationDto>>(locations);
        }

        public async Task<LocationDto?> GetLocationByIdAsync(int id)
        {
            var location = await _context.Locations
                .Include(l => l.Visitors)
                .Include(l => l.StaffMembers)
                .FirstOrDefaultAsync(l => l.Id == id);

            return location != null ? _mapper.Map<LocationDto>(location) : null;
        }

        public async Task<LocationDto?> GetLocationByUrlAsync(string url)
        {
            var location = await _context.Locations
                .Include(l => l.Visitors)
                .Include(l => l.StaffMembers)
                .FirstOrDefaultAsync(l => l.RegistrationUrl == url);

            return location != null ? _mapper.Map<LocationDto>(location) : null;
        }

        public async Task<LocationDto?> CreateLocationAsync(CreateLocationDto request)
        {
            var location = _mapper.Map<Location>(request);
            
            // Generate registration URL from name
            location.RegistrationUrl = GenerateRegistrationUrl(request.Name);
            
            // Generate QR code URL
            location.QrCodeUrl = $"https://api.qrserver.com/v1/create-qr-code/?size=200x200&data={Uri.EscapeDataString($"http://localhost:5173/register/{location.RegistrationUrl}")}";

            _context.Locations.Add(location);
            await _context.SaveChangesAsync();

            return _mapper.Map<LocationDto>(location);
        }

        public async Task<bool> UpdateLocationAsync(int id, UpdateLocationDto request)
        {
            var location = await _context.Locations.FindAsync(id);
            if (location == null)
                return false;

            _mapper.Map(request, location);
            location.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteLocationAsync(int id)
        {
            var location = await _context.Locations.FindAsync(id);
            if (location == null)
                return false;

            _context.Locations.Remove(location);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ToggleLocationStatusAsync(int id)
        {
            var location = await _context.Locations.FindAsync(id);
            if (location == null)
                return false;

            location.IsActive = !location.IsActive;
            location.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        private string GenerateRegistrationUrl(string name)
        {
            return name.ToLowerInvariant()
                      .Replace(" ", "-")
                      .Replace("&", "and")
                      .Replace("'", "")
                      .Replace(".", "")
                      .Replace(",", "")
                      .Replace("(", "")
                      .Replace(")", "");
        }
    }
}
