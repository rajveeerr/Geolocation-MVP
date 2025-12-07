# Deal Types Flow Analysis & Implementation Plan

## 📊 Current State Analysis

### Backend Implementation Summary

#### 1. **Happy Hour Deal** 🕐
**Backend Requirements:**
- ✅ All menu items MUST have `isHappyHour: true`
- ✅ Backend validates items are from Happy Hour menu
- ✅ Returns error if non-Happy Hour items included
- ✅ Can have item-specific discounts (customPrice, customDiscount, discountAmount)
- ✅ Uses time ranges and recurring days

**Backend Validation:**
```typescript
if (dealTypeName === 'Happy Hour') {
  // Validates all items are isHappyHour: true
  // Returns error if any item is not Happy Hour
}
```

#### 2. **Bounty Deal** 🏆
**Backend Requirements:**
- ✅ `bountyRewardAmount` (required, > 0)
- ✅ `minReferralsRequired` (required, ≥ 1)
- ✅ Auto-enables `kickbackEnabled: true`
- ✅ Auto-generates `bountyQRCode` after deal creation
- ✅ QR code format: `BOUNTY:dealId:merchantId:timestamp:signature`

**Backend Validation:**
```typescript
if (dealTypeName === 'Bounty Deal') {
  // Validates bountyRewardAmount > 0
  // Validates minReferralsRequired >= 1
  // Auto-sets kickbackEnabled = true
  // Generates QR code after deal creation
}
```

**Redemption Flow:**
- Customer scans QR code
- Merchant verifies referral count
- System creates KickbackEvent
- Cash back = `bountyRewardAmount × referralCount`

#### 3. **Hidden Deal** 🔒
**Backend Requirements:**
- ✅ `accessCode` (auto-generated if not provided)
- ✅ All menu items forced to `isHidden: true`
- ✅ Optional bounty rewards (can combine with hidden)
- ✅ Access via: code, link (`/deals/hidden/:code`), or QR
- ✅ Validates access code uniqueness

**Backend Validation:**
```typescript
if (dealTypeName === 'Hidden Deal') {
  // Generates accessCode if not provided
  // Validates accessCode uniqueness
  // Forces all menuItems.isHidden = true
  // Optional: Can enable bounty rewards
}
```

**Access Methods:**
1. Direct link: `/deals/hidden/{accessCode}`
2. QR code link: `/qr/deal/{accessCode}`
3. Access code entry

#### 4. **Redeem Now Deal** ⚡
**Backend Requirements:**
- ✅ `discountPercentage` (required)
- ✅ Preset discounts: 15%, 30%, 45%, 50%, 75% OR custom (1-100%)
- ✅ Duration MUST be ≤ 24 hours
- ✅ Auto-enables `isFlashSale: true`
- ✅ Optional `maxRedemptions` limit
- ✅ Tracks `currentRedemptions`

**Backend Validation:**
```typescript
if (dealTypeName === 'Redeem Now') {
  // Validates discountPercentage is preset or 1-100%
  // Validates duration <= 24 hours
  // Auto-sets isFlashSale = true
  // Validates maxRedemptions >= 1 if provided
}
```

---

## 🔍 Frontend vs Backend Comparison

### Current Frontend Implementation

#### ✅ **Happy Hour Flow** - PARTIALLY CORRECT
**Current Flow:**
1. Select "Happy Hour" → Navigate to `/merchant/deals/create/happy-hour/edit`
2. Uses `HappyHourEditorPage` with `HappyHourContext`
3. `AddMenuItemPage` filters to `isHappyHour: true` ✅
4. Supports item-specific discounts ✅
5. Has all required fields ✅

**Issues:**
- ⚠️ Navigation from `DealTypeStep` goes to Happy Hour editor (correct)
- ⚠️ But Happy Hour uses separate context (`HappyHourContext`) vs `DealCreationContext`
- ⚠️ Need to verify menu item validation matches backend

#### ✅ **Bounty Deal Flow** - MOSTLY CORRECT
**Current Flow:**
1. Select "Bounty Deal" → Navigate to `/merchant/deals/create/bounty`
2. `DealBountyStep` collects:
   - `bountyRewardAmount` ✅
   - `minReferralsRequired` ✅
3. Auto-enables kickback ✅
4. QR code display component created ✅

**Issues:**
- ⚠️ QR code shown in review step (placeholder) - should show after creation
- ⚠️ Need to verify QR code is in API response handling

