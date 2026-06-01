using System.Net;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using VehicleManagement.Application.DTOs.Admin;
using VehicleManagement.Application.Interfaces;
using VehicleManagement.Domain.Entities;

namespace VehicleManagement.Application.Services;

public class ReminderService : IReminderService
{
    private const int DefaultLowStockThreshold = 10;
    private const int DefaultCreditReminderDays = 30;

    private readonly IAdminDashboardRepository _dashboardRepo;
    private readonly IEmailSender _emailSender;
    private readonly UserManager<User> _userManager;
    private readonly IConfiguration _configuration;

    public ReminderService(
        IAdminDashboardRepository dashboardRepo,
        IEmailSender emailSender,
        UserManager<User> userManager,
        IConfiguration configuration)
    {
        _dashboardRepo = dashboardRepo;
        _emailSender = emailSender;
        _userManager = userManager;
        _configuration = configuration;
    }

    public async Task<IReadOnlyList<LowStockPartDto>> GetLowStockPartsAsync(
        int? threshold = null,
        CancellationToken cancellationToken = default)
    {
        var reorderThreshold = ResolvePositiveInt(
            threshold,
            "Notifications:LowStockThreshold",
            DefaultLowStockThreshold);

        var parts = await _dashboardRepo.GetLowStockPartsAsync(
            reorderThreshold,
            cancellationToken);

        return parts.Select(part => new LowStockPartDto
        {
            PartId = part.PartId,
            Name = part.Name,
            Category = part.Category,
            StockQuantity = part.StockQuantity,
            ReorderThreshold = reorderThreshold,
            Price = part.Price,
            VendorId = part.VendorId,
            VendorName = part.Vendor?.Name ?? string.Empty,
            VendorEmail = part.Vendor?.Email ?? string.Empty
        }).ToList();
    }

    public async Task<IReadOnlyList<OverdueCreditReminderDto>> GetOverdueCreditRemindersAsync(
        int? overdueDays = null,
        CancellationToken cancellationToken = default)
    {
        var days = ResolvePositiveInt(
            overdueDays,
            "Notifications:CreditReminderDays",
            DefaultCreditReminderDays);

        var cutoff = DateTime.UtcNow.Date.AddDays(-days);

        var invoices = await _dashboardRepo.GetOverdueCreditInvoicesAsync(
            cutoff,
            cancellationToken);

        return invoices
            .Select(invoice => MapCreditReminder(invoice, days))
            .Where(reminder => reminder.RemainingBalance > 0)
            .ToList();
    }

    public async Task<ReminderSendResultDto> SendLowStockAlertsAsync(
        int? threshold = null,
        CancellationToken cancellationToken = default)
    {
        var lowStockParts = await GetLowStockPartsAsync(threshold, cancellationToken);

        if (lowStockParts.Count == 0)
            return BuildResult(0, 0, 0, "No low-stock parts found.");

        var recipients = await GetAdminEmailsAsync();

        if (recipients.Count == 0)
            return BuildResult(0, 0, 0, "No admin email configured.");

        var subject = "Low stock alert";
        var body = BuildLowStockEmailBody(lowStockParts);

        var sent = 0;
        var skipped = 0;

        foreach (var recipient in recipients)
        {
            try
            {
                await _emailSender.SendAsync(recipient, subject, body);
                sent++;
            }
            catch
            {
                skipped++;
            }
        }

        return BuildResult(
            recipients.Count,
            sent,
            skipped,
            $"Low-stock alert generated for {lowStockParts.Count} part(s).");
    }

    public async Task<ReminderSendResultDto> SendCreditRemindersAsync(
        int? overdueDays = null,
        CancellationToken cancellationToken = default)
    {
        var reminders = await GetOverdueCreditRemindersAsync(overdueDays, cancellationToken);

        var sent = 0;
        var skipped = 0;

        foreach (var reminder in reminders)
        {
            if (string.IsNullOrWhiteSpace(reminder.CustomerEmail))
            {
                skipped++;
                continue;
            }

            var body = BuildCreditReminderEmailBody(reminder);

            try
            {
                await _emailSender.SendAsync(
                    reminder.CustomerEmail,
                    "Credit payment reminder",
                    body);

                sent++;
            }
            catch
            {
                skipped++;
            }
        }

        return BuildResult(
            reminders.Count,
            sent,
            skipped,
            $"Credit reminder check found {reminders.Count} overdue invoice(s).");
    }

