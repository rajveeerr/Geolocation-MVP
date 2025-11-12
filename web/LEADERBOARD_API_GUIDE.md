# Leaderboard API Integration Guide

## Overview
This guide documents the comprehensive leaderboard API endpoints that support activity breakdowns, pagination, and advanced filtering.

## Base URL
All endpoints are relative to: `/api/leaderboard`

---

## 📊 Endpoints

### 1. Basic Leaderboard (Legacy)
Get top 5 users by default with optional pagination.

**Endpoint:** `GET /api/leaderboard`

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `period` | string | `month` | Time period: `day`, `week`, `month`, `year`, `last_7_days`, `last_30_days`, `this_month`, `last_month`, `this_year`, `all_time` |
| `limit` | number | `5` | Number of users to show (1-50) |
| `showMore` | boolean | `false` | Show more than default limit |
| `includeBreakdown` | boolean | `false` | Include point breakdown for all users |
| `includeSelf` | boolean | `true` | Include current user if not in top |

**Example Request:**
```bash
GET /api/leaderboard?period=month&showMore=true&includeBreakdown=true
```

**Response Schema:**
```typescript
{
  top: Array<{
    rank: number;
    userId: number;
    name: string;
    email?: string;
    avatarUrl?: string;
    points: number;
    periodPoints?: number;
    monthlyPoints?: number;
  }>;
  me?: {
    rank: number;
    userId: number;
    name: string;
    points: number;
    inTop: boolean;
  };
  pointBreakdowns?: {
    [userId: string]: Array<{
      eventType: string;        // e.g., "CHECK_IN", "REFERRAL", "DEAL_SAVE"
      eventTypeName: string;    // e.g., "Check In", "Referral Bonus"
      points: number;           // Total points from this activity
      count: number;            // Number of times this activity occurred
    }>;
  };
  pagination?: {
    defaultLimit: number;
    currentLimit: number;
    showMore: boolean;
    hasMore: boolean;
  };
}
```

---

### 2. Global Leaderboard
Enhanced global leaderboard with stats and insights.

**Endpoint:** `GET /api/leaderboard/global`

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `period` | string | `this_month` | Time period filter |
| `limit` | number | `10` | Number of users (1-50) |
| `showMore` | boolean | `false` | Show more users |
| `includeStats` | boolean | `false` | Include global statistics |
| `includeBreakdown` | boolean | `false` | Include activity breakdown |

**Example Request:**
```bash
GET /api/leaderboard/global?period=this_month&showMore=true&includeStats=true&includeBreakdown=true
```

**Response:** Same as basic leaderboard with additional `globalStats` field when `includeStats=true`.

---

### 3. City Leaderboard
Get leaderboard for a specific city.

**Endpoint:** `GET /api/leaderboard/city/:cityId`

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `period` | string | `last_7_days` | Time period filter |
| `limit` | number | `10` | Number of users |
| `showMore` | boolean | `false` | Show more users |
| `includeBreakdown` | boolean | `false` | Include activity breakdown |

**Example Request:**
```bash
GET /api/leaderboard/city/1?period=last_7_days&showMore=true&includeBreakdown=true
```

**Response:** Same as basic leaderboard structure.

---

### 4. Categories Leaderboard
Get leaderboard by category or all categories.

**Endpoint:** `GET /api/leaderboard/categories`

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `period` | string | `this_month` | Time period filter |
| `limit` | number | `5` | Number of users per category |
| `showMore` | boolean | `false` | Show more users |
| `includeBreakdown` | boolean | `false` | Include activity breakdown |

**Example Request:**
```bash
GET /api/leaderboard/categories?period=this_month&showMore=true&includeBreakdown=true
```

**Response Schema:**
```typescript
{
  // Overall leaderboard
  top: Array<LeaderboardUser>;
  me?: LeaderboardUser & { inTop: boolean };
  pointBreakdowns?: Record<string, PointBreakdown[]>;
  pagination?: PaginationInfo;
  
  // Per-category breakdown (if supported by backend)
  categories?: Array<{
    categoryId: number;
    categoryName: string;
    top: Array<LeaderboardUser>;
    pointBreakdowns?: Record<string, PointBreakdown[]>;
  }>;
}
```

---

### 5. Leaderboard Insights
Get insights about user growth and engagement.

**Endpoint:** `GET /api/leaderboard/insights`

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `period` | string | `last_30_days` | Time period filter |
| `includeBreakdown` | boolean | `false` | Include detailed breakdowns |

**Example Request:**
```bash
GET /api/leaderboard/insights?period=last_30_days&includeBreakdown=true
```

**Response Schema:**
```typescript
{
  topGrowth: Array<{
    userId: number;
    name: string;
    pointsGained: number;
    percentageChange: number;
  }>;
  topEngagement: Array<{
    userId: number;
    name: string;
    engagementScore: number;
    checkIns: number;
  }>;
  trends?: {
    daily: Array<{
      date: string;
      totalPoints: number;
      activeUsers: number;
    }>;
    weekly: Array<{
      week: string;
      totalPoints: number;
      activeUsers: number;
    }>;
  };
}
```

---

