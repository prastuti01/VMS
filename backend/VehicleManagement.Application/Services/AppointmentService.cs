using Microsoft.AspNetCore.Identity;
using VehicleManagement.Application.DTOs.Appointment;
using VehicleManagement.Application.Interfaces;
using VehicleManagement.Domain.Entities;

namespace VehicleManagement.Application.Services;

public class AppointmentService : IAppointmentService
{
    private readonly IAppointmentRepository _appointmentRepo;
    private readonly ICustomerRepository _customerRepo;
    private readonly IVehicleRepository _vehicleRepo;
    private readonly UserManager<User> _userManager;

    public AppointmentService(
        IAppointmentRepository appointmentRepo,
        ICustomerRepository customerRepo,
        IVehicleRepository vehicleRepo,
        UserManager<User> userManager)
    {
        _appointmentRepo = appointmentRepo;
        _customerRepo = customerRepo;
        _vehicleRepo = vehicleRepo;
        _userManager = userManager;
    }

    public async Task<AppointmentDto> BookAppointmentAsync(Guid userId, BookAppointmentDto dto)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString())
            ?? throw new KeyNotFoundException("User not found.");

        var customer = await _customerRepo.GetByUserIdAsync(userId)
            ?? throw new KeyNotFoundException("Customer profile not found.");

        var vehicle = await _vehicleRepo.GetByIdAsync(dto.VehicleId)
            ?? throw new KeyNotFoundException("Vehicle not found.");

        if (vehicle.CustomerId != customer.CustomerId)
            throw new UnauthorizedAccessException("Vehicle does not belong to this customer.");

        if (dto.AppointmentDate <= DateTime.Now)
            throw new ArgumentException("Appointment date must be in the future.");

        var appointment = new Appointment
        {
            CustomerId = customer.CustomerId,
            VehicleId = dto.VehicleId,
            AppointmentDate = DateTime.SpecifyKind(dto.AppointmentDate, DateTimeKind.Utc),
            Status = dto.Status
        };

        await _appointmentRepo.AddAsync(appointment);
        return MapToDto(appointment);
    }

    public async Task<AppointmentDto> GetAppointmentAsync(int appointmentId)
    {
        var appointment = await _appointmentRepo.GetByIdAsync(appointmentId)
            ?? throw new KeyNotFoundException("Appointment not found.");

        return MapToDto(appointment);
    }

    public async Task<List<AppointmentDto>> GetMyAppointmentsAsync(Guid userId)
    {
        var customer = await _customerRepo.GetByUserIdAsync(userId)
            ?? throw new KeyNotFoundException("Customer profile not found.");

        var appointments = await _appointmentRepo.GetByCustomerIdAsync(customer.CustomerId);
        return appointments.Select(MapToDto).ToList();
    }

    public async Task<List<AppointmentDto>> GetAllAppointmentsAsync()
    {
        var appointments = await _appointmentRepo.GetAllAsync();
        return appointments.Select(MapToDto).ToList();
    }

    public async Task<AppointmentDto> UpdateAppointmentAsync(int appointmentId, BookAppointmentDto dto)
    {
        var appointment = await _appointmentRepo.GetByIdAsync(appointmentId)
            ?? throw new KeyNotFoundException("Appointment not found.");

        if (dto.AppointmentDate <= DateTime.Now)
            throw new ArgumentException("Appointment date must be in the future.");

        appointment.AppointmentDate = DateTime.SpecifyKind(dto.AppointmentDate, DateTimeKind.Utc);
        appointment.Status = dto.Status;

        await _appointmentRepo.UpdateAsync(appointment);
        return MapToDto(appointment);
    }

    public async Task CancelAppointmentAsync(int appointmentId)
    {
        var appointment = await _appointmentRepo.GetByIdAsync(appointmentId)
            ?? throw new KeyNotFoundException("Appointment not found.");

        await _appointmentRepo.DeleteAsync(appointmentId);
    }

    private AppointmentDto MapToDto(Appointment appointment)
    {
        return new AppointmentDto
        {
            AppointmentId = appointment.AppointmentId,
            CustomerId = appointment.CustomerId,
            VehicleId = appointment.VehicleId,
            AppointmentDate = appointment.AppointmentDate,
            Status = appointment.Status,
            CustomerName = appointment.Customer?.User?.UserName ?? string.Empty,
            VehicleName = (appointment.Vehicle?.Brand ?? string.Empty) + " " + (appointment.Vehicle?.Model ?? string.Empty)
        };
    }
}
