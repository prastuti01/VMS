using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VehicleManagement.Application.Interfaces;

namespace VehicleManagement.Controllers;

[ApiController]
[Route("api/admin/dashboard")]
[Authorize(Roles = "Admin")]
public class AdminDashboardController : ControllerBase
{
    private readonly IAdminDashboardService _dashboardService;

    public AdminDashboardController(IAdminDashboardService dashboardService) =>
        _dashboardService = dashboardService;

    [HttpGet]
    public async Task<IActionResult> GetDashboard(CancellationToken cancellationToken)
    {
        var dashboard = await _dashboardService.GetDashboardAsync(cancellationToken);
        return Ok(dashboard);
    }
}
