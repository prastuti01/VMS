using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using VehicleManagement.Application.DTOs.Auth;
using VehicleManagement.Application.Interfaces;
using VehicleManagement.Domain.Entities;

namespace VehicleManagement.Application.Services;

// Core authentication service: handles sign-up, sign-in, and token generation
public class AuthService(
    UserManager<User> userManager,
    RoleManager<IdentityRole<Guid>> roleManager,
    ICustomerRepository customerRepo,
    IConfiguration config) : IAuthService
{
    // Registers a new user, assigns them the Customer role, and returns a ready-to-use JWT
    public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
    {
        // Block duplicate accounts early before touching anything else
        var existingUser = await userManager.FindByEmailAsync(dto.Email);
        if (existingUser != null)
            throw new InvalidOperationException("Email is already registered.");

        var existingPhone = await customerRepo.GetByPhoneAsync(dto.Phone);

        if (existingPhone != null)
            throw new InvalidOperationException(
                "Phone number is already registered."
            );

        var user = new User
        {
            UserName = dto.Email,
            Email    = dto.Email,
        };

        var result = await userManager.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
        {
            // Surface all validation errors at once instead of one at a time
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new InvalidOperationException(errors);
        }

        // Create the Customer role on the fly if it doesn't exist yet
        if (!await roleManager.RoleExistsAsync("Customer"))
            await roleManager.CreateAsync(new IdentityRole<Guid>("Customer"));

        await userManager.AddToRoleAsync(user, "Customer");

        // Every registered user gets a linked customer profile automatically
        var customer = new Customer
        {
            UserId    = user.Id,
            Phone     = dto.Phone,
            Address   = dto.Address,
            CreatedAt = DateTime.UtcNow
        };
        await customerRepo.AddAsync(customer);

        var roles = await userManager.GetRolesAsync(user);

        return new AuthResponseDto
        {
            Token      = GenerateJwt(user, roles),
            Email      = user.Email!,
            Role       = roles.FirstOrDefault() ?? "Customer",
            UserId     = user.Id,
            CustomerId = customer.CustomerId
        };
    }

    // Validates credentials and returns a fresh JWT if everything checks out
    public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
    {
        // Use a generic error message to avoid hinting which field is wrong
        var user = await userManager.FindByEmailAsync(dto.Email)
            ?? throw new UnauthorizedAccessException("Invalid email or password.");
        
        
        var passwordValid = await userManager.CheckPasswordAsync(user, dto.Password);
        if (!passwordValid)
            throw new UnauthorizedAccessException("Invalid email or password.");

        // Respect account lockout — if the account is locked, reject immediately
        if (await userManager.IsLockedOutAsync(user))
            throw new UnauthorizedAccessException("Account is temporarily locked. Please try again later.");

        var roles    = await userManager.GetRolesAsync(user);
        var customer = await customerRepo.GetByUserIdAsync(user.Id);

        return new AuthResponseDto
        {
            Token      = GenerateJwt(user, roles),
            Email      = user.Email!,
            Role       = roles.FirstOrDefault() ?? string.Empty,
            UserId     = user.Id,
            CustomerId = customer?.CustomerId ?? 0
        };
    }

    // Builds a signed JWT containing the user's identity and roles, valid for 7 days
    private string GenerateJwt(User user, IList<string> roles)
    {
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(config["Jwt:Key"]
                ?? throw new InvalidOperationException("JWT key is not configured.")));

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Email, user.Email!),
        };

        // Each role gets its own claim so authorization policies work correctly
        foreach (var role in roles)
            claims.Add(new Claim(ClaimTypes.Role, role));

        var token = new JwtSecurityToken(
            issuer            : config["Jwt:Issuer"],
            audience          : config["Jwt:Audience"],
            claims            : claims,
            expires           : DateTime.UtcNow.AddDays(7),
            signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256)
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}