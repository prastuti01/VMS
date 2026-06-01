using System.ComponentModel.DataAnnotations;

namespace VehicleManagement.Application.DTOs.Auth;

// DTO used for user login input
public class LoginDto
{
    // User's email (must be valid and cannot be empty)
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    // User's password (required to authenticate)
    [Required]
    public string Password { get; set; } = string.Empty;
}