using System;
using System.Collections.Generic;
using System.Text;
using VehicleManagement.Application.DTOs.FinancialReport;

namespace VehicleManagement.Application.Interfaces
{
    public interface IFinancialReportService
    {
        Task<FinancialReportDto> GetFinancialReportAsync(string filter);
    }
}
