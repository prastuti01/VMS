using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VehicleManagement.Application.DTOs.Staff;
using VehicleManagement.Application.Interfaces;

namespace VehicleManagement.Controllers;

[ApiController]
[Route("api/admin/staff")]
[Authorize(Roles = "Admin")]
public class AdminStaffController : ControllerBase
{
    private readonly IStaffService _staffService;

    public AdminStaffController(IStaffService staffService) =>
        _staffService = staffService;

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var staff = await _staffService.GetAllStaffAsync(cancellationToken);
        return Ok(staff);
    }

    [HttpGet("{staffId:int}")]
    public async Task<IActionResult> GetById(
        int staffId,
        CancellationToken cancellationToken)
    {
        var staff = await _staffService.GetStaffByIdAsync(staffId, cancellationToken);
        return Ok(staff);
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateStaffDto dto,
        CancellationToken cancellationToken)
    {
        var staff = await _staffService.CreateStaffAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { staffId = staff.StaffId }, staff);
    }

    [HttpPut("{staffId:int}")]
    public async Task<IActionResult> Update(
        int staffId,
        [FromBody] UpdateStaffProfileDto dto,
        CancellationToken cancellationToken)
    {
        var staff = await _staffService.UpdateStaffAsync(staffId, dto, cancellationToken);
        return Ok(staff);
    }

    [HttpDelete("{staffId:int}")]
    public async Task<IActionResult> Delete(
        int staffId,
        CancellationToken cancellationToken)
    {
        await _staffService.DeleteStaffAsync(staffId, cancellationToken);
        return NoContent();
    }
}
