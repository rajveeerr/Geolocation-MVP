// src/routes/merchant.routes.ts
import { Router } from 'express';
import { protect, isApprovedMerchant, AuthRequest } from '../middleware/auth.middleware';
import prisma from '../lib/prisma';

const router = Router();

// --- Endpoint: POST /api/merchants/register ---
// Allows a user to register as a merchant.
router.post('/merchants/register', protect, async (req: AuthRequest, res) => {
  try {
    const { businessName, address, description, logoUrl } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!businessName || !address) {
      return res.status(400).json({ error: 'Business name and address are required' });
    }

    const existingMerchant = await prisma.merchant.findUnique({
      where: { ownerId: userId },
    });

    if (existingMerchant) {
      return res.status(409).json({ error: 'You have already registered as a merchant.' });
    }

    const [merchant] = await prisma.$transaction([
      prisma.merchant.create({
        data: {
          businessName,
          address,
          description,
          logoUrl,
          owner: { connect: { id: userId } },
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { role: 'MERCHANT' },
      }),
    ]);

    res.status(201).json({
      message: 'Merchant application submitted successfully. It is now pending approval.',
      merchant,
    });

  } catch (error) {
    console.error('Merchant registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- Endpoint: POST /api/deals ---
// Allows an APPROVED merchant to create a new deal.
router.post('/deals', protect, isApprovedMerchant, async (req: AuthRequest, res) => {
  try {
    const { title, description, startTime, endTime, redemptionInstructions, discountPercentage, discountAmount } = req.body;
    const merchantId = req.merchant?.id; // Get merchantId from our middleware

    // Input validation
    if (!title || !description || !startTime || !endTime) {
        return res.status(400).json({ error: 'Title, description, start time, and end time are required.'});
    }

    const newDeal = await prisma.deal.create({
        data: {
            title,
            description,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            redemptionInstructions,
            discountPercentage: discountPercentage ? parseInt(discountPercentage, 10) : null,
            discountAmount: discountAmount ? parseFloat(discountAmount) : null,
            merchant: {
                connect: { id: merchantId }
            }
        }
    });

    res.status(201).json({ message: 'Deal created successfully', deal: newDeal });

  } catch (error) {
    console.error('Deal creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;