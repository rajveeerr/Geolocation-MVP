# QA Testing Checklist - Deal Creation Flow

## ✅ What We've Implemented So Far

### 1. **Critical Bug Fixes**
- ✅ Fixed missing `Zap` icon import in `DealOfferStep.tsx` (was causing component crash)
- ✅ Fixed API endpoint path: Changed `/merchant/me/stores` → `/merchants/stores` in:
  - `useMerchantStores.ts`
  - `useMerchantCities.ts`
- ✅ Created `HiddenDealPage.tsx` and added route `/deals/hidden/:code` for accessing hidden deals

### 2. **Happy Hour Deal Flow Enhancements**
- ✅ Extended `HappyHourContext` with missing fields:
  - `imageUrls`, `primaryImageIndex`
  - `redemptionInstructions`, `offerTerms`
  - `validDaysOfWeek`, `validHours`
  - `storeIds`, `cityIds`
  - Item-specific discount fields (`customPrice`, `customDiscount`, `discountAmount`)
- ✅ Updated `AddMenuItemPage` to:
  - Fetch real menu items from API using `useMerchantMenu()`
  - Filter to show only Happy Hour items (`isHappyHour: true`)
  - Add loading, error, and empty states
  - Validate Happy Hour items before selection
- ✅ Created `HappyHourItemDiscountEditor` component for per-item discounts
- ✅ Added missing fields to `HappyHourEditorPage`:
  - Redemption instructions field
  - Offer terms field
  - Advanced scheduling (days of week, hours)
  - Location targeting (stores, cities)
  - Image upload with primary image selection
  - Item discount editing
- ✅ Updated Happy Hour payload to include:
  - All menu items with discount fields
  - All missing fields (images, scheduling, location, etc.)

### 3. **Standard Deal Flow Enhancements** (Previously Implemented)
- ✅ Deal type-specific steps (Bounty, Hidden, Redeem Now)
- ✅ Location targeting step
- ✅ Advanced scheduling in schedule step
- ✅ All deal types properly mapped to backend format

---

## 🧪 Detailed QA Testing Checklist

### **Phase 1: Critical Bug Fixes Testing**

#### 1.1 Deal Offer Step - Zap Icon Fix
- [ ] Navigate to `/merchant/deals/create/offer`
- [ ] Verify page loads without errors (check browser console)
- [ ] Select "Redeem Now" deal type in previous step
- [ ] Verify "Redeem Now Deal" warning appears with Zap icon
- [ ] Verify no `ReferenceError: Zap is not defined` in console
- [ ] Test all three offer types (Percentage, Amount, Custom)
- [ ] Verify Next button behavior

#### 1.2 Store/City API Endpoints
- [ ] Open browser DevTools → Network tab
- [ ] Navigate to any step that uses stores/cities (e.g., Location step)
- [ ] Verify API call to `/api/merchants/stores` (not `/api/merchant/me/stores`)
- [ ] Verify API returns 200 OK (not 404)
- [ ] Verify stores list loads correctly
- [ ] Verify cities list loads correctly
- [ ] Test with merchant that has no stores (should show empty state)

#### 1.3 Hidden Deal Access
- [ ] Create a Hidden Deal with access code (e.g., "SECRET123")
- [ ] Copy the shareable link from review step
- [ ] Open link in incognito/private window: `/deals/hidden/SECRET123`
- [ ] Verify page loads (not 404)
- [ ] Verify deal details are displayed correctly
- [ ] Test with invalid access code (should show "Not Found" page)
- [ ] Test with expired deal (if applicable)
- [ ] Verify redirect to deal detail page works

---

### **Phase 2: Happy Hour Deal Flow Testing**

#### 2.1 Menu Item Selection
- [ ] Navigate to Happy Hour creation: `/merchant/deals/create/happy-hour/edit`
- [ ] Click "Add items from menu"
- [ ] Verify loading state appears while fetching menu
- [ ] Verify only items with `isHappyHour: true` are shown
- [ ] Verify "All", "Bites", "Drinks" tabs work
- [ ] Test with merchant that has no Happy Hour items:
  - [ ] Verify empty state message appears
  - [ ] Verify "Go to Menu Management" button works
- [ ] Select multiple items
- [ ] Verify selected count updates
- [ ] Click "Confirm Selection(s)"
- [ ] Verify items appear in Happy Hour editor

