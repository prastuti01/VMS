using VehicleManagement.Application.DTOs.CustomerReport;
using VehicleManagement.Application.Interfaces;

namespace VehicleManagement.Application.Services;

public class CustomerReportService : ICustomerReportService
{
    private readonly ICustomerReportRepository _repository;

    public CustomerReportService(ICustomerReportRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<CustomerSpendingReportDto>> GetAllCustomerSpendingAsync()
    {
        return await _repository.GetAllCustomerSpendingAsync();
    }

    public async Task<List<CustomerSpendingReportDto>> GetHighSpendersAsync()
    {
        return await _repository.GetHighSpendersAsync();
    }

    public async Task<List<CustomerSpendingReportDto>> GetLowSpendersAsync()
    {
        return await _repository.GetLowSpendersAsync();
    }
}
