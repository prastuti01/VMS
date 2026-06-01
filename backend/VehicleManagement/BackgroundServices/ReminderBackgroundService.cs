using VehicleManagement.Application.Interfaces;

namespace VehicleManagement.BackgroundServices;

public class ReminderBackgroundService : BackgroundService
{
    private static readonly TimeSpan ReminderInterval = TimeSpan.FromHours(24);

    private readonly IServiceProvider _services;
    private readonly ILogger<ReminderBackgroundService> _logger;

    public ReminderBackgroundService(
        IServiceProvider services,
        ILogger<ReminderBackgroundService> logger)
    {
        _services = services;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await RunReminderPassAsync(stoppingToken);

        using var timer = new PeriodicTimer(ReminderInterval);
        while (await timer.WaitForNextTickAsync(stoppingToken))
            await RunReminderPassAsync(stoppingToken);
    }

    private async Task RunReminderPassAsync(CancellationToken stoppingToken)
    {
        try
        {
            using var scope = _services.CreateScope();
            var reminderService = scope.ServiceProvider.GetRequiredService<IReminderService>();

            await reminderService.SendLowStockAlertsAsync(cancellationToken: stoppingToken);
            await reminderService.SendCreditRemindersAsync(cancellationToken: stoppingToken);
        }
        catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
        {
            // Graceful shutdown.
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Automatic reminder pass failed.");
        }
    }
}
