using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using VehicleManagement.Application.Interfaces;
using VehicleManagement.Application.Services;
using VehicleManagement.Domain.Entities;
using VehicleManagement.Infrastructure.Data;
using VehicleManagement.Infrastructure.Repositories;
using VehicleManagement.Infrastructure.Services;

namespace VehicleManagement.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Connecting to PostgreSQL using the connection string from appsettings.json
        // so credentials are never hardcoded in source code.
        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(
                configuration.GetConnectionString("DefaultConnection")));

        // Handing user and role management over to ASP.NET Identity.
        // Using our own User class so we can extend it later,
        // and Guid as the primary key to avoid sequential ID enumeration attacks.
        services.AddIdentity<User, IdentityRole<Guid>>()
            .AddEntityFrameworkStores<AppDbContext>()
            .AddDefaultTokenProviders();

        // Enforcing strong passwords.
        services.Configure<IdentityOptions>(options =>
        {
            options.Password.RequiredLength = 8;
            options.Password.RequireDigit = true;
            options.Password.RequireLowercase = true;
            options.Password.RequireUppercase = true;
            options.Password.RequireNonAlphanumeric = true;

            options.User.RequireUniqueEmail = true;

            options.Lockout.MaxFailedAccessAttempts = 5;
            options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
            options.Lockout.AllowedForNewUsers = true;
        });

        // Using JWT Bearer authentication.
        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,

                ValidIssuer = configuration["Jwt:Issuer"],
                ValidAudience = configuration["Jwt:Audience"],

                IssuerSigningKey = new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(
                        configuration["Jwt:Key"]
                            ?? throw new InvalidOperationException(
                                "JWT key is not configured.")))
            };
        });

        // Enabling [Authorize] attributes.
        services.AddAuthorization();

        // Existing repositories for auth/customer/staff support.
        services.AddScoped<ICustomerRepository, CustomerRepository>();
        services.AddScoped<IVehicleRepository, VehicleRepository>();




        // Repositories for vendor purchasing, part sales, invoice emailing,
        // and customer history.

        services.AddScoped<IVendorRepository, VendorRepository>();
        services.AddScoped<IPartRepository, PartRepository>();
        services.AddScoped<IPurchaseInvoiceRepository, PurchaseInvoiceRepository>();
        services.AddScoped<ISalesInvoiceRepository, SalesInvoiceRepository>();
        services.AddScoped<ICustomerHistoryRepository, CustomerHistoryRepository>();

        services.AddScoped<IStaffRepository, StaffRepository>();

        services.AddScoped<IEmailSender, SmtpEmailSender>();


        // Existing application services.
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<ICustomerService, CustomerService>();

        services.AddScoped<IStaffService,    StaffService>();
        services.AddScoped<IPartRepository, PartRepository>();
        services.AddScoped<IPartService, PartService>();
        services.AddScoped<IFinancialReportRepository, FinancialReportRepository>();
        services.AddScoped<IFinancialReportService, FinancialReportService>();

        // Customer report services and repositories.
        services.AddScoped<ICustomerReportRepository, CustomerReportRepository>();
        services.AddScoped<ICustomerReportService, CustomerReportService>();

        // Application services for the same feature slice.

        services.AddScoped<IVendorService, VendorService>();
        services.AddScoped<IPartService, PartService>();
        services.AddScoped<IPurchaseInvoiceService, PurchaseInvoiceService>();
        services.AddScoped<ISalesInvoiceService, SalesInvoiceService>();
        services.AddScoped<ICustomerHistoryService, CustomerHistoryService>();

        // Appointment services and repositories.
        services.AddScoped<IAppointmentRepository, AppointmentRepository>();
        services.AddScoped<IAppointmentService, AppointmentService>();

        // PartRequest services and repositories.
        services.AddScoped<IPartRequestRepository, PartRequestRepository>();
        services.AddScoped<IPartRequestService, PartRequestService>();

        // Review services and repositories.
        services.AddScoped<IReviewRepository, ReviewRepository>();
        services.AddScoped<IReviewService, ReviewService>();

        services.AddScoped<IReminderService, ReminderService>();
        services.AddScoped<IAdminDashboardRepository, AdminDashboardRepository>();
        services.AddScoped<IAdminDashboardService, AdminDashboardService>();
        services.AddScoped<ICustomerSearchRepository, CustomerSearchRepository>();
        services.AddScoped<ICustomerSearchService, CustomerSearchService>();

        return services;
    }
}
