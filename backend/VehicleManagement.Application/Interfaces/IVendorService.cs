using VehicleManagement.Application.DTOs.Vendors;

namespace VehicleManagement.Application.Interfaces;

public interface IVendorService
{
    Task<List<VendorDto>> GetAllAsync();
    Task<VendorDto> GetByIdAsync(int vendorId);
    Task<VendorDto> CreateAsync(CreateVendorDto dto);
    Task<VendorDto> UpdateAsync(int vendorId, UpdateVendorDto dto);
    Task DeleteAsync(int vendorId);
}