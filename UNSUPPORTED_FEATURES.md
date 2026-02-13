# Unsupported Features — Deal Detail / Restaurant Info Page

> **Generated for:** Figma design → Frontend implementation gap analysis  
> **Last Updated:** February 9, 2026  
> **Status:** These features are shown in the Figma design but have **NO backend support**. They are rendered on the frontend with placeholder/mock data and visually disabled or marked as "Coming Soon".

---

## ❌ Features Not Supported by Backend

### 1. Reviews & Ratings System
- **Figma shows:** Star ratings (4.7/5), review count (842 reviews), individual reviews with avatar/name/date/stars/text, verified vs unverified filter, "Write Review" button, reviewer purchase history with food photos, report button
- **Backend status:** No `Review` model in Prisma schema. No review-related API endpoints exist.
- **Frontend status:** Reviews tab renders with placeholder data from `detail-page-placeholders.ts`. "Write Review" button is shown but disabled. Rating summary (4.7, 842 reviews) appears in the Info tab header using placeholder values.
- **Action needed:**
  - Create `Review` model: `{ id, userId, merchantId, dealId?, rating, text, isVerified, purchases[], purchaseImages[], createdAt }`
  - Endpoints: `POST /api/reviews` (create), `GET /api/reviews?merchantId=X` (list), `POST /api/reviews/:id/helpful` (upvote), `POST /api/reviews/:id/report`
  - Integrate `verified` status by checking if user has a check-in at the merchant
  - Replace `placeholderRatingsSummary` in Info tab header with real computed average
- **Onboarding requirement:** None (user-generated content)

### 2. Media / News / PR Section
- **Figma shows:** NEWS/PR toggle, article cards with source/headline/description/date/Read More link, "Featured on TV" with video thumbnail and "Watch Video" link
- **Backend status:** No `News` or `Media` content model in Prisma. Only a generic image upload endpoint exists at `POST /api/media/upload`.
- **Frontend status:** Media tab renders with placeholder articles from `detail-page-placeholders.ts`. "Read More" and "Watch Video" links are disabled.
- **Action needed:** Create `MediaArticle` / `NewsItem` model with `{ id, merchantId, source, headline, excerpt, url, imageUrl, type (news/pr/tv), date }`. Add CRUD endpoints for merchants.
- **Onboarding requirement:** Merchant must be able to add press/media links during or after onboarding

### 3. Venue Verification Badge ("VERIFIED VENUE")
- **Figma shows:** A red "VERIFIED VENUE" badge on the hero image
- **Backend status:** No `isVerified` or `verificationStatus` field on Merchant. Merchant has `status` (PENDING/APPROVED/REJECTED) but that's for account approval, not venue verification.
- **Frontend status:** Badge always shows (uses account approval status as proxy). Should only show for genuinely verified venues.
- **Action needed:** Add `isVerifiedVenue: Boolean @default(false)` to Merchant model. Admin endpoint to toggle verification after physical or document verification.
- **Onboarding requirement:** Admin-managed; verification happens post-onboarding

### 4. Price Range / Average Ticket
- **Figma shows:** "$35+" price range indicator and "AVG TICKET" label next to the restaurant name
- **Backend status:** No `priceRange` or `averageTicketPrice` field on Merchant. No endpoint computes average from menu items.
- **Frontend status:** **Dynamically computed from menu items** — `avgTicket` is calculated as the average of `discountedPrice || originalPrice` from `deal.menuItems`. Shows correctly when menu items exist; hidden when none.
- **Action needed (optional):** Add `priceRange: String` (e.g., "$", "$$", "$$$") field to Merchant model for display when no menu items are linked to a deal. The dynamic calculation is a good fallback.
- **Onboarding requirement:** Merchant selects price range tier during onboarding (optional since menu-based calculation works)

### 5. Venue Vibe Tags / Amenities
- **Figma shows:** "THE VIBE" section with tags like ENERGIZED, UPSCALE, VALET PARKING, LIVE DJ, ROOFTOP
- **Backend status:** No `tags`, `amenities`, `vibes`, or similar array field on Merchant model.
- **Frontend status:** Renders placeholder tags from `placeholderVibeTags` array.
- **Action needed:** Add `vibeTags: String[]` field to Merchant model. Provide a predefined list of options (ENERGIZED, CHILL, UPSCALE, CASUAL, VALET PARKING, LIVE DJ, ROOFTOP, PET FRIENDLY, OUTDOOR SEATING, etc.). CRUD via merchant dashboard.
- **Onboarding requirement:** Merchant selects applicable vibe tags from predefined list during onboarding (multi-select)

