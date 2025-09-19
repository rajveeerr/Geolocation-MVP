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

describe('Admin Merchant Approval Flow', () => {
  it('admin can list pending merchants and approve one', async () => {
    // Create admin user manually (upgrade role via prisma)
    const adminRes = await register('admin@example.com');
    expect(adminRes.status).toBe(201);
    await prisma.user.update({ where: { id: adminRes.body.user.id }, data: { role: 'ADMIN' } });

    // Create regular user & merchant application
    const userRes = await register('merchantuser@example.com');
    expect(userRes.status).toBe(201);
    const userToken = await login('merchantuser@example.com');
    // Need an active city for registration
    const city = await prisma.city.create({ data: { name: 'TestCity', state: 'TS', active: true } });
    const regMerchantRes = await request(app)
      .post('/api/merchants/register')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ businessName: 'BizCo', address: '123 Street', cityId: city.id });
    expect(regMerchantRes.status).toBe(201);
    const merchantId = regMerchantRes.body.merchant.id;
    expect(regMerchantRes.body.merchant.status).toBe('PENDING');

    const adminToken = await login('admin@example.com');

    // List pending merchants
    const listRes = await request(app)
      .get('/api/admin/merchants?status=PENDING')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(listRes.status).toBe(200);
    expect(listRes.body.merchants.find((m: any) => m.id === merchantId)).toBeTruthy();

    // Approve merchant
    const approveRes = await request(app)
      .post(`/api/admin/merchants/${merchantId}/approve`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(approveRes.status).toBe(200);
    expect(approveRes.body.merchant.status).toBe('APPROVED');

    // Ensure merchant cannot be approved again (idempotent)
    const approveAgain = await request(app)
      .post(`/api/admin/merchants/${merchantId}/approve`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(approveAgain.status).toBe(200);
    expect(approveAgain.body.message).toMatch(/already approved/i);
  });

  it('admin can reject merchant', async () => {
    const adminRes = await register('admin2@example.com');
    await prisma.user.update({ where: { id: adminRes.body.user.id }, data: { role: 'ADMIN' } });
    const adminToken = await login('admin2@example.com');

    const userRes = await register('merchantreject@example.com');
    const userToken = await login('merchantreject@example.com');
    const city = await prisma.city.create({ data: { name: 'RejectCity', state: 'RC', active: true } });
    const reg = await request(app)
      .post('/api/merchants/register')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ businessName: 'RejectCo', address: '321 Ave', cityId: city.id });
    expect(reg.status).toBe(201);
    const merchantId = reg.body.merchant.id;

    const rejectRes = await request(app)
      .post(`/api/admin/merchants/${merchantId}/reject`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ reason: 'Incomplete documents' });
    expect(rejectRes.status).toBe(200);
    expect(rejectRes.body.merchant.status).toBe('REJECTED');
  });
});
