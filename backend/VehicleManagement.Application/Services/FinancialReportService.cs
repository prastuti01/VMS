using System;
using System.Collections.Generic;
using System.Text;
using VehicleManagement.Application.DTOs.FinancialReport;
using VehicleManagement.Application.Interfaces;

namespace VehicleManagement.Application.Services
{
    public class FinancialReportService : IFinancialReportService
    {
        private readonly IFinancialReportRepository _repo;

        public FinancialReportService(IFinancialReportRepository repo)
        {
            _repo = repo;
        }

        public async Task<FinancialReportDto> GetFinancialReportAsync(string filter)
        {
            var revenue = await _repo.GetTotalRevenueAsync(filter);
            var cost = await _repo.GetTotalPurchaseCostAsync(filter);
            var salesCount = await _repo.GetTotalSalesInvoicesAsync(filter);
            var purchaseCount = await _repo.GetTotalPurchaseInvoicesAsync(filter);
            var trend = await _repo.GetRevenueTrendAsync(filter);

            return new FinancialReportDto
            {
                TotalRevenue = revenue,
                TotalPurchaseCost = cost,
                Profit = revenue - cost,
                TotalSalesInvoices = salesCount,
                TotalPurchaseInvoices = purchaseCount,
                Trend = trend.Values,
                TrendLabels = trend.Labels
            };
        }
    }
}
