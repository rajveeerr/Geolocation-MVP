# Frontend Deal Features Implementation Plan

## Executive Summary

This document outlines a comprehensive plan to implement all backend deal features on the frontend, including:
- Item-specific discount configuration
- Menu Collections (Happy Hour Menu, Catalogue)
- Deal type-based menu filtering
- Enhanced deal creation flow
- Premium UX with consistent design patterns

**Status**: Planning Phase  
**Last Updated**: 2025-01-XX

---

## Table of Contents

1. [Backend Feature Analysis](#backend-feature-analysis)
2. [Frontend Gap Analysis](#frontend-gap-analysis)
3. [Implementation Phases](#implementation-phases)
4. [Component Architecture](#component-architecture)
5. [UI/UX Design Patterns](#uiux-design-patterns)
6. [API Integration Strategy](#api-integration-strategy)
7. [Testing Strategy](#testing-strategy)
8. [Migration & Rollout Plan](#migration--rollout-plan)

---

## Backend Feature Analysis

### 1. Deal Creation with Item-Specific Discounts

**Backend Support:**
- ✅ Global discounts (`discountPercentage`, `discountAmount`)
- ✅ Item-specific discounts per menu item:
  - `customPrice`: Fixed price override
  - `customDiscount`: Percentage discount (0-100)
  - `discountAmount`: Fixed amount discount
  - `useGlobalDiscount`: Boolean flag (auto-set)
- ✅ Validation for all discount types
- ✅ Discount priority logic (customPrice > item discount > global discount)

**API Endpoint:** `POST /api/deals`

**Request Body Structure:**
```typescript
{
  menuItems: [
    {
      id: number,
      isHidden?: boolean,
      customPrice?: number,
      customDiscount?: number,
      discountAmount?: number
    }
  ]
}
```

### 2. Menu Collections System

**Backend Support:**
- ✅ Create collections manually
- ✅ Create collections from deal type (one-click)
- ✅ Filter menu items by deal type
- ✅ Use collections in deal creation (`menuCollectionId`)
- ✅ Custom pricing per collection item
- ✅ Collection management (CRUD operations)

**API Endpoints:**
- `GET /api/merchants/me/menu-collections` - List all collections
- `POST /api/merchants/me/menu-collections` - Create collection
- `POST /api/merchants/me/menu-collections/from-deal-type` - Auto-create from deal type
- `GET /api/merchants/me/menu/by-deal-type?dealType=HAPPY_HOUR_BOUNTY` - Filter by deal type
- `GET /api/merchants/me/menu-collections/:id` - Get collection details
- `PUT /api/merchants/me/menu-collections/:id` - Update collection
- `DELETE /api/merchants/me/menu-collections/:id` - Delete collection

### 3. Menu Item Deal Types

**Backend Support:**
- ✅ Multiple deal types:
  - `HAPPY_HOUR_BOUNTY`
  - `HAPPY_HOUR_SURPRISE`
  - `HAPPY_HOUR_LATE_NIGHT`
  - `HAPPY_HOUR_MID_DAY`
  - `HAPPY_HOUR_MORNINGS`
  - `REDEEM_NOW_BOUNTY`
  - `REDEEM_NOW_SURPRISE`
  - `STANDARD`
  - `RECURRING`
- ✅ Time-based validation (`validStartTime`, `validEndTime`, `validDays`)
- ✅ Surprise deal support (`isSurprise`, `surpriseRevealTime`)
- ✅ Happy Hour pricing (`happyHourPrice`)

**API Endpoint:** `GET /api/menu/deal-types` - Get all available deal types

### 4. Deal Creation Enhancements

**Backend Support:**
- ✅ All fields from current frontend
- ✅ `menuCollectionId` for using collections
- ✅ Enhanced menu item discount configuration
- ✅ Comprehensive validation

---

## Frontend Gap Analysis

### Current Implementation Status

#### ✅ Implemented
- Basic deal creation flow
- Menu item selection (basic)
- Global discount configuration
- Image upload
- Deal scheduling
- Basic menu item visibility toggle

#### ❌ Missing Features

1. **Item-Specific Discount Configuration**
   - No UI for setting `customPrice`, `customDiscount`, `discountAmount` per item
   - No visual indication of discount types
   - No price calculation preview

2. **Menu Collections Integration**
   - No collection selection in deal creation
   - No collection management UI
   - No "create collection from deal type" feature
   - No collection preview/editing

3. **Deal Type-Based Menu Filtering**
   - No filtering by deal type in menu selection
   - No Happy Hour menu view
   - No deal type indicators on menu items

4. **Enhanced Menu Selection**
   - No bulk operations
   - No collection-based selection
   - Limited filtering options

5. **Catalogue Management**
   - No catalogue/collection management page
   - No collection creation workflow
   - No collection editing interface

---

## Implementation Phases

### Phase 1: Core Discount System (Priority: HIGH)
**Estimated Time:** 3-4 days

**Objectives:**
- Implement item-specific discount configuration
- Add price calculation and preview
- Update deal creation context and API integration

**Components to Create/Update:**
1. `DealMenuStep.tsx` - Add discount configuration per item
2. `MenuItemDiscountEditor.tsx` - New component for discount editing
3. `DealCreationContext.tsx` - Update state to include discount fields
4. API integration for deal creation with discounts

**Key Features:**
- Toggle between global discount and item-specific discount
- Input fields for customPrice, customDiscount, discountAmount
- Real-time price calculation preview
- Visual indicators for discount types
- Validation and error handling

### Phase 2: Menu Collections - Deal Creation Integration (Priority: HIGH)
**Estimated Time:** 4-5 days

**Objectives:**
- Integrate menu collections into deal creation flow
- Add collection selection UI
- Support creating deals with collections

**Components to Create/Update:**
1. `DealMenuStep.tsx` - Add collection selection option
2. `MenuCollectionSelector.tsx` - New component for collection selection
3. `CollectionPreview.tsx` - Preview collection items
4. API hooks for collections

**Key Features:**
- Toggle between "Select Items" and "Use Collection"
- Collection dropdown/selector
- Preview collection items with pricing
- Support for both manual selection and collection usage
- Collection items inherit custom pricing

### Phase 3: Menu Collections Management (Priority: MEDIUM)
**Estimated Time:** 5-6 days

**Objectives:**
- Create full collection management interface
- Support CRUD operations for collections
- One-click collection creation from deal types

**Components to Create:**
1. `MenuCollectionsPage.tsx` - Main collections management page
2. `CollectionList.tsx` - List all collections
3. `CollectionForm.tsx` - Create/edit collection form
4. `CollectionItemManager.tsx` - Manage items in collection
5. `DealTypeCollectionCreator.tsx` - One-click creation from deal type

**Key Features:**
- List all collections with item counts
- Create collection manually
- Create collection from deal type (one-click)
- Edit collection name, description, items
- Add/remove items from collection
- Set custom pricing per collection item
- Reorder collection items
- Delete collections

### Phase 4: Enhanced Menu Selection & Filtering (Priority: MEDIUM)
**Estimated Time:** 3-4 days

**Objectives:**
- Add deal type filtering
- Improve menu selection UX
- Add Happy Hour menu view

**Components to Create/Update:**
1. `DealMenuStep.tsx` - Add deal type filter
2. `DealTypeFilter.tsx` - Filter component
3. `HappyHourMenuView.tsx` - Dedicated Happy Hour view
4. API hooks for filtering by deal type

**Key Features:**
- Filter menu items by deal type
- Quick filter buttons (Happy Hour, Standard, etc.)
- Deal type badges on menu items
- Happy Hour pricing display
- Time-based validation indicators

### Phase 5: Catalogue Feature (Priority: LOW)
**Estimated Time:** 2-3 days

**Objectives:**
- Public-facing catalogue view
- Merchant catalogue management
- Catalogue sharing

**Components to Create:**
1. `CataloguePage.tsx` - Public catalogue view
2. `CatalogueManager.tsx` - Merchant catalogue management
3. API integration for public catalogue endpoints

**Key Features:**
- Public catalogue display
- Catalogue sharing links
- Catalogue customization

---

## Component Architecture

### New Components

```
src/components/merchant/
├── create-deal/
│   ├── DealMenuStep.tsx (UPDATE)
│   ├── MenuItemDiscountEditor.tsx (NEW)
│   ├── MenuCollectionSelector.tsx (NEW)
│   ├── CollectionPreview.tsx (NEW)
│   └── DealTypeFilter.tsx (NEW)
│
├── menu-collections/
│   ├── MenuCollectionsPage.tsx (NEW)
│   ├── CollectionList.tsx (NEW)
│   ├── CollectionCard.tsx (NEW)
│   ├── CollectionForm.tsx (NEW)
│   ├── CollectionItemManager.tsx (NEW)
│   ├── DealTypeCollectionCreator.tsx (NEW)
│   └── CollectionItemEditor.tsx (NEW)
│
└── menu/
    ├── HappyHourMenuView.tsx (NEW)
    └── DealTypeBadge.tsx (NEW)
```

### Updated Components

```
src/components/merchant/create-deal/
├── DealMenuStep.tsx - Add discount config, collection support
└── DealReviewStep.tsx - Show discount details, collection info

src/context/
└── DealCreationContext.tsx - Add discount fields, collection support

src/hooks/
└── useMerchantMenu.ts - Add filtering by deal type
```

---

## UI/UX Design Patterns

### Design Principles

1. **Consistency**: Use existing design system (brand colors, spacing, typography)
2. **Progressive Disclosure**: Show advanced options only when needed
3. **Visual Feedback**: Clear indicators for discount types, selections, states
4. **Error Prevention**: Validation before submission, clear error messages
5. **Accessibility**: Keyboard navigation, screen reader support, ARIA labels

### Component Design Patterns

#### 1. Menu Item Discount Editor

**Layout:**
```
┌─────────────────────────────────────┐
│ Item: Craft Beer                     │
│ Price: $8.00                        │
│                                      │
│ Discount Type: [Dropdown]           │
│ ○ Use Global Discount               │
│ ○ Custom Price: [$__.__]            │
│ ○ Percentage: [__]%                 │
│ ○ Fixed Amount: $[__.__]            │
│                                      │
│ Preview: $5.00 (37.5% off)          │
└─────────────────────────────────────┘
```

**Features:**
- Radio buttons for discount type selection
- Conditional input fields based on selection
- Real-time price calculation
- Visual discount badge
- Clear button to reset to global discount

#### 2. Collection Selector

**Layout:**
```
┌─────────────────────────────────────┐
│ Select Menu Source:                 │
│ ○ Select Items Manually             │
│ ● Use Menu Collection               │
│                                      │
│ Collection: [Dropdown ▼]            │
│ ┌─────────────────────────────────┐ │
│ │ Happy Hour Menu (12 items)      │ │
│ │ Weekend Specials (8 items)     │ │
│ │ Brunch Menu (15 items)          │ │
│ └─────────────────────────────────┘ │
│                                      │
│ [Create New Collection]             │
│                                      │
│ Preview:                             │
│ • Item 1: $5.00 (was $8.00)         │
│ • Item 2: $6.00 (was $10.00)        │
└─────────────────────────────────────┘
```

**Features:**
- Toggle between manual and collection selection
- Dropdown with collection names and item counts
- Quick preview of collection items
- Link to create new collection
- Edit collection button

#### 3. Collection Management Page

**Layout:**
```
┌─────────────────────────────────────┐
│ Menu Collections                    │
│ [+ Create Collection]               │
│                                      │
│ ┌─────────────────────────────────┐ │
│ │ Happy Hour Menu                 │ │
│ │ 12 items • Created 2 days ago   │ │
│ │ [Edit] [Delete] [Use in Deal]  │ │
│ └─────────────────────────────────┘ │
│                                      │
│ ┌─────────────────────────────────┐ │
│ │ Weekend Specials                │ │
│ │ 8 items • Created 1 week ago   │ │
│ │ [Edit] [Delete] [Use in Deal]  │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Features:**
- Grid/list view toggle
- Search and filter collections
- Quick actions (Edit, Delete, Use)
- Collection stats (item count, last updated)
- Empty state with creation CTA

#### 4. Deal Type Filter

**Layout:**
```
┌─────────────────────────────────────┐
│ Filter by Deal Type:                │
│ [All] [Happy Hour] [Standard]      │
│ [Surprise] [Late Night] [Morning]  │
│                                      │
│ Showing: 12 items (Happy Hour)      │
└─────────────────────────────────────┘
```

**Features:**
- Chip-based filter buttons
- Active filter highlight
- Item count display
- Clear filter option

---

## API Integration Strategy

### New Hooks

```typescript
// src/hooks/useMenuCollections.ts
export const useMenuCollections = () => {
  // GET /api/merchants/me/menu-collections
  // POST /api/merchants/me/menu-collections
  // PUT /api/merchants/me/menu-collections/:id
  // DELETE /api/merchants/me/menu-collections/:id
}

// src/hooks/useMenuByDealType.ts
export const useMenuByDealType = (dealType: string, category?: string) => {
  // GET /api/merchants/me/menu/by-deal-type?dealType=...
}

// src/hooks/useDealTypes.ts
export const useDealTypes = () => {
  // GET /api/menu/deal-types
}

// src/hooks/useCreateCollectionFromDealType.ts
export const useCreateCollectionFromDealType = () => {
  // POST /api/merchants/me/menu-collections/from-deal-type
}
```

### Updated Hooks

```typescript
// src/hooks/useMerchantMenu.ts
export const useMerchantMenu = (filters?: {
  dealType?: string;
  category?: string;
  search?: string;
}) => {
  // Enhanced with filtering support
}
```

### API Service Functions

```typescript
// src/services/menuCollections.ts
export const menuCollectionsService = {
  list: () => api.get('/merchants/me/menu-collections'),
  get: (id: number) => api.get(`/merchants/me/menu-collections/${id}`),
  create: (data: CreateCollectionData) => api.post('/merchants/me/menu-collections', data),
  update: (id: number, data: UpdateCollectionData) => api.put(`/merchants/me/menu-collections/${id}`, data),
  delete: (id: number) => api.delete(`/merchants/me/menu-collections/${id}`),
  createFromDealType: (data: CreateFromDealTypeData) => api.post('/merchants/me/menu-collections/from-deal-type', data),
  addItems: (collectionId: number, items: MenuItem[]) => api.post(`/merchants/me/menu-collections/${collectionId}/items`, { menuItems: items }),
  updateItem: (collectionId: number, itemId: number, data: UpdateItemData) => api.put(`/merchants/me/menu-collections/${collectionId}/items/${itemId}`, data),
  removeItem: (collectionId: number, itemId: number) => api.delete(`/merchants/me/menu-collections/${collectionId}/items/${itemId}`),
  reorderItems: (collectionId: number, itemOrders: ItemOrder[]) => api.put(`/merchants/me/menu-collections/${collectionId}/items/reorder`, { itemOrders })
};
```

---

## State Management Updates

### DealCreationContext Updates

```typescript
interface DealCreationState {
  // ... existing fields
  
  // Menu Collection Support
  menuCollectionId: number | null;
  useMenuCollection: boolean;
  
  // Enhanced Menu Items with Discounts
  selectedMenuItems: Array<{
    id: number;
    name: string;
    price: number;
    category: string;
    isHidden: boolean;
    // Discount fields
    customPrice?: number | null;
    customDiscount?: number | null;
    discountAmount?: number | null;
    useGlobalDiscount: boolean;
  }>;
}
```

### New Actions

```typescript
type Action =
  // ... existing actions
  | { type: 'SET_MENU_COLLECTION'; collectionId: number | null }
  | { type: 'TOGGLE_USE_COLLECTION'; useCollection: boolean }
  | { type: 'UPDATE_ITEM_DISCOUNT'; payload: { itemId: number; discount: ItemDiscount } }
  | { type: 'RESET_ITEM_DISCOUNT'; payload: { itemId: number } }
  | { type: 'BULK_UPDATE_DISCOUNTS'; payload: Array<{ itemId: number; discount: ItemDiscount }> }
```

---

## Testing Strategy

### Unit Tests

1. **Discount Calculation Logic**
   - Test price calculation with different discount types
   - Test discount priority (customPrice > item discount > global)
   - Test edge cases (0%, 100%, negative values)

2. **Collection Management**
   - Test collection CRUD operations
   - Test collection item management
   - Test one-click collection creation

3. **Menu Filtering**
   - Test deal type filtering
   - Test category filtering
   - Test search functionality

### Integration Tests

1. **Deal Creation Flow**
   - Test creating deal with item-specific discounts
   - Test creating deal with collection
   - Test creating deal with mixed discounts

2. **Collection Workflow**
   - Test creating collection from deal type
   - Test using collection in deal creation
   - Test editing collection items

### E2E Tests

1. **Complete Deal Creation Flow**
   - Create deal with custom discounts
   - Create deal with collection
   - Verify deal appears correctly

2. **Collection Management Flow**
   - Create collection
   - Add items to collection
   - Use collection in deal
   - Edit collection

---

## Migration & Rollout Plan

### Phase 1: Foundation (Week 1)
- ✅ Set up new components structure
- ✅ Create API hooks and services
- ✅ Update DealCreationContext
- ✅ Implement basic discount editor

### Phase 2: Core Features (Week 2)
- ✅ Item-specific discount configuration
- ✅ Collection selection in deal creation
- ✅ Basic collection management

### Phase 3: Advanced Features (Week 3)
- ✅ Full collection management UI
- ✅ Deal type filtering
- ✅ One-click collection creation

### Phase 4: Polish & Testing (Week 4)
- ✅ UI/UX refinements
- ✅ Comprehensive testing
- ✅ Bug fixes
- ✅ Documentation

### Rollout Strategy

1. **Feature Flags**: Use feature flags to enable features gradually
2. **Beta Testing**: Test with select merchants first
3. **Gradual Rollout**: Enable for all merchants after validation
4. **Monitoring**: Track usage, errors, performance

---

## Success Metrics

### User Engagement
- % of deals created with item-specific discounts
- % of merchants using collections
- Average collections per merchant
- Collection reuse rate

### Technical Metrics
- API response times
- Error rates
- Component load times
- User flow completion rates

### Business Metrics
- Deals created with collections vs manual
- Time saved in deal creation
- Merchant satisfaction scores

---

## Risk Mitigation

### Technical Risks

1. **Complexity**: Discount calculation logic can be complex
   - **Mitigation**: Comprehensive unit tests, clear documentation

2. **Performance**: Loading many menu items/collections
   - **Mitigation**: Pagination, lazy loading, caching

3. **Data Consistency**: Ensuring discounts are calculated correctly
   - **Mitigation**: Validation on both frontend and backend

### UX Risks

1. **Overwhelming UI**: Too many options can confuse users
   - **Mitigation**: Progressive disclosure, clear defaults, tooltips

2. **Learning Curve**: New features require merchant education
   - **Mitigation**: In-app tooltips, help documentation, onboarding

---

## Dependencies

### External Dependencies
- No new external dependencies required
- Use existing UI component library
- Use existing API client

### Internal Dependencies
- Backend APIs (already implemented)
- Design system components
- Routing infrastructure

---

## Open Questions

1. **Should we support bulk discount application?**
   - Apply same discount to multiple selected items
   - Recommendation: Yes, add in Phase 1

2. **Should collections be shareable between merchants?**
   - For franchise chains
   - Recommendation: Future enhancement

3. **Should we add collection templates?**
   - Pre-defined collection structures
   - Recommendation: Future enhancement

4. **How to handle collection updates after deal creation?**
   - If collection changes, should existing deals update?
   - Recommendation: No, deals are snapshots at creation time

---

## Next Steps

1. **Review & Approval**: Get stakeholder approval on plan
2. **Design Mockups**: Create detailed UI mockups for key components
3. **Technical Spike**: Prototype discount calculation logic
4. **Kickoff Meeting**: Align team on implementation approach
5. **Start Phase 1**: Begin implementation

---

## Appendix

### A. API Request/Response Examples

#### Create Deal with Item Discounts
```json
POST /api/deals
{
  "title": "Happy Hour Special",
  "discountPercentage": 20,
  "menuItems": [
    { "id": 1, "customDiscount": 50 },
    { "id": 2, "customPrice": 5.99 },
    { "id": 3 }
  ]
}
```

#### Create Collection from Deal Type
```json
POST /api/merchants/me/menu-collections/from-deal-type
{
  "dealType": "HAPPY_HOUR_BOUNTY",
  "collectionName": "Happy Hour Menu",
  "description": "All happy hour items",
  "category": "Drinks"
}
```

### B. Component File Structure

```
src/
├── components/
│   └── merchant/
│       ├── create-deal/
│       │   ├── DealMenuStep.tsx
│       │   ├── MenuItemDiscountEditor.tsx
│       │   ├── MenuCollectionSelector.tsx
│       │   └── CollectionPreview.tsx
│       └── menu-collections/
│           ├── MenuCollectionsPage.tsx
│           ├── CollectionList.tsx
│           ├── CollectionForm.tsx
│           └── CollectionItemManager.tsx
├── hooks/
│   ├── useMenuCollections.ts
│   ├── useMenuByDealType.ts
│   └── useDealTypes.ts
├── services/
│   └── menuCollections.ts
└── context/
    └── DealCreationContext.tsx
```

### C. Design Tokens

Use existing design system:
- Primary Color: `brand-primary-500`
- Success Color: `green-600`
- Error Color: `red-600`
- Spacing: Tailwind defaults
- Typography: Existing font system

---

**Document Version**: 1.0  
**Last Updated**: 2025-01-XX  
**Author**: Development Team  
**Status**: Ready for Review

