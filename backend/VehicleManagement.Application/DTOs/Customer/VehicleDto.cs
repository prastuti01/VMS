using System.ComponentModel.DataAnnotations;

namespace VehicleManagement.Application.DTOs.Customer;

// DTO used to display vehicle details
public class VehicleDto
{
    // Unique vehicle ID
    public int VehicleId { get; set; }

    // Vehicle registration number
    public string VehicleNumber { get; set; } = string.Empty;

    // Vehicle brand (e.g., Toyota)
    public string Brand { get; set; } = string.Empty;

    // Vehicle model (e.g., Corolla)
    public string Model { get; set; } = string.Empty;

    // Manufacturing year
    public int Year { get; set; }
}

// DTO used to add a new vehicle
public class AddVehicleDto
{
    // Vehicle registration number (required)
    [Required] 
    public string VehicleNumber { get; set; } = string.Empty;

    // Vehicle brand (required)
    [Required] 
    public string Brand { get; set; } = string.Empty;

    // Vehicle model (required)
    [Required] 
    public string Model { get; set; } = string.Empty;

    // Manufacturing year (required)
    [Required] 
    public int Year { get; set; }
}