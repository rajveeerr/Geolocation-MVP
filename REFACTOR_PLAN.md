# Deal Hunt — Refactor Plan

> **Goal:** Migrate every page and component to the new design system tokens so that changing a single CSS variable propagates everywhere. Eliminate all hard-coded hex colours, inconsistent radii, and ad-hoc shadows.

---

## Priority Legend

| Priority | Meaning |
|----------|---------|
| 🔴 P0 | Breaks visual consistency — fix first |
| 🟡 P1 | High-impact, user-facing pages |
| 🟢 P2 | Lower traffic or admin pages |
| ⚪ P3 | Cleanup / nice-to-have |

---

## Phase 1 — Token Adoption (Global Search-Replace) 🔴

These are mechanical replacements that can be done safely with find-and-replace across the codebase.

### 1.1 Replace `#8B1A1A` → Token

**~40 occurrences** of the deprecated dark red hex.

| Find | Replace with | Notes |
|------|-------------|-------|
| `bg-[#8B1A1A]` | `bg-brand-700` | Background fills |
| `text-[#8B1A1A]` | `text-brand-700` | Text colour |
| `border-[#8B1A1A]` | `border-brand-700` | Borders |
| `from-[#8B1A1A]` | `from-brand-700` | Gradient stops |
| `#8B1A1A` (inline styles) | `hsl(var(--brand-700))` | Rare inline cases |

### 1.2 Replace `#B91C1C` → Token

**~19 occurrences.**

| Find | Replace with |
|------|-------------|
| `bg-[#B91C1C]` | `bg-brand` or `bg-brand-600` |
| `text-[#B91C1C]` | `text-brand` |
| `border-[#B91C1C]` | `border-brand` |
| `#B91C1C` (inline styles) | `hsl(var(--brand-primary))` |

### 1.3 Replace `#1a1a2e` → Token

**~17 occurrences** of the dark surface hex.

| Find | Replace with |
|------|-------------|
| `bg-[#1a1a2e]` | `bg-surface-dark` |
| `from-[#1a1a2e]` | `from-surface-dark` |
| `to-[#1a1a2e]` | `to-surface-dark` |
| `#1a1a2e` (inline styles) | `hsl(var(--surface-dark))` |

### 1.4 Other Hard-coded Hex Values

Search for remaining `#[0-9a-fA-F]{6}` and `#[0-9a-fA-F]{3}` patterns in `.tsx` files. Map each to the nearest token or add a new semantic token if genuinely needed.

Common ones to watch for:
- `#16162a` → `bg-surface-dark-alt`
- `#2a2a4a` → `bg-surface-dark-muted`
- `#FEF2F2` → `bg-brand-subtle`

---

## Phase 2 — Typography Consistency 🟡

### 2.1 Remove Lora Font Import

In `global.css`, the Google Fonts import already excludes Lora. Verify no component references `font-serif` or `Lora`.

### 2.2 Enforce `font-heading` on Headings

Headings already get `font-family: var(--font-heading)` via base styles. Remove any manual `font-['Poppins']` or `font-poppins` overrides in components.

### 2.3 Replace Arbitrary Text Sizes

| Find | Replace |
|------|---------|
| `text-[22px]` | `text-xl` (20px) or `text-2xl` (24px) |
| `text-[13px]` | `text-xs` (12px) or `text-sm` (14px) |
| `text-[11px]` | `text-xs` |
| `text-[10px]` | `text-xs` |
| `text-[8px]` | `text-xs` with reduced leading |
| `text-[7px]` | `text-xs` with reduced leading |

---

## Phase 3 — Shadow & Radius Consistency 🟡

### 3.1 Standardize Card Shadows

Replace inline shadow values with tokens:

```tsx
// Before
className="shadow-lg hover:shadow-2xl transition-shadow"

// After
className="shadow-card hover:shadow-card-hover transition-shadow duration-300"
```

### 3.2 Standardize Card Radii

The codebase mixes `rounded-lg`, `rounded-xl`, `rounded-2xl`, and `rounded-[1.25rem]` on cards.

**Decision:** Use `rounded-xl` for standard content cards, `rounded-2xl` for deal/feature cards.

| Component Type | Target Radius |
|----------------|---------------|
| shadcn Card | `rounded-xl` (already) |
| Deal card (NewDealCard) | `rounded-2xl` |
| Form section card | `rounded-lg` |
| Modal content | `rounded-2xl` |
| Badges | `rounded-full` |
| Buttons (custom) | `rounded-full` |
| Inputs | `rounded-md` |

Replace `rounded-[1.25rem]` → `rounded-2xl` (= 24px, close enough to 20px; alternatively use `rounded-dh-xl` = 20px for exact match).

---

## Phase 4 — Button Consolidation 🟡

### Current State

Two button components with different APIs:
- `ui/button.tsx` — shadcn, `variant` + `size` via cva, `rounded-md`
- `common/Button.tsx` — custom, gradient fills, `rounded-full`, icon support

### Plan

1. **Keep both** but define clear ownership:
   - `common/Button.tsx` → Rename to `BrandButton.tsx` (or keep as is). Use for **all user-facing CTAs**.
   - `ui/button.tsx` → Use for **admin panels, dialogs, and structural UI**.

