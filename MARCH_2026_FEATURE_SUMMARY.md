# March 2026 Feature Summary

This document provides a client-ready summary of the major product work added in March 2026, based on repository commits from `2026-03-01` through `2026-03-31`.

The month was focused on expanding the platform in three major ways:

1. Strengthening the merchant operating experience through onboarding, menu tools, service management, and surprise-based campaigns.
2. Expanding customer-facing discovery and engagement through AI, City Guide, improved check-in rewards, and game-based interactions.
3. Improving internal operations with a stronger admin dashboard, analytics views, approval workflows, and CRM-style customer management.

## Executive Summary

March was a substantial feature month for the platform. The team delivered meaningful progress across merchant tools, customer discovery, engagement mechanics, and internal admin capabilities.

On the merchant side, onboarding was significantly reworked into a more structured and production-ready flow. This was paired with stronger store setup controls, improved media and location handling, more capable menu tooling, and entirely new modules for services and surprises. These changes make it easier for merchants to get onboarded, publish richer storefront information, and manage multiple engagement formats from within one system.

On the customer side, March introduced and improved several discovery and engagement experiences. AI functionality expanded across the product, including an AI City Guide and broader AI-assisted interactions. Check-in became a more rewarding workflow through better reward visibility, lottery support, and new game-based post-check-in experiences.

Operationally, internal teams also received a stronger admin experience. The admin dashboard, analytics, approvals, and customer workflows were redesigned to make the platform easier to monitor and operate as the product grows.

## Monthly Feature Breakdown

### 1. Merchant Onboarding Rebuild

Merchant onboarding was one of the largest areas of work in March.

#### What was added
- A more structured onboarding journey with dedicated screens instead of a flatter, harder-to-manage flow.
- Clearer onboarding stages for business profile, store details, and review/publish.
- Improved store setup coverage for:
  - address and map-based location selection,
  - location search and pin placement,
  - business details and contact details,
  - business hours,
  - features and extras,
  - gallery and media inputs,
  - additional merchant configuration fields such as food truck support.
- Stronger visual and UX behavior in the onboarding layout, especially around scrolling, content visibility, and step progression.
- Better completeness indicators for merchant data, helping highlight whether critical business information has been filled in.
- Updated wording and UI guidance around media uploads, including better support for featured photos and premium video hints.

#### Why this matters
- Reduces friction for merchants during setup.
- Improves the quality and completeness of merchant data entering the platform.
- Creates a more scalable onboarding foundation for future merchant types and richer profile content.
- Makes onboarding feel more polished and closer to a production merchant experience.

### 2. AI Expansion Across the Product

March significantly increased the platform's AI surface area.

#### What was added
- Shared AI support through `useAi`, making AI features easier to integrate into multiple flows.
- Broader AI-powered product behavior across merchant and customer-facing surfaces.
- A dedicated AI chat widget experience.
- Improved AI chat widget layout and responsiveness for a cleaner user experience.
- AI-assisted functionality in merchant-related workflows, including dashboard and business management contexts.

#### Why this matters
- Creates a more differentiated product experience.
- Opens the door for recommendation, guidance, and assistant-style flows across the platform.
- Improves discoverability and decision support for users without requiring them to navigate complex product structure manually.

### 3. AI City Guide Launch

One of the most visible customer-facing launches in March was the AI City Guide.

#### What was added
- A dedicated AI City Guide page.
- Recommendation-driven city exploration inside the app.
- Later enhancements to the City Guide with:
  - location search,
  - map integration,
  - stronger place-based discovery.

#### Why this matters
- Gives customers a more guided way to explore cities, venues, and experiences.
- Makes the platform feel less like a static listings product and more like an intelligent discovery companion.
- Improves the quality of exploration for users who do not already know what they want.

### 4. Admin Dashboard and Analytics Refresh

Internal platform operations also received major attention in March.

#### What was added
- Revamped admin overview and analytics pages.
- UI refreshes for merchant approval and leaderboard-related admin surfaces.
- Better charting and KPI presentation across dashboard experiences.
- New real-time analytics style pages.
- CRM-like customer workflows, including stronger customer management and detail views.
- Broader improvements across admin layout and reporting components.

