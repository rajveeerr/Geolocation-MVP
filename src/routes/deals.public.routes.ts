// src/routes/deals.public.routes.ts

import { Router } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// Utility function to calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in kilometers
}

// --- Social Proof Utilities ---
// Utility to add social proof to a deal object (expects raw prisma deal with savedByUsers + _count)
function addSocialProofToDeal(deal: any) {
    if (!deal.savedByUsers) {
        return {
            ...deal,
            claimedBy: { totalCount: 0, visibleUsers: [] }
        };
    }
    const totalCount = deal._count?.savedByUsers ?? deal.savedByUsers.length;
    const visibleUsers = deal.savedByUsers
      .map((save: any) => ({ avatarUrl: save.user?.avatarUrl || null }))
      .filter((u: any) => u.avatarUrl);

    // Remove the raw savedByUsers data from the final output
    const { savedByUsers, _count, ...dealWithoutSocialProof } = deal;

    return {
        ...dealWithoutSocialProof,
        claimedBy: { totalCount, visibleUsers }
    };
}

// Utility function to format deal data for frontend consumption (compact shape + social proof)
function formatDealForFrontend(rawDeal: any, distance?: number) {
  const formattedDeal = {
    id: rawDeal.id,
    title: rawDeal.title || '',
    description: rawDeal.description || '',
    imageUrl: rawDeal.imageUrls?.[0] || null, // Primary image
    images: rawDeal.imageUrls || [],          // All images
    offerDisplay: rawDeal.discountPercentage ? `${rawDeal.discountPercentage}% OFF` : (rawDeal.discountAmount ? 'DEAL' : 'FREE'),
    offerTerms: rawDeal.offerTerms || null,
    dealType: rawDeal.dealType || 'STANDARD',
    startTime: rawDeal.startTime?.toISOString() || null,
    endTime: rawDeal.endTime?.toISOString() || null,
    redemptionInstructions: rawDeal.redemptionInstructions || '',
    merchant: {
      id: rawDeal.merchant?.id || null,
      businessName: rawDeal.merchant?.businessName || '',
      address: rawDeal.merchant?.address || '',
      latitude: rawDeal.merchant?.latitude || null,
      longitude: rawDeal.merchant?.longitude || null,
      logoUrl: rawDeal.merchant?.logoUrl || null,
    },
    ...(distance !== undefined && { distance: Math.round(distance * 100) / 100 }),
  };

  // Merge social proof from raw deal
  return addSocialProofToDeal({ ...formattedDeal, savedByUsers: rawDeal.savedByUsers, _count: rawDeal._count });
}

// Performance monitoring utility
function logQueryPerformance(operation: string, startTime: number, resultCount: number, filters?: any) {
  const duration = Date.now() - startTime;
  console.log(`[PERFORMANCE] ${operation}: ${duration}ms, ${resultCount} results`, filters ? `Filters: ${JSON.stringify(filters)}` : '');
  
  // Log slow queries for optimization
  if (duration > 1000) {
    console.warn(`[SLOW QUERY] ${operation} took ${duration}ms - consider optimization`);
  }
}

