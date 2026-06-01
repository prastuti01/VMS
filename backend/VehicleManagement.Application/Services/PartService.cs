using System.Globalization;
using VehicleManagement.Application.DTOs.Parts;
using VehicleManagement.Application.Interfaces;
using VehicleManagement.Domain.Entities;


namespace VehicleManagement.Application.Services;

public class PartService : IPartService
{
    private readonly IPartRepository _partRepository;

    public PartService(IPartRepository partRepository)
    {
        _partRepository = partRepository;
    }

    public async Task<List<PartDto>> GetAllAsync()
    {
        var parts = await _partRepository.GetAllAsync();

        return parts.Select(MapToDto).ToList();
    }

    public async Task<List<PartDto>> GetByVendorIdAsync(int vendorId)
    {
        if (!await _partRepository.VendorExistsAsync(vendorId))
        {
            throw new KeyNotFoundException("Vendor not found.");
        }

        var parts = await _partRepository.GetByVendorIdAsync(vendorId);

        return parts.Select(MapToDto).ToList();
    }

    public async Task<PartDto> GetByIdAsync(int partId)
    {
        var part = await _partRepository.GetByIdAsync(partId)
            ?? throw new KeyNotFoundException("Part not found.");

        return MapToDto(part);
    }

    public async Task<PartDto> CreateAsync(CreatePartDto dto)
    {
        if (!await _partRepository.VendorExistsAsync(dto.VendorId))
        {
            throw new KeyNotFoundException("Vendor not found.");
        }


        if (await _partRepository.PartExistsAsync(dto.Name, dto.VendorId))
        {
            throw new InvalidOperationException(
                "This part already exists for this vendor.");
        }
        var part = new Part
        {
            Name = dto.Name.Trim(),
            Description = dto.Description?.Trim() ?? string.Empty,
            Category = CultureInfo.CurrentCulture.TextInfo
            .ToTitleCase(dto.Category.Trim().ToLower()),
            Price = dto.Price,
            StockQuantity = dto.StockQuantity,
            VendorId = dto.VendorId
        };

        await _partRepository.AddAsync(part);

        var savedPart = await _partRepository.GetByIdAsync(part.PartId)
            ?? part;

        return MapToDto(savedPart);
    }

    public async Task<PartDto> UpdateAsync(int partId, UpdatePartDto dto)
    {
        var part = await _partRepository.GetByIdAsync(partId)
            ?? throw new KeyNotFoundException("Part not found.");

        if (!await _partRepository.VendorExistsAsync(dto.VendorId))
        {
            throw new KeyNotFoundException("Vendor not found.");
        }

        if (await _partRepository.PartExistsAsync(
            dto.Name,
            dto.VendorId,
            partId))
            {
                throw new InvalidOperationException(
                    "This part already exists for this vendor.");
             }

        part.Name = dto.Name.Trim();
        part.Description = dto.Description?.Trim() ?? string.Empty;
        part.Category = CultureInfo.CurrentCulture.TextInfo
        .ToTitleCase(dto.Category.Trim().ToLower());
        part.Price = dto.Price;
        part.StockQuantity = dto.StockQuantity;
        part.VendorId = dto.VendorId;

        await _partRepository.UpdateAsync(part);

        var updatedPart = await _partRepository.GetByIdAsync(part.PartId)
            ?? part;

        return MapToDto(updatedPart);
    }

    public async Task DeleteAsync(int partId)
    {
        var part = await _partRepository.GetByIdAsync(partId)
            ?? throw new KeyNotFoundException("Part not found.");

        if (await _partRepository.HasLinkedRecordsAsync(partId))
        {
            throw new InvalidOperationException(
                "This part cannot be deleted because it is already linked with purchase or sales records.");
        }

        await _partRepository.DeleteAsync(part);
    }

    private static PartDto MapToDto(Part part)
    {
        return new PartDto
        {
            PartId = part.PartId,
            Name = part.Name,
            Description = part.Description,
            Category = part.Category,
            Price = part.Price,
            StockQuantity = part.StockQuantity,
            VendorId = part.VendorId,
            VendorName = part.Vendor?.Name ?? string.Empty
        };
    }
}
