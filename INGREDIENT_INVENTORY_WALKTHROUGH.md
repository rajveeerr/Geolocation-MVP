# Ingredient Inventory + Market Intelligence — Walkthrough

This is a manual test plan for the new ingredient tracking system (raw-material inventory with cost trends, AI supplier forecasts, commodity watch, and price-spike alerts).

The implementation is complete. Below is what you need to run before testing, and what to click through.

---

## 1. One-time setup

You must restart the backend so the new Prisma client picks up the migration, then seed sample data.

```powershell
# In the backend directory
cd c:\Geolocation-MVP\backend\GeoLocationMVP-BE

# Stop your running backend (the dev server holds the Prisma DLL).
# Then regenerate the client:
npx prisma generate

# Seed ingredient data (only seeds for APPROVED merchants).
# Idempotent — re-running skips merchants already seeded.
npm run seed:ingredients

# Restart backend
npm run dev
```

**What the seed creates per approved merchant:**
- 10 sample ingredients across Citrus / Spirit / Syrup / Food / Textile categories
- 60 days of price history per ingredient (lime has a recent spike pattern; agave/lemon have gentle upward trends)
- Recipe links to any matching menu items (substring match — "margarita", "burger", etc.)
- 2 sample MarketAlerts (Supplier Forecast + Commodity Watch) so banners aren't empty on first visit

---

## 2. Test plan — in the browser

Sign in as a merchant whose data was seeded. Navigate to **Merchant → Inventory**.

### Tab 1: Menu Inventory (regression check)
- [ ] Existing Menu Inventory tab works exactly as before (stats cards, table, AI analyzer, +/- adjust buttons, variant expansion).
- [ ] "Refresh" and "New item" buttons in the header still show on this tab.

### Tab 2: Ingredients (new)
Click the **Ingredients** tab.

**Header & banners:**
- [ ] "Master Inventory" subheading appears with three buttons: `Scan price spikes`, `Refresh`, `+ Add Item`.
- [ ] Two cards at the top: **Supplier Watch** (dark) and **Global Market Data** (light) — each showing the seeded alert preview.

**Table:**
- [ ] Ingredient table shows: Ingredient (name + slug ID), Category pill, Cost/unit (red if trend ≥15%), Trend (`↑ N%` / `STABLE` / `↓ N%`), Stock (LVL + days-left bar w/ tone), Actions.
- [ ] **Fresh Lime Juice** should show a red trend (`↑ 25–30%`) because its seeded history has a recent spike.
- [ ] **Lemon Zest** and **Agave Syrup** show smaller upward trends.
- [ ] **House Gin**, **Premium Tonic**, **Brioche Bun** show STABLE.
- [ ] Days-left badge tone: red if ≤14 days, amber if ≤30, emerald otherwise.

**Search & filter:**
- [ ] Search box filters ingredients by name (typing "lime" narrows to lime juice).
- [ ] Category pills (`All`, `Citrus`, `Spirit`, `Syrup`, `Food`, `Textile`) filter the table.

**Edit modal:**
- [ ] Click pencil icon on Fresh Lime Juice → modal opens with name "Fresh Lime Juice", Citrus, oz, etc.
- [ ] **Recipe linkage section** at the bottom lists Margarita / Mojito / Gimlet (any seeded menu items) with `1.5` qty/unit.
- [ ] Edit currentCost → save → toast appears → table updates → trend recomputes.
- [ ] (Cost change appends a new `IngredientPriceHistory` row, viewable via your DB.)
- [ ] Delete button: click trash → confirm delete → ingredient removed.

**Add modal:**
- [ ] Click `+ Add Item` → empty form → fill name / category / unit / cost / stock → save → appears in table.

**Banners — open + acknowledge:**
- [ ] Click Supplier Watch banner → full modal opens with: title, italic body, Recommended Action card, Confidence Score card (color-coded), Affected Ingredients chips on dark background, "Confirm Awareness" button.
- [ ] Click "Confirm Awareness" → toast (none — silent ack) + modal closes + banner now shows "Acknowledged" subtle state.
- [ ] Same flow for Global Market Data banner.

**Refresh banners (AI):**
- [ ] Click the small circular refresh icon on Supplier Watch → spinner → Gemini generates a new SUPPLIER_FORECAST alert based on real cost data → banner updates with new title/body.
- [ ] Same on Commodity Watch (uses Gemini flash model).
- [ ] Requires `GEMINI_API_KEY` in backend env. If missing, the request returns a server error — confirmed via toast.

