using System;
using System.Collections.Generic;
using System.Text;
using System.ComponentModel.DataAnnotations;

namespace VehicleManagement.Domain.Entities
{
    public class SalesInvoice
    {
        [Key]
        public int SaleId { get; set; }

        public int CustomerId { get; set; }
        public int StaffId { get; set; }

        public DateTime SaleDate { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal Discount { get; set; }
        public decimal FinalAmount { get; set; }
        public string PaymentStatus { get; set; } = "Pending";

        public Customer Customer { get; set; }
        public Staff Staff { get; set; }

        public ICollection<SalesItem> SalesItems { get; set; } = new List<SalesItem>();
        public ICollection<Payment> Payments { get; set; } = new List<Payment>();
    }
}
