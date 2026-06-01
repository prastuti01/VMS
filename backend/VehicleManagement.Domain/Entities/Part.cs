using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System.ComponentModel.DataAnnotations;
using System;
using System.Collections.Generic;
using System.Text;

namespace VehicleManagement.Domain.Entities
{
    public class Part
    {
        [Key]
        public int PartId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int StockQuantity { get; set; }

        public int VendorId { get; set; }
        public Vendor Vendor { get; set; }

        public ICollection<PurchaseItem> PurchaseItems { get; set; } = new List<PurchaseItem>();
        public ICollection<SalesItem> SalesItems { get; set; } = new List<SalesItem>();
    }
}
