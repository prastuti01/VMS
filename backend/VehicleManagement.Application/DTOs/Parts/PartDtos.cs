using System.ComponentModel.DataAnnotations;

namespace VehicleManagement.Application.DTOs.Parts;

public class PartDto
{
    public int PartId { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string Category { get; set; } = string.Empty;

    public decimal Price { get; set; }

    public int StockQuantity { get; set; }

    public bool IsLowStock => StockQuantity < 10;

    public int VendorId { get; set; }

    public string VendorName { get; set; } = string.Empty;
}

public class CreatePartDto
{
    [Required]
    [MaxLength(120)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(300)]
    public string Description { get; set; } = string.Empty;

    [Required]
    [MaxLength(80)]
    public string Category { get; set; } = string.Empty;

    [Range(typeof(decimal), "0.01", "999999999.99", ErrorMessage = "Price must be greater than 0.")]
    public decimal Price { get; set; }

    [Range(0, int.MaxValue, ErrorMessage = "Stock quantity cannot be negative.")]
    public int StockQuantity { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "VendorId is required.")]
    public int VendorId { get; set; }
}

public class UpdatePartDto
{
    [Required]
    [MaxLength(120)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(300)]
    public string Description { get; set; } = string.Empty;

    [Required]
    [MaxLength(80)]
    public string Category { get; set; } = string.Empty;

    [Range(typeof(decimal), "0.01", "999999999.99", ErrorMessage = "Price must be greater than 0.")]
    public decimal Price { get; set; }

    [Range(0, int.MaxValue, ErrorMessage = "Stock quantity cannot be negative.")]
    public int StockQuantity { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "VendorId is required.")]
    public int VendorId { get; set; }
}