using System.Net;
using System.Text;
using VehicleManagement.Application.DTOs.SalesInvoices;
using VehicleManagement.Application.Interfaces;
using VehicleManagement.Domain.Entities;

namespace VehicleManagement.Application.Services;

public class SalesInvoiceService : ISalesInvoiceService
{
    private readonly ISalesInvoiceRepository _salesInvoiceRepository;
    private readonly IEmailSender _emailSender;

    public SalesInvoiceService(
        ISalesInvoiceRepository salesInvoiceRepository,
        IEmailSender emailSender)
    {
        _salesInvoiceRepository = salesInvoiceRepository;
        _emailSender = emailSender;
    }

    public async Task<List<SalesInvoiceDto>> GetAllAsync()
    {
        var invoices = await _salesInvoiceRepository.GetAllAsync();
        return invoices.Select(MapToDto).ToList();
    }

    public async Task<SalesInvoiceDto> GetByIdAsync(int saleId)
    {
        var invoice = await _salesInvoiceRepository.GetByIdAsync(saleId)
            ?? throw new KeyNotFoundException("Sales invoice not found.");

        return MapToDto(invoice);
    }

    public async Task<List<SalesInvoiceDto>> GetByCustomerIdAsync(int customerId)
    {
        if (await _salesInvoiceRepository.GetCustomerByIdAsync(customerId) is null)
            throw new KeyNotFoundException("Customer not found.");

        var invoices = await _salesInvoiceRepository.GetByCustomerIdAsync(customerId);
        return invoices.Select(MapToDto).ToList();
    }

    public async Task<SalesInvoiceDto> CreateAsync(
        CreateSalesInvoiceDto dto,
        Guid currentUserId,
        bool canUseProvidedStaffId)
    {
        if (dto == null)
            throw new ArgumentException("Sales invoice data is required.");

        if (dto.CustomerId <= 0)
            throw new ArgumentException("Valid customer is required.");

        if (dto.Items == null || dto.Items.Count == 0)
            throw new ArgumentException("At least one sales item is required.");

        if (dto.Discount < 0)
            throw new ArgumentException("Discount cannot be negative.");

        if (dto.AmountPaid < 0)
            throw new ArgumentException("Amount paid cannot be negative.");

        var invalidItem = dto.Items.FirstOrDefault(item =>
            item.PartId <= 0 ||
            item.Quantity <= 0 ||
            item.UnitPrice <= 0);

        if (invalidItem != null)
            throw new ArgumentException("Part, quantity and unit price must be valid and greater than 0.");

        EnsureNoDuplicateParts(dto.Items);

        var customer = await _salesInvoiceRepository.GetCustomerByIdAsync(dto.CustomerId)
            ?? throw new KeyNotFoundException("Customer not found.");

        var staffId = await ResolveStaffIdAsync(dto, currentUserId, canUseProvidedStaffId);

        if (!await _salesInvoiceRepository.StaffExistsAsync(staffId))
            throw new KeyNotFoundException("Staff not found.");

        var partIds = dto.Items.Select(i => i.PartId).Distinct().ToList();
        var parts = await _salesInvoiceRepository.GetPartsByIdsAsync(partIds);

        var missingPartIds = partIds.Except(parts.Select(p => p.PartId)).ToList();
        if (missingPartIds.Any())
            throw new KeyNotFoundException($"Part not found: {string.Join(", ", missingPartIds)}");

        EnsureStockIsAvailable(dto.Items, parts);

        var totalAmount = dto.Items.Sum(i => i.Quantity * i.UnitPrice);

        // Existing discount from user
        decimal discount = dto.Discount;

        // Loyalty Discount (ADD ON TOP)
        decimal loyaltyDiscount = 0;

        if (totalAmount > 5000)
        {
            loyaltyDiscount = totalAmount * 0.10m; // 10%
        }

        // Total discount = user discount + loyalty discount
        discount += loyaltyDiscount;

        if (discount > totalAmount)
            throw new ArgumentException("Discount cannot be greater than the total amount.");

        var finalAmount = totalAmount - discount;

        if (dto.AmountPaid > finalAmount)
            throw new ArgumentException("Amount paid cannot be greater than the final amount.");

        var invoice = new SalesInvoice
        {
            CustomerId = customer.CustomerId,
            StaffId = staffId,
            SaleDate = NormalizeDate(dto.SaleDate),
            TotalAmount = totalAmount,
            Discount = discount,
            FinalAmount = finalAmount,
            PaymentStatus = GetPaymentStatus(finalAmount, dto.AmountPaid)
        };

        var items = dto.Items.Select(i => new SalesItem
        {
            PartId = i.PartId,
            Quantity = i.Quantity,
            UnitPrice = i.UnitPrice
        }).ToList();

        var savedInvoice = await _salesInvoiceRepository
            .CreateWithItemsStockAndPaymentAsync(invoice, items, dto.AmountPaid);

        return MapToDto(savedInvoice);
    }

    public async Task<EmailInvoiceResultDto> EmailToCustomerAsync(int saleId)
    {
        var invoice = await _salesInvoiceRepository.GetByIdAsync(saleId)
            ?? throw new KeyNotFoundException("Sales invoice not found.");

        var dto = MapToDto(invoice);
        if (string.IsNullOrWhiteSpace(dto.CustomerEmail))
            throw new InvalidOperationException("Customer does not have an email address.");

        var subject = $"Vehicle Management Invoice #{dto.SaleId}";
        var body = BuildInvoiceEmailBody(dto);

        await _emailSender.SendAsync(dto.CustomerEmail, subject, body);

        return new EmailInvoiceResultDto
        {
            SaleId = dto.SaleId,
            RecipientEmail = dto.CustomerEmail,
            SentAt = DateTime.UtcNow,
            Message = "Invoice emailed to customer successfully."
        };
    }

