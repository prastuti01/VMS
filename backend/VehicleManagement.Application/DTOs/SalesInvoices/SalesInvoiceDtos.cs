using System.ComponentModel.DataAnnotations;

namespace VehicleManagement.Application.DTOs.SalesInvoices;

public class SalesInvoiceDto
{
    public int SaleId { get; set; }
    public int CustomerId { get; set; }
    public string CustomerEmail { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public int StaffId { get; set; }
    public string StaffEmail { get; set; } = string.Empty;
    public DateTime SaleDate { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal Discount { get; set; }
    public decimal FinalAmount { get; set; }
    public decimal AmountPaid { get; set; }
    public decimal RemainingBalance { get; set; }
    public string PaymentStatus { get; set; } = string.Empty;

    public List<SalesInvoiceItemDto> Items { get; set; } = new();
    public List<SalesInvoicePaymentDto> Payments { get; set; } = new();
}

public class SalesInvoiceItemDto
{
    public int SalesItemId { get; set; }
    public int PartId { get; set; }
    public string PartName { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal LineTotal { get; set; }
}

public class SalesInvoicePaymentDto
{
    public int PaymentId { get; set; }
    public decimal AmountPaid { get; set; }
    public DateTime PaymentDate { get; set; }
    public decimal RemainingBalance { get; set; }
}

public class CreateSalesInvoiceDto
{
    [Range(1, int.MaxValue, ErrorMessage = "CustomerId is required.")]
    public int CustomerId { get; set; }

    public int? StaffId { get; set; }

    public DateTime? SaleDate { get; set; }

    [Range(typeof(decimal), "0", "999999999.99", ErrorMessage = "Discount cannot be negative.")]
    public decimal Discount { get; set; }

    [Range(typeof(decimal), "0", "999999999.99", ErrorMessage = "Amount paid cannot be negative.")]
    public decimal AmountPaid { get; set; }

    [Required]
    [MinLength(1, ErrorMessage = "At least one sales item is required.")]
    public List<CreateSalesInvoiceItemDto> Items { get; set; } = new();
}

public class CreateSalesInvoiceItemDto
{
    [Range(1, int.MaxValue, ErrorMessage = "PartId is required.")]
    public int PartId { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "Quantity must be at least 1.")]
    public int Quantity { get; set; }

    [Range(typeof(decimal), "0.01", "999999999.99", ErrorMessage = "Unit price must be greater than 0.")]
    public decimal UnitPrice { get; set; }
}

public class EmailInvoiceResultDto
{
    public int SaleId { get; set; }
    public string RecipientEmail { get; set; } = string.Empty;
    public DateTime SentAt { get; set; }
    public string Message { get; set; } = string.Empty;
}
