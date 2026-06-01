using System;
using System.Collections.Generic;
using System.Text;
using VehicleManagement.Domain.Entities;

namespace VehicleManagement.Application.Interfaces
{
    public interface ICustomerSearchRepository
    {
        Task<List<Customer>> SearchCustomersAsync(string query);
    }
}