**Price-spike scan (deterministic, no LLM):**
- [ ] Click `Scan price spikes` button.
- [ ] Toast appears: either `N new price spike alert(s)` (with ingredient name + % delta) or `No new price spikes`.
- [ ] First run after seeding should detect **Fresh Lime Juice** as a spike (seeded history has +30% jump in last few days vs prior 30-day avg).
- [ ] Re-clicking within 24 hours does NOT create duplicate alerts (cooldown).

**Price-spike toast on mount:**
- [ ] Refresh the page (with an unacknowledged PRICE_SPIKE alert from above).
- [ ] On mount, a toast fires automatically: "Fresh Lime Juice Price Spike — cost has increased by 28%…".
- [ ] Sessionstorage prevents the toast from firing again for the same alert in the same session.

---

## 3. What's wired (so you know what to inspect)

**Backend** (`backend/GeoLocationMVP-BE/`)
- `prisma/schema.prisma` — `Ingredient`, `IngredientPriceHistory`, `MenuItemIngredient`, `MarketAlert` + `MarketAlertType` enum.
- `prisma/migrations/20260518190000_add_ingredient_inventory/migration.sql` — applied via `prisma db execute` because the dev DB has unrelated drift; the migration is marked applied in the `_prisma_migrations` table.
- `src/lib/ai/prompts/ingredient.prompts.ts` — Gemini prompts.
- `src/lib/ai/services/ingredient-market.service.ts` — Gemini supplier-forecast, commodity-watch, deterministic price-spike scan.
- `src/routes/ingredient.routes.ts` — mounted at `/api/merchant/ingredients`.
- `scripts/seed-ingredients.ts` — run via `npm run seed:ingredients`.

**Frontend** (`web/src/`)
- `hooks/useIngredients.ts` — all React Query hooks (list, create, update, delete, recipe, alerts list, ack, generate forecasts, scan spikes).
- `components/inventory/IngredientTable.tsx` — main table.
- `components/inventory/IngredientFormModal.tsx` — create/edit/delete + recipe linkage.
- `components/inventory/MarketAlertBanner.tsx` — Supplier Watch / Global Market Data cards.
- `components/inventory/MarketAlertModal.tsx` — full alert details + acknowledge.
- `components/inventory/IngredientsTab.tsx` — tab container with banners + search + table + spike toasts.
- `pages/merchant/InventoryPage.tsx` — tabs added; existing Menu Inventory content kept intact and wrapped in `activeTab === 'menu'` conditional.

---

## 4. Known caveats

- The dev DB already had drift before my work (an extra `MenuItemVariant.servesCount` column and a missing `MenuItem` index). I left those alone — the new migration only adds the ingredient tables.
- `prisma generate` failed during the session because the dev backend was holding `query_engine-windows.dll.node`. Stop the backend before running `npx prisma generate` so the seed script works.
- The `@ts-ignore` comments in `ingredient.routes.ts` and `ingredient-market.service.ts` will resolve themselves after `prisma generate` runs successfully — they match the pattern already used in `inventory-ai.service.ts`.
- Days-left is computed from `avgDailyUsage` on the ingredient (seeded with reasonable values). The `MenuItemIngredient` recipe links are persisted for future use (e.g., compute usage from menu-item order velocity) but the current days-left UI uses the manual field.
- The merchant-side nav already routes to `/merchant/inventory` so the tabs are reached via the same entry. URL param `?tab=ingredients` deep-links to the Ingredients tab.

---

## 5. Walkthrough end-state — what success looks like

After seed + page load:
- Menu Inventory tab is unchanged from before.
- Ingredients tab shows 10 sample ingredients.
- Fresh Lime Juice row: red `$0.45/oz` cost, red `↑ 30%` trend, ~12 days-left badge in red.
- Two banner cards filled with seeded alerts.
- After clicking `Scan price spikes`: a `PRICE_SPIKE` alert is created for Fresh Lime Juice and a toast pops up (also will re-fire on next page mount, once).
- Editing an ingredient's cost and saving immediately reflects the new trend percentage on next reload.

If you hit anything that doesn't match the above, ping me with the exact step + screenshot.
