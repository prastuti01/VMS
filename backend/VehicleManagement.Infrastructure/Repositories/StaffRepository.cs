using Microsoft.EntityFrameworkCore;
using VehicleManagement.Application.Interfaces;
using VehicleManagement.Domain.Entities;
using VehicleManagement.Infrastructure.Data;

namespace VehicleManagement.Infrastructure.Repositories;

public class StaffRepository : IStaffRepository
{
    private readonly AppDbContext _db;

    public StaffRepository(AppDbContext db) => _db = db;

    public async Task<IReadOnlyList<Staff>> GetAllAsync(
        CancellationToken cancellationToken = default) =>
        await _db.Staff
            .Include(staff => staff.User)
            .OrderBy(staff => staff.StaffId)
            .ToListAsync(cancellationToken);

    public async Task<Staff?> GetByIdAsync(
        int staffId,
        CancellationToken cancellationToken = default) =>
        await _db.Staff
            .Include(staff => staff.User)
            .FirstOrDefaultAsync(staff => staff.StaffId == staffId, cancellationToken);

    public async Task<Staff?> GetByUserIdAsync(
        Guid userId,
        CancellationToken cancellationToken = default) =>
        await _db.Staff
            .Include(staff => staff.User)
            .FirstOrDefaultAsync(staff => staff.UserId == userId, cancellationToken);

    public async Task AddAsync(
        Staff staff,
        CancellationToken cancellationToken = default)
    {
        await _db.Staff.AddAsync(staff, cancellationToken);
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(
        Staff staff,
        CancellationToken cancellationToken = default)
    {
        _db.Staff.Update(staff);
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(
        Staff staff,
        CancellationToken cancellationToken = default)
    {
        _db.Staff.Remove(staff);
        await _db.SaveChangesAsync(cancellationToken);
    }
}
