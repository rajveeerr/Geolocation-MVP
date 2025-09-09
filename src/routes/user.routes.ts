import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { protect, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// Validation schema for saving a deal
const saveDealSchema = z.object({
  dealId: z.number().int().positive({ message: "Deal ID must be a positive integer" }),
});

// --- Endpoint: POST /api/users/save-deal ---
// Save a deal for the authenticated user
router.post('/save-deal', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { dealId } = saveDealSchema.parse(req.body);
    const userId = req.user!.id;

    // Check if the deal exists
    const deal = await prisma.deal.findUnique({
      where: { id: dealId },
      include: {
        merchant: {
          select: {
            businessName: true,
            status: true
          }
        }
      }
    });

    if (!deal) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    // Check if the deal is from an approved merchant
    if (deal.merchant.status !== 'APPROVED') {
      return res.status(400).json({ 
        error: 'Cannot save deals from unapproved merchants' 
      });
    }

    // Check if the deal is still valid (not expired)
    const now = new Date();
    if (deal.endTime < now) {
      return res.status(400).json({ 
        error: 'Cannot save expired deals' 
      });
    }

    // Check if the user has already saved this deal
    const existingSave = await prisma.userDeal.findUnique({
      where: {
        userId_dealId: {
          userId,
          dealId
        }
      }
    });

    if (existingSave) {
      return res.status(409).json({ 
        error: 'Deal already saved by this user' 
      });
    }

    // Save the deal
    const savedDeal = await prisma.userDeal.create({
      data: {
        userId,
        dealId
      },
      include: {
        deal: {
          include: {
            merchant: {
              select: {
                businessName: true,
                address: true,
                latitude: true,
                longitude: true
              }
            }
          }
        }
      }
    });

    res.status(201).json({
      message: 'Deal saved successfully',
      savedDeal: {
        id: savedDeal.id,
        savedAt: savedDeal.savedAt,
        deal: {
          id: savedDeal.deal.id,
          title: savedDeal.deal.title,
          description: savedDeal.deal.description,
          imageUrl: savedDeal.deal.imageUrl,
          discountPercentage: savedDeal.deal.discountPercentage,
          discountAmount: savedDeal.deal.discountAmount,
          category: savedDeal.deal.category,
          dealType: savedDeal.deal.dealType,
          recurringDays: savedDeal.deal.recurringDays,
          startTime: savedDeal.deal.startTime,
          endTime: savedDeal.deal.endTime,
          redemptionInstructions: savedDeal.deal.redemptionInstructions,
          merchant: savedDeal.deal.merchant
        }
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues });
    }
    console.error('Save deal error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- Endpoint: DELETE /api/users/save-deal/:dealId ---
// Remove a saved deal for the authenticated user
router.delete('/save-deal/:dealId', protect, async (req: AuthRequest, res: Response) => {
  try {
    const dealId = parseInt(req.params.dealId);
    const userId = req.user!.id;

    if (isNaN(dealId)) {
      return res.status(400).json({ error: 'Invalid deal ID' });
    }

    // Check if the user has saved this deal
    const savedDeal = await prisma.userDeal.findUnique({
      where: {
        userId_dealId: {
          userId,
          dealId
        }
      }
    });

    if (!savedDeal) {
      return res.status(404).json({ 
        error: 'Deal not found in your saved deals' 
      });
    }

    // Remove the saved deal
    await prisma.userDeal.delete({
      where: {
        userId_dealId: {
          userId,
          dealId
        }
      }
    });

    res.status(200).json({
      message: 'Deal removed from saved deals successfully'
    });

  } catch (error) {
    console.error('Remove saved deal error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- Endpoint: GET /api/users/saved-deals ---
// Get all saved deals for the authenticated user
router.get('/saved-deals', protect, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const savedDeals = await prisma.userDeal.findMany({
      where: { userId },
      include: {
        deal: {
          include: {
            merchant: {
              select: {
                businessName: true,
                address: true,
                latitude: true,
                longitude: true
              }
            }
          }
        }
      },
      orderBy: {
        savedAt: 'desc'
      }
    });

    // Filter out expired deals and format response
    const now = new Date();
    const activeSavedDeals = savedDeals
      .filter((savedDeal: any) => savedDeal.deal.endTime >= now)
      .map((savedDeal: any) => ({
        id: savedDeal.id,
        savedAt: savedDeal.savedAt,
        deal: {
          id: savedDeal.deal.id,
          title: savedDeal.deal.title,
          description: savedDeal.deal.description,
          imageUrl: savedDeal.deal.imageUrl,
          discountPercentage: savedDeal.deal.discountPercentage,
          discountAmount: savedDeal.deal.discountAmount,
          category: savedDeal.deal.category,
          startTime: savedDeal.deal.startTime,
          endTime: savedDeal.deal.endTime,
          redemptionInstructions: savedDeal.deal.redemptionInstructions,
          merchant: savedDeal.deal.merchant
        }
      }));

    res.status(200).json({
      message: 'Saved deals retrieved successfully',
      savedDeals: activeSavedDeals,
      totalCount: activeSavedDeals.length
    });

  } catch (error) {
    console.error('Get saved deals error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- Endpoint: GET /api/users/saved-deals/:dealId ---
// Check if a specific deal is saved by the authenticated user
router.get('/saved-deals/:dealId', protect, async (req: AuthRequest, res: Response) => {
  try {
    const dealId = parseInt(req.params.dealId);
    const userId = req.user!.id;

    if (isNaN(dealId)) {
      return res.status(400).json({ error: 'Invalid deal ID' });
    }

    const savedDeal = await prisma.userDeal.findUnique({
      where: {
        userId_dealId: {
          userId,
          dealId
        }
      }
    });

    res.status(200).json({
      isSaved: !!savedDeal,
      savedAt: savedDeal?.savedAt || null
    });

  } catch (error) {
    console.error('Check saved deal error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
