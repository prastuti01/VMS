using System;
using System.Collections.Generic;
using System.Text;

namespace VehicleManagement.Application.DTOs.FinancialReport
{
    public class FinancialReportDto
    {
        public decimal TotalRevenue { get; set; }
        public decimal TotalPurchaseCost { get; set; }
        public decimal Profit { get; set; }

        public int TotalSalesInvoices { get; set; }
        public int TotalPurchaseInvoices { get; set; }

        public List<decimal> Trend { get; set; } = new();
        public List<string> TrendLabels { get; set; } = new();


    }
}
