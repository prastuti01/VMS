using VehicleManagement.Domain.Entities;

namespace VehicleManagement.Application.Interfaces;

public interface IAppointmentRepository
{
    Task<Appointment?> GetByIdAsync(int appointmentId);
    Task<List<Appointment>> GetByCustomerIdAsync(int customerId);
    Task<List<Appointment>> GetAllAsync();
    Task<Appointment> AddAsync(Appointment appointment);
    Task UpdateAsync(Appointment appointment);
    Task DeleteAsync(int appointmentId);
    Task SaveChangesAsync();
}
