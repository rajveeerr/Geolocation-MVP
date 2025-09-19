import prisma from '../src/lib/prisma';

async function main() {
  console.log('[db-health] Starting connectivity check');
  try {
    const now = await prisma.$queryRawUnsafe<{ now: Date }[]>(`SELECT NOW() as now`);
    console.log('[db-health] DB time:', now[0].now);
  } catch (e: any) {
    console.error('[db-health] FAILED to query NOW():', e.code, e.message);
    if (e.code === 'P1001') {
      console.error('[db-health] Cannot reach DB. Verify DATABASE_URL, network, Neon project status.');
    }
    process.exit(1);
  }

  // Check City / Store table presence via information_schema
  const tables = await prisma.$queryRawUnsafe<{ table_name: string }[]>(
    `SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('City','Store') ORDER BY table_name;`
  );
  console.log('[db-health] Present tables:', tables.map(t => t.table_name).join(', ') || '(none)');

  if (tables.find(t => t.table_name === 'City')) {
    try {
      // @ts-ignore
      const cityCount = await prisma.city.count();
      console.log('[db-health] City count:', cityCount);
    } catch (e: any) {
      console.warn('[db-health] City model query failed (maybe not generated or table mismatch):', e.code, e.message);
    }
  }

  if (tables.find(t => t.table_name === 'Store')) {
    try {
      // @ts-ignore
      const storeCount = await prisma.store.count();
      console.log('[db-health] Store count:', storeCount);
    } catch (e: any) {
      console.warn('[db-health] Store model query failed:', e.code, e.message);
    }
  }

  console.log('[db-health] Completed');
}

main().catch(e => { console.error('[db-health] Unexpected error', e); process.exit(1); }).finally(() => prisma.$disconnect());