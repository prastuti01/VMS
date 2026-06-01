using System.ComponentModel.DataAnnotations;

namespace VehicleManagement.Application.DTOs.PurchaseInvoices;

public class PurchaseInvoiceDto
{
    public int PurchaseId { get; set; }
    public int VendorId { get; set; }
    public string VendorName { get; set; } = string.Empty;
    public DateTime PurchaseDate { get; set; }
    public decimal TotalAmount { get; set; }

    public List<PurchaseInvoiceItemDto> Items { get; set; } = new();
}

public class PurchaseInvoiceItemDto
{
    public int PurchaseItemId { get; set; }
    public int PartId { get; set; }
    public string PartName { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal LineTotal { get; set; }
}

public class CreatePurchaseInvoiceDto
{
    [Range(1, int.MaxValue, ErrorMessage = "VendorId is required.")]
    public int VendorId { get; set; }

    public DateTime? PurchaseDate { get; set; }

    [Required]
    [MinLength(1, ErrorMessage = "At least one purchase item is required.")]
    public List<CreatePurchaseInvoiceItemDto> Items { get; set; } = new();
}

public class CreatePurchaseInvoiceItemDto
{
    [Range(1, int.MaxValue, ErrorMessage = "PartId is required.")]
    public int PartId { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "Quantity must be at least 1.")]
    public int Quantity { get; set; }

    [Range(typeof(decimal), "0.01", "999999999.99", ErrorMessage = "Unit price must be greater than 0.")]
    public decimal UnitPrice { get; set; }
}