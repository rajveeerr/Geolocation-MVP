// scripts/backfill-merchant-stores.ts
// Purpose: One-time (idempotent) backfill to create Store rows for any Merchant
// that (a) still has the legacy string `city` populated and (b) has no Store records yet.
//
// Strategy:
// 1. Find merchants where merchant.city IS NOT NULL AND stores count = 0.
// 2. Attempt to resolve the legacy city string against existing City rows by name (case-insensitive)
//    across any state (ambiguous names logged). If multiple matches -> skip & log manual action.
// 3. If no City match found, create a new inactive City with state="UNKNOWN" so data isn't lost.
// 4. Create a Store row with merchant.address, coordinates, resolved cityId.
// 5. Set merchant.city = NULL (so we don't reprocess) within the same transaction.
//
// Safety:
// - Run read-only dry-run mode with DRY_RUN=true to preview operations.
// - Idempotent: merchants processed will have legacy city cleared and thus not selected again.
//
// Environment:
//   DRY_RUN=true (optional) -> no writes, just console output
//
// Exit codes:
//   0 success
//   1 unexpected error

import prisma from '../src/lib/prisma';

interface PendingMerchantInfo {
  id: number;
  businessName: string;
  city: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
}

const DRY_RUN = process.env.DRY_RUN === 'true';

async function main() {
  console.log(`[backfill-stores] Starting backfill. DRY_RUN=${DRY_RUN}`);

  // 1. Pull candidate merchants
  // We can't filter by stores.count directly; fetch merchants with legacy city then check stores length.
  const legacyMerchants = await prisma.merchant.findMany({
    where: { city: { not: null } },
    select: { id: true, businessName: true, city: true, address: true, latitude: true, longitude: true, stores: { select: { id: true } } }
  });

  const candidates: PendingMerchantInfo[] = legacyMerchants
    .filter(m => m.stores.length === 0 && m.city)
    .map(m => ({ id: m.id, businessName: m.businessName, city: m.city!, address: m.address, latitude: m.latitude, longitude: m.longitude }));

  if (candidates.length === 0) {
    console.log('[backfill-stores] No merchants need backfill. Nothing to do.');
    return;
  }

  console.log(`[backfill-stores] Found ${candidates.length} merchants needing store creation.`);

  let createdStores = 0;
  const ambiguous: PendingMerchantInfo[] = [];
  const failures: { merchant: PendingMerchantInfo; error: any }[] = [];

  for (const merchant of candidates) {
    const legacyCityRaw = merchant.city.trim();
    if (!legacyCityRaw) {
      console.log(`[backfill-stores] Merchant ${merchant.id} has empty trimmed city; skipping.`);
      continue;
    }
    // Attempt match case-insensitive by City.name
    // @ts-ignore
    const matches = await prisma.city.findMany({ where: { name: { equals: legacyCityRaw, mode: 'insensitive' } } });
    if (matches.length > 1) {
      console.warn(`[backfill-stores] Ambiguous city name '${legacyCityRaw}' for merchant ${merchant.id}; matches=${matches.map(c => `${c.name},${c.state}`).join('|')}. Skipping.`);
      ambiguous.push(merchant);
      continue;
    }

    let cityId: number | null = null;
    if (matches.length === 1) {
      cityId = matches[0].id;
    } else {
      // No match: create placeholder inactive city with UNKNOWN state
      if (DRY_RUN) {
        console.log(`[backfill-stores] Would create placeholder City '${legacyCityRaw}, UNKNOWN' for merchant ${merchant.id}`);
      } else {
        // @ts-ignore
        const created = await prisma.city.create({ data: { name: legacyCityRaw, state: 'UNKNOWN', active: false } });
        cityId = created.id;
        console.log(`[backfill-stores] Created placeholder City id=${cityId} name='${legacyCityRaw}' state='UNKNOWN'`);
      }
    }

    if (cityId === null && !DRY_RUN) {
      console.warn(`[backfill-stores] Could not resolve city for merchant ${merchant.id}; skipping.`);
      continue;
    }

    try {
      if (DRY_RUN) {
        console.log(`[backfill-stores] Would create Store for merchant ${merchant.id} cityId=${cityId} address='${merchant.address}'`);
        console.log(`[backfill-stores] Would null legacy merchant.city for merchant ${merchant.id}`);
        createdStores++;
      } else {
        await prisma.$transaction(async (tx) => {
          if (cityId === null) throw new Error('cityId unexpectedly null before store create');
          // @ts-ignore
          await tx.store.create({
            data: {
              merchantId: merchant.id,
              cityId,
              address: merchant.address,
              latitude: merchant.latitude,
              longitude: merchant.longitude,
              active: true,
            }
          });
          await tx.merchant.update({ where: { id: merchant.id }, data: { city: null } });
        });
        createdStores++;
        console.log(`[backfill-stores] Created store + cleared legacy city for merchant ${merchant.id}`);
      }
    } catch (err) {
      console.error(`[backfill-stores] Failed merchant ${merchant.id}`, err);
      failures.push({ merchant, error: err });
    }
  }

  console.log(`[backfill-stores] Summary: createdStores=${createdStores} ambiguous=${ambiguous.length} failures=${failures.length}`);
  if (ambiguous.length) {
    console.log('[backfill-stores] Ambiguous merchants:');
    ambiguous.forEach(m => console.log(`  merchantId=${m.id} business='${m.businessName}' city='${m.city}'`));
  }
  if (failures.length) {
    console.log('[backfill-stores] Failures:');
    failures.forEach(f => console.log(`  merchantId=${f.merchant.id} error=${f.error?.message || f.error}`));
    process.exitCode = 1;
  }
  console.log('[backfill-stores] Completed.');
}

main().catch(e => {
  console.error('[backfill-stores] Unhandled error', e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
