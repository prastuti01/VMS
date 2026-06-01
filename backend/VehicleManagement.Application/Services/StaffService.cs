using Microsoft.AspNetCore.Identity;
using VehicleManagement.Application.DTOs.Customer;
using VehicleManagement.Application.DTOs.Staff;
using VehicleManagement.Application.Interfaces;
using VehicleManagement.Domain.Entities;

namespace VehicleManagement.Application.Services;

public class StaffService : IStaffService
{
    private static readonly string[] ManagedStaffRoles = ["Admin", "Staff"];

    private readonly UserManager<User> _userManager;
    private readonly RoleManager<IdentityRole<Guid>> _roleManager;
    private readonly IStaffRepository _staffRepo;
    private readonly ICustomerRepository _customerRepo;
    private readonly IVehicleRepository _vehicleRepo;

    public StaffService(
        UserManager<User> userManager,
        RoleManager<IdentityRole<Guid>> roleManager,
        IStaffRepository staffRepo,
        ICustomerRepository customerRepo,
        IVehicleRepository vehicleRepo)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _staffRepo = staffRepo;
        _customerRepo = customerRepo;
        _vehicleRepo = vehicleRepo;
    }

    public async Task<IReadOnlyList<StaffProfileDto>> GetAllStaffAsync(
        CancellationToken cancellationToken = default)
    {
        var staff = await _staffRepo.GetAllAsync(cancellationToken);
        var result = new List<StaffProfileDto>();

        foreach (var member in staff)
            result.Add(await MapStaffAsync(member));

        return result;
    }

    public async Task<StaffProfileDto> GetStaffByIdAsync(
        int staffId,
        CancellationToken cancellationToken = default)
    {
        var staff = await _staffRepo.GetByIdAsync(staffId, cancellationToken)
            ?? throw new KeyNotFoundException("Staff profile not found.");

        return await MapStaffAsync(staff);
    }

    public async Task<StaffProfileDto> GetMyProfileAsync(
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        var staff = await _staffRepo.GetByUserIdAsync(userId, cancellationToken)
            ?? throw new KeyNotFoundException("Staff profile not found.");

        return await MapStaffAsync(staff);
    }

    public async Task<StaffProfileDto> CreateStaffAsync(
        CreateStaffDto dto,
        CancellationToken cancellationToken = default)
    {
        var role = NormalizeManagedRole(dto.Role, "Staff");

        var existingUser = await _userManager.FindByEmailAsync(dto.Email);
        if (existingUser != null)
            throw new InvalidOperationException("A user with this email already exists.");

        var user = new User
        {
            UserName = dto.Email,
            Email = dto.Email,
            PhoneNumber = dto.PhoneNumber
        };

        var createResult = await _userManager.CreateAsync(user, dto.Password);
        EnsureIdentitySucceeded(createResult);

        try
        {
            await EnsureRoleExistsAsync(role);
            EnsureIdentitySucceeded(await _userManager.AddToRoleAsync(user, role));

            var staff = new Staff
            {
                UserId = user.Id,
                Position = dto.Position.Trim(),
                Salary = dto.Salary,
                JoinedDate = dto.JoinedDate.HasValue
                    ? DateTime.SpecifyKind(dto.JoinedDate.Value, DateTimeKind.Utc)
                    : DateTime.UtcNow
            };

            await _staffRepo.AddAsync(staff, cancellationToken);
            staff.User = user;

            return await MapStaffAsync(staff);
        }
        catch
        {
            await _userManager.DeleteAsync(user);
            throw;
        }
    }

    public async Task<StaffProfileDto> UpdateStaffAsync(
        int staffId,
        UpdateStaffProfileDto dto,
        CancellationToken cancellationToken = default)
    {
        var staff = await _staffRepo.GetByIdAsync(staffId, cancellationToken)
            ?? throw new KeyNotFoundException("Staff profile not found.");

        if (!string.IsNullOrWhiteSpace(dto.Email) &&
            !string.Equals(staff.User.Email, dto.Email, StringComparison.OrdinalIgnoreCase))
        {
            var existingUser = await _userManager.FindByEmailAsync(dto.Email);
            if (existingUser != null && existingUser.Id != staff.UserId)
                throw new InvalidOperationException("A user with this email already exists.");

            EnsureIdentitySucceeded(await _userManager.SetEmailAsync(staff.User, dto.Email));
            EnsureIdentitySucceeded(await _userManager.SetUserNameAsync(staff.User, dto.Email));
        }

        if (dto.PhoneNumber != null)
            staff.User.PhoneNumber = dto.PhoneNumber.Trim();

        if (!string.IsNullOrWhiteSpace(dto.Position))
            staff.Position = dto.Position.Trim();

        if (dto.Salary.HasValue)
            staff.Salary = dto.Salary.Value;

        if (dto.JoinedDate.HasValue)
            staff.JoinedDate = DateTime.SpecifyKind(
                dto.JoinedDate.Value,
                DateTimeKind.Utc
            );

        if (!string.IsNullOrWhiteSpace(dto.Role))
            await ReplaceManagedRoleAsync(staff.User, NormalizeManagedRole(dto.Role, "Staff"));

        EnsureIdentitySucceeded(await _userManager.UpdateAsync(staff.User));
        await _staffRepo.UpdateAsync(staff, cancellationToken);

        return await MapStaffAsync(staff);
    }

    public async Task<StaffProfileDto> UpdateMyProfileAsync(
        Guid userId,
        UpdateMyStaffProfileDto dto,
        CancellationToken cancellationToken = default)
    {
        var staff = await _staffRepo.GetByUserIdAsync(userId, cancellationToken)
            ?? throw new KeyNotFoundException("Staff profile not found.");

        if (dto.PhoneNumber != null)
            staff.User.PhoneNumber = dto.PhoneNumber.Trim();

        if (!string.IsNullOrWhiteSpace(dto.Position))
            staff.Position = dto.Position.Trim();

        EnsureIdentitySucceeded(await _userManager.UpdateAsync(staff.User));
        await _staffRepo.UpdateAsync(staff, cancellationToken);

        return await MapStaffAsync(staff);
    }

    public async Task DeleteStaffAsync(
        int staffId,
        CancellationToken cancellationToken = default)
    {
        var staff = await _staffRepo.GetByIdAsync(staffId, cancellationToken)
            ?? throw new KeyNotFoundException("Staff profile not found.");

        var deleteResult = await _userManager.DeleteAsync(staff.User);
        if (deleteResult.Succeeded)
            return;

        EnsureIdentitySucceeded(deleteResult);
        await _staffRepo.DeleteAsync(staff, cancellationToken);
    }

    public async Task<CustomerProfileDto> RegisterCustomerAsync(Guid staffId, StaffRegisterCustomerDto dto)
    {
        _ = await _staffRepo.GetByUserIdAsync(staffId)
            ?? throw new KeyNotFoundException("Staff profile not found.");

        var existing = await _userManager.FindByEmailAsync(dto.Email);

        if (existing != null)
            throw new InvalidOperationException("A customer with this email already exists.");

        var existingPhone = await _customerRepo.GetByPhoneAsync(dto.Phone);

        if (existingPhone != null)
            throw new InvalidOperationException(
                "Phone number is already registered."
            );

        var user = new User
        {
            UserName = dto.Email,
            Email = dto.Email
        };

        var result = await _userManager.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new InvalidOperationException(errors);
        }

        if (!await _roleManager.RoleExistsAsync("Customer"))
            await _roleManager.CreateAsync(new IdentityRole<Guid>("Customer"));

        await _userManager.AddToRoleAsync(user, "Customer");

        var customer = new Customer
        {
            UserId = user.Id,
            Phone = dto.Phone,
            Address = dto.Address,
            CreatedAt = DateTime.UtcNow
        };

        await _customerRepo.AddAsync(customer);

        if (dto.Vehicle != null)
        {
            var vehicle = new Vehicle
            {
                CustomerId = customer.CustomerId,
                VehicleNumber = dto.Vehicle.VehicleNumber,
                Brand = dto.Vehicle.Brand,
                Model = dto.Vehicle.Model,
                Year = dto.Vehicle.Year
            };

            await _vehicleRepo.AddAsync(vehicle);
            customer.Vehicles.Add(vehicle);
        }

        return new CustomerProfileDto
        {
            CustomerId = customer.CustomerId,
            UserId = user.Id,
            Email = user.Email!,
            Phone = customer.Phone,
            Address = customer.Address,
            CreatedAt = customer.CreatedAt,
            Vehicles = customer.Vehicles.Select(v => new VehicleDto
            {
                VehicleId = v.VehicleId,
                VehicleNumber = v.VehicleNumber,
                Brand = v.Brand,
                Model = v.Model,
                Year = v.Year
            }).ToList()
        };
    }

    private async Task<StaffProfileDto> MapStaffAsync(Staff staff)
    {
        var roles = await _userManager.GetRolesAsync(staff.User);

        return new StaffProfileDto
        {
            StaffId = staff.StaffId,
            UserId = staff.UserId,
            Email = staff.User.Email ?? string.Empty,
            PhoneNumber = staff.User.PhoneNumber ?? string.Empty,
            Position = staff.Position,
            Salary = staff.Salary,
            JoinedDate = staff.JoinedDate,
            Roles = roles.ToList()
        };
    }

    private async Task ReplaceManagedRoleAsync(User user, string role)
    {
        await EnsureRoleExistsAsync(role);

        var currentRoles = await _userManager.GetRolesAsync(user);
        var removableRoles = currentRoles
            .Where(r => ManagedStaffRoles.Contains(r, StringComparer.OrdinalIgnoreCase))
            .ToList();

        if (removableRoles.Count > 0)
            EnsureIdentitySucceeded(await _userManager.RemoveFromRolesAsync(user, removableRoles));

        if (!await _userManager.IsInRoleAsync(user, role))
            EnsureIdentitySucceeded(await _userManager.AddToRoleAsync(user, role));
    }

    private async Task EnsureRoleExistsAsync(string role)
    {
        if (!await _roleManager.RoleExistsAsync(role))
            EnsureIdentitySucceeded(await _roleManager.CreateAsync(new IdentityRole<Guid>(role)));
    }

    private static string NormalizeManagedRole(string? role, string fallback)
    {
        if (string.IsNullOrWhiteSpace(role))
            return fallback;

        var match = ManagedStaffRoles.FirstOrDefault(r =>
            string.Equals(r, role.Trim(), StringComparison.OrdinalIgnoreCase));

        return match ?? throw new ArgumentException("Staff role must be either Admin or Staff.");
    }

    private static void EnsureIdentitySucceeded(IdentityResult result)
    {
        if (result.Succeeded)
            return;

        var errors = string.Join(", ", result.Errors.Select(e => e.Description));
        throw new InvalidOperationException(errors);
    }


    public async Task<IEnumerable<CustomerProfileDto>>
    GetCustomersAsync()
    {
        var customers = await _customerRepo.GetAllAsync();

        return customers.Select(c =>
            new CustomerProfileDto
            {
                CustomerId = c.CustomerId,
                UserId = c.UserId,
                Email = c.User.Email,
                Phone = c.Phone,
                Address = c.Address,
                CreatedAt = c.CreatedAt,

                Vehicles = c.Vehicles.Select(v =>
                    new VehicleDto
                    {
                        VehicleId = v.VehicleId,
                        VehicleNumber = v.VehicleNumber,
                        Brand = v.Brand,
                        Model = v.Model,
                        Year = v.Year
                    }).ToList()
            });
    }
}