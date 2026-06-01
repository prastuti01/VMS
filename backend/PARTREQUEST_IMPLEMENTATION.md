# PartRequest Backend Implementation Documentation

## Overview
Complete backend implementation for the PartRequest feature including DTOs, repositories, services, and REST API controllers.

## Architecture Layers

### 1. **DTOs (Data Transfer Objects)**
Location: `VehicleManagement.Application/DTOs/PartRequest/`

- **CreatePartRequestDto**: Used when creating a new part request
  - `PartName` (required): Name of the requested part
  - `Description` (required): Detailed description of the request
  - `RequestDate` (DateTime): Date of the request (converted to UTC before saving)
  - `Status` (optional, defaults to "Pending"): Request status

- **UpdatePartRequestDto**: Used when updating an existing part request
  - Same fields as CreatePartRequestDto

- **PartRequestDto**: Used when returning data to the client
  - `RequestId`: Auto-generated primary key
  - `CustomerId`: Foreign key to Customer
  - `PartName`: Name of the part
  - `Description`: Description of the request
  - `RequestDate`: Date of the request (in UTC)
  - `Status`: Current status
  - `CustomerName`: Related customer's name (populated from User)

### 2. **Repository Layer**
Location: `VehicleManagement.Application/Interfaces/` and `VehicleManagement.Infrastructure/Repositories/`

#### IPartRequestRepository Interface
CRUD operations:
- `AddAsync(PartRequest)`: Create a new part request
- `GetByIdAsync(int)`: Get request by ID with full relationships loaded
- `GetAllAsync()`: Get all part requests (Admin)
- `GetByCustomerIdAsync(int)`: Get requests for a specific customer
- `GetByStatusAsync(string)`: Filter requests by status
- `UpdateAsync(PartRequest)`: Update an existing request
- `DeleteAsync(int)`: Delete a request

#### PartRequestRepository Implementation
- Uses Entity Framework Core with eager loading of relationships
- Includes Customer and User data in all queries
- All operations are async
- DateTime handling: RequestDate is handled with proper UTC conversion at the service level

### 3. **Service Layer**
Location: `VehicleManagement.Application/Services/PartRequestService.cs`

#### IPartRequestService Interface
Business logic operations:
- `CreatePartRequestAsync(Guid userId, CreatePartRequestDto)`: Create request with validation
- `GetPartRequestAsync(int)`: Retrieve single request
- `GetMyPartRequestsAsync(Guid userId)`: Get customer's own requests
- `GetAllPartRequestsAsync()`: Get all requests (Admin)
- `GetPartRequestsByStatusAsync(string)`: Filter by status (Admin)
- `UpdatePartRequestAsync(int, UpdatePartRequestDto)`: Update request with validation
- `DeletePartRequestAsync(int)`: Delete request

#### PartRequestService Implementation
- **Key Feature**: DateTime UTC Conversion
  - Uses `DateTime.SpecifyKind(dto.RequestDate, DateTimeKind.Utc)` to ensure PostgreSQL compatibility
  - Applied in both `CreatePartRequestAsync` and `UpdatePartRequestAsync`
  - This prevents the "Cannot write DateTime with Kind=Unspecified to PostgreSQL type 'timestamp with time zone'" error

- **Validation**:
  - Verifies user exists and has customer profile
  - Validates PartName and Description are not empty
  - Ensures Status is set (defaults to "Pending" if not provided)

- **Data Mapping**:
  - Maps entities to DTOs with customer name population
  - UserManager is used to fetch customer username

### 4. **Controller Layer**
Location: `VehicleManagement/Controllers/PartRequestController.cs`

#### REST Endpoints

**Create Part Request**
```
POST /api/part-requests
Authorization: Bearer {token} (Customer role required)
Body: CreatePartRequestDto
Response: 201 Created with PartRequestDto
```

**Get Single Part Request**
```
GET /api/part-requests/{id}
Authorization: Bearer {token} (Customer or Admin)
Response: 200 OK with PartRequestDto
```

