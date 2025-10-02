// src/jobs/monthlyReset.ts
// Resets monthlyPoints for all users at the start of each UTC month.
// Also archives the previous month into an optional historical table in future (placeholder).

import prisma from '../lib/prisma';

export async function resetMonthlyPoints() {
  // Single SQL update; could be large but simple. Consider batching if user count huge.
  await prisma.$executeRawUnsafe('UPDATE "User" SET "monthlyPoints" = 0');
}

// Compute ms until next month UTC
function msUntilNextMonthUTC(now = new Date()) {
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const firstNext = new Date(Date.UTC(year, month + 1, 1, 0, 0, 0, 0));
  const ms = firstNext.getTime() - now.getTime();
  
  // Cap at maximum safe timeout value (24 days)
  const MAX_SAFE_TIMEOUT = 24 * 24 * 60 * 60 * 1000; // 24 days in ms
  return Math.min(ms, MAX_SAFE_TIMEOUT);
}

let timer: NodeJS.Timeout | null = null;

export function scheduleMonthlyReset() {
  if (timer) return; // idempotent
  const schedule = async () => {
    try {
      await resetMonthlyPoints();
      console.log('[monthly-reset]: Points reset completed successfully');
      // After running, schedule next month
      const nextRun = msUntilNextMonthUTC();
      console.log(`[monthly-reset]: Next reset scheduled in ${Math.round(nextRun / 1000 / 60 / 60)} hours`);
      timer = setTimeout(schedule, nextRun);
    } catch (e) {
      console.error('Monthly points reset failed:', e);
      // Retry in 1 hour if failure
      timer = setTimeout(schedule, 60 * 60 * 1000);
    }
  };
  
  // Initial delay until next month boundary
  const initialDelay = msUntilNextMonthUTC();
  console.log(`[monthly-reset]: Initial scheduling - next reset in ${Math.round(initialDelay / 1000 / 60 / 60)} hours`);
  timer = setTimeout(schedule, initialDelay);
}