2. **Align `common/Button.tsx`** to use design tokens:
   - Replace `from-brand-primary-400 to-brand-primary-600` → `from-brand-400 to-brand-600`
   - Replace `border-brand-primary-200` → `border-brand-200`
   - Replace `ring-brand-primary-main/50` → `ring-brand/50`
   - Replace `bg-gradient-to-b from-white to-neutral-50` → (keep, uses Tailwind native neutral)

3. **Audit all button usage** — ensure no page uses both button components inconsistently.

---

## Phase 5 — Page-by-Page Migration 🟡

### 5.1 Landing Page (`HomePage.tsx`)

- [ ] Replace hard-coded hex on deal badges
- [ ] Verify `NewDealCard` uses `shadow-card` / `shadow-card-hover`
- [ ] Ensure section headers use `font-heading`
- [ ] Replace any `accent-orange` references

### 5.2 Deal Detail Page (`DealDetailPage.tsx`)

- [ ] Replace `#1a1a2e` backgrounds → `bg-surface-dark`
- [ ] Replace `#8B1A1A` on countdown badges → `bg-brand-700`
- [ ] Migrate BountyEarnCard to use `.card-dark` utility
- [ ] Ensure ImageSlideshow uses design tokens

### 5.3 Auth Pages (`LoginPage.tsx`, `SignUpPage.tsx`)

- [ ] Replace hard-coded gradient colours with brand tokens
- [ ] Ensure form sections use standard card pattern
- [ ] Verify input focus rings use `ring-ring` token

### 5.4 Profile Page (`ProfilePage.tsx`)

- [ ] Replace hard-coded stat card backgrounds
- [ ] Verify badge styles use token colours

### 5.5 Leaderboard Page (`LeaderboardPage.tsx`)

- [ ] Replace rank row gradients with `from-brand-50 to-brand-100`
- [ ] Replace hard-coded gold/silver/bronze colours with semantic tokens
- [ ] Standardize list item stagger animation

### 5.6 Merchant Dashboard Pages

- [ ] Replace all hard-coded hex in merchant forms
- [ ] Standardize form section cards
- [ ] Align admin buttons to shadcn `ui/button`

### 5.7 Menu Pages (`MenuDetailPage.tsx`)

- [ ] Replace `#1a1a2e` backgrounds → `bg-surface-dark`
- [ ] Verify card patterns match deal detail page
- [ ] Check `ImageSlideshow` here too

### 5.8 Admin Pages

- [ ] Lower priority — admin rarely seen by users
- [ ] Replace hard-coded hex values
- [ ] Ensure modals use Dialog or standard motion pattern

---

## Phase 6 — Component Library Cleanup ⚪

### 6.1 Delete Outdated Files

- [ ] Delete `web/src/config/design-system.json` — superseded by `DESIGN_SYSTEM.md` and CSS tokens
- [ ] Remove Lora from any font imports if still present

### 6.2 Consolidate Card Components

There are 36+ card-related files. Many are deal-type-specific variants. Consider:
- A single `DealCard` with a `variant` prop instead of separate files per deal type
- Only if the visual differences are minor (badge colour + label text)

### 6.3 Create Shared Motion Presets

Create `web/src/lib/motion.ts`:
```ts
export const fadeSlideUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8 },
};

export const modalSpring = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  transition: { type: 'spring', damping: 25, stiffness: 200 },
};

export const slideFromRight = {
  initial: { x: '100%' },
  animate: { x: 0 },
  exit: { x: '100%' },
  transition: { type: 'spring', damping: 25, stiffness: 300 },
};

export const staggerChildren = (staggerDelay = 0.05) => ({
  initial: { opacity: 0, y: 20 },
  animate: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * staggerDelay },
  }),
});
```

---

## Execution Order

```
Phase 1 (Token Adoption)    →  Mechanical search-replace, low risk
Phase 2 (Typography)        →  Remove Lora, fix arbitrary sizes
Phase 3 (Shadow & Radius)   →  Standardize cards
Phase 4 (Button Consolidation) → Align APIs to tokens
Phase 5 (Page Migration)    →  Page by page, test each
Phase 6 (Cleanup)           →  Delete dead code, create motion presets
```

### Estimated Effort

| Phase | Files | Effort |
|-------|-------|--------|
| Phase 1 | ~30 files | 1-2 hours |
| Phase 2 | ~10 files | 30 min |
| Phase 3 | ~20 files | 1 hour |
| Phase 4 | 2 files + audits | 1 hour |
| Phase 5 | ~15 pages | 3-4 hours |
| Phase 6 | ~5 files | 1 hour |
| **Total** | | **~8-10 hours** |

---

## How to Verify

After each phase:

1. `npm run build` — ensure no TypeScript/build errors
2. Visual check every modified page at mobile (375px) + desktop (1440px)
3. Check dark surface cards render correctly
4. Verify hover/focus states still work
5. Check Framer Motion animations aren't broken

---

*This plan pairs with `DESIGN_SYSTEM.md` — always reference both when working on the UI.*
