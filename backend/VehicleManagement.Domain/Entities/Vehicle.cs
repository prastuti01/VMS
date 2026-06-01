namespace VehicleManagement.Domain.Entities;

public class Vehicle
{
    public int VehicleId { get; set; }  // Primary key
    public int CustomerId { get; set; } // Foreign key to Customer
    public string VehicleNumber { get; set; } = string.Empty; // For vehicle registration number
    public string Brand { get; set; } = string.Empty;  // For manufacturer 
    public string Model { get; set; } = string.Empty; // For vehicle model 
    public int Year { get; set; }  // Vehicle manufacturing year

    public Customer Customer { get; set; } = null!; // Navigation property to Customer
}