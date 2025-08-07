// src/routes/deals.public.routes.ts

import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// --- Endpoint: GET /api/deals ---
// Fetches all active deals from approved merchants.
router.get('/deals', async (req, res) => {
  try {
    const now = new Date();
    const deals = await prisma.deal.findMany({
      where: {
        // Filter for active deals
        startTime: { lte: now },
        endTime: { gte: now },
        // IMPORTANT: Only show deals from approved merchants
        merchant: {
          status: 'APPROVED',
        },
      },
      include: {
        merchant: {
          select: {
            businessName: true,
            address: true,
            logoUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json(deals);
  } catch (error) {
    console.error('Error fetching deals:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;