using VehicleManagement.Application.DTOs.CustomerSearch;
using VehicleManagement.Application.Interfaces;

namespace VehicleManagement.Application.Services
{
    public class CustomerSearchService : ICustomerSearchService
    {
        private readonly ICustomerSearchRepository _repository;

        public CustomerSearchService(ICustomerSearchRepository repository)
        {
            _repository = repository;
        }

        public async Task<List<CustomerSearchDto>> SearchCustomersAsync(string query)
        {
            if (string.IsNullOrWhiteSpace(query))
                throw new ArgumentException("Search query is required.");

            var customers = await _repository.SearchCustomersAsync(query);

            return customers.Select(c => new CustomerSearchDto
            {
                CustomerId = c.CustomerId,
                CustomerName = c.User?.UserName ?? string.Empty,
                Phone = c.Phone,
                Email = c.User?.Email ?? string.Empty,
                Address = c.Address,
                VehicleNumber = c.Vehicles
                    .Select(v => v.VehicleNumber)
                    .FirstOrDefault() ?? string.Empty
            }).ToList();
        }
    }
}
