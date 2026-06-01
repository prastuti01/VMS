using System;
using System.Collections.Generic;
using System.Text;

namespace VehicleManagement.Application.Interfaces
{
    public interface IFinancialReportRepository
    {
        Task<decimal> GetTotalRevenueAsync(string filter);
        Task<decimal> GetTotalPurchaseCostAsync(string filter);
        Task<int> GetTotalSalesInvoicesAsync(string filter);
        Task<int> GetTotalPurchaseInvoicesAsync(string filter);

        Task<(List<decimal> Values, List<string> Labels)> GetRevenueTrendAsync(string filter);
    }
}
