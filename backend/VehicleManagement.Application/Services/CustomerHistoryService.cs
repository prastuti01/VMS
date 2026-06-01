using VehicleManagement.Application.DTOs.CustomerHistory;
using VehicleManagement.Application.Interfaces;
using VehicleManagement.Domain.Entities;

namespace VehicleManagement.Application.Services;

public class CustomerHistoryService : ICustomerHistoryService
{
    private readonly ICustomerHistoryRepository _customerHistoryRepository;

    public CustomerHistoryService(ICustomerHistoryRepository customerHistoryRepository)
    {
        _customerHistoryRepository = customerHistoryRepository;
    }

    public async Task<CustomerHistoryDto> GetByCustomerIdAsync(int customerId)
    {
        var customer = await _customerHistoryRepository
            .GetCustomerWithVehiclesByCustomerIdAsync(customerId)
            ?? throw new KeyNotFoundException("Customer not found.");

        return await BuildHistoryDtoAsync(customer);
    }

    public async Task<CustomerHistoryDto> GetByUserIdAsync(Guid userId)
    {
        var customer = await _customerHistoryRepository
            .GetCustomerWithVehiclesByUserIdAsync(userId)
            ?? throw new KeyNotFoundException("Customer not found.");

        return await BuildHistoryDtoAsync(customer);
    }

    private async Task<CustomerHistoryDto> BuildHistoryDtoAsync(Customer customer)
    {
        var sales = await _customerHistoryRepository
            .GetSalesInvoicesByCustomerIdAsync(customer.CustomerId);

        var appointments = await _customerHistoryRepository
            .GetAppointmentsByCustomerIdAsync(customer.CustomerId);

        var totalPurchaseAmount = sales.Sum(s => s.FinalAmount);
        var totalPaidAmount = sales.Sum(s => s.Payments.Sum(p => p.AmountPaid));
        var pendingBalance = sales.Sum(s =>
        {
            var paid = s.Payments.Sum(p => p.AmountPaid);
            var balance = s.FinalAmount - paid;
            return balance > 0 ? balance : 0;
        });

        return new CustomerHistoryDto
        {
            CustomerId = customer.CustomerId,
            UserId = customer.UserId,
            Email = customer.User?.Email ?? string.Empty,
            Phone = customer.Phone,
            Address = customer.Address,
            CreatedAt = customer.CreatedAt,
            TotalPurchaseAmount = totalPurchaseAmount,
            TotalPaidAmount = totalPaidAmount,
            PendingBalance = pendingBalance,

            Vehicles = customer.Vehicles.Select(v => new CustomerHistoryVehicleDto
            {
                VehicleId = v.VehicleId,
                VehicleNumber = v.VehicleNumber,
                Brand = v.Brand,
                Model = v.Model,
                Year = v.Year
            }).ToList(),

            PurchaseHistory = sales.Select(MapSale).ToList(),
            ServiceHistory = appointments.Select(MapAppointment).ToList()
        };
    }

    private static CustomerSaleHistoryDto MapSale(SalesInvoice sale)
    {
        return new CustomerSaleHistoryDto
        {
            SaleId = sale.SaleId,
            StaffId = sale.StaffId,
            SaleDate = sale.SaleDate,
            TotalAmount = sale.TotalAmount,
            Discount = sale.Discount,
            FinalAmount = sale.FinalAmount,
            PaymentStatus = sale.PaymentStatus,

            Items = sale.SalesItems.Select(item => new CustomerSaleItemHistoryDto
            {
                SalesItemId = item.SalesItemId,
                PartId = item.PartId,
                PartName = item.Part?.Name ?? string.Empty,
                Category = item.Part?.Category ?? string.Empty,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice,
                LineTotal = item.Quantity * item.UnitPrice
            }).ToList(),

            Payments = sale.Payments.Select(payment => new CustomerPaymentHistoryDto
            {
                PaymentId = payment.PaymentId,
                AmountPaid = payment.AmountPaid,
                PaymentDate = payment.PaymentDate,
                RemainingBalance = payment.RemainingBalance
            }).ToList()
        };
    }

    private static CustomerAppointmentHistoryDto MapAppointment(Appointment appointment)
    {
        return new CustomerAppointmentHistoryDto
        {
            AppointmentId = appointment.AppointmentId,
            VehicleId = appointment.VehicleId,
            VehicleNumber = appointment.Vehicle?.VehicleNumber ?? string.Empty,
            AppointmentDate = appointment.AppointmentDate,
            Status = appointment.Status
        };
    }
}