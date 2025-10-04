// src/routes/merchant.routes.ts
import { Router, Response } from 'express';
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

// --- Enhanced Endpoint: POST /api/deals ---
// Allows an APPROVED merchant to create a comprehensive deal with all dynamic fields.
router.post('/deals', protect, isApprovedMerchant, async (req: AuthRequest, res) => {
  try {
    const {
      // Basic deal information
      title,
      description,
      activeDateRange, // { startDate, endDate }
      timeRanges, // placeholder for future granular hours
      redemptionInstructions,
      
      // Visual content
      imageUrls,
      primaryImageIndex, // Index of primary image in imageUrls array
      
      // Offer details
      discountPercentage,
      discountAmount,
      offerTerms,
      customOfferDisplay, // Custom offer text (e.g., "Buy 2 Get 1 Free")
      
      // Categorization
      category,
      dealType: rawDealType,
      recurringDays: rawRecurringDays,
      
      // Features and settings
      kickbackEnabled,
      isFeatured, // Whether this deal should be featured
      priority, // Deal priority for sorting (1-10, higher = more priority)
      
      // Menu integration
      menuItems, // [{ id, isHidden, customPrice?, customDiscount? }]
      
      // Advanced settings
      maxRedemptions, // Maximum number of redemptions allowed
      minOrderAmount, // Minimum order amount to qualify
      validDaysOfWeek, // Specific days of week when deal is valid
      validHours, // Specific time ranges when deal is valid
      
      // Social and engagement
      socialProofEnabled, // Whether to show social proof
      allowSharing, // Whether deal can be shared
      
      // Location-specific settings
      storeIds, // Specific store IDs where deal is valid (if not all stores)
      cityIds, // Specific city IDs where deal is valid
      
      // Additional metadata
      tags, // Array of tags for better categorization
      notes, // Internal notes for merchant
      externalUrl // Link to external page or menu
    } = req.body;
    const merchantId = req.merchant?.id;

    if (!merchantId) {
      return res.status(401).json({ error: 'Merchant authentication required' });
    }

    // Enhanced validation with detailed error messages
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ error: 'Title is required and must be a non-empty string.' });
    }
    
    if (title.trim().length > 100) {
      return res.status(400).json({ error: 'Title must be 100 characters or less.' });
    }
    
    if (!activeDateRange?.startDate || !activeDateRange?.endDate) {
      return res.status(400).json({ error: 'activeDateRange with startDate and endDate are required.' });
    }
    
    const startTime = new Date(activeDateRange.startDate);
    const endTime = new Date(activeDateRange.endDate);
    
    if (!(startTime instanceof Date) || isNaN(startTime.getTime())) {
      return res.status(400).json({ error: 'Invalid start date format. Please provide a valid ISO date string.' });
    }
    
    if (!(endTime instanceof Date) || isNaN(endTime.getTime())) {
      return res.status(400).json({ error: 'Invalid end date format. Please provide a valid ISO date string.' });
    }
    
    if (startTime >= endTime) {
      return res.status(400).json({ error: 'End date must be after start date.' });
    }
    
    // Check if dates are not too far in the past or future
    const now = new Date();
    const oneYearFromNow = new Date(now.getTime() + (365 * 24 * 60 * 60 * 1000));
    
    if (startTime < now) {
      return res.status(400).json({ error: 'Start date cannot be in the past.' });
    }
    
    if (endTime > oneYearFromNow) {
      return res.status(400).json({ error: 'End date cannot be more than one year in the future.' });
    }

    // Validate description
    if (description && typeof description !== 'string') {
      return res.status(400).json({ error: 'Description must be a string.' });
    }
    
    if (description && description.length > 1000) {
      return res.status(400).json({ error: 'Description must be 1000 characters or less.' });
    }

    // Validate redemptionInstructions
    if (redemptionInstructions && typeof redemptionInstructions !== 'string') {
      return res.status(400).json({ error: 'Redemption instructions must be a string.' });
    }
    
    if (redemptionInstructions && redemptionInstructions.length > 500) {
      return res.status(400).json({ error: 'Redemption instructions must be 500 characters or less.' });
    }

    // Validate imageUrls
    if (imageUrls && (!Array.isArray(imageUrls) || imageUrls.some((u: any) => typeof u !== 'string'))) {
      return res.status(400).json({ error: 'imageUrls must be an array of strings.' });
    }
    
    if (imageUrls && imageUrls.length > 10) {
      return res.status(400).json({ error: 'Maximum 10 images allowed per deal.' });
    }

    // Handle primaryImageIndex validation and final value
    let finalPrimaryImageIndex = primaryImageIndex;
    
    // If no images are provided, set primaryImageIndex to null
    if (!imageUrls || imageUrls.length === 0) {
      finalPrimaryImageIndex = null;
    } else {
      // Only validate primaryImageIndex if images are provided
      if (primaryImageIndex !== undefined && primaryImageIndex !== null) {
        const primaryIndex = parseInt(primaryImageIndex);
        if (isNaN(primaryIndex) || primaryIndex < 0 || primaryIndex >= imageUrls.length) {
          return res.status(400).json({ error: 'primaryImageIndex must be a valid index within imageUrls array.' });
        }
        finalPrimaryImageIndex = primaryIndex;
      }
    }

    // Validate discount fields
    if (discountPercentage !== undefined && (isNaN(discountPercentage) || discountPercentage < 0 || discountPercentage > 100)) {
      return res.status(400).json({ error: 'discountPercentage must be between 0 and 100.' });
    }
    if (discountAmount !== undefined && (isNaN(discountAmount) || discountAmount < 0)) {
      return res.status(400).json({ error: 'discountAmount must be a positive number.' });
    }
    if (!discountPercentage && !discountAmount && !customOfferDisplay) {
      return res.status(400).json({ error: 'At least one of discountPercentage, discountAmount, or customOfferDisplay is required.' });
    }

    // Validate priority
    if (priority !== undefined && (isNaN(priority) || priority < 1 || priority > 10)) {
      return res.status(400).json({ error: 'priority must be between 1 and 10.' });
    }

    // Validate maxRedemptions (0 means unlimited)
    if (maxRedemptions !== undefined && (isNaN(maxRedemptions) || maxRedemptions < 0)) {
      return res.status(400).json({ error: 'maxRedemptions must be a non-negative number (0 for unlimited).' });
    }

    // Validate minOrderAmount
    if (minOrderAmount !== undefined && (isNaN(minOrderAmount) || minOrderAmount < 0)) {
      return res.status(400).json({ error: 'minOrderAmount must be a non-negative number.' });
    }

    // Validate tags
    if (tags && (!Array.isArray(tags) || tags.some((tag: any) => typeof tag !== 'string'))) {
      return res.status(400).json({ error: 'tags must be an array of strings.' });
    }

    // Validate storeIds
    if (storeIds && (!Array.isArray(storeIds) || storeIds.some((id: any) => isNaN(parseInt(id))))) {
      return res.status(400).json({ error: 'storeIds must be an array of valid store IDs.' });
    }

    // Validate cityIds
    if (cityIds && (!Array.isArray(cityIds) || cityIds.some((id: any) => isNaN(parseInt(id))))) {
      return res.status(400).json({ error: 'cityIds must be an array of valid city IDs.' });
    }

    // Validate and resolve deal type ID
    let dealTypeId: number | undefined;
    if (rawDealType) {
      const dealTypeRecord = await prisma.dealTypeMaster.findFirst({
        where: { name: { equals: String(rawDealType).trim(), mode: 'insensitive' }, active: true }
      });
      if (!dealTypeRecord) {
        return res.status(400).json({ error: `Invalid dealType: ${rawDealType}. Please check available deal types.` });
      }
      dealTypeId = dealTypeRecord.id;
    } else {
      // Default to Standard deal type
      const standardDealType = await prisma.dealTypeMaster.findFirst({
        where: { name: { equals: 'Standard', mode: 'insensitive' }, active: true }
      });
      if (standardDealType) {
        dealTypeId = standardDealType.id;
      } else {
        // If Standard doesn't exist, get the first available deal type
        const firstDealType = await prisma.dealTypeMaster.findFirst({
          where: { active: true },
          orderBy: { id: 'asc' }
        });
        if (firstDealType) {
          dealTypeId = firstDealType.id;
        } else {
          return res.status(500).json({ error: 'No active deal types found in the system.' });
        }
      }
    }
    
    // Ensure dealTypeId is set
    if (!dealTypeId) {
      return res.status(500).json({ error: 'Failed to resolve deal type. Please try again.' });
    }

    // Validate and resolve category ID if provided
    let categoryId: number | undefined;
    
    // Map frontend category values to database category names
    const categoryMapping: Record<string, string> = {
      'FOOD_AND_BEVERAGE': 'Food & Beverage',
      'RETAIL': 'Retail',
      'ENTERTAINMENT': 'Entertainment',
      'HEALTH_AND_FITNESS': 'Health & Fitness',
      'BEAUTY_AND_SPA': 'Beauty & Spa',
      'AUTOMOTIVE': 'Automotive',
      'TRAVEL': 'Travel',
      'EDUCATION': 'Education',
      'TECHNOLOGY': 'Technology',
      'HOME_AND_GARDEN': 'Home & Garden',
      'OTHER': 'Other'
    };
    
    if (category) {
      const dbCategoryName = categoryMapping[category] || category;
      
      const categoryRecord = await prisma.dealCategoryMaster.findFirst({
        where: { name: { equals: dbCategoryName, mode: 'insensitive' }, active: true }
      });
      
      if (!categoryRecord) {
        return res.status(400).json({ error: `Invalid category: ${category}. Please check available categories.` });
      }
      categoryId = categoryRecord.id;
    } else {
      // Default to "Other" category if no category is provided
      const defaultCategory = await prisma.dealCategoryMaster.findFirst({
        where: { name: { equals: 'Other', mode: 'insensitive' }, active: true }
      });
      
      if (defaultCategory) {
        categoryId = defaultCategory.id;
      } else {
        // If "Other" doesn't exist, get the first available category
        const firstCategory = await prisma.dealCategoryMaster.findFirst({
          where: { active: true },
          orderBy: { sortOrder: 'asc' }
        });
        
        if (firstCategory) {
          categoryId = firstCategory.id;
        } else {
          return res.status(500).json({ error: 'No active categories found in the system.' });
        }
      }
    }
    
    // Ensure categoryId is set
    if (!categoryId) {
      return res.status(500).json({ error: 'Failed to resolve category. Please try again.' });
    }

    // Normalize recurringDays input
    const validDays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
    let recurringDays: string | null = null;
    if (rawRecurringDays !== undefined && rawRecurringDays !== null && rawRecurringDays !== '') {
      let daysArray: string[] = [];
      if (Array.isArray(rawRecurringDays)) {
        daysArray = rawRecurringDays.map(d => String(d).trim().toUpperCase());
      } else if (typeof rawRecurringDays === 'string') {
        daysArray = rawRecurringDays.split(',').map(d => d.trim().toUpperCase()).filter(Boolean);
      } else {
        return res.status(400).json({ error: 'recurringDays must be an array or comma-separated string.' });
      }
      const seen = new Set<string>();
      daysArray = daysArray.filter(d => { if (!seen.has(d)) { seen.add(d); return true; } return false; });
      const invalidDays = daysArray.filter(d => !validDays.includes(d));
      if (invalidDays.length) {
        return res.status(400).json({ error: `Invalid recurringDays: ${invalidDays.join(', ')}` });
      }
      if (daysArray.length === 0) return res.status(400).json({ error: 'recurringDays cannot be empty if provided.' });
      recurringDays = daysArray.join(',');
    }
    // Check if deal type requires recurring days
    if (dealTypeId) {
      const dealTypeRecord = await prisma.dealTypeMaster.findUnique({
        where: { id: dealTypeId }
      });
      if (dealTypeRecord && dealTypeRecord.name === 'Recurring' && !recurringDays) {
        return res.status(400).json({ error: 'recurringDays required for RECURRING deals.' });
      }
      if (dealTypeRecord && dealTypeRecord.name !== 'Recurring') {
        recurringDays = null;
      }
    }

    // Enhanced deal creation with all dynamic fields
    let newDeal;
    try {
      newDeal = await prisma.$transaction(async (tx) => {
      // Prepare enhanced deal data
      const dealData = {
        title,
        description: description || '',
        startTime,
        endTime,
        redemptionInstructions: redemptionInstructions || '',
        imageUrls: imageUrls || [],
        discountPercentage: discountPercentage ? parseFloat(discountPercentage) : null,
        discountAmount: discountAmount ? parseFloat(discountAmount) : null,
        categoryId: categoryId!,
        dealTypeId: dealTypeId!,
        recurringDays,
        offerTerms: offerTerms || null,
        kickbackEnabled: !!kickbackEnabled,
        merchantId: merchantId
      };

      const createdDeal = await tx.deal.create({
        data: dealData
      });

      // Handle menu items with enhanced data
      if (menuItems && Array.isArray(menuItems) && menuItems.length > 0) {
        const dealMenuItemsData = menuItems
          .filter(mi => mi && typeof mi.id !== 'undefined')
          .map(mi => ({
            dealId: createdDeal.id,
            menuItemId: Number(mi.id),
            isHidden: !!mi.isHidden,
            // Enhanced menu item data
            customPrice: mi.customPrice ? parseFloat(mi.customPrice) : null,
            customDiscount: mi.customDiscount ? parseFloat(mi.customDiscount) : null
          }));
        
        if (dealMenuItemsData.length) {
          // @ts-ignore - DealMenuItem model available after generate
          await tx.dealMenuItem.createMany({ data: dealMenuItemsData });
        }
      }

      return createdDeal;
    });
    } catch (transactionError: unknown) {
      console.error('Transaction error during deal creation:', transactionError);
      
      // Handle specific Prisma errors
      if (transactionError instanceof Error) {
        if (transactionError.message.includes('Unique constraint')) {
          return res.status(400).json({ error: 'A deal with this title already exists for your business.' });
        }
        if (transactionError.message.includes('Foreign key constraint')) {
          return res.status(400).json({ error: 'Invalid reference to category, deal type, or merchant.' });
        }
        if (transactionError.message.includes('Invalid input')) {
          return res.status(400).json({ error: 'Invalid data provided. Please check your input and try again.' });
        }
      }
      
      return res.status(500).json({ 
        error: 'Failed to create deal. Please try again or contact support if the problem persists.',
        details: process.env.NODE_ENV === 'development' && transactionError instanceof Error ? transactionError.message : undefined
      });
    }

    // Enhanced response with all dynamic fields
    const response = {
      success: true,
      message: 'Deal created successfully with enhanced features',
      deal: {
        id: newDeal.id,
        title: newDeal.title,
        description: newDeal.description,
        startTime: newDeal.startTime,
        endTime: newDeal.endTime,
        discountPercentage: newDeal.discountPercentage,
        discountAmount: newDeal.discountAmount,
        imageUrls: newDeal.imageUrls,
        offerTerms: newDeal.offerTerms,
        kickbackEnabled: newDeal.kickbackEnabled,
        createdAt: newDeal.createdAt,
        updatedAt: newDeal.updatedAt
      },
      normalization: {
        dealTypeId,
        recurringDays: recurringDays ? recurringDays.split(',') : null
      }
    };

    res.status(201).json(response);
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

