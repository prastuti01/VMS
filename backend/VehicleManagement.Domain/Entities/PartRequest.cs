using System;
using System.Collections.Generic;
using System.Text;
using System.ComponentModel.DataAnnotations;

namespace VehicleManagement.Domain.Entities
{
    public class PartRequest
    {
        [Key]
        public int RequestId { get; set; }

        public int CustomerId { get; set; }
        public Customer Customer { get; set; }

        public string PartName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime RequestDate { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}
