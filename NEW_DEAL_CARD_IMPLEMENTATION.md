# 🎴 New Deal Card Implementation Summary

## ✅ Component Created: `NewDealCard.tsx`

A complete redesign of the deal card component based on Figma V3 design, with full dynamic functionality and backend integration.

---

## 🎨 Design Features Implemented

### **Card Structure:**
1. ✅ Full-height image card (aspect 4:5)
2. ✅ Dark gradient overlay (from-black/40 via-black/30 to-black/70)
3. ✅ Top left: User avatars with "+X tapped in" count
4. ✅ Top right: Action buttons (Share, Heart/Favorite, Menu) with glassmorphism
5. ✅ Bottom overlay: Large headline "Earn Money for Every Friend"
6. ✅ Restaurant name + distance display
7. ✅ Compact stats badges row (countdown, cash reward, % off, secret deal, coins)
8. ✅ Split button design: "I'll Bite" button + Reward badge

### **Interactive Overlays:**
1. ✅ **Menu Peek Overlay** - Full card overlay with tabs:
   - BITES tab (food items)
   - DRINKS tab (beverage items)
   - RESERVATIONS tab (date selector, party size, time slots)

2. ✅ **Incentive Details Overlay** - Full screen overlay:
   - Large reward amount display
   - "How it works" rules section
   - Countdown warning
   - CTA buttons

3. ✅ **Share Sheet Overlay** - Full screen overlay:
   - Earnings card (green)
   - Qualification steps
   - Referral link with copy button
   - Social share buttons (Facebook, Twitter, Instagram)

---

## 🔄 Deal Type Detection & Mapping

### **Incentive Types:**
The component automatically detects the deal type based on backend data:

```typescript
type IncentiveType = 'cash' | 'surprise' | 'coins' | 'redeem';

// Detection Logic:
- 'cash': dealType === 'BOUNTY' || 'Bounty Deal' (has bountyRewardAmount)
- 'surprise': dealType === 'HIDDEN' || 'Hidden Deal'
- 'redeem': dealType === 'REDEEM_NOW' || 'Redeem Now'
- 'coins': Future implementation (loyalty points system)
```

### **Data Mapping:**

| Figma Field | Backend Source | Status |
|-------------|---------------|--------|
| `tappedInCount` | `deal.claimedBy.totalCount` | ✅ Ready |
| `tappedInUsers` | `deal.claimedBy.visibleUsers` | ✅ Ready |
| `cashPerFriend` | `bountyRewardAmount / minReferralsRequired` | ✅ Ready |
| `maxFriends` | `deal.minReferralsRequired` | ✅ Ready |
| `maxCash` | `cashPerFriend * maxFriends` | ✅ Calculated |
| `distance` | Calculate from user location + merchant coordinates | ⚠️ Needs geolocation |
| `timeDisplay` | `deal.status.timeRemaining.formatted` or countdown | ✅ Ready |
| `isActive` | `deal.status.isActive` | ✅ Ready |
| `isUpcoming` | `deal.status.isUpcoming` | ✅ Ready |
| `discountPercentage` | `deal.discountPercentage` | ✅ Ready |
| `discountAmount` | `deal.discountAmount` | ✅ Ready |

---

## 🔌 API Integration

### **APIs Currently Used:**

1. ✅ **Menu Items** - `GET /api/menu/items?merchantId={id}`
   - Hook: `useMenuItems({ merchantId })`
   - Used for: Menu Peek overlay (BITES & DRINKS tabs)
   - Filters: By category (food/bites vs drinks/beverages)

2. ✅ **Table Availability** - `GET /api/table-booking/availability/today?merchantId={id}`
   - Hook: `useTodayAvailability(merchantId)`
   - Used for: RESERVATIONS tab time slots
   - Returns: Available time slots for today

3. ✅ **Save Deal** - `POST /api/users/save-deal`
   - Hook: `useSavedDeals()`
   - Used for: Heart/Favorite button functionality

4. ✅ **Deal Data** - Already fetched in parent component
   - Includes: `claimedBy`, `bountyRewardAmount`, `minReferralsRequired`, `status`, etc.

### **APIs That May Need Enhancement:**

