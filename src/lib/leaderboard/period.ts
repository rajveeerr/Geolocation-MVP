// src/lib/leaderboard/period.ts
// Utilities to resolve leaderboard periods into concrete UTC time ranges.

export type PeriodGranularity = 'day' | 'week' | 'month' | 'all-time' | 'custom';

export interface PeriodRange {
  granularity: PeriodGranularity;
  start: Date;           // inclusive
  endExclusive: Date;    // exclusive upper bound
  label: string;         // human friendly label (e.g. 'September 2025')
}

function startOfUTC(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function addUTCMonths(date: Date, n: number) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + n, 1));
}

function startOfUTCWeekISO(date: Date) {
  // ISO week starts Monday. Get day (0=Sun..6=Sat)
  const day = date.getUTCDay();
  const diff = (day === 0 ? -6 : 1 - day); // shift so Monday is first
  const monday = new Date(date);
  monday.setUTCDate(date.getUTCDate() + diff);
  return startOfUTC(monday);
}

export interface ResolvePeriodInput {
  period?: string;
  year?: number; // for explicit month lookups
  month?: number; // 1-12
  from?: string; // ISO
  to?: string;   // ISO
  now?: Date;    // test override
}

export function resolvePeriod(input: ResolvePeriodInput): PeriodRange {
  const now = input.now ?? new Date();
  const period = (input.period || 'month').toLowerCase() as PeriodGranularity;

  if (period === 'all-time') {
    return { granularity: 'all-time', start: new Date(0), endExclusive: new Date(now.getTime() + 1000), label: 'All Time' };
  }

  if (period === 'custom') {
    if (!input.from || !input.to) throw new Error('from and to required for custom period');
    const start = new Date(input.from);
    const endExclusive = new Date(input.to);
    if (isNaN(start.getTime()) || isNaN(endExclusive.getTime())) throw new Error('Invalid from/to date');
    if (endExclusive <= start) throw new Error('to must be after from');
    const maxSpanMs = 1000 * 60 * 60 * 24 * 31; // 31 days limit
    if (endExclusive.getTime() - start.getTime() > maxSpanMs) throw new Error('Custom period too long (max 31 days)');
    return { granularity: 'custom', start, endExclusive, label: 'Custom' };
  }

  if (period === 'day') {
    const start = startOfUTC(now);
    const endExclusive = new Date(start.getTime() + 86400000);
    return { granularity: 'day', start, endExclusive, label: start.toISOString().slice(0,10) };
  }

  if (period === 'week') {
    const start = startOfUTCWeekISO(now);
    const endExclusive = new Date(start.getTime() + 7 * 86400000);
    return { granularity: 'week', start, endExclusive, label: 'Week of ' + start.toISOString().slice(0,10) };
  }

  if (period === 'month') {
    let year = input.year ?? now.getUTCFullYear();
    let month = input.month ?? (now.getUTCMonth() + 1);
    if (month < 1 || month > 12) throw new Error('month must be 1-12');
    const start = new Date(Date.UTC(year, month - 1, 1));
    const endExclusive = addUTCMonths(start, 1);
    const label = start.toLocaleString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
    return { granularity: 'month', start, endExclusive, label };
  }

  throw new Error('Unsupported period');
}
