// src/routes/merchant.routes.ts
import { Router } from 'express';
import { protect, isApprovedMerchant, AuthRequest } from '../middleware/auth.middleware';
import prisma from '../lib/prisma';
import { upload, uploadToCloudinary } from '../lib/cloudinary';
import { slugify } from '../lib/slugify';


const router = Router();

// --- Endpoint: POST /api/merchants/register ---
// Allows a user to register as a merchant.
router.post('/merchants/register', protect, async (req: AuthRequest, res) => {
  try {
  const { businessName, address, description, logoUrl, latitude, longitude, cityId } = req.body;
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

    // Enforce selection of an existing ACTIVE city (no on-the-fly creation anymore)
    if (!cityId) {
      return res.status(400).json({ error: 'cityId is required. Only pre-approved active cities may be selected.' });
    }
    // @ts-ignore - available after Prisma generate
    const existingCity = await prisma.city.findUnique({ where: { id: Number(cityId) } });
    if (!existingCity) {
      return res.status(400).json({ error: 'Invalid cityId provided.' });
    }
    if (!existingCity.active) {
      return res.status(400).json({ error: 'Selected city is not active for merchant onboarding.' });
    }
    const resolvedCityId: number = existingCity.id;

    const [merchant] = await prisma.$transaction([
      prisma.merchant.create({
        data: {
          businessName,
          address,
          description,
          logoUrl,
          latitude: latitude ? parseFloat(latitude) : null,
          longitude: longitude ? parseFloat(longitude) : null,
          // legacy free-form city usage disabled for new merchants
          city: null,
          owner: { connect: { id: userId } },
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { role: 'MERCHANT' },
      }),
    ]);

    // If a city was resolved, create a Store for this merchant
    let store = null as any;
    // @ts-ignore - available after Prisma generate
    store = await prisma.store.create({
      data: {
        merchantId: merchant.id,
        cityId: resolvedCityId,
        address,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
      }
    });

    res.status(201).json({
      message: 'Merchant application submitted successfully. It is now pending approval.',
      merchant,
      store,
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
        city: true,
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
    const {
      title,
      description,
      startTime,
      endTime,
      redemptionInstructions,
      discountPercentage,
      discountAmount,
      category,
      dealType: rawDealType,
      recurringDays: rawRecurringDays,
      imageUrls 
    } = req.body;
    const merchantId = req.merchant?.id; // from middleware

    // Basic required fields
    if (!title || !description || !startTime || !endTime) {
      return res.status(400).json({ error: 'Title, description, startTime, endTime are required.' });
    }

    if (imageUrls && (!Array.isArray(imageUrls) || imageUrls.some(url => typeof url !== 'string'))) {
        return res.status(400).json({ error: 'imageUrls must be an array of strings.' });
    }

    // Normalize deal type (allow human friendly input like "Happy Hour", case-insensitive)
    const validDealTypes = ['STANDARD', 'HAPPY_HOUR', 'RECURRING'] as const;
    let dealType: string = 'STANDARD';
    if (rawDealType) {
      const normalized = String(rawDealType)
        .trim()
        .toUpperCase()
        .replace(/\s+/g, '_'); // "Happy Hour" -> "HAPPY_HOUR"
      if (!validDealTypes.includes(normalized as any)) {
        return res.status(400).json({
          error: `Invalid dealType. Must be one of: ${validDealTypes.join(', ')}`
        });
      }
      dealType = normalized;
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

    // Normalize recurringDays: accept array ["MONDAY", "TUESDAY"] OR comma separated string
    const validDays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
    let recurringDays: string | null = null;
    if (rawRecurringDays !== undefined && rawRecurringDays !== null && rawRecurringDays !== '') {
      let daysArray: string[] = [];
      if (Array.isArray(rawRecurringDays)) {
        daysArray = rawRecurringDays.map(d => String(d).trim().toUpperCase());
      } else if (typeof rawRecurringDays === 'string') {
        daysArray = rawRecurringDays.split(',').map(d => d.trim().toUpperCase()).filter(Boolean);
      } else {
        return res.status(400).json({ error: 'recurringDays must be an array of days or a comma-separated string.' });
      }

      // Remove duplicates while preserving order
      const seen = new Set<string>();
      daysArray = daysArray.filter(d => { if (!seen.has(d)) { seen.add(d); return true; } return false; });

      const invalidDays = daysArray.filter(d => !validDays.includes(d));
      if (invalidDays.length) {
        return res.status(400).json({ error: `Invalid recurringDays: ${invalidDays.join(', ')}. Must be within ${validDays.join(', ')}` });
      }
      if (daysArray.length === 0) {
        return res.status(400).json({ error: 'recurringDays cannot be empty if provided.' });
      }
      recurringDays = daysArray.join(',');
    }

    // Enforce recurringDays presence only when dealType=RECURRING
    if (dealType === 'RECURRING' && !recurringDays) {
      return res.status(400).json({ error: 'recurringDays are required when dealType is RECURRING.' });
    }
    if (dealType !== 'RECURRING') {
      recurringDays = null; // ignore any provided days for non-recurring deals
    }

    // Persist
    const newDeal = await prisma.deal.create({
      data: {
        title,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        redemptionInstructions,
        imageUrls: imageUrls || [],
        discountPercentage: discountPercentage ? parseInt(discountPercentage, 10) : null,
        discountAmount: discountAmount ? parseFloat(discountAmount) : null,
        category: category || 'OTHER',
        dealType: dealType as any,
        recurringDays,
        merchant: { connect: { id: merchantId } }
      }
    });

    res.status(201).json({
      message: 'Deal created successfully',
      deal: newDeal,
      normalization: {
        dealType,
        recurringDays: recurringDays ? recurringDays.split(',') : null
      }
    });
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

// --- Endpoint: GET /api/merchants/stores ---
// List stores for the authenticated approved merchant
router.get('/merchants/stores', protect, isApprovedMerchant, async (req: AuthRequest, res) => {
  try {
    const merchantId = req.merchant?.id;
    if (!merchantId) return res.status(401).json({ error: 'Merchant authentication required' });
    // @ts-ignore
    const stores = await prisma.store.findMany({ where: { merchantId }, include: { city: true } });
    res.status(200).json({ total: stores.length, stores });
  } catch (e) {
    console.error('List stores failed', e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- Endpoint: POST /api/merchants/stores ---
// Create a new store for the authenticated approved merchant
// Body: { address, latitude?, longitude?, cityId? OR (cityName & state), active? }
router.post('/merchants/stores', protect, isApprovedMerchant, async (req: AuthRequest, res) => {
  try {
    const merchantId = req.merchant?.id;
    if (!merchantId) return res.status(401).json({ error: 'Merchant authentication required' });

    const { address, latitude, longitude, cityId, active } = req.body || {};
    if (!address) return res.status(400).json({ error: 'address is required' });
    if (!cityId) return res.status(400).json({ error: 'cityId is required. Only existing active cities may be used.' });
    // @ts-ignore
    const existing = await prisma.city.findUnique({ where: { id: Number(cityId) } });
    if (!existing) return res.status(400).json({ error: 'Invalid cityId' });
    if (!existing.active) return res.status(400).json({ error: 'City is not active.' });
    const resolvedCityId: number = existing.id;

    const lat = latitude !== undefined && latitude !== null && String(latitude) !== '' ? parseFloat(latitude) : null;
    const lon = longitude !== undefined && longitude !== null && String(longitude) !== '' ? parseFloat(longitude) : null;
    if (lat !== null && (isNaN(lat) || lat < -90 || lat > 90)) return res.status(400).json({ error: 'Latitude must be a number between -90 and 90' });
    if (lon !== null && (isNaN(lon) || lon < -180 || lon > 180)) return res.status(400).json({ error: 'Longitude must be a number between -180 and 180' });

    // @ts-ignore
    const store = await prisma.store.create({
      data: {
        merchantId,
  cityId: resolvedCityId,
        address,
        latitude: lat,
        longitude: lon,
        active: typeof active === 'boolean' ? active : true,
      },
      include: { city: true }
    });
    res.status(201).json({ message: 'Store created', store });
  } catch (e) {
    console.error('Create store failed', e);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// --- Endpoint: POST /api/deals/upload-image ---
// Allows an APPROVED merchant to upload a single image for a deal.
// The middleware chain ensures security and handles the file parsing.
router.post('/deals/upload-image', protect, isApprovedMerchant, upload.single('image'), async (req: AuthRequest, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided.' });
        }

        // Extract optional metadata from the request body
        const { businessName, dealTitle } = req.body;
        const merchantId = req.merchant!.id; // Available from isApprovedMerchant middleware

         const businessSlug = slugify(businessName || `merchant-${merchantId}`);
        const dealSlug = slugify(dealTitle || 'deal-image');
        const timestamp = Date.now();

        // Build deterministic publicId path (folder style) for overwrite/idempotency potential
        const publicId = `${businessSlug}-${merchantId}/${dealSlug}-${timestamp}`;

        const result = await uploadToCloudinary(req.file.buffer, { publicId });

        if (!result || !result.secure_url) {
            return res.status(500).json({ error: 'Cloudinary upload failed.' });
        }
        
        res.status(200).json({
            message: 'Image uploaded successfully.',
            imageUrl: result.secure_url,
      publicId: result.public_id
        });

    } catch (error: any) {
        console.error('Image upload error:', error);
        // Handle multer file filter errors
        if (error.message === 'Only image files are allowed!') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal server error during file upload.' });
    }
});
