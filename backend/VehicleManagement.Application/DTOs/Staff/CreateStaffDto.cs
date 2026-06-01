using System.ComponentModel.DataAnnotations;

namespace VehicleManagement.Application.DTOs.Staff;

public class CreateStaffDto
{
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required, MinLength(8)]
    public string Password { get; set; } = string.Empty;

    public string PhoneNumber { get; set; } = string.Empty;

    [Required]
    public string Position { get; set; } = string.Empty;

    [Range(0, double.MaxValue)]
    public decimal Salary { get; set; }

    public DateTime? JoinedDate { get; set; }

    [RegularExpression("^(Admin|Staff)$")]
    public string Role { get; set; } = "Staff";
}
