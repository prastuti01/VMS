using System.ComponentModel.DataAnnotations;

namespace VehicleManagement.Application.DTOs.Customer;

// DTO used to update basic customer details
public class UpdateCustomerDto
{
    // Updated phone number (required)
    [Required] 
    public string Phone { get; set; } = string.Empty;

    // Updated address (required)
    [Required] 
    public string Address { get; set; } = string.Empty;
}