    private async Task<List<string>> GetAdminEmailsAsync()
    {
        var recipients = new List<string>();
        var configuredEmail = _configuration["Notifications:AdminEmail"];

        if (!string.IsNullOrWhiteSpace(configuredEmail))
            recipients.Add(configuredEmail.Trim());

        var admins = await _userManager.GetUsersInRoleAsync("Admin");

        recipients.AddRange(admins
            .Select(admin => admin.Email)
            .Where(email => !string.IsNullOrWhiteSpace(email))!);

        return recipients
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();
    }

    private OverdueCreditReminderDto MapCreditReminder(
        SalesInvoice invoice,
        int overdueDays)
    {
        var amountPaid = invoice.Payments.Sum(payment => payment.AmountPaid);
        var remainingBalance = Math.Max(0, invoice.FinalAmount - amountPaid);
        var overdueFrom = invoice.SaleDate.Date.AddDays(overdueDays);

        return new OverdueCreditReminderDto
        {
            SaleId = invoice.SaleId,
            CustomerId = invoice.CustomerId,
            CustomerEmail = invoice.Customer?.User?.Email ?? string.Empty,
            CustomerPhone = invoice.Customer?.Phone ?? string.Empty,
            SaleDate = invoice.SaleDate,
            FinalAmount = invoice.FinalAmount,
            AmountPaid = amountPaid,
            RemainingBalance = remainingBalance,
            DaysOverdue = Math.Max(0, (DateTime.UtcNow.Date - overdueFrom).Days)
        };
    }

    private static string BuildLowStockEmailBody(IEnumerable<LowStockPartDto> parts)
    {
        var rows = new StringBuilder();
        foreach (var part in parts)
        {
            rows.AppendLine($"""
                <tr>
                    <td>{WebUtility.HtmlEncode(part.Name)}</td>
                    <td>{WebUtility.HtmlEncode(part.Category)}</td>
                    <td>{part.StockQuantity}</td>
                    <td>{part.ReorderThreshold}</td>
                    <td>{WebUtility.HtmlEncode(part.VendorName)}</td>
                </tr>
                """);
        }

        return $"""
            <html>
            <body>
                <h2>Low Stock Alert</h2>
                <p>The following parts are below the configured stock threshold.</p>
                <table border="1" cellpadding="6" cellspacing="0">
                    <thead>
                        <tr>
                            <th>Part</th>
                            <th>Category</th>
                            <th>Stock</th>
                            <th>Threshold</th>
                            <th>Vendor</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows}
                    </tbody>
                </table>
            </body>
            </html>
            """;
    }

    private static string BuildCreditReminderEmailBody(OverdueCreditReminderDto reminder) =>
        $"""
        <html>
        <body>
            <h2>Credit Payment Reminder</h2>
            <p>Dear customer,</p>
            <p>
                Your invoice #{reminder.SaleId} has a remaining balance of
                {reminder.RemainingBalance:0.00}.
            </p>
            <p>Invoice date: {reminder.SaleDate:yyyy-MM-dd}</p>
            <p>Please clear the outstanding credit balance as soon as possible.</p>
            <p>Vehicle Management System</p>
        </body>
        </html>
        """;

    private int ResolvePositiveInt(int? suppliedValue, string configKey, int fallback)
    {
        if (suppliedValue.HasValue)
        {
            if (suppliedValue.Value <= 0)
                throw new ArgumentException("Reminder settings must be greater than zero.");

            return suppliedValue.Value;
        }

        return int.TryParse(_configuration[configKey], out var configuredValue) && configuredValue > 0
            ? configuredValue
            : fallback;
    }

    private static ReminderSendResultDto BuildResult(
        int attempted,
        int sent,
        int skipped,
        string message) =>
        new()
        {
            GeneratedAt = DateTime.UtcNow,
            Attempted = attempted,
            Sent = sent,
            Skipped = skipped,
            Message = message
        };
}
