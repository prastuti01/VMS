using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;
using VehicleManagement.Application.Interfaces;

namespace VehicleManagement.Infrastructure.Services;

public class SmtpEmailSender : IEmailSender
{
    private readonly IConfiguration _configuration;


    public SmtpEmailSender(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task SendAsync(string to, string subject, string htmlBody)
    {
        var host = _configuration["Email:SmtpHost"];
        var senderEmail = _configuration["Email:SenderEmail"];
        var senderName = _configuration["Email:SenderName"] ?? "Vehicle Management System";
        var username = _configuration["Email:Username"];
        var password = _configuration["Email:Password"];
        var port = int.TryParse(_configuration["Email:SmtpPort"], out var configuredPort)
            ? configuredPort
            : 587;
        var enableSsl = bool.TryParse(_configuration["Email:EnableSsl"], out var configuredSsl)
            ? configuredSsl
            : true;

        using var tcpClient = new System.Net.Sockets.TcpClient();
        try
        {
            await tcpClient.ConnectAsync("smtp.gmail.com", 587);
            Console.WriteLine("✅ TCP connection to smtp.gmail.com:587 succeeded");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ TCP connection FAILED: {ex.Message}");
            throw; // Network is blocked — no point trying SMTP
        }

        if (string.IsNullOrWhiteSpace(host))
            throw new InvalidOperationException("SMTP host is not configured.");

        if (string.IsNullOrWhiteSpace(senderEmail))
            throw new InvalidOperationException("Sender email is not configured.");

        using var message = new MailMessage
        {
            From = new MailAddress(senderEmail, senderName),
            Subject = subject,
            Body = htmlBody,
            IsBodyHtml = true
        };
        message.To.Add(to);

        using var smtpClient = new SmtpClient(host, port)
        {
            EnableSsl = enableSsl,
            DeliveryMethod = SmtpDeliveryMethod.Network,
            UseDefaultCredentials = false
        };

        smtpClient.Credentials =
            new NetworkCredential(username, password);

        smtpClient.Timeout = 20000;

        await smtpClient.SendMailAsync(message);
    }

}
