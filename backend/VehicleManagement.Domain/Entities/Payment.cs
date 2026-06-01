using System;
using System.Collections.Generic;
using System.Text;
using System.ComponentModel.DataAnnotations;

namespace VehicleManagement.Domain.Entities
{
    public class Payment
    {
        [Key]
        public int PaymentId { get; set; }

        public int SaleId { get; set; }
        public SalesInvoice SalesInvoice { get; set; }

        public decimal AmountPaid { get; set; }
        public DateTime PaymentDate { get; set; }
        public decimal RemainingBalance { get; set; }
    }
}
