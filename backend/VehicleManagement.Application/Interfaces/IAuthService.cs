using VehicleManagement.Application.DTOs.Auth;

namespace VehicleManagement.Application.Interfaces;

// Handles authentication-related operations
public interface IAuthService
{
    // Registers a new user and returns auth details
    Task<AuthResponseDto> RegisterAsync(RegisterDto dto);

    // Logs in a user and returns auth details
    Task<AuthResponseDto> LoginAsync(LoginDto dto);
}