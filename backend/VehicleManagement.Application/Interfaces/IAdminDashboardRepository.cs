using VehicleManagement.Domain.Entities;

namespace VehicleManagement.Application.Interfaces;

public interface IAdminDashboardRepository
{
    Task<int> CountCustomersAsync(CancellationToken cancellationToken = default);
    Task<int> CountStaffAsync(CancellationToken cancellationToken = default);
    Task<int> CountVendorsAsync(CancellationToken cancellationToken = default);
    Task<int> CountPartsAsync(CancellationToken cancellationToken = default);
    Task<int> CountPendingAppointmentsAsync(CancellationToken cancellationToken = default);
    Task<int> CountPendingPartRequestsAsync(CancellationToken cancellationToken = default);
    Task<decimal> SumSalesAsync(DateTime fromInclusive, DateTime toExclusive, CancellationToken cancellationToken = default);
    Task<decimal> SumPurchasesAsync(DateTime fromInclusive, DateTime toExclusive, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Part>> GetLowStockPartsAsync(int threshold, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<SalesInvoice>> GetOverdueCreditInvoicesAsync(DateTime cutoffDate, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<SalesInvoice>> GetRecentSalesAsync(int take, CancellationToken cancellationToken = default);
}
