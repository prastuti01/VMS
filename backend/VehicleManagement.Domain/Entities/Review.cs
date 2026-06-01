using System;
using System.Collections.Generic;
using System.Text;
using System.ComponentModel.DataAnnotations;

namespace VehicleManagement.Domain.Entities
{
    public class Review
    {
        [Key]
        public int ReviewId { get; set; }

        public int CustomerId { get; set; }
        public Customer Customer { get; set; }

        public int Rating { get; set; }
        public string Comment { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}
