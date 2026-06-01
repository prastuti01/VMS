namespace VehicleManagement.Application.DTOs.Auth;

// DTO returned after successful login/register
public class AuthResponseDto
{
    // JWT token used for authentication
    public string Token { get; set; } = string.Empty;

    // Logged-in user's email
    public string Email { get; set; } = string.Empty;

    // User role (e.g., Admin, Customer)
    public string Role { get; set; } = string.Empty;

    // Unique ID of the user
    public Guid UserId { get; set; }

    // Linked customer ID (if user is a customer)
    public int CustomerId { get; set; }
}