## 🎯 Usage Examples

### Frontend Hooks

#### Basic Leaderboard with Breakdown
```typescript
import { useLeaderboard } from '@/hooks/useLeaderboard';

const { data, isLoading } = useLeaderboard({
  period: 'month',
  showMore: true,
  includeBreakdown: true,
  limit: 10,
});

// Access point breakdowns
const userBreakdown = data?.pointBreakdowns?.[userId.toString()];
```

#### Global Leaderboard
```typescript
import { useGlobalLeaderboardBasic } from '@/hooks/useLeaderboard';

const { data } = useGlobalLeaderboardBasic({
  period: 'this_month',
  showMore: true,
  includeStats: true,
  includeBreakdown: true,
});
```

#### City-Specific Leaderboard
```typescript
import { useCityLeaderboardBasic } from '@/hooks/useLeaderboard';

const { data } = useCityLeaderboardBasic(cityId, {
  period: 'last_7_days',
  showMore: true,
  includeBreakdown: true,
});
```

#### Categories Leaderboard
```typescript
import { useCategoriesLeaderboard } from '@/hooks/useLeaderboard';

const { data } = useCategoriesLeaderboard({
  period: 'this_month',
  showMore: true,
  includeBreakdown: true,
});
```

#### Insights
```typescript
import { useLeaderboardInsightsBasic } from '@/hooks/useLeaderboard';

const { data } = useLeaderboardInsightsBasic({
  period: 'last_30_days',
  includeBreakdown: true,
});
```

---

## 📝 Point Breakdown Structure

When `includeBreakdown=true`, the API returns detailed activity breakdowns:

```typescript
pointBreakdowns: {
  "123": [  // userId as string key
    {
      eventType: "CHECK_IN",
      eventTypeName: "Check In",
      points: 500,
      count: 10  // 10 check-ins × 50 points each
    },
    {
      eventType: "REFERRAL",
      eventTypeName: "Referral Bonus",
      points: 1000,
      count: 2  // 2 referrals × 500 points each
    },
    {
      eventType: "DEAL_SAVE",
      eventTypeName: "Deal Saved",
      points: 50,
      count: 5  // 5 saves × 10 points each
    }
  ]
}
```

### Common Event Types
- `CHECK_IN` - User checked in at a deal
- `REFERRAL` - User referred someone who signed up
- `DEAL_SAVE` - User saved a deal
- `SIGNUP` - User signed up (initial bonus)
- `PROFILE_COMPLETE` - User completed their profile
- `REVIEW` - User left a review
- `SHARE` - User shared content

---

## 🎨 UI Components

### Leaderboard Pages
1. **LeaderboardPage** (`/leaderboard`) - Basic leaderboard with activity expansion
2. **ComprehensiveLeaderboardPage** (`/leaderboard/comprehensive`) - Full featured with tabs:
   - Global leaderboard
   - City-specific
   - Categories
   - Insights

### Components
- `LeaderboardList` - Displays users with expandable breakdown
- `LeaderboardRow` - Individual user row with point breakdown
- `StatsCard` - Display statistics
- `LeaderboardSkeleton` - Loading state

---

## 🔄 Migration Notes

### From Old to New API
If you're migrating from the old leaderboard API:

**Before:**
```typescript
GET /api/leaderboard?period=month&includeSelf=true
```

**After (with breakdown):**
```typescript
GET /api/leaderboard?period=month&includeSelf=true&showMore=true&includeBreakdown=true
```

### Breaking Changes
- ✅ `points` field is now primary (was `periodPoints`)
- ✅ `pointBreakdowns` is now available for all users (not just current user)
- ✅ New `pagination` object provides better context
- ✅ Activity breakdown available without expanding for privacy

---

## 🚀 Performance Considerations

1. **Caching**: All leaderboard queries cache for 5 minutes
2. **Pagination**: Use `limit` to control response size
3. **Breakdown**: Only request `includeBreakdown=true` when needed
4. **Stats**: Only request `includeStats=true` on global view

---

## 🐛 Error Handling

```typescript
const { data, isLoading, error } = useLeaderboard({
  period: 'month',
  includeBreakdown: true,
});

if (error) {
  console.error('Failed to load leaderboard:', error);
}
```

---

## 📱 Mobile Responsiveness

All leaderboard components are mobile-responsive:
- Stacked layout on small screens
- Touch-friendly expand/collapse
- Optimized data display

---

## 🔐 Authentication

All leaderboard endpoints support:
- ✅ Public access (anonymous users can view)
- ✅ Authenticated users see their position
- ✅ Activity breakdown respects privacy (only your own details)

---

## 📊 Testing

Visit these pages to test:
- `/leaderboard` - Basic leaderboard with expansion
- `/leaderboard/comprehensive` - Full-featured leaderboard dashboard

---

## 🎉 Summary

The new leaderboard API provides:
- ✅ Activity breakdown for ALL users
- ✅ Flexible pagination controls
- ✅ Multiple views (global, city, category)
- ✅ Performance insights
- ✅ Mobile-responsive UI
- ✅ Type-safe React hooks

For questions or issues, check the main API documentation or contact the development team.
