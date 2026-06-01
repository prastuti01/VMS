using VehicleManagement.Application.Interfaces;
using VehicleManagement.Domain.Entities;
using VehicleManagement.Infrastructure.Data;

namespace VehicleManagement.Infrastructure.Repositories;

public class VehicleRepository : IVehicleRepository
{
    private readonly AppDbContext _db;
    public VehicleRepository(AppDbContext db) => _db = db;

    // Fetch a single vehicle by its ID — returns null if not found
    public async Task<Vehicle?> GetByIdAsync(int vehicleId) =>
        await _db.Vehicles.FindAsync(vehicleId);

    // Register a new vehicle and save right away
    public async Task AddAsync(Vehicle vehicle)
    {
        await _db.Vehicles.AddAsync(vehicle);
        await _db.SaveChangesAsync();
    }
    
    public async Task UpdateAsync(Vehicle vehicle)
    {
        _db.Vehicles.Update(vehicle);
        await _db.SaveChangesAsync();
    }

    // Remove the vehicle from the database permanently
    public async Task DeleteAsync(Vehicle vehicle)
    {
        _db.Vehicles.Remove(vehicle);
        await _db.SaveChangesAsync();
    }
}