// src/lib/leaderboard/leaderboard.ts
// Core leaderboard query + ranking logic.

import prisma from '../prisma';
import { resolvePeriod, ResolvePeriodInput } from './period';

export interface LeaderboardRow {
  userId: number;
  name: string | null;
  periodPoints: number;
  totalPoints: number;
  rank: number; // assigned after tie-aware ranking
}

export interface LeaderboardResult {
  period: { granularity: string; start: string; endExclusive: string; label: string };
  top: LeaderboardRow[];
  me?: LeaderboardRow & { inTop: boolean };
}

interface GetLeaderboardArgs extends ResolvePeriodInput {
  limit?: number;
  includeSelf?: boolean;
  selfUserId?: number; // optional authenticated user id
}

export async function getLeaderboard(args: GetLeaderboardArgs): Promise<LeaderboardResult> {
  const { limit = 10, includeSelf = true, selfUserId } = args;
  if (limit <= 0 || limit > 50) throw new Error('limit must be 1-50');

  const period = resolvePeriod(args);

  // Raw period aggregation for top users
  const topRaw = await prisma.$queryRawUnsafe<{
    id: number; name: string | null; period_points: bigint | number; total_points: number; 
  }[]>(
    `SELECT u.id, u.name, SUM(e.points) AS period_points, u.points as total_points
     FROM "UserPointEvent" e
     JOIN "User" u ON u.id = e."userId"
     WHERE e."createdAt" >= $1 AND e."createdAt" < $2
     GROUP BY u.id
     ORDER BY period_points DESC, u.id ASC
     LIMIT $3`,
    period.start,
    period.endExclusive,
    limit
  );

  // Convert to rows and later assign ranks
  const topPreRank: LeaderboardRow[] = topRaw.map((r) => ({
    userId: r.id,
    name: r.name,
    periodPoints: Number(r.period_points),
    totalPoints: Number(r.total_points),
    rank: 0
  }));

  // Assign competition ranks (1,1,3 style)
  let lastPoints: number | null = null;
  let lastRank = 0;
  topPreRank.forEach((row: LeaderboardRow, idx: number) => {
    if (lastPoints === null || row.periodPoints < lastPoints) {
      lastRank = idx + 1;
      lastPoints = row.periodPoints;
    }
    row.rank = lastRank;
  });

  let me: LeaderboardResult['me'];

  if (selfUserId && includeSelf) {
    const inTop = topPreRank.some((r: LeaderboardRow) => r.userId === selfUserId);
    if (inTop) {
      const row = topPreRank.find((r: LeaderboardRow) => r.userId === selfUserId)!;
      me = { ...row, inTop: true };
    } else {
      // Need personal points this period
      const personal = await prisma.$queryRawUnsafe<{ me_points: bigint | number }[]>(
        `SELECT COALESCE(SUM(points),0) as me_points
         FROM "UserPointEvent"
         WHERE "userId" = $1 AND "createdAt" >= $2 AND "createdAt" < $3`,
        selfUserId,
        period.start,
        period.endExclusive
      );
      const myPoints = Number(personal[0]?.me_points || 0);

      if (myPoints > 0) {
        // Count users strictly above
        const higher = await prisma.$queryRawUnsafe<{ higher: bigint | number }[]>(
          `SELECT COUNT(*) as higher FROM (
             SELECT "userId", SUM(points) s
             FROM "UserPointEvent"
             WHERE "createdAt" >= $1 AND "createdAt" < $2
             GROUP BY "userId"
             HAVING SUM(points) > $3
           ) t`,
          period.start,
          period.endExclusive,
          myPoints
        );
        const myRank = Number(higher[0]?.higher || 0) + 1;
        // Fetch total points + name
        const user = await prisma.user.findUnique({ where: { id: selfUserId }, select: { id: true, name: true, points: true } });
        if (user) {
          me = { userId: user.id, name: user.name, periodPoints: myPoints, totalPoints: user.points, rank: myRank, inTop: false };
        }
      } else {
        // No points this period -> still return base identity with rank undefined? We'll omit rank for 0-case.
        const user = await prisma.user.findUnique({ where: { id: selfUserId }, select: { id: true, name: true, points: true } });
        if (user) {
          me = { userId: user.id, name: user.name, periodPoints: 0, totalPoints: user.points, rank: 0, inTop: false };
        }
      }
    }
  }

  return {
    period: {
      granularity: period.granularity,
      start: period.start.toISOString(),
      endExclusive: period.endExclusive.toISOString(),
      label: period.label
    },
    top: topPreRank,
    me
  };
}
