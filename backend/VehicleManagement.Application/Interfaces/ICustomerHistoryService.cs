using VehicleManagement.Application.DTOs.CustomerHistory;

namespace VehicleManagement.Application.Interfaces;

public interface ICustomerHistoryService
{
    Task<CustomerHistoryDto> GetByCustomerIdAsync(int customerId);
    Task<CustomerHistoryDto> GetByUserIdAsync(Guid userId);
}