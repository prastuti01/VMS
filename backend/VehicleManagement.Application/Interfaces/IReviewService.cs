using VehicleManagement.Application.DTOs.Review;

namespace VehicleManagement.Application.Interfaces;

public interface IReviewService
{
    Task<ReviewDto> SubmitReviewAsync(Guid userId, SubmitReviewDto dto);
    Task<ReviewDto> GetReviewAsync(int reviewId);
    Task<List<ReviewDto>> GetMyReviewsAsync(Guid userId);
    Task<List<ReviewDto>> GetAllReviewsAsync();
    Task<List<ReviewDto>> GetRecentReviewsAsync(int limit = 10);
    Task<ReviewDto> UpdateReviewAsync(int reviewId, SubmitReviewDto dto);
    Task DeleteReviewAsync(int reviewId);
}
