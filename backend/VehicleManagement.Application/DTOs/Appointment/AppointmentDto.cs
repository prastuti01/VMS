namespace VehicleManagement.Application.DTOs.Appointment;

public class AppointmentDto
{
    public int AppointmentId { get; set; }
    public int CustomerId { get; set; }
    public int VehicleId { get; set; }
    public DateTime AppointmentDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string VehicleName { get; set; } = string.Empty;
}
