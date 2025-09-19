import { Router, Response, Request } from 'express';
import prisma from '../lib/prisma';
import { protect, requireAdmin, AuthRequest } from '../middleware/auth.middleware';
import { sendEmail } from '../lib/email';

// Admin router for internal tooling (minimal for now)
const router = Router();

// --- Merchant Approval Workflows ---
// GET /api/admin/merchants?status=PENDING|APPROVED|REJECTED (default PENDING)
// Lists merchants with owner information for admin review.
router.get('/merchants', protect, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { status = 'PENDING', page = '1', pageSize = '50' } = req.query as Record<string, string>;
    const validStatuses = ['PENDING', 'APPROVED', 'REJECTED'];
    if (!validStatuses.includes(String(status).toUpperCase())) {
      return res.status(400).json({ error: `Invalid status. Must be one of ${validStatuses.join(', ')}` });
    }
    const pageNum = Math.max(parseInt(page) || 1, 1);
    const take = Math.min(Math.max(parseInt(pageSize) || 50, 1), 200);
    const skip = (pageNum - 1) * take;

    const where: any = { status: String(status).toUpperCase() };
    const [total, merchants] = await Promise.all([
      prisma.merchant.count({ where }),
      prisma.merchant.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        select: {
          id: true,
            businessName: true,
            address: true,
            description: true,
            logoUrl: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            owner: { select: { id: true, email: true, name: true, role: true } },
            stores: { select: { id: true, cityId: true, address: true, latitude: true, longitude: true, active: true } }
        }
      })
    ]);

    res.status(200).json({ page: pageNum, pageSize: take, total, merchants });
  } catch (e) {
    console.error('Admin list merchants failed', e);
    res.status(500).json({ error: 'Failed to list merchants' });
  }
});

// POST /api/admin/merchants/:id/approve
// Approves a merchant (id path param). Idempotent.
router.post('/merchants/:id/approve', protect, requireAdmin, async (req: Request, res: Response) => {
  try {
    const merchantId = parseInt(req.params.id, 10);
    if (isNaN(merchantId)) return res.status(400).json({ error: 'Invalid merchant id' });

    const merchant = await prisma.merchant.findUnique({ where: { id: merchantId }, include: { owner: true } });
    if (!merchant) return res.status(404).json({ error: 'Merchant not found' });

    if (merchant.status === 'APPROVED') {
      return res.status(200).json({ message: 'Merchant already approved', merchant });
    }

    const updated = await prisma.merchant.update({ where: { id: merchantId }, data: { status: 'APPROVED' } });

    // Notify owner (best-effort)
    try {
      if (merchant.owner?.email) {
        await sendEmail({
          to: merchant.owner.email,
          subject: 'Your merchant application has been approved',
          html: `<p>Hi ${merchant.owner.name || ''},</p><p>Your merchant application for <strong>${merchant.businessName}</strong> has been approved. You can now create deals.</p>`
        });
      }
    } catch (notifyErr) {
      console.error('Approval email failed', notifyErr);
    }

    res.status(200).json({ message: 'Merchant approved', merchant: updated });
  } catch (e) {
    console.error('Approve merchant failed', e);
    res.status(500).json({ error: 'Failed to approve merchant' });
  }
});

// POST /api/admin/merchants/:id/reject
// Rejects a merchant. Optionally accepts { reason } but not persisted yet (schema lacks field).
router.post('/merchants/:id/reject', protect, requireAdmin, async (req: Request, res: Response) => {
  try {
    const merchantId = parseInt(req.params.id, 10);
    if (isNaN(merchantId)) return res.status(400).json({ error: 'Invalid merchant id' });
    const { reason } = req.body || {};

    const merchant = await prisma.merchant.findUnique({ where: { id: merchantId }, include: { owner: true } });
    if (!merchant) return res.status(404).json({ error: 'Merchant not found' });

    if (merchant.status === 'REJECTED') {
      return res.status(200).json({ message: 'Merchant already rejected', merchant });
    }

    const updated = await prisma.merchant.update({ where: { id: merchantId }, data: { status: 'REJECTED' } });

    // Notify owner (best-effort)
    try {
      if (merchant.owner?.email) {
        await sendEmail({
          to: merchant.owner.email,
          subject: 'Your merchant application has been rejected',
          html: `<p>Hi ${merchant.owner.name || ''},</p><p>Your merchant application for <strong>${merchant.businessName}</strong> has been rejected.${reason ? ' Reason: ' + String(reason) : ''}</p>`
        });
      }
    } catch (notifyErr) {
      console.error('Rejection email failed', notifyErr);
    }

    res.status(200).json({ message: 'Merchant rejected', merchant: updated, note: reason ? 'Reason not stored (no column) - include in email only.' : undefined });
  } catch (e) {
    console.error('Reject merchant failed', e);
    res.status(500).json({ error: 'Failed to reject merchant' });
  }
});

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