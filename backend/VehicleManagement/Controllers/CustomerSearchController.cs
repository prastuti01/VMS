using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VehicleManagement.Application.Interfaces;

namespace VehicleManagement.Controllers
{
    [ApiController]
    [Route("api/customers")]
    [Authorize(Roles = "Staff,Admin")]
    public class CustomerSearchController : ControllerBase
    {
        private readonly ICustomerSearchService _service;

        public CustomerSearchController(ICustomerSearchService service)
        {
            _service = service;
        }

        [HttpGet("search")]
        public async Task<IActionResult> SearchCustomers([FromQuery] string query)
        {
            var result = await _service.SearchCustomersAsync(query);
            return Ok(result);
        }
    }
}