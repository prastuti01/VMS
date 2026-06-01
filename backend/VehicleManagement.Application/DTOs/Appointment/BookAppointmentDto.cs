namespace VehicleManagement.Application.DTOs.Appointment;

public class BookAppointmentDto
{
    public int VehicleId { get; set; }
    public DateTime AppointmentDate { get; set; }
    public string Status { get; set; } = "Pending";
}
