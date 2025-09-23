import request from 'supertest';
import app from '../src/app';
import prisma from '../src/lib/prisma';

async function register(email: string, password = 'Password123!') {
  return request(app).post('/api/auth/register').send({ email, password });
}

async function login(email: string, password = 'Password123!') {
  const res = await request(app).post('/api/auth/login').send({ email, password });
  expect(res.status).toBe(200);
  return res.body.token as string;
}

describe('Merchant Menu Items - GET /api/merchants/me/menu', () => {
  it('returns menu items for an approved merchant', async () => {
    // Register user
    const userEmail = 'menu@example.com';
    const regRes = await register(userEmail);
    expect(regRes.status).toBe(201);

    // Create active city
    // @ts-ignore
    const city = await prisma.city.create({ data: { name: 'MenuCity', state: 'MC', active: true } });

    // Login
    const token = await login(userEmail);

    // Register merchant (PENDING)
    const mRes = await request(app)
      .post('/api/merchants/register')
      .set('Authorization', `Bearer ${token}`)
      .send({ businessName: 'MenuBiz', address: '123 Menu St', cityId: city.id });
    expect(mRes.status).toBe(201);
    const merchantId = mRes.body.merchant.id;

    // Approve merchant directly in DB
    await prisma.merchant.update({ where: { id: merchantId }, data: { status: 'APPROVED' } });

    // Seed menu items
    // @ts-ignore
    await prisma.menuItem.createMany({ data: [
      { merchantId, name: 'Spicy Tuna Roll', price: 12.5, category: 'Bites', description: 'Roll', imageUrl: 'https://example.com/roll.png' },
      { merchantId, name: 'Old Fashioned', price: 15.0, category: 'Drinks', description: 'Cocktail', imageUrl: 'https://example.com/drink.png' }
    ]});

    const res = await request(app)
      .get('/api/merchants/me/menu')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.menuItems)).toBe(true);
    expect(res.body.menuItems.length).toBe(2);
    const names = res.body.menuItems.map((m: any) => m.name).sort();
    expect(names).toEqual(['Old Fashioned', 'Spicy Tuna Roll'].sort());
    expect(res.body.menuItems[0]).toHaveProperty('price');
    expect(res.body.menuItems[0]).not.toHaveProperty('description'); // hidden per select
  });

  it('rejects non-approved merchant', async () => {
    const email = 'pendingmenu@example.com';
    const reg = await register(email);
    expect(reg.status).toBe(201);
    // @ts-ignore
    const city = await prisma.city.create({ data: { name: 'PendingCity', state: 'PC', active: true } });
    const token = await login(email);
    const mRes = await request(app)
      .post('/api/merchants/register')
      .set('Authorization', `Bearer ${token}`)
      .send({ businessName: 'PendingBiz', address: '789 Ave', cityId: city.id });
    expect(mRes.status).toBe(201);

    // Should get 403 because merchant not approved yet
    const res = await request(app)
      .get('/api/merchants/me/menu')
      .set('Authorization', `Bearer ${token}`);
    expect([401,403]).toContain(res.status); // depending on middleware handling
  });
});
