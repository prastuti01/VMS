using Microsoft.AspNetCore.Identity;
using VehicleManagement.Application.DTOs.Review;
using VehicleManagement.Application.Interfaces;
using VehicleManagement.Domain.Entities;

namespace VehicleManagement.Application.Services;

public class ReviewService : IReviewService
{
    private readonly IReviewRepository _reviewRepo;
    private readonly ICustomerRepository _customerRepo;
    private readonly UserManager<User> _userManager;

    public ReviewService(
        IReviewRepository reviewRepo,
        ICustomerRepository customerRepo,
        UserManager<User> userManager)
    {
        _reviewRepo = reviewRepo;
        _customerRepo = customerRepo;
        _userManager = userManager;
    }

    public async Task<ReviewDto> SubmitReviewAsync(Guid userId, SubmitReviewDto dto)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString())
            ?? throw new KeyNotFoundException("User not found.");

        var customer = await _customerRepo.GetByUserIdAsync(userId)
            ?? throw new KeyNotFoundException("Customer profile not found.");

        if (dto.Rating < 1 || dto.Rating > 5)
            throw new ArgumentException("Rating must be between 1 and 5.");

        if (string.IsNullOrWhiteSpace(dto.Comment))
            throw new ArgumentException("Comment cannot be empty.");

        var review = new Review
        {
            CustomerId = customer.CustomerId,
            Rating = dto.Rating,
            Comment = dto.Comment.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        await _reviewRepo.AddAsync(review);
        return MapToDto(review);
    }

    public async Task<ReviewDto> GetReviewAsync(int reviewId)
    {
        var review = await _reviewRepo.GetByIdAsync(reviewId)
            ?? throw new KeyNotFoundException("Review not found.");

        return MapToDto(review);
    }

    public async Task<List<ReviewDto>> GetMyReviewsAsync(Guid userId)
    {
        var customer = await _customerRepo.GetByUserIdAsync(userId)
            ?? throw new KeyNotFoundException("Customer profile not found.");

        var reviews = await _reviewRepo.GetByCustomerIdAsync(customer.CustomerId);
        return reviews.Select(MapToDto).ToList();
    }

    public async Task<List<ReviewDto>> GetAllReviewsAsync()
    {
        var reviews = await _reviewRepo.GetAllAsync();
        return reviews.Select(MapToDto).ToList();
    }

    public async Task<List<ReviewDto>> GetRecentReviewsAsync(int limit = 10)
    {
        var reviews = await _reviewRepo.GetRecentReviewsAsync(limit);
        return reviews.Select(MapToDto).ToList();
    }

    public async Task<ReviewDto> UpdateReviewAsync(int reviewId, SubmitReviewDto dto)
    {
        var review = await _reviewRepo.GetByIdAsync(reviewId)
            ?? throw new KeyNotFoundException("Review not found.");

        if (dto.Rating < 1 || dto.Rating > 5)
            throw new ArgumentException("Rating must be between 1 and 5.");

        if (string.IsNullOrWhiteSpace(dto.Comment))
            throw new ArgumentException("Comment cannot be empty.");

        review.Rating = dto.Rating;
        review.Comment = dto.Comment.Trim();

        await _reviewRepo.UpdateAsync(review);
        return MapToDto(review);
    }

    public async Task DeleteReviewAsync(int reviewId)
    {
        var review = await _reviewRepo.GetByIdAsync(reviewId)
            ?? throw new KeyNotFoundException("Review not found.");

        await _reviewRepo.DeleteAsync(reviewId);
    }

    private ReviewDto MapToDto(Review review)
    {
        return new ReviewDto
        {
            ReviewId = review.ReviewId,
            CustomerId = review.CustomerId,
            Rating = review.Rating,
            Comment = review.Comment,
            CreatedAt = review.CreatedAt,
            CustomerName = review.Customer?.User?.UserName ?? string.Empty
        };
    }
}
