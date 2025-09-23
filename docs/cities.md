# Cities & Stores Functionality

## Overview
This feature introduces normalized geographic data so that:
- You can maintain a curated list of US cities (`City` table) with an `active` flag.
- Merchants can have multiple physical locations (`Store` table) each tied to a City.
- Deals can be filtered by city (through the merchant's stores) and cities can be listed for UI pickers.
- Legacy `Merchant.city` string is retained temporarily for backward compatibility but will be phased out.

## Data Model
Prisma models (see `prisma/schema.prisma`):

```prisma
model City {
  id        Int      @id @default(autoincrement())
  name      String
  state     String
  active    Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  stores    Store[]
  @@unique([name, state])
  @@index([active, name])
}

model Store {
  id         Int       @id @default(autoincrement())
  merchantId Int
  cityId     Int
  address    String
  latitude   Float?
  longitude  Float?
  active     Boolean   @default(true)
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt

  merchant   Merchant  @relation(fields: [merchantId], references: [id], onDelete: Cascade)
  city       City      @relation(fields: [cityId], references: [id])

  @@index([merchantId])
  @@index([cityId])
  @@index([active, cityId])
}

model Merchant {
  // ...existing fields...
  city     String?   // deprecated, will be null when using Stores
  stores   Store[]
}
```

### Important Notes
- `City.active` controls which cities show up by default in public listings.
- `Store.active` allows per-location activation/deactivation without disabling the entire merchant.
- We DO NOT duplicate city name/state on Store—always join.

## Seed Data
Seed script: `scripts/seed-cities.ts` (npm script: `npm run seed:cities`).
Installs the curated list you provided:

Active by default:
- Florida: Miami, Orlando, Tampa
- Georgia: Atlanta
- New York: New York City
- Texas: Dallas, Houston, Austin, San Antonio, Fort Worth, El Paso
- Washington: Seattle

Inactive (can be toggled later):
- California: Los Angeles, San Diego, San Jose, San Francisco
- Others: Chicago (IL), Phoenix (AZ), Philadelphia (PA), Columbus (OH), Indianapolis (IN), Charlotte (NC), Denver (CO), Nashville (TN), Boston (MA)

Run after schema/tables exist:
```bash
npm run seed:cities
```

## API Endpoints
All paths prefixed by `/api` (see route mounting in `src/app.ts`).

### List Cities
`GET /api/cities?active=true&q=searchTerm`

Query Params:
- `active=true|false` (default: `true`) – omit to return only active; set neither param to retrieve only active; explicitly pass both active flags using two calls if needed.
- `q` – case-insensitive substring match on name or state.

Response:
```json
{
  "cities": [ {"id":1,"name":"Miami","state":"Florida","active":true,...} ],
  "total": 3
}
```

### Whitelisted Cities (Public)

`GET /api/cities/whitelist`

Returns only the names of active cities (whitelisted for merchant onboarding) sorted alphabetically. Used by the front end to gate merchant sign-up flows.

Response:

```json
{
  "cities": [
    "Atlanta",
    "Dallas",
    "New York City"
  ]
}
```

### Toggle City Active (Admin)

`POST /api/cities/toggle`

Body:

```json
{ "cityId": 12, "active": false }
```
Requires admin auth (middleware `requireAdmin`).

### List Stores in a City

`GET /api/cities/:cityId/stores`

Query:

- `includeInactive=true` (optional) – include inactive stores.

Returns only stores whose merchants are `APPROVED`.

### Merchant Registration (Restricted)

`POST /api/merchants/register`
Now requires a `cityId` referencing an existing ACTIVE city. The previous behavior that auto-created cities from `cityName`/`state` or accepted a free-form legacy `city` string has been disabled for new merchants.

Body (minimum):

```json
{
  "businessName": "Test Coffee",
  "address": "100 Peachtree St",
  "cityId": 4
}
```
If the city is inactive or invalid, the API returns `400`.

An initial Store is always created using the same address/coords supplied.

### Merchant Store Management

`GET /api/merchants/stores` – list stores for authenticated approved merchant.

`POST /api/merchants/stores`
Body:

```json
{
  "address": "123 Main St",
  "cityId": 5,
  "latitude": 40.7128,
  "longitude": -74.0060
}
```
Only an existing ACTIVE `cityId` is accepted. No on-the-fly city creation.

### Deals by City

`GET /api/deals?cityId=5` filters deals to those whose merchant has at least one Store in the given city. Works alongside existing `category`, `search`, and geolocation filters.

## Database Inspection

Once migrations (or manual table creation) succeed, you can verify tables:

### Using Prisma Studio

```bash
npx prisma studio
```
Then navigate to `City` and `Store`.

### Using psql / SQL (example queries)

```sql
SELECT id, name, state, active FROM "City" ORDER BY state, name;
SELECT s.id, m.businessName, c.name AS city, c.state, s.address
FROM "Store" s
JOIN "Merchant" m ON m.id = s."merchantId"
JOIN "City" c ON c.id = s."cityId"
ORDER BY c.state, c.name, m.businessName;
```

### Raw Check for Tables

```sql
SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('City','Store');
```

## Migration Status & Issues

You encountered a failing migration due to an already existing unique index (`User_referralCode_key`). This blocks automatic migration for the new models.

### Why It Happens

- The database has an index that Prisma tries to create again (likely drift between environments or a previous manual change).

### Resolution Options

1. Safe (preferred): Manually drop the duplicate index only if it is truly a duplicate and matches the intended constraint.
   ```sql
   DROP INDEX IF EXISTS "User_referralCode_key"; -- if it's an index
   ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_referralCode_key"; -- if it's a constraint
   ```
   Then re-run:
   ```bash
   npx prisma migrate dev --name add_city_and_store_models
   ```
2. Use `prisma migrate resolve` to mark the migration as applied (only if schema truly matches).
3. For dev only: `prisma migrate reset` (drops all data) then re-seed.
4. Temporary workaround (already added): manual table creation via `scripts/manual-create-city-store.ts` then run the seed. This bypasses the migration history; fix properly before production deploy.

### Recommended Path Forward

- Investigate current constraints:

  ```sql
  SELECT indexname FROM pg_indexes WHERE tablename='User';
  ALTER TABLE "User" ADD CONSTRAINT "User_referralCode_key" UNIQUE ("referralCode"); -- only if missing
  ```

- Adjust migration SQL to skip creating what already exists (edit the specific migration file) or drop the duplicate first.
- After fixing drift, run `npx prisma migrate dev` again.

## Backward Compatibility Strategy

| Aspect | Current | Future Plan |
|--------|---------|-------------|
| `Merchant.city` | Optional string | Deprecate after front-end fully uses cities & stores |
| New merchants | Prefer City/Store | Enforce required `cityId` later |
| Deals query | Merchant->Store->City (filter) | Add direct `cityId` index if performance needed |

## Performance Considerations

- Indexes provided: `(active, name)` on City, `(active, cityId)` on Store for fast active-city lookups and deal filtering.
- If deal volume grows, consider a materialized view that maps dealId -> cityIds for faster filtering.

## Testing Recommendations (Pending)
Create tests (see TODO):
1. Seed fixture cities in a test DB and assert `GET /api/cities` returns only active by default.
2. Merchant registration with inactive or missing cityId should fail (400).
3. Adding a store with inactive cityId should fail (400).
4. Deals endpoint with `cityId` returns only deals from merchants having a store in that city.

## Troubleshooting
| Symptom | Cause | Fix |
|---------|-------|-----|
| P2021 table does not exist | Migrations not applied / manual create failed | Run migrations or manual script, then regenerate client |
| Unique index duplicate error | Drift / prior manual change | Drop duplicate index or edit migration to skip |
| City filter returns empty | No merchant stores in that city | Create stores for merchants in that city |
| Cannot create store: invalid cityId | City not seeded | Seed cities or activate appropriate city |
| Cannot create store: city inactive | City.active = false | Toggle city active via admin endpoint |

## Maintenance Checklist
- Remove legacy `Merchant.city` after front-end is updated.
- Add admin CRUD for cities (create/delete) if needed.
- Add bulk activation endpoint if operations require it.
- Monitor query plans for `/api/deals?cityId=` and add composite indexes if necessary.

---
Generated: (keep date in sync) 2025-09-19.
