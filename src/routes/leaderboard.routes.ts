import { Router, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { getLeaderboard } from '../lib/leaderboard/leaderboard';

const router = Router();

// Optional auth: attaches user if token valid; silently continues if not.
async function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer')) return next();
  const token = header.split(' ')[1];
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) return next();
  try {
    const jwtLib = (await import('jsonwebtoken')).default;
    const decoded: any = jwtLib.verify(token, jwtSecret) as { userId: number; email: string };
    req.user = { id: decoded.userId, email: decoded.email };
  } catch { /* ignore */ }
  next();
}

// GET /api/leaderboard
router.get('/', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { period, limit, includeSelf, year, month, from, to } = req.query;
    const selfUserId = req.user?.id;

    const limitNum = limit ? parseInt(String(limit), 10) : undefined;
    const includeSelfBool = includeSelf === undefined ? true : String(includeSelf).toLowerCase() === 'true';

    const yearNum = year ? parseInt(String(year), 10) : undefined;
    const monthNum = month ? parseInt(String(month), 10) : undefined;

    const result = await getLeaderboard({
      period: period as string | undefined,
      limit: limitNum,
      includeSelf: includeSelfBool,
      selfUserId,
      year: yearNum,
      month: monthNum,
      from: from as string | undefined,
      to: to as string | undefined,
    });

    res.status(200).json(result);
  } catch (e: any) {
    if (/period/i.test(e.message) || /custom period/i.test(e.message) || /limit/i.test(e.message) || /month must be/.test(e.message)) {
      return res.status(400).json({ error: e.message });
    }
    console.error('Leaderboard error:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
