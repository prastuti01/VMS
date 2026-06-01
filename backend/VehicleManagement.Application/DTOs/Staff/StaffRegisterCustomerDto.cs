using System.ComponentModel.DataAnnotations;
using VehicleManagement.Application.DTOs.Customer;

namespace VehicleManagement.Application.DTOs.Staff;

// DTO used by staff to register a new customer
public class StaffRegisterCustomerDto
{
    // Customer email (must be valid and required)
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    // Customer phone number (required)
    [Required(ErrorMessage = "Phone number is required.")]
    [RegularExpression(
    @"^(98|97)\d{8}$",
    ErrorMessage = "Phone number must be a valid 10-digit Nepal number."
)]
    public string Phone { get; set; } = string.Empty;

    // Customer address (optional)
    [Required(ErrorMessage = "Address is required.")]
    [StringLength(200)]
    public string Address { get; set; } = string.Empty;

    // Staff sets this password — hashed the same way as self-registration
    [Required, MinLength(8)]
    public string Password { get; set; } = string.Empty;

    // Optional vehicle details to register along with customer
    public AddVehicleDto? Vehicle { get; set; }
}