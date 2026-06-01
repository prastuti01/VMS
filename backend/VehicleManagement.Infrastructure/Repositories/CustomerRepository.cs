using Microsoft.EntityFrameworkCore;
using VehicleManagement.Application.Interfaces;
using VehicleManagement.Domain.Entities;
using VehicleManagement.Infrastructure.Data;

namespace VehicleManagement.Infrastructure.Repositories;

public class CustomerRepository(AppDbContext db) : ICustomerRepository
{
    // Look up a customer by their linked user account, pulling in profile and vehicles
    public async Task<Customer?> GetByUserIdAsync(Guid userId) =>
        await db.Customers
            .Include(c => c.User)
            .Include(c => c.Vehicles)
            .FirstOrDefaultAsync(c => c.UserId == userId);

    // Same eager-load pattern, but searching by the customer's own ID instead
    public async Task<Customer?> GetByCustomerIdAsync(int customerId) =>
        await db.Customers
            .Include(c => c.User)
            .Include(c => c.Vehicles)
            .FirstOrDefaultAsync(c => c.CustomerId == customerId);

    // Insert a new customer and immediately persist
    public async Task AddAsync(Customer customer)
    {
        await db.Customers.AddAsync(customer);
        await db.SaveChangesAsync();
    }

    // Apply changes to an existing customer record and save
    public async Task UpdateAsync(Customer customer)
    {
        db.Customers.Update(customer);
        await db.SaveChangesAsync();
    }
    public async Task<Customer?> GetByPhoneAsync(string phone)
    {
        return await db.Customers
            .FirstOrDefaultAsync(c => c.Phone == phone);
    }

    // Remove a customer record and persist used when deleting vehicles or cleaning up orphans
    public async Task DeleteAsync(Customer customer)
    {
        db.Customers.Remove(customer);
        await db.SaveChangesAsync();
    }


    public async Task<IEnumerable<Customer>> GetAllAsync()
    {
        return await db.Customers
            .Include(c => c.User)
            .Include(c => c.Vehicles)
            .ToListAsync();
    }
}