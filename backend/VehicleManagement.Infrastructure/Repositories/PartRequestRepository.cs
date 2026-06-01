using Microsoft.EntityFrameworkCore;
using VehicleManagement.Application.Interfaces;
using VehicleManagement.Domain.Entities;
using VehicleManagement.Infrastructure.Data;

namespace VehicleManagement.Infrastructure.Repositories;

public class PartRequestRepository : IPartRequestRepository
{
    private readonly AppDbContext _context;

    public PartRequestRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PartRequest> AddAsync(PartRequest partRequest)
    {
        _context.PartRequests.Add(partRequest);
        await _context.SaveChangesAsync();
        return partRequest;
    }

    public async Task<PartRequest?> GetByIdAsync(int requestId)
    {
        return await _context.PartRequests
            .Include(pr => pr.Customer)
            .ThenInclude(c => c.User)
            .FirstOrDefaultAsync(pr => pr.RequestId == requestId);
    }

    public async Task<List<PartRequest>> GetAllAsync()
    {
        return await _context.PartRequests
            .Include(pr => pr.Customer)
            .ThenInclude(c => c.User)
            .ToListAsync();
    }

    public async Task<List<PartRequest>> GetByCustomerIdAsync(int customerId)
    {
        return await _context.PartRequests
            .Include(pr => pr.Customer)
            .ThenInclude(c => c.User)
            .Where(pr => pr.CustomerId == customerId)
            .ToListAsync();
    }

    public async Task<List<PartRequest>> GetByStatusAsync(string status)
    {
        return await _context.PartRequests
            .Include(pr => pr.Customer)
            .ThenInclude(c => c.User)
            .Where(pr => pr.Status == status)
            .ToListAsync();
    }

    public async Task<PartRequest> UpdateAsync(PartRequest partRequest)
    {
        _context.PartRequests.Update(partRequest);
        await _context.SaveChangesAsync();
        return partRequest;
    }

    public async Task DeleteAsync(int requestId)
    {
        var partRequest = await _context.PartRequests.FindAsync(requestId);
        if (partRequest != null)
        {
            _context.PartRequests.Remove(partRequest);
            await _context.SaveChangesAsync();
        }
    }
}
