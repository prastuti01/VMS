using VehicleManagement.Infrastructure;
using VehicleManagement.Infrastructure.Data;
using VehicleManagement.Middleware;

var builder = WebApplication.CreateBuilder(args);


builder.Services.AddInfrastructure(builder.Configuration);

// Allow frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "http://localhost:5174"
            )
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddOpenApi();

var app = builder.Build();

// Seed database
using (var scope = app.Services.CreateScope())
{
    await DbSeeder.SeedAsync(scope.ServiceProvider);
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseExceptionHandling();
app.UseCors("AllowFrontend"); // running before auth so OPTIONS preflight requests are not blocked
app.UseAuthentication();      // reading the JWT and establishing who the user is
app.UseAuthorization();       // checking whether that user can access the requested resource

app.MapControllers();

app.Run();