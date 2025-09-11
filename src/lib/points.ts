// src/lib/points.ts
// Centralized helpers for gamification point configuration & awarding logic.
// Keeps environment variable parsing in one place so routes stay lean.

// NOTE: All numeric env vars gracefully fallback to sensible defaults if
// not provided or invalid (<=0 or NaN).

function parsePositiveInt(envVal: string | undefined, fallback: number): number {
  if (!envVal) return fallback;
  const n = parseInt(envVal, 10);
  if (isNaN(n) || n <= 0) return fallback;
  return n;
}

export function getPointConfig() {
  return {
    signupPoints: parsePositiveInt(process.env.SIGNUP_POINTS, 50),
    checkInPoints: parsePositiveInt(process.env.CHECKIN_POINTS, 10),
    firstCheckInBonus: parsePositiveInt(process.env.FIRST_CHECKIN_BONUS_POINTS, 25),
    checkInRadiusMeters: parsePositiveInt(process.env.CHECKIN_RADIUS_METERS, 100),
  } as const;
}

export type PointConfig = ReturnType<typeof getPointConfig>;

// Small utility so routes can lazily grab a fresh snapshot (in case envs change between deploys)
export const pointsConfig = getPointConfig();

// If we ever add more complex, feature-flag driven logic (tiers, streaks, etc.)
// we can expand with strategy objects here without changing route handlers.
