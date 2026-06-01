using VehicleManagement.Application.DTOs.SalesInvoices;

namespace VehicleManagement.Application.Interfaces;

public interface ISalesInvoiceService
{
    Task<List<SalesInvoiceDto>> GetAllAsync();
    Task<SalesInvoiceDto> GetByIdAsync(int saleId);
    Task<List<SalesInvoiceDto>> GetByCustomerIdAsync(int customerId);
    Task<SalesInvoiceDto> CreateAsync(
        CreateSalesInvoiceDto dto,
        Guid currentUserId,
        bool canUseProvidedStaffId);
    Task<EmailInvoiceResultDto> EmailToCustomerAsync(int saleId);
}
