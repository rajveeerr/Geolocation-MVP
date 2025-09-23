import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { protect, AuthRequest } from '../middleware/auth.middleware';
import { getPointConfig } from '../lib/points';
import { invalidateLeaderboardCache } from '../lib/leaderboard/cache';

const router = Router();

// Validation schema for saving a deal
const saveDealSchema = z.object({
  dealId: z.number().int().positive({ message: "Deal ID must be a positive integer" }),
});

// Validation schema for check-in
const checkInSchema = z.object({
  dealId: z.number().int().positive(),
  latitude: z.number().refine(v => v >= -90 && v <= 90, { message: 'Latitude must be between -90 and 90.' }),
  longitude: z.number().refine(v => v >= -180 && v <= 180, { message: 'Longitude must be between -180 and 180.' })
});

// Simple Haversine distance (meters)
function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // meters
  const toRad = (d: number) => d * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

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
          // imageUrl deprecated: schema now uses imageUrls (string[])
          imageUrls: savedDeal.deal.imageUrls,
          // Provide first image for backward compatibility with older clients expecting `imageUrl`
          imageUrl: savedDeal.deal.imageUrls?.[0] || null,
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

// --- Endpoint: POST /api/users/check-in ---
// Verifies that an authenticated user is physically near the merchant location for a given deal.
// Body: { dealId: number, latitude: number, longitude: number }
// Response: { dealId, merchantId, distanceMeters, withinRange, thresholdMeters, dealActive }
router.post('/check-in', protect, async (req: AuthRequest, res: Response) => {
  try {
    // Parse & validate input
    const parsed = checkInSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.issues });
    }
    const { dealId, latitude, longitude } = parsed.data;
    const userId = req.user!.id;

    // Fetch deal with merchant location
    const deal = await prisma.deal.findUnique({
      where: { id: dealId },
      include: {
        merchant: { select: { id: true, status: true, latitude: true, longitude: true } }
      }
    });

    if (!deal) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    if (deal.merchant.status !== 'APPROVED') {
      return res.status(400).json({ error: 'Deal merchant is not approved' });
    }

    if (deal.merchant.latitude == null || deal.merchant.longitude == null) {
      return res.status(400).json({ error: 'Merchant location not set; cannot perform check-in.' });
    }

    const now = new Date();
    const dealActive = deal.startTime <= now && deal.endTime >= now;
    if (!dealActive) {
      return res.status(400).json({ error: 'Deal is not currently active.' });
    }

    // Distance calculation
    const distanceMeters = haversineMeters(latitude, longitude, deal.merchant.latitude, deal.merchant.longitude);

    const { checkInRadiusMeters, checkInPoints, firstCheckInBonus } = getPointConfig();

    const thresholdMeters = checkInRadiusMeters;
    const withinRange = distanceMeters <= thresholdMeters;

    if (!withinRange) {
      return res.status(200).json({
        dealId: deal.id,
        merchantId: deal.merchant.id,
        userId,
        distanceMeters: Math.round(distanceMeters * 100) / 100,
        withinRange,
        thresholdMeters,
        dealActive,
        pointsAwarded: 0,
        pointEvents: []
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Check if user has an existing check-in for this deal
      const priorCheckIn = await tx.checkIn.findFirst({
        where: { userId, dealId: deal.id },
        select: { id: true }
      });

      // Create check-in record
      const checkIn = await tx.checkIn.create({
        data: {
          userId,
          dealId: deal.id,
          merchantId: deal.merchant.id,
          latitude,
          longitude,
          distanceMeters
        }
      });

      let totalAward = checkInPoints;
      const events: any[] = [];

      // Award first-checkin bonus if none exists
      if (!priorCheckIn) {
        totalAward += firstCheckInBonus;
        events.push(await tx.userPointEvent.create({
          data: {
            userId,
            dealId: deal.id,
            type: 'FIRST_CHECKIN_DEAL',
            points: firstCheckInBonus
          }
        }));
      }

      // Always log generic check-in points
      events.push(await tx.userPointEvent.create({
        data: {
          userId,
          dealId: deal.id,
          type: 'CHECKIN',
          points: checkInPoints
        }
      }));

      // Increment user total points
      await tx.user.update({
        where: { id: userId },
        data: ({ points: { increment: totalAward }, monthlyPoints: { increment: totalAward } } as any)
      });

      return { checkIn, totalAward, events, prior: !!priorCheckIn };
    });

  // Invalidate relevant caches (current month/day/week)
  invalidateLeaderboardCache('day');
  invalidateLeaderboardCache('month');
  invalidateLeaderboardCache('week');

    return res.status(200).json({
      dealId: deal.id,
      merchantId: deal.merchant.id,
      userId,
      distanceMeters: Math.round(distanceMeters * 100) / 100,
      withinRange: true,
      thresholdMeters,
      dealActive,
      pointsAwarded: result.totalAward,
      firstCheckIn: !result.prior,
      pointEvents: result.events.map(e => ({ id: e.id, type: e.type, points: e.points }))
    });
  } catch (error) {
    console.error('Check-in error:', error);
    return res.status(500).json({ error: 'Internal server error' });
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
          imageUrls: savedDeal.deal.imageUrls,
          imageUrl: savedDeal.deal.imageUrls?.[0] || null,
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

// --- Endpoint: GET /api/users/referrals ---
// Returns how many users have signed up using the authenticated user's referral code
router.get('/referrals', protect, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    // Fetch the user's referral code and count referred users
    const user = await prisma.user.findUnique({
      where: { id: userId },
      // @ts-ignore new field referralCode already in schema
      select: { referralCode: true }
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    // @ts-ignore new field referredByUserId added in migration pending generate
    const referralCount = await prisma.user.count({ where: { referredByUserId: userId } });
    return res.status(200).json({
      referralCode: (user as any).referralCode,
      referralCount
    });
  } catch (err) {
    console.error('Get referrals error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