#### 2.2 Item-Specific Discounts
- [ ] In Happy Hour editor, verify selected items are displayed
- [ ] Click edit (pencil) icon on an item
- [ ] Verify `HappyHourItemDiscountEditor` modal opens
- [ ] Test discount type selection:
  - [ ] "Use Global" - uses global discount
  - [ ] "Fixed Price" - set custom price
  - [ ] "Percentage" - set item-specific percentage
  - [ ] "Amount Off" - set item-specific dollar amount
- [ ] Verify price preview updates in real-time
- [ ] Click "Save Changes"
- [ ] Verify item shows "Custom Price" badge
- [ ] Verify final price calculation is correct
- [ ] Test "Reset" button (should revert to global discount)

#### 2.3 Happy Hour Editor - New Fields

**Redemption Instructions:**
- [ ] Verify textarea field exists
- [ ] Verify default value: "Show this screen to your server..."
- [ ] Enter custom instructions
- [ ] Verify value is saved in state

**Offer Terms:**
- [ ] Verify textarea field exists
- [ ] Enter terms (e.g., "Valid for dine-in only")
- [ ] Verify value is saved
- [ ] Leave empty (should be optional)

**Advanced Scheduling:**
- [ ] Click "Show" button for Advanced Scheduling
- [ ] Select days of week (Mon, Tue, etc.)
- [ ] Verify selected days are highlighted
- [ ] Enter valid hours (e.g., "09:00-17:00")
- [ ] Verify format validation (if any)
- [ ] Leave empty (should be optional)
- [ ] Verify values saved in state

**Location Targeting:**
- [ ] Click "Show" button for Location Targeting
- [ ] Verify stores list loads
- [ ] Select multiple stores
- [ ] Verify selected stores are highlighted
- [ ] Select multiple cities
- [ ] Verify selected cities are highlighted
- [ ] Deselect stores/cities
- [ ] Leave empty (should apply to all)

**Image Upload:**
- [ ] Verify image upload section exists
- [ ] Upload 1-5 images
- [ ] Verify images appear in grid
- [ ] Click an image to set as primary
- [ ] Verify primary image shows checkmark
- [ ] Remove images
- [ ] Verify primary index updates correctly

#### 2.4 Happy Hour Payload Submission
- [ ] Fill out all Happy Hour fields:
  - [ ] Title, description
  - [ ] Time ranges
  - [ ] Date range
  - [ ] Menu items (with some custom discounts)
  - [ ] Discount percentage/amount
  - [ ] Images
  - [ ] Redemption instructions
  - [ ] Offer terms (optional)
  - [ ] Advanced scheduling (optional)
  - [ ] Location targeting (optional)
  - [ ] Kickback settings
- [ ] Click "Publish Deal"
- [ ] Open browser DevTools → Network tab
- [ ] Verify POST request to `/api/deals`
- [ ] Check request payload includes:
  - [ ] `menuItems` array with all items
  - [ ] Item discount fields (`customPrice`, `customDiscount`, `discountAmount`)
  - [ ] `imageUrls` array
  - [ ] `primaryImageIndex`
  - [ ] `redemptionInstructions`
  - [ ] `offerTerms`
  - [ ] `validDaysOfWeek`
  - [ ] `validHours`
  - [ ] `storeIds`
  - [ ] `cityIds`
- [ ] Verify API returns success (200/201)
- [ ] Verify deal is created in backend
- [ ] Navigate to "My Deals" and verify Happy Hour deal appears

---

### **Phase 3: Standard Deal Flow Testing**

#### 3.1 Deal Type Selection
- [ ] Navigate to `/merchant/deals/create`
- [ ] Test each deal type:
  - [ ] **STANDARD** → Should go to `/merchant/deals/create/basics`
  - [ ] **RECURRING** → Should go to `/merchant/deals/create/basics`
  - [ ] **REDEEM_NOW** → Should go to `/merchant/deals/create/basics`
  - [ ] **BOUNTY** → Should go to `/merchant/deals/create/bounty`
  - [ ] **HIDDEN** → Should go to `/merchant/deals/create/hidden`
  - [ ] **HAPPY_HOUR** → Should go to `/merchant/deals/create/happy-hour/edit`

#### 3.2 Bounty Deal Flow
- [ ] Select "Bounty Deal"
- [ ] Verify navigates to Bounty step
- [ ] Enter reward amount (e.g., $5.00)
- [ ] Enter minimum referrals (e.g., 3)
- [ ] Verify earnings preview updates
- [ ] Click Next
- [ ] Verify kickback is auto-enabled
- [ ] Complete deal creation
- [ ] Verify bounty fields in review step
- [ ] Verify payload includes `bountyRewardAmount` and `minReferralsRequired`

