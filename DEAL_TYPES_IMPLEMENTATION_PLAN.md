# Deal Types Implementation Plan

## 🎯 Executive Summary

**Goal:** Ensure frontend flows match backend implementation for all 6 deal types with correct validation, field requirements, and user experience.

**Status:** Most flows are correct, but several critical gaps need to be addressed.

---

## 📊 Deal Type Comparison Matrix

| Feature | Happy Hour | Bounty | Hidden | Redeem Now | Standard | Recurring |
|---------|-----------|--------|--------|------------|----------|-----------|
| **Menu Items** | Must be `isHappyHour: true` | Any items | Any items (auto-hidden) | Any items | Any items | Any items |
| **Item Discounts** | ✅ Supported | ✅ Supported | ✅ Supported | ✅ Supported | ✅ Supported | ✅ Supported |
| **Special Fields** | Time ranges | Bounty rewards + QR | Access code + optional bounty | Discount presets + maxRedemptions | None | Recurring days |
| **Auto-Set Fields** | None | `kickbackEnabled: true` | `isHidden: true` on items | `isFlashSale: true` | None | None |
| **Duration Limit** | None | None | None | **≤ 24 hours** | None | None |
| **Discount Validation** | Any | Any | Any | **Presets: 15,30,45,50,75 or 1-100%** | Any | Any |
| **Required Fields** | Items must be HH | Bounty amount, min referrals | Access code (auto-gen) | Discount % | None | Recurring days |
| **QR Code** | No | ✅ Yes (verification) | No (but has access QR) | No | No | No |
| **Access Method** | Public | Public | Code/Link/QR only | Public | Public | Public |

---

## 🔍 Detailed Flow Analysis

### 1. **Happy Hour Deal** 🕐

#### Backend Requirements:
```typescript
✅ All menu items MUST have isHappyHour: true
✅ Backend validates: happyHourItems.length === menuItemIds.length
✅ Error if non-HH items: "All items must be from Happy Hour menu"
✅ Supports item-specific discounts
✅ Uses time ranges and recurring days
```

#### Current Frontend Flow:
```
DealTypeStep (HAPPY_HOUR)
  ↓
HappyHourEditorPage (/happy-hour/edit)
  ├─ Uses HappyHourContext (separate from DealCreationContext) ✅
  ├─ Time ranges ✅
  ├─ Date range ✅
  ├─ Add Menu Items → AddMenuItemPage
  │   └─ Filters: isHappyHour === true ✅
  │   └─ Shows only Happy Hour items ✅
  ├─ Item-specific discounts ✅
  ├─ Global discount ✅
  ├─ Images ✅
  ├─ Redemption instructions ✅
  ├─ Offer terms ✅
  ├─ Advanced scheduling ✅
  ├─ Location targeting ✅
  └─ Publish ✅
```

#### ✅ Status: **CORRECT**
- Flow is correct
- Menu filtering works
- All fields included
- Separate context is appropriate

