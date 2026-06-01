using Microsoft.EntityFrameworkCore;
using VehicleManagement.Application.Interfaces;
using VehicleManagement.Domain.Entities;
using VehicleManagement.Infrastructure.Data;

namespace VehicleManagement.Infrastructure.Repositories;

public class ReviewRepository : IReviewRepository
{
    private readonly AppDbContext _context;

    public ReviewRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Review?> GetByIdAsync(int reviewId)
    {
        return await _context.Reviews
            .Include(r => r.Customer)
            .FirstOrDefaultAsync(r => r.ReviewId == reviewId);
    }

    public async Task<List<Review>> GetByCustomerIdAsync(int customerId)
    {
        return await _context.Reviews
            .Include(r => r.Customer)
            .Where(r => r.CustomerId == customerId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
    }

    public async Task<List<Review>> GetAllAsync()
    {
        return await _context.Reviews
            .Include(r => r.Customer)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
    }

    public async Task<List<Review>> GetRecentReviewsAsync(int limit = 10)
    {
        return await _context.Reviews
            .Include(r => r.Customer)
            .OrderByDescending(r => r.CreatedAt)
            .Take(limit)
            .ToListAsync();
    }

    public async Task<Review> AddAsync(Review review)
    {
        _context.Reviews.Add(review);
        await _context.SaveChangesAsync();
        return review;
    }

    public async Task UpdateAsync(Review review)
    {
        _context.Reviews.Update(review);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int reviewId)
    {
        var review = await GetByIdAsync(reviewId);
        if (review != null)
        {
            _context.Reviews.Remove(review);
            await _context.SaveChangesAsync();
        }
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
