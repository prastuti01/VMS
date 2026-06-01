using Microsoft.EntityFrameworkCore;
using VehicleManagement.Application.Interfaces;
using VehicleManagement.Domain.Entities;
using VehicleManagement.Infrastructure.Data;

namespace VehicleManagement.Infrastructure.Repositories;

public class VendorRepository : IVendorRepository
{
    private readonly AppDbContext _db;

    public VendorRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<Vendor>> GetAllAsync()
    {
        return await _db.Vendors
            .Include(v => v.Parts)
            .Include(v => v.PurchaseInvoices)
            .OrderBy(v => v.Name)
            .ToListAsync();
    }

    public async Task<Vendor?> GetByIdAsync(int vendorId)
    {
        return await _db.Vendors
            .Include(v => v.Parts)
            .Include(v => v.PurchaseInvoices)
            .FirstOrDefaultAsync(v => v.VendorId == vendorId);
    }

    public async Task AddAsync(Vendor vendor)
    {
        await _db.Vendors.AddAsync(vendor);
        await _db.SaveChangesAsync();
    }

    public async Task UpdateAsync(Vendor vendor)
    {
        _db.Vendors.Update(vendor);
        await _db.SaveChangesAsync();
    }

    public async Task DeleteAsync(Vendor vendor)
    {
        _db.Vendors.Remove(vendor);
        await _db.SaveChangesAsync();
    }

    public async Task<bool> EmailExistsAsync(string email, int? ignoreVendorId = null)
    {
        var normalizedEmail = email.Trim().ToLower();

        return await _db.Vendors.AnyAsync(v =>
            v.Email.ToLower() == normalizedEmail &&
            (!ignoreVendorId.HasValue || v.VendorId != ignoreVendorId.Value));
    }
}