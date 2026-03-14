# Services Frontend Integration Guide

Date: 2026-03-14

This document maps every backend Services route to frontend hooks/pages, and details complete UI flows for public users, authenticated users, and merchants.

---

## 1) Backend Route Coverage Matrix

### Public routes

1. `GET /api/services`
   - Frontend hook: `usePublicServices`
   - Used in: `web/src/pages/DiscoverServicesPage.tsx`
   - UX: search + serviceType filter + pagination + cards + empty/error/loading states.

2. `GET /api/services/:id`
   - Frontend hook: `usePublicServiceDetail`
   - Used in: `web/src/pages/ServiceDetailPage.tsx`
   - UX: service details, merchant info, tiers, add-ons, booking widget.

3. `GET /api/merchants/:merchantId/services`
   - Frontend hook: `usePublicServicesByMerchant`
   - Coverage: hook implemented for merchant-profile/service-list integrations.

### Merchant service management

4. `GET /api/services/me/list`
   - Frontend hook: `useMerchantServices`
   - Used in: `web/src/pages/merchant/MerchantMyServicesPage.tsx`
   - UX: status filters, cards, counts, manage/delete actions.

5. `POST /api/services`
   - Frontend hook: `useCreateService`
   - Used in: `web/src/pages/merchant/ServiceCreatePage.tsx`
   - UX: full draft creation form with backend-required fields.

6. `PUT /api/services/:id`
   - Frontend hook: `useUpdateService`
   - Used in: `web/src/pages/merchant/ServiceManagePage.tsx`
   - UX: editable details with save + validation/error toast feedback.

7. `DELETE /api/services/:id`
   - Frontend hook: `useDeleteService`
   - Used in: `MerchantMyServicesPage`, `ServiceManagePage`
   - UX: confirm + delete/cancel semantics from backend.

8. `POST /api/services/:id/publish`
   - Frontend hook: `usePublishService`
   - Used in: `ServiceManagePage`
   - UX: publish CTA, error surfaced when prerequisites missing.

9. `POST /api/services/:id/pause`
   - Frontend hook: `usePauseService`
   - Used in: `ServiceManagePage`

10. `POST /api/services/:id/cancel`
    - Frontend hook: `useCancelService`
    - Used in: `ServiceManagePage`

### Pricing tiers

11. `POST /api/services/:serviceId/pricing-tiers`
    - Frontend hook: `useCreateServicePricingTier`
    - Used in: `ServiceManagePage`

12. `PUT /api/services/:serviceId/pricing-tiers/:tierId`
    - Frontend hook: `useUpdateServicePricingTier`
    - Used in: `ServiceManagePage`

13. `DELETE /api/services/:serviceId/pricing-tiers/:tierId`
    - Frontend hook: `useDeleteServicePricingTier`
    - Used in: `ServiceManagePage`

### Add-ons

14. `POST /api/services/:serviceId/add-ons`
    - Frontend hook: `useCreateServiceAddOn`
    - Used in: `ServiceManagePage`

15. `PUT /api/services/:serviceId/add-ons/:addOnId`
    - Frontend hook: `useUpdateServiceAddOn`
    - Used in: `ServiceManagePage`

16. `DELETE /api/services/:serviceId/add-ons/:addOnId`
    - Frontend hook: `useDeleteServiceAddOn`
    - Used in: `ServiceManagePage`

### Merchant booking dashboard

17. `GET /api/services/me/bookings`
    - Frontend hook: `useMerchantServiceBookings`
    - Used in: `ServiceManagePage`
    - UX: filter by status + booking action panel.

18. `PUT /api/services/bookings/:bookingId/confirm`
    - Frontend hook: `useConfirmServiceBooking`
    - Used in: `ServiceManagePage`

19. `PUT /api/services/bookings/:bookingId/complete`
    - Frontend hook: `useCompleteServiceBooking`
    - Used in: `ServiceManagePage`

20. `PUT /api/services/bookings/:bookingId/no-show`
    - Frontend hook: `useNoShowServiceBooking`
    - Used in: `ServiceManagePage`

