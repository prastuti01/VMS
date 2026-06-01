using VehicleManagement.Domain.Entities;

namespace VehicleManagement.Application.Interfaces;

// Handles database operations for customers
public interface ICustomerRepository
{
    // Gets customer by associated user ID
    Task<Customer?> GetByUserIdAsync(Guid userId);

    // Gets customer by customer ID
    Task<Customer?> GetByCustomerIdAsync(int customerId);

    Task<Customer?> GetByPhoneAsync(string phone);

    // Adds a new customer record
    Task AddAsync(Customer customer);

    // Updates existing customer record
    Task UpdateAsync(Customer customer);

    // Removes a customer record from the database
    Task DeleteAsync(Customer customer);

    Task<IEnumerable<Customer>> GetAllAsync();
}