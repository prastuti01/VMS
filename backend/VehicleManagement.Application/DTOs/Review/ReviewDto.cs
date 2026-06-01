namespace VehicleManagement.Application.DTOs.Review;

public class ReviewDto
{
    public int ReviewId { get; set; }
    public int CustomerId { get; set; }
    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public string CustomerName { get; set; } = string.Empty;
}