**Get My Part Requests**
```
GET /api/part-requests/my-requests
Authorization: Bearer {token} (Customer role required)
Response: 200 OK with List<PartRequestDto>
```

**Get All Part Requests**
```
GET /api/part-requests
Authorization: Bearer {token} (Admin role required)
Response: 200 OK with List<PartRequestDto>
```

**Get Part Requests by Status**
```
GET /api/part-requests/status/{status}
Authorization: Bearer {token} (Admin role required)
Response: 200 OK with List<PartRequestDto>
```

**Update Part Request**
```
PUT /api/part-requests/{id}
Authorization: Bearer {token} (Admin role required)
Body: UpdatePartRequestDto
Response: 200 OK with PartRequestDto
```

**Delete Part Request**
```
DELETE /api/part-requests/{id}
Authorization: Bearer {token} (Admin role required)
Response: 204 No Content
```

## Dependency Injection Registration

Added to `VehicleManagement.Infrastructure/DependencyInjection.cs`:

```csharp
// PartRequest services and repositories.
services.AddScoped<IPartRequestRepository, PartRequestRepository>();
services.AddScoped<IPartRequestService, PartRequestService>();
```

## Key Design Decisions

### 1. **DateTime UTC Conversion**
- The `RequestDate` field is converted to UTC before saving to ensure PostgreSQL compatibility
- This matches the pattern applied to the Appointment feature
- Prevents `DbUpdateException` related to timestamp with time zone columns

### 2. **Authorization**
- Customers can only create and view their own requests
- Admins can view all requests and manage their status
- Only Admins can update or delete requests

### 3. **Entity Relationships**
- PartRequest → Customer (Many-to-One)
- PartRequest → User (via Customer)
- All queries include eager loading of related entities using `.Include()` and `.ThenInclude()`

### 4. **Error Handling**
- Throws `KeyNotFoundException` when records don't exist
- Throws `ArgumentException` for validation failures
- These are caught by global exception handling middleware

### 5. **Status Field**
- Stores text status (e.g., "Pending", "Approved", "Rejected")
- Flexible design allows for future status workflows
- Consider implementing an enum-based approach if status values are fixed

## Testing the Implementation

### 1. Create a Part Request (as Customer)
```json
POST /api/part-requests
Authorization: Bearer {customer_token}

{
  "partName": "Air Filter",
  "description": "Need a replacement air filter for regular maintenance",
  "requestDate": "2026-05-20T10:30:00",
  "status": "Pending"
}
```

### 2. View Your Requests (as Customer)
```
GET /api/part-requests/my-requests
Authorization: Bearer {customer_token}
```

### 3. View All Requests (as Admin)
```
GET /api/part-requests
Authorization: Bearer {admin_token}
```

### 4. Update Request Status (as Admin)
```json
PUT /api/part-requests/1
Authorization: Bearer {admin_token}

{
  "partName": "Air Filter",
  "description": "Need a replacement air filter for regular maintenance",
  "requestDate": "2026-05-20T10:30:00",
  "status": "Approved"
}
```

## Database Schema

The PartRequests table has the following structure:
```
RequestId (PK, int)
CustomerId (FK, int)
PartName (varchar)
Description (text)
RequestDate (timestamp with time zone)
Status (varchar)
```

## Future Enhancements

1. **Status Enum**: Consider converting Status to a strongly-typed enum
2. **Notifications**: Implement email notifications when status changes
3. **Pagination**: Add pagination to GetAllPartRequestsAsync and GetByCustomerIdAsync
4. **Search/Filter**: Add more filtering options (by date range, part name, etc.)
5. **Audit Trail**: Track who updated the status and when
6. **Part Auto-matching**: Integrate with inventory system to suggest matching parts

## Related Features

- **Appointment**: Similar feature with DateTime UTC handling
- **Part**: Existing parts in inventory that could be linked to PartRequests
- **Customer**: Related entity for customer information
