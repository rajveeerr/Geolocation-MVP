# Yohop — Future Plans & Roadmap

> **Last Updated:** March 2, 2026  
> This document tracks planned features, admin capabilities, and flow improvements.

---

## Admin-Side Configuration (Planned)

### Amenities, Business Types & Vibes — Admin-Managed

Currently, amenities, business types (LOCAL/NATIONAL), and vibe tags are hardcoded in the frontend. In a future phase, these will be **configurable from the admin panel**:

| Config | Description | Admin Capabilities |
|--------|-------------|--------------------|
| **Amenities** | Options shown in merchant onboarding (e.g. WiFi, Parking, Dine-in) | Add, remove, reorder amenities; set labels and icons |
| **Business Types** | Options like Local vs National Chain | Add/remove types; customize labels and descriptions |
| **Vibe Tags** | Options shown in onboarding (e.g. Happy hour vibe, Date night) | Add, remove, reorder vibes; set labels and icons |
| **Vibe Limits** | Max number of vibes a merchant can select | Set/update limit (e.g. 3, 5); reset to default |

**Implementation outline:**
- Backend: `AdminConfig` or similar model for key-value config; or dedicated tables `Amenity`, `BusinessType`, `VibeTag` with admin CRUD.
- API: `GET /api/admin/config/amenities`, `GET /api/admin/config/vibe-tags`, etc. for public/merchant consumption; admin PUT/POST/DELETE.
- Frontend: Onboarding steps fetch options from API instead of hardcoded constants; admin UI for managing them.

---

## Flow Overview (Current vs Planned)

### 1. Merchant Onboarding
- **Status:** Implemented with platform-tailored copy, vibe tags, amenities, price range.
- **Gap vs Figma (from UNSUPPORTED_FEATURES):** Operating hours not collected; some detail-page features use placeholders.
- **Planned:** Operating hours in onboarding; admin-managed vibes/amenities/business types.

### 2. Pending Profile
- **Status:** Basic handling — merchant sees "Application Pending" on dashboard/my-deals; no edit flow.
- **Current UX:** Message: "Your application is under review. Usually 1–2 business days."
- **Planned:** Email notification on approval/rejection; optional "Update application" before approval.

### 3. Store Registration
- **Status:** ✅ Reusable `StoreRegistrationFlow` — used in merchant onboarding (first location) and dashboard "Add Store" (`StoreCreationWizard`). Same steps: Basic info, Location, Business details, Review.
- **Flow:** Onboarding collects first store; dashboard "Add Store" reuses same flow. Admin sees merchant + store(s) in review.
- **Backend:** Extend `POST /api/merchants/register` to accept optional `stores: CreateStoreData[]` and create stores with the merchant. If not supported yet, merchants add stores from dashboard after approval.

### 4. Deal Creation
- **Status:** Multi-step flow for STANDARD, HAPPY_HOUR, RECURRING, REDEEM_NOW, BOUNTY, HIDDEN.
- **Gaps (from DEAL_CREATION_FLOW_ANALYSIS):** Some state fields (bountyRewardAmount, minReferralsRequired, accessCode) need validation.
- **Flow:** Deal type → Basics → Menu → Offer → Images → Schedule → Location (store/city targeting) → Instructions → Advanced → Review.
- **Planned:** Fix missing state; unify Happy Hour flow with main deal creation if desired.

### 5. Menu
- **Status:** Menu CRUD exists; menu items linked to deals.
- **Paths:** `/merchant/menu`, `/merchant/menu/create`, `/merchant/menu/collections`.
- **Planned:** Multiple images per menu item; dietary/allergen tags; search/filter (backend support needed).

### 6. Events
- **Status:** Event creation, management, check-in, and consumer discovery exist.
- **Gaps (from EVENT_SYSTEM_FRONTEND_FLOW):** EventsTab on Deal Detail uses mock data; admin event pages missing; ticket transfer/sharing future scope.
- **Planned:** Wire EventsTab to real API; add admin events section; event merchandise (v2).

### 7. Other Merchant Flows
- **Kickbacks:** Path exists; integration status TBD.
- **Loyalty:** Setup, program, analytics, customers, transactions — paths exist.
- **Analytics:** Dashboard stats, deal performance, customer insights — hooks exist; integration into UI partial.
- **Happy Hour:** Separate editor page; works but uses different context than main deal flow.

---

## Reference Docs

- `UNSUPPORTED_FEATURES.md` — Figma vs backend gaps
- `DEAL_CREATION_FLOW_ANALYSIS.md` — Deal flow issues
- `EVENT_SYSTEM_FRONTEND_FLOW.md` — Event wiring plan
- `MERCHANT_DASHBOARD_IMPLEMENTATION_STATUS.md` — Dashboard API integration
