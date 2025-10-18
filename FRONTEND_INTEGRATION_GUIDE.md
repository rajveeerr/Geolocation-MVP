# Frontend Integration Guide

## Overview

This document outlines the integration of new backend features into the frontend application. The backend team has implemented several major features that need to be integrated into the frontend.

## New Features Implemented

### 1. Table Booking System
- **Backend Routes**: `/api/table-booking/*`
- **Frontend Components**: 
  - `TableBookingModal` - Modal for users to book tables
  - `TableBookingButton` - Button to trigger booking modal
  - `MerchantTableBookingDashboard` - Complete merchant management interface
- **Hooks**: `useTableBooking.ts` - All table booking related hooks

### 2. Enhanced Leaderboard System
- **Backend Routes**: `/api/leaderboard/*`
- **Frontend Hooks**: `useEnhancedLeaderboard.ts`
- **Features**:
  - Global leaderboard with detailed analytics
  - City-specific leaderboards
  - Category-based leaderboards
  - Advanced analytics and insights
  - City comparison leaderboards

### 3. Advanced Admin Analytics
- **Backend Routes**: `/api/admin/*`
- **Frontend Hooks**: `useAdminAdvancedAnalytics.ts`
- **Features**:
  - Performance overview and metrics
  - City performance analytics
  - Weekly chart data
  - Sales by store analytics
  - Top merchants, cities, and categories
  - Customer analytics and insights
  - Tap-ins analytics
  - Bounties analytics

### 4. Enhanced Merchant Analytics
- **Backend Routes**: `/api/merchants/dashboard/*`
- **Frontend Hooks**: `useMerchantAdvancedAnalytics.ts`
- **Features**:
  - Deal performance analytics
  - Customer insights
  - Revenue analytics
  - Engagement metrics
  - Performance comparison tools

## Integration Steps

### Step 1: Table Booking System Integration

#### For User-Facing Components:
1. **Add Table Booking Button to Deal Cards**:
   ```tsx
   import { TableBookingButton } from '@/components/table-booking/TableBookingButton';
   
   // In your deal card component
   <TableBookingButton 
     merchantId={deal.merchantId} 
     merchantName={deal.merchantName}
     variant="outline"
     size="sm"
   />
   ```

2. **Add to Merchant Detail Pages**:
   ```tsx
   import { TableBookingButton } from '@/components/table-booking/TableBookingButton';
   
   // In merchant detail page
   <TableBookingButton 
     merchantId={merchant.id} 
     merchantName={merchant.name}
     className="w-full"
   />
   ```

#### For Merchant Dashboard:
1. **Add Table Booking Management**:
   ```tsx
   import { MerchantTableBookingDashboard } from '@/components/table-booking/MerchantTableBookingDashboard';
   
   // In merchant dashboard
   <MerchantTableBookingDashboard />
   ```

### Step 2: Enhanced Leaderboard Integration

#### Update Existing Leaderboard Components:
1. **Replace Basic Leaderboard with Enhanced Version**:
   ```tsx
   import { useGlobalLeaderboard } from '@/hooks/useLeaderboard';
   
   // Replace useLeaderboard with useGlobalLeaderboard
   const { data: leaderboardData } = useGlobalLeaderboard({
     period: 'last_30_days',
     limit: 50,
     includeSelf: true,
     includeStats: true
   });
   ```

2. **Add City-Specific Leaderboards**:
   ```tsx
   import { useCityLeaderboard } from '@/hooks/useLeaderboard';
   
   const { data: cityLeaderboard } = useCityLeaderboard(cityId, {
     period: 'last_30_days',
     limit: 50
   });
   ```

3. **Add Category-Based Leaderboards**:
   ```tsx
   import { useCategoryLeaderboard } from '@/hooks/useLeaderboard';
   
   const { data: categoryLeaderboard } = useCategoryLeaderboard(categoryId, {
     period: 'last_30_days',
     limit: 50
   });
   ```

### Step 3: Admin Analytics Integration

#### Create Admin Dashboard Components:
1. **Performance Overview**:
   ```tsx
   import { useAdminPerformanceOverview } from '@/hooks/useAdminAdvancedAnalytics';
   
   const { data: performanceData } = useAdminPerformanceOverview({
     period: 'last_30_days'
   });
   ```

2. **City Performance**:
   ```tsx
   import { useAdminPerformanceCities } from '@/hooks/useAdminAdvancedAnalytics';
   
   const { data: citiesData } = useAdminPerformanceCities({
     period: 'last_30_days',
     limit: 50,
     sortBy: 'revenue',
     sortOrder: 'desc'
   });
   ```

3. **Customer Analytics**:
   ```tsx
   import { useAdminCustomerOverview } from '@/hooks/useAdminAdvancedAnalytics';
   
   const { data: customerData } = useAdminCustomerOverview({
     period: 'last_30_days'
   });
   ```

### Step 4: Merchant Analytics Integration

#### Update Merchant Dashboard:
1. **Deal Performance**:
   ```tsx
   import { useMerchantDealPerformance } from '@/hooks/useMerchantAdvancedAnalytics';
   
   const { data: dealPerformance } = useMerchantDealPerformance({
     period: 'last_30_days',
     limit: 10
   });
   ```

2. **Customer Insights**:
   ```tsx
   import { useMerchantCustomerInsights } from '@/hooks/useMerchantAdvancedAnalytics';
   
   const { data: customerInsights } = useMerchantCustomerInsights({
     period: 'last_30_days'
   });
   ```

