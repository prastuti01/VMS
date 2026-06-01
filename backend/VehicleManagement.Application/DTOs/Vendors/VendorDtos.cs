using System.ComponentModel.DataAnnotations;

namespace VehicleManagement.Application.DTOs.Vendors;

public class VendorDto
{
    public int VendorId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;

    public int PartsCount { get; set; }
    public int PurchaseInvoiceCount { get; set; }
}

public class CreateVendorDto
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]

    [RegularExpression(@"^\d{10}$",
       ErrorMessage = "Phone number must be exactly 10 digits.")]
    public string Phone { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [MaxLength(150)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MaxLength(250)]
    public string Address { get; set; } = string.Empty;
}

public class UpdateVendorDto
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [RegularExpression(@"^\d{10}$",
    ErrorMessage = "Phone number must be exactly 10 digits.")]
    public string Phone { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [MaxLength(150)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MaxLength(250)]
    public string Address { get; set; } = string.Empty;
}