import { Router, Response, Request } from 'express';
import prisma from '../lib/prisma';
import { protect, requireAdmin, AuthRequest } from '../middleware/auth.middleware';
import { sendEmail } from '../lib/email';

// Admin router for internal tooling (minimal for now)
const router = Router();

// GET /api/admin/referrals
// Returns list of successful referrals for manual reward processing.
// Definition: a referral is a user whose referredByUserId is set (i.e., they were referred).
// Supports pagination & optional filtering by referrer email or referred email.
router.get('/referrals', protect, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
  const { page = '1', pageSize = '50', referrerEmail, referredEmail, format, includeGlobal } = req.query as Record<string, string>;
    const pageNum = Math.max(parseInt(page) || 1, 1);
    const take = Math.min(Math.max(parseInt(pageSize) || 50, 1), 200);
    const skip = (pageNum - 1) * take;

    const where: any = { referredByUserId: { not: null } };

    if (referrerEmail) {
      // Find referrer user IDs matching email pattern
      where.referredByUserId = {
        in: (await prisma.user.findMany({ where: { email: { contains: referrerEmail, mode: 'insensitive' } }, select: { id: true } })).map(u => u.id)
      };
    }
    if (referredEmail) {
      where.email = { contains: referredEmail, mode: 'insensitive' };
    }

    // Using broader selection because generated Prisma types might not yet include new referral relations
    const [total, referredUsersRaw] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      })
    ]);

    const referredUsers = referredUsersRaw as any[];

    // Aggregate counts per referrer for quick admin glance
    const referrerCounts: Record<number, number> = {};
    const referrerIds = new Set<number>();
    for (const u of referredUsers) {
      const referrerId = (u as any).referredByUserId;
      if (referrerId) {
        referrerCounts[referrerId] = (referrerCounts[referrerId] || 0) + 1;
        referrerIds.add(referrerId);
      }
    }
    const referrers = await prisma.user.findMany({ where: { id: { in: Array.from(referrerIds) } }, select: { id: true, email: true, name: true, referralCode: true } });
    const referrerMap: Record<number, any> = {};
    referrers.forEach(r => { referrerMap[r.id] = r; });

    const referralsData = referredUsers.map((u: any) => {
      const ref = referrerMap[u.referredByUserId];
      return {
        userId: u.id,
        userEmail: u.email,
        userName: u.name,
        userSignup: u.createdAt,
        referrerId: ref?.id,
        referrerEmail: ref?.email,
        referrerName: ref?.name,
        referrerReferralCode: ref?.referralCode,
      };
    });

    // Optional: global top referrers (expensive-ish). Only when requested & first page.
    let globalTop: any[] | undefined;
    if (includeGlobal === 'true' && pageNum === 1) {
      try {
        const rows = await prisma.$queryRaw<any[]>`SELECT "referredByUserId" AS referrer_id, COUNT(*)::bigint AS count FROM "User" WHERE "referredByUserId" IS NOT NULL GROUP BY 1 ORDER BY count DESC LIMIT 50`;
        globalTop = rows.map(r => ({ referrerId: Number(r.referrer_id), count: Number(r.count) }));
        // Hydrate emails
        const ids = globalTop.map(g => g.referrerId);
        const users = await prisma.user.findMany({ where: { id: { in: ids } }, select: { id: true, email: true, name: true, referralCode: true } });
        const map: Record<number, any> = {};
        users.forEach(u => map[u.id] = u);
        globalTop = globalTop.map(g => ({ ...g, email: map[g.referrerId]?.email, name: map[g.referrerId]?.name, referralCode: map[g.referrerId]?.referralCode }));
      } catch (e) {
        console.error('Global top referrers query failed', e);
      }
    }

    if (format === 'csv') {
      const header = 'userId,userEmail,userName,userSignup,referrerId,referrerEmail,referrerName,referrerReferralCode';
      const lines = referralsData.map(r => [r.userId, r.userEmail, r.userName || '', r.userSignup.toISOString(), r.referrerId || '', r.referrerEmail || '', r.referrerName || '', r.referrerReferralCode || '']
        .map(field => typeof field === 'string' && field.includes(',') ? `"${field.replace(/"/g, '""')}"` : field).join(','));
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="referrals_page'+pageNum+'.csv"');
      return res.status(200).send([header, ...lines].join('\n'));
    }

    res.status(200).json({
      page: pageNum,
      pageSize: take,
      total,
      referrals: referralsData,
      referrerSummary: Object.entries(referrerCounts).map(([referrerId, count]) => ({ referrerId: Number(referrerId), count })),
      globalTopReferrers: globalTop
    });
  } catch (err) {
    console.error('Admin referrals fetch failed', err);
    res.status(500).json({ error: 'Failed to fetch referrals' });
  }
});

// POST /api/admin/test-email
// Body: { to: string, subject?: string }
// Sends a simple test email to verify Brevo integration (admin only)
router.post('/test-email', protect, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { to, subject } = req.body || {};
    if (!to || typeof to !== 'string') {
      return res.status(400).json({ error: 'Missing required field: to' });
    }
    await sendEmail({
      to,
      subject: subject || 'Test Email - YOHOP',
      html: '<p>This is a test email confirming Brevo integration is working.</p>'
    });
    res.status(200).json({ message: 'Email dispatched (check logs for delivery status)' });
  } catch (e) {
    console.error('Test email send failed', e);
    res.status(500).json({ error: 'Failed to send test email' });
  }
});

export default router;