using VisitorManagement.API.Models.DTOs;
using VisitorManagement.API.Models.Entities;

namespace VisitorManagement.API.Services
{
    public interface IVisitorService
    {
        Task<VisitorDto?> CreateVisitorAsync(CreateVisitorDto request);
        Task<VisitorDto?> GetVisitorByIdAsync(int id);
        Task<List<VisitorDto>> GetVisitorsAsync(int? locationId = null, DateTime? date = null, VisitorStatus? status = null);
        Task<List<VisitorDto>> GetVisitorsByStaffAsync(string staffName, VisitorStatus? status = null);
        Task<bool> UpdateVisitorStatusAsync(int id, UpdateVisitorStatusDto request, string? approvedBy = null);
        Task<bool> CheckInVisitorAsync(int id);
        Task<bool> CheckOutVisitorAsync(int id);
        Task<VisitorStatsDto> GetVisitorStatsAsync(int? locationId = null, DateTime? fromDate = null, DateTime? toDate = null);
        Task<List<VisitorDto>> GetTodaysVisitorsAsync(int? locationId = null);
        Task<bool> DeleteVisitorAsync(int id);
    }
}