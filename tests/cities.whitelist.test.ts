import request from 'supertest';
import app from '../src/app';
import prisma from '../src/lib/prisma';

// Helper to seed some cities
async function seedCities() {
  // @ts-ignore
  await prisma.city.createMany({ data: [
    { name: 'Philadelphia', state: 'Pennsylvania', active: true },
    { name: 'San Francisco', state: 'California', active: true },
    { name: 'New York', state: 'New York', active: true },
    { name: 'Inactive City', state: 'Nowhere', active: false }
  ]});
}

describe('GET /api/cities/whitelist', () => {
  beforeEach(async () => {
    await seedCities();
  });

  it('returns only active city names sorted alphabetically', async () => {
    const res = await request(app).get('/api/cities/whitelist');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.cities)).toBe(true);
    expect(res.body.cities).toEqual(['New York', 'Philadelphia', 'San Francisco'].sort()); // sorted already
    // ensure inactive not present
    expect(res.body.cities).not.toContain('Inactive City');
  });
});