// --- Endpoint: GET /api/deals ---
// Fetches all active deals from approved merchants.
// Optional query parameters: latitude, longitude, radius (in kilometers), category, search
router.get('/deals', async (req, res) => {
  try {
    const { latitude, longitude, radius, category, search, cityId } = req.query as any;
    const now = new Date();
  // Determine today's weekday name for recurring deal filtering (server local time)
  const dayNames = ['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'];
  const todayName = dayNames[now.getDay()];
    
    // Build the where clause for filtering
    const whereClause: any = {
      // Filter for active deals
      startTime: { lte: now },
      endTime: { gte: now },
      // IMPORTANT: Only show deals from approved merchants
      merchant: {
        status: 'APPROVED',
      },
    };

    // Add category filter if provided
    if (category) {
      // Map enum-style category names to database names
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
      
      const validCategories = Object.keys(categoryMapping);
      
      if (!validCategories.includes(category as string)) {
        return res.status(400).json({
          error: `Invalid category. Must be one of: ${validCategories.join(', ')}`
        });
      }
      
      const dbCategoryName = categoryMapping[category as string];
      
      // Check if category exists in database
      try {
        const categoryExists = await prisma.dealCategoryMaster.findFirst({
          where: { name: dbCategoryName, active: true }
        });
        
        if (!categoryExists) {
          return res.status(400).json({
            error: `Category '${category}' not found or inactive`
          });
        }
      } catch (dbError) {
        console.error('Error checking category:', dbError);
        return res.status(500).json({
          error: 'Database error while validating category'
        });
      }
      
      // Filter by category relation using the database name
      whereClause.category = {
        name: {
          equals: dbCategoryName
        }
      };
    }

    // Add search filter if provided
    if (search && typeof search === 'string' && search.trim().length > 0) {
      const searchTerm = search.trim();
      
      // Validate search term length
      if (searchTerm.length < 2) {
        return res.status(400).json({
          error: 'Search term must be at least 2 characters long.'
        });
      }
      
      if (searchTerm.length > 100) {
        return res.status(400).json({
          error: 'Search term must be no more than 100 characters long.'
        });
      }
      
      // Search in both title and description using case-insensitive contains
      whereClause.OR = [
        {
          title: {
            contains: searchTerm,
            mode: 'insensitive' // Case-insensitive search
          }
        },
        {
          description: {
            contains: searchTerm,
            mode: 'insensitive' // Case-insensitive search
          }
        }
      ];
    }
    
    // Base query for active deals from approved merchants
    // Optimized to use database indexes efficiently
    const queryStartTime = Date.now();
    // @ts-ignore: Prisma types will include merchant.stores after generate
    let deals: any[] = await prisma.deal.findMany({
      where: whereClause,
      include: {
        merchant: { include: { stores: { include: { city: true } } } },
        category: true,
        dealType: true,
        _count: { select: { savedByUsers: true } },
        savedByUsers: {
          take: 5,
          select: { user: { select: { avatarUrl: true } } }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    // Filter recurring deals so they only appear on their specified day(s)
    // recurringDays stored as comma-separated list of day names (MONDAY,...)
    if (deals.length) {
      deals = deals.filter(d => {
        if (d.dealType !== 'RECURRING') return true;
        if (!d.recurringDays) return false; // malformed recurring deal, hide
  const days = d.recurringDays.split(',').map((s: string) => s.trim().toUpperCase());
        return days.includes(todayName);
      });
    }

    // Log query performance
    logQueryPerformance('Deals Query', queryStartTime, deals.length, {
      category: category || 'all',
      search: search ? 'yes' : 'no',
      geolocation: (latitude && longitude && radius) ? 'yes' : 'no'
    });

    // If a cityId filter is provided, filter deals by merchant's stores in that city
    if (cityId) {
      const cid = Number(cityId);
      if (!Number.isFinite(cid)) {
        return res.status(400).json({ error: 'cityId must be a number' });
      }
      deals = deals.filter(d => Array.isArray((d as any).merchant.stores) && (d as any).merchant.stores.some((s: any) => s.cityId === cid));
    }

    // If coordinates and radius are provided, filter by distance
    if (latitude && longitude && radius) {
      const userLat = parseFloat(latitude as string);
      const userLon = parseFloat(longitude as string);
      const radiusKm = parseFloat(radius as string);

      // Validate input parameters
      if (isNaN(userLat) || isNaN(userLon) || isNaN(radiusKm)) {
        return res.status(400).json({ 
          error: 'Invalid parameters. latitude, longitude, and radius must be valid numbers.' 
        });
      }

      if (userLat < -90 || userLat > 90) {
        return res.status(400).json({ 
          error: 'Latitude must be between -90 and 90 degrees.' 
        });
      }

      if (userLon < -180 || userLon > 180) {
        return res.status(400).json({ 
          error: 'Longitude must be between -180 and 180 degrees.' 
        });
      }

      if (radiusKm <= 0) {
        return res.status(400).json({ 
          error: 'Radius must be a positive number.' 
        });
      }

      // Use database-level geospatial filtering for better performance
      // This leverages the merchant status + coordinates index
      whereClause.merchant = {
        ...whereClause.merchant,
        latitude: { not: null },
        longitude: { not: null },
      };

      // Re-query with geospatial constraints
      deals = await prisma.deal.findMany({
        where: whereClause,
        include: {
          merchant: true,
          category: true,
          dealType: true,
          _count: { select: { savedByUsers: true } },
          savedByUsers: {
            take: 5,
            select: { user: { select: { avatarUrl: true } } }
          }
        },
        orderBy: { createdAt: 'desc' },
      });

      // Filter by distance and add distance information
      const dealsWithDistance = (deals as any[])
        .filter(deal => {
          if (!deal.merchant?.latitude || !deal.merchant?.longitude) {
            return false;
          }

          const distance = calculateDistance(
            userLat, 
            userLon, 
            deal.merchant.latitude, 
            deal.merchant.longitude
          );

          return distance <= radiusKm;
        })
        .map(deal => {
          const distance = calculateDistance(
            userLat, 
            userLon, 
            deal.merchant.latitude!, 
            deal.merchant.longitude!
          );
          return formatDealForFrontend(deal, distance);
        })
        .sort((a, b) => (a.distance || 0) - (b.distance || 0));

      deals = dealsWithDistance;
    } else {
      // Format deals for frontend when no geolocation filtering is applied
      deals = deals.map(deal => formatDealForFrontend(deal));
    }

    // Prioritize active HAPPY_HOUR deals at the top while preserving distance or createdAt ordering within groups
    if (Array.isArray(deals) && deals.length) {
      const isFormatted = !('merchant' in deals[0] && !(deals[0] as any).merchant.businessName); // naive check
      // deals are already formatted above (or include distance) at this point
      const happyHourDeals = (deals as any[]).filter(d => d.dealType.name === 'Happy Hour');
      const otherDeals = (deals as any[]).filter(d => d.dealType.name !== 'Happy Hour');
      // Preserve existing sort inside each group (distance or createdAt formatting kept earlier)
      deals = [...happyHourDeals, ...otherDeals];
    }

    res.status(200).json({
      deals,
      total: deals.length,
      filters: {
        latitude: latitude ? parseFloat(latitude as string) : null,
        longitude: longitude ? parseFloat(longitude as string) : null,
        radius: radius ? parseFloat(radius as string) : null,
        category: category ? category as string : null,
        search: search ? search as string : null,
        cityId: cityId ? Number(cityId) : null,
        today: todayName
      }
    });
  } catch (error) {
    console.error('Error fetching deals:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      query: req.query
    });
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch deals. Please try again later.'
    });
  }
});

// --- Endpoint: GET /api/deals/categories ---
// Returns all available deal categories from database
router.get('/deals/categories', async (req, res) => {
  try {
    // Fetch categories from database
    const dbCategories = await prisma.dealCategoryMaster.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' }
    });

    // Map database categories to frontend format
    const categoryMapping: Record<string, string> = {
      'Food & Beverage': 'FOOD_AND_BEVERAGE',
      'Retail': 'RETAIL',
      'Entertainment': 'ENTERTAINMENT',
      'Health & Fitness': 'HEALTH_AND_FITNESS',
      'Beauty & Spa': 'BEAUTY_AND_SPA',
      'Automotive': 'AUTOMOTIVE',
      'Travel': 'TRAVEL',
      'Education': 'EDUCATION',
      'Technology': 'TECHNOLOGY',
      'Home & Garden': 'HOME_AND_GARDEN',
      'Other': 'OTHER'
    };

    const iconMapping: Record<string, string> = {
      'Food & Beverage': '🍽️',
      'Retail': '🛍️',
      'Entertainment': '🎬',
      'Health & Fitness': '💪',
      'Beauty & Spa': '💅',
      'Automotive': '🚗',
      'Travel': '✈️',
      'Education': '📚',
      'Technology': '💻',
      'Home & Garden': '🏠',
      'Other': '📦'
    };

    const categories = dbCategories.map(category => ({
      value: categoryMapping[category.name] || category.name.toUpperCase().replace(/[^A-Z]/g, '_'),
      label: category.name,
      description: category.description || `${category.name} deals and offers`,
      icon: category.icon || iconMapping[category.name] || '📦'
    }));

    res.status(200).json({
      categories,
      total: categories.length,
      metadata: {
        lastUpdated: new Date().toISOString(),
        version: '1.0.0'
      }
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- Endpoint: GET /api/deals/featured ---
// Returns a small set of "hottest" deals for homepage hero sections.
// Strategy:
//  1. Active HAPPY_HOUR deals ending soon (soonest first)
//  2. Then other active deals (RECURRING filtered to today) by higher discount, sooner end
//  3. Limit configurable (?limit=8, default 8, max 20)
router.get('/deals/featured', async (req, res) => {
  try {
    const now = new Date();
    const dayNames = ['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'];
    const todayName = dayNames[now.getDay()];
    const limitParam = parseInt(String(req.query.limit || ''), 10);
    const limit = (!isNaN(limitParam) && limitParam > 0) ? Math.min(limitParam, 20) : 8;

    // Fetch a candidate pool (cap to 100 for performance) of currently active deals
    // Only from approved merchants.
    let candidates = await prisma.deal.findMany({
      where: {
        startTime: { lte: now },
        endTime: { gte: now },
        merchant: { status: 'APPROVED' }
      },
      // ADD THIS SELECT CLAUSE
      select: {
        id: true,
        title: true,
        description: true,
        imageUrls: true,
        discountPercentage: true,
        discountAmount: true,
        category: true,
        dealType: true,
        recurringDays: true,
        startTime: true,
        endTime: true,
        redemptionInstructions: true,
        createdAt: true,
        updatedAt: true,
        merchantId: true,
        merchant: {
          select: {
            id: true,
            businessName: true,
            address: true,
            description: true,
            logoUrl: true,
            latitude: true,
            longitude: true,
            status: true,
            createdAt: true,
            updatedAt: true,
          }
        }
      },
      orderBy: { endTime: 'asc' }, // early ending first to bias candidate set
      take: 100
    });

    // Filter recurring deals to correct day
    candidates = candidates.filter(d => {
      if (d.dealType.name !== 'Recurring') return true;
      if (!d.recurringDays) return false;
      const days = d.recurringDays.split(',').map(s => s.trim().toUpperCase());
      return days.includes(todayName);
    });

    // Compute ranking comparator
    const scored = candidates.map(d => {
      const timeRemainingMs = d.endTime.getTime() - now.getTime();
      const timeRemainingMinutes = timeRemainingMs / 60000;
      const discountPct = d.discountPercentage || 0;
      const discountValue = d.discountAmount || 0;
      // Basic priority groups by deal type
      const typePriority = d.dealType.name === 'Happy Hour' ? 3 : (d.dealType.name === 'Recurring' ? 2 : 1);
      return { d, timeRemainingMinutes, discountPct, discountValue, typePriority };
    });

    scored.sort((a, b) => {
      // 1. Higher typePriority first (Happy Hour > Recurring > Standard)
      if (b.typePriority !== a.typePriority) return b.typePriority - a.typePriority;
      // 2. For same type: earlier ending first
      if (a.timeRemainingMinutes !== b.timeRemainingMinutes) return a.timeRemainingMinutes - b.timeRemainingMinutes;
      // 3. Higher percentage discount
      if (b.discountPct !== a.discountPct) return b.discountPct - a.discountPct;
      // 4. Higher absolute discount amount
      if (b.discountValue !== a.discountValue) return b.discountValue - a.discountValue;
      // 5. Newer createdAt last tiebreak (newer first)
  return b.d.createdAt.getTime() - a.d.createdAt.getTime();
    });

    const selected = scored.slice(0, limit).map(s => formatDealForFrontend(s.d));

    res.status(200).json({
      deals: selected,
      total: selected.length,
      limit,
      generatedAt: now.toISOString(),
      criteria: {
        prioritized: ['HAPPY_HOUR ending soon', 'RECURRING (today)', 'Others by discount & end time'],
        weekday: todayName
      }
    });
  } catch (error) {
    console.error('Error fetching featured deals:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- Enhanced Endpoint: GET /api/deals/:id ---
// Returns comprehensive deal details for detailed view
router.get('/deals/:id', async (req, res) => {
  try {
    const dealId = parseInt(req.params.id);
    if (isNaN(dealId)) {
      return res.status(400).json({ error: 'Invalid Deal ID.' });
    }

    const deal = await prisma.deal.findUnique({
      where: { id: dealId },
      include: {
        merchant: {
          include: {
            stores: {
              include: {
                city: {
                  select: {
                    id: true,
                    name: true,
                    state: true,
                    active: true
                  }
                }
              }
            },
            _count: {
              select: {
                deals: true,
                stores: true
              }
            }
          }
        },
        dealType: true,
        category: true,
        menuItems: {
          where: { isHidden: false },
          include: {
            menuItem: {
              select: {
                id: true,
                name: true,
                description: true,
                price: true,
                imageUrl: true,
                category: true
              }
            }
          }
        },
        _count: { 
          select: { 
            savedByUsers: true,
            menuItems: true
          } 
        },
        savedByUsers: {
          take: 10,
          select: { 
            user: { 
              select: { 
                id: true,
                name: true,
                avatarUrl: true 
              } 
            },
            savedAt: true
          },
          orderBy: { savedAt: 'desc' }
        }
      }
    });

    if (!deal || deal.merchant.status !== 'APPROVED') {
      return res.status(404).json({ error: 'Deal not available or merchant not approved.' });
    }

    // Check if deal is currently active
    const now = new Date();
    const isActive = deal.startTime <= now && deal.endTime >= now;
    const isExpired = deal.endTime < now;
    const isUpcoming = deal.startTime > now;
    
    // Calculate time remaining
    const timeRemaining = isActive ? deal.endTime.getTime() - now.getTime() : 0;
    const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
    const minutesRemaining = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

    // Format recurring days if applicable
    const recurringDays = deal.recurringDays ? 
      deal.recurringDays.split(',').map(day => day.trim()) : [];

    // Calculate discount value
    const discountValue = deal.discountPercentage ? 
      `${deal.discountPercentage}% OFF` : 
      (deal.discountAmount ? `$${deal.discountAmount} OFF` : 'Special Offer');

    // Format menu items
    const formattedMenuItems = deal.menuItems.map(item => ({
      id: item.menuItem.id,
      name: item.menuItem.name,
      description: item.menuItem.description,
      originalPrice: item.menuItem.price,
      discountedPrice: deal.discountPercentage ? 
        item.menuItem.price * (1 - deal.discountPercentage / 100) : 
        (deal.discountAmount ? Math.max(0, item.menuItem.price - deal.discountAmount) : item.menuItem.price),
      imageUrl: item.menuItem.imageUrl,
      category: item.menuItem.category
    }));

    // Format social proof
    const socialProof = {
      totalSaves: deal._count.savedByUsers,
      recentSavers: deal.savedByUsers.map(save => ({
        id: save.user.id,
        name: save.user.name,
        avatarUrl: save.user.avatarUrl,
        savedAt: save.savedAt
      }))
    };

    // Format merchant details
    const merchantDetails = {
      id: deal.merchant.id,
      businessName: deal.merchant.businessName,
      description: deal.merchant.description,
      address: deal.merchant.address,
      latitude: deal.merchant.latitude,
      longitude: deal.merchant.longitude,
      logoUrl: deal.merchant.logoUrl,
      totalDeals: deal.merchant._count.deals,
      totalStores: deal.merchant._count.stores,
      stores: deal.merchant.stores.map(store => ({
        id: store.id,
        address: store.address,
        latitude: store.latitude,
        longitude: store.longitude,
        active: store.active,
        city: {
          id: store.city.id,
          name: store.city.name,
          state: store.city.state,
          active: store.city.active
        }
      }))
    };

    // Comprehensive deal response
    const detailedDeal = {
      // Basic deal info
      id: deal.id,
      title: deal.title,
      description: deal.description,
      category: {
        value: deal.category.name,
        label: deal.category.name.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l: string) => l.toUpperCase()),
        description: deal.category.description,
        icon: deal.category.icon,
        color: deal.category.color
      },
      
      // Visual content
      imageUrl: deal.imageUrls?.[0] || null,
      images: deal.imageUrls || [],
      
      // Offer details
      offerDisplay: discountValue,
      discountPercentage: deal.discountPercentage,
      discountAmount: deal.discountAmount,
      offerTerms: deal.offerTerms,
      
      // Deal type and timing
      dealType: {
        name: deal.dealType.name,
        description: deal.dealType.description
      },
      startTime: deal.startTime.toISOString(),
      endTime: deal.endTime.toISOString(),
      recurringDays: recurringDays,
      
      // Status and timing
      status: {
        isActive,
        isExpired,
        isUpcoming,
        timeRemaining: {
          total: timeRemaining,
          hours: hoursRemaining,
          minutes: minutesRemaining,
          formatted: `${hoursRemaining}h ${minutesRemaining}m`
        }
      },
      
      // Redemption
      redemptionInstructions: deal.redemptionInstructions,
      kickbackEnabled: deal.kickbackEnabled,
      
      // Menu items (if applicable)
      menuItems: formattedMenuItems,
      hasMenuItems: formattedMenuItems.length > 0,
      
      // Merchant information
      merchant: merchantDetails,
      
      // Social proof
      socialProof,
      
      // Metadata
      createdAt: deal.createdAt.toISOString(),
      updatedAt: deal.updatedAt.toISOString(),
      
      // Additional context
      context: {
        isRecurring: deal.dealType.name === 'Recurring',
        isHappyHour: deal.dealType.name === 'Happy Hour',
        hasMultipleImages: (deal.imageUrls?.length || 0) > 1,
        hasMultipleStores: merchantDetails.totalStores > 1,
        isPopular: deal._count.savedByUsers > 10
      }
    };

    res.status(200).json({
      success: true,
      deal: detailedDeal,
      metadata: {
        fetchedAt: now.toISOString(),
        version: '2.0.0'
      }
    });

  } catch (error) {
    console.error(`Error fetching detailed deal ${req.params.id}:`, error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch deal details'
    });
  }
});

export default router;