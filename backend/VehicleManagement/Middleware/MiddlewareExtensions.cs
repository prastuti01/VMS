namespace VehicleManagement.Middleware;

public static class MiddlewareExtensions
{
    // Convenience extension so Program.cs reads cleanly: app.UseExceptionHandling()
    public static IApplicationBuilder UseExceptionHandling(
        this IApplicationBuilder app)
    {
        return app.UseMiddleware<ExceptionHandlingMiddleware>();
    }
}