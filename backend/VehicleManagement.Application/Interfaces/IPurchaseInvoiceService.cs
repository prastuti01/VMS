using VehicleManagement.Application.DTOs.PurchaseInvoices;

namespace VehicleManagement.Application.Interfaces;

public interface IPurchaseInvoiceService
{
    Task<List<PurchaseInvoiceDto>> GetAllAsync();
    Task<PurchaseInvoiceDto> GetByIdAsync(int purchaseId);
    Task<List<PurchaseInvoiceDto>> GetByVendorIdAsync(int vendorId);
    Task<PurchaseInvoiceDto> CreateAsync(CreatePurchaseInvoiceDto dto);
}