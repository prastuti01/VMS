using System.Net;
using System.Text.Json;

namespace VehicleManagement.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(
        RequestDelegate next,
        ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    // Wraps every request in a try/catch — unhandled exceptions never reach the client raw
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    // Maps known exception types to meaningful HTTP status codes;
    // anything unexpected falls back to 500 with a safe generic message
    private static async Task HandleExceptionAsync(
        HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var (statusCode, message) = exception switch
        {
            InvalidOperationException   => (HttpStatusCode.Conflict,           exception.Message),
            UnauthorizedAccessException => (HttpStatusCode.Unauthorized,        exception.Message),
            KeyNotFoundException        => (HttpStatusCode.NotFound,            exception.Message),
            ArgumentException           => (HttpStatusCode.BadRequest,          exception.Message),
            _                           => (HttpStatusCode.InternalServerError, "An unexpected error occurred.")
        };

        context.Response.StatusCode = (int)statusCode;

        // Build a consistent error shape with a timestamp for easier debugging
        var response = new
        {
            statusCode = (int)statusCode,
            message,
            timestamp = DateTime.UtcNow
        };

        var json = JsonSerializer.Serialize(response,
            new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });

        await context.Response.WriteAsync(json);
    }
}