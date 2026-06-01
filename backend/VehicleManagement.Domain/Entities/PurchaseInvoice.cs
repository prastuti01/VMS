using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System;
using System.Collections.Generic;
using System.Text;
using System.ComponentModel.DataAnnotations;

namespace VehicleManagement.Domain.Entities
{
    public class PurchaseInvoice
    {
        [Key]
        public int PurchaseId { get; set; }

        public int VendorId { get; set; }
        public DateTime PurchaseDate { get; set; }
        public decimal TotalAmount { get; set; }

        public Vendor Vendor { get; set; }
        public ICollection<PurchaseItem> PurchaseItems { get; set; } = new List<PurchaseItem>();
    }
}
