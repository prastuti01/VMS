using System;
using System.Collections.Generic;
using System.Text;
using VehicleManagement.Application.DTOs.CustomerSearch;

namespace VehicleManagement.Application.Interfaces
{
    public interface ICustomerSearchService
    {
        Task<List<CustomerSearchDto>> SearchCustomersAsync(string query);
    }
}
