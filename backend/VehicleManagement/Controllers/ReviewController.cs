using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VehicleManagement.Application.DTOs.Review;
using VehicleManagement.Application.Interfaces;

namespace VehicleManagement.Controllers;

[ApiController]
[Route("api/reviews")]
public class ReviewController : ControllerBase
{
    private readonly IReviewService _reviewService;

    public ReviewController(IReviewService reviewService)
    {
        _reviewService = reviewService;
    }

    private Guid CurrentUserId =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    /// <summary>
    /// Submit a new review (Customer only)
    /// </summary>
    [HttpPost("submit")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> SubmitReview([FromBody] SubmitReviewDto dto)
    {
        var review = await _reviewService.SubmitReviewAsync(CurrentUserId, dto);
        return CreatedAtAction(nameof(GetReview), new { id = review.ReviewId }, review);
    }

    /// <summary>
    /// Get a specific review by ID
    /// </summary>
    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetReview(int id)
    {
        var review = await _reviewService.GetReviewAsync(id);
        return Ok(review);
    }

    /// <summary>
    /// Get all reviews submitted by the current customer
    /// </summary>
    [HttpGet("my-reviews")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> GetMyReviews()
    {
        var reviews = await _reviewService.GetMyReviewsAsync(CurrentUserId);
        return Ok(reviews);
    }

    /// <summary>
    /// Get all reviews (Admin only)
    /// </summary>
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAllReviews()
    {
        var reviews = await _reviewService.GetAllReviewsAsync();
        return Ok(reviews);
    }

    /// <summary>
    /// Get recent reviews (public endpoint for displaying on homepage/dashboard)
    /// </summary>
    [HttpGet("recent")]
    [AllowAnonymous]
    public async Task<IActionResult> GetRecentReviews([FromQuery] int limit = 10)
    {
        var reviews = await _reviewService.GetRecentReviewsAsync(limit);
        return Ok(reviews);
    }

    /// <summary>
    /// Update a review (Customer can only update their own, Admin can update any)
    /// </summary>
    [HttpPut("{id:int}")]
    [Authorize]
    public async Task<IActionResult> UpdateReview(int id, [FromBody] SubmitReviewDto dto)
    {
        var review = await _reviewService.UpdateReviewAsync(id, dto);
        return Ok(review);
    }

    /// <summary>
    /// Delete a review (Customer can only delete their own, Admin can delete any)
    /// </summary>
    [HttpDelete("{id:int}")]
    [Authorize]
    public async Task<IActionResult> DeleteReview(int id)
    {
        await _reviewService.DeleteReviewAsync(id);
        return NoContent();
    }
}
