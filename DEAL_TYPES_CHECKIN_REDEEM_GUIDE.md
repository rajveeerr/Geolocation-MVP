# Deal Types: Check-In vs Redeem Flow Guide

## Overview

The platform supports **6 different deal types**, each with specific user interaction flows. Some deals use **"Check-In" (Tap In)** while others use **"Redeem"** depending on the deal type and requirements.

---

## The 6 Deal Types

### 1. **Standard Deal** 🏷️
- **Type**: Regular promotional deals
- **User Flow**: **Check-In (Tap In)**
- **Requirements**: 
  - User must be at merchant location (geolocation verification)
  - No payment required
  - Points awarded on check-in
- **How it works**:
  1. User views deal
  2. User navigates to merchant location
  3. User taps "Check-In & Earn Points" button
  4. System verifies user is within range (typically 100m)
  5. Check-in recorded, points awarded
  6. User can claim the deal discount

---

### 2. **Happy Hour Deal** 🕐
- **Type**: Time-based specials using Happy Hour menu items
- **User Flow**: **Check-In (Tap In)**
- **Requirements**:
  - All menu items must be from Happy Hour menu (`isHappyHour: true`)
  - User must be at merchant location during happy hour times
  - No payment required
- **How it works**:
  1. User views deal (only visible during happy hour times)
  2. User navigates to merchant location
  3. User taps "Check-In & Earn Points" during valid time window
  4. System verifies location and time
  5. Check-in recorded, points awarded
  6. User can order from Happy Hour menu with discounts

---

### 3. **Recurring Deal (Daily Deal)** 🔄
- **Type**: Weekly deals on specific days (e.g., "Taco Tuesday")
- **User Flow**: **Check-In (Tap In)**
- **Requirements**:
  - Deal only appears on specified days of week
  - User must be at merchant location
  - No payment required
- **How it works**:
  1. User views deal (only visible on recurring days)
  2. User navigates to merchant location
  3. User taps "Check-In & Earn Points"
  4. System verifies location and day of week
  5. Check-in recorded, points awarded
  6. User can claim the deal discount

---

### 4. **Redeem Now Deal** ⚡
- **Type**: Flash sales with instant discounts
- **User Flow**: **Redeem (Payment Required)**
- **Requirements**:
  - Payment required before redemption
  - Duration ≤ 24 hours
  - Discount presets: 15%, 30%, 45%, 50%, 75% or custom (1-100%)
  - Optional: `maxRedemptions` limit
- **How it works**:
  1. User views deal
  2. User clicks "Pay Now" button (if payment required)
  3. User completes payment via PayPal/Stripe
  4. After payment success, user can "Check-In & Earn Points"
  5. System verifies payment and location
  6. Check-in recorded, points awarded
  7. User can claim the deal discount

**Note**: Redeem Now deals may require payment first, then check-in. The flow is: **Pay → Check-In → Redeem**

---

### 5. **Bounty Deal** 🏆
- **Type**: Cash back rewards for bringing friends
- **User Flow**: **Redeem (QR Code Verification)**
- **Requirements**:
  - `bountyRewardAmount` - Cash back per referral (required)
  - `minReferralsRequired` - Minimum friends to bring (required)
  - QR code auto-generated for verification
  - Auto-enables `kickbackEnabled: true`
- **How it works**:
  1. User views deal
  2. User brings friends to merchant location
  3. User checks in at location (geolocation verification)
  4. Merchant scans QR code to verify referral count
  5. System creates `KickbackEvent` with cash back
  6. Cash back = `bountyRewardAmount × actualReferralCount`
  7. User receives cash back to their account

**Note**: Bounty deals use **both** check-in (for location) **and** redeem (for QR verification and cash back)

---

### 6. **Hidden Deal** 🔒
- **Type**: Secret VIP deals with access codes
- **User Flow**: **Check-In (Tap In)** OR **Redeem (if combined with Bounty)**
- **Requirements**:
  - `accessCode` - Auto-generated or custom
  - All menu items forced to `isHidden: true`
  - Optional: Can combine with bounty rewards
- **How it works**:
  1. User accesses deal via:
     - Access code entry
     - Direct link: `/deals/hidden/{accessCode}`
     - QR code scan
  2. User navigates to merchant location
  3. User taps "Check-In & Earn Points"
  4. System verifies location and access code
  5. Check-in recorded, points awarded
  6. If combined with bounty: QR code verification for cash back

