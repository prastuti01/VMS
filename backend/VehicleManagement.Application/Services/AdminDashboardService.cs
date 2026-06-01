using VehicleManagement.Application.DTOs.Admin;
using VehicleManagement.Application.Interfaces;
using VehicleManagement.Domain.Entities;

namespace VehicleManagement.Application.Services;

public class AdminDashboardService : IAdminDashboardService
{
    private readonly IAdminDashboardRepository _dashboardRepo;
    private readonly IReminderService _reminderService;

    public AdminDashboardService(
        IAdminDashboardRepository dashboardRepo,
        IReminderService reminderService)
    {
        _dashboardRepo = dashboardRepo;
        _reminderService = reminderService;
    }

    public async Task<AdminDashboardDto> GetDashboardAsync(
        CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        var today = now.Date;
        var tomorrow = today.AddDays(1);
        var monthStart = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var nextMonth = monthStart.AddMonths(1);
        var yearStart = new DateTime(now.Year, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        var nextYear = yearStart.AddYears(1);

        var lowStock = await _reminderService.GetLowStockPartsAsync(
            cancellationToken: cancellationToken);
        var overdueCredits = await _reminderService.GetOverdueCreditRemindersAsync(
            cancellationToken: cancellationToken);
        var recentSales = await _dashboardRepo.GetRecentSalesAsync(5, cancellationToken);

        return new AdminDashboardDto
        {
            GeneratedAt = now,
            TotalCustomers = await _dashboardRepo.CountCustomersAsync(cancellationToken),
            TotalStaff = await _dashboardRepo.CountStaffAsync(cancellationToken),
            TotalVendors = await _dashboardRepo.CountVendorsAsync(cancellationToken),
            TotalParts = await _dashboardRepo.CountPartsAsync(cancellationToken),
            LowStockPartCount = lowStock.Count,
            PendingAppointmentCount = await _dashboardRepo.CountPendingAppointmentsAsync(cancellationToken),
            PendingPartRequestCount = await _dashboardRepo.CountPendingPartRequestsAsync(cancellationToken),
            OverdueCreditCount = overdueCredits.Count,
            OverdueCreditAmount = overdueCredits.Sum(c => c.RemainingBalance),
            Sales = new PeriodAmountDto
            {
                Today = await _dashboardRepo.SumSalesAsync(today, tomorrow, cancellationToken),
                ThisMonth = await _dashboardRepo.SumSalesAsync(monthStart, nextMonth, cancellationToken),
                ThisYear = await _dashboardRepo.SumSalesAsync(yearStart, nextYear, cancellationToken)
            },
            Purchases = new PeriodAmountDto
            {
                Today = await _dashboardRepo.SumPurchasesAsync(today, tomorrow, cancellationToken),
                ThisMonth = await _dashboardRepo.SumPurchasesAsync(monthStart, nextMonth, cancellationToken),
                ThisYear = await _dashboardRepo.SumPurchasesAsync(yearStart, nextYear, cancellationToken)
            },
            LowStockParts = lowStock.ToList(),
            OverdueCredits = overdueCredits.ToList(),
            RecentSales = recentSales.Select(MapRecentSale).ToList()
        };
    }

    private static RecentSaleDto MapRecentSale(SalesInvoice sale) =>
        new()
        {
            SaleId = sale.SaleId,
            CustomerId = sale.CustomerId,
            CustomerEmail = sale.Customer?.User?.Email ?? string.Empty,
            SaleDate = sale.SaleDate,
            FinalAmount = sale.FinalAmount,
            PaymentStatus = sale.PaymentStatus
        };
}
