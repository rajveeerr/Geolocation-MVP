# Website Features Overview

> A complete overview of the platform ,  what it is, everything it can do across the customer,
> merchant, and admin experiences, how to try it, and the technology behind it.

---

## 1. The Product in One Line

A **geolocation-based local deals, loyalty, and experiences platform** ,  customers discover nearby
deals, events, and services on a live map; check in at venues to earn rewards; and businesses run
their entire promotional, loyalty, gamification, and operations engine from a single dashboard.

Think "the local-commerce operating system" that sits between a city's small businesses and the
people standing a few blocks away from them.

---

## 2. The Three Sides of the Platform

Three connected applications sharing one backend:

| Side | Who it's for | What it does |
|---|---|---|
| **Customer App** | Everyday consumers | Discover & redeem deals, check in, earn loyalty/points, buy event tickets, book services & tables, order catering, play games |
| **Merchant Dashboard** | Local business owners | Create every type of deal, manage menus/stores/events/services, run loyalty & referral programs, configure games, track inventory & costs, see analytics |
| **Admin Console** | Platform operators | Approve merchants, manage cities, oversee customers, configure nudges & games, watch real-time analytics |

---

## 3. By the Numbers

A quick sense of the scale of the platform:

| | |
|---|---|
| **Customer-facing pages** | ~50 |
| **Merchant dashboard pages** | 54 |
| **Admin console pages** | 15 |
| **Backend API route groups** | 40+ |
| **Database models** | ~60 |
| **Deal types** | 6 |
| **Engagement games** | 4 (Heist, Kitty, Check-in games, Check-in lottery) |
| **User roles** | 7 (User, Merchant, Admin, Event Organizer, Vendor, Event Owner, Super Admin) |
| **Loyalty tiers** | 5 (Bronze → Diamond) |
| **AI-assisted features** | 10 (Gemini-powered) |
| **Live cities (demo data)** | 5 ,  Chicago, Houston, Washington DC, Philadelphia, New Orleans |

---

## 4. Try It Yourself

**Live site:** **[add URL]**

All demo accounts use the same password: **`Test@1234`**

| Role | Login (email) | What it showcases |
|---|---|---|
| **Customer** | `alex@test.com` | Full consumer experience ,  map, deals, check-ins, loyalty, games (Silver tier, has points/coins) |
| Customer (Gold tier) | `james@test.com` | Higher-tier loyalty experience |
| Customer (new user) | `priya@test.com` | First-time / empty-state experience |
| **Admin** | `admin@test.com` | Platform console ,  log in at `/admin/login` |
| **Event Organizer** | `organizer@test.com` | Event creation & ticketing |

**Merchant logins** ,  the 5-city dataset is loaded (42 businesses across Chicago, Houston,
Washington DC, Philadelphia, New Orleans). Each business has its own merchant login following the
pattern `<business-slug>@biz.test` (same password, `Test@1234`). A few per city:

| City | Business | Login (email) |
|---|---|---|
| Chicago | Lou Malnati's Pizzeria | `lou-malnati-s-pizzeria@biz.test` |
| Houston | Uchi Houston | `uchi-houston@biz.test` |
| Washington, DC | Dukem Ethiopian | `dukem-ethiopian@biz.test` |
| Philadelphia | Rittenhouse Grill | `rittenhouse-grill@biz.test` |
| New Orleans | Commander's Palace | `commander-s-palace@biz.test` |

---

## 5. Full Feature Catalog

### 5.1 Customer App

**Discovery**
- Live **map view** with geolocation ,  deals/venues near you, distance-ranked
- Home feed, **All Deals** browse, **featured deals** (ranked by type, urgency, discount), category browse, **City Guide** per market
- Search & filtering by category, deal type, location radius, and city

**Deals ,  six distinct types**, each with real mechanics:
- **Standard** ,  percentage or fixed-dollar discount, active within a time window
- **Happy Hour** ,  time-boxed daily specials tied to menu items (prioritized in the featured feed)
- **Bounty / Kickback** ,  customer earns a cash reward after a set number of referrals; QR-verified; pays out on completion
- **Hidden / VIP** ,  secret deals unlocked only by access code, link, or QR (never shown in normal browsing)
- **Redeem Now** ,  flash sales with redemption caps
- **Recurring** ,  repeats on specific weekdays (e.g. Taco Tuesday), auto-shown only on those days
- Deal detail pages with social proof (saves, recent check-ins), saved deals, share tracking, claim & redeem

