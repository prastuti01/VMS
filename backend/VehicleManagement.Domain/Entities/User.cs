using Microsoft.AspNetCore.Identity;

namespace VehicleManagement.Domain.Entities;

public class User : IdentityUser<Guid>
{
    public Customer? Customer { get; set; } // Customer profile if user is a customer
    public Staff? Staff { get; set; }       // Staff profile if user is an employee
}