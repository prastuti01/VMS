using VehicleManagement.Application.DTOs.PurchaseInvoices;
using VehicleManagement.Application.Interfaces;
using VehicleManagement.Domain.Entities;

namespace VehicleManagement.Application.Services;

public class PurchaseInvoiceService : IPurchaseInvoiceService
{
    private readonly IPurchaseInvoiceRepository _purchaseInvoiceRepository;

    public PurchaseInvoiceService(IPurchaseInvoiceRepository purchaseInvoiceRepository)
    {
        _purchaseInvoiceRepository = purchaseInvoiceRepository;
    }

    public async Task<List<PurchaseInvoiceDto>> GetAllAsync()
    {
        var invoices = await _purchaseInvoiceRepository.GetAllAsync();

        return invoices.Select(MapToDto).ToList();
    }

    public async Task<PurchaseInvoiceDto> GetByIdAsync(int purchaseId)
    {
        var invoice = await _purchaseInvoiceRepository.GetByIdAsync(purchaseId)
            ?? throw new KeyNotFoundException("Purchase invoice not found.");

        return MapToDto(invoice);
    }

    public async Task<List<PurchaseInvoiceDto>> GetByVendorIdAsync(int vendorId)
    {
        if (vendorId <= 0)
        {
            throw new ArgumentException("Valid vendor is required.");
        }

        if (!await _purchaseInvoiceRepository.VendorExistsAsync(vendorId))
        {
            throw new KeyNotFoundException("Vendor not found.");
        }

        var invoices = await _purchaseInvoiceRepository.GetByVendorIdAsync(vendorId);

        return invoices.Select(MapToDto).ToList();
    }

    public async Task<PurchaseInvoiceDto> CreateAsync(CreatePurchaseInvoiceDto dto)
    {
        if (dto == null)
        {
            throw new ArgumentException("Purchase invoice data is required.");
        }

        if (dto.VendorId <= 0)
        {
            throw new ArgumentException("Valid vendor is required.");
        }

        if (!await _purchaseInvoiceRepository.VendorExistsAsync(dto.VendorId))
        {
            throw new KeyNotFoundException("Vendor not found.");
        }

        if (dto.Items == null || dto.Items.Count == 0)
        {
            throw new ArgumentException("At least one purchase item is required.");
        }

        var cleanItems = dto.Items
            .Select(item => new CreatePurchaseInvoiceItemDto
            {
                PartId = item.PartId,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice
            })
            .ToList();

        var invalidItem = cleanItems.FirstOrDefault(item =>
            item.PartId <= 0 ||
            item.Quantity <= 0 ||
            item.UnitPrice <= 0);

        if (invalidItem != null)
        {
            throw new ArgumentException("Part, quantity and unit price must be valid and greater than 0.");
        }

        var duplicatePartIds = cleanItems
            .GroupBy(item => item.PartId)
            .Where(group => group.Count() > 1)
            .Select(group => group.Key)
            .ToList();

        if (duplicatePartIds.Count > 0)
        {
            throw new InvalidOperationException(
                "Duplicate parts are not allowed in one invoice. Increase quantity instead.");
        }

        var partIds = cleanItems
            .Select(item => item.PartId)
            .Distinct()
            .ToList();

        var parts = await _purchaseInvoiceRepository.GetPartsByIdsAsync(partIds);

        var missingPartIds = partIds
            .Except(parts.Select(part => part.PartId))
            .ToList();

        if (missingPartIds.Count > 0)
        {
            throw new KeyNotFoundException($"Part not found: {string.Join(", ", missingPartIds)}");
        }

        var invalidVendorPart = parts.FirstOrDefault(part => part.VendorId != dto.VendorId);

        if (invalidVendorPart != null)
        {
            throw new InvalidOperationException(
                $"Part '{invalidVendorPart.Name}' does not belong to the selected vendor.");
        }

        var invoice = new PurchaseInvoice
        {
            VendorId = dto.VendorId,
            PurchaseDate = ToUtcDateTime(dto.PurchaseDate),
            TotalAmount = cleanItems.Sum(item => item.Quantity * item.UnitPrice)
        };

        var purchaseItems = cleanItems.Select(item => new PurchaseItem
        {
            PartId = item.PartId,
            Quantity = item.Quantity,
            UnitPrice = item.UnitPrice
        }).ToList();

        var savedInvoice = await _purchaseInvoiceRepository
            .CreateWithItemsAndStockUpdateAsync(invoice, purchaseItems);

        return MapToDto(savedInvoice);
    }

    private static DateTime ToUtcDateTime(DateTime? value)
    {
        var date = value ?? DateTime.UtcNow;

        if (date.Kind == DateTimeKind.Utc)
        {
            return date;
        }

        if (date.Kind == DateTimeKind.Local)
        {
            return date.ToUniversalTime();
        }

        return DateTime.SpecifyKind(date, DateTimeKind.Utc);
    }

    private static PurchaseInvoiceDto MapToDto(PurchaseInvoice invoice)
    {
        return new PurchaseInvoiceDto
        {
            PurchaseId = invoice.PurchaseId,
            VendorId = invoice.VendorId,
            VendorName = invoice.Vendor?.Name ?? string.Empty,
            PurchaseDate = invoice.PurchaseDate,
            TotalAmount = invoice.TotalAmount,
            Items = invoice.PurchaseItems.Select(item => new PurchaseInvoiceItemDto
            {
                PurchaseItemId = item.PurchaseItemId,
                PartId = item.PartId,
                PartName = item.Part?.Name ?? string.Empty,
                Category = item.Part?.Category ?? string.Empty,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice,
                LineTotal = item.Quantity * item.UnitPrice
            }).ToList()
        };
    }
}