**Note**: Hidden deals primarily use check-in, but can use redeem flow if combined with bounty features

---

## Check-In vs Redeem Summary

| Deal Type | Primary Flow | Secondary Flow | Payment Required? | QR Code? |
|-----------|-------------|----------------|------------------|----------|
| **Standard** | Check-In | - | No | No |
| **Happy Hour** | Check-In | - | No | No |
| **Recurring** | Check-In | - | No | No |
| **Redeem Now** | Redeem (Pay) | Check-In (after payment) | Yes | No |
| **Bounty** | Check-In | Redeem (QR verification) | No | Yes |
| **Hidden** | Check-In | Redeem (if bounty enabled) | No | Optional |

---

## Implementation Details

### Check-In Flow (Tap In)
**Endpoint**: `POST /api/users/check-in`

**Request**:
```json
{
  "dealId": 123,
  "latitude": 40.7128,
  "longitude": -74.0060
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "withinRange": true,
    "distanceMeters": 45.2,
    "pointsAwarded": 35,
    "streak": {
      "currentStreak": 5,
      "currentDiscountPercent": 25
    }
  }
}
```

**Used by**: Standard, Happy Hour, Recurring, Hidden (primary), Bounty (location verification)

---

### Redeem Flow (Payment)
**Endpoint**: `POST /api/payments/intent` → `POST /api/payments/capture`

**Request**:
```json
{
  "dealId": 123,
  "amount": 25.00
}
```

**Response**:
```json
{
  "success": true,
  "orderId": "ORDER_123",
  "paypalOrderId": "PAYPAL_456"
}
```

**Used by**: Redeem Now (required), some Standard deals with `originalValue > 0`

---

### Redeem Flow (QR Code Verification)
**Endpoint**: `POST /api/deals/:id/redeem`

**Request**:
```json
{
  "qrCodeData": "BOUNTY:123:456:1699999999:abc12345",
  "referralCount": 3
}
```

**Response**:
```json
{
  "success": true,
  "bountyEarned": 30.00,
  "kickbackEvent": {
    "id": 789,
    "amountEarned": 30.00
  }
}
```

**Used by**: Bounty deals (for cash back verification)

---

## Frontend Implementation

### Determining Flow Type

```typescript
// Check if deal requires payment
const requiresPayment = (deal: Deal) => {
  // Redeem Now deals always require payment
  if (deal.dealType === 'REDEEM_NOW' || deal.dealType === 'Redeem Now') {
    return true;
  }
  
  // Standard deals with originalValue require payment
  if (deal.originalValue && deal.originalValue > 0) {
    return true;
  }
  
  return false;
};

// Check if deal uses QR code redemption
const usesQRCode = (deal: Deal) => {
  return deal.dealType === 'BOUNTY' || deal.bountyQRCode !== null;
};

// Determine primary action button
const getPrimaryAction = (deal: Deal) => {
  if (requiresPayment(deal)) {
    return 'Pay Now';
  }
  
  if (usesQRCode(deal)) {
    return 'Check-In & Verify';
  }
  
  return 'Check-In & Earn Points';
};
```

---

## Deal Type Creation Requirements

### Standard Deal
- ✅ Title, description
- ✅ Start/end dates
- ✅ At least one menu item
- ✅ Optional discount
- ✅ Category

### Happy Hour Deal
- ✅ Title, description
- ✅ Time ranges (start/end times)
- ✅ Recurring days
- ✅ **All menu items must be `isHappyHour: true`**
- ✅ At least one discount
- ✅ Category

### Recurring Deal
- ✅ Title, description
- ✅ **At least one recurring day** (MONDAY, TUESDAY, etc.)
- ✅ Start/end dates (overall validity period)
- ✅ At least one menu item
- ✅ Optional discount
- ✅ Category

### Redeem Now Deal
- ✅ Title, description
- ✅ **Discount percentage** (15, 30, 45, 50, 75, or custom 1-100%)
- ✅ **Duration ≤ 24 hours**
- ✅ Start/end dates
- ✅ At least one menu item
- ✅ Optional: `maxRedemptions`
- ✅ Category

