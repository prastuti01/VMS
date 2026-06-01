using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VehicleManagement.Application.DTOs.Customer;
using VehicleManagement.Application.Interfaces;

namespace VehicleManagement.Controllers;

// All endpoints here are locked to logged-in customers only
[ApiController]
[Route("api/customers")]
[Authorize(Roles = "Customer")]
public class CustomerController : ControllerBase
{
    private readonly ICustomerService _customerService;

    public CustomerController(ICustomerService customerService) =>
        _customerService = customerService;

    // Pulls the logged-in user's ID from their JWT claims — used by every action below
    private Guid CurrentUserId =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // Returns the current customer's profile information
    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        var profile = await _customerService.GetProfileAsync(CurrentUserId);
        return Ok(profile);
    }

    // Lets the customer update their own profile details
    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateCustomerDto dto)
    {
        var updated = await _customerService.UpdateProfileAsync(CurrentUserId, dto);
        return Ok(updated);
    }

    // Registers a new vehicle under the logged-in customer's account
    [HttpPost("vehicles")]
    public async Task<IActionResult> AddVehicle([FromBody] AddVehicleDto dto)
    {
        var vehicle = await _customerService.AddVehicleAsync(CurrentUserId, dto);
        return Ok(vehicle);
    }
    
    // DELETE api/customers/profile — delete own account
    [HttpDelete("profile")]
    public async Task<IActionResult> DeleteAccount()
    {
        await _customerService.DeleteAccountAsync(CurrentUserId);
        return Ok(new { message = "Account deleted successfully." });
    }

// PUT api/customers/vehicles/{vehicleId} — edit vehicle
    [HttpPut("vehicles/{vehicleId:int}")]
    public async Task<IActionResult> UpdateVehicle(
        int vehicleId, [FromBody] AddVehicleDto dto)
    {
        var vehicle = await _customerService.UpdateVehicleAsync(
            CurrentUserId, vehicleId, dto);
        return Ok(vehicle);
    }

    // Removes a vehicle — the service layer verifies the vehicle that belongs to the customer
    [HttpDelete("vehicles/{vehicleId:int}")]
    public async Task<IActionResult> DeleteVehicle(int vehicleId)
    {
        await _customerService.DeleteVehicleAsync(CurrentUserId, vehicleId);
        return NoContent();
    }
}



