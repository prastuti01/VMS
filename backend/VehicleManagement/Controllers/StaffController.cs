using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VehicleManagement.Application.DTOs.Staff;
using VehicleManagement.Application.Interfaces;

namespace VehicleManagement.Controllers;

// Both Staff and Admin roles can reach these endpoints
[ApiController]
[Route("api/staff")]
[Authorize(Roles = "Staff,Admin")]
public class StaffController : ControllerBase
{
    private readonly IStaffService _staffService;

    public StaffController(IStaffService staffService) =>
        _staffService = staffService;

    // Identifies which staff member is performing the action
    private Guid CurrentUserId =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // Allows a staff member to manually register a customer on their own
    [HttpPost("customers")]
    public async Task<IActionResult> RegisterCustomer(
        [FromBody] StaffRegisterCustomerDto dto)
    {
        var customer = await _staffService.RegisterCustomerAsync(CurrentUserId, dto);
        return Ok(customer);
    }



    [HttpGet("customers")]
    public async Task<IActionResult> GetCustomers()
    {
        var customers =
            await _staffService.GetCustomersAsync();

        return Ok(customers);
    }
}

