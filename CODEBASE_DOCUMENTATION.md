# YOHOP Platform - Complete Codebase Documentation

> **Last Updated:** April 16, 2026
> **Platform:** YOHOP - A geolocation-based rewards and gamification platform
> **Purpose:** This document provides a comprehensive overview of the entire YOHOP codebase for onboarding teams, code reviewers, and cross-team collaboration.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Database Schema & Models](#4-database-schema--models)
5. [Authentication & Authorization](#5-authentication--authorization)
6. [API Reference (All Endpoints)](#6-api-reference-all-endpoints)
7. [Core Business Logic & Libraries](#7-core-business-logic--libraries)
8. [Frontend Architecture](#8-frontend-architecture)
9. [Frontend Pages & Routes](#9-frontend-pages--routes)
10. [State Management](#10-state-management)
11. [Real-Time Features](#11-real-time-features)
12. [Third-Party Integrations](#12-third-party-integrations)
13. [Scheduled Jobs & Background Tasks](#13-scheduled-jobs--background-tasks)
14. [Middleware Stack](#14-middleware-stack)
15. [Environment Configuration](#15-environment-configuration)
16. [Build, Deploy & Dev Workflow](#16-build-deploy--dev-workflow)
17. [Feature Summary Matrix](#17-feature-summary-matrix)

---

## 1. Architecture Overview

YOHOP is a full-stack application with a clear client-server architecture:

```
                    ┌─────────────────────────────────────────────┐
                    │              FRONTEND (React/TS)            │
                    │  Vite + React 19 + TanStack Query + Tailwind│
                    │  Port: 5173 | Deployed on Vercel            │
                    └──────────────────┬──────────────────────────┘
                                       │ REST API (JSON)
                                       │ WebSocket (Socket.io)
                    ┌──────────────────▼──────────────────────────┐
                    │              BACKEND (Node.js/TS)            │
                    │  Express.js + Prisma ORM + JWT Auth          │
                    │  Port: 3000 | Dockerized                    │
                    └──┬──────┬──────┬──────┬──────┬──────────────┘
                       │      │      │      │      │
                    ┌──▼──┐┌──▼──┐┌──▼──┐┌──▼──┐┌──▼──────────┐
                    │Postgr││Redis││Cloud││PayPal││Google Gemini│
                    │SQL   ││Cache││inary││      ││AI           │
                    │(Neon)││(opt)││     ││      ││             │
                    └──────┘└─────┘└─────┘└──────┘└─────────────┘
```

**Data Flow:**
1. Frontend components call custom React hooks
2. Hooks use TanStack React Query to call the API service layer
3. API service layer sends HTTP requests to the Express backend
4. Backend routes delegate to controllers/handlers that use Prisma ORM
5. Prisma communicates with PostgreSQL (hosted on Neon)
6. Real-time updates flow through Socket.io WebSocket connections

---

## 2. Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **Node.js + TypeScript** | Runtime & language |
| **Express.js** | HTTP framework |
| **Prisma** | ORM for PostgreSQL |
| **PostgreSQL (Neon)** | Primary database |
| **Redis** (optional) | Caching & job queues |
| **JWT (jsonwebtoken)** | Authentication tokens |
| **bcryptjs** | Password hashing |
| **Socket.io** | Real-time WebSocket server |
| **Nodemailer** | SMTP email sending |
| **PayPal SDK** | Payment processing |
| **Cloudinary** | Image/media storage |
| **Google Generative AI (Gemini)** | AI content generation |
| **node-cron** | Scheduled background jobs |

### Frontend
| Technology | Purpose |
|---|---|
| **React 19.1** | UI framework |
| **TypeScript 5.8** | Type safety |
| **Vite 7.0** | Build tool & dev server |
| **React Router v7** | Client-side routing |
| **TanStack React Query v5** | Server state management |
| **React Hook Form + Zod** | Form handling & validation |
| **Tailwind CSS 3.4** | Utility-first CSS |
| **Shadcn/UI (Radix)** | Component library |
| **Framer Motion** | Animations |
| **Leaflet + React Leaflet** | Maps & geolocation |
| **Recharts** | Charts & data visualization |
| **Socket.io Client** | Real-time updates |
| **PayPal React SDK** | Payment UI |
| **Tiptap** | Rich text editor |
| **Sonner** | Toast notifications |

---

## 3. Project Structure

```
/Geolocation-MVP/
├── backend/GeoLocationMVP-BE/
│   ├── src/
│   │   ├── app.ts                          # Express app setup & middleware registration
│   │   ├── index.ts                        # Server entry point + cron scheduler
│   │   ├── config/                         # OAuth provider configuration
│   │   ├── constants/                      # App constants (point values, etc.)
│   │   ├── jobs/                           # Scheduled cron jobs (4 files)
│   │   ├── lib/                            # Core business logic libraries (30+ modules)
│   │   │   ├── ai/                         # AI services (Gemini client + 8 service modules)
│   │   │   ├── cache/                      # Caching abstraction (memory + redis)
│   │   │   ├── heist/                      # Heist game system (7 submodules)
│   │   │   ├── leaderboard/               # Leaderboard logic (3 submodules)
│   │   │   ├── oauth/                      # OAuth utilities (PKCE, providers, state)
│   │   │   ├── queue/                      # Task queue (memory + redis)
│   │   │   ├── prisma.ts                   # Prisma client singleton
│   │   │   ├── points.ts                   # Points system logic
│   │   │   ├── gamification.ts            # Coins, XP, achievements, tiers
│   │   │   ├── loyalty.ts                 # Merchant loyalty program logic
│   │   │   ├── streak.ts                  # Check-in streak management
│   │   │   ├── email.ts                   # Email sending (Nodemailer)
│   │   │   ├── paypal.ts                  # PayPal payment integration
│   │   │   ├── geo.ts                     # Geolocation/Haversine calculations
│   │   │   ├── cloudinary.ts              # Image upload/delete
│   │   │   └── qrcode.service.ts          # QR code generation
│   │   ├── middleware/                     # Express middleware (6 files)
│   │   ├── routes/                         # API route handlers (35 route files)
│   │   ├── services/                       # Service layer (10 files)
│   │   └── types/                          # TypeScript type definitions
│   ├── prisma/
│   │   └── schema.prisma                   # Complete database schema
│   ├── dist/                               # Compiled JavaScript output
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile.prod
│
├── web/
│   ├── src/
│   │   ├── main.tsx                        # React app entry point
│   │   ├── App.tsx                         # Root component with all routes (~1150 lines)
│   │   ├── components/                     # React components (100+ files)
│   │   │   ├── ui/                         # Shadcn/Radix base components
│   │   │   ├── common/                     # Shared components
│   │   │   ├── layout/                     # Header, Footer, Sidebar, Nav
│   │   │   ├── auth/                       # Login modal, social login, route guards
│   │   │   ├── deals/                      # Deal cards, activity feed
│   │   │   ├── merchant/                   # Merchant dashboard components (40+)
│   │   │   ├── admin/                      # Admin panel components (20+)
│   │   │   ├── gamification/               # Loyalty, streaks, achievements
│   │   │   ├── nudges/                     # Notification toasts
│   │   │   └── ai/                         # AI chatbot widget
│   │   ├── pages/                          # Page components (60+ pages)
│   │   ├── hooks/                          # Custom React hooks (90+)
│   │   ├── services/                       # API client & service classes
│   │   ├── context/                        # React context providers (9)
│   │   ├── routing/                        # Route path definitions
│   │   ├── lib/                            # Utilities & validation schemas
│   │   ├── styles/                         # Global CSS & design tokens
│   │   └── types/                          # TypeScript interfaces
│   ├── public/                             # Static assets
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.app.json
│   ├── vercel.json                         # Vercel deployment config
│   └── jest.config.js
```

---

## 4. Database Schema & Models

The database is PostgreSQL managed via Prisma ORM. Below are all models grouped by domain.

### 4.1 Users & Authentication

**User**
| Field | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| email | String (unique) | User email |
| password | String? | Hashed password (null for social-only users) |
| name | String? | Display name |
| avatar | String? | Avatar URL (Cloudinary) |
| birthday | DateTime? | User's birthday |
| phone | String? | Phone number |
| role | Enum | USER, MERCHANT, ADMIN, EVENT_ORGANIZER, SUPER_ADMIN |
| points | Int | Lifetime accumulated points |
| monthlyPoints | Int | Points this month (reset monthly) |
| coins | Float | Virtual currency balance |
| experiencePoints | Int | XP for leveling/tiers |
| loyaltyTier | Enum | BRONZE, SILVER, GOLD, PLATINUM, DIAMOND |
| totalSpent | Float | Total money spent on platform |
| referralCode | String (unique) | User's referral code |
| referredBy | String? | Who referred this user |
| emailVerified | Boolean | Email verification status |
| lastLoginAt | DateTime? | Last login timestamp |
| createdAt / updatedAt | DateTime | Timestamps |

**SocialAccount**
| Field | Type | Description |
|---|---|---|
| provider | String | google, facebook, instagram |
| providerAccountId | String | OAuth provider's user ID |
| userId | UUID (FK) | Link to User |

### 4.2 Merchants & Stores

**Merchant**
| Field | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| userId | UUID (FK) | Owner user account |
| businessName | String | Business display name |
| slug | String (unique) | URL-friendly name |
| description | String? | Business description |
| category | String? | Business category |
| status | Enum | PENDING, APPROVED, REJECTED, SUSPENDED |
| latitude / longitude | Float? | Primary business location |
| address, city, state, zipCode | String? | Address fields |
| phone, website | String? | Contact info |
| logo, coverImage | String? | Branding images |
| gallery | String[] | Photo gallery URLs |
| amenities | String[] | Available amenities list |
| vibeTags | String[] | Atmosphere descriptors |
| operatingHours | Json? | Business hours configuration |

**Store** (multiple locations per merchant)
| Field | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| merchantId | UUID (FK) | Parent merchant |
| name | String | Store location name |
| address, city, state, zipCode | String | Location address |
| latitude / longitude | Float | GPS coordinates |
| phone | String? | Store phone |
| isActive | Boolean | Active status |
| cityId | UUID? (FK) | Associated city |

**MerchantVerification** (step-by-step onboarding)
| Field | Type | Description |
|---|---|---|
| merchantId | UUID (FK) | Merchant being verified |
| identityVerified | Boolean | Step 1: Identity check |
| businessLicenseVerified | Boolean | Step 2: License |
| addressVerified | Boolean | Step 3: Address |
| taxDocumentVerified | Boolean | Step 4: Tax docs |

### 4.3 Deals System

**Deal**
| Field | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| merchantId | UUID (FK) | Deal creator |
| title | String | Deal headline |
| description | String? | Deal details |
| discountPercentage | Float? | Percentage discount |
| discountAmount | Float? | Fixed amount discount |
| startTime / endTime | DateTime? | Time window |
| images | String[] | Deal images |
| isActive | Boolean | Active toggle |
| accessCode | String? | Private deal access code |
| isBounty | Boolean | Is a bounty/referral deal |
| bountyReward | Float? | Bounty reward amount |
| currentRedemptions / maxRedemptions | Int? | Redemption tracking/limits |
| isFlashSale | Boolean | Flash sale flag |
| dealTypeId / dealCategoryId | UUID? (FK) | Type and category |
| isSurprise | Boolean | Hidden until revealed |
| surpriseRadius | Float? | Geo-fence for reveal |

**DealTypeMaster**: STANDARD, HAPPY_HOUR, RECURRING
**DealCategoryMaster**: Food & Beverage, Retail, Entertainment, etc.
**UserDeal**: Many-to-many linking users to saved deals.
**BountyProgress**: Tracks referral deal completion progress per user.

### 4.4 Check-In System

**CheckIn**
| Field | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| userId | UUID (FK) | Who checked in |
| merchantId | UUID (FK) | Where they checked in |
| latitude / longitude | Float | GPS at time of check-in |
| distance | Float? | Distance from merchant (meters) |
| pointsEarned | Int | Points awarded |

### 4.5 Gamification & Economy

**UserStreak** (check-in streak tracking)
| Field | Type | Description |
|---|---|---|
| userId | UUID (FK) | User |
| currentStreak | Int | Consecutive day count |
| longestStreak | Int | All-time best |
| lastCheckInDate | DateTime? | Last check-in |
| weeklyCheckIns | Int | Check-ins this week |
| currentDiscount | Float | Streak-based discount % |

**Achievement** (defined by admin)
| Field | Type | Description |
|---|---|---|
| name | String | Achievement name |
| type | String | Category of achievement |
| description | String | How to earn it |
| criteria | Json | Programmatic conditions |
| coinReward / xpReward | Float/Int | Rewards for completion |

**UserAchievement**: Tracks user progress toward each achievement.

**CoinTransaction** (virtual currency ledger)
| Field | Type | Description |
|---|---|---|
| userId | UUID (FK) | User |
| type | Enum | PURCHASE, EARNED, SPENT, BONUS, REFUND |
| amount | Float | Coin amount (positive/negative) |
| description | String? | Transaction description |

**LoyaltyTierConfig** (tier thresholds)
| Field | Type | Description |
|---|---|---|
| tier | Enum | BRONZE through DIAMOND |
| minXP | Int | Minimum XP required |
| coinMultiplier | Float | Earning multiplier |
| perks | Json? | Tier-specific benefits |

**UserPointEvent**: Full audit log of all point-earning events (SIGNUP, CHECKIN, ACHIEVEMENT, REFERRAL, HEIST, etc.)

### 4.6 Merchant Loyalty Programs

**MerchantLoyaltyProgram**
| Field | Type | Description |
|---|---|---|
| merchantId | UUID (FK) | Owning merchant |
| pointsPerDollar | Float | Earn rate (default 0.4) |
| minimumSpend | Float | Min spend to earn |
| redemptionThreshold | Int | Min points to redeem (default 25) |
| redemptionValue | Float | Dollar value per redemption (default $5) |
| expirationDays | Int? | Points expiry |
| combineWithDeals | Boolean | Can use with deals |

**UserMerchantLoyalty**: Per-user, per-merchant point balance.
**LoyaltyPointTransaction**: Detailed transaction log.
**LoyaltyRedemption**: Redemption records with discount values.

### 4.7 Heist System (PvP Game)

**HeistToken**: User's heist token balance (earned, spent, current).
**Heist**: Attack record (attacker, victim, points stolen, status, items used).
**HeistItem**: Purchasable items (Sword, Hammer, Shield) with effects.
**UserHeistItem**: User's item inventory with quantity and expiration.
**HeistItemUsage**: Record of items used in specific heists.
**HeistNotification**: Alerts for attacks, defenses, and token events.

### 4.8 Events & Ticketing

**Event**
| Field | Type | Description |
|---|---|---|
| title | String | Event name |
| type | Enum | PARTY, BAR_CRAWL, SPORTS, FESTIVAL, RSVP, WAGBT |
| status | Enum | DRAFT, PUBLISHED, CANCELLED, COMPLETED |
| organizerId / merchantId | UUID (FK) | Who created it |
| venue, address, city, state | String? | Location info |
| latitude / longitude | Float? | GPS |
| startDate / endDate | DateTime | Event timing |
| capacity | Int? | Max attendees |
| hasWaitlist | Boolean | Waitlist enabled |
| isPrivate | Boolean | Private event flag |
| accessCode | String? | Access code for private events |
| ageRestriction | Int? | Minimum age |

**EventTicketTier**: Price tiers (GENERAL, VIP, PREMIUM, EARLY_BIRD, ALL_ACCESS, DAY_PASS) with quantity tracking.
**EventTicket**: Individual tickets with QR codes, transfer history, and status (RESERVED/CONFIRMED/CHECKED_IN/TRANSFERRED).
**EventAttendee**: RSVP tracking with attendee types (TICKET_HOLDER, VENDOR, VIP_GUEST).
**EventCheckIn**: Check-in records (GPS or QR method).
**EventAddOn**: Optional purchasable add-ons for events.
**EventAddOnPurchase**: Add-on purchase records.

### 4.9 Table Booking

**Table**: Capacity, features, status (AVAILABLE/OCCUPIED/RESERVED/OUT_OF_ORDER).
**TimeSlot**: Day of week, start/end time, duration, max bookings per slot.
**Booking**: Date, party size, status (PENDING/CONFIRMED/CANCELLED/COMPLETED/NO_SHOW), confirmation code, special requests.
**BookingSettings**: Advance booking days, party size range, cancellation policy, reminder settings.

### 4.10 Services & Service Booking

**Service**: Title, type, duration, status (DRAFT/PUBLISHED/PAUSED), advance booking rules, cancellation policy.
**ServicePricingTier**: Named tiers with price, duration, max slots, per-user limits.
**ServiceBooking**: Date, time, confirmation code, QR code, status, contact info.
**ServiceCheckIn**: Attendance check-in records.
**ServiceAddOn / ServiceAddOnPurchase**: Optional add-on services.

### 4.11 Venue Rewards

**VenueReward**: Location-based rewards (coins, discounts, bonuses) with geo-fence radius and max claims.
**VenueRewardClaim**: User claim records with GPS verification.

### 4.12 Check-In Games

**CheckInGameConfig**: Per-merchant game configuration (type: SCRATCH_CARD, SPIN_WHEEL, PICK_A_CARD; cooldown, max plays).
**CheckInGameReward**: Reward definitions with probability weights (DISCOUNT %, FIXED, FREE_ITEM, COINS, BONUS_POINTS).
**CheckInGameSession**: Game session with token, status, result, and expiry.
**CheckInGameIssuedReward**: Actual rewards given out with claim codes.

### 4.13 Menu & Orders

**MenuItem**: Name, price, category, inventory tracking, happy hour pricing, surprise items, variants.
**MenuItemVariant**: SKU, label, price, inventory, availability.
**MenuCollection**: Standard/Happy Hour/Special menus with time windows and themes.
**MenuCollectionItem**: Items in collections with optional custom pricing.
**Order**: Order number, amounts (subtotal, discounts, final), status (PENDING through CANCELLED), items as JSON, payment method.
**DealMenuItem**: Links deals to specific menu items.

### 4.14 Payments

**PaymentTransaction**: PayPal/Stripe integration records with orderId, paymentId, amount, coins purchased, status, currency, gateway, and purpose (COIN_PURCHASE, DEAL, EVENT, etc.).

### 4.15 Nudges & Notifications

**Nudge**: Type (INACTIVITY, NEARBY_DEAL, STREAK, HAPPY_HOUR, WEATHER, SURPRISE), trigger conditions (JSON), frequency, cooldown, time window.
**UserNudge**: Delivery tracking (sent, delivered, opened, clicked, dismissed).
**UserNudgePreferences**: Enable/disable by type with quiet hours.

### 4.16 Content & Other

**BlogCategory / BlogPost**: Merchant blogging system with categories, slugs, rich content, status (DRAFT/PUBLISHED/ARCHIVED).
**City**: City definitions with active/inactive status.
**BusinessInterestLog**: User interest tracking per merchant/deal.
**KittyGame / KittyGuess**: Prize pool guessing game with entry fees.

---

## 5. Authentication & Authorization

### 5.1 JWT Authentication

The backend uses JWT (JSON Web Tokens) for stateless authentication.

**Token Details:**
- **Secret:** `JWT_SECRET` environment variable
- **Payload:** `{ userId: string, email: string }`
- **Expiration:** 24 hours
- **Transport:** `Authorization: Bearer <token>` header

**Password Security:**
- Library: `bcryptjs` with 10 salt rounds
- Only used for email/password accounts (social logins have no password)

### 5.2 Auth Middleware

| Middleware | Purpose |
|---|---|
| `protect` | Requires valid JWT; attaches `req.user` |
| `optionalAuth` | Attaches user if token present, proceeds regardless |
| `requireAdmin` | Requires ADMIN or SUPER_ADMIN role |
| `isApprovedMerchant` | Requires user to be a merchant with APPROVED status |
| `isMerchant` | Requires merchant role (any status) |

### 5.3 Social OAuth (Google, Facebook, Instagram)

- Uses **PKCE flow** (Proof Key for Code Exchange) for security
- **State parameter** is encrypted with a nonce for CSRF protection
- On first social login, a new User record is created automatically
- On subsequent logins, the existing account is matched via provider ID

### 5.4 Frontend Auth Flow

1. On app load, `AuthProvider` checks for `authToken` in localStorage
2. If token exists, calls `GET /api/auth/me` to validate and fetch user data
3. User data is cached with `staleTime: Infinity` (refreshed only on explicit invalidation)
4. On 401 response, token is cleared and user is logged out
5. `ProtectedRoute` component gates authenticated-only pages; shows `LoginPromptModal` if not logged in
6. Post-login redirect uses `RedirectContext` to return user to their intended page

---

## 6. API Reference (All Endpoints)

All endpoints are prefixed with `/api` unless noted otherwise. Authentication requirement is indicated by the lock icon.

### 6.1 Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | No | Register new user. Body: `{ name, email, password, referralCode? }` |
| POST | `/auth/login` | No | Login. Body: `{ email, password }`. Returns JWT token |
| GET | `/auth/me` | Yes | Get current user profile (includes merchant status) |
| GET | `/auth/:provider/start` | No | Start OAuth flow (google/facebook/instagram) |
| GET | `/auth/:provider/callback` | No | OAuth callback handler |

### 6.2 User Actions

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/users/save-deal` | Yes | Save a deal to user's collection |
| GET | `/users/saved-deals` | Yes | Get user's saved deals list |
| POST | `/users/check-in` | Yes | Check-in at a merchant. Body: `{ merchantId, latitude, longitude }`. GPS verified against merchant location within radius |
| GET | `/users/check-in-history` | Yes | Get check-in history |
| GET | `/users/check-in-stats` | Yes | Get check-in statistics |

### 6.3 Profile

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/profile` | Yes | Get user profile |
| PUT | `/profile` | Yes | Update profile (name, avatar, birthday) |
| GET | `/profile/stats` | Yes | User stats (points, streak, achievements) |

### 6.4 Merchants

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/merchants` | Yes | Create merchant profile |
| GET | `/merchants/:id` | No | Get merchant details |
| PUT | `/merchants/:id` | Merchant | Update merchant profile |
| GET | `/merchants/:id/stats` | Merchant | Get merchant statistics |
| POST | `/merchants/:id/menu-items` | Merchant | Add menu item |
| PUT | `/merchants/:id/menu-items/:itemId` | Merchant | Update menu item |
| DELETE | `/merchants/:id/menu-items/:itemId` | Merchant | Delete menu item |
| POST | `/merchants/:id/deals` | Merchant | Create a deal |
| GET | `/merchants/:id/deals` | Merchant | List merchant's deals |
| PUT | `/merchants/:id/deals/:dealId` | Merchant | Update deal |
| DELETE | `/merchants/:id/deals/:dealId` | Merchant | Delete deal |
| GET | `/merchants/:id/inventory` | Merchant | Get inventory data |
| POST | `/merchants/:id/inventory/bulk-upload` | Merchant | Bulk upload inventory via Excel |
| POST | `/merchants/:id/stores` | Merchant | Add a store location |
| POST | `/merchants/:id/tables` | Merchant | Add a table |
| POST | `/merchants/:id/time-slots` | Merchant | Add booking time slots |

### 6.5 Public Deals

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/deals` | No | Browse all active deals |
| GET | `/deals/:id` | No | Get deal details |
| GET | `/deals/nearby` | No | Get deals near a location. Query: `lat, lng, radius?` |
| GET | `/deals/search` | No | Search deals by keyword, category, etc. |

### 6.6 Leaderboard

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/leaderboard/:period` | No | Get leaderboard. Period: `day`, `week`, `month`, `all-time` |
| GET | `/leaderboard/:period/me` | Yes | Get current user's rank in period |

### 6.7 Gamification (Coins, Achievements, Tiers)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/gamification/profile` | Yes | User's gamification profile (coins, XP, tier, achievements) |
| GET | `/gamification/transactions` | Yes | Coin transaction history |
| GET | `/gamification/coin-packages` | Yes | Available coin packages for purchase |
| POST | `/gamification/purchase/create-order` | Yes | Create PayPal order for coins |
| POST | `/gamification/purchase/capture` | Yes | Capture PayPal payment |
| GET | `/gamification/achievements` | Yes | List all available achievements |
| GET | `/gamification/achievements/progress` | Yes | User's progress on all achievements |

### 6.8 Streaks

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/streak/profile` | Yes | User's current streak info |
| GET | `/streak/stats` | Yes | Streak statistics |
| GET | `/streak/rewards` | Yes | Streak-based rewards available |

### 6.9 Loyalty Programs

**Customer-facing:**

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/loyalty/balances` | Yes | All loyalty balances across merchants |
| GET | `/loyalty/:merchantId/balance` | Yes | Balance at specific merchant |
| GET | `/loyalty/:merchantId/transactions` | Yes | Transaction history at merchant |
| POST | `/loyalty/:merchantId/redeem` | Yes | Redeem points for discount |
| GET | `/loyalty/:merchantId/program` | Yes | Get program details (rates, thresholds) |

**Merchant-facing:**

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/merchants/:id/loyalty/program` | Merchant | View own loyalty program config |
| PUT | `/merchants/:id/loyalty/program` | Merchant | Update program settings |
| GET | `/merchants/:id/loyalty/analytics` | Merchant | Loyalty analytics and reporting |

### 6.10 Heist System (PvP)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/heist/tokens` | Yes | Get user's heist token balance |
| POST | `/heist/execute` | Yes | Execute a heist against another user |
| GET | `/heist/can-rob/:victimId` | Yes | Check if you can heist a specific user |
| GET | `/heist/history` | Yes | Heist history (attacks and defenses) |
| GET | `/heist/stats` | Yes | Heist statistics |
| GET | `/heist/notifications` | Yes | Heist notifications |
| POST | `/heist/notifications/:id/read` | Yes | Mark notification as read |
| GET | `/heist/items` | Yes | Available items for purchase (Sword, Hammer, Shield) |
| GET | `/heist/inventory` | Yes | User's current item inventory |
| POST | `/heist/items/:id/purchase` | Yes | Buy an item with coins |

### 6.11 Events

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/events` | No | Browse published events |
| POST | `/events` | Organizer | Create event |
| GET | `/events/:id` | No | Event details |
| PUT | `/events/:id` | Organizer | Update event |
| DELETE | `/events/:id` | Organizer | Delete event |
| POST | `/events/:id/tickets` | Organizer | Create ticket tier |
| POST | `/events/:id/register` | Yes | Register / buy ticket |
| POST | `/events/:id/checkin` | Yes | Check-in to event (GPS or QR) |
| GET | `/events/:id/attendees` | Organizer | Get attendee list |
| POST | `/events/:id/add-ons` | Organizer | Create event add-on |
| POST | `/events/:id/add-ons/:addOnId/purchase` | Yes | Purchase add-on |

### 6.12 Table Booking

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/table-booking/merchants/:merchantId/availability` | No | Check table availability |
| POST | `/table-booking/book` | Yes | Create a booking |
| GET | `/table-booking/my-bookings` | Yes | User's bookings |
| PUT | `/table-booking/:bookingId` | Yes | Modify booking |
| DELETE | `/table-booking/:bookingId` | Yes | Cancel booking |
| POST | `/table-booking/:bookingId/confirm` | Merchant | Confirm a booking |

### 6.13 Services

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/services` | No | Browse available services |
| POST | `/services` | Merchant | Create service |
| GET | `/services/:id` | No | Service details |
| PUT | `/services/:id` | Merchant | Update service |
| POST | `/services/:id/book` | Yes | Book a service |
| GET | `/services/my-bookings` | Yes | User's service bookings |
| POST | `/services/:id/add-ons` | Merchant | Create service add-on |

### 6.14 Venue Rewards

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/venue-rewards/nearby` | Yes | Get rewards near location |
| POST | `/venue-rewards/:rewardId/claim` | Yes | Claim a reward (GPS verified) |
| GET | `/venue-rewards/my-claims` | Yes | User's claimed rewards |

### 6.15 Surprise Deals

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/surprises/nearby` | Yes | Get nearby surprise deals |
| POST | `/surprises/:dealId/reveal` | Yes | Reveal a surprise deal |
| GET | `/surprises/revealed` | Yes | User's revealed surprises |
| POST | `/merchant/surprises` | Merchant | Create surprise deal |
| GET | `/merchant/surprises` | Merchant | List merchant's surprises |
| PUT | `/merchant/surprises/:id` | Merchant | Update surprise |

### 6.16 Nudges & Notifications

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/nudges` | Yes | Get active nudges for user |
| GET | `/nudges/preferences` | Yes | Get nudge preference settings |
| PUT | `/nudges/preferences` | Yes | Update preferences (enable/disable types, quiet hours) |
| POST | `/nudges/:id/dismiss` | Yes | Dismiss a nudge |

### 6.17 Check-In Games

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/checkin-game/config/:merchantId` | Yes | Get game config for a merchant |
| POST | `/checkin-game/session/:sessionId/play` | Yes | Play the game (scratch card, spin wheel, or pick-a-card) |
| GET | `/checkin-game/rewards/:sessionId` | Yes | Get issued reward details |

### 6.18 Check-In Lottery

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/checkin-lottery/enter` | Yes | Enter lottery on check-in |
| GET | `/checkin-lottery/status` | Yes | Check lottery status |

### 6.19 Kitty Game

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/kitty/games` | Yes | Create kitty game |
| GET | `/kitty/games` | Yes | List games |
| GET | `/kitty/games/:id` | Yes | Game details |
| POST | `/kitty/games/:id/guess` | Yes | Place a guess |
| POST | `/kitty/games/:id/resolve` | Yes | Resolve game |

### 6.20 Payments

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/payments/intent` | Yes | Create payment intent (PayPal) |
| POST | `/payments/capture` | Yes | Capture payment after approval |

### 6.21 Blog

**Merchant (authenticated):**

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/merchant/blog/posts` | Merchant | Create blog post |
| GET | `/merchant/blog/posts` | Merchant | List own posts |
| PUT | `/merchant/blog/posts/:id` | Merchant | Update post |
| DELETE | `/merchant/blog/posts/:id` | Merchant | Delete post |

**Public:**

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/blog/:merchantSlug` | No | Get merchant's published blog |
| GET | `/blog/:merchantSlug/:postSlug` | No | Get individual blog post |

### 6.22 Media

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/media/upload` | Yes | Upload image to Cloudinary |
| GET | `/media/:id` | Yes | Get media details |
| DELETE | `/media/:id` | Yes | Delete media |

### 6.23 Cities & Master Data

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/cities` | No | List active cities |
| GET | `/cities/:id` | No | City details |
| GET | `/admin/master-data/categories` | Admin | Deal categories |
| GET | `/admin/master-data/deal-types` | Admin | Deal types |
| GET | `/admin/master-data/point-events` | Admin | Point event types |
| POST | `/admin/master-data/categories` | Admin | Create category |
| PUT | `/admin/master-data/categories/:id` | Admin | Update category |

### 6.24 Admin

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/admin/cities` | Admin | List all cities (paginated) |
| PUT | `/admin/cities/:id` | Admin | Update city active status |
| POST | `/admin/cities/bulk` | Admin | Bulk update cities |
| GET | `/admin/merchants` | Admin | List merchants with filters |
| POST | `/admin/merchants/:id/approve` | Admin | Approve merchant |
| POST | `/admin/merchants/:id/reject` | Admin | Reject merchant |
| POST | `/admin/merchants/:id/suspend` | Admin | Suspend merchant |
| GET | `/admin/users` | Admin | List all users |
| GET | `/admin/analytics/performance` | Admin | Performance metrics (filters: period, city, merchant) |
| GET | `/admin/analytics/weekly-chart` | Admin | Weekly chart data |

### 6.25 Admin - Nudges

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/admin/nudges` | Admin | Create nudge template |
| GET | `/admin/nudges` | Admin | List nudge templates |
| PUT | `/admin/nudges/:id` | Admin | Update nudge |
| DELETE | `/admin/nudges/:id` | Admin | Delete nudge |
| POST | `/admin/nudges/:id/send` | Admin | Manually trigger a nudge |

### 6.26 Admin - Games

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/admin/games/checkin/config` | Admin | Create/update check-in game config |
| POST | `/admin/games/checkin/rewards` | Admin | Add game reward |
| GET | `/admin/games/checkin/:merchantId` | Admin | Get game config for merchant |

### 6.27 AI Services

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/ai/chat` | Yes | Chat with AI bot |
| POST | `/ai/generate/menu-description` | Yes | AI-generate menu item description |
| POST | `/ai/generate/deal-title` | Yes | AI-generate deal title |
| POST | `/ai/generate/blog` | Yes | AI-generate blog content |

### 6.28 External Aggregators

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/delivery/services` | Yes | List delivery service options |
| POST | `/delivery/order` | Yes | Create delivery order |
| GET | `/rides/services` | Yes | List ride service options |
| POST | `/rides/request` | Yes | Request a ride |

### 6.29 Health

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/health` | No | Server health check |
| GET | `/health/db` | No | Database connectivity check |

---

## 7. Core Business Logic & Libraries

### 7.1 Points System (`lib/points.ts`)

Points are the primary engagement currency.

**Earning Points:**
| Event | Points | Notes |
|---|---|---|
| Signup | 50 (configurable via env) | One-time |
| Check-in | 10 (configurable) | Per check-in |
| First check-in at merchant | 25 bonus (configurable) | One-time per merchant |
| Achievement completion | Varies per achievement | Defined in achievement config |
| Referral | Configurable | When referred user signs up |

**Key Functions:**
- `awardPoints(userId, amount, eventType)` - Awards points and logs the event
- `deductPoints(userId, amount, reason)` - Deducts points (e.g., heist losses)
- Points are stored on the User model (`points` = lifetime, `monthlyPoints` = current month)

### 7.2 Gamification System (`lib/gamification.ts`)

**Coins:** Virtual currency purchased with real money or earned through gameplay.
**XP (Experience Points):** Earned through actions; determines loyalty tier.

**Loyalty Tiers:**
| Tier | Requirements | Coin Multiplier |
|---|---|---|
| BRONZE | Default | 1.0x |
| SILVER | 500 XP | 1.2x |
| GOLD | 2,000 XP | 1.5x |
| PLATINUM | 5,000 XP | 2.0x |
| DIAMOND | 10,000 XP | 3.0x |

**Coin Packages (purchasable via PayPal):**
| Package | Price | Coins |
|---|---|---|
| Starter | $0.99 | 100 |
| Popular | $4.99 | 600 |
| Value | $9.99 | 1,500 |
| Premium | $19.99 | 3,500 |
| Ultimate | $39.99 | 8,000 |

### 7.3 Loyalty Program (`lib/loyalty.ts`)

Merchant-specific loyalty programs where customers earn points per dollar spent.

**Default Configuration:**
- **Earn rate:** 0.4 points per $1 spent (minimum $0.01 to earn)
- **Redemption:** 25 points = $5 discount
- **Expiration:** Configurable per merchant
- **Combine with deals:** Configurable flag

**Flow:**
1. Customer makes a purchase at merchant
2. Points calculated: `floor(amountSpent * pointsPerDollar)`
3. Points added to `UserMerchantLoyalty` balance
4. Customer accumulates and redeems at threshold

### 7.4 Heist System (`lib/heist/`)

A PvP mechanic where users can "steal" points from others.

**Components:**
- **Tokens:** Earned through check-ins and achievements; spent to execute heists
- **Execution:** Random success/failure based on base probability + item modifiers
- **Items:** Sword (increases steal %), Hammer (bypasses shield chance), Shield (reduces incoming steal)
- **Cooldown:** Configurable time between heists against the same victim
- **Notifications:** Real-time alerts to both attacker and victim via Socket.io

### 7.5 Streak System (`lib/streak.ts`)

Tracks consecutive check-in days.

**Mechanics:**
- Current streak increments on daily check-in
- Resets if a day is missed
- Longest streak tracks all-time best
- Weekly check-ins counted separately
- Discount percentage increases with streak length

### 7.6 Leaderboard (`lib/leaderboard/`)

**Periods:** Day, Week, Month, All-Time
**Ranking:** Tie-aware (1, 1, 3 style) based on points
**Caching:** Redis-backed with TTL per granularity
**Current month optimization:** Uses `monthlyPoints` field directly for fast queries

### 7.7 Geolocation (`lib/geo.ts`)

- **Haversine formula** for distance calculation between GPS coordinates
- **Check-in radius:** Default 100 meters (configurable via `CHECKIN_RADIUS_METERS`)
- **Dev mode:** `CHECKIN_BYPASS_GEO=true` skips GPS validation
- Used by: check-ins, venue rewards, surprise deals, nearby deals

### 7.8 Email Service (`lib/email.ts`)

- SMTP via Nodemailer (configurable provider)
- Templates: Welcome email, referral notifications, booking confirmations, birthday greetings
- Non-blocking: fire-and-forget pattern
- Enabled via `EMAIL_ENABLED=true`

### 7.9 Payment Processing (`lib/paypal.ts`)

- PayPal SDK integration (Sandbox for dev, Production for prod)
- Creates and captures payment orders
- Used for: coin purchases, deal payments, event tickets, service bookings
- Transaction records stored in `PaymentTransaction` model

### 7.10 AI Services (`lib/ai/`)

Powered by Google Generative AI (Gemini).

**Services:**
| Service | Purpose |
|---|---|
| Blog Generator | Auto-generate blog posts for merchants |
| Menu Description | Generate appealing menu item descriptions |
| Deal Title | Create catchy deal headlines |
| City Guide | Generate local city guide content |
| Nudge Messages | Create personalized nudge messages |
| Chatbot | Conversational AI for user queries |
| Inventory Suggestions | AI-powered inventory management tips |

### 7.11 Image Management (`lib/cloudinary.ts`)

- Upload images to Cloudinary CDN
- Delete images by public ID
- Used for: avatars, deal images, merchant galleries, event covers, blog images, menu items

### 7.12 QR Codes (`lib/qrcode.service.ts`)

- Generate QR codes for: event tickets, service bookings, venue reward claims
- QR data contains encoded identifiers for verification on scan

---

## 8. Frontend Architecture

### 8.1 Component Hierarchy

```
<QueryClientProvider>
  <AuthProvider>
    <CityProvider>
      <ModalProvider>
        <RedirectProvider>
          <NavigationProvider>
            <BrowserRouter>
              <App />          ← All routes defined here
            </BrowserRouter>
          </NavigationProvider>
        </RedirectProvider>
      </ModalProvider>
    </CityProvider>
  </AuthProvider>
</QueryClientProvider>
```

### 8.2 API Client (`services/api.ts`)

The `ApiClient` class is the single point of contact for all backend calls.

```typescript
// Usage pattern:
const response = await apiGet<DealType[]>("/deals");
// Returns: { success: boolean, data: T | null, error: string | null }
```

**Features:**
- Base URL from `VITE_API_URL` env variable (default: `http://localhost:3000/api`)
- Auto-attaches `Authorization: Bearer <token>` header
- Global 401 handler: clears token on unauthorized
- FormData support for file uploads
- Methods: `apiGet`, `apiPost`, `apiPostFormData`, `apiPut`, `apiPatch`, `apiDelete`

### 8.3 Custom Hooks (90+ hooks in `hooks/`)

Every API interaction is wrapped in a custom hook using TanStack React Query:

```typescript
// Example pattern:
function useDeals() {
  return useQuery({
    queryKey: ['deals'],
    queryFn: () => apiGet<Deal[]>('/deals'),
  });
}

function useCreateDeal() {
  return useMutation({
    mutationFn: (data: CreateDealInput) => apiPost('/deals', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['deals'] }),
  });
}
```

### 8.4 Specialized Service Classes

| Service | File | Purpose |
|---|---|---|
| GamificationService | `services/gamificationService.ts` | Coins, achievements, PayPal orders |
| LoyaltyService | `services/loyaltyService.ts` | Loyalty balances, transactions, redemption |
| HeistService | `services/heistService.ts` | Heist game mechanics |
| DealPaymentService | `services/dealPaymentService.ts` | Deal payment processing |
| GeocodeService | `services/geocoding.ts` | Location/address lookup (Mapbox) |

### 8.5 Styling System

- **Tailwind CSS** with custom CSS variables for design tokens
- **Brand colors:** Primary red (#E80203), full scale from 50-950
- **Dark surface palette** for deal cards and modals
- **Fonts:** Geist (sans), Lora (serif), Geist Mono (monospace)
- **Shadcn/UI** "new-york" style preset with Radix primitives
- **Utility function:** `cn()` merges class names (clsx + tailwind-merge)
- **Animations:** Framer Motion for complex transitions

---

## 9. Frontend Pages & Routes

### 9.1 Public Pages (no login required)

| Route | Page | Description |
|---|---|---|
| `/` | HomePage | Landing page with featured deals, events |
| `/deals` | AllDealsPage | Browse and filter all deals |
| `/deals/:dealId` | DealDetailPage | Individual deal with menu, check-in |
| `/deals/hidden/:code` | HiddenDealPage | Access code-protected deals |
| `/events/:eventId` | EventDetailPage | Event details and registration |
| `/discover/events` | DiscoverEventsPage | Browse events |
| `/discover/services` | DiscoverServicesPage | Browse services |
| `/services/:serviceId` | ServiceDetailPage | Service details and booking |
| `/leaderboard` | LeaderboardPage | Points leaderboard |
| `/leaderboard/comprehensive` | ComprehensiveLeaderboardPage | Detailed leaderboard |
| `/streaks/leaderboard` | StreakLeaderboardPage | Streak-based ranking |
| `/city-guide` | CityGuidePage | AI-generated city guide |
| `/merchants/:merchantId/blog` | MerchantBlogPage | Merchant's blog listing |
| `/blog/:merchantId/:slug` | BlogPostPage | Individual blog post |
| `/about` | AboutPage | About YOHOP |
| `/business` | ForBusinessesPage | Merchant signup info |
| `/privacy` | PrivacyPage | Privacy policy |
| `/terms` | TermsPage | Terms of service |

### 9.2 Authentication Pages

| Route | Page | Description |
|---|---|---|
| `/login` | LoginPage | Email/password + social login |
| `/signup` | SignUpPage | Registration with referral code |
| `/auth/callback` | AuthCallbackPage | OAuth redirect handler |

### 9.3 Consumer Pages (login required)

| Route | Page | Description |
|---|---|---|
| `/profile` | ProfilePage | User profile management |
| `/loyalty/history` | LoyaltyHistoryPage | Loyalty point history |
| `/referrals` | ReferralPage | Referral program & code sharing |
| `/gamification` | GamificationPage | Coins, XP, achievements, tiers |
| `/heist/history` | HeistHistoryPage | Heist attack/defense history |
| `/heist/notifications` | HeistNotificationsPage | Heist alerts |
| `/heist/shop` | HeistItemShopPage | Buy heist items |
| `/my-tickets` | MyTicketsPage | Event tickets |
| `/my-services/bookings` | MyServiceBookingsPage | Service bookings |
| `/notifications` | NotificationsPage | All notifications |
| `/surprises` | SurprisesPage | Surprise deal discovery |
| `/surprises/history` | MyRevealHistoryPage | Previously revealed surprises |
| `/nudges/history` | NudgeHistoryPage | Nudge history |
| `/payment/success` | PaymentSuccessPage | Payment confirmation |
| `/payment/cancel` | PaymentCancelPage | Payment cancelled |

### 9.4 Merchant Dashboard (merchant role required)

All prefixed with `/merchant/`. Uses `MerchantLayout` with sidebar navigation.

| Route | Page | Description |
|---|---|---|
| `/merchant/dashboard` | MerchantDashboardPage | Overview stats and analytics |
| `/merchant/business` | MerchantBusinessPage | Business profile management |
| `/merchant/onboarding/*` | MerchantOnboardingPage | Multi-step onboarding wizard |
| `/merchant/deals` | MerchantMyDealsPage | Manage deals |
| `/merchant/deals/create/*` | CreateDealPage | Multi-step deal creation wizard |
| `/merchant/deals/:dealId/edit` | DealEditPage | Edit existing deal |
| `/merchant/events` | MerchantMyEventsPage | Manage events |
| `/merchant/events/create` | CreateEventPage | Create new event |
| `/merchant/events/:eventId` | EventManagePage | Manage specific event |
| `/merchant/events/:eventId/checkin` | EventCheckInPage | QR/GPS check-in management |
| `/merchant/services` | MerchantMyServicesPage | Manage services |
| `/merchant/services/create` | ServiceCreatePage | Create service |
| `/merchant/services/:serviceId` | ServiceManagePage | Manage specific service |
| `/merchant/services/:serviceId/checkin` | ServiceCheckInPage | Service check-in |
| `/merchant/stores` | StoreManagementPage | Multi-location management |
| `/merchant/stores/create` | StoreFormPage | Add store location |
| `/merchant/stores/:storeId/edit` | StoreFormPage | Edit store |
| `/merchant/stores/:storeId` | StoreDetailPage | Store details |
| `/merchant/menu` | MenuManagementPage | Full menu management (V2) |
| `/merchant/menu/create` | MenuItemFormPage | Add menu item |
| `/merchant/menu/:itemId/edit` | MenuItemFormPage | Edit menu item |
| `/merchant/menu/:itemId` | MenuItemDetailPage | Menu item details |
| `/merchant/menu/collections` | MenuCollectionsPage | Manage menu collections |
| `/merchant/inventory` | InventoryPage | Inventory tracking |
| `/merchant/blog` | BlogListPage | Manage blog posts |
| `/merchant/blog/create` | BlogPostFormPage | Create blog post |
| `/merchant/blog/:postId/edit` | BlogPostFormPage | Edit blog post |
| `/merchant/blog/categories` | BlogCategoriesPage | Manage blog categories |
| `/merchant/analytics` | MerchantAnalyticsPage | Business analytics |
| `/merchant/check-in-games` | MerchantCheckInGamesPage | Configure check-in games |
| `/merchant/loyalty/setup` | MerchantLoyaltySetupPage | Setup loyalty program |
| `/merchant/loyalty/program` | MerchantLoyaltyProgramPage | View program |
| `/merchant/loyalty/analytics` | MerchantLoyaltyAnalyticsPage | Loyalty analytics |
| `/merchant/loyalty/customers` | MerchantLoyaltyCustomersPage | Loyalty customers list |
| `/merchant/loyalty/transactions` | MerchantLoyaltyTransactionsPage | Loyalty transactions |
| `/merchant/kickbacks` | KickbackEarningsPage | Kickback earnings |
| `/merchant/surprises` | MerchantMySurprisesPage | Manage surprise deals |
| `/merchant/surprises/create` | SurpriseCreatePage | Create surprise deal |
| `/merchant/surprises/:dealId/analytics` | SurpriseAnalyticsPage | Surprise analytics |

### 9.5 Admin Panel (admin role required)

All prefixed with `/admin/`. Uses `AdminLayout`.

| Route | Page | Description |
|---|---|---|
| `/admin/login` | AdminLoginPage | Admin login |
| `/admin` | AdminDashboardPage | Platform overview |
| `/admin/real-time` | AdminRealTimeAnalyticsPage | Live analytics |
| `/admin/crm` | CustomerCRMPage | Customer relationship management |
| `/admin/merchants` | MerchantApprovalDashboard | Approve/reject merchants |
| `/admin/cities` | CityManagementDashboard | Manage active cities |
| `/admin/city-analytics` | CityAnalyticsDashboard | City performance data |
| `/admin/customers` | CustomerManagementPage | User management |
| `/admin/customers/:customerId` | CustomerDetailPage | Individual user details |
| `/admin/nudges` | AdminNudgesPage | Manage nudge templates |
| `/admin/games` | AdminGamesPage | Configure check-in games |

---

## 10. State Management

### 10.1 Server State: TanStack React Query

All API data is managed through React Query with automatic caching, background refetching, and optimistic updates.

**Query Key Conventions:**
```
['deals']                         - All deals
['deals', dealId]                 - Specific deal
['merchantStatus', userId]        - Merchant status
['gamification', 'profile']       - Gamification profile
['loyalty', merchantId, 'balance'] - Loyalty balance
['heist', 'tokens']              - Heist token balance
```

### 10.2 Client State: React Context

| Context | File | Purpose |
|---|---|---|
| AuthContext | `context/AuthContext.tsx` | Current user, login/logout functions |
| CityContext | `context/CityContext.tsx` | Selected city (persisted to localStorage) |
| ModalContext | `context/ModalContext.tsx` | Login prompt modal visibility |
| RedirectContext | `context/RedirectContext.tsx` | Post-login redirect path |
| DealCreationContext | `context/DealCreationContext.tsx` | Multi-step deal form state |
| EventCreationContext | `context/EventCreationContext.tsx` | Event creation wizard state |
| MerchantOnboardingContext | `context/MerchantOnboardingContext.tsx` | Onboarding flow state |
| HappyHourContext | - | Happy hour timing logic |
| NavigationContext | - | Navigation history |

### 10.3 Persistent State

- **localStorage:** Auth token (`authToken`), selected city
- **URL state:** Route parameters, query strings for filters/search

---

## 11. Real-Time Features

### 11.1 WebSocket (Socket.io)

**Server:** `lib/websocket/socket.server.ts`
**Client:** Socket.io client library

**Real-time Events:**
- Heist attack notifications (to victim)
- Heist success notifications (to attacker)
- Shield defense notifications
- Token earned alerts
- Nudge delivery
- Game result updates
- Live activity feed updates

**Connection:** Authenticated via JWT token passed during handshake.

---

## 12. Third-Party Integrations

| Service | Purpose | Config |
|---|---|---|
| **PayPal** | Payments (coins, tickets, bookings) | `PAYPAL_CLIENT_ID`, `PAYPAL_SECRET_KEY` |
| **Cloudinary** | Image/media CDN storage | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` |
| **Google Gemini AI** | Content generation (blog, menus, deals, chatbot) | `GOOGLE_API_KEY` |
| **Google OAuth** | Social login | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` |
| **Facebook OAuth** | Social login | `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET` |
| **Instagram OAuth** | Social login | `INSTAGRAM_CLIENT_ID`, `INSTAGRAM_CLIENT_SECRET` |
| **SeatGeek API** | External event discovery | `SEATGEEK_API_KEY` |
| **Ticketmaster API** | External event/artist data | `TICKETMASTER_API_KEY` |
| **Mapbox** (frontend) | Geocoding / address lookup | Frontend geocode service |
| **Neon** | Managed PostgreSQL hosting | `DATABASE_URL` |
| **Vercel** | Frontend deployment | `vercel.json` config |
| **Redis** (optional) | Caching and job queues | `REDIS_URL` |

---

## 13. Scheduled Jobs & Background Tasks

All jobs use `node-cron` and are registered in `src/index.ts`.

| Job | Schedule | Description |
|---|---|---|
| **Monthly Reset** | 1st of each month, midnight | Resets `monthlyPoints` to 0 for all users |
| **Daily Birthday** | Daily | Sends birthday emails and awards bonus points/coins |
| **Nudge Processor** | Periodic | Processes nudge queue, evaluates trigger conditions, sends nudges |
| **Interest Report** | Weekly/Monthly | Generates merchant engagement reports |

**Disable all jobs:** Set `DISABLE_SCHEDULER=true` in environment.

---

## 14. Middleware Stack

### Backend Middleware (order matters)

```
1. Helmet          → Security headers
2. CORS            → Cross-origin resource sharing (configurable whitelist)
3. Compression     → gzip response compression
4. JSON Parser     → Parse JSON request bodies
5. Rate Limiter    → 100 req/15min (API), 5 req/15min (auth endpoints)
6. Request Logger  → Winston logging
7. Request Timeout → 30s default (configurable)
8. Auth Middleware  → JWT validation (per-route, not global)
```

### Route-Level Middleware

| Middleware | Used On | Purpose |
|---|---|---|
| `protect` | Most authenticated routes | Validates JWT, attaches user |
| `optionalAuth` | Public routes with optional features | Attaches user if available |
| `requireAdmin` | Admin routes | Checks ADMIN/SUPER_ADMIN role |
| `isApprovedMerchant` | Merchant management routes | Checks APPROVED merchant status |
| `isMerchant` | Merchant profile routes | Checks merchant role |
| `isEventOrganizer` | Event management routes | Checks organizer role |
| `verifyEventOwnership` | Event edit/delete routes | Confirms user owns the event |
| `uploadMiddleware` | Media upload routes | Handles multipart file uploads |

---

## 15. Environment Configuration

### Backend Environment Variables

```bash
# Core
DATABASE_URL=postgresql://...          # PostgreSQL connection (Neon)
JWT_SECRET=your-secret-key             # JWT signing key
NODE_ENV=development|production        # Environment mode
PORT=3000                              # Server port

# CORS & Security
ALLOWED_ORIGINS=http://localhost:5173   # Comma-separated allowed origins
LOG_LEVEL=warn                         # Logging level
REQUEST_TIMEOUT_MS=30000               # Request timeout
RATE_LIMIT_WINDOW_MS=900000            # Rate limit window (15 min)
RATE_LIMIT_MAX_REQUESTS=100            # Max requests per window

# Email (SMTP)
EMAIL_ENABLED=true                     # Enable email sending
SMTP_HOST=smtp.gmail.com               # SMTP server
SMTP_PORT=587                          # SMTP port
SMTP_USER=your-email                   # SMTP username
SMTP_PASS=your-password                # SMTP password
EMAIL_FROM_ADDRESS=noreply@yohop.com   # Sender address
EMAIL_FROM_NAME=YOHOP                  # Sender name

# PayPal
PAYPAL_CLIENT_ID=...                   # PayPal app client ID
PAYPAL_SECRET_KEY=...                  # PayPal app secret
PAYPAL_CURRENCY=USD                    # Payment currency

# OAuth
OAUTH_STATE_SECRET=...                 # State encryption secret
GOOGLE_CLIENT_ID=...                   # Google OAuth
GOOGLE_CLIENT_SECRET=...
FACEBOOK_APP_ID=...                    # Facebook OAuth
FACEBOOK_APP_SECRET=...
INSTAGRAM_CLIENT_ID=...                # Instagram OAuth
INSTAGRAM_CLIENT_SECRET=...

# Cloudinary
CLOUDINARY_CLOUD_NAME=...              # Cloudinary account
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Points & Gamification
SIGNUP_POINTS=50                       # Points on signup
CHECKIN_POINTS=10                      # Points per check-in
FIRST_CHECKIN_BONUS_POINTS=25          # First check-in bonus
CHECKIN_RADIUS_METERS=100              # GPS check-in radius
CHECKIN_BYPASS_GEO=false               # Dev: skip GPS validation

# External APIs
SEATGEEK_API_KEY=...                   # SeatGeek event API
TICKETMASTER_API_KEY=...               # Ticketmaster API
GOOGLE_API_KEY=...                     # Google Gemini AI

# Optional
REDIS_URL=redis://...                  # Redis for caching/queues
DISABLE_SCHEDULER=false                # Disable cron jobs
```

### Frontend Environment Variables

```bash
VITE_API_URL=http://localhost:3000/api  # Backend API URL
```

---

## 16. Build, Deploy & Dev Workflow

### Backend

```bash
# Install dependencies
cd backend/GeoLocationMVP-BE
npm install

# Run Prisma migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Start development server
npm run dev                    # Runs on port 3000

# Build for production
npm run build                  # Compiles TS → dist/

# Production start
npm start                      # Runs compiled JS from dist/
```

**Docker (production):**
```bash
docker build -f Dockerfile.prod -t yohop-backend .
docker run -p 3000:3000 --env-file .env yohop-backend
```

### Frontend

```bash
# Install dependencies
cd web
npm install

# Start development server
npm run dev                    # Runs on port 5173

# Build for production
npm run build                  # TypeScript check + Vite build → dist/

# Preview production build
npm run preview

# Run tests
npm run test

# Lint & format
npm run lint
npm run lint:fix
npm run format
```

**Deployment:** Vercel (automatic from git push)
- Config: `web/vercel.json`
- Output: `dist/` directory
- Allowed hosts: `beta1969.yohop.com`, `beta.yohop.com`, `yohop.com`

### Database Management

```bash
# View database in browser
npx prisma studio

# Create migration
npx prisma migrate dev --name migration_name

# Apply migrations (production)
npx prisma migrate deploy

# Reset database (DESTRUCTIVE)
npx prisma migrate reset
```

---

## 17. Feature Summary Matrix

| Feature | Backend | Frontend | Real-time | Payment |
|---|---|---|---|---|
| User Registration & Auth | JWT + Social OAuth | Login/Signup pages | - | - |
| Check-in System | GPS validation | Location permission | Activity feed | - |
| Points & Leaderboard | Point engine + caching | Leaderboard pages | - | - |
| Streaks | Streak calculator | Streak UI | - | - |
| Coins & Tiers | Coin engine + XP | Gamification page | - | PayPal |
| Achievements | Progress tracker | Achievement badges | - | - |
| Heist (PvP) | Full game engine | Heist pages | Socket.io alerts | Coin purchase |
| Deals | CRUD + geo queries | Deal cards + detail | - | - |
| Surprise Deals | Geo-fenced reveals | Surprise discovery | - | - |
| Bounty Deals | Referral tracking | Bounty cards | - | - |
| Events | Full ticketing | Event pages + QR | - | Ticket purchase |
| Table Booking | Slot management | Booking flow | - | - |
| Services | Booking + tiers | Service pages | - | - |
| Venue Rewards | Geo-fence claims | Nearby rewards | - | - |
| Check-in Games | Config + RNG engine | Game UI (scratch/spin/pick) | - | - |
| Kitty Game | Prize pool + guessing | Game pages | - | Entry fee |
| Loyalty Programs | Per-merchant system | Loyalty pages | - | - |
| Nudges | Trigger engine + queue | Toast notifications | Socket.io | - |
| Blog | CRUD + rich content | Blog pages + editor | - | - |
| Menu & Inventory | CRUD + bulk upload | Menu management | - | - |
| AI Content | Gemini integration | AI chat widget | - | - |
| Admin Panel | Analytics + approval | Admin dashboard | Real-time analytics | - |
| Merchant Dashboard | Stats + management | Full merchant portal | - | - |
| Payments | PayPal SDK | PayPal React SDK | - | PayPal |
| Media/Images | Cloudinary upload | Image upload components | - | - |
| Email | SMTP + templates | - | - | - |

---

## Appendix A: API Response Format

All API responses follow this standard format:

```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

On error:
```json
{
  "success": false,
  "data": null,
  "error": "Human-readable error message"
}
```

HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad request / validation error
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient role)
- `404` - Not found
- `429` - Rate limited
- `500` - Internal server error

## Appendix B: Key File Reference

| Purpose | File Path |
|---|---|
| Express App Setup | `backend/GeoLocationMVP-BE/src/app.ts` |
| Server Entry Point | `backend/GeoLocationMVP-BE/src/index.ts` |
| Database Schema | `backend/GeoLocationMVP-BE/prisma/schema.prisma` |
| All Route Files | `backend/GeoLocationMVP-BE/src/routes/*.ts` (35 files) |
| Auth Middleware | `backend/GeoLocationMVP-BE/src/middleware/auth.middleware.ts` |
| Points Logic | `backend/GeoLocationMVP-BE/src/lib/points.ts` |
| Gamification Logic | `backend/GeoLocationMVP-BE/src/lib/gamification.ts` |
| Loyalty Logic | `backend/GeoLocationMVP-BE/src/lib/loyalty.ts` |
| Heist Logic | `backend/GeoLocationMVP-BE/src/lib/heist/` |
| Frontend Entry | `web/src/main.tsx` |
| React App & Routes | `web/src/App.tsx` |
| API Client | `web/src/services/api.ts` |
| Auth Context | `web/src/context/AuthContext.tsx` |
| Custom Hooks | `web/src/hooks/` (90+ files) |
| Global Styles | `web/src/styles/global.css` |
| Tailwind Config | `web/tailwind.config.ts` |
| Vite Config | `web/vite.config.ts` |

---

*This document covers the complete YOHOP platform codebase as of April 2026. For the most current state, always refer to the source code and git history.*
