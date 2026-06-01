using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VehicleManagement.Application.DTOs.PartRequest;
using VehicleManagement.Application.Interfaces;

namespace VehicleManagement.Controllers;

[ApiController]
[Route("api/part-requests")]
public class PartRequestController : ControllerBase
{
    private readonly IPartRequestService _partRequestService;

    public PartRequestController(IPartRequestService partRequestService)
    {
        _partRequestService = partRequestService;
    }

    private Guid CurrentUserId =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    /// <summary>
    /// Create a new part request for a customer
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> CreatePartRequest([FromBody] CreatePartRequestDto dto)
    {
        var partRequest = await _partRequestService.CreatePartRequestAsync(CurrentUserId, dto);
        return CreatedAtAction(nameof(GetPartRequest), new { id = partRequest.RequestId }, partRequest);
    }

    /// <summary>
    /// Get a specific part request by ID
    /// </summary>
    [HttpGet("{id:int}")]
    [Authorize(Roles = "Customer,Admin")]
    public async Task<IActionResult> GetPartRequest(int id)
    {
        var partRequest = await _partRequestService.GetPartRequestAsync(id);
        return Ok(partRequest);
    }

    /// <summary>
    /// Get all part requests for the current customer
    /// </summary>
    [HttpGet("my-requests")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> GetMyPartRequests()
    {
        var partRequests = await _partRequestService.GetMyPartRequestsAsync(CurrentUserId);
        return Ok(partRequests);
    }

    /// <summary>
    /// Get all part requests (Admin only)
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAllPartRequests()
    {
        var partRequests = await _partRequestService.GetAllPartRequestsAsync();
        return Ok(partRequests);
    }

    /// <summary>
    /// Get part requests by status (Admin only)
    /// </summary>
    [HttpGet("status/{status}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetPartRequestsByStatus(string status)
    {
        var partRequests = await _partRequestService.GetPartRequestsByStatusAsync(status);
        return Ok(partRequests);
    }

    /// <summary>
    /// Update a part request (Admin only)
    /// </summary>
    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdatePartRequest(int id, [FromBody] UpdatePartRequestDto dto)
    {
        var partRequest = await _partRequestService.UpdatePartRequestAsync(id, dto);
        return Ok(partRequest);
    }

    /// <summary>
    /// Delete a part request (Admin only)
    /// </summary>
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeletePartRequest(int id)
    {
        await _partRequestService.DeletePartRequestAsync(id);
        return NoContent();
    }
}