**Geolocation Check-in & Rewards**
- **GPS check-in** validated within a **100m radius** of the venue (food trucks use a 200m radius and live schedule resolution)
- Earns **10 points** per check-in, plus a **+25 bonus** on a deal's first check-in (35 total)
- One check-in can simultaneously trigger: streak update, referral attribution, venue-reward eligibility, lottery entry, and a check-in game

**Engagement Games** (see §6 for full mechanics)
- **Check-in games** ,  scratch card / spin wheel / pick-a-card with weighted-probability rewards
- **Check-in lottery** ,  auto-entry on check-in, single random winner drawn at a cutoff
- **Heist** ,  token-fueled head-to-head where users "rob" each other's monthly points (with Sword/Hammer/Shield items)
- **Kitty** ,  closest-guess pot game (pay coins to guess a secret number, closest wins the prize pool)
- **Streaks** ,  consecutive-week check-ins unlock escalating discounts (10% → 45%)

**Surprises**
- Surprise deal **reveals** (radius- and time-gated mystery discounts) and reveal history

**Events & Tickets**
- Discover events (Party, Bar Crawl, Sports Tournament, Festival, RSVP, etc.), event detail
- **Buy tickets** across tiers (General, VIP, Premium, Early Bird, All-Access, Day Pass) with service fees, taxes, per-order/per-user caps, and presale codes
- **Add-ons** (parking, merch, upgrades), **RSVP & waitlist** flow, **QR check-in** at the door, ticket transfer & refunds, "My Tickets"
- **Geo-targeted event promotion** ,  notify nearby users based on location + recent activity

**Services & Bookings**
- Discover services, service detail, **book** with pricing tiers & add-ons, QR-coded confirmations, configurable advance-booking & cancellation windows, "My Bookings"

**Table Booking**
- Reserve a table by date / time slot / party size, with per-merchant booking policies (auto-confirm, reminders, cancellation windows)

**Catering**
- Browse a merchant's catering menu, build an order with **per-person or fixed pricing** and customizable options/choices, track orders; order snapshots preserve historical pricing

**Food Trucks**
- Find food trucks live now vs. upcoming, with their **scheduled stops** (location + time window) on the map

**Loyalty**
- Loyalty wallet with **points, coins, and 5 tiers** (Bronze → Silver → Gold → Platinum → Diamond)
- **Per-merchant loyalty programs** ,  each business sets its own earn rate, redemption minimums, and reward value; tiered redemption options; full transaction history

**Gamification & Profile**
- XP, coins, **achievements** (first purchase, spending milestones, streaks, referrals, loyalty tier, etc.)
- Leaderboards: global, comprehensive, and streak; **coin store** (buy coins)
- Profile, edit, settings, referral page with shareable referral code

**Referrals**
- Refer friends (unique 8-char code), earn referral bonuses (**100 points** + a Heist token), tracked attribution per merchant program

**Nudges & Notifications**
- Smart **nudges** ,  inactivity, streak-at-risk, happy-hour-starting-soon ,  with per-user preferences and quiet hours
- Notification center with real-time delivery
- *Roadmap:* nearby-deal and weather-based nudges

**Account & Payments**
- **PayPal checkout** for coins, tickets, add-ons, and prepay; success/cancel handling; full payment transaction ledger

### 5.2 Merchant Dashboard

**Onboarding & Business**
- Merchant onboarding (with optional **AI-assisted profile generation**), business profile
- **Multi-store management** (a business can have many locations across cities)
- **Merchant verification** workflow (identity, business license, address, tax docs) for trusted status

**Dashboard & Daily Ops**
- "Today" operational view + enhanced dashboard with KPIs, check-in/loyalty/storefront activity

**Deal Creation** ,  dedicated builders for:
- Standard, Daily/Recurring, Redeem-Now, **Bounty**, **Hidden**, **BOGO**, and a **Happy Hour editor**
- **AI deal generator** ,  describe the intent, get a drafted deal

**Menu Management**
- Menu items with **variants/SKUs**, optional inventory tracking & backorder, **happy-hour pricing**, bulk/catering options
- **Menu collections** (curated, time-boxed groupings ,  lunch specials, happy hour, special-event menus)

