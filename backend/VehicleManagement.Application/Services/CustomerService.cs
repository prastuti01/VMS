using Microsoft.AspNetCore.Identity;
using VehicleManagement.Application.DTOs.Customer;
using VehicleManagement.Application.Interfaces;
using VehicleManagement.Domain.Entities;

namespace VehicleManagement.Application.Services;

// Handles everything related to a customer's profile and their vehicles
public class CustomerService : ICustomerService
{
    private readonly ICustomerRepository _customerRepo;
    private readonly IVehicleRepository _vehicleRepo;
    private readonly UserManager<User> _userManager;

    public CustomerService(
        ICustomerRepository customerRepo,
        IVehicleRepository vehicleRepo,
        UserManager<User> userManager)
    {
        _customerRepo = customerRepo;
        _vehicleRepo = vehicleRepo;
        _userManager = userManager;
    }

    // Fetches the full profile of a customer using their auth user ID
    public async Task<CustomerProfileDto> GetProfileAsync(Guid userId)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString())
            ?? throw new KeyNotFoundException("User not found.");

        var customer = await _customerRepo.GetByUserIdAsync(userId)
            ?? throw new KeyNotFoundException("Customer profile not found.");

        return MapToDto(user, customer);
    }

    // Updates the customer's contact info (phone and address) and returns the refreshed profile
    public async Task<CustomerProfileDto> UpdateProfileAsync(Guid userId, UpdateCustomerDto dto)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString())
            ?? throw new KeyNotFoundException("User not found.");

        var customer = await _customerRepo.GetByUserIdAsync(userId)
            ?? throw new KeyNotFoundException("Customer profile not found.");

        customer.Phone = dto.Phone;
        customer.Address = dto.Address;
        await _customerRepo.UpdateAsync(customer);

        return MapToDto(user, customer);
    }

    // Registers a new vehicle under the customer's account
    public async Task<VehicleDto> AddVehicleAsync(Guid userId, AddVehicleDto dto)
    {
        var customer = await _customerRepo.GetByUserIdAsync(userId)
            ?? throw new KeyNotFoundException("Customer profile not found.");

        var vehicle = new Vehicle
        {
            CustomerId = customer.CustomerId,
            VehicleNumber = dto.VehicleNumber,
            Brand = dto.Brand,
            Model = dto.Model,
            Year = dto.Year
        };

        await _vehicleRepo.AddAsync(vehicle);

        return new VehicleDto
        {
            VehicleId = vehicle.VehicleId,
            VehicleNumber = vehicle.VehicleNumber,
            Brand = vehicle.Brand,
            Model = vehicle.Model,
            Year = vehicle.Year
        };
    }
    
    // Delete customer account completely
    public async Task DeleteAccountAsync(Guid userId)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString())
                   ?? throw new KeyNotFoundException("User not found.");

        // Explicitly delete customer record first before removing the identity user
        var customer = await _customerRepo.GetByUserIdAsync(userId);
        if (customer != null)
            await _customerRepo.DeleteAsync(customer);

        // Now delete the identity user also cleans up AspNetUserRoles
        var result = await _userManager.DeleteAsync(user);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new InvalidOperationException(errors);
        }
    }

// Edit vehicle details
    public async Task<VehicleDto> UpdateVehicleAsync(
        Guid userId, int vehicleId, AddVehicleDto dto)
    {
        var customer = await _customerRepo.GetByUserIdAsync(userId)
                       ?? throw new KeyNotFoundException("Customer profile not found.");

        var vehicle = await _vehicleRepo.GetByIdAsync(vehicleId)
                      ?? throw new KeyNotFoundException("Vehicle not found.");

        // Make sure customer owns this vehicle
        if (vehicle.CustomerId != customer.CustomerId)
            throw new UnauthorizedAccessException(
                "You can only edit your own vehicles.");

        vehicle.VehicleNumber = dto.VehicleNumber;
        vehicle.Brand = dto.Brand;
        vehicle.Model = dto.Model;
        vehicle.Year = dto.Year;

        await _vehicleRepo.UpdateAsync(vehicle);

        return new VehicleDto
        {
            VehicleId = vehicle.VehicleId,
            VehicleNumber = vehicle.VehicleNumber,
            Brand = vehicle.Brand,
            Model = vehicle.Model,
            Year = vehicle.Year
        };
    }

    // Removes a vehicle — but only if it actually belongs to this customer
    public async Task DeleteVehicleAsync(Guid userId, int vehicleId)
    {
        var customer = await _customerRepo.GetByUserIdAsync(userId)
            ?? throw new KeyNotFoundException("Customer profile not found.");

        var vehicle = await _vehicleRepo.GetByIdAsync(vehicleId)
            ?? throw new KeyNotFoundException("Vehicle not found.");

        // Prevent customers from deleting vehicles that aren't theirs
        if (vehicle.CustomerId != customer.CustomerId)
            throw new UnauthorizedAccessException("You can only delete your own vehicles.");

        await _vehicleRepo.DeleteAsync(vehicle);
    }

    // Combines user identity data and customer profile into a single response DTO
    private static CustomerProfileDto MapToDto(User user, Customer customer) =>
        new()
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