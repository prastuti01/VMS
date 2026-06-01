using System.ComponentModel.DataAnnotations;

namespace VehicleManagement.Application.DTOs.Staff;

public class UpdateStaffProfileDto
{
    [EmailAddress]
    public string? Email { get; set; }

    public string? PhoneNumber { get; set; }

    public string? Position { get; set; }

    [Range(0, double.MaxValue)]
    public decimal? Salary { get; set; }

    public DateTime? JoinedDate { get; set; }

    [RegularExpression("^(Admin|Staff)$")]
    public string? Role { get; set; }
}
