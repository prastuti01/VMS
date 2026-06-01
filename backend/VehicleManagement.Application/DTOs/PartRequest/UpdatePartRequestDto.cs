namespace VehicleManagement.Application.DTOs.PartRequest;

public class UpdatePartRequestDto
{
    public required string PartName { get; set; }
    public required string Description { get; set; }
    public DateTime RequestDate { get; set; }
    public string Status { get; set; } = "Pending";
}
