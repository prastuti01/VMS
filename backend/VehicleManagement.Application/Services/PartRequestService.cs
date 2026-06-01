using Microsoft.AspNetCore.Identity;
using VehicleManagement.Application.DTOs.PartRequest;
using VehicleManagement.Application.Interfaces;
using VehicleManagement.Domain.Entities;

namespace VehicleManagement.Application.Services;

public class PartRequestService : IPartRequestService
{
    private readonly IPartRequestRepository _partRequestRepo;
    private readonly ICustomerRepository _customerRepo;
    private readonly UserManager<User> _userManager;

    public PartRequestService(
        IPartRequestRepository partRequestRepo,
        ICustomerRepository customerRepo,
        UserManager<User> userManager)
    {
        _partRequestRepo = partRequestRepo;
        _customerRepo = customerRepo;
        _userManager = userManager;
    }

    public async Task<PartRequestDto> CreatePartRequestAsync(Guid userId, CreatePartRequestDto dto)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString())
            ?? throw new KeyNotFoundException("User not found.");

        var customer = await _customerRepo.GetByUserIdAsync(userId)
            ?? throw new KeyNotFoundException("Customer profile not found.");

        if (string.IsNullOrWhiteSpace(dto.PartName))
            throw new ArgumentException("Part name is required.");

        if (string.IsNullOrWhiteSpace(dto.Description))
            throw new ArgumentException("Description is required.");

        var partRequest = new PartRequest
        {
            CustomerId = customer.CustomerId,
            PartName = dto.PartName,
            Description = dto.Description,
            RequestDate = DateTime.SpecifyKind(dto.RequestDate, DateTimeKind.Utc),
            Status = string.IsNullOrWhiteSpace(dto.Status) ? "Pending" : dto.Status
        };

        await _partRequestRepo.AddAsync(partRequest);
        return MapToDto(partRequest, user.UserName ?? string.Empty);
    }

    public async Task<PartRequestDto> GetPartRequestAsync(int requestId)
    {
        var partRequest = await _partRequestRepo.GetByIdAsync(requestId)
            ?? throw new KeyNotFoundException("Part request not found.");

        var user = await _userManager.FindByIdAsync(partRequest.Customer.UserId.ToString());
        return MapToDto(partRequest, user?.UserName ?? string.Empty);
    }

    public async Task<List<PartRequestDto>> GetMyPartRequestsAsync(Guid userId)
    {
        var customer = await _customerRepo.GetByUserIdAsync(userId)
            ?? throw new KeyNotFoundException("Customer profile not found.");

        var partRequests = await _partRequestRepo.GetByCustomerIdAsync(customer.CustomerId);
        var user = await _userManager.FindByIdAsync(userId.ToString());

        return partRequests.Select(pr => MapToDto(pr, user?.UserName ?? string.Empty)).ToList();
    }

    public async Task<List<PartRequestDto>> GetAllPartRequestsAsync()
    {
        var partRequests = await _partRequestRepo.GetAllAsync();

        var result = new List<PartRequestDto>();
        foreach (var pr in partRequests)
        {
            var user = await _userManager.FindByIdAsync(pr.Customer.UserId.ToString());
            result.Add(MapToDto(pr, user?.UserName ?? string.Empty));
        }

        return result;
    }

    public async Task<List<PartRequestDto>> GetPartRequestsByStatusAsync(string status)
    {
        var partRequests = await _partRequestRepo.GetByStatusAsync(status);

        var result = new List<PartRequestDto>();
        foreach (var pr in partRequests)
        {
            var user = await _userManager.FindByIdAsync(pr.Customer.UserId.ToString());
            result.Add(MapToDto(pr, user?.UserName ?? string.Empty));
        }

        return result;
    }

    public async Task<PartRequestDto> UpdatePartRequestAsync(int requestId, UpdatePartRequestDto dto)
    {
        var partRequest = await _partRequestRepo.GetByIdAsync(requestId)
            ?? throw new KeyNotFoundException("Part request not found.");

        if (string.IsNullOrWhiteSpace(dto.PartName))
            throw new ArgumentException("Part name is required.");

        if (string.IsNullOrWhiteSpace(dto.Description))
            throw new ArgumentException("Description is required.");

        partRequest.PartName = dto.PartName;
        partRequest.Description = dto.Description;
        partRequest.RequestDate = DateTime.SpecifyKind(dto.RequestDate, DateTimeKind.Utc);
        partRequest.Status = string.IsNullOrWhiteSpace(dto.Status) ? "Pending" : dto.Status;

        await _partRequestRepo.UpdateAsync(partRequest);

        var user = await _userManager.FindByIdAsync(partRequest.Customer.UserId.ToString());
        return MapToDto(partRequest, user?.UserName ?? string.Empty);
    }

    public async Task DeletePartRequestAsync(int requestId)
    {
        var partRequest = await _partRequestRepo.GetByIdAsync(requestId)
            ?? throw new KeyNotFoundException("Part request not found.");

        await _partRequestRepo.DeleteAsync(requestId);
    }

    private PartRequestDto MapToDto(PartRequest partRequest, string customerName)
    {
        return new PartRequestDto
        {
            RequestId = partRequest.RequestId,
            CustomerId = partRequest.CustomerId,
            PartName = partRequest.PartName,
            Description = partRequest.Description,
            RequestDate = partRequest.RequestDate,
            Status = partRequest.Status,
            CustomerName = customerName
        };
    }
}