**Catering Management**
- Catering items with required/optional choice groups & price modifiers, incoming **orders** & order detail

**Events Management**
- Create & manage events, ticket tiers, add-ons, waitlist, and **door check-in**

**Services Management**
- Create & manage services, pricing tiers, add-ons, and **service check-in**

**Surprises & Venue Rewards**
- Create surprise deals + **surprise analytics**
- **Geofenced venue rewards** ,  location-triggered rewards (coins/discount/points/free item) with GPS or QR verification, claim caps, cooldowns, and birthday/first-visit conditions

**Check-in Games**
- Configure scratch/spin/pick-a-card games ,  reward types, **probability weights**, win caps, cooldowns, session/reward expiry, presets

**Loyalty & Membership**
- Loyalty program setup (earn rate, redemption value, expiry rules), **membership tiers**, customer balances, manual point adjustments, loyalty analytics

**Referrals & Kickbacks**
- Referral program management (rewards for referrer & referred, per-user caps, expiry), **kickback earnings** tracking, referrer leaderboard

**Inventory & Cost Intelligence**
- **Ingredient inventory** with price history, recipe/BOM links to menu items, and **auto-computed days-of-stock-left** from real order velocity
- **Operating costs** (11 categories, 6 frequencies) with break-even math, **staff/labor** cost modeling, and a cost-category breakdown
- **Market price alerts** ,  supplier forecasts, commodity watch, and price-spike detection (AI-assisted)

**Analytics & Content**
- Merchant analytics, calendar, messages
- **Blog** content marketing (posts, categories, publish/unpublish) with **AI content generation**

### 5.3 Admin Console

- Overview dashboard, analytics dashboard, **real-time analytics**
- **Merchant approval** workflow (Pending → Approved / Rejected / Suspended)
- **City management** ,  turn cities on/off, bulk-update, per-city store/merchant stats + city analytics
- **Performance analytics** ,  gross sales, order volume, average order value, with period-over-period change; top merchants / stores / cities; weekly charts
- **Customer management / CRM** (list, detail, CRM view)
- **Nudges management** ,  create/configure the smart-notification engine, force-send tests, engagement analytics
- **Games management** and platform leaderboard

---

## 6. Engagement & Gamification Deep-Dive

A core differentiator ,  the mechanics in detail:

**Points & coins economy**
- Signup: **50 points**. Check-in: **10 points** (+**25** first-time bonus). Referral: **100 points**.
- Coins are a separate currency (earned, bought, or won in games) used for game entry, the coin store, and Heist items.
- **Monthly points** reset to 0 on the 1st of each month ,  this is the pool the Heist game competes over.

**Loyalty tiers** (based on total spend, with coin-earn multipliers):

| Tier | Spend threshold | Coin multiplier |
|---|---|---|
| Bronze | $0 | 1.0× |
| Silver | $50 | 1.2× |
| Gold | $150 | 1.5× |
| Platinum | $300 | 1.8× |
| Diamond | $500 | 2.0× |

**Streaks** ,  consecutive weeks with a check-in unlock escalating discounts: Week 1 = 10%, +5% per week, capped at **45%** (week 7+). Miss a week and it resets.

**Check-in games** ,  on check-in, the user plays a scratch card (6 slots), spin wheel (6 slots), or pick-a-card (3 cards). Rewards are chosen by **weighted probability** (e.g. 5% off @ weight 40, 10% off @ 30, coins @ 20, free item @ 10) and issued with a unique claim code and expiry.

**Check-in lottery** ,  checking in during an active window auto-enters a single-winner draw (cash/coins/free reward).

**Heist** ,  spend a token to "rob" another user's monthly points. Outcome is modified by purchasable items: **Sword/Hammer** (attacker, increase steal), **Shield** (defender, reduce/block). Cooldowns, shields, and minimum-points checks prevent abuse; both sides get notifications.

**Kitty** ,  a merchant-run pot game: pay a coin entry fee to guess a secret number (1–1000); the prize pool grows with entries; closest guess wins it all; auto-refunds if minimum players isn't met.

---

## 7. Business-Logic Reference

Concrete, coded values:

