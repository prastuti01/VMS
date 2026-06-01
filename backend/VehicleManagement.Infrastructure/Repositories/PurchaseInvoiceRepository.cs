using Microsoft.EntityFrameworkCore;
using VehicleManagement.Application.Interfaces;
using VehicleManagement.Domain.Entities;
using VehicleManagement.Infrastructure.Data;

namespace VehicleManagement.Infrastructure.Repositories;

public class PurchaseInvoiceRepository : IPurchaseInvoiceRepository
{
    private readonly AppDbContext _db;

    public PurchaseInvoiceRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<PurchaseInvoice>> GetAllAsync()
    {
        return await _db.PurchaseInvoices
            .AsNoTracking()
            .Include(invoice => invoice.Vendor)
            .Include(invoice => invoice.PurchaseItems)
                .ThenInclude(item => item.Part)
            .OrderByDescending(invoice => invoice.PurchaseDate)
            .ToListAsync();
    }

    public async Task<PurchaseInvoice?> GetByIdAsync(int purchaseId)
    {
        return await _db.PurchaseInvoices
            .AsNoTracking()
            .Include(invoice => invoice.Vendor)
            .Include(invoice => invoice.PurchaseItems)
                .ThenInclude(item => item.Part)
            .FirstOrDefaultAsync(invoice => invoice.PurchaseId == purchaseId);
    }

    public async Task<List<PurchaseInvoice>> GetByVendorIdAsync(int vendorId)
    {
        return await _db.PurchaseInvoices
            .AsNoTracking()
            .Include(invoice => invoice.Vendor)
            .Include(invoice => invoice.PurchaseItems)
                .ThenInclude(item => item.Part)
            .Where(invoice => invoice.VendorId == vendorId)
            .OrderByDescending(invoice => invoice.PurchaseDate)
            .ToListAsync();
    }

    public async Task<bool> VendorExistsAsync(int vendorId)
    {
        return await _db.Vendors.AnyAsync(vendor => vendor.VendorId == vendorId);
    }

    public async Task<List<Part>> GetPartsByIdsAsync(List<int> partIds)
    {
        return await _db.Parts
            .Where(part => partIds.Contains(part.PartId))
            .ToListAsync();
    }

    public async Task<PurchaseInvoice> CreateWithItemsAndStockUpdateAsync(
        PurchaseInvoice invoice,
        List<PurchaseItem> items)
    {
        await using var transaction = await _db.Database.BeginTransactionAsync();

        try
        {
            var partIds = items
                .Select(item => item.PartId)
                .Distinct()
                .ToList();

            var parts = await _db.Parts
                .Where(part => partIds.Contains(part.PartId))
                .ToListAsync();

            foreach (var item in items)
            {
                var part = parts.FirstOrDefault(candidate => candidate.PartId == item.PartId)
                    ?? throw new KeyNotFoundException($"Part with ID {item.PartId} was not found.");

                if (item.Quantity <= 0)
                {
                    throw new ArgumentException("Quantity must be greater than 0.");
                }

                if (item.UnitPrice <= 0)
                {
                    throw new ArgumentException("Unit price must be greater than 0.");
                }

                part.StockQuantity += item.Quantity;

                invoice.PurchaseItems.Add(item);
            }

            await _db.PurchaseInvoices.AddAsync(invoice);
            await _db.SaveChangesAsync();

            await transaction.CommitAsync();

            return await GetByIdAsync(invoice.PurchaseId) ?? invoice;
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }
}