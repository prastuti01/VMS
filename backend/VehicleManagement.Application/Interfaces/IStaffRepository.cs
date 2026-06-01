using VehicleManagement.Domain.Entities;

namespace VehicleManagement.Application.Interfaces;

public interface IStaffRepository
{
    Task<IReadOnlyList<Staff>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<Staff?> GetByIdAsync(int staffId, CancellationToken cancellationToken = default);
    Task<Staff?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task AddAsync(Staff staff, CancellationToken cancellationToken = default);
    Task UpdateAsync(Staff staff, CancellationToken cancellationToken = default);
    Task DeleteAsync(Staff staff, CancellationToken cancellationToken = default);
}
