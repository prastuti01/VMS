using VehicleManagement.Domain.Entities;

namespace VehicleManagement.Application.Interfaces;

// Handles database operations for vehicles
public interface IVehicleRepository
{
    // Gets vehicle by its ID
    Task<Vehicle?> GetByIdAsync(int vehicleId);

    // Adds a new vehicle record
    Task AddAsync(Vehicle vehicle);
    
    Task UpdateAsync(Vehicle vehicle);

    // Deletes an existing vehicle record
    Task DeleteAsync(Vehicle vehicle);
}