    private async Task<int> ResolveStaffIdAsync(
        CreateSalesInvoiceDto dto,
        Guid currentUserId,
        bool canUseProvidedStaffId)
    {
        if (canUseProvidedStaffId && dto.StaffId.HasValue)
            return dto.StaffId.Value;

        var staffId = await _salesInvoiceRepository.GetStaffIdByUserIdAsync(currentUserId);
        if (staffId.HasValue)
            return staffId.Value;

        throw new ArgumentException(
            "StaffId is required when the logged-in user is not linked to a staff profile.");
    }

    private static void EnsureNoDuplicateParts(List<CreateSalesInvoiceItemDto> items)
    {
        var duplicatePartIds = items
            .GroupBy(i => i.PartId)
            .Where(g => g.Count() > 1)
            .Select(g => g.Key)
            .ToList();

        if (duplicatePartIds.Any())
        {
            throw new ArgumentException(
                $"Duplicate parts are not allowed in the same invoice: {string.Join(", ", duplicatePartIds)}");
        }
    }

    private static void EnsureStockIsAvailable(
        List<CreateSalesInvoiceItemDto> items,
        List<Part> parts)
    {
        foreach (var item in items)
        {
            var part = parts.First(p => p.PartId == item.PartId);
            if (part.StockQuantity < item.Quantity)
            {
                throw new InvalidOperationException(
                    $"Insufficient stock for part '{part.Name}'. Available: {part.StockQuantity}.");
            }
        }
    }

    private static DateTime NormalizeDate(DateTime? date)
    {
        if (!date.HasValue)
            return DateTime.UtcNow;

        return date.Value.Kind switch
        {
            DateTimeKind.Utc => date.Value,
            DateTimeKind.Local => date.Value.ToUniversalTime(),
            _ => DateTime.SpecifyKind(date.Value, DateTimeKind.Utc)
        };
    }

    private static string GetPaymentStatus(decimal finalAmount, decimal amountPaid)
    {
        if (finalAmount == 0 || amountPaid >= finalAmount)
            return "Paid";

        return amountPaid > 0 ? "Partial" : "Pending";
    }

    private static SalesInvoiceDto MapToDto(SalesInvoice invoice)
    {
        var amountPaid = invoice.Payments.Sum(payment => payment.AmountPaid);
        var remainingBalance = invoice.FinalAmount - amountPaid;

        return new SalesInvoiceDto
        {
            SaleId = invoice.SaleId,
            CustomerId = invoice.CustomerId,
            CustomerEmail = invoice.Customer?.User?.Email ?? string.Empty,
            CustomerPhone = invoice.Customer?.Phone ?? string.Empty,
            StaffId = invoice.StaffId,
            StaffEmail = invoice.Staff?.User?.Email ?? string.Empty,
            SaleDate = invoice.SaleDate,
            TotalAmount = invoice.TotalAmount,
            Discount = invoice.Discount,
            FinalAmount = invoice.FinalAmount,
            AmountPaid = amountPaid,
            RemainingBalance = remainingBalance > 0 ? remainingBalance : 0,
            PaymentStatus = invoice.PaymentStatus,

            Items = invoice.SalesItems.Select(item => new SalesInvoiceItemDto
            {
                SalesItemId = item.SalesItemId,
                PartId = item.PartId,
                PartName = item.Part?.Name ?? string.Empty,
                Category = item.Part?.Category ?? string.Empty,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice,
                LineTotal = item.Quantity * item.UnitPrice
            }).ToList(),

            Payments = invoice.Payments.Select(payment => new SalesInvoicePaymentDto
            {
                PaymentId = payment.PaymentId,
                AmountPaid = payment.AmountPaid,
                PaymentDate = payment.PaymentDate,
                RemainingBalance = payment.RemainingBalance
            }).ToList()
        };
    }

    private static string BuildInvoiceEmailBody(SalesInvoiceDto invoice)
    {
        var rows = new StringBuilder();
        foreach (var item in invoice.Items)
        {
            rows.AppendLine($"""
                <tr>
                    <td>{WebUtility.HtmlEncode(item.PartName)}</td>
                    <td>{WebUtility.HtmlEncode(item.Category)}</td>
                    <td>{item.Quantity}</td>
                    <td>{item.UnitPrice:0.00}</td>
                    <td>{item.LineTotal:0.00}</td>
                </tr>
                """);
        }

        return $"""
            <html>
            <body>
                <h2>Vehicle Management Invoice #{invoice.SaleId}</h2>
                <p>Date: {invoice.SaleDate:yyyy-MM-dd}</p>
                <table border="1" cellpadding="6" cellspacing="0">
                    <thead>
                        <tr>
                            <th>Part</th>
                            <th>Category</th>
                            <th>Quantity</th>
                            <th>Unit Price</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows}
                    </tbody>
                </table>
                <p>Total Amount: {invoice.TotalAmount:0.00}</p>
                <p>Discount: {invoice.Discount:0.00}</p>
                <p>Final Amount: {invoice.FinalAmount:0.00}</p>
                <p>Amount Paid: {invoice.AmountPaid:0.00}</p>
                <p>Remaining Balance: {invoice.RemainingBalance:0.00}</p>
                <p>Payment Status: {WebUtility.HtmlEncode(invoice.PaymentStatus)}</p>
            </body>
            </html>
            """;
    }
}
