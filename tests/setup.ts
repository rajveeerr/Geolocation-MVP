/// <reference types="jest" />
import { execSync } from 'child_process';
import prisma from '../src/lib/prisma';
import { resetDatabase } from '../src/app';

// Ensure NODE_ENV=test
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
process.env.SIGNUP_POINTS = process.env.SIGNUP_POINTS || '50';
process.env.CHECKIN_POINTS = process.env.CHECKIN_POINTS || '10';
process.env.FIRST_CHECKIN_BONUS_POINTS = process.env.FIRST_CHECKIN_BONUS_POINTS || '25';
process.env.CHECKIN_RADIUS_METERS = process.env.CHECKIN_RADIUS_METERS || '200';

beforeAll(async () => {
  // Run prisma migrate deploy to ensure schema is ready for tests
  // (Assumes DATABASE_URL points to a test DB)
  try {
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  } catch (e) {
    console.error('Failed to run migrations for tests', e);
    throw e;
  }
  await resetDatabase();
});

afterEach(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await prisma.$disconnect();
});
