# Event System — Complete Frontend Implementation Flow

> **Scope**: Wire the entire Events feature end-to-end on the frontend for **Consumer (Client)**, **Merchant (Organizer)**, and **Admin** roles.
> Backend APIs are already built; this plan covers frontend work only.

---

## Table of Contents

1. [Current State Audit](#1-current-state-audit)
2. [Consumer (Client) Flow](#2-consumer-client-flow)
3. [Merchant (Organizer) Flow](#3-merchant-organizer-flow)
4. [Admin Flow](#4-admin-flow)
5. [Shared Components & Services](#5-shared-components--services)
6. [Implementation Phases](#6-implementation-phases)
7. [File-by-File Change Map](#7-file-by-file-change-map)

---

## 1. Current State Audit

### What Already Exists (Frontend)

| Area | Files | Status |
|------|-------|--------|
| **Hooks** | `useEventDetail.ts`, `useMerchantEvents.ts`, `useTickets.ts` | ✅ All hooks call real APIs with mock fallback |
| **Consumer Pages** | `EventDetailPage.tsx`, `DiscoverEventsPage.tsx`, `MyTicketsPage.tsx` | ✅ Pages exist, wired to hooks |
| **Merchant Pages** | `EventCreatePage.tsx`, `EventManagePage.tsx`, `EventCheckInPage.tsx`, `MerchantMyEventsPage.tsx` | ✅ Pages exist, wired to hooks |
| **Components** | `EventCard.tsx`, `CityPickerModal.tsx`, `EventsTab.tsx` | ✅ Functional |
| **Context** | `EventCreationContext.tsx` | ✅ Multi-step wizard state |
| **Routing** | Consumer + Merchant event paths | ✅ Defined in `paths.ts` |

### What's Missing or Broken

| Gap | Impact | Fix Required |
|-----|--------|-------------|
| `useEventDetail` falls back to mock data on any API error | Events show fake data when backend is down or returns 404 | Remove mock fallback; show proper error/empty state |
| `EventsTab` on Deal Detail still uses hardcoded `MOCK_EVENTS` | Deal detail events tab never shows real data | Wire to `useBrowseEvents` with `merchantId` filter |
| No admin event pages at all | Admins have zero visibility into events | Build `AdminEventsPage`, `AdminEventDetailPage` |
| No admin event backend routes | No admin oversight endpoints | Build backend admin event routes (separate task) |
| No admin event sidebar link | Admins can't navigate to events | Add to `AdminLayout` sidebar |
| No admin event path constants | No routing for admin events | Add `ADMIN_EVENTS` paths to `paths.ts` |
| Ticketmaster hybrid cards don't deep-link properly | External events open in new tab but UX is jarring | Add proper external link indicator + confirmation |
| No event analytics for merchants | Merchants can't see ticket sales, revenue, attendance | Wire `EventManagePage` analytics section |
| No ticket transfer or sharing | Users can't share/transfer purchased tickets | Future scope |
| No event search on homepage | Homepage doesn't surface events | Add events section to `HomePage` |

---

## 2. Consumer (Client) Flow

### 2.1 Discover Events Page (`/discover/events`)

**Current**: Working with 5 tabs — All, Discover, Ticketmaster, Venues, Artists.

**Fixes Needed**:

```
┌──────────────────────────────────────────────┐
│  DISCOVER EVENTS PAGE                        │
│                                              │
│  ┌─ City Picker ──────────────────────────┐  │
│  │ 📍 Mumbai  ▾                           │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  ┌─ Search Bar ───────────────────────────┐  │
│  │ 🔍 Search events, artists, venues...   │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  [All] [Discover] [Ticketmaster] [Venues]    │
│  [Artists]                                   │
│                                              │
│  ┌─ Filters Row ──────────────────────────┐  │
│  │ Event Type ▾  Date Range ▾  Price ▾    │  │
│  │ Sort: Relevance ▾                      │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐        │
│  │ Event   │ │ Event   │ │ Event   │        │
│  │ Card    │ │ Card    │ │ Card    │        │
│  │         │ │         │ │ (TM)    │        │
│  └─────────┘ └─────────┘ └─────────┘        │
│                                              │
│  [ Load More ]                               │
└──────────────────────────────────────────────┘
```

**Changes**:
- [ ] Fix: When API returns empty array, show "No events found" instead of falling back to mock data
- [ ] Add: Loading skeleton cards while fetching
- [ ] Add: Error state with retry button
- [ ] Add: "Near You" section at top using GPS coordinates
- [ ] Fix: Pagination — implement proper cursor-based or offset pagination
- [ ] Add: Pull-to-refresh on mobile

**Data Flow**:
```
DiscoverEventsPage
  ├── useBrowseEvents({ city, type, search, sort, page })
  │     └── GET /api/events?city=...&type=...
  ├── useDiscoverEvents({ lat, lng, radius, includeTicketmaster })
  │     └── GET /api/events/discover?lat=...&lng=...
  ├── useTicketmasterSearch({ keyword, city })
  │     └── GET /api/events/ticketmaster/search?keyword=...
  ├── useTicketmasterVenues({ keyword })
  │     └── GET /api/events/ticketmaster/venues/search?keyword=...
  └── useTicketmasterAttractions({ keyword })
        └── GET /api/events/ticketmaster/attractions/search?keyword=...
```

---

### 2.2 Event Detail Page (`/events/:eventId`)

**Current**: 1419-line page with ticket purchasing, gallery, perks. Uses `useEventDetail` with mock fallback.

**Fixes Needed**:

```
┌───────────────────────────────────────────────────┐
│  EVENT DETAIL PAGE                                │
│                                                   │
│  ┌─ Hero Banner ─────────────────────────────┐    │
│  │  🎵 Neon Nights Music Festival            │    │
│  │  📅 March 15, 2026 • 8:00 PM             │    │
│  │  📍 Phoenix Arena, Mumbai                 │    │
│  │  🏷️ Music • Festival • EDM               │    │
│  └───────────────────────────────────────────┘    │
│                                                   │
│  ┌─ Quick Stats ─────────────────────────────┐    │
│  │  🎟️ 450/500 tickets left                  │    │
│  │  ⭐ 4.8 rating (if available)             │    │
│  │  👥 50 attending                          │    │
│  └───────────────────────────────────────────┘    │
│                                                   │
│  ┌─ Tabs ────────────────────────────────────┐    │
│  │ [About] [Tickets] [Gallery] [Location]    │    │
│  └───────────────────────────────────────────┘    │
│                                                   │
│  ┌─ About ───────────────────────────────────┐    │
│  │  Description text...                      │    │
│  │  Organizer: DJ Max • 50 events hosted     │    │
│  │  Perks: 🍸 Food 🎶 Live Music 🅿️ Parking │    │
│  └───────────────────────────────────────────┘    │
│                                                   │
│  ┌─ Ticket Tiers ────────────────────────────┐    │
│  │  ┌──────────────────────────────────┐     │    │
│  │  │ 🥉 General Admission    ₹500    │     │    │
│  │  │    Floor access, 1 drink        │     │    │
│  │  │    [  -  ]  2  [  +  ]  [ADD]   │     │    │
│  │  └──────────────────────────────────┘     │    │
│  │  ┌──────────────────────────────────┐     │    │
│  │  │ 🥈 VIP                  ₹1500   │     │    │
│  │  │    VIP lounge, 3 drinks, merch  │     │    │
│  │  │    [  -  ]  1  [  +  ]  [ADD]   │     │    │
│  │  └──────────────────────────────────┘     │    │
│  │  ┌──────────────────────────────────┐     │    │
│  │  │ 🥇 Backstage Pass       ₹5000   │     │    │
│  │  │    Meet & greet, all-access     │     │    │
│  │  │    SOLD OUT                     │     │    │
│  │  └──────────────────────────────────┘     │    │
│  │                                           │    │
│  │  ┌─ Add-Ons ──────────────────────┐       │    │
│  │  │  ☐ Parking Pass       ₹200    │       │    │
│  │  │  ☐ Merch Bundle       ₹800    │       │    │
│  │  │  ☐ Photo Package      ₹500    │       │    │
│  │  └────────────────────────────────┘       │    │
│  │                                           │    │
│  │  ┌─ Order Summary ────────────────┐       │    │
│  │  │  2x General     ₹1000         │       │    │
│  │  │  1x VIP         ₹1500         │       │    │
│  │  │  1x Parking     ₹200          │       │    │
│  │  │  ──────────────────────        │       │    │
│  │  │  Subtotal       ₹2700         │       │    │
│  │  │  Tax (18%)      ₹486          │       │    │
│  │  │  Total          ₹3186         │       │    │
│  │  │                                │       │    │
│  │  │  [ 🎟️ Purchase Tickets ]       │       │    │
│  │  └────────────────────────────────┘       │    │
│  └───────────────────────────────────────────┘    │
│                                                   │
│  Waitlist (if sold out):                          │
│  [ 🔔 Join Waitlist ]                             │
│                                                   │
│  ┌─ Related Events ──────────────────────────┐    │
│  │  EventCard  EventCard  EventCard          │    │
│  └───────────────────────────────────────────┘    │
└───────────────────────────────────────────────────┘
```

**Changes**:
- [ ] Remove mock data fallback — show error state with "Event not found" message
- [ ] Fix: Add-ons selection UI (currently not wired to purchase flow)
- [ ] Add: Add-ons total in order summary
- [ ] Add: Share event button (native share API / copy link)
- [ ] Add: "Add to Calendar" button (Google/Apple/Outlook .ics)
- [ ] Add: Ticket purchase success modal with confetti animation
- [ ] Fix: After purchase, update ticket availability count in real-time
- [ ] Add: Login prompt if unauthenticated user tries to purchase

**Data Flow**:
```
EventDetailPage
  ├── useEventDetail(eventId)
  │     └── GET /api/events/:eventId
  │           Returns: event details + ticket tiers + add-ons + organizer
  ├── usePurchaseTickets(eventId)
  │     └── POST /api/events/:eventId/tickets/purchase
  │           Body: { tierId, quantity, addOnIds }
  │           Returns: { tickets[], totalAmount }
  └── useJoinWaitlist(eventId)
        └── POST /api/events/:eventId/waitlist/join
              Returns: { position, estimatedWait }
```

---

### 2.3 My Tickets Page (`/my-tickets`)

**Current**: Working with filter tabs, QR viewer, refund flow.

**Fixes Needed**:

```
┌──────────────────────────────────────────────┐
│  MY TICKETS                                  │
│                                              │
│  [All] [Upcoming] [Past] [Cancelled]         │
│                                              │
│  ┌─ Ticket Card ─────────────────────────┐   │
│  │  🎵 Neon Nights Music Festival        │   │
│  │  📅 March 15, 2026                    │   │
│  │  🎟️ VIP × 1                           │   │
│  │  Status: ✅ Confirmed                 │   │
│  │                                       │   │
│  │  [ 📱 View QR ]  [ ↩️ Refund ]         │   │
│  └───────────────────────────────────────┘   │
│                                              │
│  ┌─ QR Modal ────────────────────────────┐   │
│  │        ┌───────────┐                  │   │
│  │        │  QR CODE  │                  │   │
│  │        │           │                  │   │
│  │        └───────────┘                  │   │
│  │  Ticket ID: TKT-ABC123               │   │
│  │  Name: Rajveer                        │   │
│  │  Tier: VIP                            │   │
│  │  [ Download QR ] [ Share ]            │   │
│  └───────────────────────────────────────┘   │
│                                              │
│  ┌─ Refund Confirmation Modal ───────────┐   │
│  │  Are you sure you want to refund?     │   │
│  │  Refund policy: Full refund up to     │   │
│  │  24hrs before event                   │   │
│  │  [ Cancel ]  [ Confirm Refund ]       │   │
│  └───────────────────────────────────────┘   │
└──────────────────────────────────────────────┘
```

**Changes**:
- [ ] Add: Download QR code as image
- [ ] Add: Ticket countdown timer ("Event starts in 3 days 5 hours")
- [ ] Add: Post-event feedback prompt for past tickets
- [ ] Fix: Empty state illustrations for each tab
- [ ] Add: Ticket transfer button (future — backend needed)

**Data Flow**:
```
MyTicketsPage
  ├── useMyTickets({ status, page })
  │     └── GET /api/events/my-tickets?status=...
  ├── useTicketQR(ticketId)
  │     └── GET /api/events/tickets/:ticketId/qr
  └── useRefundTicket()
        └── POST /api/events/tickets/:ticketId/refund
```

---

### 2.4 Homepage Events Section (NEW)

**Currently**: Homepage has no events section.

```
┌──────────────────────────────────────────────┐
│  HOMEPAGE — New "Events Near You" Section    │
│                                              │
│  🎉 Events Near You                         │
│  ──────────────────────────────              │
│                                              │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐        │
│  │ Event   │ │ Event   │ │ Event   │        │
│  │ Card    │ │ Card    │ │ Card    │        │
│  │ (Mini)  │ │ (Mini)  │ │ (Mini)  │        │
│  └─────────┘ └─────────┘ └─────────┘        │
│                                              │
│  [ See All Events → ]                        │
└──────────────────────────────────────────────┘
```

**New Components**:
- `HomeEventsSection.tsx` — horizontal scroll of top 6 events
- Uses `useBrowseEvents({ city, limit: 6, sort: 'date' })`

---

### 2.5 Events Tab on Deal Detail (FIX)

**Current**: `EventsTab.tsx` uses `MOCK_EVENTS` array.

**Fix**: Wire to `useBrowseEvents({ merchantId })` to show events by the same merchant/venue.

```
EventsTab (on DealDetailPage)
  └── useBrowseEvents({ merchantId: deal.merchantId })
        └── GET /api/events?merchantId=...
        Falls back to empty state: "No upcoming events at this venue"
```

---

## 3. Merchant (Organizer) Flow

### 3.1 My Events Page (`/merchant/events`)

**Current**: Working — lists organizer's events with status badges.

```
┌──────────────────────────────────────────────┐
│  MY EVENTS                                   │
│                                              │
│  [ + Create Event ]                          │
│                                              │
│  [All] [Draft] [Published] [Completed]       │
│  [Cancelled]                                 │
│                                              │
│  ┌─ Event Row ───────────────────────────┐   │
│  │  🎵 Neon Nights          PUBLISHED    │   │
│  │  Mar 15 • 450/500 sold • ₹2.5L rev   │   │
│  │  [ Manage ] [ Check-In ] [ ⋮ ]       │   │
│  └───────────────────────────────────────┘   │
│                                              │
│  ┌─ Event Row ───────────────────────────┐   │
│  │  🧘 Community Yoga       DRAFT        │   │
│  │  Apr 2 • 0 sold • ₹0 rev             │   │
│  │  [ Edit ] [ Publish ] [ ⋮ ]          │   │
│  └───────────────────────────────────────┘   │
└──────────────────────────────────────────────┘
```

**Changes**:
- [ ] Add: Revenue summary cards at top (Total Revenue, Total Tickets Sold, Total Events)
- [ ] Add: Quick stats per event row (tickets sold, revenue, attendance rate)
- [ ] Add: Duplicate event action in context menu
- [ ] Add: Export attendee list (CSV) action

**Data Flow**:
```
MerchantMyEventsPage
  └── useMyEvents(statusFilter)
        └── GET /api/events/my-events?status=...
```

---

### 3.2 Create Event Page (`/merchant/events/create`)

**Current**: Multi-step wizard using `EventCreationContext`.

```
Step 1: BASICS                    Step 2: DATE & LOCATION
┌──────────────────────────┐     ┌──────────────────────────┐
│ Event Title *            │     │ Start Date *    End Date  │
│ [________________________]│     │ [________]     [________] │
│                          │     │                          │
│ Event Type *             │     │ Timezone                 │
│ [Music      ▾]           │     │ [Asia/Kolkata ▾]         │
│                          │     │                          │
│ Description *            │     │ Venue Name *             │
│ [________________________]│     │ [________________________]│
│ [________________________]│     │                          │
│                          │     │ Address *                │
│ Tags                     │     │ [________________________]│
│ [rock] [edm] [+Add]     │     │                          │
│                          │     │ 📍 Pick on Map           │
│ [ Next → ]               │     │ ┌────────────────────┐   │
└──────────────────────────┘     │ │    Map Preview      │   │
                                 │ └────────────────────┘   │
                                 │ [ ← Back ] [ Next → ]    │
                                 └──────────────────────────┘

Step 3: CAPACITY & SETTINGS       Step 4: MEDIA
┌──────────────────────────┐     ┌──────────────────────────┐
│ Max Attendees *          │     │ Cover Image *            │
│ [500___]                 │     │ ┌────────────────────┐   │
│                          │     │ │  Drop image here   │   │
│ ☑ Enable Waitlist        │     │ └────────────────────┘   │
│                          │     │                          │
│ Age Restriction          │     │ Gallery (up to 10)       │
│ [18+    ▾]               │     │ ┌──┐ ┌──┐ ┌──┐ [+]     │
│                          │     │ └──┘ └──┘ └──┘          │
│ Privacy                  │     │                          │
│ ○ Public ● Private       │     │ Video URL (optional)     │
│                          │     │ [________________________]│
│ [ ← Back ] [ Next → ]    │     │ [ ← Back ] [ Next → ]    │
└──────────────────────────┘     └──────────────────────────┘

Step 5: TICKET TIERS
┌──────────────────────────────────────────────┐
│ Ticket Tiers                                 │
│                                              │
│ ┌─ Tier 1 ───────────────────────────────┐   │
│ │ Name: [General Admission____]          │   │
│ │ Price: [₹500__]  Quantity: [200__]     │   │
│ │ Description: [Floor access, 1 drink__] │   │
│ │ [ Remove ]                             │   │
│ └────────────────────────────────────────┘   │
│                                              │
│ ┌─ Tier 2 ───────────────────────────────┐   │
│ │ Name: [VIP_________________]           │   │
│ │ Price: [₹1500_]  Quantity: [100__]     │   │
│ │ Description: [VIP lounge, 3 drinks___] │   │
│ │ [ Remove ]                             │   │
│ └────────────────────────────────────────┘   │
│                                              │
│ [ + Add Ticket Tier ]                        │
│                                              │
│ ┌─ Add-Ons (Optional) ──────────────────┐    │
│ │ ┌──────────────────────────────────┐   │    │
│ │ │ Name: [Parking Pass___]          │   │    │
│ │ │ Price: [₹200__] Qty: [50___]     │   │    │
│ │ └──────────────────────────────────┘   │    │
│ │ [ + Add Add-On ]                       │    │
│ └────────────────────────────────────────┘    │
│                                              │
│ [ ← Back ] [ Save as Draft ] [ Publish ]     │
└──────────────────────────────────────────────┘
```

**Changes**:
- [ ] Add: Image upload integration (Cloudinary or local uploads endpoint)
- [ ] Add: Map picker with geocoding for venue selection
- [ ] Add: Preview step before publishing
- [ ] Add: Form validation with error messages per field
- [ ] Add: Auto-save draft every 30 seconds
- [ ] Fix: Add-ons creation inline in step 5 (currently only via separate API after event creation)
- [ ] Add: "Import from Ticketmaster" — search TM event and pre-fill fields

**Data Flow**:
```
EventCreatePage (Step 1-4 → local state via EventCreationContext)
  │
  Step 5 → Submit:
  ├── useCreateEvent()
  │     └── POST /api/events
  │           Body: { title, description, type, dates, venue, capacity, media }
  │           Returns: { event: { id, ... } }
  │
  ├── useCreateTicketTier(eventId)  ← for each tier
  │     └── POST /api/events/:eventId/ticket-tiers
  │           Body: { name, price, quantity, description }
  │
  ├── useCreateAddOn(eventId)  ← for each add-on
  │     └── POST /api/events/:eventId/add-ons
  │           Body: { name, price, maxQuantity }
  │
  └── usePublishEvent(eventId)  ← if "Publish" clicked
        └── POST /api/events/:eventId/publish
```

---

### 3.3 Manage Event Page (`/merchant/events/:eventId`)

**Current**: Page exists for editing event details.

```
┌──────────────────────────────────────────────────┐
│  MANAGE EVENT — Neon Nights Music Festival       │
│                                                  │
│  Status: PUBLISHED   [ Unpublish ] [ Delete ]    │
│                                                  │
│  ┌─ Tabs ────────────────────────────────────┐   │
│  │ [Details] [Tickets] [Add-Ons] [Attendees] │   │
│  │ [Analytics] [Check-In]                    │   │
│  └───────────────────────────────────────────┘   │
│                                                  │
│  ── Details Tab ──────────────────────────────   │
│  (Same form as create, pre-filled)               │
│  [ Save Changes ]                                │
│                                                  │
│  ── Tickets Tab ──────────────────────────────   │
│  ┌── Tier: General ─────────────────────────┐    │
│  │  Price: ₹500  |  Sold: 180/200           │    │
│  │  Revenue: ₹90,000                        │    │
│  │  [ Edit ] [ Disable ]                    │    │
│  └──────────────────────────────────────────┘    │
│  [ + Add New Tier ]                              │
│                                                  │
│  ── Add-Ons Tab ──────────────────────────────   │
│  ┌── Parking Pass ──────────────────────────┐    │
│  │  Price: ₹200  |  Sold: 30/50            │    │
│  │  [ Edit ] [ Remove ]                    │    │
│  └──────────────────────────────────────────┘    │
│  [ + Add New Add-On ]                            │
│                                                  │
│  ── Attendees Tab ────────────────────────────   │
│  🔍 Search attendees...                          │
│  ┌──────────────────────────────────────────┐    │
│  │ Name       │ Tier    │ Status │ Actions  │    │
│  │ Rajveer    │ VIP     │ ✅     │ [Refund] │    │
│  │ Priya      │ General │ ⏳     │ [Refund] │    │
│  └──────────────────────────────────────────┘    │
│  [ Export CSV ]                                  │
│                                                  │
│  ── Analytics Tab ────────────────────────────   │
│  ┌──────────────────────────────────────────┐    │
│  │  Total Revenue: ₹2,50,000               │    │
│  │  Tickets Sold: 450/500 (90%)            │    │
│  │  Check-In Rate: 380/450 (84%)           │    │
│  │  Waitlist: 25 people                    │    │
│  │                                          │    │
│  │  Revenue by Tier:                       │    │
│  │  ██████████████░░ General  ₹90K (36%)   │    │
│  │  ████████████████ VIP      ₹1.5L (60%)  │    │
│  │  ██░░░░░░░░░░░░░░ Backstage ₹10K (4%)  │    │
│  │                                          │    │
│  │  Sales Timeline (line chart)            │    │
│  └──────────────────────────────────────────┘    │
└──────────────────────────────────────────────────┘
```

**Changes**:
- [ ] Add: Attendees tab with search, filter, and export
- [ ] Add: Analytics tab with revenue breakdown, sales timeline chart
- [ ] Add: Real-time ticket count updates
- [ ] Add: Send notification to all attendees (email blast)
- [ ] Add: Waitlist management — view and manually admit from waitlist
- [ ] Fix: Delete event with confirmation dialog and refund warning

**Data Flow**:
```
EventManagePage
  ├── useEventForManage(eventId)
  │     └── GET /api/events/:eventId (includes tiers, add-ons, attendees)
  ├── useUpdateEvent(eventId)
  │     └── PUT /api/events/:eventId
  ├── useDeleteEvent()
  │     └── DELETE /api/events/:eventId
  ├── usePublishEvent(eventId)
  │     └── POST /api/events/:eventId/publish
  ├── useCreateTicketTier(eventId)
  │     └── POST /api/events/:eventId/ticket-tiers
  ├── useUpdateTicketTier(eventId)
  │     └── PUT /api/events/:eventId/ticket-tiers/:tierId
  ├── useDeleteTicketTier(eventId)
  │     └── DELETE /api/events/:eventId/ticket-tiers/:tierId
  ├── useCreateAddOn(eventId)
  │     └── POST /api/events/:eventId/add-ons
  └── useUpdateAddOn(eventId)
        └── PUT /api/events/:eventId/add-ons/:addOnId
```

---

### 3.4 Event Check-In Page (`/merchant/events/:eventId/checkin`)

**Current**: QR-based check-in page exists.

```
┌──────────────────────────────────────────────┐
│  EVENT CHECK-IN — Neon Nights                │
│                                              │
│  ┌─ Stats Bar ───────────────────────────┐   │
│  │  Checked In: 280/450  │  Pending: 170 │   │
│  └───────────────────────────────────────┘   │
│                                              │
│  ┌─ QR Scanner ──────────────────────────┐   │
│  │                                       │   │
│  │         📷 Camera Preview             │   │
│  │         (QR Scanner Active)           │   │
│  │                                       │   │
│  └───────────────────────────────────────┘   │
│                                              │
│  ── OR ──                                    │
│                                              │
│  Manual Check-In:                            │
│  Ticket ID: [______________] [ Check In ]    │
│                                              │
│  ┌─ Recent Check-Ins ───────────────────┐    │
│  │  ✅ Rajveer — VIP — 2:30 PM         │    │
│  │  ✅ Priya — General — 2:28 PM       │    │
│  │  ❌ Invalid ticket — 2:25 PM         │    │
│  └──────────────────────────────────────┘    │
└──────────────────────────────────────────────┘
```

**Changes**:
- [ ] Add: Camera-based QR scanner using `html5-qrcode` or `react-qr-reader`
- [ ] Add: Success/failure sound effects on scan
- [ ] Add: Vibration feedback on mobile
- [ ] Add: Batch check-in mode (scan multiple without closing scanner)
- [ ] Add: Check-in stats auto-refresh every 10 seconds

**Data Flow**:
```
EventCheckInPage
  ├── useEventForManage(eventId)
  │     └── GET /api/events/:eventId (get attendee list + check-in counts)
  └── useCheckIn(eventId)
        └── POST /api/events/:eventId/checkin
              Body: { ticketId } or { qrCode }
              Returns: { success, attendee, message }
```

---

## 4. Admin Flow

### 4.1 Admin Events Dashboard (NEW — `/admin/events`)

**Status**: Does not exist. Must be built from scratch.

**Backend Required**: Admin event endpoints don't exist yet. For now, we can build the UI and use the public `GET /api/events` endpoint (which returns all published events). Full admin CRUD will need backend work.

```
┌──────────────────────────────────────────────────┐
│  ADMIN — EVENT MANAGEMENT                        │
│                                                  │
│  ┌─ Summary Cards ───────────────────────────┐   │
│  │ Total Events │ Active │ Tickets Sold│ Rev  │   │
│  │    156       │   42   │   12,500    │ ₹45L │   │
│  └───────────────────────────────────────────┘   │
│                                                  │
│  🔍 Search events...                             │
│                                                  │
│  ┌─ Filters ─────────────────────────────────┐   │
│  │ Status: [All ▾]  Type: [All ▾]            │   │
│  │ City: [All ▾]    Date: [Any ▾]            │   │
│  │ Organizer: [Search... ▾]                  │   │
│  └───────────────────────────────────────────┘   │
│                                                  │
│  ┌─ Events Table ────────────────────────────┐   │
│  │ Event        │ Organizer│ City │ Date     │   │
│  │ Type│Status │ Tickets  │ Revenue│Actions  │   │
│  ├──────────────┼──────────┼──────┼──────────┤   │
│  │ Neon Nights  │ DJ Max   │ MUM  │ Mar 15   │   │
│  │ Music│Active │ 450/500  │₹2.5L │[View][⋮]│   │
│  ├──────────────┼──────────┼──────┼──────────┤   │
│  │ Sunset Jazz  │ Jazz Co  │ DEL  │ Mar 20   │   │
│  │ Music│Draft  │ 0/200    │ ₹0   │[View][⋮]│   │
│  └──────────────────────────────────────────┘    │
│                                                  │
│  Context Menu (⋮):                               │
│  • View Details                                  │
│  • Feature Event (pin to discover page)          │
│  • Suspend Event (hide from public)              │
│  • Contact Organizer                             │
│  • View Organizer Profile                        │
│  • Export Attendees                               │
└──────────────────────────────────────────────────┘
```

**Components to Build**:
- `AdminEventsPage.tsx` — Main dashboard with table, filters, summary cards
- `AdminEventDetailPage.tsx` — Read-only detail view with admin actions

---

### 4.2 Admin Event Detail (NEW — `/admin/events/:eventId`)

```
┌──────────────────────────────────────────────────┐
│  ADMIN — EVENT DETAIL                            │
│  ← Back to Events                                │
│                                                  │
│  ┌─ Event Header ────────────────────────────┐   │
│  │  🎵 Neon Nights Music Festival            │   │
│  │  Organizer: DJ Max (Merchant ID: M-123)   │   │
│  │  Status: PUBLISHED  │  Created: Feb 10    │   │
│  │                                           │   │
│  │  [ Feature ⭐ ] [ Suspend 🚫 ] [ Delete ]│   │
│  └───────────────────────────────────────────┘   │
│                                                  │
│  ┌─ Tabs ────────────────────────────────────┐   │
│  │ [Overview] [Tickets] [Attendees]          │   │
│  │ [Analytics] [Reports] [Audit Log]         │   │
│  └───────────────────────────────────────────┘   │
│                                                  │
│  ── Overview Tab ─────────────────────────────   │
│  Description, dates, location, media preview     │
│  Tags, age restriction, capacity, waitlist info  │
│                                                  │
│  ── Tickets Tab ──────────────────────────────   │
│  All ticket tiers with sales data (read-only)    │
│  Add-ons with purchase data (read-only)          │
│                                                  │
│  ── Attendees Tab ────────────────────────────   │
│  Full attendee list with search, export          │
│  Check-in status per attendee                    │
│  Refund history                                  │
│                                                  │
│  ── Analytics Tab ────────────────────────────   │
│  Revenue chart, ticket sales over time           │
│  Demographic breakdown (if available)            │
│  Comparison with similar events                  │
│                                                  │
│  ── Reports Tab ──────────────────────────────   │
│  User reports/complaints about this event        │
│  Flag history                                    │
│                                                  │
│  ── Audit Log Tab ────────────────────────────   │
│  All admin actions taken on this event           │
│  Status change history                           │
└──────────────────────────────────────────────────┘
```

---

### 4.3 Admin Sidebar Update

Add "Events" to the admin sidebar navigation between "Customer Management" and "Nudges":

```
Admin Sidebar:
  📊 City Management
  📈 Performance Analytics
  🏪 Merchant Management
  🌆 City Analytics
  👥 Customer Management
  🎉 Events              ← NEW
  📣 Nudges
  📋 Master Data
```

---

### 4.4 Admin Event Analytics (NEW — embedded in Admin Dashboard)

Add an "Events" card to the main admin analytics dashboard:

```
┌─ Events Overview (Admin Dashboard Card) ────┐
│  This Month:                                 │
│  📅 12 new events  |  🎟️ 3,200 tickets sold │
│  💰 ₹15.2L revenue |  📊 78% attendance     │
│                                              │
│  Top Events:                                 │
│  1. Neon Nights — 450 tickets — ₹2.5L       │
│  2. Jazz Festival — 300 tickets — ₹1.8L     │
│  3. Food Crawl — 200 tickets — ₹80K         │
│                                              │
│  [ View All Events → ]                       │
└──────────────────────────────────────────────┘
```

---

## 5. Shared Components & Services

### 5.1 New Shared Components

| Component | Location | Used By |
|-----------|----------|---------|
| `EventCardMini.tsx` | `components/events/` | HomePage events section, related events |
| `TicketTierCard.tsx` | `components/events/` | EventDetailPage, EventManagePage |
| `AddOnSelector.tsx` | `components/events/` | EventDetailPage purchase flow |
| `EventStatusBadge.tsx` | `components/events/` | All event listings |
| `AttendeeTable.tsx` | `components/events/` | EventManagePage, AdminEventDetail |
| `EventAnalyticsCharts.tsx` | `components/events/` | EventManagePage, AdminEventDetail |
| `QRScannerModal.tsx` | `components/events/` | EventCheckInPage |
| `EventFilters.tsx` | `components/events/` | DiscoverEventsPage, AdminEventsPage |
| `TicketQRViewer.tsx` | `components/events/` | MyTicketsPage |

### 5.2 New Hooks

| Hook | Purpose |
|------|---------|
| `useAdminEvents.ts` | Admin: list all events, feature/suspend actions |
| `useEventAnalytics.ts` | Merchant + Admin: event analytics data |

### 5.3 New Types

```typescript
// types/event.types.ts — centralized event type definitions
export interface EventSummaryStats {
  totalEvents: number;
  activeEvents: number;
  totalTicketsSold: number;
  totalRevenue: number;
  averageAttendanceRate: number;
}

export interface AdminEventAction {
  type: 'feature' | 'suspend' | 'unsuspend' | 'delete';
  eventId: string;
  reason?: string;
}

export interface EventAnalytics {
  ticketSalesByDay: { date: string; count: number; revenue: number }[];
  revenueByTier: { tierName: string; revenue: number; count: number }[];
  checkInTimeline: { time: string; count: number }[];
  waitlistSize: number;
  refundCount: number;
  refundAmount: number;
}
```

---

## 6. Implementation Phases

### Phase 1: Fix Existing Consumer Pages (Priority: HIGH)
**Estimated effort: 2-3 days**

| # | Task | Files |
|---|------|-------|
| 1.1 | Remove mock data fallback from `useEventDetail` — show proper error/empty states | `useEventDetail.ts` |
| 1.2 | Wire `EventsTab` on Deal Detail to real API | `EventsTab.tsx` |
| 1.3 | Fix pagination in `DiscoverEventsPage` | `DiscoverEventsPage.tsx` |
| 1.4 | Add loading skeletons and error states | `EventDetailPage.tsx`, `DiscoverEventsPage.tsx` |
| 1.5 | Fix ticket purchase flow — add add-ons to order | `EventDetailPage.tsx` |
| 1.6 | Add share + calendar buttons to event detail | `EventDetailPage.tsx` |

### Phase 2: Enhance Merchant Pages (Priority: HIGH)
**Estimated effort: 3-4 days**

| # | Task | Files |
|---|------|-------|
| 2.1 | Add revenue/stats cards to My Events page | `MerchantMyEventsPage.tsx` |
| 2.2 | Build Attendees tab in Event Manage page | `EventManagePage.tsx`, `AttendeeTable.tsx` |
| 2.3 | Build Analytics tab in Event Manage page | `EventManagePage.tsx`, `EventAnalyticsCharts.tsx` |
| 2.4 | Add image upload to event creation | `EventCreatePage.tsx` |
| 2.5 | Implement QR scanner for check-in | `EventCheckInPage.tsx`, `QRScannerModal.tsx` |
| 2.6 | Add form validation to event creation wizard | `EventCreatePage.tsx` |
| 2.7 | Add preview step before publishing | `EventCreatePage.tsx` |

### Phase 3: Build Admin Event System (Priority: MEDIUM)
**Estimated effort: 4-5 days**

| # | Task | Files |
|---|------|-------|
| 3.1 | Add `ADMIN_EVENTS` paths to routing | `paths.ts` |
| 3.2 | Build `AdminEventsPage` with table + filters | `pages/admin/AdminEventsPage.tsx` |
| 3.3 | Build `AdminEventDetailPage` with tabs | `pages/admin/AdminEventDetailPage.tsx` |
| 3.4 | Add Events link to admin sidebar | `AdminLayout.tsx` |
| 3.5 | Add event routes to `App.tsx` | `App.tsx` |
| 3.6 | Build `useAdminEvents` hook | `hooks/useAdminEvents.ts` |
| 3.7 | Add Events overview card to admin dashboard | `AdminDashboardPage.tsx` |

### Phase 4: Homepage Integration & Polish (Priority: MEDIUM)
**Estimated effort: 1-2 days**

| # | Task | Files |
|---|------|-------|
| 4.1 | Build `HomeEventsSection` component | `components/events/HomeEventsSection.tsx` |
| 4.2 | Add events section to `HomePage` | `HomePage.tsx` |
| 4.3 | Add "Add to Calendar" functionality | `utils/calendar.ts`, `EventDetailPage.tsx` |
| 4.4 | Add ticket download/share | `MyTicketsPage.tsx` |
| 4.5 | Polish animations and transitions | Various |

### Phase 5: Backend Admin Routes (Priority: LOW — separate task)
**Estimated effort: 2-3 days (backend work)**

| # | Task | Endpoint |
|---|------|----------|
| 5.1 | Admin list all events with filters | `GET /api/admin/events` |
| 5.2 | Admin view event detail | `GET /api/admin/events/:id` |
| 5.3 | Admin feature/unfeature event | `POST /api/admin/events/:id/feature` |
| 5.4 | Admin suspend/unsuspend event | `POST /api/admin/events/:id/suspend` |
| 5.5 | Admin delete event | `DELETE /api/admin/events/:id` |
| 5.6 | Admin event analytics | `GET /api/admin/events/analytics` |
| 5.7 | Admin export attendees | `GET /api/admin/events/:id/attendees/export` |

---

## 7. File-by-File Change Map

### Files to MODIFY

| File | Changes |
|------|---------|
| `web/src/hooks/useEventDetail.ts` | Remove mock fallback, add proper error handling |
| `web/src/components/deals/detail-tabs/EventsTab.tsx` | Wire to `useBrowseEvents` with merchantId |
| `web/src/pages/EventDetailPage.tsx` | Add add-ons to purchase, share/calendar buttons, fix error states |
| `web/src/pages/DiscoverEventsPage.tsx` | Fix pagination, add loading skeletons |
| `web/src/pages/MyTicketsPage.tsx` | Add QR download, countdown timer, empty states |
| `web/src/pages/merchant/MerchantMyEventsPage.tsx` | Add summary stats, duplicate action |
| `web/src/pages/merchant/EventManagePage.tsx` | Add Attendees + Analytics tabs |
| `web/src/pages/merchant/EventCreatePage.tsx` | Image upload, validation, preview step |
| `web/src/pages/merchant/EventCheckInPage.tsx` | QR scanner integration |
| `web/src/pages/HomePage.tsx` | Add events section |
| `web/src/routing/paths.ts` | Add `ADMIN_EVENTS`, `ADMIN_EVENT_DETAIL` |
| `web/src/App.tsx` | Add admin event routes |
| `web/src/components/layout/AdminLayout.tsx` | Add Events sidebar link |

### Files to CREATE

| File | Purpose |
|------|---------|
| `web/src/pages/admin/AdminEventsPage.tsx` | Admin events dashboard |
| `web/src/pages/admin/AdminEventDetailPage.tsx` | Admin event detail view |
| `web/src/hooks/useAdminEvents.ts` | Admin event hooks |
| `web/src/components/events/EventCardMini.tsx` | Compact event card for homepage |
| `web/src/components/events/AttendeeTable.tsx` | Shared attendee table |
| `web/src/components/events/EventAnalyticsCharts.tsx` | Analytics charts |
| `web/src/components/events/EventStatusBadge.tsx` | Status badge component |
| `web/src/components/events/QRScannerModal.tsx` | QR scanner component |
| `web/src/components/events/EventFilters.tsx` | Shared filter bar |
| `web/src/components/events/TicketTierCard.tsx` | Ticket tier display card |
| `web/src/components/events/AddOnSelector.tsx` | Add-on selection component |
| `web/src/components/events/HomeEventsSection.tsx` | Homepage events section |
| `web/src/types/event.types.ts` | Centralized event types |
| `web/src/utils/calendar.ts` | Add-to-calendar helpers |

---

## Quick Start

To begin implementation, start with **Phase 1.1** — removing mock data from `useEventDetail.ts`:

```bash
# 1. Start the backend
cd backend && npm run dev

# 2. Start the frontend
cd web && npm run dev

# 3. Verify API connectivity
curl https://api.yohop.com/api/events
```

Then proceed through phases sequentially. Each phase builds on the previous one.