### Bounty Deal
- ✅ Title, description
- ✅ **`bountyRewardAmount`** (required, > 0)
- ✅ **`minReferralsRequired`** (required, ≥ 1)
- ✅ Start/end dates
- ✅ At least one menu item
- ✅ Optional discount
- ✅ Category
- ✅ Auto-generates QR code

### Hidden Deal
- ✅ Title, description
- ✅ **`accessCode`** (auto-generated if not provided)
- ✅ Start/end dates
- ✅ At least one menu item (auto-set to `isHidden: true`)
- ✅ Optional discount
- ✅ Optional: Bounty rewards (combine with hidden)
- ✅ Category

---

## User Experience Flow

### For Check-In Deals (Standard, Happy Hour, Recurring, Hidden)
1. User browses deals
2. User saves/views deal
3. User navigates to merchant location
4. User taps "Check-In & Earn Points"
5. System requests location permission
6. System verifies user is within range
7. ✅ Check-in successful → Points awarded
8. User can claim discount

### For Redeem Now Deals
1. User browses deals
2. User saves/views deal
3. User taps "Pay Now" button
4. User redirected to payment (PayPal/Stripe)
5. User completes payment
6. User redirected back to deal page
7. User taps "Check-In & Earn Points"
8. System verifies location
9. ✅ Check-in successful → Points awarded
10. User can claim discount

### For Bounty Deals
1. User browses deals
2. User saves/views deal
3. User brings friends to merchant location
4. User taps "Check-In & Earn Points"
5. System verifies location
6. ✅ Check-in successful → Points awarded
7. Merchant scans QR code
8. Merchant verifies referral count
9. System creates KickbackEvent
10. ✅ Cash back awarded to user

---

## Backend Validation

### Check-In Validation
- User must be authenticated
- Deal must be active (within start/end time)
- User must be within range (typically 100m)
- For Happy Hour: Current time must be within happy hour window
- For Recurring: Current day must match recurring days

### Redeem Validation (Payment)
- User must be authenticated
- Deal must be active
- Payment must be completed
- For Redeem Now: Check `maxRedemptions` limit

### Redeem Validation (QR Code)
- User must be authenticated
- QR code must be valid format: `BOUNTY:dealId:merchantId:timestamp:signature`
- Referral count ≥ `minReferralsRequired`
- Deal must be active

---

## Testing Checklist

### Standard Deal
- [ ] Check-in works without payment
- [ ] Location verification works
- [ ] Points awarded correctly
- [ ] Deal appears in user's saved deals

### Happy Hour Deal
- [ ] Only Happy Hour menu items can be selected
- [ ] Check-in only works during happy hour times
- [ ] Deal appears only during valid time windows
- [ ] Points awarded correctly

### Recurring Deal
- [ ] Deal appears only on specified days
- [ ] Check-in works on recurring days
- [ ] Check-in blocked on non-recurring days
- [ ] Points awarded correctly

### Redeem Now Deal
- [ ] Payment button appears
- [ ] Payment flow works
- [ ] Check-in enabled after payment
- [ ] Duration validation (≤ 24 hours)
- [ ] Discount validation (presets or 1-100%)
- [ ] Max redemptions limit works (if set)

### Bounty Deal
- [ ] Bounty fields required
- [ ] QR code generated after creation
- [ ] Check-in works for location
- [ ] QR code verification works
- [ ] Cash back calculated correctly
- [ ] KickbackEvent created

### Hidden Deal
- [ ] Access code generated/validated
- [ ] Deal not visible in public feed
- [ ] Access via code/link/QR works
- [ ] Check-in works after access
- [ ] Optional bounty works (if enabled)

---

## Summary

- **Check-In (Tap In)**: Used by Standard, Happy Hour, Recurring, Hidden, and Bounty deals for location verification
- **Redeem (Payment)**: Used by Redeem Now deals and Standard deals with `originalValue > 0`
- **Redeem (QR Code)**: Used by Bounty deals for cash back verification

The key difference:
- **Check-In**: User is at location → Tap button → Get points → Claim discount
- **Redeem (Payment)**: User pays first → Then check-in → Claim discount
- **Redeem (QR Code)**: User checks in → Merchant scans QR → Cash back awarded