3. **Revenue Analytics**:
   ```tsx
   import { useMerchantRevenueAnalytics } from '@/hooks/useMerchantAdvancedAnalytics';
   
   const { data: revenueData } = useMerchantRevenueAnalytics({
     period: 'last_30_days'
   });
   ```

## File Structure

```
web/src/
├── hooks/
│   ├── useTableBooking.ts                    # Table booking hooks
│   ├── useEnhancedLeaderboard.ts            # Enhanced leaderboard hooks
│   ├── useAdminAdvancedAnalytics.ts         # Admin analytics hooks
│   ├── useMerchantAdvancedAnalytics.ts      # Merchant analytics hooks
│   └── useLeaderboard.ts                    # Updated with re-exports
├── components/
│   └── table-booking/
│       ├── TableBookingModal.tsx            # Booking modal
│       ├── TableBookingButton.tsx           # Booking button
│       └── MerchantTableBookingDashboard.tsx # Merchant management
└── pages/
    ├── admin/                               # Admin dashboard pages
    ├── merchant/                            # Merchant dashboard pages
    └── leaderboard/                         # Leaderboard pages
```

## Dependencies

Ensure these dependencies are installed:
```json
{
  "date-fns": "^2.30.0",
  "sonner": "^1.0.0"
}
```

## API Endpoints

### Table Booking System
- `GET /api/table-booking/merchant/tables` - Get merchant tables
- `POST /api/table-booking/merchant/tables` - Create table
- `PUT /api/table-booking/merchant/tables/:id` - Update table
- `DELETE /api/table-booking/merchant/tables/:id` - Delete table
- `GET /api/table-booking/merchant/time-slots` - Get time slots
- `POST /api/table-booking/merchant/time-slots` - Create time slot
- `PUT /api/table-booking/merchant/time-slots/:id` - Update time slot
- `DELETE /api/table-booking/merchant/time-slots/:id` - Delete time slot
- `GET /api/table-booking/merchant/bookings` - Get merchant bookings
- `PUT /api/table-booking/merchant/bookings/:id/status` - Update booking status
- `GET /api/table-booking/merchant/settings` - Get booking settings
- `PUT /api/table-booking/merchant/settings` - Update booking settings
- `GET /api/table-booking/merchants/:id/availability` - Get availability
- `POST /api/table-booking/bookings` - Create booking
- `GET /api/table-booking/bookings` - Get user bookings
- `GET /api/table-booking/bookings/:code` - Get booking by code
- `PUT /api/table-booking/bookings/:id` - Update booking
- `DELETE /api/table-booking/bookings/:id` - Cancel booking

### Enhanced Leaderboard
- `GET /api/leaderboard/global` - Global leaderboard
- `GET /api/leaderboard/cities` - City comparison
- `GET /api/leaderboard/cities/:id` - City-specific leaderboard
- `GET /api/leaderboard/categories` - Category leaderboards
- `GET /api/leaderboard/analytics` - Analytics
- `GET /api/leaderboard/insights` - Insights

### Admin Analytics
- `GET /api/admin/performance/overview` - Performance overview
- `GET /api/admin/performance/cities` - City performance
- `GET /api/admin/performance/weekly-chart` - Weekly chart
- `GET /api/admin/performance/sales-by-store` - Sales by store
- `GET /api/admin/performance/top-merchants` - Top merchants
- `GET /api/admin/performance/top-cities` - Top cities
- `GET /api/admin/performance/top-categories` - Top categories
- `GET /api/admin/customers/overview` - Customer overview
- `GET /api/admin/customers` - Customer list
- `GET /api/admin/customers/:id` - Customer details
- `GET /api/admin/customers/analytics` - Customer analytics
- `GET /api/admin/tap-ins/overview` - Tap-ins overview
- `GET /api/admin/tap-ins/geographic` - Tap-ins geographic
- `GET /api/admin/bounties/overview` - Bounties overview
- `GET /api/admin/bounties/leaderboard` - Bounties leaderboard

### Merchant Analytics
- `GET /api/merchants/dashboard/deal-performance` - Deal performance
- `GET /api/merchants/dashboard/customer-insights` - Customer insights
- `GET /api/merchants/dashboard/revenue-analytics` - Revenue analytics
- `GET /api/merchants/dashboard/engagement-metrics` - Engagement metrics
- `GET /api/merchants/dashboard/performance-comparison-custom` - Performance comparison

## Testing

### Table Booking System
1. Test table creation, editing, and deletion
2. Test time slot management
3. Test booking creation and management
4. Test availability checking
5. Test booking status updates

### Enhanced Leaderboard
1. Test global leaderboard display
2. Test city-specific leaderboards
3. Test category-based leaderboards
4. Test analytics and insights

### Admin Analytics
1. Test performance overview
2. Test city performance metrics
3. Test customer analytics
4. Test tap-ins and bounties analytics

### Merchant Analytics
1. Test deal performance metrics
2. Test customer insights
3. Test revenue analytics
4. Test engagement metrics

## Error Handling

All hooks include proper error handling with toast notifications. Ensure error boundaries are in place for components that use these hooks.

## Performance Considerations

- All hooks use React Query for caching and background updates
- Stale time is set appropriately for each data type
- Pagination is implemented for large datasets
- Loading states are handled gracefully

## Security

- All API calls include proper authentication headers
- User permissions are checked on the backend
- Sensitive data is properly handled

## Future Enhancements

1. Real-time updates for bookings
2. Advanced filtering and search
3. Export functionality for analytics
4. Mobile-optimized interfaces
5. Push notifications for booking updates
