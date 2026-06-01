using Microsoft.EntityFrameworkCore;
using VehicleManagement.Application.Interfaces;
using VehicleManagement.Domain.Entities;
using VehicleManagement.Infrastructure.Data;

namespace VehicleManagement.Infrastructure.Repositories;

public class AppointmentRepository : IAppointmentRepository
{
    private readonly AppDbContext _context;

    public AppointmentRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Appointment?> GetByIdAsync(int appointmentId)
    {
        return await _context.Appointments
            .Include(a => a.Customer)
            .Include(a => a.Vehicle)
            .FirstOrDefaultAsync(a => a.AppointmentId == appointmentId);
    }

    public async Task<List<Appointment>> GetByCustomerIdAsync(int customerId)
    {
        return await _context.Appointments
            .Include(a => a.Customer)
            .Include(a => a.Vehicle)
            .Where(a => a.CustomerId == customerId)
            .ToListAsync();
    }

    public async Task<List<Appointment>> GetAllAsync()
    {
        return await _context.Appointments
            .Include(a => a.Customer)
            .Include(a => a.Vehicle)
            .ToListAsync();
    }

    public async Task<Appointment> AddAsync(Appointment appointment)
    {
        _context.Appointments.Add(appointment);
        await _context.SaveChangesAsync();
        return appointment;
    }

    public async Task UpdateAsync(Appointment appointment)
    {
        _context.Appointments.Update(appointment);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int appointmentId)
    {
        var appointment = await GetByIdAsync(appointmentId);
        if (appointment != null)
        {
            _context.Appointments.Remove(appointment);
            await _context.SaveChangesAsync();
        }
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
