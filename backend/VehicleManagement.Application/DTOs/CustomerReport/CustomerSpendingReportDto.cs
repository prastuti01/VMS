namespace VehicleManagement.Application.DTOs.CustomerReport;

public class CustomerSpendingReportDto
{
    public int CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public decimal TotalSpent { get; set; }
    public string Category { get; set; } = string.Empty;
}
