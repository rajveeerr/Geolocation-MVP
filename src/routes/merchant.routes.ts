// src/routes/merchant.routes.ts
import { Router } from 'express';
import { protect, isApprovedMerchant, AuthRequest } from '../middleware/auth.middleware';
import prisma from '../lib/prisma';

const router = Router();

// --- Endpoint: POST /api/merchants/register ---
// Allows a user to register as a merchant.
router.post('/merchants/register', protect, async (req: AuthRequest, res) => {
  try {
    const { businessName, address, description, logoUrl, latitude, longitude } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!businessName || !address) {
      return res.status(400).json({ error: 'Business name and address are required' });
    }

    // Validate coordinates if provided
    if (latitude !== undefined || longitude !== undefined) {
      if (latitude === undefined || longitude === undefined) {
        return res.status(400).json({ error: 'Both latitude and longitude must be provided together' });
      }

      const lat = parseFloat(latitude);
      const lon = parseFloat(longitude);

      if (isNaN(lat) || isNaN(lon)) {
        return res.status(400).json({ error: 'Latitude and longitude must be valid numbers' });
      }

      if (lat < -90 || lat > 90) {
        return res.status(400).json({ error: 'Latitude must be between -90 and 90 degrees' });
      }

      if (lon < -180 || lon > 180) {
        return res.status(400).json({ error: 'Longitude must be between -180 and 180 degrees' });
      }
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
          latitude: latitude ? parseFloat(latitude) : null,
          longitude: longitude ? parseFloat(longitude) : null,
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

// --- Endpoint: GET /api/merchants/status ---
// Returns the merchant status for the authenticated user
router.get('/merchants/status', protect, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const merchant = await prisma.merchant.findUnique({
      where: { ownerId: userId },
      select: {
        id: true,
        status: true,
        businessName: true,
        address: true,
        description: true,
        logoUrl: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!merchant) {
      return res.status(404).json({ error: 'No merchant profile found' });
    }

    res.status(200).json({ merchant });

  } catch (error) {
    console.error('Fetch merchant status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- Endpoint: POST /api/deals ---
// Allows an APPROVED merchant to create a new deal.
router.post('/deals', protect, isApprovedMerchant, async (req: AuthRequest, res) => {
  try {
    const { title, description, startTime, endTime, redemptionInstructions, discountPercentage, discountAmount, category } = req.body;
    const merchantId = req.merchant?.id; // Get merchantId from our middleware

    // Input validation
    if (!title || !description || !startTime || !endTime) {
        return res.status(400).json({ error: 'Title, description, start time, and end time are required.'});
    }

    // Validate category if provided
    if (category) {
      const validCategories = [
        'FOOD_AND_BEVERAGE', 'RETAIL', 'ENTERTAINMENT', 'HEALTH_AND_FITNESS',
        'BEAUTY_AND_SPA', 'AUTOMOTIVE', 'TRAVEL', 'EDUCATION', 'TECHNOLOGY',
        'HOME_AND_GARDEN', 'OTHER'
      ];
      
      if (!validCategories.includes(category)) {
        return res.status(400).json({
          error: `Invalid category. Must be one of: ${validCategories.join(', ')}`
        });
      }
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
            category: category || 'OTHER',
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

// --- Endpoint: PUT /api/merchants/coordinates ---
// Allows an approved merchant to update their coordinates.
router.put('/merchants/coordinates', protect, isApprovedMerchant, async (req: AuthRequest, res) => {
  try {
    const { latitude, longitude } = req.body;
    const merchantId = req.merchant?.id;

    if (!merchantId) {
      return res.status(401).json({ error: 'Merchant authentication required' });
    }

    // Validate coordinates
    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ error: 'Both latitude and longitude are required' });
    }

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({ error: 'Latitude and longitude must be valid numbers' });
    }

    if (lat < -90 || lat > 90) {
      return res.status(400).json({ error: 'Latitude must be between -90 and 90 degrees' });
    }

    if (lon < -180 || lon > 180) {
      return res.status(400).json({ error: 'Longitude must be between -180 and 180 degrees' });
    }

    const updatedMerchant = await prisma.merchant.update({
      where: { id: merchantId },
      data: {
        latitude: lat,
        longitude: lon,
      },
      select: {
        id: true,
        businessName: true,
        latitude: true,
        longitude: true,
        address: true,
      },
    });

    res.status(200).json({
      message: 'Coordinates updated successfully',
      merchant: updatedMerchant,
    });

  } catch (error) {
    console.error('Coordinate update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- Endpoint: GET /api/merchants/deals ---
// Returns all deals created by the authenticated (approved) merchant.
// Optional query params:
//   activeOnly=true  -> only deals currently active (start <= now <= end)
//   includeExpired=false (alias; if provided and false, expired filtered out)
router.get('/merchants/deals', protect, isApprovedMerchant, async (req: AuthRequest, res) => {
  try {
    const merchantId = req.merchant?.id;

    if (!merchantId) {
      return res.status(401).json({ error: 'Merchant authentication required' });
    }

    const { activeOnly, includeExpired } = req.query;
    const now = new Date();

    // Fetch all deals for this merchant (dashboard view)
    const deals = await prisma.deal.findMany({
      where: { merchantId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        discountPercentage: true,
        discountAmount: true,
        startTime: true,
        endTime: true,
        redemptionInstructions: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    // Derive status flags
    const enriched = deals.map(d => {
      const isActive = d.startTime <= now && d.endTime >= now;
      const isExpired = d.endTime < now;
      const isUpcoming = d.startTime > now;
      return { ...d, isActive, isExpired, isUpcoming };
    });

    // Filtering logic
    let filtered = enriched;
    const activeOnlyFlag = (typeof activeOnly === 'string' && activeOnly.toLowerCase() === 'true');
    const includeExpiredFlag = (typeof includeExpired === 'string') ? includeExpired.toLowerCase() === 'true' : true; // default include

    if (activeOnlyFlag) {
      filtered = filtered.filter(d => d.isActive);
    } else if (!includeExpiredFlag) {
      filtered = filtered.filter(d => !d.isExpired);
    }

    const counts = {
      total: enriched.length,
      active: enriched.filter(d => d.isActive).length,
      expired: enriched.filter(d => d.isExpired).length,
      upcoming: enriched.filter(d => d.isUpcoming).length
    };

    res.status(200).json({
      deals: filtered,
      counts,
      filters: {
        activeOnly: activeOnlyFlag,
        includeExpired: includeExpiredFlag
      }
    });

  } catch (error) {
    console.error('Merchant deals fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;