// --- Endpoint: GET /api/merchants/me/menu ---
// Returns menu items for the authenticated approved merchant.
// Response: { menuItems: [ { id, name, price, category, imageUrl } ] }
router.get('/merchants/me/menu', protect, isApprovedMerchant, async (req: AuthRequest, res) => {
  try {
    const merchantId = req.merchant?.id;
    if (!merchantId) return res.status(401).json({ error: 'Merchant authentication required' });

    // @ts-ignore - MenuItem available post generate
    const menuItems = await prisma.menuItem.findMany({
      where: { merchantId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        price: true,
        category: true,
        imageUrl: true,
      }
    });
    res.status(200).json({ menuItems });
  } catch (e) {
    console.error('Fetch menu items failed', e);
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
});

// --- Endpoint: POST /api/merchants/me/menu/item ---
// Create a new menu item for the approved merchant
router.post('/merchants/me/menu/item', protect, isApprovedMerchant, async (req: AuthRequest, res) => {
  try {
    const merchantId = req.merchant?.id;
    if (!merchantId) return res.status(401).json({ error: 'Merchant authentication required' });

    const { name, price, category, description, imageUrl } = req.body || {};

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'name is required' });
    }
    if (price === undefined || price === null || isNaN(Number(price)) || Number(price) <= 0) {
      return res.status(400).json({ error: 'price must be a positive number' });
    }
    if (!category || typeof category !== 'string' || category.trim().length === 0) {
      return res.status(400).json({ error: 'category is required' });
    }

    // @ts-ignore
    const created = await prisma.menuItem.create({
      data: {
        merchantId,
        name: name.trim(),
        price: Number(price),
        category: category.trim(),
        description: description ? String(description).trim() : null,
        imageUrl: imageUrl ? String(imageUrl).trim() : null,
      },
      select: { id: true, name: true, price: true, category: true, imageUrl: true, description: true }
    });
    res.status(201).json({ menuItem: created });
  } catch (e) {
    console.error('Create menu item failed', e);
    res.status(500).json({ error: 'Failed to create menu item' });
  }
});