- **Check-in radius:** 100m (fixed venues), 200m (food trucks), GPS-verified via Haversine distance.
- **Loyalty earn:** default 0.4 points per dollar; default redemption 25 points = $5 off (merchant-configurable).
- **Bounty payout:** completing a bounty credits coins at `bountyRewardAmount × 10`.
- **Achievements:** award coins + XP on completion (e.g. first check-in, $50/$150 spend milestones, 5-in-a-week streak, 3 referrals, reaching Gold).
- **Payments:** PayPal intent → capture flow, $10,000 per-transaction cap, full ledger with purpose tagging (coins, tickets, add-ons, prepay).
- **Background jobs:** nudge checks (hourly / every 15 min), birthday emails (daily midnight UTC), monthly points reset (1st of month).

---

## 8. Guided Tour

A 10–15 minute walkthrough that shows the whole loop:

1. **Open the site** → land on the home/map. Deals appear across the 5 cities, distance-ranked.
2. **Log in as a customer** (`alex@test.com` / `Test@1234`).
   - Browse the **map**, open a **deal detail**, save a deal.
   - Open a **Hidden deal** and show the code/QR unlock.
   - Show the **loyalty wallet** (points, coins, tier), a **check-in game**, and the **leaderboard**.
   - Peek at a **game** (Heist or Kitty) to show the engagement layer.
3. **Log in as a merchant** (e.g. `lou-malnati-s-pizzeria@biz.test` / `Test@1234`).
   - Show the **dashboard / Today view**.
   - **Create a deal** (e.g. a Happy Hour) ,  and try the **AI deal generator** to show speed.
   - Open **menu management**, **loyalty setup**, **inventory & operating costs**, and **analytics**.
4. **Log in as admin** (`admin@test.com` at `/admin/login`).
   - Show **merchant approval**, **city management**, and **real-time / performance analytics**.
5. **Close** on the breadth: one platform covering deals + events + services + tables + catering + loyalty + a full gamification stack ,  plus merchant-side ops tools (inventory, costs, AI).

---

## 9. Technology & Architecture

**Frontend:** React 19, TypeScript, Vite, TanStack Query, Tailwind CSS, Radix UI, Leaflet (maps),
Recharts (charts), socket.io (real-time), React Router 7.

**Backend:** Node.js + Express 5, **Prisma ORM** over **PostgreSQL**, **Redis** (caching, lottery state,
cooldown locks) + queue workers, **socket.io** (real-time notifications), JWT auth + OAuth, scheduled
cron jobs. ~60 data models spanning deals, merchants, loyalty, events, services, catering, inventory,
gamification, and analytics.

**Security:** bcrypt-hashed passwords, JWT (24h expiry), role-based access middleware
(approved-merchant / admin gates), email verification, rate limiting, Helmet.

**AI suite (Google Gemini)** ,  10 assists: merchant onboarding suggestions, merchant insights, deal
generator, chatbot/receptionist, city-guide recommendations, nudge copy, menu suggestions, inventory
analysis, blog content, and operating-cost analysis.

**Built-in integrations:**

| Integration | Purpose |
|---|---|
| PayPal | Payments / checkout |
| Cloudinary | Image hosting & upload |
| Google Gemini | AI features (10) |
| Email (SMTP) | Transactional email |
| QR codes | Hidden deals, tickets, check-in, rewards |

**Available connectors (optional, configurable):** Ticketmaster / SeatGeek event feeds,
UberEats / DoorDash delivery quotes, Uber / Lyft ride estimates, and social sign-in
(Google / Facebook / Instagram).

---

## 10. Glossary

- **Deal types:** Standard, Happy Hour, Bounty (refer-a-friend cashback), Hidden (VIP code/QR),
  Redeem Now (flash), Recurring (repeats on set days).
- **Check-in:** GPS-verified visit to a venue (100m radius) that earns points and can trigger games/rewards.
- **Kickback:** the cash-back a customer earns from a Bounty deal when their referrals convert.
- **Heist:** the token-fueled mini-game where users compete over monthly points.
- **Kitty:** the closest-guess pot game where coin entries build a prize pool for one winner.
- **Venue reward:** a geofenced, location-triggered reward claimed by being at (or scanning a QR at) a venue.
- **Nudge:** an automated, condition-triggered notification (inactivity, streak, happy hour, nearby).
- **Loyalty tiers:** Bronze → Silver → Gold → Platinum → Diamond, driven by total spend, with coin multipliers.
