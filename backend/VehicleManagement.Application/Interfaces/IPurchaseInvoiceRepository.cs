using VehicleManagement.Domain.Entities;

namespace VehicleManagement.Application.Interfaces;

public interface IPurchaseInvoiceRepository
{
    Task<List<PurchaseInvoice>> GetAllAsync();
    Task<PurchaseInvoice?> GetByIdAsync(int purchaseId);
    Task<List<PurchaseInvoice>> GetByVendorIdAsync(int vendorId);
    Task<bool> VendorExistsAsync(int vendorId);
    Task<List<Part>> GetPartsByIdsAsync(List<int> partIds);
    Task<PurchaseInvoice> CreateWithItemsAndStockUpdateAsync(
        PurchaseInvoice invoice,
        List<PurchaseItem> items);
}