#### 3.3 Hidden Deal Flow
- [ ] Select "Hidden Deal"
- [ ] Verify navigates to Hidden step
- [ ] Enter custom access code (e.g., "MYCODE123")
- [ ] Click "Generate" button
- [ ] Verify new code is generated
- [ ] Copy shareable link
- [ ] Click Next
- [ ] Complete deal creation
- [ ] Verify access code in review step
- [ ] Verify shareable link format: `/deals/hidden/{code}`
- [ ] Test accessing the hidden deal via link

#### 3.4 Redeem Now Deal Flow
- [ ] Select "Redeem Now"
- [ ] Navigate to Offer step
- [ ] Verify "Redeem Now Deal" warning appears
- [ ] Verify discount presets show: 15%, 30%, 45%, 50%, 75%
- [ ] Set discount (e.g., 30%)
- [ ] Navigate to Schedule step
- [ ] Set start time and end time
- [ ] If duration > 24 hours, verify warning appears
- [ ] Adjust to ≤ 24 hours
- [ ] Verify warning disappears
- [ ] Complete deal creation
- [ ] Verify deal is created successfully

#### 3.5 Location Targeting Step
- [ ] Navigate to Location step in standard flow
- [ ] Verify "Apply to all stores" toggle works
- [ ] Toggle off, select specific stores
- [ ] Verify selected stores are highlighted
- [ ] Verify "Apply to all cities" toggle works
- [ ] Toggle off, select specific cities
- [ ] Verify selected cities are highlighted
- [ ] Navigate to Review step
- [ ] Verify location targeting section appears
- [ ] Verify payload includes `storeIds` and `cityIds`

#### 3.6 Advanced Scheduling
- [ ] Navigate to Schedule step
- [ ] Set date range
- [ ] Scroll to "Advanced Scheduling" section
- [ ] Select specific days of week
- [ ] Enter valid hours (e.g., "09:00-17:00")
- [ ] Navigate to Review step
- [ ] Verify advanced scheduling section appears
- [ ] Verify payload includes `validDaysOfWeek` and `validHours`

#### 3.7 Deal Review & Submission
- [ ] Complete all steps of deal creation
- [ ] Navigate to Review step
- [ ] Verify all sections display correctly:
  - [ ] Basic Info (title, description, category)
  - [ ] Offer Details (discount, custom offer)
  - [ ] Menu Items (if any)
  - [ ] Schedule (dates, times)
  - [ ] Location Targeting (if set)
  - [ ] Advanced Scheduling (if set)
  - [ ] Bounty Info (if Bounty deal)
  - [ ] Hidden Deal Info (if Hidden deal)
  - [ ] Images
  - [ ] Additional Settings
- [ ] Click "Publish Deal"
- [ ] Verify loading state
- [ ] Verify success message/toast
- [ ] Verify redirect to "My Deals" or deal detail page
- [ ] Verify deal appears in merchant's deal list

---

### **Phase 4: Edge Cases & Error Handling**

#### 4.1 Validation Testing
- [ ] Test with empty required fields:
  - [ ] No deal type selected → Next button disabled
  - [ ] No discount entered → Next button disabled
  - [ ] No title → Should show validation error
  - [ ] No date range → Should show validation error
- [ ] Test invalid inputs:
  - [ ] Discount > 100% → Should show error
  - [ ] Negative discount → Should show error
  - [ ] Invalid date range (end before start) → Should show error
  - [ ] Invalid time format → Should show error

#### 4.2 Network Error Handling
- [ ] Disable network (offline mode)
- [ ] Try to fetch menu items → Should show error state
- [ ] Try to fetch stores → Should show error state
- [ ] Try to submit deal → Should show error toast
- [ ] Re-enable network
- [ ] Verify retry works

#### 4.3 Empty States
- [ ] Test with merchant that has:
  - [ ] No menu items → Should show empty state
  - [ ] No Happy Hour items → Should show empty state with CTA
  - [ ] No stores → Should show empty state
  - [ ] No cities → Should show empty state

#### 4.4 Navigation & State Persistence
- [ ] Start creating a deal
- [ ] Fill in some fields
- [ ] Navigate back and forth between steps
- [ ] Verify form data persists
- [ ] Refresh page (should lose state - expected)
- [ ] Test browser back button
- [ ] Test direct URL navigation to steps

---

### **Phase 5: UI/UX Testing**

