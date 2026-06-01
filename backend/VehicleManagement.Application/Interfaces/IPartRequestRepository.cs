using VehicleManagement.Domain.Entities;

namespace VehicleManagement.Application.Interfaces;

public interface IPartRequestRepository
{
    Task<PartRequest> AddAsync(PartRequest partRequest);
    Task<PartRequest?> GetByIdAsync(int requestId);
    Task<List<PartRequest>> GetAllAsync();
    Task<List<PartRequest>> GetByCustomerIdAsync(int customerId);
    Task<List<PartRequest>> GetByStatusAsync(string status);
    Task<PartRequest> UpdateAsync(PartRequest partRequest);
    Task DeleteAsync(int requestId);
}
