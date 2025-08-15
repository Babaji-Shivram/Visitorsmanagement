using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SimpleAPI.Data;
using SimpleAPI.Models.Entities;
using SimpleAPI.Models.DTOs;
using SimpleAPI.Services;
using System.Text.Json;

namespace SimpleAPI.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class VisitorsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IServiceProvider _serviceProvider;
        private readonly IEmailService _emailService;

        public VisitorsController(ApplicationDbContext context, IServiceProvider serviceProvider, IEmailService emailService)
        {
            _context = context;
            _serviceProvider = serviceProvider;
            _emailService = emailService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllVisitors([FromQuery] string? status = null, [FromQuery] int? locationId = null)
        {
            var query = _context.Visitors.Include(v => v.Location).AsQueryable();
            
            if (!string.IsNullOrEmpty(status))
            {
                if (Enum.TryParse<VisitorStatus>(status, true, out var statusEnum))
                {
                    query = query.Where(v => v.Status == statusEnum);
                }
            }
            
            if (locationId.HasValue)
            {
                query = query.Where(v => v.LocationId == locationId.Value);
            }
            
            var visitors = await query.OrderByDescending(v => v.CreatedAt).ToListAsync();
            var response = visitors.Select(v => v.ToResponse()).ToList();
            return Ok(response);
        }

        [HttpGet("today")]
        public async Task<IActionResult> GetTodaysVisitors([FromQuery] int? locationId = null)
        {
            var today = DateTime.Today;
            var tomorrow = today.AddDays(1);
            
            var query = _context.Visitors
                .Include(v => v.Location)
                .Where(v => v.DateTime >= today && v.DateTime < tomorrow);
            
            if (locationId.HasValue)
            {
                query = query.Where(v => v.LocationId == locationId.Value);
            }
            
            var visitors = await query.OrderBy(v => v.DateTime).ToListAsync();
            var response = visitors.Select(v => v.ToResponse()).ToList();
            return Ok(response);
        }

        [HttpGet("pending")]
        public async Task<IActionResult> GetPendingVisitors([FromQuery] int? locationId = null)
        {
            var query = _context.Visitors
                .Include(v => v.Location)
                .Where(v => v.Status == VisitorStatus.AwaitingApproval);
            
            if (locationId.HasValue)
            {
                query = query.Where(v => v.LocationId == locationId.Value);
            }
            
            var visitors = await query.OrderBy(v => v.DateTime).ToListAsync();
            var response = visitors.Select(v => v.ToResponse()).ToList();
            return Ok(response);
        }

        [HttpGet("search")]
        public async Task<IActionResult> SearchVisitors([FromQuery] string query)
        {
            if (string.IsNullOrEmpty(query))
            {
                var allVisitors = await _context.Visitors.Include(v => v.Location).ToListAsync();
                var allResponse = allVisitors.Select(v => v.ToResponse()).ToList();
                return Ok(allResponse);
            }
            
            var visitors = await _context.Visitors
                .Include(v => v.Location)
                .Where(v => v.FullName.Contains(query) ||
                           v.PhoneNumber.Contains(query) ||
                           v.Email!.Contains(query) ||
                           v.CompanyName!.Contains(query))
                .ToListAsync();
            
            var response = visitors.Select(v => v.ToResponse()).ToList();
            return Ok(response);
        }

        [HttpGet("by-phone/{phoneNumber}")]
        public async Task<IActionResult> GetVisitorByPhoneNumber(string phoneNumber)
        {
            if (string.IsNullOrEmpty(phoneNumber))
            {
                return BadRequest(new { message = "Phone number is required" });
            }

            // Find the most recent visitor with this phone number
            var latestVisitor = await _context.Visitors
                .Include(v => v.Location)
                .Where(v => v.PhoneNumber == phoneNumber)
                .OrderByDescending(v => v.CreatedAt)
                .FirstOrDefaultAsync();
            
            if (latestVisitor == null)
            {
                return NotFound(new { message = "No visitor found with this phone number" });
            }

            // Return visitor data for prefilling (excluding sensitive fields)
            var prefillData = new
            {
                fullName = latestVisitor.FullName,
                email = latestVisitor.Email,
                companyName = latestVisitor.CompanyName,
                idProofType = latestVisitor.IdProofType,
                idProofNumber = latestVisitor.IdProofNumber,
                // Note: We don't prefill WhomToMeet and PurposeOfVisit as requested
                isReturningVisitor = true,
                lastVisitDate = latestVisitor.CreatedAt.ToString("yyyy-MM-dd")
            };
            
            return Ok(prefillData);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetVisitor(int id)
        {
            var visitor = await _context.Visitors
                .Include(v => v.Location)
                .FirstOrDefaultAsync(v => v.Id == id);
                
            if (visitor == null)
                return NotFound(new { message = "Visitor not found" });
            
            var response = visitor.ToResponse();
            return Ok(response);
        }

        [HttpPost]
        public async Task<IActionResult> CreateVisitor([FromBody] JsonElement visitorData)
        {
            try
            {
                // Helper function to safely get values from JsonElement
                string GetStringValue(string propertyName, string defaultValue = "") =>
                    visitorData.TryGetProperty(propertyName, out var prop) && prop.ValueKind == JsonValueKind.String 
                        ? prop.GetString() ?? defaultValue 
                        : defaultValue;
                
                int GetIntValue(string propertyName, int defaultValue = 1) =>
                    visitorData.TryGetProperty(propertyName, out var prop) ? prop.GetInt32() : defaultValue;

                DateTime GetDateTimeValue(string propertyName, DateTime defaultValue) =>
                    visitorData.TryGetProperty(propertyName, out var prop) && DateTime.TryParse(prop.GetString(), out var date) ? date : defaultValue;
                
                var visitor = new Visitor
                {
                    LocationId = GetIntValue("locationId", 1),
                    FullName = GetStringValue("fullName", "New Visitor"),
                    PhoneNumber = GetStringValue("phoneNumber", "000-000-0000"),
                    Email = GetStringValue("email"),
                    CompanyName = GetStringValue("companyName"),
                    PurposeOfVisit = GetStringValue("purposeOfVisit", "General Meeting"),
                    WhomToMeet = GetStringValue("whomToMeet", "Available Staff"),
                    DateTime = GetDateTimeValue("dateTime", DateTime.Now),
                    IdProofType = GetStringValue("idProofType"),
                    IdProofNumber = GetStringValue("idProofNumber"),
                    PhotoUrl = GetStringValue("photoUrl"),
                    Status = VisitorStatus.AwaitingApproval,
                    Notes = GetStringValue("notes"),
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now
                };
                
                _context.Visitors.Add(visitor);
                await _context.SaveChangesAsync();

                // Handle custom field values if present
                if (visitorData.TryGetProperty("customFields", out var customFieldsElement) && 
                    customFieldsElement.ValueKind == JsonValueKind.Array)
                {
                    foreach (var customFieldElement in customFieldsElement.EnumerateArray())
                    {
                        if (customFieldElement.TryGetProperty("fieldId", out var fieldIdProp) &&
                            customFieldElement.TryGetProperty("value", out var valueProp) &&
                            fieldIdProp.ValueKind == JsonValueKind.Number &&
                            !string.IsNullOrEmpty(valueProp.GetString()))
                        {
                            var customFieldValue = new VisitorCustomFieldValue
                            {
                                VisitorId = visitor.Id,
                                CustomFieldId = fieldIdProp.GetInt32(),
                                Value = valueProp.GetString()
                            };
                            
                            _context.VisitorCustomFieldValues.Add(customFieldValue);
                        }
                    }
                    
                    // Save custom field values
                    await _context.SaveChangesAsync();
                }
                
                // Send visitor registration notification emails
                try
                {
                    // Send confirmation email to visitor
                    await _emailService.SendVisitorRegistrationNotificationAsync(
                        visitor.Email ?? "", 
                        visitor.FullName, 
                        visitor.CompanyName ?? "", 
                        visitor.PurposeOfVisit, 
                        visitor.WhomToMeet, 
                        visitor.DateTime.ToString("yyyy-MM-dd HH:mm")
                    );

                    // Send notification to staff members immediately (not in background)
                    try
                    {
                        var staffToNotify = await _context.Users
                            .Where(u => u.IsActive && 
                                       (u.Role == UserRole.Reception || 
                                        (u.FirstName + " " + u.LastName) == visitor.WhomToMeet))
                            .ToListAsync();

                        Console.WriteLine($"🔔 Found {staffToNotify.Count} identity staff users to notify for visitor {visitor.FullName}");

                        foreach (var staff in staffToNotify)
                        {
                            Console.WriteLine($"📧 Sending notification to staff: {staff.Email}");
                            await _emailService.SendVisitorNotificationWithActionsAsync(
                                staff.Email ?? string.Empty,
                                visitor.Id,
                                visitor.FullName,
                                visitor.Email ?? string.Empty,
                                visitor.CompanyName ?? string.Empty,
                                visitor.PurposeOfVisit,
                                visitor.DateTime.ToString("yyyy-MM-dd HH:mm"),
                                visitor.Status.ToString()
                            );
                            Console.WriteLine($"✅ Successfully sent notification to: {staff.Email}");
                        }
                    }
                    catch (Exception staffEmailEx)
                    {
                        Console.WriteLine($"❌ Failed to send staff notifications: {staffEmailEx.Message}");
                        // Don't fail the registration, but log the error properly
                    }
                }
                catch (Exception emailEx)
                {
                    // Log email error but don't fail the registration
                    Console.WriteLine($"❌ Email notification error: {emailEx.Message}");
                }
                
                return CreatedAtAction(nameof(GetVisitor), new { id = visitor.Id }, visitor.ToResponse());
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Invalid visitor data", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateVisitor(int id, [FromBody] JsonElement visitorData)
        {
            var visitor = await _context.Visitors.FindAsync(id);
            if (visitor == null)
                return NotFound(new { message = "Visitor not found" });
            
            try
            {
                // Helper function to safely get values from JsonElement
                string GetStringValue(string propertyName, string? defaultValue) =>
                    visitorData.TryGetProperty(propertyName, out var prop) && prop.ValueKind == JsonValueKind.String 
                        ? prop.GetString() ?? defaultValue ?? ""
                        : defaultValue ?? "";
                
                int GetIntValue(string propertyName, int defaultValue) =>
                    visitorData.TryGetProperty(propertyName, out var prop) ? prop.GetInt32() : defaultValue;

                DateTime GetDateTimeValue(string propertyName, DateTime defaultValue) =>
                    visitorData.TryGetProperty(propertyName, out var prop) && DateTime.TryParse(prop.GetString(), out var date) ? date : defaultValue;
                
                // Update visitor properties
                visitor.LocationId = GetIntValue("locationId", visitor.LocationId);
                visitor.FullName = GetStringValue("fullName", visitor.FullName) ?? visitor.FullName;
                visitor.PhoneNumber = GetStringValue("phoneNumber", visitor.PhoneNumber) ?? visitor.PhoneNumber;
                visitor.Email = GetStringValue("email", visitor.Email);
                visitor.CompanyName = GetStringValue("companyName", visitor.CompanyName);
                visitor.PurposeOfVisit = GetStringValue("purposeOfVisit", visitor.PurposeOfVisit) ?? visitor.PurposeOfVisit;
                visitor.WhomToMeet = GetStringValue("whomToMeet", visitor.WhomToMeet) ?? visitor.WhomToMeet;
                visitor.DateTime = GetDateTimeValue("dateTime", visitor.DateTime);
                visitor.IdProofType = GetStringValue("idProofType", visitor.IdProofType);
                visitor.IdProofNumber = GetStringValue("idProofNumber", visitor.IdProofNumber);
                visitor.PhotoUrl = GetStringValue("photoUrl", visitor.PhotoUrl);
                visitor.Notes = GetStringValue("notes", visitor.Notes);
                visitor.UpdatedAt = DateTime.Now;
                
                await _context.SaveChangesAsync();
                return Ok(visitor.ToResponse());
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Invalid visitor data", error = ex.Message });
            }
        }

        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateVisitorStatus(int id, [FromBody] JsonElement statusData)
        {
            var visitor = await _context.Visitors.FindAsync(id);
            if (visitor == null)
                return NotFound(new { message = "Visitor not found" });
            
            // Handle both string and numeric status values
            VisitorStatus newStatus = VisitorStatus.Approved; // default
            if (statusData.TryGetProperty("status", out var statusProp))
            {
                if (statusProp.ValueKind == JsonValueKind.String)
                {
                    if (Enum.TryParse<VisitorStatus>(statusProp.GetString(), true, out var parsedStatus))
                    {
                        newStatus = parsedStatus;
                    }
                }
                else if (statusProp.ValueKind == JsonValueKind.Number)
                {
                    var statusNumber = statusProp.GetInt32();
                    newStatus = (VisitorStatus)statusNumber;
                }
            }
            
            visitor.Status = newStatus;
            visitor.UpdatedAt = DateTime.Now;
            
            if (newStatus == VisitorStatus.Approved)
            {
                visitor.ApprovedBy = "System"; // You might want to get this from the current user
                visitor.ApprovedAt = DateTime.Now;
            }
            
            await _context.SaveChangesAsync();
            
            // Send email notification for status update
            try
            {
                var reason = statusData.TryGetProperty("reason", out var reasonProp) ? reasonProp.GetString() : null;
                
                await _emailService.SendStatusUpdateEmailAsync(
                    visitor.Email ?? "",
                    visitor.FullName,
                    visitor.CompanyName ?? "",
                    visitor.PurposeOfVisit,
                    newStatus.ToString(),
                    reason
                );
            }
            catch (Exception emailEx)
            {
                // Log email error but don't fail the status update
                Console.WriteLine($"❌ Status update email error: {emailEx.Message}");
            }
            
            return Ok(new { message = "Status updated successfully", visitor = visitor.ToResponse() });
        }

        [HttpPut("{id}/checkin")]
        public async Task<IActionResult> CheckInVisitor(int id)
        {
            var visitor = await _context.Visitors.FindAsync(id);
            if (visitor == null)
                return NotFound(new { message = "Visitor not found" });
            
            visitor.Status = VisitorStatus.CheckedIn;
            visitor.CheckInTime = DateTime.Now;
            visitor.UpdatedAt = DateTime.Now;
            
            await _context.SaveChangesAsync();
            return Ok(new { message = "Visitor checked in successfully", visitor = visitor.ToResponse() });
        }

        [HttpPut("{id}/checkout")]
        public async Task<IActionResult> CheckOutVisitor(int id)
        {
            var visitor = await _context.Visitors.FindAsync(id);
            if (visitor == null)
                return NotFound(new { message = "Visitor not found" });
            
            visitor.Status = VisitorStatus.CheckedOut;
            visitor.CheckOutTime = DateTime.Now;
            visitor.UpdatedAt = DateTime.Now;
            
            await _context.SaveChangesAsync();
            return Ok(new { message = "Visitor checked out successfully", visitor = visitor.ToResponse() });
        }

        [HttpPut("{id}/reschedule")]
        public async Task<IActionResult> RescheduleVisitor(int id, [FromBody] JsonElement requestBody)
        {
            try
            {
                Console.WriteLine($"Rescheduling visitor {id}");
                Console.WriteLine($"Request body: {requestBody}");

                var visitor = await _context.Visitors.FindAsync(id);
                if (visitor == null)
                    return NotFound(new { message = "Visitor not found" });

                // Parse the new date and time from request
                string newDateTime = "";
                if (requestBody.TryGetProperty("dateTime", out var dateTimeElement))
                {
                    if (dateTimeElement.ValueKind == JsonValueKind.String)
                    {
                        newDateTime = dateTimeElement.GetString() ?? "";
                    }
                }

                if (string.IsNullOrEmpty(newDateTime))
                {
                    return BadRequest(new { message = "dateTime is required" });
                }

                // Validate the new date/time
                if (!DateTime.TryParse(newDateTime, out var parsedDateTime))
                {
                    return BadRequest(new { message = "Invalid dateTime format" });
                }

                // Update visitor with new date/time and rescheduled status
                visitor.DateTime = parsedDateTime;
                visitor.Status = VisitorStatus.Rescheduled;
                visitor.CheckInTime = null; // Clear check-in time for rescheduled visit
                visitor.CheckOutTime = null; // Clear check-out time for rescheduled visit
                visitor.UpdatedAt = DateTime.Now;
                
                await _context.SaveChangesAsync();
                
                Console.WriteLine($"✅ Successfully rescheduled visitor {id} to {parsedDateTime}");
                return Ok(new { message = "Visitor rescheduled successfully", visitor = visitor.ToResponse() });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error rescheduling visitor {id}: {ex.Message}");
                Console.WriteLine($"❌ Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { message = "Error rescheduling visitor", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteVisitor(int id)
        {
            var visitor = await _context.Visitors.FindAsync(id);
            if (visitor == null)
                return NotFound(new { message = "Visitor not found" });
            
            _context.Visitors.Remove(visitor);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Visitor deleted successfully" });
        }

        [HttpGet("analytics")]
        public async Task<IActionResult> GetVisitorAnalytics([FromQuery] string? fromDate = null, [FromQuery] string? toDate = null)
        {
            var from = string.IsNullOrEmpty(fromDate) ? DateTime.Today.AddDays(-30) : DateTime.Parse(fromDate);
            var to = string.IsNullOrEmpty(toDate) ? DateTime.Today.AddDays(1) : DateTime.Parse(toDate);
            
            var visitors = await _context.Visitors
                .Where(v => v.DateTime >= from && v.DateTime < to)
                .ToListAsync();
            
            var analytics = new
            {
                totalVisitors = visitors.Count,
                approvedVisitors = visitors.Count(v => v.Status == VisitorStatus.Approved || v.Status == VisitorStatus.CheckedIn || v.Status == VisitorStatus.CheckedOut),
                rejectedVisitors = visitors.Count(v => v.Status == VisitorStatus.Rejected),
                pendingVisitors = visitors.Count(v => v.Status == VisitorStatus.AwaitingApproval),
                checkedInVisitors = visitors.Count(v => v.Status == VisitorStatus.CheckedIn),
                checkedOutVisitors = visitors.Count(v => v.Status == VisitorStatus.CheckedOut),
                mostVisitedStaff = visitors
                    .GroupBy(v => v.WhomToMeet)
                    .OrderByDescending(g => g.Count())
                    .Take(5)
                    .Select(g => new { staff = g.Key, count = g.Count() }),
                topPurposes = visitors
                    .GroupBy(v => v.PurposeOfVisit)
                    .OrderByDescending(g => g.Count())
                    .Take(5)
                    .Select(g => new { purpose = g.Key, count = g.Count() }),
                dailyStats = visitors
                    .GroupBy(v => v.DateTime.Date)
                    .OrderBy(g => g.Key)
                    .Select(g => new { date = g.Key.ToString("yyyy-MM-dd"), count = g.Count() })
            };
            
            return Ok(analytics);
        }

        [HttpDelete("clear-all")]
        public async Task<IActionResult> ClearAllVisitors()
        {
            try
            {
                var visitors = await _context.Visitors.ToListAsync();
                int count = visitors.Count;
                
                _context.Visitors.RemoveRange(visitors);
                await _context.SaveChangesAsync();
                
                return Ok(new { message = $"Successfully cleared {count} visitors from database", count = count });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }
    }
}
