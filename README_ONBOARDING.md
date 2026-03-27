# 🗺️ Geolocation MVP - Technical Onboarding Guide

Welcome to the **Geolocation MVP** repository! This document is designed to give remote engineers a high-level overview of the architecture, tech stack, domain features, and setup instructions so you can start contributing without hurdles.

## 📌 1. Project Overview
Geolocation MVP is a feature-rich, full-stack application connecting users with local merchants through location-based deals, events, table bookings, and delivery services. 

What sets this platform apart is its **heavy focus on gamification**. It features sophisticated systems like `Heists`, `Bounties`, `Kitty Games`, `Surprises`, `Streaks`, and `Leaderboards` designed to drive real-world user engagement and check-ins at business locations. 

---

## 🏗️ 2. High-Level Architecture & Tech Stack

The repository is structured as a monolithic repository containing two main decoupled projects:
- `/web`: The React Frontend (Client SPA)
- `/backend/GeoLocationMVP-BE`: The Node.js Express API (Backend Server)

### 💻 Frontend Stack (`/web`)
*   **Core Framework:** React 18 powered by Vite.
*   **Language:** TypeScript (Strictly typed).
*   **Styling:** Tailwind CSS integrated with Radix UI primitives (component-based design system).
*   **API & State Management:** `@tanstack/react-query` for asynchronous API state management/caching.
*   **Integrations:** `@paypal/react-paypal-js` for payment handling.
*   **Key Directories:**
    *   `src/components`: Reusable UI elements (buttons, modals, dialogs).
    *   `src/pages`: Top-level route pages (e.g., `CityGuidePage.tsx`, `HeistHistoryPage.tsx`, `MerchantDashboard`).
    *   `src/hooks`: Custom React hooks, heavily wrapping React Query for API calls (e.g., `useTableBooking.ts`, `useEnhancedLeaderboard.ts`).
    *   `src/services`: API handlers/Axios instances orchestrating communication with the backend.

### ⚙️ Backend Stack (`/backend/GeoLocationMVP-BE`)
*   **Core Framework:** Node.js + Express 5.x.
*   **Language:** TypeScript.
*   **Database ORM:** Prisma ORM (`@prisma/client` 6.x) connected to the primary relational database.
*   **Real-time Communication:** `socket.io` for live updates, notifications, and gamification events.
*   **Queues & Background Jobs:** `bull` and `ioredis` for robust background processing, combined with `node-cron` for scheduled cron jobs.
*   **Authentication & Security:** JWT (`jsonwebtoken`), `bcryptjs`, and `helmet`.
*   **Media Management:** `multer` & `cloudinary` for handling merchant/user image uploads.
*   **AI Integration:** `@google/generative-ai` integrated for dynamic platform features.
*   **Key Directories:**
    *   `src/routes`: Express route definitions split by domain (e.g., `heist.routes.ts`, `deals.public.routes.ts`, `admin.routes.ts`).
    *   `src/services`: Heavily abstracted business logic for the routes.
    *   `src/jobs`: Defined cron scheduled scripts (`checkNudges.ts`, `monthlyReset.ts`).
    *   `prisma/schema.prisma`: The single source of truth for the entire database schema!

---

## 🧩 3. Core Domain Models & Features (Prisma Schema Highlights)

The backend relies on an extensive data model to manage the platform's features. Here are the primary domain segments you should be aware of:

| Domain | Key Data Models | Goal |
| :--- | :--- | :--- |
| **Auth & Profiles** | `User`, `Merchant`, `SocialAccount` | Manages role-based access (Admin, User, Merchant) and onboarding. |
| **Locations & Stores** | `City`, `Store`, `MerchantVerification` | Geolocation data linking merchants to physical addresses. |
| **Commerce & Booking** | `Deal`, `Order`, `Table`, `Booking`, `Service` | Facilitates table reservations, service bookings (ride/delivery), and promotional merchant deals. |
| **Gamification** | `Heist`, `HeistToken`, `KittyGame`, `Nudge`, `Achievement` | The core engagement loop. Users earn digital tokens and achievements by hitting milestones/locations. |
| **Loyalty & Rewards** | `LoyaltyTierConfig`, `UserMerchantLoyalty`, `CoinTransaction` | Merchant-specific or Global progression trackers. |
| **Events** | `Event`, `EventTicket`, `EventCheckIn` | Platform or Merchant-hosted ticketed events. |

---

## 🚀 4. Local Development Setup

### Prerequisites
*   Node.js (v18+ recommended)
*   Redis (Required locally for `bull` queues and `ioredis`)
*   PostgreSQL / MySQL (check project environment variables for the selected Prisma provider)

### Step 1: Running the Backend
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend/GeoLocationMVP-BE
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Copy `.env.production.example` (or similar `.env.example` if present) to `.env` and configure your database connection string, JWT secrets, and API keys (Cloudinary, Redis, Google AI).
4. Run Database Migrations & Seeds (Prisma):
   ```bash
   npx prisma generate
   npx prisma migrate dev
   npm run db:ensure-and-seed-cities  # Run standard platform seeds
   npm run seed:all                   # Run all dummy data (optional)
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```
   *The backend should default to `http://localhost:5000` (or specified PORT).*

### Step 2: Running the Frontend
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd web
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Establish Environment Variables (usually a `.env` file containing `VITE_API_URL=http://localhost:5000/api`).
4. Start the Vite dev server:
   ```bash
   npm run dev
   ```
   *The frontend will be accessible at `http://localhost:5173`.*

---

## 🛠️ 5. Development Principles & Gotchas for the Team

* **Strict Route/Service Separation:** The backend adheres strictly to keeping HTTP request/response logic inside `routes` (and implicitly controllers) while the heavy lifting and DB interactions happen inside `src/services/`. Do not bloat routes with Prisma queries.
* **React Query For All Data Fetching:** On the frontend, avoid standard `useEffect` + `fetch` structures. Use tailored custom hooks that wrap `useQuery` or `useMutation` (e.g., `useTableBooking.ts`). This ensures API cache invalidation stays consistent.
* **Check Markdown Docs:** This repository is heavily documented. If you are picking up a specific domain, check the root folder for strategy files:
   - `ADMIN_BACKEND_REQUIREMENTS.md`
   - `DEAL_TYPES_IMPLEMENTATION_PLAN.md`
   - `EVENT_SYSTEM_FRONTEND_FLOW.md`
   - `HEIST_FEATURE_TESTING_GUIDE.md`
* **Tailwind & Radix UI Component Approach:** We compose complex front-end UI using Radix primitives. If you need a new UI element, check `/components` or `components.json` before building from scratch to avoid duplicating UI components.
* **WebSockets for Gamification:** If you are touching `Heists`, `Bounties`, or `Kitty Games`, ensure you trigger or listen to `socket.io` events so that local clients get instant push notifications of their interactions.
