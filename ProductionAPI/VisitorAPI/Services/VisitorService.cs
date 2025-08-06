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
        private readonly IEmailService _emailService;
        private readonly ILogger<VisitorService> _logger;

        public VisitorService(
            ApplicationDbContext context, 
            IMapper mapper, 
            IEmailService emailService,
            ILogger<VisitorService> logger)
        {
            _context = context;
            _mapper = mapper;
            _emailService = emailService;
            _logger = logger;
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

            // Send email notification to staff member
            await SendStaffNotificationAsync(visitor.Id, visitor.WhomToMeet);

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

            var previousStatus = visitor.Status;
            visitor.Status = request.Status;
            visitor.Notes = request.Notes;
            visitor.UpdatedAt = DateTime.UtcNow;

            if (request.Status == VisitorStatus.Approved && !string.IsNullOrEmpty(approvedBy))
            {
                visitor.ApprovedBy = approvedBy;
                visitor.ApprovedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            // Send email notifications based on status change
            await SendStatusChangeNotificationAsync(id, previousStatus, request.Status, request.Notes);

            return true;
        }

        public async Task<bool> CheckInVisitorAsync(int id)
        {
            var visitor = await _context.Visitors.FindAsync(id);
            if (visitor == null || visitor.Status != VisitorStatus.Approved)
                return false;

            visitor.Status = VisitorStatus.CheckedIn;
            visitor.CheckInTime = DateTime.Now; // Use local time instead of UTC
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
            visitor.CheckOutTime = DateTime.Now; // Use local time instead of UTC
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

        private async Task SendStaffNotificationAsync(int visitorId, string whomToMeet)
        {
            try
            {
                _logger.LogInformation($"Attempting to send staff notification for visitor {visitorId} to '{whomToMeet}'");
                
                // Get visitor info to know their location
                var visitor = await _context.Visitors
                    .Include(v => v.Location)
                    .FirstOrDefaultAsync(v => v.Id == visitorId);
                
                if (visitor == null)
                {
                    _logger.LogWarning($"Visitor with ID {visitorId} not found when trying to send notification");
                    return;
                }
                
                // Get all staff members and perform matching in memory to avoid SQL translation issues
                var allStaff = await _context.StaffMembers.ToListAsync();
                
                // Find staff member by name or email with flexible matching
                var staff = allStaff.FirstOrDefault(s => 
                    $"{s.FirstName} {s.LastName}".Equals(whomToMeet, StringComparison.OrdinalIgnoreCase) ||
                    s.Email.Equals(whomToMeet, StringComparison.OrdinalIgnoreCase) ||
                    s.FirstName.Equals(whomToMeet, StringComparison.OrdinalIgnoreCase) ||
                    s.LastName.Equals(whomToMeet, StringComparison.OrdinalIgnoreCase) ||
                    whomToMeet.Contains(s.FirstName, StringComparison.OrdinalIgnoreCase) ||
                    whomToMeet.Contains(s.LastName, StringComparison.OrdinalIgnoreCase));

                bool notificationSent = false;
                
                // First try sending to the specific staff member if found
                if (staff != null)
                {
                    _logger.LogInformation($"Found staff member: {staff.FirstName} {staff.LastName} ({staff.Email}) for visitor {visitorId}");
                    var result = await _emailService.SendVisitorNotificationToStaffAsync(visitorId, staff.Email);
                    if (!result)
                    {
                        _logger.LogWarning($"Failed to send notification email to staff {staff.Email} for visitor {visitorId}");
                    }
                    else
                    {
                        _logger.LogInformation($"Successfully sent notification email to staff {staff.Email} for visitor {visitorId}");
                        notificationSent = true;
                    }
                }
                else
                {
                    _logger.LogWarning($"Staff member '{whomToMeet}' not found for visitor {visitorId}");
                    
                    // Log all available staff members for debugging
                    var availableStaff = await _context.StaffMembers.Select(s => new { s.FirstName, s.LastName, s.Email }).ToListAsync();
                    _logger.LogInformation($"Available staff members: {string.Join(", ", availableStaff.Select(s => $"{s.FirstName} {s.LastName} ({s.Email})"))}");
                }
                
                // If we couldn't find the staff member or email failed, try to send to location admins as fallback
                if (!notificationSent && visitor.LocationId > 0)
                {
                    // Find administrators for this location
                    var locationAdmins = allStaff
                        .Where(s => s.LocationId == visitor.LocationId && s.Role.ToLower() == "admin" && !string.IsNullOrEmpty(s.Email))
                        .ToList();
                        
                    if (locationAdmins.Any())
                    {
                        _logger.LogInformation($"Sending fallback notifications to {locationAdmins.Count} location administrators");
                        
                        foreach (var admin in locationAdmins)
                        {
                            var result = await _emailService.SendVisitorNotificationToStaffAsync(visitorId, admin.Email);
                            if (result)
                            {
                                _logger.LogInformation($"Successfully sent notification email to location admin {admin.Email} for visitor {visitorId}");
                                notificationSent = true;
                            }
                        }
                    }
                }
                
                // Last resort: notify global system admins
                if (!notificationSent)
                {
                    var systemAdmins = allStaff
                        .Where(s => s.Role.ToLower() == "admin" && !string.IsNullOrEmpty(s.Email))
                        .ToList();
                        
                    if (systemAdmins.Any())
                    {
                        _logger.LogInformation($"Sending fallback notifications to {systemAdmins.Count} system administrators");
                        
                        foreach (var admin in systemAdmins)
                        {
                            await _emailService.SendVisitorNotificationToStaffAsync(visitorId, admin.Email);
                            _logger.LogInformation($"Sent notification email to system admin {admin.Email} for visitor {visitorId}");
                        }
                    }
                    else
                    {
                        _logger.LogWarning("No system administrators found to send visitor notification");
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error sending staff notification for visitor {visitorId}");
            }
        }

        private async Task SendStatusChangeNotificationAsync(int visitorId, VisitorStatus previousStatus, VisitorStatus newStatus, string? notes)
        {
            try
            {
                switch (newStatus)
                {
                    case VisitorStatus.Approved:
                        var approvalResult = await _emailService.SendVisitorApprovalConfirmationAsync(visitorId);
                        if (!approvalResult)
                        {
                            _logger.LogWarning($"Failed to send approval confirmation for visitor {visitorId}");
                        }
                        break;

                    case VisitorStatus.Rejected:
                        var rejectionReason = notes ?? "Your visit request has been reviewed and cannot be approved at this time.";
                        var rejectionResult = await _emailService.SendVisitorRejectionNoticeAsync(visitorId, rejectionReason);
                        if (!rejectionResult)
                        {
                            _logger.LogWarning($"Failed to send rejection notice for visitor {visitorId}");
                        }
                        break;

                    case VisitorStatus.CheckedIn:
                        var checkinResult = await _emailService.SendVisitorCheckInNotificationAsync(visitorId);
                        if (!checkinResult)
                        {
                            _logger.LogWarning($"Failed to send check-in notification for visitor {visitorId}");
                        }
                        break;

                    case VisitorStatus.CheckedOut:
                        var checkoutResult = await _emailService.SendVisitorCheckOutNotificationAsync(visitorId);
                        if (!checkoutResult)
                        {
                            _logger.LogWarning($"Failed to send check-out notification for visitor {visitorId}");
                        }
                        break;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error sending status change notification for visitor {visitorId}");
            }
        }
    }
}