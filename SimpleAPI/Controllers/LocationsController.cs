using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SimpleAPI.Data;
using SimpleAPI.Models.Entities;
using QRCoder;
using System.Drawing;
using System.Drawing.Imaging;

namespace SimpleAPI.Controllers
{
    public class CreateLocationRequest
    {
        public string name { get; set; } = "";
        public string address { get; set; } = "";
        public string? description { get; set; }
        public bool isActive { get; set; } = true;
    }

    [ApiController]
    [Route("[controller]")]
    public class LocationsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<LocationsController> _logger;

        public LocationsController(ApplicationDbContext context, ILogger<LocationsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllLocations([FromQuery] bool? activeOnly = null)
        {
            try
            {
                _logger.LogInformation("Fetching all locations from database");
                
                var query = _context.Locations.AsQueryable();
                
                if (activeOnly.HasValue && activeOnly.Value)
                {
                    query = query.Where(l => l.IsActive);
                }
                
                var locations = await query.ToListAsync();
                
                _logger.LogInformation($"Found {locations.Count} locations in database");
                
                // Convert to frontend format
                var locationList = locations.Select(location => new
                {
                    id = location.Id,
                    name = location.Name,
                    address = location.Address,
                    description = location.Description,
                    isActive = location.IsActive,
                    registrationUrl = location.RegistrationUrl,
                    qrCodeUrl = location.QrCodeUrl ?? GenerateQrCodeUrl(location.RegistrationUrl),
                    createdAt = location.CreatedAt.ToString("o"),
                    updatedAt = location.UpdatedAt.ToString("o")
                }).ToList();
                
                _logger.LogInformation($"Returning {locationList.Count} locations");
                return Ok(locationList);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching locations from database");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("active")]
        public async Task<IActionResult> GetActiveLocations()
        {
            try
            {
                _logger.LogInformation("Fetching active locations from database");
                
                var locations = await _context.Locations
                    .Where(l => l.IsActive)
                    .ToListAsync();
                
                var locationList = locations.Select(location => new
                {
                    id = location.Id,
                    name = location.Name,
                    address = location.Address,
                    description = location.Description,
                    isActive = location.IsActive,
                    registrationUrl = location.RegistrationUrl,
                    qrCodeUrl = location.QrCodeUrl ?? GenerateQrCodeUrl(location.RegistrationUrl),
                    createdAt = location.CreatedAt.ToString("o"),
                    updatedAt = location.UpdatedAt.ToString("o")
                }).ToList();
                
                return Ok(locationList);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching active locations from database");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetLocation(int id)
        {
            try
            {
                _logger.LogInformation($"Fetching location with ID {id} from database");
                
                var location = await _context.Locations.FirstOrDefaultAsync(l => l.Id == id);
                if (location == null)
                {
                    return NotFound(new { message = "Location not found" });
                }
                
                var locationData = new
                {
                    id = location.Id,
                    name = location.Name,
                    address = location.Address,
                    description = location.Description,
                    isActive = location.IsActive,
                    registrationUrl = location.RegistrationUrl,
                    qrCodeUrl = location.QrCodeUrl ?? GenerateQrCodeUrl(location.RegistrationUrl),
                    createdAt = location.CreatedAt.ToString("o"),
                    updatedAt = location.UpdatedAt.ToString("o")
                };
                
                return Ok(locationData);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error fetching location {id} from database");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("url/{url}")]
        public async Task<IActionResult> GetLocationByUrl(string url)
        {
            try
            {
                _logger.LogInformation($"Fetching location with URL {url} from database");
                
                var location = await _context.Locations.FirstOrDefaultAsync(l => l.RegistrationUrl == url);
                if (location == null)
                {
                    return NotFound(new { message = "Location not found" });
                }
                
                var locationData = new
                {
                    id = location.Id,
                    name = location.Name,
                    address = location.Address,
                    description = location.Description,
                    isActive = location.IsActive,
                    registrationUrl = location.RegistrationUrl,
                    qrCodeUrl = location.QrCodeUrl ?? GenerateQrCodeUrl(location.RegistrationUrl),
                    createdAt = location.CreatedAt.ToString("o"),
                    updatedAt = location.UpdatedAt.ToString("o")
                };
                
                return Ok(locationData);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error fetching location by URL {url} from database");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateLocation([FromBody] CreateLocationRequest request)
        {
            try
            {
                _logger.LogInformation("Creating new location via database");
                
                // Extract data from request object
                string name = request.name ?? "New Location";
                string address = request.address ?? "New Address";
                string? description = request.description;
                bool isActive = request.isActive;
                
                // Generate registration URL from name
                string registrationUrl = GenerateUrlFromName(name);
                
                // Ensure unique registration URL
                int suffix = 1;
                string originalUrl = registrationUrl;
                while (await _context.Locations.AnyAsync(l => l.RegistrationUrl == registrationUrl))
                {
                    registrationUrl = $"{originalUrl}-{suffix}";
                    suffix++;
                }
                
                // Generate QR code
                string qrCodeUrl = GenerateQrCodeUrl(registrationUrl);
                
                var newLocation = new Location
                {
                    Name = name,
                    Address = address,
                    Description = description,
                    IsActive = isActive,
                    RegistrationUrl = registrationUrl,
                    QrCodeUrl = qrCodeUrl,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                
                _context.Locations.Add(newLocation);
                await _context.SaveChangesAsync();
                
                _logger.LogInformation($"Successfully created location: {name} with ID: {newLocation.Id}");
                
                var responseLocation = new
                {
                    id = newLocation.Id,
                    name = newLocation.Name,
                    address = newLocation.Address,
                    description = newLocation.Description,
                    isActive = newLocation.IsActive,
                    registrationUrl = newLocation.RegistrationUrl,
                    qrCodeUrl = newLocation.QrCodeUrl,
                    createdAt = newLocation.CreatedAt.ToString("o"),
                    updatedAt = newLocation.UpdatedAt.ToString("o")
                };
                
                return CreatedAtAction(nameof(GetLocation), new { id = newLocation.Id }, responseLocation);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating location in database");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateLocation(int id, [FromBody] CreateLocationRequest request)
        {
            try
            {
                _logger.LogInformation($"Updating location {id} via database");
                
                var location = await _context.Locations.FirstOrDefaultAsync(l => l.Id == id);
                if (location == null)
                {
                    return NotFound(new { message = "Location not found" });
                }
                
                // Update properties if provided
                if (!string.IsNullOrEmpty(request.name))
                {
                    location.Name = request.name;
                }
                
                if (!string.IsNullOrEmpty(request.address))
                {
                    location.Address = request.address;
                }
                
                if (request.description != null)
                {
                    location.Description = request.description;
                }
                
                location.IsActive = request.isActive;
                
                // If name changed, update registration URL
                if (!string.IsNullOrEmpty(request.name))
                {
                    string newUrl = GenerateUrlFromName(location.Name);
                    
                    // Ensure unique registration URL (excluding current location)
                    int suffix = 1;
                    string originalUrl = newUrl;
                    while (await _context.Locations.AnyAsync(l => l.RegistrationUrl == newUrl && l.Id != id))
                    {
                        newUrl = $"{originalUrl}-{suffix}";
                        suffix++;
                    }
                    
                    location.RegistrationUrl = newUrl;
                    location.QrCodeUrl = GenerateQrCodeUrl(newUrl);
                }
                
                location.UpdatedAt = DateTime.UtcNow;
                
                await _context.SaveChangesAsync();
                
                _logger.LogInformation($"Successfully updated location: {id}");
                
                var responseLocation = new
                {
                    id = location.Id,
                    name = location.Name,
                    address = location.Address,
                    description = location.Description,
                    isActive = location.IsActive,
                    registrationUrl = location.RegistrationUrl,
                    qrCodeUrl = location.QrCodeUrl,
                    createdAt = location.CreatedAt.ToString("o"),
                    updatedAt = location.UpdatedAt.ToString("o")
                };
                
                return Ok(responseLocation);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating location {id} in database");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteLocation(int id)
        {
            try
            {
                _logger.LogInformation($"Deleting location {id} from database");
                
                var location = await _context.Locations.FirstOrDefaultAsync(l => l.Id == id);
                if (location == null)
                {
                    return NotFound(new { message = "Location not found" });
                }
                
                // Check if location has active visitors (you might want to add this check)
                // var hasActiveVisitors = await _context.Visitors.AnyAsync(v => v.LocationId == id && v.Status == "checked_in");
                // if (hasActiveVisitors)
                // {
                //     return Conflict(new { message = "Cannot delete location with active visitors. Please deactivate instead." });
                // }
                
                _context.Locations.Remove(location);
                await _context.SaveChangesAsync();
                
                _logger.LogInformation($"Successfully deleted location: {id}");
                return Ok(new { message = "Location deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting location {id} from database");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("qr/{registrationUrl}")]
        public IActionResult GetQrCode(string registrationUrl)
        {
            try
            {
                // Create the full URL for the QR code
                string fullUrl = $"{Request.Scheme}://{Request.Host}/visit/{registrationUrl}";
                
                // Generate QR code using QRCoder
                QRCodeGenerator qrGenerator = new QRCodeGenerator();
                QRCodeData qrCodeData = qrGenerator.CreateQrCode(fullUrl, QRCodeGenerator.ECCLevel.Q);
                BitmapByteQRCode qrCode = new BitmapByteQRCode(qrCodeData);
                
                // Get the QR code as byte array
                byte[] qrCodeImage = qrCode.GetGraphic(20);
                
                // Return the image
                return File(qrCodeImage, "image/png");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error generating QR code for URL: {registrationUrl}");
                
                // Return a placeholder SVG QR code
                string svgContent = GeneratePlaceholderQrCodeSvg(registrationUrl);
                return Content(svgContent, "image/svg+xml");
            }
        }

        // Helper methods
        private string GenerateUrlFromName(string name)
        {
            return name.ToLower()
                      .Replace(" ", "-")
                      .Replace("&", "and")
                      .Replace(",", "")
                      .Replace(".", "")
                      .Replace("'", "")
                      .Replace("\"", "")
                      .Replace("(", "")
                      .Replace(")", "")
                      .Replace("/", "-")
                      .Replace("\\", "-");
        }

        private string GenerateQrCodeUrl(string registrationUrl)
        {
            try
            {
                // Instead of generating a base64 image, return an endpoint URL that will generate the QR code
                return $"{Request.Scheme}://{Request.Host}/api/locations/qr/{registrationUrl}";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error generating QR code URL for: {registrationUrl}");
                // Return a simple placeholder URL
                return $"{Request.Scheme}://{Request.Host}/api/locations/qr/{registrationUrl}";
            }
        }
        
        private string GeneratePlaceholderQrCodeSvg(string registrationUrl)
        {
            return $@"<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'>
                <rect width='200' height='200' fill='#f8f9fa' stroke='#dee2e6' stroke-width='2'/>
                <text x='100' y='90' text-anchor='middle' font-family='monospace' font-size='16' fill='#6c757d'>QR CODE</text>
                <text x='100' y='110' text-anchor='middle' font-family='monospace' font-size='12' fill='#6c757d'>{registrationUrl}</text>
                <text x='100' y='130' text-anchor='middle' font-family='monospace' font-size='10' fill='#6c757d'>Scan to visit</text>
            </svg>";
        }
        
        private string GeneratePlaceholderQrCode(string registrationUrl)
        {
            // Create a simple SVG placeholder
            string svgContent = $@"
                <svg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'>
                    <rect width='200' height='200' fill='#f8f9fa' stroke='#dee2e6' stroke-width='2'/>
                    <text x='100' y='90' text-anchor='middle' font-family='monospace' font-size='16' fill='#6c757d'>QR CODE</text>
                    <text x='100' y='110' text-anchor='middle' font-family='monospace' font-size='12' fill='#6c757d'>{registrationUrl}</text>
                    <text x='100' y='130' text-anchor='middle' font-family='monospace' font-size='10' fill='#6c757d'>Scan to visit</text>
                </svg>";
            
            return $"data:image/svg+xml;base64,{Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(svgContent))}";
        }
    }
}
