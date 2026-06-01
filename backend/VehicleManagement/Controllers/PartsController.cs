using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VehicleManagement.Application.DTOs.Parts;
using VehicleManagement.Application.Interfaces;

namespace VehicleManagement.Controllers;

[ApiController]
[Route("api/parts")]

public class PartsController : ControllerBase
{
    private readonly IPartService _partService;

    public PartsController(IPartService partService)
    {
        _partService = partService;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll()
    {
        var parts = await _partService.GetAllAsync();
        return Ok(parts);
    }

    [HttpGet("{partId:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(int partId)
    {
        var part = await _partService.GetByIdAsync(partId);
        return Ok(part);
    }

    [HttpGet("vendor/{vendorId:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetByVendorId(int vendorId)
    {
        var parts = await _partService.GetByVendorIdAsync(vendorId);
        return Ok(parts);
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreatePartDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var part = await _partService.CreateAsync(dto);

        return CreatedAtAction(
            nameof(GetById),
            new { partId = part.PartId },
            part
        );
    }





    [Authorize(Roles = "Admin")]
    [HttpPut("{partId:int}")]
    public async Task<IActionResult> Update(
    int partId,
    [FromBody] UpdatePartDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var part = await _partService.UpdateAsync(partId, dto);

        return Ok(part);
    }




    [Authorize(Roles = "Admin")]
    [HttpDelete("{partId:int}")]
    public async Task<IActionResult> Delete(int partId)
    {
        await _partService.DeleteAsync(partId);
        return NoContent();
    }
}