#### 5.1 Visual Consistency
- [ ] Verify all steps use consistent styling
- [ ] Verify progress indicator updates correctly
- [ ] Verify button states (disabled/enabled) are clear
- [ ] Verify loading states are consistent
- [ ] Verify error states are user-friendly

#### 5.2 Responsive Design
- [ ] Test on mobile viewport (< 768px)
- [ ] Test on tablet viewport (768px - 1024px)
- [ ] Test on desktop (> 1024px)
- [ ] Verify all forms are usable on mobile
- [ ] Verify modals/dialogs work on mobile
- [ ] Verify image upload works on mobile

#### 5.3 Accessibility
- [ ] Test keyboard navigation (Tab, Enter, Escape)
- [ ] Verify focus states are visible
- [ ] Test with screen reader (if available)
- [ ] Verify ARIA labels are present
- [ ] Verify color contrast meets WCAG standards

---

### **Phase 6: Integration Testing**

#### 6.1 Backend Integration
- [ ] Verify all API calls use correct endpoints
- [ ] Verify request payloads match backend schema
- [ ] Verify response handling is correct
- [ ] Test with real backend (not mocks)
- [ ] Verify error responses are handled gracefully

#### 6.2 Data Flow
- [ ] Create deal → Verify appears in deal list
- [ ] Create deal → Verify appears in public deals
- [ ] Create Hidden deal → Verify accessible via code
- [ ] Create Happy Hour → Verify menu items linked correctly
- [ ] Create Bounty deal → Verify bounty settings saved
- [ ] Edit deal → Verify changes persist

---

## 🐛 Known Issues to Watch For

1. **Next Button Not Activating**
   - Check if `dealType` is set in context
   - Check if discount validation passes
   - Check browser console for errors

2. **404 Errors for Stores**
   - Should be fixed, but verify endpoint is `/api/merchants/stores`
   - Check if merchant has stores in database

3. **Hidden Deal Not Found**
   - Verify access code is correct (case-insensitive)
   - Verify deal exists and is not expired
   - Check backend route: `/api/deals/hidden/:code`

4. **Image Loading Failures**
   - Check image URLs are valid
   - Check CORS settings
   - Verify image upload completed successfully

---

## 📝 Test Results Template

```
Test Date: ___________
Tester: ___________
Environment: [ ] Dev [ ] Staging [ ] Production

### Critical Bugs Fixed
- [ ] Zap icon error - Status: ___________
- [ ] Store API 404 - Status: ___________
- [ ] Hidden deal route - Status: ___________

### Happy Hour Flow
- [ ] Menu item selection - Status: ___________
- [ ] Item discounts - Status: ___________
- [ ] New fields - Status: ___________
- [ ] Payload submission - Status: ___________

### Standard Deal Flow
- [ ] Deal type navigation - Status: ___________
- [ ] Bounty flow - Status: ___________
- [ ] Hidden flow - Status: ___________
- [ ] Redeem Now flow - Status: ___________
- [ ] Location targeting - Status: ___________
- [ ] Advanced scheduling - Status: ___________

### Issues Found
1. ___________
2. ___________
3. ___________

### Notes
___________
```

---

## 🚀 Quick Test Scenarios

### Scenario 1: Create Standard Deal
1. Go to `/merchant/deals/create`
2. Select "Standard Deal"
3. Fill title, description
4. Add menu items
5. Set 20% discount
6. Upload images
7. Set date range
8. Review and publish
9. ✅ Verify deal created successfully

### Scenario 2: Create Happy Hour Deal
1. Go to `/merchant/deals/create`
2. Select "Happy Hour"
3. Set time ranges
4. Add Happy Hour menu items
5. Set custom discount for one item
6. Upload images
7. Set redemption instructions
8. Publish
9. ✅ Verify deal created with all fields

### Scenario 3: Create Hidden Deal
1. Go to `/merchant/deals/create`
2. Select "Hidden Deal"
3. Generate access code
4. Complete deal creation
5. Copy shareable link
6. Open link in new window
7. ✅ Verify deal is accessible

---

## ✅ Sign-Off Criteria

Before marking as complete, verify:
- [ ] All critical bugs are fixed
- [ ] Happy Hour flow creates deals successfully
- [ ] All deal types work end-to-end
- [ ] No console errors in browser
- [ ] All API calls return 200/201 (not 404/500)
- [ ] Form validation works correctly
- [ ] Navigation between steps is smooth
- [ ] Data persists correctly
- [ ] Error states are user-friendly
- [ ] Mobile experience is acceptable

