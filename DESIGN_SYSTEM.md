# Deal Hunt — Design System

> **Purpose:** This document is the single source of truth for the Deal Hunt visual language. Give this file as context to any LLM that builds or modifies UI for this project.

---

## Table of Contents

1. [Brand Identity](#1-brand-identity)
2. [Colour Tokens](#2-colour-tokens)
3. [Typography](#3-typography)
4. [Spacing & Layout](#4-spacing--layout)
5. [Border Radius](#5-border-radius)
6. [Shadows](#6-shadows)
7. [Gradients](#7-gradients)
8. [Components](#8-components)
9. [Animation & Motion](#9-animation--motion)
10. [Dark Surfaces](#10-dark-surfaces)
11. [Z-Index Scale](#11-z-index-scale)
12. [Icons](#12-icons)
13. [Do's & Don'ts](#13-dos--donts)
14. [File Map](#14-file-map)

---

## 1. Brand Identity

| Property | Value |
|----------|-------|
| **App name** | Deal Hunt (previously "yohop") |
| **Primary colour** | `#E80203` — a bold, vibrant red |
| **Personality** | Energetic, local, deal-focused, premium-casual |
| **Target audience** | Young adults discovering local food deals |
| **Tone** | Confident, playful, action-oriented |

---

## 2. Colour Tokens

All colours are defined as CSS custom properties in `web/src/styles/global.css` and mapped through `web/tailwind.config.ts`. **Never hard-code hex values in components.** Always use Tailwind utilities that reference tokens.

### Brand Palette

| Token | HSL | Hex (approx) | Tailwind class | Use |
|-------|-----|--------|----------------|-----|
| `--brand-primary` | `0 98% 46%` | `#E80203` | `bg-brand` / `text-brand` | Primary buttons, CTAs, focus rings |
| `--brand-primary-hover` | `0 98% 40%` | darker | `bg-brand-hover` | Hover states |
| `--brand-primary-active` | `0 98% 34%` | darker | `bg-brand-active` | Pressed states |
| `--brand-primary-subtle` | `0 86% 97%` | `#FEF2F2` | `bg-brand-subtle` | Tinted section backgrounds |
| `--brand-primary-muted` | `0 80% 92%` | `#FECACA` | `bg-brand-muted` | Soft accent fills |

Full scale: `brand-50` → `brand-950` (50-step increments).

> Use `brand-700` or `brand-800` for darker red accents. Avoid hard-coding hex values.

### Dark Surfaces

For deal cards, bounty cards, and immersive content overlays on dark backgrounds:

| Token | HSL | Hex | Tailwind | Use |
|-------|-----|-----|----------|-----|
| `--surface-dark` | `240 26% 14%` | `#1a1a2e` | `bg-surface-dark` | Primary dark surface |
| `--surface-dark-alt` | `240 26% 12%` | `#16162a` | `bg-surface-dark-alt` | Deeper variant |
| `--surface-dark-muted` | `240 21% 22%` | `#2a2a4a` | `bg-surface-dark-muted` | Elevated dark surfaces |
| `--surface-dark-fg` | `0 0% 100%` | `#FFFFFF` | `text-surface-dark-fg` | Text on dark surfaces |

Use the `.card-dark` utility for the standard dark card gradient → `from-surface-dark to-surface-dark-alt`.

### Neutral Palette

| Token | Tailwind | Typical use |
|-------|----------|-------------|
| `neutral-50` | `bg-neutral-50` | Section backgrounds |
| `neutral-100` | `bg-neutral-100` | Muted fills, secondary Button bg |
| `neutral-200` | `bg-neutral-200` | Borders, dividers |
| `neutral-300` | `text-neutral-300` | Disabled text |
| `neutral-400` | `text-neutral-400` | Placeholder text |
| `neutral-500` | `text-neutral-500` | Muted text, captions |
| `neutral-600` | `text-neutral-600` | Secondary body text |
| `neutral-700` | `text-neutral-700` | Primary body text |
| `neutral-800` | `text-neutral-800` | Headings |
| `neutral-900` | `text-neutral-900` | High-emphasis headings |
| `neutral-950` | `bg-neutral-950` | Near-black fills |

### Semantic Colours

| Token | Tailwind | Hex | Use |
|-------|----------|-----|-----|
| `success` | `bg-success` | `#059669` | Check-in confirmed, active status |
| `warning` | `bg-warning` | `#D97706` | Expiring soon, low stock |
| `error` | `bg-error` | `#DC2626` | Form errors, failed actions |
| `info` | `bg-info` | `#3B82F6` | Informational banners |

Each has a `-foreground` variant for text on that background.

---

## 3. Typography

### Font Families

| Role | Font | Token | Tailwind | Weights |
|------|------|-------|----------|---------|
| **Headings** | Poppins | `--font-heading` | `font-heading` | 600 (semi), 700 (bold), 800 (extra), 900 (black) |
| **Body** | Inter | `--font-body` | `font-body` | 400 (normal), 500 (medium), 600 (semi), 700 (bold) |

> `Lora` is loaded but unused — remove it during refactor.

Headings (`h1`–`h6`) automatically use `--font-heading` via base styles. Body text uses `--font-body`.

### Type Scale

Use standard Tailwind text utilities. Here's the recommended usage:

| Class | Size | Use |
|-------|------|-----|
| `text-xs` | 12px | Badges, timestamps, fine print |
| `text-sm` | 14px | Default body text, form labels, nav links |
| `text-base` | 16px | Emphasized body, large button text |
| `text-lg` | 18px | Section sub-headings, dialog titles |
| `text-xl` | 20px | Section headings |
| `text-2xl` | 24px | Page sub-titles |
| `text-3xl` | 30px | Page titles |
| `text-4xl` | 36px | Hero headings |
| `text-5xl` | 48px | Hero display (rare) |

> ❌ **Avoid custom text sizes** like `text-[22px]`, `text-[13px]`, `text-[10px]`. Map to the nearest Tailwind step.

### Font Weight Pairing

| Context | Weight |
|---------|--------|
| Nav links, labels | `font-medium` (500) |
| Card titles, badges, sub-headings | `font-semibold` (600) |
| CTAs, price text, key stats | `font-bold` (700) |
| Hero card titles | `font-extrabold` (800) |

### Text Colours

| Use | Tailwind class |
|-----|---------------|
| Primary text / headings | `text-foreground` or `text-neutral-900` |
| Secondary text | `text-neutral-600` |
| Muted / captions | `text-muted-foreground` |
| Text on brand bg | `text-white` |
| Text on dark surface | `text-surface-dark-fg` |

---

## 4. Spacing & Layout

### Spacing Scale

Use Tailwind's default 4px-grid spacing. Preferred values:

| Token | px | Common use |
|-------|-----|------------|
| `1` | 4px | Icon-to-text inline gap |
| `1.5` | 6px | Tight pill padding |
| `2` | 8px | Small card padding, gap |
| `3` | 12px | Default gap, badge padding |
| `4` | 16px | Standard card padding, section gap |
| `6` | 24px | Large card padding, section spacing |
| `8` | 32px | Section vertical margin |
| `12` | 48px | Page-level vertical spacing |
| `16` | 64px | Hero sections |

### Container

Use the `.section-container` utility for page-level content:
```
.section-container → mx-auto w-full max-w-screen-xl px-4 sm:px-6 lg:px-8
```

Or use Tailwind's `container` class (configured with `max-w-[1400px]`).

### Responsive Breakpoints

| Prefix | Width | Use |
|--------|-------|-----|
| *(default)* | 0px+ | Mobile-first base |
| `sm:` | 640px+ | Large phones |
| `md:` | 768px+ | Tablets / desktop threshold |
| `lg:` | 1024px+ | Desktop |
| `xl:` | 1280px+ | Wide desktop |
| `2xl:` | 1400px+ | Ultra-wide |

---

## 5. Border Radius

### Radius Tokens

Defined in CSS and mapped to Tailwind as `rounded-dh-*`:

| Token | Value | Tailwind | Use |
|-------|-------|----------|-----|
| `--radius-xs` | 4px | `rounded-dh-xs` | Tiny elements, inline chips |
| `--radius-sm` | 8px | `rounded-dh-sm` | Inputs, small buttons, shadcn badges |
| `--radius-md` | 12px | `rounded-dh-md` | Cards, modals, shadcn default `--radius` |
| `--radius-lg` | 16px | `rounded-dh-lg` | Large cards, panels |
| `--radius-xl` | 20px | `rounded-dh-xl` | Deal cards, hero sections |
| `--radius-2xl` | 24px | `rounded-dh-2xl` | Special deal cards |
| `--radius-3xl` | 32px | `rounded-dh-3xl` | Hero display cards |
| `--radius-full` | 9999px | `rounded-dh-full` | Pills, avatars, badges |

### Radius Guidelines

| Element | Radius |
|---------|--------|
| Pill badges, avatars | `rounded-full` |
| Buttons (primary action) | `rounded-full` |
| shadcn buttons | `rounded-md` (kept for shadcn compat) |
| Form inputs | `rounded-md` |
| Standard cards | `rounded-xl` |
| Deal cards | `rounded-2xl` or `rounded-[1.25rem]` |
| Modals / dialogs | `rounded-2xl` |
| Page-level sections | `rounded-lg` to `rounded-xl` |

> ❌ **Avoid mixing many different radii** in the same visual region. Pick one and stay consistent.

---

## 6. Shadows

All shadows are defined as CSS custom properties and mapped through Tailwind:

| Token | Tailwind | Use |
|-------|----------|-----|
| `--shadow-xs` | `shadow-xs` | Subtle depth on flat elements |
| `--shadow-sm` | `shadow-sm` | Cards at rest, form sections |
| `--shadow-md` | `shadow-md` | Elevated cards, dropdowns |
| `--shadow-lg` | `shadow-lg` | Active cards, popovers |
| `--shadow-xl` | `shadow-xl` | Modals, dialogs |
| `--shadow-2xl` | `shadow-2xl` | Dramatic emphasis (hero cards) |
| `--shadow-card` | `shadow-card` | Default deal card shadow |
| `--shadow-card-hover` | `shadow-card-hover` | Deal card on hover |

### Card Shadow Pattern

```tsx
className="shadow-card hover:shadow-card-hover transition-shadow duration-300"
```

---

## 7. Gradients

### Standard Gradients

Prefer `bg-gradient-to-br` (135°) as the dominant direction.

| Name | Classes | Use |
|------|---------|-----|
| **Primary button** | `bg-gradient-to-b from-brand-400 to-brand-600` | CTA buttons |
| **Brand subtle** | `bg-gradient-to-br from-brand-50 to-brand-100` | Highlight backgrounds |
| **Dark card** | `bg-gradient-to-br from-surface-dark to-surface-dark-alt` | Deal cards, bounty cards |
| **Page background** | `bg-gradient-to-b from-brand-subtle via-white to-white` | Auth pages, landing hero |
| **Image overlay** | `bg-gradient-to-b from-black/40 via-black/10 to-black/80` | Over deal images |
| **Secondary button** | `bg-gradient-to-b from-white to-neutral-50` | Light secondary CTAs |
| **Rank highlight** | `bg-gradient-to-br from-yellow-50 to-amber-50` | Leaderboard top rows |
| **Avatar fallback** | `bg-gradient-to-br from-blue-400 to-purple-500` | When no avatar image |

### Gradient Direction Preference

1. `bg-gradient-to-br` — default / cards / avatars
2. `bg-gradient-to-r` — horizontal banners / progress bars
3. `bg-gradient-to-b` — button fills / page bgs / image overlays
4. `bg-gradient-to-t` — bottom-to-top image fades only

---

## 8. Components

### 8.1 Buttons

**Two button systems exist. Consolidation planned (see REFACTOR_PLAN.md).**

**Use `common/Button.tsx`** for all user-facing CTAs — it has rounded-full, gradients, icon support.

**Use `ui/button.tsx`** (shadcn) for admin panels, dialogs, and secondary structural buttons.

| Variant | Styling | When to use |
|---------|---------|-------------|
| `primary` | Gradient red, rounded-full, white text | Main CTAs: "Check In", "Get Deal", "Sign Up" |
| `secondary` | White-to-neutral-50 gradient, brand border | Secondary actions: "Cancel", "View Details" |
| `ghost` | Transparent, hover bg-neutral-100 | Tertiary actions, icon-only buttons |
| `destructive` | Red bg, white text | Delete, remove actions |
| `outline` | Border + transparent bg | Form actions, filters |

### 8.2 Cards

**Standard Card (shadcn)**
```tsx
<Card className="rounded-xl border bg-card shadow-sm">
  <CardHeader className="p-6">...</CardHeader>
  <CardContent className="p-6 pt-0">...</CardContent>
</Card>
```

**Deal Card (NewDealCard)**
```tsx
<div className="rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow duration-300 border border-white/10">
  {/* Image with gradient overlay */}
  <div className="aspect-[3/4.5] relative overflow-hidden">
    <img className="object-cover w-full h-full" />
    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/80" />
  </div>
</div>
```

**Dark Card (Bounty, Immersive)**
```tsx
<div className="card-dark">
  {/* Automatically gets surface-dark gradient, white text, rounded-2xl */}
</div>
```

### 8.3 Badges / Pills

| Type | Pattern |
|------|---------|
| Deal type badge | `bg-brand text-white rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider` |
| Glassmorphic pill | `bg-white/10 backdrop-blur-xl border border-white/20 rounded-full px-3 py-1.5` |
| Status badge | `<Badge variant="default\|secondary\|outline">` (shadcn) |
| Live indicator | `<span className="h-2 w-2 rounded-full bg-success animate-pulse" />` with text |
| Points badge | `rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-700` |

### 8.4 Modals / Dialogs

**shadcn Dialog** for standard modals:
```tsx
<Dialog>
  <DialogContent className="sm:max-w-lg rounded-2xl">
    <DialogHeader>
      <DialogTitle>...</DialogTitle>
    </DialogHeader>
    ...
  </DialogContent>
</Dialog>
```

**Framer Motion modal** for immersive experiences (check-in, login prompt):
```tsx
<AnimatePresence>
  {isOpen && (
    <>
      <motion.div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-overlay"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
      <motion.div className="fixed ... z-modal rounded-2xl bg-white p-8 shadow-2xl"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}>
        ...
      </motion.div>
    </>
  )}
</AnimatePresence>
```

### 8.5 Forms

| Element | Style |
|---------|-------|
| Input | `h-9 rounded-md border border-input bg-transparent px-3 text-sm` + `focus-visible:ring-1 focus-visible:ring-ring` |
| Label | `text-sm font-medium` |
| Textarea | `min-h-[80px] rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm` + `focus-visible:ring-2 focus-visible:ring-brand-500` |
| Form section card | `rounded-lg border border-neutral-200 bg-white p-6 shadow-sm` |
| Form section icon | `rounded-lg bg-brand-100 p-2` |

### 8.6 Navigation

| Element | Style |
|---------|-------|
| Header bar | `fixed top-0 z-sticky w-full border-b border-neutral-200/80 bg-white` |
| Nav link | `rounded-lg px-2.5 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900` |
| Active nav link | `bg-neutral-100 text-neutral-900` |
| Mobile menu | Slide-from-right with spring animation |
| Dropdown | Fade + scale-up with 150ms duration |

---

## 9. Animation & Motion

Use **Framer Motion** for all meaningful animations. Use Tailwind `transition-*` for micro-interactions.

### Transition Tokens

| Token | Value | Tailwind | Use |
|-------|-------|----------|-----|
| `--transition-fast` | 150ms ease | `duration-fast` | Hovers, micro-interactions |
| `--transition-base` | 200ms ease | `duration-base` | Most transitions |
| `--transition-slow` | 350ms ease | `duration-slow` | Page section reveals |
| `--transition-spring` | 500ms cubic-bezier | `duration-spring ease-spring` | Playful bouncy motion |

### Common Motion Patterns

| Pattern | Configuration | Use |
|---------|---------------|-----|
| **Fade + slide up** | `opacity: 0→1, y: 30→0, duration: 0.8` | Page section entrance |
| **Staggered list** | Same + `delay: index * 0.05` | List items, leaderboard rows |
| **Modal appear** | `opacity: 0→1, scale: 0.9→1, spring(25, 200)` | Modal panels |
| **Slide from right** | `x: '100%'→0, spring(25, 300)` | Mobile menus |
| **Dropdown** | `opacity: 0→1, y: 8→0, scale: 0.96→1, 150ms` | Nav dropdowns |
| **Collapse/expand** | `height: 0→'auto', opacity: 0→1` | Accordion sections |
| **Infinite float** | `y: [0, -20, 0], repeat: Infinity` | Decorative only |
| **Image transition** | `duration: 0.35, ease: 'easeInOut'` | Slideshow slides |

### Guidelines

- Wrap conditional renders in `<AnimatePresence>` for exit animations
- Use `layout` prop for elements that move positions
- Prefer `spring` for user-initiated motion, `ease` for automated transitions
- Keep durations under 500ms for interactions; up to 800ms for page reveals
- Never animate on mobile if it harms performance — use `prefers-reduced-motion`

---

## 10. Dark Surfaces

Deal cards and immersive content sections use a dark indigo palette (`#1a1a2e` family) distinct from a traditional dark mode.

### When to Use

- Deal card overlays (over food images)
- Bounty/live deal cards
- Immersive detail pages
- Feature highlight sections

### Pattern

```tsx
// Use the utility class
<div className="card-dark p-6">
  <h3 className="text-white font-heading font-bold">30% OFF</h3>
  <p className="text-white/70">Limited time</p>
</div>

// Or manual (for custom gradients)
<div className="bg-surface-dark text-surface-dark-fg rounded-2xl p-6">
  ...
</div>
```

### Text on Dark Surfaces

| Emphasis | Class |
|----------|-------|
| Primary text | `text-white` |
| Secondary text | `text-white/70` |
| Muted text | `text-white/50` |
| Tags/labels | `text-white/80 uppercase tracking-wider text-xs` |

---

## 11. Z-Index Scale

| Token | Value | Tailwind | Use |
|-------|-------|----------|-----|
| `--z-base` | 0 | `z-0` | Default |
| `--z-dropdown` | 10 | `z-dropdown` | Dropdowns, popovers |
| `--z-sticky` | 20 | `z-sticky` | Header, sticky elements |
| `--z-overlay` | 30 | `z-overlay` | Modal backdrops |
| `--z-modal` | 40 | `z-modal` | Modal content |
| `--z-toast` | 50 | `z-toast` | Toast notifications |

---

## 12. Icons

Use **Lucide React** icons (configured in shadcn `components.json`).

```tsx
import { MapPin, Clock, Star, ChevronRight } from 'lucide-react';
```

| Size context | Icon size | Stroke |
|-------------|-----------|--------|
| Inline with text-sm | `h-4 w-4` | default (2) |
| Inline with text-base | `h-5 w-5` | default |
| Standalone / section header | `h-6 w-6` | default |
| Hero / feature | `h-8 w-8` to `h-10 w-10` | 1.5 |

---

## 13. Do's & Don'ts

### ✅ DO

- Use Tailwind classes that reference CSS tokens (`bg-brand`, `text-neutral-600`, `rounded-dh-xl`)
- Use `font-heading` for headings and `font-body` for body text
- Use `shadow-card` / `shadow-card-hover` for deal cards
- Use the `.card-dark` utility for dark surface cards
- Use `.section-container` for page-level width constraints
- Use semantic colour tokens (`bg-success`, `bg-error`) for status
- Use `<AnimatePresence>` for conditional mount/unmount animations
- Match button component to context: `common/Button` for user CTAs, `ui/button` for admin/structural
- Keep text hierarchy: one `font-extrabold` title, `font-semibold` sub-headings, `font-medium` body

### ❌ DON'T

- Hard-code hex values like `#E80203`, `#1a1a2e` — use tokens
- Use `accent-orange` (removed legacy token)
- Use `text-[22px]` or other arbitrary font sizes — use the Tailwind scale
- Mix `rounded-lg` and `rounded-xl` on cards in the same view
- Use `Lora` font — it's loaded but not part of the design system
- Create new modal patterns — use the existing Dialog or Framer Motion modal
- Exceed `z-50` — use the z-index scale
- Use `ring-brand-primary-main` — use `ring-ring` or `ring-brand`
- Apply shadow values directly — always use shadow tokens
- Hard-code brand red variants — use `brand-700` or `brand-800` for darker accents

---

## 14. File Map

| File | Purpose |
|------|---------|
| `web/src/styles/global.css` | CSS custom properties (design tokens), base resets, utilities |
| `web/tailwind.config.ts` | Maps CSS tokens to Tailwind utilities; extends theme |
| `web/components.json` | shadcn/ui configuration (style, aliases, icon library) |
| `web/src/lib/utils.ts` | `cn()` — className merge utility (clsx + twMerge) |
| `web/src/components/ui/*` | shadcn primitives (Button, Card, Dialog, Badge, Input, etc.) |
| `web/src/components/common/Button.tsx` | Custom branded button (gradients, rounded-full, icon support) |
| `web/src/components/layout/Header.tsx` | Global navigation header |
| `web/src/components/landing/NewDealCard.tsx` | Primary deal card component |
| `web/src/components/landing/ImageSlideshow.tsx` | Multi-image slideshow with indicator bars |
| `DESIGN_SYSTEM.md` | This file |
| `REFACTOR_PLAN.md` | Step-by-step plan to migrate existing code to the design system |

---

*Last updated: auto-generated. When modifying tokens, update both `global.css` and this document.*