// --- Endpoint: PUT /api/merchants/me/menu/item/:itemId ---
// Update an existing menu item (must belong to merchant)
router.put('/merchants/me/menu/item/:itemId', protect, isApprovedMerchant, async (req: AuthRequest, res) => {
  try {
    const merchantId = req.merchant?.id;
    if (!merchantId) return res.status(401).json({ error: 'Merchant authentication required' });
    const itemId = Number(req.params.itemId);
    if (!Number.isFinite(itemId)) return res.status(400).json({ error: 'Invalid itemId' });

    // @ts-ignore
    const existing = await prisma.menuItem.findUnique({ where: { id: itemId }, select: { id: true, merchantId: true } });
    if (!existing || existing.merchantId !== merchantId) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    const { name, price, category, description, imageUrl } = req.body || {};
    const data: any = {};
    if (name !== undefined) {
      if (!name || typeof name !== 'string' || name.trim().length === 0) return res.status(400).json({ error: 'name cannot be empty' });
      data.name = name.trim();
    }
    if (price !== undefined) {
      if (price === null || isNaN(Number(price)) || Number(price) <= 0) return res.status(400).json({ error: 'price must be a positive number' });
      data.price = Number(price);
    }
    if (category !== undefined) {
      if (!category || typeof category !== 'string' || category.trim().length === 0) return res.status(400).json({ error: 'category cannot be empty' });
      data.category = category.trim();
    }
    if (description !== undefined) {
      data.description = description ? String(description).trim() : null;
    }
    if (imageUrl !== undefined) {
      data.imageUrl = imageUrl ? String(imageUrl).trim() : null;
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: 'No valid fields provided for update' });
    }

    // @ts-ignore
    const updated = await prisma.menuItem.update({
      where: { id: itemId },
      data,
      select: { id: true, name: true, price: true, category: true, imageUrl: true, description: true }
    });
    res.status(200).json({ menuItem: updated });
  } catch (e) {
    console.error('Update menu item failed', e);
    res.status(500).json({ error: 'Failed to update menu item' });
  }
});

