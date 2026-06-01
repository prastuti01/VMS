using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VehicleManagement.Application.DTOs.Vendors;
using VehicleManagement.Application.Interfaces;

namespace VehicleManagement.Controllers;

[ApiController]
[Route("api/vendors")]
[Authorize(Roles = "Admin")]
public class VendorsController : ControllerBase
{
    private readonly IVendorService _vendorService;

    public VendorsController(IVendorService vendorService)
    {
        _vendorService = vendorService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var vendors = await _vendorService.GetAllAsync();
        return Ok(vendors);
    }

    [HttpGet("{vendorId:int}")]
    public async Task<IActionResult> GetById(int vendorId)
    {
        var vendor = await _vendorService.GetByIdAsync(vendorId);
        return Ok(vendor);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateVendorDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var vendor = await _vendorService.CreateAsync(dto);

        return CreatedAtAction(
            nameof(GetById),
            new { vendorId = vendor.VendorId },
            vendor
        );
    }

    [HttpPut("{vendorId:int}")]
    public async Task<IActionResult> Update(
    int vendorId,
    [FromBody] UpdateVendorDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var vendor = await _vendorService.UpdateAsync(vendorId, dto);

        return Ok(vendor);
    }

    [HttpDelete("{vendorId:int}")]
    public async Task<IActionResult> Delete(int vendorId)
    {
        await _vendorService.DeleteAsync(vendorId);
        return NoContent();
    }
}