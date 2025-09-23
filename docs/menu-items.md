# Menu Items Model

Date: 2025-09-23

Status: Initial model added to Prisma schema (pending migration apply).

## Purpose

Support detailed Happy Hour / enhanced deal creation by allowing merchants to manage structured menu items (e.g., individual dishes, drinks, bites) that can later be attached to specialized deal types (like Happy Hour bundles or discounted items).

## Prisma Model

Defined in `prisma/schema.prisma`:

```prisma
model MenuItem {
  id          Int       @id @default(autoincrement())
  merchantId  Int
  name        String
  description String?
  price       Float     // Consider Decimal for currency accuracy later
  category    String
  imageUrl    String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  merchant    Merchant  @relation(fields: [merchantId], references: [id], onDelete: Cascade)

  @@index([merchantId])
}
```

Added relation on `Merchant`:

```prisma
menuItems MenuItem[]
```

## Notes & Rationale

- `price` uses `Float` per initial spec. For production-grade currency handling, prefer `Decimal` (Prisma supports `Decimal` with `@db.Decimal(10,2)` for Postgres) to avoid floating point rounding issues.
- `category` is currently a free-form `String`. If front-end categories stabilize, convert to an enum later.
- `imageUrl` optional for performance—avoid forcing uploads at creation time.
- Indexed `merchantId` for fast filtering of a merchant's menu items.

## Migration

Run (if not already run):

```bash
npx prisma migrate dev --name add_menu_item_model
```

If you cannot run migrations now, the model exists in schema and will be applied next migration cycle.

## Future Enhancements (Planned)

1. Deal Association: Introduce a join table, e.g. `DealMenuItem { dealId, menuItemId, specialPrice? }` for attaching menu items to specific Happy Hour deals.
2. Category Enum: Harden `category` into a controlled list (e.g., DRINKS, BITES, MAINS, DESSERT, OTHER).
3. Soft Delete: Add `active` or `archivedAt` to allow merchants to hide items without data loss.
4. Analytics: Add usage metrics once items are linked to deal redemptions / check-ins.
5. Validation: Enforce non-negative price via application-level validation.

## Implemented Endpoint

### GET `/api/merchants/me/menu`

Returns all menu items for the authenticated approved merchant.

Response:

```json
{
  "menuItems": [
    { "id": 101, "name": "Spicy Tuna Roll", "price": 12.5, "category": "Bites", "imageUrl": "https://example.com/roll.png" },
    { "id": 102, "name": "Old Fashioned", "price": 15.0, "category": "Drinks", "imageUrl": "https://example.com/drink.png" }
  ]
}
```

Notes:

- Fields intentionally exclude `description` for lighter payload; can be added later.
- Sorted by `createdAt desc` (newest first).

### POST `/api/merchants/me/menu/item`

Creates a new menu item.

Request Body:

```json
{
  "name": "Margherita Pizza",
  "price": 18.0,
  "category": "Mains",
  "description": "Classic pizza with San Marzano tomatoes and fresh mozzarella.",
  "imageUrl": "https://example.com/pizza.png"
}
```

Response (201):

```json
{
  "menuItem": {
    "id": 123,
    "name": "Margherita Pizza",
    "price": 18.0,
    "category": "Mains",
    "imageUrl": "https://example.com/pizza.png",
    "description": "Classic pizza with San Marzano tomatoes and fresh mozzarella."
  }
}
```

### PUT `/api/merchants/me/menu/item/:itemId`

Updates provided fields of an existing item owned by the merchant.

Example Body:

```json
{ "price": 19.5, "name": "Margherita Pizza Large" }
```

### DELETE `/api/merchants/me/menu/item/:itemId`

Deletes the item (hard delete now; may become soft delete later).

## Pending / Anticipated Endpoints

Attach to deals (future):

Attach to deals (future):

- `POST /api/deals/:dealId/menu-items` – Link selected items.
- `DELETE /api/deals/:dealId/menu-items/:menuItemId` – Unlink.

## Validation Guidelines (App Layer)

- `name`: 1–120 chars.
- `price`: > 0 and reasonably capped (e.g., < 10000) to prevent accidental large values.
- `category`: sanitize / trim; if converting to enum, validate membership.
- `imageUrl`: validate URL format and optionally restrict domain (Cloudinary, etc.).

## Testing Recommendations

- Create menu items for a merchant and ensure retrieval sorted (if desired) by `createdAt` or `name`.
- Ensure non-approved merchant receives 403 when accessing `/api/merchants/me/menu`.
- Simulate deletion and ensure orphaned deal references (when association exists) are handled.

## Open Questions

- Should price support locale / currency differentiation? (Currently assumes USD.)
- Should we pre-load default categories for consistent client UX?
- Will Happy Hour require time-window specific discount overrides per MenuItem? If so, extend association table instead of overloading core model.

---

Generated automatically. Update as endpoints are implemented.
