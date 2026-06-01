using VehicleManagement.Application.DTOs.Appointment;

namespace VehicleManagement.Application.Interfaces;

public interface IAppointmentService
{
    Task<AppointmentDto> BookAppointmentAsync(Guid userId, BookAppointmentDto dto);
    Task<AppointmentDto> GetAppointmentAsync(int appointmentId);
    Task<List<AppointmentDto>> GetMyAppointmentsAsync(Guid userId);
    Task<List<AppointmentDto>> GetAllAppointmentsAsync();
    Task<AppointmentDto> UpdateAppointmentAsync(int appointmentId, BookAppointmentDto dto);
    Task CancelAppointmentAsync(int appointmentId);
}
