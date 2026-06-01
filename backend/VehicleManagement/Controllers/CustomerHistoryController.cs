using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VehicleManagement.Application.Interfaces;

namespace VehicleManagement.Controllers;

[ApiController]
[Route("api/customer-history")]
public class CustomerHistoryController : ControllerBase
{
    private readonly ICustomerHistoryService _customerHistoryService;

    public CustomerHistoryController(ICustomerHistoryService customerHistoryService)
    {
        _customerHistoryService = customerHistoryService;
    }

    // Public endpoint for your frontend customer-history search by ID.
    // URL: GET /api/customer-history/1
    [HttpGet("{customerId:int}")]
    [Authorize(Roles = "Staff")]
    public async Task<IActionResult> GetByCustomerId(int customerId)
    {
        var history = await _customerHistoryService.GetByCustomerIdAsync(customerId);
        return Ok(history);
    }

    // Keep this protected because it depends on logged-in customer's JWT.
    // URL: GET /api/customer-history/me
    [HttpGet("me")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> GetMyHistory()
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userIdValue))
        {
            return Unauthorized(new { message = "User ID claim is missing." });
        }

        var userId = Guid.Parse(userIdValue);
        var history = await _customerHistoryService.GetByUserIdAsync(userId);

        return Ok(history);
    }
}