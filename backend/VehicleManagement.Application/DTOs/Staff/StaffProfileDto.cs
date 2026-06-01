namespace VehicleManagement.Application.DTOs.Staff;

public class StaffProfileDto
{
    public int StaffId { get; set; }
    public Guid UserId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Position { get; set; } = string.Empty;
    public decimal Salary { get; set; }
    public DateTime JoinedDate { get; set; }
    public List<string> Roles { get; set; } = new();
}
