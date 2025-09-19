import prisma from '../src/lib/prisma';

async function tableExists(table: string): Promise<boolean> {
  const rows = await prisma.$queryRawUnsafe<{ exists: boolean }[]>(
    `SELECT EXISTS (
       SELECT 1 FROM information_schema.tables 
       WHERE table_schema = 'public' AND table_name = '${table}'
     ) AS exists`
  );
  return rows?.[0]?.exists ?? false;
}

async function ensureCityTable() {
  if (await tableExists('City')) {
    console.log('City table already exists');
    return;
  }
  await prisma.$executeRawUnsafe(`CREATE TABLE "City" (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    state TEXT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT FALSE,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);
  await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX "City_name_state_key" ON "City" (name, state)`);
  await prisma.$executeRawUnsafe(`CREATE INDEX "City_active_name_idx" ON "City" (active, name)`);
  console.log('Created City table and indexes');
}

async function ensureStoreTable() {
  if (await tableExists('Store')) {
    console.log('Store table already exists');
    return;
  }
  await prisma.$executeRawUnsafe(`CREATE TABLE "Store" (
    id SERIAL PRIMARY KEY,
    "merchantId" INTEGER NOT NULL,
    "cityId" INTEGER NOT NULL,
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION NULL,
    longitude DOUBLE PRECISION NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "Store_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"(id) ON DELETE CASCADE,
    CONSTRAINT "Store_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"(id)
  )`);
  await prisma.$executeRawUnsafe(`CREATE INDEX "Store_merchantId_idx" ON "Store" ("merchantId")`);
  await prisma.$executeRawUnsafe(`CREATE INDEX "Store_cityId_idx" ON "Store" ("cityId")`);
  await prisma.$executeRawUnsafe(`CREATE INDEX "Store_active_cityId_idx" ON "Store" (active, "cityId")`);
  console.log('Created Store table and indexes');
}

async function main() {
  await ensureCityTable();
  await ensureStoreTable();
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
