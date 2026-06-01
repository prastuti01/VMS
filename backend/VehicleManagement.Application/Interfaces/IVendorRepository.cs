using VehicleManagement.Domain.Entities;

namespace VehicleManagement.Application.Interfaces;

public interface IVendorRepository
{
    Task<List<Vendor>> GetAllAsync();
    Task<Vendor?> GetByIdAsync(int vendorId);
    Task AddAsync(Vendor vendor);
    Task UpdateAsync(Vendor vendor);
    Task DeleteAsync(Vendor vendor);
    Task<bool> EmailExistsAsync(string email, int? ignoreVendorId = null);
}