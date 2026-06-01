using VehicleManagement.Application.DTOs.CustomerReport;

namespace VehicleManagement.Application.Interfaces;

public interface ICustomerReportRepository
{
    Task<List<CustomerSpendingReportDto>> GetAllCustomerSpendingAsync();
    Task<List<CustomerSpendingReportDto>> GetHighSpendersAsync();
    Task<List<CustomerSpendingReportDto>> GetLowSpendersAsync();
}
