using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VehicleManagement.Application.Interfaces;

namespace VehicleManagement.Controllers;

[ApiController]
[Route("api/reports/customers")]
[Authorize(Roles = "Staff")]
public class CustomerReportController : ControllerBase
{
    private readonly ICustomerReportService _service;

    public CustomerReportController(ICustomerReportService service)
    {
        _service = service;
    }

    [HttpGet("spending")]
    public async Task<IActionResult> GetAllCustomerSpending()
    {
        var result = await _service.GetAllCustomerSpendingAsync();
        return Ok(result);
    }

    [HttpGet("high")]
    public async Task<IActionResult> GetHighSpenders()
    {
        var result = await _service.GetHighSpendersAsync();
        return Ok(result);
    }

    [HttpGet("low")]
    public async Task<IActionResult> GetLowSpenders()
    {
        var result = await _service.GetLowSpendersAsync();
        return Ok(result);
    }
}
