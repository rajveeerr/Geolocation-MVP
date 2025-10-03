# Admin Dashboard Backend Requirements

## Overview
This document outlines the missing backend endpoints and functionality required to fully support the admin dashboard frontend implementation.

## Current Status
✅ **Already Implemented:**
- Admin authentication and role checking (`requireAdmin` middleware)
- City management endpoints (`/api/admin/cities/*`)
- Merchant approval/rejection endpoints (`/api/admin/merchants/*`)

## Missing Endpoints Required

### 1. Admin Dashboard Overview Statistics
**Endpoint:** `GET /api/admin/overview/stats`

**Purpose:** Provide high-level platform statistics for the admin dashboard overview page.

**Response Format:**
```json
{
  "message": "Admin overview stats retrieved successfully",
  "stats": {
    "kpis": {
      "totalRevenue": { "value": 125430.50, "change": 4.2 },
      "newCustomers": { "value": 832, "change": 12.5 },
      "activeDeals": { "value": 1240, "change": -1.8 },
      "totalMerchants": { "value": 212, "change": 2.1 }
    },
    "secondaryStats": {
      "averageOrderValue": 69.68,
      "totalCheckIns": 15832,
      "pendingMerchants": 14,
      "totalUsers": 9872
    },
    "topMerchants": [
      { "name": "The Corner Bistro", "value": "$4,500" },
      { "name": "Zahav", "value": "$3,200" },
      { "name": "Alpen Rose", "value": "$2,800" }
    ],
    "topCities": [
      { "name": "New York", "value": "$25,800" },
      { "name": "Atlanta", "value": "$19,100" },
      { "name": "Philadelphia", "value": "$15,500" }
    ],
    "topCategories": [
      { "name": "Food & Beverage", "value": "1.2k deals" },
      { "name": "Entertainment", "value": "890 deals" },
      { "name": "Retail", "value": "650 deals" }
    ]
  }
}
```

**Authentication:** Requires `requireAdmin` middleware

### 2. Customer Management
**Endpoint:** `GET /api/admin/customers`

**Purpose:** Retrieve paginated list of all customers with search and filtering capabilities.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)
- `search` (optional): Search by name, email, or city
- `city` (optional): Filter by city
- `state` (optional): Filter by state
- `isPaidMember` (optional): Filter by paid membership status

**Response Format:**
```json
{
  "message": "Customers retrieved successfully",
  "customers": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@gmail.com",
      "city": "New York",
      "state": "NY",
      "totalSpend": 150.75,
      "isPaidMember": true,
      "points": 1250,
      "createdAt": "2024-01-15T10:30:00Z",
      "lastActiveAt": "2024-01-20T14:22:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "totalCount": 1250,
    "totalPages": 25,
    "hasNext": true,
    "hasPrev": false
  }
}
```

**Authentication:** Requires `requireAdmin` middleware

### 3. Customer Statistics
**Endpoint:** `GET /api/admin/customers/stats`

**Purpose:** Provide customer-related statistics for admin dashboard.

**Response Format:**
```json
{
  "message": "Customer statistics retrieved successfully",
  "stats": {
    "totalCustomers": 1250,
    "newCustomers30d": 45,
    "activeCustomers30d": 890,
    "paidMembers": 125,
    "averageSpendPerCustomer": 89.50,
    "topCitiesByCustomers": [
      { "name": "New York", "count": 250 },
      { "name": "Atlanta", "count": 180 },
      { "name": "Philadelphia", "count": 120 }
    ]
  }
}
```

**Authentication:** Requires `requireAdmin` middleware

### 4. Deal Management
**Endpoint:** `GET /api/admin/deals`

**Purpose:** Retrieve paginated list of all deals with filtering capabilities.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)
- `status` (optional): Filter by deal status (ACTIVE, INACTIVE, EXPIRED)
- `merchantId` (optional): Filter by merchant
- `categoryId` (optional): Filter by category
- `search` (optional): Search by deal title or description