### 6. Operating Hours
- **Figma shows:** Full weekly schedule (Monday–Sunday) with open/close times, today's hours highlighted in maroon, dotted separator lines
- **Backend status:** No `operatingHours` field or `MerchantHours` relation table on Merchant.
- **Frontend status:** Renders placeholder hours from `placeholderHours`. Today is auto-detected and highlighted in maroon.
- **Action needed:** Create `MerchantHours` model: `{ id, merchantId, dayOfWeek (0-6), openTime, closeTime, isClosed }` OR add `operatingHours: Json` field to Merchant. Add CRUD endpoints.
- **Onboarding requirement:** **CRITICAL** — Merchant must set operating hours during onboarding. Default all days to a common schedule (e.g., 11 AM–10 PM) and let merchant customize.

### 7. Catering Service
- **Figma shows:** CATERING tab in right-column tab navigation
- **Backend status:** No catering model or endpoints exist.
- **Frontend status:** Tab shown but disabled with "Coming Soon" tooltip and lock icon.
- **Action needed:** Design and implement catering request/quote system
- **Onboarding requirement:** Not needed initially (v2 feature)

### 8. Merchandise / Shop
- **Figma shows:** MERCH tab in right-column tab navigation
- **Backend status:** No product/merchandise model or endpoints exist.
- **Frontend status:** Tab shown but disabled with "Coming Soon" tooltip. `ShopTab.tsx` exists with mock data.
- **Action needed:** Create `Product` model, add product CRUD endpoints, implement cart/checkout flow
- **Onboarding requirement:** Not needed initially (v2 feature)

### 9. Rides / Transportation
- **Figma shows:** RIDES tab in right-column tab navigation
- **Backend status:** No transportation/rides model or endpoints exist.
- **Frontend status:** Tab shown but disabled with "Coming Soon" tooltip.
- **Action needed:** Integrate ride-sharing APIs (Uber/Lyft) or build custom ride coordination system
- **Onboarding requirement:** Not needed (third-party integration)

### 10. Video Playback on Hero Image
- **Figma shows:** Play button overlay on hero image suggesting video support
- **Backend status:** No `videoUrl` field on Deal model. Event model has `videoUrl` but Deal does not.
- **Frontend status:** Play button has been **removed** from the hero gallery since no video support exists. It should only be shown when an actual video URL is available.
- **Action needed:** Add `videoUrl: String?` field to Deal model or `videoUrls: String[]` to Merchant model. Once added, conditionally render the play button in HeroGallery when a video URL is present.
- **Onboarding requirement:** Merchant can optionally upload/link a promo video during onboarding

### 11. "Add to Basket" / Cart / Online Ordering
- **Figma shows:** "Add to Basket" buttons on menu items with cart icon
- **Backend status:** No cart, order, or checkout model/endpoints for consumer ordering. The existing `Order` model is for gamification coin purchases only.
- **Frontend status:** "Add to Basket" buttons shown but disabled with tooltip "Online ordering coming soon".
- **Action needed:** Build full ordering system: Cart model, Order model, payment integration, order tracking
- **Onboarding requirement:** Merchant opts into online ordering during setup (v2 feature)

### 12. Multiple Images per Menu Item
- **Figma shows:** Menu cards with image slideshow bars (like event cards on landing page), allowing multiple photos per dish
- **Backend status:** MenuItem model only has a single `imageUrl: String?` field. No `images: String[]` array or separate `MenuItemImage` model exists in Prisma.
- **Frontend status:** Image slideshow (ImageSlideshow component) is wired up on menu cards and will display multiple images with auto-advance bars when `images[]` array is provided. Currently uses mock data with multiple images; falls back to single `imageUrl` when no `images` array exists.
- **Action needed:** Add `images: String[]` field to MenuItem model (or a separate `MenuItemImage` join table) and update the menu item CRUD endpoints to accept/return multiple images. Update the image upload flow for merchants to support multiple photos per dish.
- **Onboarding requirement:** Merchant uploads 1-3 photos per menu item during dish creation

### 13. Menu Search & Filter
- **Figma shows:** Search icon (dark rounded button) and filter/sliders icon (light rounded button) next to the "Curated Menu" heading
- **Backend status:** No dedicated menu search or advanced filter endpoint. Menu items can be filtered by category on the frontend.
- **Frontend status:** Search and filter buttons are rendered but **disabled** with "coming soon" tooltips. Category filter pills work for basic filtering.
- **Action needed:** Add search endpoint (`GET /api/menu-items?search=...&filters=...`) with text search on name/description, price range filtering, dietary filters, etc.
- **Onboarding requirement:** Merchant tags menu items with dietary info, allergens, etc. during creation

