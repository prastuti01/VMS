using System.ComponentModel.DataAnnotations;

namespace VehicleManagement.Application.DTOs.Auth;

// DTO used to capture user registration details
public class RegisterDto
{
    // User's email (must be valid and cannot be empty)
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    // User's password (minimum 8 characters required)
    [Required, MinLength(8)]
    public string Password { get; set; } = string.Empty;

    // User's phone number (required field)
    [Required(ErrorMessage = "Phone number is required.")]
    [RegularExpression(
    @"^(98|97)\d{8}$",
    ErrorMessage = "Phone number must be a valid 10-digit Nepal number."
    )]
    public string Phone { get; set; } = string.Empty;

    // Optional address of the user
    [Required(ErrorMessage = "Address is required.")]
    [StringLength(200)]
    public string Address { get; set; } = string.Empty;
}