#### ⚠️ Minor Improvements:
- [ ] Add error handling if backend validation fails (shouldn't happen, but good to have)
- [ ] Show count of Happy Hour items available

---

### 2. **Bounty Deal** 🏆

#### Backend Requirements:
```typescript
✅ bountyRewardAmount (required, > 0)
✅ minReferralsRequired (required, >= 1)
✅ Auto-enables kickbackEnabled: true
✅ Auto-generates bountyQRCode after deal creation
✅ QR format: BOUNTY:dealId:merchantId:timestamp:signature
```

#### Current Frontend Flow:
```
DealTypeStep (BOUNTY)
  ↓
DealBountyStep (/bounty)
  ├─ bountyRewardAmount ✅
  ├─ minReferralsRequired ✅
  └─ Auto-enable kickback ✅
  ↓
DealBasicsStep → DealMenuStep → DealOfferStep → ...
  ↓
DealReviewStep
  ├─ Shows bounty info ✅
  ├─ QR code placeholder ⚠️ (should show after creation)
  └─ Publish
```

#### ⚠️ Issues Found:
1. **QR Code Display:**
   - ❌ Shows placeholder in review step
   - ❌ Should show actual QR code after deal creation
   - ❌ Should allow download/print after creation

2. **Response Handling:**
   - ⚠️ Need to extract `bountyQRCode` from API response
   - ⚠️ Should show success modal with QR code

#### ✅ What's Correct:
- Bounty step collects required fields
- Kickback auto-enabled
- Flow navigation is correct
- QR code component exists

#### 🔧 Fixes Needed:
1. Update `DealReviewStep` to show QR code from API response
2. Add success modal after bounty deal creation with QR code
3. Verify QR code is in response handling

---

### 3. **Hidden Deal** 🔒

#### Backend Requirements:
```typescript
✅ accessCode (auto-generated if not provided)
✅ All menu items forced to isHidden: true
✅ Optional bounty rewards (can combine with hidden)
✅ Access via: code, link (/deals/hidden/:code), or QR
✅ Validates access code uniqueness
```

#### Current Frontend Flow:
```
DealTypeStep (HIDDEN)
  ↓
DealHiddenStep (/hidden)
  ├─ accessCode (auto-generate or custom) ✅
  ├─ Shareable link preview ✅
  └─ Optional bounty info ❌ (NOT IN UI)
  ↓
DealBasicsStep → DealMenuStep → ...
  ├─ Menu items should show "will be hidden" indicator ⚠️
  ↓
DealAdvancedStep
  └─ Optional bounty rewards ❌ (NOT IN UI)
  ↓
DealReviewStep
  ├─ Shows access code ✅
  ├─ Shows shareable link ✅
  └─ Publish
```

#### ❌ Critical Issues:
1. **Missing Optional Bounty:**
   - Backend supports: Hidden deals can have bounty rewards
   - Frontend: No UI to enable bounty in hidden deals
   - **Impact:** Merchants can't combine hidden + bounty features

2. **Menu Item Indicator:**
   - Backend: Forces all items to `isHidden: true`
   - Frontend: Should show warning that items will be hidden
   - **Impact:** Merchants may not understand items will be hidden

#### ✅ What's Correct:
- Access code generation/input
- Shareable link
- Route `/deals/hidden/:code` works
- Navigation flow

#### 🔧 Fixes Needed:
1. Add bounty section to `DealAdvancedStep` when deal type is HIDDEN
2. Add indicator in `DealMenuStep` when deal type is HIDDEN
3. Show warning: "All items in hidden deals will be hidden from public view"

---

### 4. **Redeem Now Deal** ⚡

#### Backend Requirements:
```typescript
✅ discountPercentage (required)
✅ Preset discounts: 15%, 30%, 45%, 50%, 75% OR custom (1-100%)
✅ Duration MUST be ≤ 24 hours
✅ Auto-enables isFlashSale: true
✅ Optional maxRedemptions limit
✅ Tracks currentRedemptions
```

#### Current Frontend Flow:
```
DealTypeStep (REDEEM_NOW)
  ↓
DealBasicsStep → DealMenuStep → DealOfferStep
  ├─ Discount presets: 15%, 30%, 45%, 50%, 75% ✅
  ├─ Custom discount (1-100%) ✅
  └─ Warning about 24-hour limit ✅
  ↓
DealScheduleStep
  ├─ Date range
  ├─ 24-hour duration warning ✅
  ├─ Should prevent > 24 hours ⚠️
  └─ Advanced scheduling
  ↓
DealAdvancedStep
  └─ maxRedemptions ❌ (NOT IN UI)
  ↓
DealReviewStep
  └─ Publish
```

#### ❌ Critical Issues:
1. **Missing maxRedemptions:**
   - Backend supports: Optional redemption limit
   - Frontend: No field to set max redemptions
   - **Impact:** Can't limit redemptions for flash sales

2. **Duration Validation:**
   - Backend: Rejects if > 24 hours
   - Frontend: Shows warning but doesn't prevent proceeding
   - **Impact:** User can proceed and get backend error

3. **Discount Validation:**
   - Backend: Validates preset or 1-100%
   - Frontend: Allows any percentage
   - **Impact:** May send invalid discount to backend

#### ✅ What's Correct:
- Discount presets match backend
- Warning shown for 24-hour limit
- Flow navigation

#### 🔧 Fixes Needed:
1. Add `maxRedemptions` field to `DealAdvancedStep` when deal type is REDEEM_NOW
2. Prevent proceeding from schedule step if duration > 24 hours
3. Add discount validation in `DealOfferStep` for Redeem Now
4. Update validation to match backend exactly

---

### 5. **Standard Deal** 🏷️

#### Backend Requirements:
```typescript
✅ No special requirements
✅ Standard validation applies
```

#### Current Frontend Flow:
```
DealTypeStep (STANDARD)
  ↓
DealBasicsStep → DealMenuStep → DealOfferStep → ...
  └─ Standard flow ✅
```

#### ✅ Status: **CORRECT**
- No special requirements
- Flow works as expected

---

### 6. **Recurring Deal** 🔄

#### Backend Requirements:
```typescript
✅ recurringDays (required, at least 1 day)
✅ Days: MONDAY, TUESDAY, ..., SUNDAY
✅ Deal only appears on specified days
```

#### Current Frontend Flow:
```
DealTypeStep (RECURRING)
  ↓
DealBasicsStep → ... → DealScheduleStep
  ├─ Date range
  └─ Recurring days selector ✅
  ↓
... → DealReviewStep
```

#### ✅ Status: **CORRECT**
- Recurring days selector works
- At least one day required
- Days saved correctly

---

## 🚨 Critical Issues Summary

### Priority 1: Must Fix

1. **Hidden Deal - Missing Optional Bounty** ❌
   - **File:** `DealAdvancedStep.tsx`
   - **Fix:** Add conditional bounty section for HIDDEN deals
   - **Impact:** High - Feature not accessible

2. **Redeem Now - Missing maxRedemptions** ❌
   - **File:** `DealAdvancedStep.tsx`
   - **Fix:** Add maxRedemptions input for REDEEM_NOW deals
   - **Impact:** High - Feature not accessible

3. **Redeem Now - Duration Validation** ⚠️
   - **File:** `DealScheduleStep.tsx`
   - **Fix:** Prevent proceeding if > 24 hours
   - **Impact:** High - User can proceed and get error

4. **Redeem Now - Discount Validation** ⚠️
   - **File:** `DealOfferStep.tsx`
   - **Fix:** Validate discount is preset or 1-100%
   - **Impact:** Medium - May send invalid data

### Priority 2: Should Fix

5. **Hidden Deal - Menu Item Indicator** ⚠️
   - **File:** `DealMenuStep.tsx`
   - **Fix:** Show warning that items will be hidden
   - **Impact:** Medium - UX improvement

6. **Bounty Deal - QR Code After Creation** ⚠️
   - **File:** `DealReviewStep.tsx`
   - **Fix:** Show QR code in success modal after creation
   - **Impact:** Medium - Better UX

### Priority 3: Nice to Have

7. **Happy Hour - Error Handling** 💡
   - **File:** `HappyHourEditorPage.tsx`
   - **Fix:** Better error messages if validation fails
   - **Impact:** Low - Edge case

8. **Flow Indicators** 💡
   - **File:** Multiple
   - **Fix:** Add progress indicators for deal-type-specific requirements
   - **Impact:** Low - UX enhancement

---

## 📋 Implementation Checklist

### Phase 1: Critical Fixes (Do First)

#### 1.1 Add Optional Bounty to Hidden Deals
- [ ] Open `DealAdvancedStep.tsx`
- [ ] Add conditional section: `if (state.dealType === 'HIDDEN')`
- [ ] Add bounty reward amount input
- [ ] Add min referrals required input
- [ ] Add validation (same as Bounty step)
- [ ] Update payload to include bounty fields for hidden deals

#### 1.2 Add maxRedemptions to Redeem Now
- [ ] Open `DealAdvancedStep.tsx`
- [ ] Add conditional section: `if (state.dealType === 'REDEEM_NOW')`
- [ ] Add maxRedemptions number input
- [ ] Add validation: >= 1 or 0 for unlimited
- [ ] Add help text explaining the feature
- [ ] Update payload to include maxRedemptions

#### 1.3 Fix Redeem Now Duration Validation
- [ ] Open `DealScheduleStep.tsx`
- [ ] Update `isDateValid()` function
- [ ] Add check: if REDEEM_NOW and duration > 24 hours, return false
- [ ] Update `isNextDisabled` to use this validation
- [ ] Ensure warning is shown and prevents proceeding

#### 1.4 Fix Redeem Now Discount Validation
- [ ] Open `DealOfferStep.tsx`
- [ ] Add validation function for Redeem Now discounts
- [ ] Check if discount is preset (15, 30, 45, 50, 75) or 1-100%
- [ ] Show error if invalid
- [ ] Prevent proceeding if invalid

### Phase 2: UX Improvements

#### 2.1 Add Hidden Deal Menu Indicator
- [ ] Open `DealMenuStep.tsx`
- [ ] Add banner when `state.dealType === 'HIDDEN'`
- [ ] Show: "All items in hidden deals will be hidden from public view"
- [ ] Add visual indicator on selected items

#### 2.2 Show QR Code After Bounty Creation
- [ ] Open `DealReviewStep.tsx`
- [ ] Extract `bountyQRCode` from API response
- [ ] Show success modal with QR code after creation
- [ ] Allow download/print
- [ ] Show instructions

### Phase 3: Response Handling

#### 3.1 Handle Backend Response Correctly
- [ ] Update `DealReviewStep.tsx` response handling
- [ ] Extract `bountyQRCode` from `response.data.deal.bountyQRCode`
- [ ] Extract `hidden` object with access code and links
- [ ] Extract `flashSale` object with redemption info
- [ ] Display in appropriate places

---

## 🔄 Flow Verification

### Happy Hour Flow ✅
```
✅ Menu items filtered correctly
✅ Item-specific discounts work
✅ All fields included
✅ Separate context (correct)
✅ Backend validation will pass
```

### Bounty Flow ⚠️
```
✅ Bounty step collects fields
✅ Kickback auto-enabled
⚠️ QR code display after creation (needs fix)
✅ QR code component exists
✅ Flow navigation correct
```

### Hidden Flow ⚠️
```
✅ Access code works
✅ Shareable link works
✅ Route works
❌ Optional bounty not accessible (needs fix)
⚠️ Menu item indicator missing (needs fix)
```

### Redeem Now Flow ❌
```
✅ Discount presets correct
⚠️ Discount validation missing (needs fix)
⚠️ Duration validation incomplete (needs fix)
❌ maxRedemptions missing (needs fix)
✅ Warning shown
```

### Standard Flow ✅
```
✅ No special requirements
✅ Flow works correctly
```

### Recurring Flow ✅
```
✅ Recurring days selector works
✅ Validation correct
✅ Flow works correctly
```

---

## 🎯 Next Steps

1. **Review this plan** - Confirm understanding
2. **Implement Phase 1** - Critical fixes first
3. **Test each flow** - Verify backend integration
4. **Implement Phase 2** - UX improvements
5. **Final verification** - End-to-end testing

---

## 📝 Notes

- Happy Hour uses separate context (`HappyHourContext`) - this is correct
- Other deals use `DealCreationContext` - this is correct
- Backend auto-sets some fields (kickbackEnabled, isFlashSale, isHidden) - frontend should reflect this
- QR codes are generated by backend - frontend just displays them
- Access codes are auto-generated by backend if not provided

