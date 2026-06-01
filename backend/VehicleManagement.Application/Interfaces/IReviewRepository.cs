using VehicleManagement.Domain.Entities;

namespace VehicleManagement.Application.Interfaces;

public interface IReviewRepository
{
    Task<Review?> GetByIdAsync(int reviewId);
    Task<List<Review>> GetByCustomerIdAsync(int customerId);
    Task<List<Review>> GetAllAsync();
    Task<List<Review>> GetRecentReviewsAsync(int limit = 10);
    Task<Review> AddAsync(Review review);
    Task UpdateAsync(Review review);
    Task DeleteAsync(int reviewId);
    Task SaveChangesAsync();
}
