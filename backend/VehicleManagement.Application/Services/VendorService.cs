using VehicleManagement.Application.DTOs.Vendors;
using VehicleManagement.Application.Interfaces;
using VehicleManagement.Domain.Entities;

namespace VehicleManagement.Application.Services;

public class VendorService : IVendorService
{
    private readonly IVendorRepository _vendorRepository;

    public VendorService(IVendorRepository vendorRepository)
    {
        _vendorRepository = vendorRepository;
    }

    public async Task<List<VendorDto>> GetAllAsync()
    {
        var vendors = await _vendorRepository.GetAllAsync();
        return vendors.Select(MapToDto).ToList();
    }

    public async Task<VendorDto> GetByIdAsync(int vendorId)
    {
        var vendor = await _vendorRepository.GetByIdAsync(vendorId)
            ?? throw new KeyNotFoundException("Vendor not found.");

        return MapToDto(vendor);
    }

    public async Task<VendorDto> CreateAsync(CreateVendorDto dto)
    {
        if (await _vendorRepository.EmailExistsAsync(dto.Email))
            throw new InvalidOperationException("A vendor with this email already exists.");

        var vendor = new Vendor
        {
            Name = dto.Name.Trim(),
            Phone = dto.Phone.Trim(),
            Email = dto.Email.Trim(),
            Address = dto.Address.Trim()
        };

        await _vendorRepository.AddAsync(vendor);
        return MapToDto(vendor);
    }

    public async Task<VendorDto> UpdateAsync(int vendorId, UpdateVendorDto dto)
    {
        var vendor = await _vendorRepository.GetByIdAsync(vendorId)
            ?? throw new KeyNotFoundException("Vendor not found.");

        if (await _vendorRepository.EmailExistsAsync(dto.Email, vendorId))
            throw new InvalidOperationException("A vendor with this email already exists.");

        vendor.Name = dto.Name.Trim();
        vendor.Phone = dto.Phone.Trim();
        vendor.Email = dto.Email.Trim();
        vendor.Address = dto.Address.Trim();

        await _vendorRepository.UpdateAsync(vendor);
        return MapToDto(vendor);
    }

    public async Task DeleteAsync(int vendorId)
    {
        var vendor = await _vendorRepository.GetByIdAsync(vendorId)
            ?? throw new KeyNotFoundException("Vendor not found.");

        if (vendor.Parts.Any() || vendor.PurchaseInvoices.Any())
        {
            throw new InvalidOperationException(
                "This vendor cannot be deleted because parts or purchase invoices are linked to this vendor.");
        }

        await _vendorRepository.DeleteAsync(vendor);
    }

    private static VendorDto MapToDto(Vendor vendor)
    {
        return new VendorDto
        {
            VendorId = vendor.VendorId,
            Name = vendor.Name,
            Phone = vendor.Phone,
            Email = vendor.Email,
            Address = vendor.Address,
            PartsCount = vendor.Parts.Count,
            PurchaseInvoiceCount = vendor.PurchaseInvoices.Count
        };
    }
}