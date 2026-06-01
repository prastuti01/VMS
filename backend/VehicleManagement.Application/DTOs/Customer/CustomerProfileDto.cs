namespace VehicleManagement.Application.DTOs.Customer;

// DTO used to display customer profile details
public class CustomerProfileDto
{
    // Unique customer ID
    public int CustomerId { get; set; }

    // Linked user ID
    public Guid UserId { get; set; }

    // Customer's email
    public string Email { get; set; } = string.Empty;

    // Customer's phone number
    public string Phone { get; set; } = string.Empty;

    // Customer's address
    public string Address { get; set; } = string.Empty;

    // Account creation date
    public DateTime CreatedAt { get; set; }

    // List of vehicles owned by the customer
    public List<VehicleDto> Vehicles { get; set; } = new();
}