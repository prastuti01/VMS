using VehicleManagement.Application.DTOs.Admin;

namespace VehicleManagement.Application.Interfaces;

public interface IAdminDashboardService
{
    Task<AdminDashboardDto> GetDashboardAsync(CancellationToken cancellationToken = default);
}
