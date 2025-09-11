import request from 'supertest';
import app from '../src/app';
import prisma from '../src/lib/prisma';

async function register(email: string, referralCode?: string) {
  const payload: any = { email, password: 'Password123!' };
  if (referralCode) payload.referralCode = referralCode;
  const res = await request(app).post('/api/auth/register').send(payload);
  return res;
}

async function login(email: string) {
  const res = await request(app).post('/api/auth/login').send({ email, password: 'Password123!' });
  return res.body.token as string;
}

describe('GET /api/users/referrals', () => {
  it('returns referral count for a user', async () => {
    // Create referrer
    const referrerRes = await register('referrer@example.com');
    expect(referrerRes.status).toBe(201);
    const referrerId = referrerRes.body.user.id;
    const referrer = await prisma.user.findUnique({ where: { id: referrerId } });
    // @ts-ignore
    const code = referrer?.referralCode as string;
    expect(code).toBeDefined();

    // Register two referred users
    await register('referred1@example.com', code);
    await register('referred2@example.com', code);

    const token = await login('referrer@example.com');
    const res = await request(app).get('/api/users/referrals').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.referralCode).toBe(code);
    expect(res.body.referralCount).toBe(2);
  });
});
