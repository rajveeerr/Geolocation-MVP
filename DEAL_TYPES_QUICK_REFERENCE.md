# Deal Types Quick Reference - Frontend vs Backend

## 🎯 Quick Summary

| Deal Type | Frontend Status | Backend Status | Issues |
|-----------|----------------|----------------|--------|
| **Happy Hour** | ✅ Correct | ✅ Complete | None |
| **Bounty** | ⚠️ Mostly Correct | ✅ Complete | QR code display after creation |
| **Hidden** | ⚠️ Missing Features | ✅ Complete | Optional bounty not in UI |
| **Redeem Now** | ❌ Missing Fields | ✅ Complete | maxRedemptions missing, validation incomplete |
| **Standard** | ✅ Correct | ✅ Complete | None |
| **Recurring** | ✅ Correct | ✅ Complete | None |

---

## 📋 What Each Deal Type Needs

### 1. Happy Hour 🕐
**Backend Says:**
- Only items with `isHappyHour: true` allowed
- Validates all items are Happy Hour items

**Frontend Does:**
- ✅ Filters menu to show only Happy Hour items
- ✅ Prevents selecting non-HH items
- ✅ Uses separate HappyHourContext

**Status:** ✅ **PERFECT** - No changes needed

---

### 2. Bounty Deal 🏆
**Backend Says:**
- Requires: `bountyRewardAmount` (> 0), `minReferralsRequired` (≥ 1)
- Auto-enables: `kickbackEnabled: true`
- Auto-generates: `bountyQRCode` after creation
- QR code used for verification when redeeming

**Frontend Does:**
- ✅ Collects bounty amount and min referrals
- ✅ Auto-enables kickback
- ⚠️ Shows QR placeholder (should show actual QR after creation)

**Missing:**
- ❌ QR code display after deal creation (in success modal)
- ❌ Extract QR code from API response

**Status:** ⚠️ **NEEDS FIX** - QR code display after creation

---

### 3. Hidden Deal 🔒
**Backend Says:**
- Requires: `accessCode` (auto-generated if not provided)
- Forces: All menu items `isHidden: true`
- Optional: Can add bounty rewards (combine hidden + bounty)
- Access via: code, link, or QR

**Frontend Does:**
- ✅ Collects/generates access code
- ✅ Shows shareable link
- ✅ Route `/deals/hidden/:code` works
- ❌ No UI for optional bounty rewards
- ⚠️ No indicator that items will be hidden

**Missing:**
- ❌ Optional bounty section in Advanced step
- ⚠️ Menu item indicator showing items will be hidden

**Status:** ⚠️ **NEEDS FIX** - Optional bounty and menu indicator

---

### 4. Redeem Now ⚡
**Backend Says:**
- Requires: `discountPercentage` (presets: 15, 30, 45, 50, 75 OR custom 1-100%)
- Requires: Duration ≤ 24 hours
- Auto-enables: `isFlashSale: true`
- Optional: `maxRedemptions` limit

**Frontend Does:**
- ✅ Shows discount presets: 15%, 30%, 45%, 50%, 75%
- ✅ Shows warning about 24-hour limit
- ⚠️ Doesn't prevent > 24 hours (just warns)
- ⚠️ Doesn't validate discount presets
- ❌ No maxRedemptions field

**Missing:**
- ❌ `maxRedemptions` input field
- ⚠️ Duration validation (should prevent > 24h)
- ⚠️ Discount validation (should check presets)

**Status:** ❌ **NEEDS FIX** - Multiple missing features

---

## 🔧 What Needs to Be Fixed

### Critical (Do First)

1. **Redeem Now - Add maxRedemptions Field**
   - Where: `DealAdvancedStep.tsx`
   - What: Add input for max redemptions (0 = unlimited)
   - When: Only show if `dealType === 'REDEEM_NOW'`

2. **Redeem Now - Fix Duration Validation**
   - Where: `DealScheduleStep.tsx`
   - What: Prevent Next button if duration > 24 hours
   - When: Only for `dealType === 'REDEEM_NOW'`

3. **Redeem Now - Fix Discount Validation**
   - Where: `DealOfferStep.tsx`
   - What: Validate discount is preset (15,30,45,50,75) or 1-100%
   - When: Only for `dealType === 'REDEEM_NOW'`

4. **Hidden Deal - Add Optional Bounty**
   - Where: `DealAdvancedStep.tsx`
   - What: Add bounty reward fields (optional)
   - When: Only show if `dealType === 'HIDDEN'`

### Important (Do Second)

5. **Hidden Deal - Menu Item Indicator**
   - Where: `DealMenuStep.tsx`
   - What: Show banner "Items will be hidden from public view"
   - When: Only if `dealType === 'HIDDEN'`

6. **Bounty Deal - QR Code After Creation**
   - Where: `DealReviewStep.tsx`
   - What: Show QR code in success modal after creation
   - When: After successful bounty deal creation

---

## 🗺️ Flow Maps

### Happy Hour Flow ✅
```
Type → Happy Hour Editor → Add Menu (HH only) → Configure → Publish
```

### Bounty Flow ⚠️
```
Type → Bounty Step → Basics → Menu → Offer → ... → Review → Publish
                                                              ↓
                                                      Show QR Code (needs fix)
```

### Hidden Flow ⚠️
```
Type → Hidden Step → Basics → Menu → ... → Advanced → Review → Publish
                                    ↓              ↓
                            Show indicator    Add bounty (needs fix)
```

### Redeem Now Flow ❌
```
Type → Basics → Menu → Offer → Schedule → ... → Advanced → Review → Publish
                    ↓         ↓                      ↓
            Validate discount  Prevent >24h    Add maxRedemptions
            (needs fix)       (needs fix)      (needs fix)
```

---

## ✅ Verification Checklist

### Happy Hour
- [x] Menu filtered to Happy Hour items only
- [x] Item-specific discounts work
- [x] All fields included
- [x] Backend validation will pass

### Bounty
- [x] Bounty fields collected
- [x] Kickback auto-enabled
- [ ] QR code shown after creation
- [ ] QR code in deal detail page

### Hidden
- [x] Access code works
- [x] Shareable link works
- [ ] Optional bounty available
- [ ] Menu indicator shown

### Redeem Now
- [x] Discount presets shown
- [ ] Discount validation works
- [ ] Duration validation prevents > 24h
- [ ] maxRedemptions field available

---

## 🚀 Implementation Order

1. **Redeem Now fixes** (highest impact)
2. **Hidden Deal optional bounty** (feature completeness)
3. **Bounty QR code display** (UX improvement)
4. **Hidden menu indicator** (UX improvement)