#### ✅ **Hidden Deal Flow** - MOSTLY CORRECT
**Current Flow:**
1. Select "Hidden Deal" → Navigate to `/merchant/deals/create/hidden`
2. `DealHiddenStep` collects `accessCode` ✅
3. Shows shareable link ✅
4. Route `/deals/hidden/:code` created ✅

**Issues:**
- ⚠️ Optional bounty rewards not shown in UI (backend supports it)
- ⚠️ Menu items should be auto-set to hidden (backend does this, but UI should reflect)

#### ⚠️ **Redeem Now Flow** - NEEDS FIXES
**Current Flow:**
1. Select "Redeem Now" → Navigate to `/merchant/deals/create/basics`
2. Goes through standard flow
3. `DealOfferStep` shows warning and presets ✅
4. `DealScheduleStep` shows 24-hour warning ✅

**Issues:**
- ❌ Discount presets should be: 15%, 30%, 45%, 50%, 75% (currently: 15%, 30%, 45%, 50%, 75% ✅)
- ❌ Duration validation happens in schedule step (correct)
- ⚠️ `isFlashSale` should be auto-set (backend does this)
- ⚠️ `maxRedemptions` field not in UI (optional but should be available)

---

## 🗺️ Deal Type Flow Mapping

### Flow 1: **Happy Hour Deal**
```
DealTypeStep (HAPPY_HOUR)
  ↓
HappyHourEditorPage (/happy-hour/edit)
  ├─ Time ranges
  ├─ Date range
  ├─ Add Menu Items → AddMenuItemPage
  │   └─ Filters: isHappyHour === true ✅
  ├─ Item-specific discounts
  ├─ Global discount
  ├─ Images
  ├─ Redemption instructions
  ├─ Offer terms
  ├─ Advanced scheduling
  ├─ Location targeting
  └─ Publish
```

**Status:** ✅ Correct flow, separate context

### Flow 2: **Bounty Deal**
```
DealTypeStep (BOUNTY)
  ↓
DealBountyStep (/bounty)
  ├─ bountyRewardAmount (required)
  ├─ minReferralsRequired (required)
  └─ Auto-enable kickback ✅
  ↓
DealBasicsStep (/basics)
  ├─ Title, description, category
  ↓
DealMenuStep (/menu)
  ├─ Select menu items
  ↓
DealOfferStep (/offer)
  ├─ Discount percentage/amount
  ↓
DealImagesStep (/images)
  ├─ Upload images
  ↓
DealScheduleStep (/schedule)
  ├─ Date range
  ├─ Advanced scheduling (optional)
  ↓
DealLocationStep (/location)
  ├─ Store/city targeting (optional)
  ↓
DealInstructionsStep (/instructions)
  ├─ Redemption instructions
  ↓
DealAdvancedStep (/advanced)
  ├─ Additional settings
  ↓
DealReviewStep (/review)
  ├─ Shows bounty info
  ├─ QR code placeholder
  └─ Publish → Backend generates QR code
```

**Status:** ✅ Flow correct, QR code handling needs verification

### Flow 3: **Hidden Deal**
```
DealTypeStep (HIDDEN)
  ↓
DealHiddenStep (/hidden)
  ├─ accessCode (auto-generate or custom)
  ├─ Shareable link preview
  └─ Optional bounty info (NOT IN UI ❌)
  ↓
DealBasicsStep (/basics)
  ├─ Title, description, category
  ↓
DealMenuStep (/menu)
  ├─ Select menu items
  └─ Items should show as "will be hidden" ⚠️
  ↓
DealOfferStep (/offer)
  ├─ Discount percentage/amount
  ↓
DealImagesStep (/images)
  ├─ Upload images
  ↓
DealScheduleStep (/schedule)
  ├─ Date range
  ├─ Advanced scheduling (optional)
  ↓
DealLocationStep (/location)
  ├─ Store/city targeting (optional)
  ↓
DealInstructionsStep (/instructions)
  ├─ Redemption instructions
  ↓
DealAdvancedStep (/advanced)
  ├─ Additional settings
  └─ Optional bounty rewards (NOT IN UI ❌)
  ↓
DealReviewStep (/review)
  ├─ Shows access code
  ├─ Shows shareable link
  └─ Publish → Backend forces isHidden=true
```

**Status:** ⚠️ Missing optional bounty rewards in UI

