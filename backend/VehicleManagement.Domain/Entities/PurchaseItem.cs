using System;
using System.Collections.Generic;
using System.Text;
using System.ComponentModel.DataAnnotations;

namespace VehicleManagement.Domain.Entities
{
    public class PurchaseItem
    {
        [Key]
        public int PurchaseItemId { get; set; }

        public int PurchaseId { get; set; }
        public PurchaseInvoice PurchaseInvoice { get; set; }

        public int PartId { get; set; }
        public Part Part { get; set; }

        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
    }
}
