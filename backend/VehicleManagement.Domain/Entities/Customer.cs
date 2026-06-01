namespace VehicleManagement.Domain.Entities;

public class Customer
{
    public int CustomerId { get; set; }           // Unique ID for each customer
    public Guid UserId { get; set; }              // Links to the user account (login credentials)
    public string Phone { get; set; } = string.Empty;   // Customer's contact number
    public string Address { get; set; } = string.Empty; // Where the customer lives
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow; // When the customer signed up

    public User User { get; set; } = null!;              // The actual user account behind this customer
    public ICollection<Vehicle> Vehicles { get; set; } = new List<Vehicle>(); // All cars owned by this customer
}