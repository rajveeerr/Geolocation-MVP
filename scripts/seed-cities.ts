import prisma from '../src/lib/prisma';

async function retry<T>(label: string, fn: () => Promise<T>, attempts = 5, baseDelayMs = 500): Promise<T> {
  let lastErr: any;
  for (let i = 1; i <= attempts; i++) {
    try {
      return await fn();
    } catch (e: any) {
      lastErr = e;
      const wait = baseDelayMs * i * i; // quadratic backoff
      console.warn(`[seed:cities] Attempt ${i}/${attempts} failed for ${label}: ${e.code || e.name} ${e.message}`);
      if (i < attempts) {
        console.info(`[seed:cities] Waiting ${wait}ms before retry...`);
        await new Promise(r => setTimeout(r, wait));
      }
    }
  }
  throw lastErr;
}

const seedCities: Array<{ name: string; state: string; active?: boolean }> = [
  // Florida (active)
  { name: 'Miami', state: 'Florida', active: true },
  { name: 'Orlando', state: 'Florida', active: true },
  { name: 'Tampa', state: 'Florida', active: true },

  // Georgia (Atlanta active)
  { name: 'Atlanta', state: 'Georgia', active: true },

  // New York (NYC active)
  { name: 'New York City', state: 'New York', active: true },

  // Texas (active)
  { name: 'Dallas', state: 'Texas', active: true },
  { name: 'Houston', state: 'Texas', active: true },
  { name: 'Austin', state: 'Texas', active: true },
  { name: 'San Antonio', state: 'Texas', active: true },
  { name: 'Fort Worth', state: 'Texas', active: true },
  { name: 'El Paso', state: 'Texas', active: true },

  // Washington (Seattle active)
  { name: 'Seattle', state: 'Washington', active: true },

  // California (inactive by default)
  { name: 'Los Angeles', state: 'California' },
  { name: 'San Diego', state: 'California' },
  { name: 'San Jose', state: 'California' },
  { name: 'San Francisco', state: 'California' },

  // Others across the US (inactive by default)
  { name: 'Chicago', state: 'Illinois' },
  { name: 'Phoenix', state: 'Arizona' },
  { name: 'Philadelphia', state: 'Pennsylvania' },
  { name: 'Columbus', state: 'Ohio' },
  { name: 'Indianapolis', state: 'Indiana' },
  { name: 'Charlotte', state: 'North Carolina' },
  { name: 'Denver', state: 'Colorado' },
  { name: 'Nashville', state: 'Tennessee' },
  { name: 'Boston', state: 'Massachusetts' },
];

async function main() {
  console.log('[seed:cities] Starting seeding process. Total cities:', seedCities.length);
  for (const c of seedCities) {
    // @ts-ignore
    const existing = await retry('findFirst city', () => prisma.city.findFirst({ where: { name: c.name, state: c.state } }));
    if (existing) {
      if (typeof c.active === 'boolean' && existing.active !== c.active) {
        // @ts-ignore
        await retry('update city active', () => prisma.city.update({ where: { id: existing.id }, data: { active: c.active } }));
        console.log(`[seed:cities] Updated active flag for ${c.name}, ${c.state} -> ${c.active}`);
      }
      continue;
    }
    // @ts-ignore
    await retry('create city', () => prisma.city.create({ data: { name: c.name, state: c.state, active: !!c.active } }));
    console.log(`[seed:cities] Created city ${c.name}, ${c.state} (active=${!!c.active})`);
  }
  console.log('[seed:cities] Completed successfully.');
}

main().catch(e => {
  console.error('[seed:cities] FAILED:', e);
  if (e.code === 'P1001') {
    console.error('[seed:cities] Prisma could not reach the database. Check NETWORK, DATABASE_URL, Neon project status, or IP allow-list.');
  }
  process.exit(1);
}).finally(() => prisma.$disconnect());