### Flow 4: **Redeem Now Deal**
```
DealTypeStep (REDEEM_NOW)
  ↓
DealBasicsStep (/basics)
  ├─ Title, description, category
  ↓
DealMenuStep (/menu)
  ├─ Select menu items
  ↓
DealOfferStep (/offer)
  ├─ Discount presets: 15%, 30%, 45%, 50%, 75% ✅
  ├─ Custom discount (1-100%) ✅
  └─ Warning about 24-hour limit ✅
  ↓
DealImagesStep (/images)
  ├─ Upload images
  ↓
DealScheduleStep (/schedule)
  ├─ Date range
  ├─ 24-hour duration validation ✅
  ├─ Warning if > 24 hours ✅
  └─ Advanced scheduling (optional)
  ↓
DealLocationStep (/location)
  ├─ Store/city targeting (optional)
  ↓
DealInstructionsStep (/instructions)
  ├─ Redemption instructions
  ↓
DealAdvancedStep (/advanced)
  ├─ Additional settings
  └─ maxRedemptions (NOT IN UI ❌)
  ↓
DealReviewStep (/review)
  ├─ Shows deal info
  └─ Publish → Backend sets isFlashSale=true
```

**Status:** ⚠️ Missing maxRedemptions field

### Flow 5: **Standard Deal**
```
DealTypeStep (STANDARD)
  ↓
DealBasicsStep (/basics)
  ↓
DealMenuStep (/menu)
  ↓
DealOfferStep (/offer)
  ↓
DealImagesStep (/images)
  ↓
DealScheduleStep (/schedule)
  ↓
DealLocationStep (/location)
  ↓
DealInstructionsStep (/instructions)
  ↓
DealAdvancedStep (/advanced)
  ↓
DealReviewStep (/review)
  └─ Publish
```

**Status:** ✅ Standard flow, no special requirements

### Flow 6: **Recurring Deal**
```
DealTypeStep (RECURRING)
  ↓
DealBasicsStep (/basics)
  ↓
... (same as Standard)
  ↓
DealScheduleStep (/schedule)
  ├─ Date range
  └─ Recurring days selector ✅
  ↓
... (rest of flow)
```

**Status:** ✅ Recurring days handled in schedule step

---

## 🔧 Issues & Gaps Identified

### Critical Issues

1. **Hidden Deal - Missing Optional Bounty**
   - Backend supports: Hidden deals can have bounty rewards
   - Frontend: No UI to enable bounty in hidden deals
   - **Fix:** Add bounty section to `DealAdvancedStep` when deal type is HIDDEN

2. **Redeem Now - Missing maxRedemptions**
   - Backend supports: Optional redemption limit
   - Frontend: No field to set max redemptions
   - **Fix:** Add maxRedemptions field to `DealAdvancedStep` when deal type is REDEEM_NOW

3. **Menu Items - Hidden Deal Indicator**
   - Backend: Forces all items to `isHidden: true`
   - Frontend: Should show warning/indicator that items will be hidden
   - **Fix:** Add indicator in `DealMenuStep` when deal type is HIDDEN

### Medium Priority Issues

4. **QR Code Display After Creation**
   - Backend: Returns `bountyQRCode` in response
   - Frontend: Shows placeholder in review, but should show actual QR after creation
   - **Fix:** Show success modal with QR code after bounty deal creation

5. **Happy Hour Menu Item Validation**
   - Backend: Validates all items are `isHappyHour: true`
   - Frontend: Filters correctly, but should show clearer error if validation fails
   - **Fix:** Better error handling in Happy Hour editor

6. **Redeem Now Discount Validation**
   - Backend: Validates discount is preset or 1-100%
   - Frontend: Allows any percentage, should validate presets
   - **Fix:** Add validation in `DealOfferStep` for Redeem Now

### Low Priority / Enhancements

7. **Deal Type Descriptions**
   - Current descriptions are generic
   - Should match backend requirements more closely
   - **Fix:** Update descriptions in `DealTypeStep`

8. **Flow Consistency**
   - Happy Hour uses separate context (correct)
   - Other deals use `DealCreationContext` (correct)
   - But navigation could be clearer
   - **Fix:** Add flow indicators

---

## 📋 Implementation Plan

### Phase 1: Critical Fixes

