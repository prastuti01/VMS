using VehicleManagement.Application.DTOs.Parts;

namespace VehicleManagement.Application.Interfaces;

public interface IPartService
{
    Task<List<PartDto>> GetAllAsync();

    Task<List<PartDto>> GetByVendorIdAsync(int vendorId);

    Task<PartDto> GetByIdAsync(int partId);

    Task<PartDto> CreateAsync(CreatePartDto dto);

    Task<PartDto> UpdateAsync(int partId, UpdatePartDto dto);

    Task DeleteAsync(int partId);
}