using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VehicleManagement.Application.DTOs.PurchaseInvoices;
using VehicleManagement.Application.Interfaces;

namespace VehicleManagement.Controllers;

[ApiController]
[Route("api/purchase-invoices")]
[Authorize(Roles = "Admin")]
public class PurchaseInvoicesController : ControllerBase
{
    private readonly IPurchaseInvoiceService _purchaseInvoiceService;

    public PurchaseInvoicesController(IPurchaseInvoiceService purchaseInvoiceService)
    {
        _purchaseInvoiceService = purchaseInvoiceService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var invoices = await _purchaseInvoiceService.GetAllAsync();

        return Ok(invoices);
    }

    [HttpGet("{purchaseId:int}")]
    public async Task<IActionResult> GetById(int purchaseId)
    {
        var invoice = await _purchaseInvoiceService.GetByIdAsync(purchaseId);

        return Ok(invoice);
    }

    [HttpGet("vendor/{vendorId:int}")]
    public async Task<IActionResult> GetByVendorId(int vendorId)
    {
        var invoices = await _purchaseInvoiceService.GetByVendorIdAsync(vendorId);

        return Ok(invoices);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create(
    [FromBody] CreatePurchaseInvoiceDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var invoice = await _purchaseInvoiceService.CreateAsync(dto);

        return CreatedAtAction(
            nameof(GetById),
            new { purchaseId = invoice.PurchaseId },
            invoice);
    }
}
