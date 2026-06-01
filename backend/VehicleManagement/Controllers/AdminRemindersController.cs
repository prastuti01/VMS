using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VehicleManagement.Application.Interfaces;

namespace VehicleManagement.Controllers;

[ApiController]
[Route("api/admin/reminders")]
[Authorize(Roles = "Admin")]
public class AdminRemindersController : ControllerBase
{
    private readonly IReminderService _reminderService;

    public AdminRemindersController(IReminderService reminderService) =>
        _reminderService = reminderService;

    [HttpGet("low-stock")]
    public async Task<IActionResult> GetLowStock(
        [FromQuery] int? threshold,
        CancellationToken cancellationToken)
    {
        var parts = await _reminderService.GetLowStockPartsAsync(
            threshold,
            cancellationToken);

        return Ok(parts);
    }

    [HttpPost("low-stock/send")]
    public async Task<IActionResult> SendLowStockAlerts(
        [FromQuery] int? threshold,
        CancellationToken cancellationToken)
    {
        var result = await _reminderService.SendLowStockAlertsAsync(
            threshold,
            cancellationToken);

        return Ok(result);
    }

    [HttpGet("overdue-credits")]
    public async Task<IActionResult> GetOverdueCredits(
        [FromQuery] int? overdueDays,
        CancellationToken cancellationToken)
    {
        var credits = await _reminderService.GetOverdueCreditRemindersAsync(
            overdueDays,
            cancellationToken);

        return Ok(credits);
    }

    [HttpPost("overdue-credits/send")]
    public async Task<IActionResult> SendCreditReminders(
        [FromQuery] int? overdueDays,
        CancellationToken cancellationToken)
    {
        var result = await _reminderService.SendCreditRemindersAsync(
            overdueDays,
            cancellationToken);

        return Ok(result);
    }
}