// --- Endpoint: DELETE /api/merchants/me/menu/item/:itemId ---
// Permanently deletes a menu item (consider soft delete later)
router.delete('/merchants/me/menu/item/:itemId', protect, isApprovedMerchant, async (req: AuthRequest, res) => {
  try {
    const merchantId = req.merchant?.id;
    if (!merchantId) return res.status(401).json({ error: 'Merchant authentication required' });
    const itemId = Number(req.params.itemId);
    if (!Number.isFinite(itemId)) return res.status(400).json({ error: 'Invalid itemId' });

    // @ts-ignore
    const existing = await prisma.menuItem.findUnique({ where: { id: itemId }, select: { id: true, merchantId: true } });
// --- Endpoint: GET /api/merchants/me/kickback-earnings ---
// Fetches aggregated and detailed Kickback earnings data.
// NOTE: Currently returns realistic MOCK DATA to enable frontend development.
router.get('/merchants/me/kickback-earnings', protect, isApprovedMerchant, async (req: AuthRequest, res: Response) => {
  try {
    const merchantId = req.merchant!.id;
    const { period = 'all_time' } = req.query as any;

    // TODO: Replace mock with actual aggregation over KickbackEvent table
    // Future implementation outline:
    //  1. Determine date range based on period (e.g., last_7_days, last_30_days, this_month, all_time)
    //  2. Query KickbackEvent where merchantId & createdAt in range
    //  3. Aggregate total sourceAmountSpent (revenue proxy) & total amountEarned
    //  4. Group by userId for details: sum(earned), count(distinct invitees), sum(sourceAmountSpent)
    //  5. (Optional) Join to MenuItem / Deal for spending detail if stored per line item later
    const mockData = {
      summary: {
        revenue: 1392.0,
        totalKickbackHandout: 135.5
      },
      details: [
        {
          user: { name: 'Anita', avatarUrl: 'https://i.pravatar.cc/150?u=anita' },
          earned: 3.5,
            invitedCount: 2,
          totalSpentByInvitees: 13.5,
          spendingDetail: [
            { itemName: 'Chicken Ginger', price: 14.0, imageUrl: 'https://example.com/chicken.png' },
            { itemName: 'Coca Cola Zero', price: 2.5, imageUrl: 'https://example.com/coke.png' }
          ]
        },
        {
          user: { name: 'Benjamin', avatarUrl: 'https://i.pravatar.cc/150?u=benjamin' },
          earned: 2.1,
          invitedCount: 1,
          totalSpentByInvitees: 13.5,
          spendingDetail: []
        },
        {
          user: { name: 'Carla', avatarUrl: 'https://i.pravatar.cc/150?u=carla' },
          earned: 15.75,
          invitedCount: 5,
          totalSpentByInvitees: 150.2,
          spendingDetail: []
        }
      ]
    };

    res.status(200).json({
      ...mockData,
      _note: `This is mock data for development. The period requested was '${period}'.`,
      merchantId
    });
  } catch (error) {
    console.error('Kickback earnings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

    if (!existing || existing.merchantId !== merchantId) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    // @ts-ignore
    await prisma.menuItem.delete({ where: { id: itemId } });
    res.status(200).json({ message: 'Menu item deleted' });
  } catch (e) {
    console.error('Delete menu item failed', e);
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
});

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
