using Microsoft.AspNetCore.Mvc;
using VehicleManagement.Application.DTOs.Auth;
using VehicleManagement.Application.Interfaces;

namespace VehicleManagement.Controllers;

// Handles all authentication endpoints — register, login, and logout
[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService) =>
        _authService = authService;

    // Creates a new user account and returns the result 
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        var result = await _authService.RegisterAsync(dto);
        return Ok(result);
    }

    // Validates credentials and returns an auth token on success
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var result = await _authService.LoginAsync(dto);
        return Ok(result);
    }

    // Logout handler client
    [HttpPost("logout")]
    public IActionResult Logout() =>
        Ok(new { message = "Logged out successfully." });
}