21. `POST /api/services/bookings/:bookingId/check-in`
    - Frontend hook: `useServiceCheckIn`
    - Used in: `ServiceManagePage`, `ServiceCheckInPage`
    - UX: manual QR payload entry + result feed.

### User booking routes

22. `POST /api/services/:serviceId/bookings`
    - Frontend hook: `useCreateServiceBooking`
    - Used in: `ServiceDetailPage`
    - UX: tier/date/time/add-ons + optional contact/notes.

23. `DELETE /api/services/bookings/:bookingId`
    - Frontend hook: `useCancelMyServiceBooking`
    - Used in: `MyServiceBookingsPage`

24. `GET /api/users/me/service-bookings`
    - Frontend hook: `useMyServiceBookings`
    - Used in: `MyServiceBookingsPage`

---

## 2) Implemented Frontend Files

### Hooks
- `web/src/hooks/useServices.ts`

### Public/User pages
- `web/src/pages/DiscoverServicesPage.tsx`
- `web/src/pages/ServiceDetailPage.tsx`
- `web/src/pages/MyServiceBookingsPage.tsx`

### Merchant pages
- `web/src/pages/merchant/MerchantMyServicesPage.tsx`
- `web/src/pages/merchant/ServiceCreatePage.tsx`
- `web/src/pages/merchant/ServiceManagePage.tsx`
- `web/src/pages/merchant/ServiceCheckInPage.tsx`

### Routing + navigation
- `web/src/routing/paths.ts`
- `web/src/App.tsx`
- `web/src/components/layout/MerchantHeader.tsx`
- `web/src/components/layout/Header.tsx`
- `web/src/components/layout/ProfileDropDown.tsx`

---

## 3) End-to-End UX Flows

### A) Public discovery flow
1. User opens `/discover/services`.
2. Frontend calls `GET /api/services` with `search`, `serviceType`, `page`, `limit`.
3. User sees cards with merchant info, duration, and starting price.
4. User clicks service card and lands on `/services/:serviceId`.

### B) Service booking flow (authenticated user)
1. On detail page, user selects a pricing tier.
2. User selects date/time and optional add-ons.
3. User enters optional contact fields and notes.
4. Frontend sends `POST /api/services/:serviceId/bookings`.
5. UI surfaces booking status and confirmation code.
6. User can navigate to `My Service Bookings` to track/cancel.

### C) User booking management flow
1. User opens `/my-services/bookings`.
2. Frontend fetches `GET /api/users/me/service-bookings`.
3. User filters bookings by status.
4. For eligible bookings, user cancels via `DELETE /api/services/bookings/:bookingId`.

### D) Merchant lifecycle flow
1. Merchant opens `/merchant/services` and views own services.
2. Merchant creates draft service via `/merchant/services/create`.
3. Merchant configures service details on manage page.
4. Merchant adds pricing tiers and add-ons.
5. Merchant publishes service (`POST /publish`), or pauses/cancels as needed.

### E) Merchant booking operations flow
1. Merchant opens service manage page booking dashboard.
2. Frontend loads `GET /api/services/me/bookings` scoped to service/status.
3. Merchant action options:
   - Confirm booking (`PUT /confirm`)
   - Complete booking (`PUT /complete`)
   - Mark no-show (`PUT /no-show`)
   - Check-in with QR payload (`POST /check-in`)

### F) Merchant check-in flow (dedicated page)
1. Merchant opens `/merchant/services/:serviceId/checkin`.
2. Merchant inputs booking ID and QR payload.
3. Frontend calls check-in endpoint.
4. UI displays success/error logs for rapid counter-side operations.

---

## 4) Consistency with Existing Events Pattern

- React Query hooks for endpoint access and automatic invalidation.
- Merchant pages follow existing card/list/manage page patterns.
- Route architecture mirrors merchant events (list/create/manage/check-in).
- Header + merchant nav integrated with existing style and structure.
- Toast-based success/error feedback reused across all flows.

---

## 5) Known Workspace Build Status

- Newly added Services files pass diagnostics.
- Project-wide `web` build currently fails due to unrelated pre-existing TypeScript issues in other legacy pages/components.
- Services integration itself is compile-clean in targeted checks.
