using System;
using System.Collections.Generic;
using System.Text;

namespace VehicleManagement.Application.DTOs.CustomerSearch
{
    public class CustomerSearchDto
    {
        public int CustomerId { get; set; }

        public string CustomerName { get; set; } = string.Empty;

        public string Phone { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string VehicleNumber { get; set; } = string.Empty;

        public string Address { get; set; } = string.Empty;
    }
}
