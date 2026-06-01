using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using VehicleManagement.Domain.Entities;

namespace VehicleManagement.Infrastructure.Data;

public class AppDbContext : IdentityDbContext<User, IdentityRole<Guid>, Guid>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    // Our own tables on top of the Identity tables.
    // Identity tables (AspNetUsers, AspNetRoles, etc.) come from IdentityDbContext automatically.
    public DbSet<Customer>        Customers        => Set<Customer>();
    public DbSet<Vehicle>         Vehicles         => Set<Vehicle>();
    public DbSet<Staff>           Staff            => Set<Staff>();
    public DbSet<Vendor>          Vendors          => Set<Vendor>();
    public DbSet<Part>            Parts            => Set<Part>();
    public DbSet<PurchaseInvoice> PurchaseInvoices => Set<PurchaseInvoice>();
    public DbSet<PurchaseItem>    PurchaseItems    => Set<PurchaseItem>();
    public DbSet<SalesInvoice>    SalesInvoices    => Set<SalesInvoice>();
    public DbSet<SalesItem>       SalesItems       => Set<SalesItem>();
    public DbSet<Payment>         Payments         => Set<Payment>();
    public DbSet<Review>          Reviews          => Set<Review>();
    public DbSet<Appointment>     Appointments     => Set<Appointment>();
    public DbSet<PartRequest>     PartRequests     => Set<PartRequest>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        // Always calling the base first — it configures all the Identity tables.
        // Skipping this would break login, roles, and everything Identity manages.
        base.OnModelCreating(builder);

        ConfigureRelationships(builder);

        // No seeding here — seeding is handled by DbSeeder.cs at runtime,
        // which means we get proper error handling and no EF migration warnings.
    }

    // -------------------------------------------------------------------------
    // Relationships
    // -------------------------------------------------------------------------

    private static void ConfigureRelationships(ModelBuilder builder)
    {
        // A user can register as a customer. Deleting the user also deletes
        // their customer profile so we never leave orphaned records behind.
        builder.Entity<Customer>(e =>
        {
            e.HasKey(c => c.CustomerId);
            e.HasOne(c => c.User)
             .WithOne(u => u.Customer)
             .HasForeignKey<Customer>(c => c.UserId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // A customer can own many vehicles. Deleting the customer removes
        // all their vehicles automatically.
        builder.Entity<Vehicle>(e =>
        {
            e.HasKey(v => v.VehicleId);
            e.HasOne(v => v.Customer)
             .WithMany(c => c.Vehicles)
             .HasForeignKey(v => v.CustomerId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // A user can also be a staff member. Same rule — delete the user
        // and their staff profile is cleaned up too.
        builder.Entity<Staff>(e =>
        {
            e.HasKey(s => s.StaffId);
            e.HasOne(s => s.User)
             .WithOne(u => u.Staff)
             .HasForeignKey<Staff>(s => s.UserId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // Vendor - Part relationship
        builder.Entity<Part>()
            .HasOne(p => p.Vendor)
            .WithMany(v => v.Parts)
            .HasForeignKey(p => p.VendorId)
            .OnDelete(DeleteBehavior.Restrict);

        // Vendor - PurchaseInvoice relationship
        builder.Entity<PurchaseInvoice>()
            .HasOne(pi => pi.Vendor)
            .WithMany(v => v.PurchaseInvoices)
            .HasForeignKey(pi => pi.VendorId);

        // PurchaseInvoice - PurchaseItem relationship
        builder.Entity<PurchaseItem>()
            .HasOne(pi => pi.PurchaseInvoice)
            .WithMany(p => p.PurchaseItems)
            .HasForeignKey(pi => pi.PurchaseId);

        // Part - PurchaseItem relationship
        builder.Entity<PurchaseItem>()
            .HasOne(pi => pi.Part)
            .WithMany(p => p.PurchaseItems)
            .HasForeignKey(pi => pi.PartId);

        // SalesInvoice - Staff relationship
        builder.Entity<SalesInvoice>()
            .HasOne(s => s.Staff)
            .WithMany()
            .HasForeignKey(s => s.StaffId);

        // SalesInvoice - SalesItem relationship
        builder.Entity<SalesItem>()
            .HasOne(si => si.SalesInvoice)
            .WithMany(s => s.SalesItems)
            .HasForeignKey(si => si.SaleId);

        // Part - SalesItem relationship
        builder.Entity<SalesItem>()
            .HasOne(si => si.Part)
            .WithMany(p => p.SalesItems)
            .HasForeignKey(si => si.PartId);

        // SalesInvoice - Payment relationship
        builder.Entity<Payment>()
            .HasOne(p => p.SalesInvoice)
            .WithMany(s => s.Payments)
            .HasForeignKey(p => p.SaleId);

        // Customer - Review relationship
        builder.Entity<Review>()
            .HasOne(r => r.Customer)
            .WithMany()
            .HasForeignKey(r => r.CustomerId);

        // Customer - Appointment relationship
        builder.Entity<Appointment>()
            .HasOne(a => a.Customer)
            .WithMany()
            .HasForeignKey(a => a.CustomerId);

        // Vehicle - Appointment relationship
        builder.Entity<Appointment>()
            .HasOne(a => a.Vehicle)
            .WithMany()
            .HasForeignKey(a => a.VehicleId);

        // Customer - PartRequest relationship
        builder.Entity<PartRequest>()
            .HasOne(p => p.Customer)
            .WithMany()
            .HasForeignKey(p => p.CustomerId);
    }
}