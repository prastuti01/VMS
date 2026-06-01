using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VehicleManagement.Application.DTOs.SalesInvoices;
using VehicleManagement.Application.Interfaces;

namespace VehicleManagement.Controllers;

[ApiController]
[Route("api/sales-invoices")]
[Authorize(Roles = "Staff,Admin")]
public class SalesInvoicesController : ControllerBase
{
    private readonly ISalesInvoiceService _salesInvoiceService;

    public SalesInvoicesController(ISalesInvoiceService salesInvoiceService)
    {
        _salesInvoiceService = salesInvoiceService;
    }

    private Guid CurrentUserId =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var invoices = await _salesInvoiceService.GetAllAsync();
        return Ok(invoices);
    }

    [HttpGet("{saleId:int}")]
    public async Task<IActionResult> GetById(int saleId)
    {
        var invoice = await _salesInvoiceService.GetByIdAsync(saleId);
        return Ok(invoice);
    }

    [HttpGet("customer/{customerId:int}")]
    public async Task<IActionResult> GetByCustomerId(int customerId)
    {
        var invoices = await _salesInvoiceService.GetByCustomerIdAsync(customerId);
        return Ok(invoices);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateSalesInvoiceDto dto)
    {
        var invoice = await _salesInvoiceService.CreateAsync(
            dto,
            CurrentUserId,
            User.IsInRole("Admin"));

        return CreatedAtAction(nameof(GetById), new { saleId = invoice.SaleId }, invoice);
    }

    [HttpPost("{saleId:int}/email")]
    public async Task<IActionResult> EmailToCustomer(int saleId)
    {
        var result = await _salesInvoiceService.EmailToCustomerAsync(saleId);
        return Ok(result);
    }
}
