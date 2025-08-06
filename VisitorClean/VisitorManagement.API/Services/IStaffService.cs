using VisitorManagement.API.Models.DTOs;

namespace VisitorManagement.API.Services
{
    public interface IStaffService
    {
        Task<List<StaffMemberDto>> GetAllStaffMembersAsync();
        Task<StaffMemberDto?> GetStaffMemberByIdAsync(int id);
        Task<List<StaffMemberDto>> GetStaffMembersByLocationAsync(int locationId);
        Task<StaffMemberDto?> CreateStaffMemberAsync(CreateStaffMemberDto request);
        Task<bool> UpdateStaffMemberAsync(int id, UpdateStaffMemberDto request);
        Task<bool> DeleteStaffMemberAsync(int id);
        Task<bool> ToggleStaffMemberStatusAsync(int id);
        Task<List<StaffMemberDto>> GetActiveStaffMembersAsync();
    }
}
