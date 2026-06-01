using System;
using System.Collections.Generic;
using System.Text;
using System.ComponentModel.DataAnnotations;

namespace VehicleManagement.Domain.Entities
{
    public class SalesItem
    {
        [Key]
        public int SalesItemId { get; set; }

        public int SaleId { get; set; }
        public SalesInvoice SalesInvoice { get; set; }

        public int PartId { get; set; }
        public Part Part { get; set; }

        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
    }
}
