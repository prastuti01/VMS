namespace VehicleManagement.Application.DTOs.PartRequest;

public class PartRequestDto
{
    public int RequestId { get; set; }
    public int CustomerId { get; set; }
    public required string PartName { get; set; }
    public required string Description { get; set; }
    public DateTime RequestDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
}
