using Microsoft.EntityFrameworkCore;
using VehicleManagement.Application.DTOs.CustomerReport;
using VehicleManagement.Application.Interfaces;
using VehicleManagement.Infrastructure.Data;

namespace VehicleManagement.Infrastructure.Repositories;

public class CustomerReportRepository : ICustomerReportRepository
{
    private readonly AppDbContext _context;

    public CustomerReportRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<CustomerSpendingReportDto>> GetAllCustomerSpendingAsync()
    {
        var report = await _context.SalesInvoices
            .GroupBy(si => new { si.CustomerId, si.Customer.User.Email })
            .Select(g => new CustomerSpendingReportDto
            {
                CustomerId = g.Key.CustomerId,
                CustomerName = g.Key.Email ?? "Unknown",
                TotalSpent = g.Sum(si => si.FinalAmount),
                Category = DetermineCategory(g.Sum(si => si.FinalAmount))
            })
            .OrderByDescending(x => x.TotalSpent)
            .ToListAsync();

        return report;
    }

    public async Task<List<CustomerSpendingReportDto>> GetHighSpendersAsync()
    {
        var highSpenders = await _context.SalesInvoices
            .GroupBy(si => new { si.CustomerId, si.Customer.User.Email })
            .Select(g => new CustomerSpendingReportDto
            {
                CustomerId = g.Key.CustomerId,
                CustomerName = g.Key.Email ?? "Unknown",
                TotalSpent = g.Sum(si => si.FinalAmount),
                Category = DetermineCategory(g.Sum(si => si.FinalAmount))
            })
            .Where(x => x.TotalSpent > 5000)
            .OrderByDescending(x => x.TotalSpent)
            .ToListAsync();

        return highSpenders;
    }

    public async Task<List<CustomerSpendingReportDto>> GetLowSpendersAsync()
    {
        var lowSpenders = await _context.SalesInvoices
            .GroupBy(si => new { si.CustomerId, si.Customer.User.Email })
            .Select(g => new CustomerSpendingReportDto
            {
                CustomerId = g.Key.CustomerId,
                CustomerName = g.Key.Email ?? "Unknown",
                TotalSpent = g.Sum(si => si.FinalAmount),
                Category = DetermineCategory(g.Sum(si => si.FinalAmount))
            })
            .Where(x => x.TotalSpent < 2000)
            .OrderBy(x => x.TotalSpent)
            .ToListAsync();

        return lowSpenders;
    }

    private string DetermineCategory(decimal totalSpent)
    {
        if (totalSpent > 5000)
            return "High Spender";
        else if (totalSpent < 2000)
            return "Low Spender";
        else
            return "Normal";
    }
}
