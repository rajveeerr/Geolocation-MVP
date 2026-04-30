# April 2026 Feature Summary

This document summarizes the product-facing work added in April 2026 based on git commits from `2026-04-01` through `2026-04-30`.

Current status: only three commits exist for April so far, and all of them landed on `2026-04-01`.

## Monthly Overview

### Features and improvements added this month

1. Merchant dashboard received a major UI refresh.
   - Cleaner control-center style layout for merchants.
   - Stronger dashboard structure for storefront, campaign, and customer activity visibility.
   - Better presentation of KPI, check-in, loyalty, and store-related information.

2. Merchant check-in games became more configurable.
   - Added enhanced reward configuration flows.
   - Added preset-based game setups for faster merchant onboarding.
   - Improved support for reward types like percentage discounts, fixed discounts, coins, bonus points, and free items.
   - Improved preview and editing flow for game variants such as scratch card, spin wheel, and pick-a-card.

3. Merchant layout and navigation were reworked.
   - Sidebar and section grouping were improved across merchant surfaces.
   - Navigation became more structured across overview, commerce, and experience-related areas.
   - Page titles and subtitles were standardized to make the merchant product feel more cohesive.

4. Merchant experience pages were visually standardized.
   - Multiple merchant pages were restyled for better consistency.
   - Buttons, spacing, card treatments, and page-level layouts were aligned.
   - Supporting pages like stores, events, services, surprises, kickbacks, and analytics were brought closer to one shared design system.

## 1-15 Day Breakdown

### April 1-15, 2026

#### Commit coverage
- `caa301c` on `2026-04-01`
- `aa7a26f` on `2026-04-01`
- `c62cc29` on `2026-04-01`

#### Features added

##### 1. Enhanced Merchant Dashboard
- Refreshed the merchant dashboard with a more polished, premium UI.
- Expanded the dashboard into a clearer operating hub for deals, stores, loyalty, and check-in performance.
- Improved visibility into merchant activity through better organization of dashboard content and supporting widgets.

##### 2. Enhanced Check-In Games Configuration
- Upgraded the merchant check-in games page.
- Added richer reward configuration support so merchants can define more tailored reward setups.
- Added reusable game presets to speed up setup for common reward strategies.
- Improved merchant control over reward expiry, cooldown, game type, and reward probability weighting.

##### 3. Merchant Navigation and Layout Refresh
- Reworked `MerchantLayout` to provide clearer merchant navigation.
- Organized merchant routes into grouped sections like overview, commerce, and experiences.
- Improved the discoverability of major merchant actions such as deals, stores, services, events, surprises, loyalty, and check-in games.

##### 4. Shared Merchant Design System Improvements
- Added shared merchant UI building blocks to support a more consistent look and feel.
- Introduced reusable merchant page intro, meta card, segmented control, and state components.
- Helped normalize presentation patterns across merchant pages.

##### 5. Cross-Page Merchant UI Cleanup
- Applied design consistency improvements across several merchant-facing pages.
- Tightened button styling and page spacing.
- Reduced layout mismatch between individual merchant tools such as analytics, services, events, store management, and surprise flows.

### April 16-30, 2026

No commits were found for this date range yet.

## Commit-to-Feature Mapping

### `caa301c` - `feat: update Merchant Dashboard and Check-In Games pages with enhanced UI and reward configurations`
- Primary feature commit for dashboard UI enhancement.
- Primary feature commit for check-in game reward configuration improvements.

### `aa7a26f` - `refactor: update styling and layout for merchant pages`
- Large merchant UX refinement pass across layout, analytics, dashboard, deals, events, services, surprises, and store management.
- Added stronger shared visual patterns for the merchant product.

### `c62cc29` - `fix: improve button styling and layout consistency across merchant pages`
- Follow-up polish pass.
- Improved button behavior and layout consistency on merchant utility and management pages.

## Notes

- This summary is based on commit history and touched files, not a manual QA pass of every screen.
- Since all current April commits landed on `2026-04-01`, the second half-of-month section is intentionally empty for now.
