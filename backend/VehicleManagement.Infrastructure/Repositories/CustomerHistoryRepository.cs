using Microsoft.EntityFrameworkCore;
using VehicleManagement.Application.Interfaces;
using VehicleManagement.Domain.Entities;
using VehicleManagement.Infrastructure.Data;

namespace VehicleManagement.Infrastructure.Repositories;

public class CustomerHistoryRepository : ICustomerHistoryRepository
{
    private readonly AppDbContext _db;

    public CustomerHistoryRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<Customer?> GetCustomerWithVehiclesByCustomerIdAsync(int customerId)
    {
        return await _db.Customers
            .Include(c => c.User)
            .Include(c => c.Vehicles)
            .FirstOrDefaultAsync(c => c.CustomerId == customerId);
    }

    public async Task<Customer?> GetCustomerWithVehiclesByUserIdAsync(Guid userId)
    {
        return await _db.Customers
            .Include(c => c.User)
            .Include(c => c.Vehicles)
            .FirstOrDefaultAsync(c => c.UserId == userId);
    }

    public async Task<List<SalesInvoice>> GetSalesInvoicesByCustomerIdAsync(int customerId)
    {
        return await _db.SalesInvoices
            .Include(s => s.SalesItems)
                .ThenInclude(i => i.Part)
            .Include(s => s.Payments)
            .Where(s => s.CustomerId == customerId)
            .OrderByDescending(s => s.SaleDate)
            .ToListAsync();
    }

    public async Task<List<Appointment>> GetAppointmentsByCustomerIdAsync(int customerId)
    {
        return await _db.Appointments
            .Include(a => a.Vehicle)
            .Where(a => a.CustomerId == customerId)
            .OrderByDescending(a => a.AppointmentDate)
            .ToListAsync();
    }
}