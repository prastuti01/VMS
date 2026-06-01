using VehicleManagement.Application.DTOs.Customer;

namespace VehicleManagement.Application.Interfaces;

// Handles customer-related business logic
public interface ICustomerService
{
    // Retrieves customer profile using user ID
    Task<CustomerProfileDto> GetProfileAsync(Guid userId);

    // Updates customer profile details
    Task<CustomerProfileDto> UpdateProfileAsync(Guid userId, UpdateCustomerDto dto);
    
    Task DeleteAccountAsync(Guid userId);

    // Adds a new vehicle for the customer
    Task<VehicleDto> AddVehicleAsync(Guid userId, AddVehicleDto dto);
    
    Task<VehicleDto> UpdateVehicleAsync(Guid userId, int vehicleId, AddVehicleDto dto);

    // Deletes a specific vehicle of the customer
    Task DeleteVehicleAsync(Guid userId, int vehicleId);
    
}