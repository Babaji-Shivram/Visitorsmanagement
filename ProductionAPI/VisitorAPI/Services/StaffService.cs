using AutoMapper;
using Microsoft.EntityFrameworkCore;
using VisitorManagement.API.Data;
using VisitorManagement.API.Models.DTOs;
using VisitorManagement.API.Models.Entities;

namespace VisitorManagement.API.Services
{
    public class StaffService : IStaffService
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;

        public StaffService(ApplicationDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<List<StaffMemberDto>> GetAllStaffMembersAsync()
        {
            var staffMembers = await _context.StaffMembers
                .Include(s => s.Location)
                .Include(s => s.Visitors)
                .ToListAsync();

            return _mapper.Map<List<StaffMemberDto>>(staffMembers);
        }

        public async Task<StaffMemberDto?> GetStaffMemberByIdAsync(int id)
        {
            var staffMember = await _context.StaffMembers
                .Include(s => s.Location)
                .Include(s => s.Visitors)
                .FirstOrDefaultAsync(s => s.Id == id);

            return staffMember != null ? _mapper.Map<StaffMemberDto>(staffMember) : null;
        }

        public async Task<List<StaffMemberDto>> GetStaffMembersByLocationAsync(int locationId)
        {
            var staffMembers = await _context.StaffMembers
                .Include(s => s.Location)
                .Include(s => s.Visitors)
                .Where(s => s.LocationId == locationId && s.IsActive)
                .ToListAsync();

            return _mapper.Map<List<StaffMemberDto>>(staffMembers);
        }

        public async Task<List<StaffMemberDto>> GetActiveStaffMembersAsync()
        {
            var staffMembers = await _context.StaffMembers
                .Include(s => s.Location)
                .Include(s => s.Visitors)
                .Where(s => s.IsActive)
                .ToListAsync();

            return _mapper.Map<List<StaffMemberDto>>(staffMembers);
        }

        public async Task<StaffMemberDto?> CreateStaffMemberAsync(CreateStaffMemberDto request)
        {
            var staffMember = _mapper.Map<StaffMember>(request);

            _context.StaffMembers.Add(staffMember);
            await _context.SaveChangesAsync();

            return _mapper.Map<StaffMemberDto>(staffMember);
        }

        public async Task<bool> UpdateStaffMemberAsync(int id, UpdateStaffMemberDto request)
        {
            var staffMember = await _context.StaffMembers.FindAsync(id);
            if (staffMember == null)
                return false;

            _mapper.Map(request, staffMember);
            staffMember.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteStaffMemberAsync(int id)
        {
            var staffMember = await _context.StaffMembers.FindAsync(id);
            if (staffMember == null)
                return false;

            _context.StaffMembers.Remove(staffMember);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ToggleStaffMemberStatusAsync(int id)
        {
            var staffMember = await _context.StaffMembers.FindAsync(id);
            if (staffMember == null)
                return false;

            staffMember.IsActive = !staffMember.IsActive;
            staffMember.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }
    }
}
