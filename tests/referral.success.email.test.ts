import request from 'supertest';
import app from '../src/app';
import prisma from '../src/lib/prisma';

jest.mock('../src/lib/email', () => {
  const original = jest.requireActual('../src/lib/email');
  return {
    ...original,
    sendEmail: jest.fn().mockResolvedValue(undefined),
  };
});

import { sendEmail } from '../src/lib/email';

async function register(email: string, referralCode?: string) {
  const payload: any = { email, password: 'Password123!' };
  if (referralCode) payload.referralCode = referralCode;
  const res = await request(app).post('/api/auth/register').send(payload);
  return res;
}

describe('Referral Success Email', () => {
  it('sends a referral success email to referrer when code used', async () => {
    const referrerRes = await register('refsuccessreferrer@example.com');
    expect(referrerRes.status).toBe(201);
    const referrerId = referrerRes.body.user.id;
    const referrer = await prisma.user.findUnique({ where: { id: referrerId } });
    // @ts-ignore
    const code = referrer?.referralCode as string;
    expect(code).toBeDefined();

    const referredRes = await register('refsuccessreferred@example.com', code);
    expect(referredRes.status).toBe(201);

    // find a call with tag 'referral-success' and to = referrer email
    const calls = (sendEmail as jest.Mock).mock.calls;
    const match = calls.find((c: any[]) => c[0]?.tags?.includes('referral-success'));
    expect(match).toBeTruthy();
    expect(match[0].to).toMatchObject({ email: 'refsuccessreferrer@example.com' });
  });
});