#### Why this matters
- Gives internal teams better operational visibility as the platform grows.
- Improves monitoring of merchant performance, customer activity, and platform trends.
- Helps support approval workflows, analytics reviews, and higher-touch customer operations.

### 5. Merchant Menu Management Upgrades

March also introduced substantial improvements to menu operations.

#### What was added
- `StandardMenuEditor` for structured menu editing.
- `StoreSelector` for better store-aware menu workflows.
- Expanded menu management support through:
  - menu templates,
  - special menu sections,
  - menu list cards,
  - improved multi-store menu handling.
- Additional merchant menu workflow improvements connected to management pages and related merchant tools.

#### Why this matters
- Makes menu maintenance more practical for merchants.
- Supports better standardization of menu data.
- Improves the platform's ability to support merchants with more complex offerings or multiple store locations.

### 6. Merchant Services Module

March introduced services as a meaningful expansion of the merchant product.

#### What was added
- Merchant service creation and service management pages.
- Merchant-facing service operations views.
- Customer-facing service discovery pages.
- Service detail pages.
- Booking-related history pages.
- Routing and dashboard integration so services feel like part of the core platform rather than an isolated feature.

#### Why this matters
- Expands the platform beyond deals and listings into service-based commerce.
- Creates a stronger foundation for appointment-style, bookable, or service-led merchant businesses.
- Broadens the commercial value of the platform for merchants.

### 7. Merchant Surprises Module

March also introduced surprise-based promotional experiences.

#### What was added
- Merchant surprise creation pages.
- Merchant surprise analytics pages.
- Merchant surprise management pages.
- Customer reveal history pages.
- Supporting route and type infrastructure required for surprise experiences.

#### Why this matters
- Adds a more gamified and curiosity-driven campaign format.
- Creates new engagement mechanics beyond standard deals.
- Gives merchants more creative promotional tools.

### 8. Check-In Rewards, Lottery, and Game Mechanics

March meaningfully deepened the post check-in experience.

#### What was added
- Enhanced check-in flows with clearer reward and lottery entry details.
- Supporting hooks and platform data flows for:
  - venue rewards,
  - rides,
  - delivery,
  - kitty,
  - saved deals,
  - merchant coordinates.
- A check-in lottery layer.
- Post check-in game experiences for customers.
- Merchant-side configuration pages for check-in games.
- Admin-side support for games management.
- Later refinements including:
  - better game type descriptions,
  - improved reward management UI,
  - richer reward input controls,
  - image upload support for reward items.

#### Why this matters
- Makes check-in more valuable and more engaging.
- Increases the platform's ability to reward physical engagement and repeat behavior.
- Adds game mechanics that can improve retention and merchant participation.

### 9. Landing and Discovery Improvements

The customer acquisition and discovery side of the experience also evolved during March.

#### What was added
- Updated landing hero category handling to include events.
- Improved category logic in the landing experience.
- Redesign work around deal-card presentation, including pricing and status visibility.
- Better handling of landing/menu-oriented content presentation.

#### Why this matters
- Improves first impressions for new users.
- Makes more inventory types discoverable from the top of the funnel.
- Creates a stronger bridge between marketing surfaces and deeper product experiences.

## 1-15 Day Breakdown

### March 1-15, 2026

#### Commit coverage
- `ccb9967`, `4f9989e`, `efaed0b` on `2026-03-02`
- `93c3e82`, `e19d8d8`, `c4d3fe7`, `9ec98b1`, `2b91444` on `2026-03-05`
- `4bcdedf`, `00e17c8`, `1c19725`, `9d6557c` on `2026-03-07`
- `06db3ab`, `fb656bc` on `2026-03-11`
- `ae36857`, `4e77569`, `daab1b5`, `45173ec`, `506c695`, `29b04ac`, `785a4d4` on `2026-03-13` and `2026-03-14`

#### Key work delivered in this period

##### Merchant onboarding overhaul
- Rebuilt onboarding into a more guided and structured experience.
- Introduced dedicated screens for business profile, store details, and review/publish.
- Improved media handling, location search, address confirmation, and richer business information capture.
- Added stronger data completeness logic to better support merchant readiness.

