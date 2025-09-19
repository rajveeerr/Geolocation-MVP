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

// Utility function to format deal data for frontend consumption
function formatDealForFrontend(deal: any, distance?: number) {
  return {
    id: deal.id,
    title: deal.title || '',
    description: deal.description || '',
    imageUrl: deal.imageUrl || null,
    discountPercentage: deal.discountPercentage || null,
    discountAmount: deal.discountAmount || null,
    category: deal.category || 'OTHER',
    dealType: deal.dealType || 'STANDARD',
    recurringDays: deal.recurringDays || null,
    startTime: deal.startTime?.toISOString() || null,
    endTime: deal.endTime?.toISOString() || null,
    redemptionInstructions: deal.redemptionInstructions || '',
    createdAt: deal.createdAt?.toISOString() || null,
    updatedAt: deal.updatedAt?.toISOString() || null,
    merchantId: deal.merchantId,
    merchant: {
      id: deal.merchant?.id || null,
      businessName: deal.merchant?.businessName || '',
      address: deal.merchant?.address || '',
      description: deal.merchant?.description || null,
      logoUrl: deal.merchant?.logoUrl || null,
      latitude: deal.merchant?.latitude || null,
      longitude: deal.merchant?.longitude || null,
      status: deal.merchant?.status || 'PENDING',
      createdAt: deal.merchant?.createdAt?.toISOString() || null,
      updatedAt: deal.merchant?.updatedAt?.toISOString() || null,
    },
    ...(distance !== undefined && { distance: Math.round(distance * 100) / 100 }), // Round to 2 decimal places
  };
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
      // Validate category
      const validCategories = [
        'FOOD_AND_BEVERAGE', 'RETAIL', 'ENTERTAINMENT', 'HEALTH_AND_FITNESS',
        'BEAUTY_AND_SPA', 'AUTOMOTIVE', 'TRAVEL', 'EDUCATION', 'TECHNOLOGY',
        'HOME_AND_GARDEN', 'OTHER'
      ];
      
      if (!validCategories.includes(category as string)) {
        return res.status(400).json({
          error: `Invalid category. Must be one of: ${validCategories.join(', ')}`
        });
      }
      
      whereClause.category = category;
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
        // @ts-ignore
        merchant: { include: { stores: { include: { city: true } } } },
      },
      orderBy: {
        createdAt: 'desc',
      },
      // Add query hints for better performance
      // This helps PostgreSQL choose the right indexes
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
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
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
      const happyHourDeals = (deals as any[]).filter(d => d.dealType === 'HAPPY_HOUR');
      const otherDeals = (deals as any[]).filter(d => d.dealType !== 'HAPPY_HOUR');
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
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- Endpoint: GET /api/deals/categories ---
// Returns all available deal categories
router.get('/deals/categories', async (req, res) => {
  try {
    const categories = [
      { 
        value: 'FOOD_AND_BEVERAGE', 
        label: 'Food & Beverage',
        description: 'Restaurants, cafes, bars, food delivery',
        icon: '🍽️'
      },
      { 
        value: 'RETAIL', 
        label: 'Retail',
        description: 'Clothing, electronics, general merchandise',
        icon: '🛍️'
      },
      { 
        value: 'ENTERTAINMENT', 
        label: 'Entertainment',
        description: 'Movies, events, activities, gaming',
        icon: '🎬'
      },
      { 
        value: 'HEALTH_AND_FITNESS', 
        label: 'Health & Fitness',
        description: 'Gyms, wellness, medical services',
        icon: '💪'
      },
      { 
        value: 'BEAUTY_AND_SPA', 
        label: 'Beauty & Spa',
        description: 'Salons, spas, beauty services',
        icon: '💅'
      },
      { 
        value: 'AUTOMOTIVE', 
        label: 'Automotive',
        description: 'Car services, dealerships, auto parts',
        icon: '🚗'
      },
      { 
        value: 'TRAVEL', 
        label: 'Travel',
        description: 'Hotels, flights, vacation packages',
        icon: '✈️'
      },
      { 
        value: 'EDUCATION', 
        label: 'Education',
        description: 'Courses, training, educational services',
        icon: '📚'
      },
      { 
        value: 'TECHNOLOGY', 
        label: 'Technology',
        description: 'Software, gadgets, tech services',
        icon: '💻'
      },
      { 
        value: 'HOME_AND_GARDEN', 
        label: 'Home & Garden',
        description: 'Furniture, gardening, home improvement',
        icon: '🏠'
      },
      { 
        value: 'OTHER', 
        label: 'Other',
        description: 'Miscellaneous deals',
        icon: '📦'
      }
    ];

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
      include: {
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
      if (d.dealType !== 'RECURRING') return true;
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
      const typePriority = d.dealType === 'HAPPY_HOUR' ? 3 : (d.dealType === 'RECURRING' ? 2 : 1);
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

export default router;