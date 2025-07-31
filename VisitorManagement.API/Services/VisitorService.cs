using AutoMapper;
using Microsoft.EntityFrameworkCore;
using VisitorManagement.API.Data;
using VisitorManagement.API.Models.DTOs;
using VisitorManagement.API.Models.Entities;

namespace VisitorManagement.API.Services
{
    public class VisitorService : IVisitorService
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;

        public VisitorService(ApplicationDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<VisitorDto?> CreateVisitorAsync(CreateVisitorDto request)
        {
            var visitor = _mapper.Map<Visitor>(request);
            visitor.Status = VisitorStatus.AwaitingApproval;

            _context.Visitors.Add(visitor);
            await _context.SaveChangesAsync();

            // Handle custom fields if provided
            if (request.CustomFields != null && request.CustomFields.Any())
            {
                var customFields = await _context.CustomFields
                    .Where(cf => request.CustomFields.Keys.Contains(cf.Name))
                    .ToListAsync();

                foreach (var customField in customFields)
                {
                    if (request.CustomFields.TryGetValue(customField.Name, out var value))
                    {
                        var customFieldValue = new VisitorCustomFieldValue
                        {
                            VisitorId = visitor.Id,
                            CustomFieldId = customField.Id,
                            Value = value
                        };
                        _context.VisitorCustomFieldValues.Add(customFieldValue);
                    }
                }
                await _context.SaveChangesAsync();
            }

            return await GetVisitorByIdAsync(visitor.Id);
        }

        public async Task<VisitorDto?> GetVisitorByIdAsync(int id)
        {
            var visitor = await _context.Visitors
                .Include(v => v.Location)
                .Include(v => v.CustomFieldValues)
                    .ThenInclude(cfv => cfv.CustomField)
                .FirstOrDefaultAsync(v => v.Id == id);

            if (visitor == null)
                return null;

            var visitorDto = _mapper.Map<VisitorDto>(visitor);
            
            // Map custom fields
            if (visitor.CustomFieldValues.Any())
            {
                visitorDto.CustomFields = visitor.CustomFieldValues
                    .ToDictionary(cfv => cfv.CustomField.Name, cfv => cfv.Value ?? string.Empty);
            }

            return visitorDto;
        }

        public async Task<List<VisitorDto>> GetVisitorsAsync(int? locationId = null, DateTime? date = null, VisitorStatus? status = null)
        {
            var query = _context.Visitors
                .Include(v => v.Location)
                .Include(v => v.CustomFieldValues)
                    .ThenInclude(cfv => cfv.CustomField)
                .AsQueryable();

            if (locationId.HasValue)
                query = query.Where(v => v.LocationId == locationId.Value);

            if (date.HasValue)
                query = query.Where(v => v.DateTime.Date == date.Value.Date);

            if (status.HasValue)
                query = query.Where(v => v.Status == status.Value);

            var visitors = await query
                .OrderByDescending(v => v.CreatedAt)
                .ToListAsync();

            var visitorDtos = _mapper.Map<List<VisitorDto>>(visitors);

            // Map custom fields for each visitor
            foreach (var visitorDto in visitorDtos)
            {
                var visitor = visitors.First(v => v.Id == visitorDto.Id);
                if (visitor.CustomFieldValues.Any())
                {
                    visitorDto.CustomFields = visitor.CustomFieldValues
                        .ToDictionary(cfv => cfv.CustomField.Name, cfv => cfv.Value ?? string.Empty);
                }
            }

            return visitorDtos;
        }

        public async Task<List<VisitorDto>> GetVisitorsByStaffAsync(string staffName, VisitorStatus? status = null)
        {
            var query = _context.Visitors
                .Include(v => v.Location)
                .Include(v => v.CustomFieldValues)
                    .ThenInclude(cfv => cfv.CustomField)
                .Where(v => v.WhomToMeet == staffName);

            if (status.HasValue)
                query = query.Where(v => v.Status == status.Value);

            var visitors = await query
                .OrderByDescending(v => v.CreatedAt)
                .ToListAsync();

            var visitorDtos = _mapper.Map<List<VisitorDto>>(visitors);

            // Map custom fields for each visitor
            foreach (var visitorDto in visitorDtos)
            {
                var visitor = visitors.First(v => v.Id == visitorDto.Id);
                if (visitor.CustomFieldValues.Any())
                {
                    visitorDto.CustomFields = visitor.CustomFieldValues
                        .ToDictionary(cfv => cfv.CustomField.Name, cfv => cfv.Value ?? string.Empty);
                }
            }

            return visitorDtos;
        }

        public async Task<bool> UpdateVisitorStatusAsync(int id, UpdateVisitorStatusDto request, string? approvedBy = null)
        {
            var visitor = await _context.Visitors.FindAsync(id);
            if (visitor == null)
                return false;

            visitor.Status = request.Status;
            visitor.Notes = request.Notes;
            visitor.UpdatedAt = DateTime.UtcNow;

            if (request.Status == VisitorStatus.Approved && !string.IsNullOrEmpty(approvedBy))
            {
                visitor.ApprovedBy = approvedBy;
                visitor.ApprovedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> CheckInVisitorAsync(int id)
        {
            var visitor = await _context.Visitors.FindAsync(id);
            if (visitor == null || visitor.Status != VisitorStatus.Approved)
                return false;

            visitor.Status = VisitorStatus.CheckedIn;
            visitor.CheckInTime = DateTime.UtcNow;
            visitor.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> CheckOutVisitorAsync(int id)
        {
            var visitor = await _context.Visitors.FindAsync(id);
            if (visitor == null || visitor.Status != VisitorStatus.CheckedIn)
                return false;

            visitor.Status = VisitorStatus.CheckedOut;
            visitor.CheckOutTime = DateTime.UtcNow;
            visitor.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<VisitorStatsDto> GetVisitorStatsAsync(int? locationId = null, DateTime? fromDate = null, DateTime? toDate = null)
        {
            var query = _context.Visitors.AsQueryable();

            if (locationId.HasValue)
                query = query.Where(v => v.LocationId == locationId.Value);

            if (fromDate.HasValue)
                query = query.Where(v => v.DateTime.Date >= fromDate.Value.Date);

            if (toDate.HasValue)
                query = query.Where(v => v.DateTime.Date <= toDate.Value.Date);

            var visitors = await query.ToListAsync();

            var total = visitors.Count;
            var awaiting = visitors.Count(v => v.Status == VisitorStatus.AwaitingApproval);
            var approved = visitors.Count(v => v.Status == VisitorStatus.Approved || v.Status == VisitorStatus.CheckedIn || v.Status == VisitorStatus.CheckedOut);
            var checkedIn = visitors.Count(v => v.Status == VisitorStatus.CheckedIn);
            var checkedOut = visitors.Count(v => v.Status == VisitorStatus.CheckedOut);
            var rejected = visitors.Count(v => v.Status == VisitorStatus.Rejected);

            var approvalRate = total > 0 ? (decimal)approved / total * 100 : 0;

            return new VisitorStatsDto
            {
                Total = total,
                AwaitingApproval = awaiting,
                Approved = approved,
                CheckedIn = checkedIn,
                CheckedOut = checkedOut,
                Rejected = rejected,
                ApprovalRate = Math.Round(approvalRate, 1)
            };
        }

        public async Task<List<VisitorDto>> GetTodaysVisitorsAsync(int? locationId = null)
        {
            var today = DateTime.Today;
            return await GetVisitorsAsync(locationId, today);
        }

        public async Task<bool> DeleteVisitorAsync(int id)
        {
            var visitor = await _context.Visitors.FindAsync(id);
            if (visitor == null)
                return false;

            _context.Visitors.Remove(visitor);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}