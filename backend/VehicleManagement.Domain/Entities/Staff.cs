namespace VehicleManagement.Domain.Entities;

public class Staff
{
    public int StaffId { get; set; }  // Unique ID for each employee
    public Guid UserId { get; set; }  // For user account (login credentials)
    public string Position { get; set; } = string.Empty; // Job title 
    public decimal Salary { get; set; } // Employee's monthly/yearly pay
    public DateTime JoinedDate { get; set; } = DateTime.UtcNow; // When the employee started working

    public User User { get; set; } = null!; // The actual user account behind this staff member
}