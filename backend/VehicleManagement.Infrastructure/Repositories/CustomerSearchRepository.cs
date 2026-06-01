using Microsoft.EntityFrameworkCore;
using VehicleManagement.Application.Interfaces;
using VehicleManagement.Domain.Entities;
using VehicleManagement.Infrastructure.Data;

namespace VehicleManagement.Infrastructure.Repositories
{
    public class CustomerSearchRepository : ICustomerSearchRepository
    {
        private readonly AppDbContext _context;

        public CustomerSearchRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<Customer>> SearchCustomersAsync(string query)
        {
            query = query.Trim().ToLower();

            return await _context.Customers
                .Include(c => c.User)
                .Include(c => c.Vehicles)
                .Where(c =>
                    c.CustomerId.ToString() == query ||
                    c.Phone.ToLower().Contains(query) ||
                    c.User.Email.ToLower().Contains(query) ||
                    c.User.UserName.ToLower().Contains(query) ||
                    c.Vehicles.Any(v =>
                        v.VehicleNumber.ToLower().Contains(query)))
                .ToListAsync();
        }
    }
}
