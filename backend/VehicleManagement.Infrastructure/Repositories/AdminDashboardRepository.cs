using Microsoft.EntityFrameworkCore;
using VehicleManagement.Application.Interfaces;
using VehicleManagement.Domain.Entities;
using VehicleManagement.Infrastructure.Data;

namespace VehicleManagement.Infrastructure.Repositories;

public class AdminDashboardRepository : IAdminDashboardRepository
{
    private readonly AppDbContext _db;

    public AdminDashboardRepository(AppDbContext db) => _db = db;

    public async Task<int> CountCustomersAsync(
        CancellationToken cancellationToken = default) =>
        await _db.Customers.CountAsync(cancellationToken);

    public async Task<int> CountStaffAsync(
        CancellationToken cancellationToken = default) =>
        await _db.Staff.CountAsync(cancellationToken);

    public async Task<int> CountVendorsAsync(
        CancellationToken cancellationToken = default) =>
        await _db.Vendors.CountAsync(cancellationToken);

    public async Task<int> CountPartsAsync(
        CancellationToken cancellationToken = default) =>
        await _db.Parts.CountAsync(cancellationToken);

    public async Task<int> CountPendingAppointmentsAsync(
        CancellationToken cancellationToken = default) =>
        await _db.Appointments
            .CountAsync(appointment => appointment.Status.ToLower() == "pending", cancellationToken);

    public async Task<int> CountPendingPartRequestsAsync(
        CancellationToken cancellationToken = default) =>
        await _db.PartRequests
            .CountAsync(request => request.Status.ToLower() == "pending", cancellationToken);

    public async Task<decimal> SumSalesAsync(
        DateTime fromInclusive,
        DateTime toExclusive,
        CancellationToken cancellationToken = default) =>
        await _db.SalesInvoices
            .Where(sale => sale.SaleDate >= fromInclusive && sale.SaleDate < toExclusive)
            .SumAsync(sale => (decimal?)sale.FinalAmount, cancellationToken) ?? 0;

    public async Task<decimal> SumPurchasesAsync(
        DateTime fromInclusive,
        DateTime toExclusive,
        CancellationToken cancellationToken = default) =>
        await _db.PurchaseInvoices
            .Where(purchase => purchase.PurchaseDate >= fromInclusive && purchase.PurchaseDate < toExclusive)
            .SumAsync(purchase => (decimal?)purchase.TotalAmount, cancellationToken) ?? 0;

    public async Task<IReadOnlyList<Part>> GetLowStockPartsAsync(
        int threshold,
        CancellationToken cancellationToken = default) =>
        await _db.Parts
            .Include(part => part.Vendor)
            .Where(part => part.StockQuantity < threshold)
            .OrderBy(part => part.StockQuantity)
            .ThenBy(part => part.Name)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<SalesInvoice>> GetOverdueCreditInvoicesAsync(
        DateTime cutoffDate,
        CancellationToken cancellationToken = default) =>
        await _db.SalesInvoices
            .Include(sale => sale.Customer)
                .ThenInclude(customer => customer.User)
            .Include(sale => sale.Payments)
            .Where(sale => sale.SaleDate <= cutoffDate)
            .Where(sale =>
                sale.PaymentStatus.ToLower() != "paid" ||
                sale.Payments.Sum(payment => payment.AmountPaid) < sale.FinalAmount)
            .OrderBy(sale => sale.SaleDate)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<SalesInvoice>> GetRecentSalesAsync(
        int take,
        CancellationToken cancellationToken = default) =>
        await _db.SalesInvoices
            .Include(sale => sale.Customer)
                .ThenInclude(customer => customer.User)
            .OrderByDescending(sale => sale.SaleDate)
            .Take(take)
            .ToListAsync(cancellationToken);
}
