using Microsoft.EntityFrameworkCore;
using VehicleManagement.Application.Interfaces;
using VehicleManagement.Domain.Entities;
using VehicleManagement.Infrastructure.Data;

namespace VehicleManagement.Infrastructure.Repositories;

public class SalesInvoiceRepository : ISalesInvoiceRepository
{
    private readonly AppDbContext _db;

    public SalesInvoiceRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<SalesInvoice>> GetAllAsync()
    {
        return await BaseQuery()
            .OrderByDescending(s => s.SaleDate)
            .ToListAsync();
    }

    public async Task<SalesInvoice?> GetByIdAsync(int saleId)
    {
        return await BaseQuery()
            .FirstOrDefaultAsync(s => s.SaleId == saleId);
    }

    public async Task<List<SalesInvoice>> GetByCustomerIdAsync(int customerId)
    {
        return await BaseQuery()
            .Where(s => s.CustomerId == customerId)
            .OrderByDescending(s => s.SaleDate)
            .ToListAsync();
    }

    public async Task<Customer?> GetCustomerByIdAsync(int customerId)
    {
        return await _db.Customers
            .Include(c => c.User)
            .FirstOrDefaultAsync(c => c.CustomerId == customerId);
    }

    public async Task<bool> StaffExistsAsync(int staffId)
    {
        return await _db.Staff.AnyAsync(s => s.StaffId == staffId);
    }

    public async Task<int?> GetStaffIdByUserIdAsync(Guid userId)
    {
        return await _db.Staff
            .Where(s => s.UserId == userId)
            .Select(s => (int?)s.StaffId)
            .FirstOrDefaultAsync();
    }

    public async Task<List<Part>> GetPartsByIdsAsync(List<int> partIds)
    {
        return await _db.Parts
            .Where(p => partIds.Contains(p.PartId))
            .ToListAsync();
    }

    public async Task<SalesInvoice> CreateWithItemsStockAndPaymentAsync(
        SalesInvoice invoice,
        List<SalesItem> items,
        decimal amountPaid)
    {
        await using var transaction = await _db.Database.BeginTransactionAsync();

        try
        {
            var partIds = items.Select(i => i.PartId).Distinct().ToList();
            var parts = await _db.Parts
                .Where(p => partIds.Contains(p.PartId))
                .ToListAsync();

            foreach (var item in items)
            {
                var part = parts.FirstOrDefault(p => p.PartId == item.PartId)
                    ?? throw new KeyNotFoundException($"Part with ID {item.PartId} was not found.");

                if (part.StockQuantity < item.Quantity)
                {
                    throw new InvalidOperationException(
                        $"Insufficient stock for part '{part.Name}'. Available: {part.StockQuantity}.");
                }

                part.StockQuantity -= item.Quantity;
                invoice.SalesItems.Add(item);
            }

            if (amountPaid > 0)
            {
                invoice.Payments.Add(new Payment
                {
                    AmountPaid = amountPaid,
                    PaymentDate = DateTime.UtcNow,
                    RemainingBalance = invoice.FinalAmount - amountPaid
                });
            }

            await _db.SalesInvoices.AddAsync(invoice);
            await _db.SaveChangesAsync();

            await transaction.CommitAsync();

            return await GetByIdAsync(invoice.SaleId) ?? invoice;
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    private IQueryable<SalesInvoice> BaseQuery()
    {
        return _db.SalesInvoices
            .Include(s => s.Customer)
                .ThenInclude(c => c.User)
            .Include(s => s.Staff)
                .ThenInclude(staff => staff.User)
            .Include(s => s.SalesItems)
                .ThenInclude(i => i.Part)
            .Include(s => s.Payments);
    }
}
