using VehicleManagement.Application.DTOs.CustomerReport;

namespace VehicleManagement.Application.Interfaces;

public interface ICustomerReportService
{
    Task<List<CustomerSpendingReportDto>> GetAllCustomerSpendingAsync();
    Task<List<CustomerSpendingReportDto>> GetHighSpendersAsync();
    Task<List<CustomerSpendingReportDto>> GetLowSpendersAsync();
}
