using VehicleManagement.Application.DTOs.Admin;

namespace VehicleManagement.Application.Interfaces;

public interface IReminderService
{
    Task<IReadOnlyList<LowStockPartDto>> GetLowStockPartsAsync(
        int? threshold = null,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<OverdueCreditReminderDto>> GetOverdueCreditRemindersAsync(
        int? overdueDays = null,
        CancellationToken cancellationToken = default);

    Task<ReminderSendResultDto> SendLowStockAlertsAsync(
        int? threshold = null,
        CancellationToken cancellationToken = default);

    Task<ReminderSendResultDto> SendCreditRemindersAsync(
        int? overdueDays = null,
        CancellationToken cancellationToken = default);
}
