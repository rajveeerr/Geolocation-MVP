import request from 'supertest';
import app from '../src/app';
import prisma from '../src/lib/prisma';

describe('Referral Code Generation', () => {
  it('assigns a referralCode during registration', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'referral@example.com', password: 'Password123!' });
    expect(res.status).toBe(201);
    const userId = res.body.user.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    // @ts-ignore pending prisma generate
    expect(user?.referralCode).toBeDefined();
    // @ts-ignore
    expect((user!.referralCode as string).length).toBe(8);
  });
});
