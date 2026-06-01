namespace VehicleManagement.Application.DTOs.Review;

public class SubmitReviewDto
{
    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
}
