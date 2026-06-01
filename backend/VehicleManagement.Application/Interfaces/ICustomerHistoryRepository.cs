using VehicleManagement.Domain.Entities;

namespace VehicleManagement.Application.Interfaces;

public interface ICustomerHistoryRepository
{
    Task<Customer?> GetCustomerWithVehiclesByCustomerIdAsync(int customerId);
    Task<Customer?> GetCustomerWithVehiclesByUserIdAsync(Guid userId);
    Task<List<SalesInvoice>> GetSalesInvoicesByCustomerIdAsync(int customerId);
    Task<List<Appointment>> GetAppointmentsByCustomerIdAsync(int customerId);
}