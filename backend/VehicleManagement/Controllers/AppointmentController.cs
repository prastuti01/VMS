using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VehicleManagement.Application.DTOs.Appointment;
using VehicleManagement.Application.Interfaces;

namespace VehicleManagement.Controllers;

[ApiController]
[Route("api/appointments")]
public class AppointmentController : ControllerBase
{
    private readonly IAppointmentService _appointmentService;

    public AppointmentController(IAppointmentService appointmentService)
    {
        _appointmentService = appointmentService;
    }

    private Guid CurrentUserId =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    /// <summary>
    /// Book a new appointment for a customer vehicle
    /// </summary>
    [HttpPost("book")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> BookAppointment([FromBody] BookAppointmentDto dto)
    {
        var appointment = await _appointmentService.BookAppointmentAsync(CurrentUserId, dto);
        return CreatedAtAction(nameof(GetAppointment), new { id = appointment.AppointmentId }, appointment);
    }

    /// <summary>
    /// Get a specific appointment by ID (Customers can only access their own)
    /// </summary>
    [HttpGet("{id:int}")]
    [Authorize(Roles = "Customer,Admin")]
    public async Task<IActionResult> GetAppointment(int id)
    {
        var appointment = await _appointmentService.GetAppointmentAsync(id);
        return Ok(appointment);
    }

    /// <summary>
    /// Get all appointments for the current customer
    /// </summary>
    [HttpGet("my-appointments")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> GetMyAppointments()
    {
        var appointments = await _appointmentService.GetMyAppointmentsAsync(CurrentUserId);
        return Ok(appointments);
    }

    /// <summary>
    /// Get all appointments (Admin only)
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAllAppointments()
    {
        var appointments = await _appointmentService.GetAllAppointmentsAsync();
        return Ok(appointments);
    }

    /// <summary>
    /// Update an appointment date/status (Admin only)
    /// </summary>
    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateAppointment(int id, [FromBody] BookAppointmentDto dto)
    {
        var appointment = await _appointmentService.UpdateAppointmentAsync(id, dto);
        return Ok(appointment);
    }

    /// <summary>
    /// Cancel/delete an appointment
    /// </summary>
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Customer,Admin")]
    public async Task<IActionResult> CancelAppointment(int id)
    {
        await _appointmentService.CancelAppointmentAsync(id);
        return NoContent();
    }
}
