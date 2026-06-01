namespace VehicleManagement.Application.DTOs.CustomerHistory;

public class CustomerHistoryDto
{
    public int CustomerId { get; set; }
    public Guid UserId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }

    public decimal TotalPurchaseAmount { get; set; }
    public decimal TotalPaidAmount { get; set; }
    public decimal PendingBalance { get; set; }

    public List<CustomerHistoryVehicleDto> Vehicles { get; set; } = new();
    public List<CustomerSaleHistoryDto> PurchaseHistory { get; set; } = new();
    public List<CustomerAppointmentHistoryDto> ServiceHistory { get; set; } = new();
}

public class CustomerHistoryVehicleDto
{
    public int VehicleId { get; set; }
    public string VehicleNumber { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public int Year { get; set; }
}

public class CustomerSaleHistoryDto
{
    public int SaleId { get; set; }
    public int StaffId { get; set; }
    public DateTime SaleDate { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal Discount { get; set; }
    public decimal FinalAmount { get; set; }
    public string PaymentStatus { get; set; } = string.Empty;

    public List<CustomerSaleItemHistoryDto> Items { get; set; } = new();
    public List<CustomerPaymentHistoryDto> Payments { get; set; } = new();
}

public class CustomerSaleItemHistoryDto
{
    public int SalesItemId { get; set; }
    public int PartId { get; set; }
    public string PartName { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal LineTotal { get; set; }
}

public class CustomerPaymentHistoryDto
{
    public int PaymentId { get; set; }
    public decimal AmountPaid { get; set; }
    public DateTime PaymentDate { get; set; }
    public decimal RemainingBalance { get; set; }
}

public class CustomerAppointmentHistoryDto
{
    public int AppointmentId { get; set; }
    public int VehicleId { get; set; }
    public string VehicleNumber { get; set; } = string.Empty;
    public DateTime AppointmentDate { get; set; }
    public string Status { get; set; } = string.Empty;
}