**Response Format:**
```json
{
  "message": "Deals retrieved successfully",
  "deals": [
    {
      "id": 1,
      "title": "50% Off Pizza",
      "description": "Get 50% off any pizza order",
      "status": "ACTIVE",
      "merchant": {
        "id": 1,
        "businessName": "Pizza Palace"
      },
      "category": {
        "id": 1,
        "name": "Food & Beverage"
      },
      "originalPrice": 20.00,
      "discountedPrice": 10.00,
      "startDate": "2024-01-01T00:00:00Z",
      "endDate": "2024-01-31T23:59:59Z",
      "createdAt": "2023-12-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "totalCount": 500,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

**Authentication:** Requires `requireAdmin` middleware

### 5. Deal Statistics
**Endpoint:** `GET /api/admin/deals/stats`

**Purpose:** Provide deal-related statistics for admin dashboard.

**Response Format:**
```json
{
  "message": "Deal statistics retrieved successfully",
  "stats": {
    "totalDeals": 500,
    "activeDeals": 350,
    "expiredDeals": 100,
    "totalRedemptions": 2500,
    "averageRedemptionsPerDeal": 5.0,
    "topCategoriesByDeals": [
      { "name": "Food & Beverage", "count": 200 },
      { "name": "Entertainment", "count": 150 },
      { "name": "Retail", "count": 100 }
    ]
  }
}
```

**Authentication:** Requires `requireAdmin` middleware

### 6. User Activity Analytics
**Endpoint:** `GET /api/admin/analytics/user-activity`

**Purpose:** Provide user activity analytics for admin dashboard.

**Query Parameters:**
- `period` (optional): Time period (7d, 30d, 90d, 1y) - default: 30d

**Response Format:**
```json
{
  "message": "User activity analytics retrieved successfully",
  "analytics": {
    "period": "30d",
    "dailyActiveUsers": [
      { "date": "2024-01-01", "count": 150 },
      { "date": "2024-01-02", "count": 175 }
    ],
    "totalCheckIns": 15832,
    "totalPointsEarned": 125000,
    "averageSessionDuration": 8.5,
    "userRetentionRate": 0.75
  }
}
```

**Authentication:** Requires `requireAdmin` middleware

### 7. Revenue Analytics
**Endpoint:** `GET /api/admin/analytics/revenue`

**Purpose:** Provide revenue analytics for admin dashboard.

**Query Parameters:**
- `period` (optional): Time period (7d, 30d, 90d, 1y) - default: 30d

**Response Format:**
```json
{
  "message": "Revenue analytics retrieved successfully",
  "analytics": {
    "period": "30d",
    "totalRevenue": 125430.50,
    "revenueChange": 4.2,
    "dailyRevenue": [
      { "date": "2024-01-01", "amount": 4200.50 },
      { "date": "2024-01-02", "amount": 3800.25 }
    ],
    "revenueByCategory": [
      { "category": "Food & Beverage", "amount": 75000.00 },
      { "category": "Entertainment", "amount": 35000.00 },
      { "category": "Retail", "amount": 15430.50 }
    ],
    "averageOrderValue": 69.68
  }
}
```

**Authentication:** Requires `requireAdmin` middleware

## Database Schema Considerations

### Additional Fields Needed

1. **User Table:**
   - `lastActiveAt` (timestamp) - for tracking user activity
   - `isPaidMember` (boolean) - for premium membership tracking
   - `totalSpend` (decimal) - for customer spending analytics

2. **Deal Table:**
   - `redemptionCount` (integer) - for tracking deal usage
   - `status` (enum) - for deal status management

3. **Analytics Tables (Optional):**
   - Consider creating separate analytics tables for better performance
   - Daily/weekly/monthly aggregated data for faster queries

## Implementation Priority

### High Priority (Required for MVP)
1. Admin overview statistics endpoint
2. Customer management endpoints
3. Customer statistics endpoint

### Medium Priority (Nice to have)
1. Deal management endpoints
2. Deal statistics endpoint
3. User activity analytics

### Low Priority (Future enhancements)
1. Revenue analytics
2. Advanced filtering and search
3. Export functionality

## Security Considerations

1. All admin endpoints must use the `requireAdmin` middleware
2. Implement rate limiting for admin endpoints
3. Log all admin actions for audit purposes
4. Consider implementing admin role levels (super admin, admin, etc.)

## Performance Considerations

1. Implement database indexing for frequently queried fields
2. Consider caching for statistics endpoints
3. Use pagination for all list endpoints
4. Implement database query optimization for analytics

## Testing Requirements

1. Unit tests for all new endpoints
2. Integration tests for admin workflows
3. Performance tests for analytics endpoints
4. Security tests for admin authentication

## Documentation

1. Update API documentation with new endpoints
2. Provide example requests and responses
3. Document authentication requirements
4. Include error handling examples