### 12. Purchase History per Reviewer
- **Figma shows:** "Pete's Purchases" section within a review showing what food items the reviewer ordered with photos
- **Backend status:** No review model exists, and no way to link user orders to reviews.
- **Frontend status:** Rendered with placeholder data. Requires both Reviews (#1) and Ordering (#11) systems.
- **Action needed:** Depends on Reviews (#1) and Ordering (#11) systems being built first
- **Onboarding requirement:** None (user-generated content)

---

## ❌ Event Detail Page — Unsupported Features

> These apply specifically to the **EventDetailPage** (`/events/:eventId`).

### E1. Event Merchandise
- **Figma shows:** 3 product cards (Midnight Oversized Hoodie $65, Vanguard Street Cap $24 × 2) with "BEST SELLER" badges, heart/save icon, "+ ADD TO BASKET" button
- **Backend status:** No `EventProduct` / merchandise model in Prisma. No event merchandise endpoints.
- **Frontend status:** Rendered as disabled placeholder cards with a "Coming Soon" overlay. Matches Figma layout but is non-functional.
- **Action needed:** Create `EventProduct` model: `{ id, eventId, name, description, imageUrl, price, originalPrice, stockQuantity, category, isBestSeller, isActive }`. Add CRUD endpoints under `/api/events/:id/merchandise`. Wire to EventDetailPage.
- **Onboarding requirement:** Event organizer adds merchandise items during event creation (v2)

### E2. Per-Artist Bios / Livestream Data in Lineup
- **Figma shows:** Artist avatars with names and roles in "THE LINEUP" section
- **Backend status:** No `EventPerformer` or `EventLineupSlot` model. Lineup is inferred from event organizer + merchant + tags. No per-artist bio, social links, or livestream data.
- **Frontend status:** Lineup section renders organizer as headliner (red ring per Figma), merchant as venue partner, and tags as featured acts. No bios or social links.
- **Action needed:** Create `EventPerformer` model: `{ id, eventId, name, role, bio, avatarUrl, socialUrl, isHeadliner, sortOrder }`. Add to event create/update endpoints.
- **Onboarding requirement:** Event organizer adds performer details during event creation

---

## ⚠️ Partially Supported Features

### A. Events Tab
- **Backend:** ✅ Full events API exists (`/api/events`) with browsing, creation, ticket tiers, purchases, check-ins
- **Frontend gap:** `EventsTab.tsx` currently uses hardcoded `MOCK_EVENTS` instead of calling the real API. The tab needs to be rewired to use the real events endpoints, filtering by `merchantId`.
- **Action needed:** Create `useEvents(merchantId)` hook, update EventsTab to use real data
- **Onboarding requirement:** Merchant creates events via merchant dashboard (already supported)

### B. Gallery
- **Backend:** Deal has `images[]` array and `imageUrl`. No separate gallery management beyond deal images.
- **Frontend gap:** HeroGallery uses deal images if available but falls back to mock images. No user-submitted photos.
- **Action needed:** Consider allowing merchants to upload additional gallery images beyond deal images (merchant profile photos)
- **Onboarding requirement:** Merchant uploads venue photos during onboarding (currently only deal images)

### C. Social Media Links
- **Backend:** No social media URL fields on Merchant model (no `instagramUrl`, `facebookUrl`, etc.)
- **Frontend:** Not currently shown on detail page. Would need backend fields first.
- **Action needed:** Add `website: String?`, `instagramUrl: String?`, `facebookUrl: String?`, `twitterUrl: String?` to Merchant model
- **Onboarding requirement:** Merchant provides social links during onboarding (optional fields)

### D. Menu Items — Category Filtering
- **Backend:** ✅ `MenuItem` model has `category: String` field. Menu items returned in deal detail with their categories.
- **Frontend:** ✅ **Now fully dynamic** — category filter pills auto-generated from unique menu item categories. "Show All" button when more than 4 items. Item count shown dynamically.
- **No action needed** — works dynamically based on whatever categories merchants create.
- **Onboarding requirement:** Merchant assigns categories to menu items when creating them (already supported in menu CRUD)

---

## ✅ Fully Supported Features (Working End-to-End)

| Feature | Backend Source | Frontend Status |
|---------|---------------|-----------------|
| Deal details (title, description, offer, discount) | `GET /api/deals/:id` | ✅ Dynamic via `useDealDetail` |
| Merchant info (name, address, phone, logo) | Included in deal response | ✅ Dynamic |
| Merchant stores with cities | `deal.merchant.stores[]` | ✅ Dynamic, shows total stores count |
| Image gallery/carousel | `deal.images[]`, `deal.imageUrl` | ✅ Dynamic with thumbnails, nav arrows, counter |
| Social proof (saves, check-ins, avatars) | `deal.socialProof` | ✅ Dynamic |
| Countdown timer | `deal.status.timeRemaining` | ✅ Dynamic via `useCountdown` |
| Bounty reward card | `deal.bountyRewardAmount`, `deal.minReferralsRequired` | ✅ Dynamic |
| Menu items with pricing | `deal.menuItems[]` with `discountedPrice` | ✅ Dynamic with category filtering |
| Menu category filter | Auto-derived from `menuItem.category` | ✅ Dynamic — auto-generates filter pills |
| Average ticket price | Computed from `deal.menuItems[]` | ✅ Dynamic — no backend field needed |
| Check-in | `POST /api/users/check-in` | ✅ Dynamic via `useCheckIn` |
| **Table booking** | `GET /api/table-booking/merchants/:id/availability`, `POST /api/table-booking/bookings` | ✅ **Fully integrated** — date picker, time slots, table selection, contact info, booking confirmation |
| Save/unsave deal | Save endpoints | ✅ Dynamic via `useSavedDeals` |
| Share | Web Share API / clipboard fallback | ✅ Working |
| Call merchant | `deal.merchant.phoneNumber` | ✅ Dynamic — `tel:` link, only shown when phone exists |
| Directions to venue | `deal.merchant.latitude/longitude` | ✅ Dynamic — Google Maps link, only shown when coords exist |
| Leaderboard tab | Leaderboard endpoints | ✅ Dynamic via `useLeaderboard` |
| Deal type badges | `deal.dealType` | ✅ Dynamic |
| Category info | `deal.category` | ✅ Dynamic |
| Recurring days | `deal.recurringDays` | ✅ Dynamic |
| Kickback status | `deal.kickbackEnabled` | ✅ Dynamic |
| Redemption instructions | `deal.redemptionInstructions` | ✅ Dynamic — "Things to Know" section uses real data with fallback |

---

## 🏪 Onboarding Checklist for Merchants

Fields that need to be collected during merchant onboarding for the detail page to work fully:

### Already Collected (✅ Working)
- [x] Business name, address, phone number
- [x] Business description
- [x] Logo / profile image
- [x] Location coordinates (latitude/longitude)
- [x] Table setup (tables, time slots, booking settings)
- [x] Menu items (name, description, price, category, image)
- [x] Deal creation (all deal types supported)

### Needs to Be Added to Onboarding (❌ Missing Backend Fields)
- [ ] **Operating hours** (Mon–Sun schedule with open/close times) — **HIGH PRIORITY**
- [ ] **Vibe tags / amenities** (select from predefined list: ENERGIZED, CHILL, UPSCALE, etc.) — **HIGH PRIORITY**
- [ ] **Price range tier** ($, $$, $$$, $$$$) — MEDIUM (menu-based calculation is a good fallback)
- [ ] **Venue photos** (separate from deal images, for the gallery) — MEDIUM
- [ ] **Website URL** — MEDIUM
- [ ] **Social media links** (Instagram, Facebook, Twitter) — LOW
- [ ] **Promo video URL** — LOW
- [ ] **Press/media articles** — LOW (can be added post-onboarding)

---

## Priority Recommendation

### 🔴 High Priority (Required for Complete Detail Page)
1. **Operating Hours (#6)** — Most basic business info; placeholder looks fake without it
2. **Vibe Tags / Amenities (#5)** — Key differentiator for venue discovery
3. **Reviews & Ratings (#1)** — Social proof drives conversions; rating in header is placeholder

### 🟡 Medium Priority (Improves Quality)
4. **Venue Verification (#3)** — Trust signal; straightforward boolean field
5. **Events Tab wiring (A)** — Backend already exists, just needs frontend hook
6. **Media/News (#2)** — Nice-to-have for established venues
7. **Social Media Links (C)** — Simple string fields

### 🟢 Low Priority (Future Features)
8. **Video Support (#10)** — Enhancement for hero gallery
9. **Online Ordering (#11)** — Major feature requiring full cart/checkout
10. **Catering (#7)** — v2 feature
11. **Merchandise (#8)** — v2 feature
12. **Rides (#9)** — Third-party integration
