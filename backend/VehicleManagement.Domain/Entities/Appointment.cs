using System;
using System.Collections.Generic;
using System.Text;
using System.ComponentModel.DataAnnotations;

namespace VehicleManagement.Domain.Entities
{
    public class Appointment
    {
        [Key]
        public int AppointmentId { get; set; }

        public int CustomerId { get; set; }
        public int VehicleId { get; set; }

        public DateTime AppointmentDate { get; set; }
        public string Status { get; set; } = string.Empty;

        public Customer Customer { get; set; }
        public Vehicle Vehicle { get; set; }
    }
}
