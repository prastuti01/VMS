using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VehicleManagement.Application.Interfaces;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class FinancialReportController : ControllerBase
{
    private readonly IFinancialReportService _service;

    public FinancialReportController(IFinancialReportService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetReport([FromQuery] string filter = "monthly")
    {
        var result = await _service.GetFinancialReportAsync(filter.ToLower());
        return Ok(result);
    }
}