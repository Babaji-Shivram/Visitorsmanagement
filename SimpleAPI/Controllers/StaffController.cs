using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SimpleAPI.Data;
using SimpleAPI.Models.Entities;
using System.Text.Json;
using System.Reflection;

namespace SimpleAPI.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class StaffController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly ILogger<StaffController> _logger;

        public StaffController(ApplicationDbContext context, UserManager<User> userManager, RoleManager<IdentityRole> roleManager, ILogger<StaffController> logger)
        {
            _context = context;
            _userManager = userManager;
            _roleManager = roleManager;
            _logger = logger;
        }

        // Helper method to safely get property values from JsonElement or dynamic objects
        private string GetPropertyValueSafely(object data, string propertyName, string defaultValue = "")
        {
            try
            {
                if (data is JsonElement jsonElement)
                {
                    if (jsonElement.ValueKind == JsonValueKind.Object && 
                        jsonElement.TryGetProperty(propertyName, out JsonElement property))
                    {
                        return property.ValueKind == JsonValueKind.String ? property.GetString() ?? defaultValue : 
                               property.ValueKind == JsonValueKind.Number ? property.ToString() :
                               property.ValueKind == JsonValueKind.Null ? defaultValue : 
                               property.ToString() ?? defaultValue;
                    }
                }
                else
                {
                    // Fallback for dynamic objects using reflection
                    var type = data.GetType();
                    var property = type.GetProperty(propertyName, BindingFlags.IgnoreCase | BindingFlags.Public | BindingFlags.Instance);
                    if (property != null)
                    {
                        var value = property.GetValue(data);
                        return value?.ToString() ?? defaultValue;
                    }
                }
                
                return defaultValue;
            }
            catch (Exception ex)
            {
                _logger.LogWarning($"Error getting property {propertyName}: {ex.Message}");
                return defaultValue;
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetAllStaff()
        {
            try
            {
                _logger.LogInformation("Fetching staff from AspNetUsers (Identity) table only");

                var locations = await _context.Locations.ToListAsync();
                var locationDict = locations.ToDictionary(l => l.Id, l => l.Name);

                var users = await _userManager.Users.AsNoTracking().ToListAsync();

                var staffList = users.Select(user => new
                {
                    id = user.Id,
                    firstName = user.FirstName,
                    lastName = user.LastName,
                    email = user.Email,
                    phone = user.PhoneNumber ?? "000-000-0000",
                    mobileNumber = user.PhoneNumber ?? "000-000-0000",
                    phoneNumber = user.PhoneNumber ?? "000-000-0000",
                    extension = user.Extension ?? "000",
                    designation = GetDesignationFromRole(user.Role),
                    department = user.Department ?? GetDepartmentFromRole(user.Role),
                    locationId = user.LocationId,
                    locationName = locationDict.TryGetValue(user.LocationId, out var locName) ? locName : "Main Office",
                    role = user.Role.ToString().ToLower(),
                    isActive = user.IsActive,
                    canLogin = true,
                    staffId = $"EMP{user.Id}",
                    photoUrl = "",
                    createdAt = user.CreatedAt.ToString("o"),
                    updatedAt = user.UpdatedAt.ToString("o")
                }).ToList();

                _logger.LogInformation("Returning {Count} staff members from Identity", staffList.Count);
                return Ok(staffList);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching staff from AspNetUsers table");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("by-location/{locationId}")]
        public async Task<IActionResult> GetStaffByLocation(int locationId)
        {
            try
            {
                _logger.LogInformation("Fetching staff for location ID: {LocationId} from Identity only", locationId);

                var locations = await _context.Locations.ToListAsync();
                var locationDict = locations.ToDictionary(l => l.Id, l => l.Name);

                var users = await _userManager.Users
                    .Where(u => u.LocationId == locationId && u.IsActive)
                    .AsNoTracking()
                    .ToListAsync();

                var staffList = users.Select(user => new
                {
                    id = user.Id,
                    firstName = user.FirstName,
                    lastName = user.LastName,
                    email = user.Email,
                    phone = user.PhoneNumber ?? "000-000-0000",
                    mobileNumber = user.PhoneNumber ?? "000-000-0000",
                    phoneNumber = user.PhoneNumber ?? "000-000-0000",
                    extension = user.Extension ?? "000",
                    designation = GetDesignationFromRole(user.Role),
                    department = user.Department ?? GetDepartmentFromRole(user.Role),
                    locationId = user.LocationId,
                    locationName = locationDict.TryGetValue(user.LocationId, out var locName) ? locName : "Unknown Location",
                    role = user.Role.ToString().ToLower(),
                    isActive = user.IsActive,
                    canLogin = true,
                    staffId = $"EMP{user.Id}",
                    photoUrl = "",
                    createdAt = user.CreatedAt.ToString("o"),
                    updatedAt = user.UpdatedAt.ToString("o")
                }).ToList();

                _logger.LogInformation("Returning {Count} staff members for location {LocationId}", staffList.Count, locationId);
                return Ok(staffList);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error fetching staff for location {locationId}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("location/{locationId}")]
        public async Task<IActionResult> GetStaffByLocationForFrontend(int locationId)
        {
            try
            {
                _logger.LogInformation("Frontend API: Fetching staff for location ID: {LocationId} from Identity only", locationId);

                var locations = await _context.Locations.ToListAsync();
                var locationDict = locations.ToDictionary(l => l.Id, l => l.Name);

                var users = await _userManager.Users
                    .Where(u => u.LocationId == locationId && u.IsActive)
                    .AsNoTracking()
                    .ToListAsync();

                var staffList = users.Select(user => new
                {
                    id = user.Id,
                    firstName = user.FirstName,
                    lastName = user.LastName,
                    email = user.Email,
                    phone = user.PhoneNumber ?? "000-000-0000",
                    mobileNumber = user.PhoneNumber ?? "000-000-0000",
                    phoneNumber = user.PhoneNumber ?? "000-000-0000",
                    extension = user.Extension ?? "000",
                    designation = GetDesignationFromRole(user.Role),
                    department = user.Department ?? GetDepartmentFromRole(user.Role),
                    locationId = user.LocationId,
                    locationName = locationDict.TryGetValue(user.LocationId, out var locName) ? locName : "Unknown Location",
                    role = user.Role.ToString().ToLower(),
                    isActive = user.IsActive,
                    canLogin = true,
                    staffId = $"EMP{user.Id}",
                    photoUrl = "",
                    createdAt = user.CreatedAt.ToString("o"),
                    updatedAt = user.UpdatedAt.ToString("o")
                }).ToList();

                _logger.LogInformation("Frontend API: Returning {Count} staff members for location {LocationId}", staffList.Count, locationId);
                return Ok(staffList);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Frontend API: Error fetching staff for location {locationId}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // Helper methods to extract name parts and determine role-based info
        private string ExtractFirstName(string userName)
        {
            if (string.IsNullOrEmpty(userName)) return "Unknown";
            
            // Handle email format usernames
            if (userName.Contains("@"))
            {
                var beforeAt = userName.Split('@')[0];
                var parts = beforeAt.Split('.');
                return parts.Length > 0 ? CapitalizeFirstLetter(parts[0]) : "Unknown";
            }
            
            // Handle space-separated names
            var nameParts = userName.Split(' ');
            return nameParts.Length > 0 ? CapitalizeFirstLetter(nameParts[0]) : "Unknown";
        }
        
        private string ExtractLastName(string userName)
        {
            if (string.IsNullOrEmpty(userName)) return "User";
            
            // Handle email format usernames
            if (userName.Contains("@"))
            {
                var beforeAt = userName.Split('@')[0];
                var parts = beforeAt.Split('.');
                return parts.Length > 1 ? CapitalizeFirstLetter(parts[1]) : "User";
            }
            
            // Handle space-separated names
            var nameParts = userName.Split(' ');
            return nameParts.Length > 1 ? CapitalizeFirstLetter(nameParts[1]) : "User";
        }
        
        private string CapitalizeFirstLetter(string input)
        {
            if (string.IsNullOrEmpty(input)) return input;
            return char.ToUpper(input[0]) + input.Substring(1).ToLower();
        }
        
        private string GetDesignationFromRole(UserRole role)
        {
            return role switch
            {
                UserRole.Admin => "System Administrator",
                UserRole.Reception => "Reception Staff",
                UserRole.Staff => "Staff Member",
                _ => "Staff Member"
            };
        }
        
        private string GetDepartmentFromRole(UserRole role)
        {
            return role switch
            {
                UserRole.Admin => "Administration",
                UserRole.Reception => "Reception",
                UserRole.Staff => "General",
                _ => "General"
            };
        }

        [HttpGet("active")]
        public async Task<IActionResult> GetActiveStaff()
        {
            try
            {
                _logger.LogInformation("Fetching active staff from AspNetUsers table");
                
                // Get all users from AspNetUsers table (actual registered staff) - remove IsActive filter temporarily
                var users = await _userManager.Users.ToListAsync();
                
                var staffList = users.Select(user => new
                {
                    id = user.Id,
                    firstName = user.FirstName,
                    lastName = user.LastName,
                    email = user.Email,
                    phone = user.PhoneNumber ?? "000-000-0000",
                    mobileNumber = user.PhoneNumber ?? "000-000-0000",
                    phoneNumber = user.PhoneNumber ?? "000-000-0000",
                    extension = user.Extension ?? "000",
                    designation = GetDesignationFromRole(user.Role),
                    department = user.Department ?? GetDepartmentFromRole(user.Role),
                    locationId = 1, // Default to main office for now
                    locationName = "Main Office",
                    role = user.Role.ToString().ToLower(),
                    isActive = user.IsActive,
                    canLogin = true,
                    staffId = $"EMP{user.Id}",
                    photoUrl = "",
                    createdAt = user.CreatedAt.ToString("o"),
                    updatedAt = user.UpdatedAt.ToString("o")
                }).ToList();
                
                _logger.LogInformation($"Retrieved {staffList.Count} active staff from AspNetUsers");
                return Ok(staffList);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching active staff from AspNetUsers table");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetStaff(string id)
        {
            try
            {
                _logger.LogInformation($"Fetching staff with ID {id} from database");
                
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == id);
                if (user == null)
                {
                    return NotFound($"Staff member with ID {id} not found");
                }
                
                var staffMember = new
                {
                    id = user.Id,
                    firstName = user.FirstName ?? ExtractFirstName(user.UserName ?? user.Email ?? "Unknown"),
                    lastName = user.LastName ?? ExtractLastName(user.UserName ?? user.Email ?? "User"),
                    email = user.Email,
                    phone = user.PhoneNumber ?? "000-000-0000",
                    mobileNumber = user.PhoneNumber ?? "000-000-0000",
                    phoneNumber = user.PhoneNumber ?? "000-000-0000",
                    extension = user.Extension ?? "000",
                    designation = GetDesignationFromRole(user.Role),
                    department = user.Department ?? GetDepartmentFromRole(user.Role),
                    locationId = 1,
                    role = user.Role.ToString().ToLower(),
                    isActive = user.IsActive,
                    canLogin = true,
                    staffId = $"EMP{user.Id}",
                    photoUrl = "",
                    createdAt = user.CreatedAt.ToString("o"),
                    updatedAt = user.UpdatedAt.ToString("o")
                };
                
                return Ok(staffMember);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error fetching staff {id} from database");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateStaff([FromBody] JsonElement staffData)
        {
            try
            {
                _logger.LogInformation("Creating new staff member in AspNetUsers (Identity)");

                // Extract data using safe property access
                string firstName = GetPropertyValueSafely(staffData, "firstName", "New");
                string lastName = GetPropertyValueSafely(staffData, "lastName", "User");
                string email = GetPropertyValueSafely(staffData, "email", $"user{DateTime.UtcNow.Ticks}@company.com");
                string mobileNumber = GetPropertyValueSafely(staffData, "mobileNumber", "000-000-0000");
                string phoneNumber = GetPropertyValueSafely(staffData, "phoneNumber", mobileNumber);
                string extension = GetPropertyValueSafely(staffData, "extension", "000");
                string department = GetPropertyValueSafely(staffData, "department", string.Empty);
                string roleString = GetPropertyValueSafely(staffData, "role", "staff");
                int locationId = int.TryParse(GetPropertyValueSafely(staffData, "locationId", "1"), out var locId) ? locId : 1;
                bool isActive = bool.TryParse(GetPropertyValueSafely(staffData, "isActive", "true"), out var active) ? active : true;

                if (!Enum.TryParse<UserRole>(roleString, true, out var parsedRole))
                {
                    parsedRole = UserRole.Staff;
                }

                // Create Identity user entity
                var user = new User
                {
                    UserName = email,
                    Email = email,
                    FirstName = firstName,
                    LastName = lastName,
                    PhoneNumber = phoneNumber,
                    Extension = extension,
                    Department = department,
                    Role = parsedRole,
                    LocationId = locationId,
                    IsActive = isActive,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                // Default password generation if none supplied
                string password = GetPropertyValueSafely(staffData, "password", "Temp#1234");

                var createResult = await _userManager.CreateAsync(user, password);
                if (!createResult.Succeeded)
                {
                    _logger.LogWarning("Failed to create identity user: {Errors}", string.Join(",", createResult.Errors.Select(e => e.Description)));
                    return BadRequest(new { message = "Failed to create user", errors = createResult.Errors.Select(e => e.Description) });
                }

                // Assign Identity role
                var roleName = parsedRole.ToString();
                if (!await _roleManager.RoleExistsAsync(roleName))
                {
                    await _roleManager.CreateAsync(new IdentityRole(roleName));
                    _logger.LogInformation("Created new role: {RoleName}", roleName);
                }

                var roleResult = await _userManager.AddToRoleAsync(user, roleName);
                if (!roleResult.Succeeded)
                {
                    _logger.LogWarning("Failed to assign role {RoleName} to user {Email}: {Errors}", 
                        roleName, email, string.Join(",", roleResult.Errors.Select(e => e.Description)));
                }

                _logger.LogInformation("Successfully created identity staff user {Email} with id {Id} and role {Role}", email, user.Id, roleName);

                var response = new
                {
                    id = user.Id,
                    firstName = user.FirstName,
                    lastName = user.LastName,
                    email = user.Email,
                    phone = user.PhoneNumber ?? "000-000-0000",
                    mobileNumber = user.PhoneNumber ?? "000-000-0000",
                    phoneNumber = user.PhoneNumber ?? "000-000-0000",
                    extension = user.Extension ?? "000",
                    designation = GetDesignationFromRole(user.Role),
                    department = user.Department ?? GetDepartmentFromRole(user.Role),
                    locationId = user.LocationId,
                    role = user.Role.ToString().ToLower(),
                    isActive = user.IsActive,
                    canLogin = true,
                    staffId = $"EMP{user.Id}",
                    photoUrl = string.Empty,
                    createdAt = user.CreatedAt.ToString("o"),
                    updatedAt = user.UpdatedAt.ToString("o")
                };

                return CreatedAtAction(nameof(GetStaff), new { id = user.Id }, response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating staff member in AspNetUsers table");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateStaff(string id, [FromBody] JsonElement staffData)
        {
            try
            {
                _logger.LogInformation($"Updating staff member {id} via database");
                
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == id);
                if (user == null)
                {
                    return NotFound($"Staff member with ID {id} not found");
                }
                
                // Update user properties if provided using safe property access
                string firstName = GetPropertyValueSafely(staffData, "firstName", string.Empty);
                if (!string.IsNullOrEmpty(firstName))
                {
                    user.FirstName = firstName;
                }
                
                string lastName = GetPropertyValueSafely(staffData, "lastName", string.Empty);
                if (!string.IsNullOrEmpty(lastName))
                {
                    user.LastName = lastName;
                }
                
                string email = GetPropertyValueSafely(staffData, "email", string.Empty);
                if (!string.IsNullOrEmpty(email))
                {
                    user.Email = email;
                    user.UserName = email;
                }
                
                string mobileNumber = GetPropertyValueSafely(staffData, "mobileNumber", string.Empty);
                if (!string.IsNullOrEmpty(mobileNumber))
                {
                    user.PhoneNumber = mobileNumber;
                }
                
                string extension = GetPropertyValueSafely(staffData, "extension", string.Empty);
                if (!string.IsNullOrEmpty(extension))
                {
                    user.Extension = extension;
                }
                
                string department = GetPropertyValueSafely(staffData, "department", string.Empty);
                if (!string.IsNullOrEmpty(department))
                {
                    user.Department = department;
                }
                
                string roleString = GetPropertyValueSafely(staffData, "role", string.Empty);
                if (!string.IsNullOrEmpty(roleString))
                {
                    if (Enum.TryParse<UserRole>(roleString, true, out var parsedRole))
                    {
                        user.Role = parsedRole;
                    }
                }
                
                // Update timestamp
                user.UpdatedAt = DateTime.UtcNow;
                
                await _context.SaveChangesAsync();
                
                _logger.LogInformation($"Successfully updated staff member: {id}");
                
                var updatedStaffMember = new
                {
                    id = user.Id,
                    firstName = user.FirstName ?? ExtractFirstName(user.UserName ?? user.Email ?? "Unknown"),
                    lastName = user.LastName ?? ExtractLastName(user.UserName ?? user.Email ?? "User"),
                    email = user.Email,
                    phone = user.PhoneNumber ?? "000-000-0000",
                    mobileNumber = user.PhoneNumber ?? "000-000-0000",
                    phoneNumber = user.PhoneNumber ?? "000-000-0000",
                    extension = user.Extension ?? "000",
                    designation = GetDesignationFromRole(user.Role),
                    department = user.Department ?? GetDepartmentFromRole(user.Role),
                    locationId = 1,
                    role = user.Role.ToString().ToLower(),
                    isActive = user.IsActive,
                    canLogin = true,
                    staffId = $"EMP{user.Id}",
                    photoUrl = "",
                    createdAt = user.CreatedAt.ToString("o"),
                    updatedAt = DateTime.Now.ToString("o")
                };
                
                return Ok(updatedStaffMember);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating staff member {id} in database");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteStaff(string id)
        {
            try
            {
                _logger.LogInformation($"Deleting staff member {id} from database");
                
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == id);
                if (user == null)
                {
                    return NotFound($"Staff member with ID {id} not found");
                }
                
                _context.Users.Remove(user);
                await _context.SaveChangesAsync();
                
                _logger.LogInformation($"Successfully deleted staff member: {id}");
                return Ok(new { message = $"Staff member {id} deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting staff member {id} from database");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // Helper methods for location filtering
        private bool ShouldIncludeUserForLocation(User user, int locationId)
        {
            // Implement proper location filtering based on email and business rules
            
            if (user.Email?.Contains("gogulan.a@babajishivram.com") == true)
            {
                // Gogulan should ONLY be in Corporate Office (locationId = 2)
                return locationId == 2;
            }
            
            // SuperAdmin should be available in all locations
            if (user.Email?.Contains("superadmin@company.com") == true)
            {
                return true;
            }
            
            // All other staff should ONLY be in Main Office (locationId = 1)
            // This prevents staff from appearing in all locations
            return locationId == 1;
        }

        private int GetUserLocationId(User user)
        {
            // Determine user's location based on business rules
            if (user.Email?.Contains("gogulan.a@babajishivram.com") == true)
            {
                return 2; // Corporate Office
            }
            
            // Default to Main Office for other users
            return 1;
        }
    }
}
