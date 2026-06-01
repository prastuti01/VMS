using System;
using System.Collections.Generic;
using System.Text;

namespace VehicleManagement.Infrastructure.Repositories
{
    using Microsoft.EntityFrameworkCore;
    using VehicleManagement.Application.Interfaces;
    using VehicleManagement.Domain.Entities;
    using VehicleManagement.Infrastructure.Data;

    public class FinancialReportRepository : IFinancialReportRepository
    {
        private readonly AppDbContext _context;

        public FinancialReportRepository(AppDbContext context)
        {
            _context = context;
        }

        private IQueryable<SalesInvoice> FilterSales(string filter)
        {
            var query = _context.SalesInvoices.AsQueryable();

            var now = DateTime.UtcNow;

            if (filter == "daily")
            {
                var today = DateTime.SpecifyKind(now.Date, DateTimeKind.Utc);
                var tomorrow = today.AddDays(1);

                query = query.Where(x => x.SaleDate >= today && x.SaleDate < tomorrow);
            }
            else if (filter == "monthly")
            {
                var startOfMonth = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
                var nextMonth = startOfMonth.AddMonths(1);

                query = query.Where(x => x.SaleDate >= startOfMonth && x.SaleDate < nextMonth);
            }
            else if (filter == "yearly")
            {
                var startOfYear = new DateTime(now.Year, 1, 1, 0, 0, 0, DateTimeKind.Utc);
                var nextYear = startOfYear.AddYears(1);

                query = query.Where(x => x.SaleDate >= startOfYear && x.SaleDate < nextYear);
            }

            return query;
        }

        private IQueryable<PurchaseInvoice> FilterPurchase(string filter)
        {
            var query = _context.PurchaseInvoices.AsQueryable();

            var now = DateTime.UtcNow;

            if (filter == "daily")
            {
                var today = DateTime.SpecifyKind(now.Date, DateTimeKind.Utc);
                var tomorrow = today.AddDays(1);

                query = query.Where(x => x.PurchaseDate >= today && x.PurchaseDate < tomorrow);
            }
            else if (filter == "monthly")
            {
                var startOfMonth = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
                var nextMonth = startOfMonth.AddMonths(1);

                query = query.Where(x => x.PurchaseDate >= startOfMonth && x.PurchaseDate < nextMonth);
            }
            else if (filter == "yearly")
            {
                var startOfYear = new DateTime(now.Year, 1, 1, 0, 0, 0, DateTimeKind.Utc);
                var nextYear = startOfYear.AddYears(1);

                query = query.Where(x => x.PurchaseDate >= startOfYear && x.PurchaseDate < nextYear);
            }

            return query;
        }

        public async Task<decimal> GetTotalRevenueAsync(string filter)
        {
            return await FilterSales(filter)
                .SumAsync(x => (decimal?)x.FinalAmount) ?? 0;
        }

        public async Task<decimal> GetTotalPurchaseCostAsync(string filter)
        {
            return await FilterPurchase(filter)
                .SumAsync(x => (decimal?)x.TotalAmount) ?? 0;
        }

        public async Task<int> GetTotalSalesInvoicesAsync(string filter)
        {
            return await FilterSales(filter).CountAsync();
        }

        public async Task<int> GetTotalPurchaseInvoicesAsync(string filter)
        {
            return await FilterPurchase(filter).CountAsync();
        }

        public async Task<(List<decimal> Values, List<string> Labels)> GetRevenueTrendAsync(string filter)
        {
            var now = DateTime.UtcNow;

            if (filter == "daily")
            {
                // Last 7 days, revenue per day
                var start = DateTime.SpecifyKind(now.Date.AddDays(-6), DateTimeKind.Utc);
                var data = await _context.SalesInvoices
                    .Where(x => x.SaleDate >= start)
                    .GroupBy(x => x.SaleDate.Date)
                    .Select(g => new { Date = g.Key, Total = g.Sum(x => (decimal?)x.FinalAmount) ?? 0 })
                    .OrderBy(x => x.Date)
                    .ToListAsync();

                var labels = Enumerable.Range(0, 7)
                    .Select(i => start.AddDays(i))
                    .Select(d => d.ToString("ddd"))   // Mon, Tue...
                    .ToList();

                var values = Enumerable.Range(0, 7)
                    .Select(i => start.AddDays(i))
                    .Select(d => data.FirstOrDefault(x => x.Date == d)?.Total ?? 0)
                    .ToList();

                return (values, labels);
            }
            else if (filter == "monthly")
            {
                // Last 12 months, revenue per month
                var start = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc).AddMonths(-11);
                var data = await _context.SalesInvoices
                    .Where(x => x.SaleDate >= start)
                    .GroupBy(x => new { x.SaleDate.Year, x.SaleDate.Month })
                    .Select(g => new { g.Key.Year, g.Key.Month, Total = g.Sum(x => (decimal?)x.FinalAmount) ?? 0 })
                    .OrderBy(x => x.Year).ThenBy(x => x.Month)
                    .ToListAsync();

                var labels = Enumerable.Range(0, 12)
                    .Select(i => start.AddMonths(i))
                    .Select(d => d.ToString("MMM"))   
                    .ToList();

                var values = Enumerable.Range(0, 12)
                    .Select(i => start.AddMonths(i))
                    .Select(d => data.FirstOrDefault(x => x.Year == d.Year && x.Month == d.Month)?.Total ?? 0)
                    .ToList();

                return (values, labels);
            }
            else 
            {
                var startOfYear = new DateTime(now.Year, 1, 1, 0, 0, 0, DateTimeKind.Utc);
                var data = await _context.SalesInvoices
                    .Where(x => x.SaleDate >= startOfYear)
                    .GroupBy(x => x.SaleDate.Month)
                    .Select(g => new { Month = g.Key, Total = g.Sum(x => (decimal?)x.FinalAmount) ?? 0 })
                    .OrderBy(x => x.Month)
                    .ToListAsync();

                var labels = Enumerable.Range(1, 12)
                    .Select(m => new DateTime(now.Year, m, 1).ToString("MMM"))
                    .ToList();

                var values = Enumerable.Range(1, 12)
                    .Select(m => data.FirstOrDefault(x => x.Month == m)?.Total ?? 0)
                    .ToList();

                return (values, labels);
            }
        }
    }
}
