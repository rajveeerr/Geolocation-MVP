import request from 'supertest';
import app from '../src/app';
import prisma from '../src/lib/prisma';
import jwt from 'jsonwebtoken';
import { getPointConfig } from '../src/lib/points';

// Helper to create a user via API
async function register(email: string) {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ email, password: 'Password123!', name: 'Test User' });
  expect(res.status).toBe(201);
  return res.body.user;
}

// Create merchant + deal directly via prisma (faster than hitting endpoints)
async function createApprovedMerchantWithDeal(ownerUserId: number) {
  const merchant = await prisma.merchant.create({
    data: {
      businessName: 'Test Merchant',
      address: '123 Test St',
      status: 'APPROVED',
      ownerId: ownerUserId,
      latitude: 40.0,
      longitude: -74.0
    }
  });
  const now = new Date();
  const later = new Date(now.getTime() + 60 * 60 * 1000);
  const deal = await prisma.deal.create({
    data: {
      title: 'Test Deal',
      description: 'Desc',
      startTime: now,
      endTime: later,
      redemptionInstructions: 'Show code',
      merchantId: merchant.id
    }
  });
  return { merchant, deal };
}

function signToken(user: { id: number; email: string }) {
  const secret = process.env.JWT_SECRET!;
  return jwt.sign({ userId: user.id, email: user.email }, secret, { expiresIn: '1h' });
}

describe('Check-in & Points Integration', () => {
  const cfg = getPointConfig();

  test('Signup awards signup points and logs SIGNUP event', async () => {
    const user = await register('signup+1@example.com');
    expect(user.points).toBe(cfg.signupPoints);

    const events = await prisma.userPointEvent.findMany({ where: { userId: user.id } });
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('SIGNUP');
    expect(events[0].points).toBe(cfg.signupPoints);
  });

  test('First check-in awards base + first bonus and logs two events', async () => {
    const user = await register('checkin+1@example.com');
    const { deal } = await createApprovedMerchantWithDeal(user.id);
    const token = signToken(user);

    const res = await request(app)
      .post('/api/users/check-in')
      .set('Authorization', `Bearer ${token}`)
      .send({ dealId: deal.id, latitude: 40.0005, longitude: -74.0005 });

    expect(res.status).toBe(200);
    expect(res.body.pointsAwarded).toBe(cfg.checkInPoints + cfg.firstCheckInBonus);
    expect(res.body.firstCheckIn).toBe(true);

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    expect(dbUser?.points).toBe(cfg.signupPoints + cfg.checkInPoints + cfg.firstCheckInBonus);

    const events = await prisma.userPointEvent.findMany({ where: { userId: user.id }, orderBy: { id: 'asc' } });
    expect(events.map(e => e.type)).toEqual(['SIGNUP', 'FIRST_CHECKIN_DEAL', 'CHECKIN']);
  });

  test('Second check-in on same deal only awards base points', async () => {
    const user = await register('checkin+2@example.com');
    const { deal } = await createApprovedMerchantWithDeal(user.id);
    const token = signToken(user);

    const first = await request(app)
      .post('/api/users/check-in')
      .set('Authorization', `Bearer ${token}`)
      .send({ dealId: deal.id, latitude: 40.0, longitude: -74.0 });
    expect(first.status).toBe(200);

    const second = await request(app)
      .post('/api/users/check-in')
      .set('Authorization', `Bearer ${token}`)
      .send({ dealId: deal.id, latitude: 40.0, longitude: -74.0 });

    expect(second.status).toBe(200);
    expect(second.body.pointsAwarded).toBe(cfg.checkInPoints); // no bonus
    expect(second.body.firstCheckIn).toBe(false);

    const events = await prisma.userPointEvent.findMany({ where: { userId: user.id }, orderBy: { id: 'asc' } });
    // SIGNUP + (bonus+base) + base
    expect(events.map(e => e.type)).toEqual(['SIGNUP', 'FIRST_CHECKIN_DEAL', 'CHECKIN', 'CHECKIN']);
  });

  test('Check-in outside radius returns withinRange=false and awards 0 points', async () => {
    const user = await register('checkin+3@example.com');
    const { deal } = await createApprovedMerchantWithDeal(user.id);
    const token = signToken(user);

    const res = await request(app)
      .post('/api/users/check-in')
      .set('Authorization', `Bearer ${token}`)
      // Far away (~15km)
      .send({ dealId: deal.id, latitude: 40.2, longitude: -74.2 });

    expect(res.status).toBe(200);
    expect(res.body.withinRange).toBe(false);
    expect(res.body.pointsAwarded).toBe(0);

    const events = await prisma.userPointEvent.findMany({ where: { userId: user.id } });
    // Only signup event
    expect(events).toHaveLength(1);
  });
});
