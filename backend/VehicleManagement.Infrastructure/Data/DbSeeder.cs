using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using VehicleManagement.Domain.Entities;

namespace VehicleManagement.Infrastructure.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        var roleManager = services.GetRequiredService<RoleManager<IdentityRole<Guid>>>();
        var userManager = services.GetRequiredService<UserManager<User>>();
        var db = services.GetRequiredService<AppDbContext>();

        await db.Database.MigrateAsync();

        await EnsureRoleAsync(roleManager, "Admin");
        await EnsureRoleAsync(roleManager, "Staff");
        await EnsureRoleAsync(roleManager, "Customer");

        await EnsureAdminAsync(userManager);
        await EnsureStaffAsync(userManager, db);


    }

    private static async Task EnsureRoleAsync(
        RoleManager<IdentityRole<Guid>> roleManager,
        string roleName)
    {
        if (!await roleManager.RoleExistsAsync(roleName))
        {
            await roleManager.CreateAsync(new IdentityRole<Guid>(roleName));
        }
    }

    private static async Task EnsureAdminAsync(UserManager<User> userManager)
    {
        const string email = "admin@vehiclemanagement.com";
        const string password = "Admin@1234";

        if (await userManager.FindByEmailAsync(email) is not null)
        {
            return;
        }

        var admin = new User
        {
            UserName = email,
            Email = email,
            EmailConfirmed = true
        };

        var result = await userManager.CreateAsync(admin, password);

        if (result.Succeeded)
        {
            await userManager.AddToRoleAsync(admin, "Admin");
        }
    }

    private static async Task EnsureStaffAsync(
        UserManager<User> userManager,
        AppDbContext db)
    {
        const string email = "staff@vehiclemanagement.com";
        const string password = "Staff@1234";

        if (await userManager.FindByEmailAsync(email) is not null)
        {
            return;
        }

        var staffUser = new User
        {
            UserName = email,
            Email = email,
            EmailConfirmed = true
        };

        var result = await userManager.CreateAsync(staffUser, password);

        if (!result.Succeeded)
        {
            return;
        }

        await userManager.AddToRoleAsync(staffUser, "Staff");

        var staffProfile = new Staff
        {
            UserId = staffUser.Id,
            Position = "Receptionist",
            Salary = 50000,
            JoinedDate = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        };

        db.Staff.Add(staffProfile);
        await db.SaveChangesAsync();
    }


}

