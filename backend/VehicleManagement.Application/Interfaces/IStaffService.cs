using VehicleManagement.Application.DTOs.Customer;
using VehicleManagement.Application.DTOs.Staff;

namespace VehicleManagement.Application.Interfaces;

// Handles staff-specific operations
public interface IStaffService
{
    Task<IReadOnlyList<StaffProfileDto>> GetAllStaffAsync(
        CancellationToken cancellationToken = default);

    Task<StaffProfileDto> GetStaffByIdAsync(
        int staffId,
        CancellationToken cancellationToken = default);

    Task<StaffProfileDto> GetMyProfileAsync(
        Guid userId,
        CancellationToken cancellationToken = default);

    Task<StaffProfileDto> CreateStaffAsync(
        CreateStaffDto dto,
        CancellationToken cancellationToken = default);

    Task<StaffProfileDto> UpdateStaffAsync(
        int staffId,
        UpdateStaffProfileDto dto,
        CancellationToken cancellationToken = default);

    Task<StaffProfileDto> UpdateMyProfileAsync(
        Guid userId,
        UpdateMyStaffProfileDto dto,
        CancellationToken cancellationToken = default);

    Task DeleteStaffAsync(
        int staffId,
        CancellationToken cancellationToken = default);

    // Allows staff to register a new customer
    Task<CustomerProfileDto> RegisterCustomerAsync(Guid staffId, StaffRegisterCustomerDto dto);

    Task<IEnumerable<CustomerProfileDto>> GetCustomersAsync();
}