1. ⚠️ **Friend Invites System** - Currently not implemented
   - Needed for: Share sheet friend tracking
   - Future: `GET /api/deals/:id/invites` or similar

2. ⚠️ **Referral Tracking** - Partially implemented
   - Current: Share link includes `?ref={userId}`
   - Future: Backend tracking of referral clicks/check-ins

3. ⚠️ **Distance Calculation** - Needs user location
   - Current: Passed as prop `distance?: number`
   - Future: Auto-calculate from user geolocation + merchant coordinates

---

## 📊 Component Props

```typescript
interface NewDealCardProps {
  deal: Deal;                    // Full deal object from backend
  onClick?: () => void;          // Handler for card click (navigate to detail)
  distance?: number;             // Distance in miles (optional, can be calculated)
}
```

---

## 🎯 Deal Type-Specific Features

### **1. Cash Deals (BOUNTY):**
- Shows: "up to $X cash" badge
- Incentive Details: Maximum cash reward, per friend amount
- Share Sheet: Full referral system with earnings card
- Badge: Green cash icon

### **2. Discount Deals (REDEEM_NOW):**
- Shows: "X% off" badge
- Incentive Details: Discount percentage, max discount amount
- Badge: Sparkles icon with percentage

### **3. Surprise Deals (HIDDEN):**
- Shows: "Unlock Surprise" badge
- Incentive Details: Mystery reward explanation
- Badge: Gift icon

### **4. Coins Deals (Future):**
- Shows: "Steal X coins" badge
- Incentive Details: Coins available to steal
- Badge: Flame icon

---

## 🔧 Integration Steps

### **Step 1: Update HomePage to use NewDealCard**

Replace `PremiumV2DealCard` with `NewDealCard` in:
- `web/src/pages/HomePage.tsx`
- `web/src/components/common/ContentCarousel.tsx` (or create new ScrollableDealsSection)

### **Step 2: Calculate Distance**

Add distance calculation in parent component:
```typescript
// Get user location (from geolocation or user profile)
const userLocation = { lat: 40.7128, lng: -74.0060 };

// Calculate distance for each deal
const distance = calculateDistance(
  userLocation,
  { lat: deal.merchant.latitude, lng: deal.merchant.longitude }
);
```

### **Step 3: Handle Deal Type Mapping**

Ensure backend returns:
- `bountyRewardAmount` for cash deals
- `minReferralsRequired` for cash deals
- `dealType` as string or object with `name` property
- `claimedBy` with `totalCount` and `visibleUsers`

---

## 📝 Notes & Considerations

### **Menu Items:**
- Currently filters by category name (food, drink, etc.)
- May need backend category standardization
- Falls back gracefully if no menu items available

### **Reservations:**
- Uses `useTodayAvailability` hook
- Falls back to mock time slots if API unavailable
- Date selector currently shows: Today, Tomorrow, Sat, Sun

### **Share Functionality:**
- Generates referral link with `?ref={userId}` parameter
- Copy to clipboard functionality
- Social share buttons (UI ready, actual sharing needs implementation)

### **Animations:**
- Uses Framer Motion for smooth transitions
- Hover effects on card (lift up)
- Overlay animations (fade in/out, scale)

### **Responsive Design:**
- Card maintains 4:5 aspect ratio
- Overlays are full-screen on mobile
- Stats badges scroll horizontally if needed

---

## 🚀 Next Steps

1. ✅ Component created and styled
2. ⏳ Integrate into HomePage/ScrollableDealsSection
3. ⏳ Add distance calculation utility
4. ⏳ Test with real backend data
5. ⏳ Add friend invites tracking (if backend ready)
6. ⏳ Implement actual social sharing (not just UI)

---

## 📚 Files Modified/Created

### **Created:**
- `web/src/components/landing/NewDealCard.tsx` (785 lines)

### **Modified:**
- `web/src/data/deals.ts` - Added `bountyRewardAmount` and `minReferralsRequired` to Deal interface

### **Dependencies:**
- ✅ All hooks exist and are ready
- ✅ All UI components exist (Avatar, Badge, Button, Tabs)
- ✅ All icons from lucide-react
- ✅ Framer Motion for animations

---

**Status**: ✅ Component Complete - Ready for Integration
**Last Updated**: 2025-01-27

