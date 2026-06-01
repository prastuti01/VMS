using VehicleManagement.Application.DTOs.PartRequest;

namespace VehicleManagement.Application.Interfaces;

public interface IPartRequestService
{
    Task<PartRequestDto> CreatePartRequestAsync(Guid userId, CreatePartRequestDto dto);
    Task<PartRequestDto> GetPartRequestAsync(int requestId);
    Task<List<PartRequestDto>> GetMyPartRequestsAsync(Guid userId);
    Task<List<PartRequestDto>> GetAllPartRequestsAsync();
    Task<List<PartRequestDto>> GetPartRequestsByStatusAsync(string status);
    Task<PartRequestDto> UpdatePartRequestAsync(int requestId, UpdatePartRequestDto dto);
    Task DeletePartRequestAsync(int requestId);
}
