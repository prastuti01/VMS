using VehicleManagement.Domain.Entities;

namespace VehicleManagement.Application.Interfaces;

public interface ISalesInvoiceRepository
{
    Task<List<SalesInvoice>> GetAllAsync();
    Task<SalesInvoice?> GetByIdAsync(int saleId);
    Task<List<SalesInvoice>> GetByCustomerIdAsync(int customerId);
    Task<Customer?> GetCustomerByIdAsync(int customerId);
    Task<bool> StaffExistsAsync(int staffId);
    Task<int?> GetStaffIdByUserIdAsync(Guid userId);
    Task<List<Part>> GetPartsByIdsAsync(List<int> partIds);
    Task<SalesInvoice> CreateWithItemsStockAndPaymentAsync(
        SalesInvoice invoice,
        List<SalesItem> items,
        decimal amountPaid);
}