##### AI rollout across core surfaces
- Added shared AI hooks and introduced AI-powered experiences into the product.
- Improved the AI chat widget and made the AI layer more reusable.
- Established the foundation for AI-assisted discovery and merchant support.

##### Admin UX refresh
- Upgraded admin overview, analytics, merchant approval, and leaderboard interfaces.
- Improved information hierarchy and visualization across internal tooling.
- Added stronger operational reporting support.

##### Menu, services, and surprises expansion
- Added stronger menu management through editors, templates, selectors, and special sections.
- Launched services management for merchants and service discovery for customers.
- Launched surprises as a new promotional format with merchant creation and analytics flows.

##### Landing and storefront presentation updates
- Improved landing category logic to include events.
- Refined deal-card presentation and pricing/status communication.

#### Business impact of the first half
- Merchants received a much stronger operating foundation.
- Internal teams received more scalable admin tooling.
- The product expanded beyond basic deals into services, surprises, and richer merchant content management.

## 16-31 Day Breakdown

### March 16-31, 2026

#### Commit coverage
- `0ebe01d`, `281d8df` on `2026-03-23`
- `fc633c6`, `66039da`, `01b64c0` on `2026-03-27`
- `e09184b`, `e396f69` on `2026-03-30`

#### Key work delivered in this period

##### AI City Guide launch
- Added a dedicated AI City Guide experience to support recommendation-led exploration.
- Extended the feature with search and map integration to make discovery more useful and location-aware.

##### Check-in value expansion
- Added more explicit reward and lottery details to the check-in flow.
- Strengthened supporting hooks and data sources behind post check-in rewards and utility flows.
- Improved the platform's ability to connect physical engagement with digital rewards.

##### Check-in games launch and refinement
- Added customer-facing post check-in games.
- Added merchant-side configuration and admin-side support for game management.
- Improved reward configuration UX, input handling, descriptions, and reward media support later in the month.

#### Business impact of the second half
- Customer engagement became more dynamic through AI-led discovery and game-based reward mechanics.
- The platform moved closer to a habit-forming engagement model instead of a purely browse-and-view model.
- Merchant campaigns became more configurable and interactive.

## Commit-to-Feature Mapping

### Onboarding and merchant setup
- `ccb9967`
- `4f9989e`
- `efaed0b`
- `93c3e82`
- `00e17c8`
- `1c19725`
- `9d6557c`

Primary outcome:
Major merchant onboarding rebuild, better location and address handling, stronger business data capture, better completeness indicators, and improved media guidance.

### AI and smart discovery
- `c4d3fe7`
- `9ec98b1`
- `0ebe01d`
- `281d8df`
- `e19d8d8`

Primary outcome:
Shared AI infrastructure, improved AI chat UX, AI City Guide launch, map-based city exploration, and stronger top-of-funnel discovery.

### Admin platform improvements
- `06db3ab`
- `daab1b5`

Primary outcome:
Redesigned admin dashboards, analytics, merchant approvals, customer views, and real-time operational tooling.

### Merchant commerce and experience tooling
- `ae36857`
- `45173ec`
- `506c695`

Primary outcome:
Stronger menu operations plus new services and surprises modules for both merchant management and customer-facing discovery.

### Check-in ecosystem
- `fc633c6`
- `66039da`
- `01b64c0`
- `e09184b`
- `e396f69`

Primary outcome:
Richer check-in rewards, lottery support, game-based engagement, merchant reward configuration, and improved reward asset management.

## Suggested Client Summary

If you want a short version to share in an email or status note, this is the clearest summary:

In March 2026, the platform made major progress across merchant operations, customer engagement, and internal admin tooling. We significantly upgraded merchant onboarding, launched new merchant modules for services and surprises, improved menu management, expanded AI capabilities with the new AI City Guide, and introduced richer check-in rewards with lottery and post check-in game mechanics. In parallel, we refreshed the admin dashboard and analytics experience to better support operational visibility and scale.

## Notes

- This summary is based on commit history and affected files, not a full manual QA review of every screen.
- Merge commits were used as supporting context, while the feature descriptions were based mainly on the underlying implementation commits.
