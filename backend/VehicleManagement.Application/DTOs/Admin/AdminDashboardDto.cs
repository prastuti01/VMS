namespace VehicleManagement.Application.DTOs.Admin;

public class AdminDashboardDto
{
    public DateTime GeneratedAt { get; set; }
    public int TotalCustomers { get; set; }
    public int TotalStaff { get; set; }
    public int TotalVendors { get; set; }
    public int TotalParts { get; set; }
    public int LowStockPartCount { get; set; }
    public int PendingAppointmentCount { get; set; }
    public int PendingPartRequestCount { get; set; }
    public int OverdueCreditCount { get; set; }
    public decimal OverdueCreditAmount { get; set; }
    public PeriodAmountDto Sales { get; set; } = new();
    public PeriodAmountDto Purchases { get; set; } = new();
    public List<LowStockPartDto> LowStockParts { get; set; } = new();
    public List<OverdueCreditReminderDto> OverdueCredits { get; set; } = new();
    public List<RecentSaleDto> RecentSales { get; set; } = new();
}

public class PeriodAmountDto
{
    public decimal Today { get; set; }
    public decimal ThisMonth { get; set; }
    public decimal ThisYear { get; set; }
}

public class LowStockPartDto
{
    public int PartId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public int StockQuantity { get; set; }
    public int ReorderThreshold { get; set; }
    public decimal Price { get; set; }
    public int VendorId { get; set; }
    public string VendorName { get; set; } = string.Empty;
    public string VendorEmail { get; set; } = string.Empty;
}

public class OverdueCreditReminderDto
{
    public int SaleId { get; set; }
    public int CustomerId { get; set; }
    public string CustomerEmail { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public DateTime SaleDate { get; set; }
    public decimal FinalAmount { get; set; }
    public decimal AmountPaid { get; set; }
    public decimal RemainingBalance { get; set; }
    public int DaysOverdue { get; set; }
}

public class RecentSaleDto
{
    public int SaleId { get; set; }
    public int CustomerId { get; set; }
    public string CustomerEmail { get; set; } = string.Empty;
    public DateTime SaleDate { get; set; }
    public decimal FinalAmount { get; set; }
    public string PaymentStatus { get; set; } = string.Empty;
}

public class ReminderSendResultDto
{
    public DateTime GeneratedAt { get; set; }
    public int Attempted { get; set; }
    public int Sent { get; set; }
    public int Skipped { get; set; }
    public string Message { get; set; } = string.Empty;
}
