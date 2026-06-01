
﻿using VehicleManagement.Domain.Entities;

namespace VehicleManagement.Application.Interfaces;

public interface IPartRepository
{
    Task<List<Part>> GetAllAsync();

    Task<List<Part>> GetByVendorIdAsync(int vendorId);

    Task<Part?> GetByIdAsync(int partId);

    Task<bool> VendorExistsAsync(int vendorId);
    Task<bool> PartExistsAsync(
    string name,
    int vendorId,
    int? ignorePartId = null);
    Task AddAsync(Part part);

    Task UpdateAsync(Part part);

    Task DeleteAsync(Part part);

    Task<bool> HasLinkedRecordsAsync(int partId);
}