#### 1.1 Add Bounty to Hidden Deals
**File:** `web/src/components/merchant/create-deal/DealAdvancedStep.tsx`
- Add conditional section for Hidden deals
- Show bounty reward fields (optional)
- Only show if deal type is HIDDEN

#### 1.2 Add maxRedemptions to Redeem Now
**File:** `web/src/components/merchant/create-deal/DealAdvancedStep.tsx`
- Add maxRedemptions input field
- Only show if deal type is REDEEM_NOW
- Validate: >= 1 or 0 for unlimited

#### 1.3 Add Hidden Deal Indicator in Menu Step
**File:** `web/src/components/merchant/create-deal/DealMenuStep.tsx`
- Show banner: "All items in hidden deals will be hidden from public view"
- Add visual indicator on selected items

### Phase 2: Validation & Error Handling

#### 2.1 Redeem Now Discount Validation
**File:** `web/src/components/merchant/create-deal/DealOfferStep.tsx`
- Validate discount is preset (15, 30, 45, 50, 75) or 1-100%
- Show error if invalid
- Update presets to match backend exactly

#### 2.2 Happy Hour Item Validation
**File:** `web/src/pages/merchant/AddMenuItemPage.tsx`
- Already filters correctly ✅
- Add better error message if somehow non-HH item selected

#### 2.3 Duration Validation for Redeem Now
**File:** `web/src/components/merchant/create-deal/DealScheduleStep.tsx`
- Already shows warning ✅
- Should prevent proceeding if > 24 hours

### Phase 3: QR Code & Response Handling

#### 3.1 Show QR Code After Bounty Deal Creation
**File:** `web/src/components/merchant/create-deal/DealReviewStep.tsx`
- After successful creation, show modal with QR code
- Allow download/print
- Show instructions

#### 3.2 Handle Backend Response Correctly
**File:** `web/src/components/merchant/create-deal/DealReviewStep.tsx`
- Extract `bountyQRCode` from response
- Extract `hidden` object with access code and links
- Extract `flashSale` object with redemption info

### Phase 4: UI/UX Improvements

#### 4.1 Update Deal Type Descriptions
**File:** `web/src/components/merchant/create-deal/DealTypeStep.tsx`
- Update descriptions to match backend requirements
- Add specific requirements for each type

#### 4.2 Add Flow Indicators
- Show which step you're on
- Show deal type-specific requirements
- Add help tooltips

---

## ✅ Verification Checklist

### Happy Hour Deal
- [ ] Menu items filtered to `isHappyHour: true` only
- [ ] Error shown if non-HH item selected
- [ ] Item-specific discounts work
- [ ] All fields included in payload
- [ ] Backend validation passes

### Bounty Deal
- [ ] Bounty step collects reward amount and min referrals
- [ ] Kickback auto-enabled
- [ ] QR code generated by backend
- [ ] QR code displayed after creation
- [ ] QR code shown in deal detail page
- [ ] Redemption flow works with QR verification

### Hidden Deal
- [ ] Access code generated/collected
- [ ] Shareable link shown
- [ ] Route `/deals/hidden/:code` works
- [ ] Menu items marked as hidden (backend does this)
- [ ] Optional bounty rewards can be added
- [ ] Access code uniqueness validated

### Redeem Now Deal
- [ ] Discount presets: 15%, 30%, 45%, 50%, 75%
- [ ] Custom discount validation (1-100%)
- [ ] 24-hour duration warning shown
- [ ] Duration validation prevents > 24 hours
- [ ] maxRedemptions field available
- [ ] isFlashSale auto-set (backend)
- [ ] Redemption tracking works

### Standard Deal
- [ ] Standard flow works
- [ ] No special requirements
- [ ] All fields optional/required correctly

### Recurring Deal
- [ ] Recurring days selector works
- [ ] At least one day required
- [ ] Days saved correctly
- [ ] Backend validation passes

---

## 🎯 Priority Order

1. **HIGH:** Add maxRedemptions to Redeem Now
2. **HIGH:** Add optional bounty to Hidden deals
3. **MEDIUM:** QR code display after bounty creation
4. **MEDIUM:** Redeem Now discount validation
5. **MEDIUM:** Hidden deal menu item indicator
6. **LOW:** Flow indicators and descriptions

---

## 📝 Next Steps

1. Review this analysis
2. Implement Phase 1 fixes (Critical)
3. Test each deal type end-to-end
4. Verify backend responses match frontend expectations
5. Update documentation

