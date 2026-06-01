
﻿using Microsoft.EntityFrameworkCore;
using VehicleManagement.Application.Interfaces;
using VehicleManagement.Domain.Entities;
using VehicleManagement.Infrastructure.Data;

namespace VehicleManagement.Infrastructure.Repositories;

public class PartRepository : IPartRepository
{
    private readonly AppDbContext _db;

    public PartRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<Part>> GetAllAsync()
    {
        return await _db.Parts
            .Include(p => p.Vendor)
            .OrderBy(p => p.Name)
            .ToListAsync();
    }

    public async Task<List<Part>> GetByVendorIdAsync(int vendorId)
    {
        return await _db.Parts
            .Include(p => p.Vendor)
            .Where(p => p.VendorId == vendorId)
            .OrderBy(p => p.Name)
            .ToListAsync();
    }

    public async Task<Part?> GetByIdAsync(int partId)
    {
        return await _db.Parts
            .Include(p => p.Vendor)
            .FirstOrDefaultAsync(p => p.PartId == partId);
    }

    public async Task<bool> VendorExistsAsync(int vendorId)
    {
        return await _db.Vendors.AnyAsync(v => v.VendorId == vendorId);
    }

    public async Task<bool> PartExistsAsync(
    string name,
    int vendorId,
    int? ignorePartId = null)
    {
        var normalizedName = name.Trim().ToLower();

        return await _db.Parts.AnyAsync(p =>
            p.Name.ToLower() == normalizedName &&
            p.VendorId == vendorId &&
            (!ignorePartId.HasValue || p.PartId != ignorePartId.Value));
    }
    public async Task AddAsync(Part part)
    {
        await _db.Parts.AddAsync(part);
        await _db.SaveChangesAsync();
    }

    public async Task UpdateAsync(Part part)
    {
        _db.Parts.Update(part);
        await _db.SaveChangesAsync();
    }

    public async Task DeleteAsync(Part part)
    {
        _db.Parts.Remove(part);
        await _db.SaveChangesAsync();
    }

    public async Task<bool> HasLinkedRecordsAsync(int partId)
    {
        var hasPurchaseItems = await _db.PurchaseItems.AnyAsync(i => i.PartId == partId);
        var hasSalesItems = await _db.SalesItems.AnyAsync(i => i.PartId == partId);

        return hasPurchaseItems || hasSalesItems;
    }
}

