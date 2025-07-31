using VisitorManagement.API.Models.DTOs;

namespace VisitorManagement.API.Services
{
    public interface IAuthService
    {
        Task<LoginResponseDto?> LoginAsync(LoginRequestDto request);
        Task<UserDto?> RegisterAsync(RegisterRequestDto request);
        Task<UserDto?> GetUserByIdAsync(string userId);
        Task<List<UserDto>> GetAllUsersAsync();
        Task<bool> UpdateUserAsync(string userId, RegisterRequestDto request);
        Task<bool> DeleteUserAsync(string userId);
        string GenerateJwtToken(UserDto user);
    }
}