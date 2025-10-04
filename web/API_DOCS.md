# GeolocationMVPBackend API Documentation

## Overview

The GeolocationMVPBackend is a Node.js/TypeScript backend for a geolocation-based deals platform using Express, Prisma, and PostgreSQL. It provides APIs for user management, merchant operations, deal discovery, gamification, and admin functions.

**Base URL**: `http://localhost:3000/api`  
**Version**: 1.0.0  
**Authentication**: JWT Bearer Token

## Table of Contents

1. [Authentication](#authentication)
2. [User Management](#user-management)
3. [Merchant Operations](#merchant-operations)
4. [Deal Discovery](#deal-discovery)
5. [User Interactions](#user-interactions)
6. [Leaderboard](#leaderboard)
7. [Admin Functions](#admin-functions)
8. [Media Upload](#media-upload)
9. [Health & Monitoring](#health--monitoring)
10. [Data Models](#data-models)
11. [Error Handling](#error-handling)

## Authentication

### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "referralCode": "ABC12345" // optional
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "points": 50,
    "referralCode": "XYZ78901",
    "role": "USER"
  }
}
```

### POST /api/auth/login
Authenticate user and get JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### GET /api/auth/me
Get current user profile.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "points": 150,
  "referralCode": "XYZ78901",
  "role": "USER"
}
```

## User Management

### POST /api/users/save-deal
Save a deal for the authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "dealId": 123
}
```

### POST /api/users/check-in
Check in at a merchant location for a deal.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "dealId": 123,
  "latitude": 40.7128,
  "longitude": -74.0060
}
```

**Response:**
```json
{
  "dealId": 123,
  "merchantId": 456,
  "userId": 1,
  "distanceMeters": 45.2,
  "withinRange": true,
  "thresholdMeters": 100,
  "dealActive": true,
  "pointsAwarded": 35,
  "firstCheckIn": true
}
```

### GET /api/users/saved-deals
Get all saved deals for the authenticated user.

**Headers:** `Authorization: Bearer <token>`

### DELETE /api/users/save-deal/:dealId
Remove a saved deal.

**Headers:** `Authorization: Bearer <token>`

### GET /api/users/referrals
Get referral statistics for the authenticated user.

**Headers:** `Authorization: Bearer <token>`

## Merchant Operations

### POST /api/merchants/register
Register as a merchant (requires authentication).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "businessName": "Joe's Pizza",
  "address": "123 Main St, New York, NY",
  "description": "Best pizza in town",
  "logoUrl": "https://res.cloudinary.com/example/image/upload/v1234567890/business_logo/1234567890.jpg",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "cityId": 1
}
```

**Note**: The `logoUrl` field should contain the URL returned from the `/api/media/upload` endpoint with `context=business_logo`. This ensures proper image optimization and CDN delivery.

**Response:**
```json
{
  "success": true,
  "message": "Merchant registration submitted successfully",
  "data": {
    "merchant": {
      "id": 123,
      "businessName": "Joe's Pizza",
      "address": "123 Main St, New York, NY",
      "description": "Best pizza in town",
      "logoUrl": "https://res.cloudinary.com/example/image/upload/v1234567890/business_logo/1234567890.jpg",
      "status": "PENDING",
      "latitude": 40.7128,
      "longitude": -74.0060,
      "cityId": 1,
      "ownerId": 456,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

**Error Responses:**
```json
{
  "success": false,
  "error": "Validation failed",
  "message": "Business name is required"
}
```

**Status Codes:**
- `201` - Merchant registration successful
- `400` - Validation error (missing required fields, invalid data)
- `401` - Unauthorized (invalid or missing token)
- `409` - Conflict (merchant already exists for this user)

**Logo Upload Process:**
The merchant onboarding flow includes an integrated logo upload feature:

1. **Upload Endpoint**: `POST /api/media/upload`
2. **Context**: `business_logo`
3. **File Requirements**: 
   - Image formats: PNG, JPG, GIF
   - Maximum size: 5MB
   - Recommended: Square aspect ratio (1:1)
4. **Response**: Returns Cloudinary URL for use in `logoUrl` field

**Frontend Implementation:**
The frontend uses the `ImageUpload` component which:
- Handles drag-and-drop file uploads
- Validates file type and size
- Shows upload progress
- Displays uploaded image preview
- Provides error handling and user feedback
- Automatically validates Cloudinary response format
- Uses optimized Cloudinary URLs for display

**Cloudinary Integration:**
- Images are automatically optimized for different use cases (logo, thumbnail, card, detail)
- Responsive image URLs are generated for different screen sizes
- Automatic format conversion (WebP when supported)
- Quality optimization based on content
- Proper error handling for invalid Cloudinary responses

**Example Logo Upload:**
```bash
curl -X POST "https://api.yohop.com/api/media/upload" \
  -H "Authorization: Bearer <token>" \
  -F "file=@logo.png" \
  -F "context=business_logo"
```

**Response:**
```json
{
  "message": "File uploaded successfully.",
  "url": "https://res.cloudinary.com/example/image/upload/v1234567890/business_logo/1234567890.jpg",
  "publicId": "business_logo/1234567890"
}
```

**Note**: The `logoUrl` field in the merchant registration payload should contain the URL returned from the media upload endpoint, not a manually entered URL.

**Cloudinary URL Optimization:**
The frontend automatically optimizes Cloudinary URLs for different display contexts:
- **Logo display**: 200x200px, rounded corners, center-cropped
- **Thumbnail**: 100x100px, face-detection cropping
- **Card display**: 300x200px, auto-cropped
- **Detail view**: 800x600px, fit-to-container

All images are automatically converted to WebP format when supported by the browser, with fallback to original format.

### GET /api/merchants/status
Get merchant status for the authenticated user.

**Headers:** `Authorization: Bearer <token>`

### POST /api/deals
Create a new deal (requires approved merchant status).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "50% Off Pizza",
  "description": "Get half off any pizza",
  "activeDateRange": {
    "startDate": "2024-01-01T00:00:00Z",
    "endDate": "2024-01-31T23:59:59Z"
  },
  "imageUrls": ["https://example.com/pizza.jpg"],
  "discountPercentage": 50,
  "category": "FOOD_AND_BEVERAGE",
  "dealType": "STANDARD",
  "redemptionInstructions": "Show this deal at checkout"
}
```

### GET /api/merchants/deals
Get all deals created by the authenticated merchant.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `activeOnly` (boolean): Filter for active deals only
- `includeExpired` (boolean): Include expired deals

### PUT /api/merchants/coordinates
Update merchant coordinates.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "latitude": 40.7128,
  "longitude": -74.0060
}
```

### Menu Management

#### GET /api/merchants/me/menu
Get menu items for the authenticated merchant.

#### POST /api/merchants/me/menu/item
Create a new menu item.

**Request Body:**
```json
{
  "name": "Margherita Pizza",
  "price": 15.99,
  "category": "Pizza",
  "description": "Classic tomato and mozzarella",
  "imageUrl": "https://example.com/margherita.jpg"
}
```

#### PUT /api/merchants/me/menu/item/:itemId
Update a menu item.

#### DELETE /api/merchants/me/menu/item/:itemId
Delete a menu item.

### Store Management

#### GET /api/merchants/stores
List stores for the authenticated merchant.

#### POST /api/merchants/stores
Create a new store.

**Request Body:**
```json
{
  "address": "456 Oak Ave, New York, NY",
  "latitude": 40.7589,
  "longitude": -73.9851,
  "cityId": 1,
  "active": true
}
```

## Deal Discovery

### GET /api/deals
Discover deals with optional filtering.

**Query Parameters:**
- `latitude` (number): User's latitude for distance filtering
- `longitude` (number): User's longitude for distance filtering
- `radius` (number): Search radius in kilometers
- `category` (string): Filter by deal category
- `search` (string): Search in title and description
- `cityId` (number): Filter by city

**Response:**
```json
{
  "deals": [
    {
      "id": 123,
      "title": "50% Off Pizza",
      "description": "Get half off any pizza",
      "imageUrl": "https://example.com/pizza.jpg",
      "images": ["https://example.com/pizza.jpg"],
      "offerDisplay": "50% OFF",
      "merchant": {
        "id": 456,
        "businessName": "Joe's Pizza",
        "address": "123 Main St",
        "latitude": 40.7128,
        "longitude": -74.0060,
        "logoUrl": "https://example.com/logo.jpg"
      },
      "distance": 0.5,
      "claimedBy": {
        "totalCount": 15,
        "visibleUsers": [
          {"avatarUrl": "https://example.com/avatar1.jpg"}
        ]
      }
    }
  ],
  "total": 1,
  "filters": {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "radius": 5,
    "category": "FOOD_AND_BEVERAGE",
    "search": null,
    "cityId": 1
  }
}
```

### GET /api/deals/categories
Get all available deal categories.

**Response:**
```json
{
  "categories": [
    {
      "value": "FOOD_AND_BEVERAGE",
      "label": "Food & Beverage",
      "description": "Restaurants, cafes, bars, food delivery",
      "icon": "🍽️"
    }
  ],
  "total": 11
}
```

### GET /api/deals/featured
Get featured deals for homepage.

**Query Parameters:**
- `limit` (number): Number of deals to return (max 20, default 8)

### GET /api/deals/:id
Get detailed information about a specific deal.

**Response:**
```json
{
  "success": true,
  "deal": {
    "id": 123,
    "title": "50% Off Pizza",
    "description": "Get half off any pizza",
    "category": {
      "value": "FOOD_AND_BEVERAGE",
      "label": "Food & Beverage",
      "description": "Restaurants, cafes, bars",
      "icon": "🍽️",
      "color": "#FF5733"
    },
    "imageUrl": "https://example.com/pizza.jpg",
    "images": ["https://example.com/pizza.jpg"],
    "offerDisplay": "50% OFF",
    "discountPercentage": 50,
    "startTime": "2024-01-01T00:00:00Z",
    "endTime": "2024-01-31T23:59:59Z",
    "status": {
      "isActive": true,
      "isExpired": false,
      "isUpcoming": false,
      "timeRemaining": {
        "total": 2592000000,
        "hours": 720,
        "minutes": 0,
        "formatted": "720h 0m"
      }
    },
    "merchant": {
      "id": 456,
      "businessName": "Joe's Pizza",
      "description": "Best pizza in town",
      "address": "123 Main St",
      "latitude": 40.7128,
      "longitude": -74.0060,
      "logoUrl": "https://example.com/logo.jpg",
      "totalDeals": 5,
      "totalStores": 2
    },
    "socialProof": {
      "totalSaves": 25,
      "recentSavers": [
        {
          "id": 1,
          "name": "John Doe",
          "avatarUrl": "https://example.com/avatar1.jpg",
          "savedAt": "2024-01-15T10:30:00Z"
        }
      ]
    }
  }
}
```

## Leaderboard

### GET /api/leaderboard
Get leaderboard rankings.

**Query Parameters:**
- `period` (string): Time period (day, week, month, year, all_time)
- `limit` (number): Number of entries (1-50, default 10)
- `includeSelf` (boolean): Include current user if not in top (default true)
- `year` (number): Specific year for custom period
- `month` (number): Specific month for custom period

**Response:**
```json
{
  "period": {
    "granularity": "month",
    "start": "2024-01-01T00:00:00Z",
    "endExclusive": "2024-02-01T00:00:00Z",
    "label": "January 2024"
  },
  "top": [
    {
      "userId": 1,
      "name": "John Doe",
      "periodPoints": 150,
      "totalPoints": 300,
      "rank": 1
    }
  ],
  "me": {
    "userId": 2,
    "name": "Jane Smith",
    "periodPoints": 75,
    "totalPoints": 200,
    "rank": 5,
    "inTop": false
  }
}
```

## Admin Functions

### City Management

#### GET /api/admin/cities
Get all cities with pagination and filtering.

**Headers:** `Authorization: Bearer <admin_token>`

**Query Parameters:**
- `page` (number): Page number (default 1)
- `limit` (number): Items per page (default 50)
- `active` (boolean): Filter by active status
- `search` (string): Search by name or state
- `state` (string): Filter by state

#### PUT /api/admin/cities/:cityId/active
Update a city's active status.

**Request Body:**
```json
{
  "active": true
}
```

#### POST /api/admin/cities
Create a new city.

**Request Body:**
```json
{
  "name": "New York",
  "state": "NY",
  "active": true
}
```

### Merchant Management

#### GET /api/admin/merchants
Get all merchants with pagination and filtering.

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `status` (string): Filter by merchant status
- `search` (string): Search by business name, description, or address

#### POST /api/admin/merchants/:merchantId/approve
Approve a merchant application.

#### POST /api/admin/merchants/:merchantId/reject
Reject a merchant application.

**Request Body:**
```json
{
  "reason": "Incomplete business information"
}
```

### Master Data Management

#### Categories
- `GET /api/admin/master-data/categories` - List categories
- `POST /api/admin/master-data/categories` - Create category
- `GET /api/admin/master-data/categories/:id` - Get category
- `PUT /api/admin/master-data/categories/:id` - Update category
- `DELETE /api/admin/master-data/categories/:id` - Delete category

#### Deal Types
- `GET /api/admin/master-data/deal-types` - List deal types
- `POST /api/admin/master-data/deal-types` - Create deal type

#### Point Event Types
- `GET /api/admin/master-data/point-event-types` - List point event types
- `POST /api/admin/master-data/point-event-types` - Create point event type

## Media Upload

### POST /api/media/upload
Upload files to Cloudinary.

**Headers:** `Authorization: Bearer <token>`

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file`: Image file
- `context`: Upload context (e.g., "user_avatar", "business_logo", "deal_image")

**Response:**
```json
{
  "message": "File uploaded successfully.",
  "url": "https://res.cloudinary.com/example/image/upload/v1234567890/context/user/1234567890.jpg",
  "publicId": "context/user/1234567890"
}
```

## Health & Monitoring

### GET /api/health
Basic health check.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "service": "GeolocationMVPBackend",
  "version": "1.0.0"
}
```

### GET /api/health/detailed
Detailed health check with metrics.

### GET /api/ready
Readiness probe for Kubernetes.

### GET /api/live
Liveness probe for Kubernetes.

### GET /api/metrics
Get application metrics.

## Data Models

### User
```typescript
{
  id: number;
  email: string;
  name?: string;
  avatarUrl?: string;
  password: string;
  role: 'USER' | 'MERCHANT' | 'ADMIN';
  points: number;
  monthlyPoints: number;
  referralCode?: string;
  referredByUserId?: number;
  birthday?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Merchant
```typescript
{
  id: number;
  businessName: string;
  address: string;
  description?: string;
  logoUrl?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  latitude?: number;
  longitude?: number;
  city?: string;
  ownerId: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### Deal
```typescript
{
  id: number;
  title: string;
  description: string;
  imageUrls: string[];
  discountPercentage?: number;
  discountAmount?: number;
  categoryId: number;
  dealTypeId: number;
  recurringDays?: string;
  startTime: Date;
  endTime: Date;
  redemptionInstructions: string;
  offerTerms?: string;
  kickbackEnabled: boolean;
  merchantId: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### Deal Categories
- `FOOD_AND_BEVERAGE`
- `RETAIL`
- `ENTERTAINMENT`
- `HEALTH_AND_FITNESS`
- `BEAUTY_AND_SPA`
- `AUTOMOTIVE`
- `TRAVEL`
- `EDUCATION`
- `TECHNOLOGY`
- `HOME_AND_GARDEN`
- `OTHER`

### Deal Types
- `STANDARD`
- `HAPPY_HOUR`
- `RECURRING`

## Error Handling

### Standard Error Response
```json
{
  "error": "Error message",
  "message": "Detailed error description"
}
```

### Validation Error Response
```json
{
  "errors": [
    {
      "code": "invalid_type",
      "expected": "string",
      "received": "number",
      "path": ["email"],
      "message": "Expected string, received number"
    }
  ]
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error
- `503` - Service Unavailable

## Rate Limiting

- **Rate Limit**: 200 requests per 15 minutes per IP
- **Headers**: Rate limit information included in response headers
- **Exemptions**: Health check endpoints are not rate limited

## Environment Variables

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/geolocation_mvp
JWT_SECRET=your-secret-key
PORT=3000
SIGNUP_POINTS=50
CHECKIN_POINTS=10
FIRST_CHECKIN_BONUS_POINTS=25
CHECKIN_RADIUS_METERS=100
```

## Development

### Running the Server
```bash
npm run dev    # Development with hot reload
npm run build  # Build TypeScript
npm start      # Production start
npm test       # Run tests
```

### Database Management
```bash
npx prisma migrate dev    # Run migrations
npx prisma generate       # Generate Prisma client
npx prisma studio         # Open Prisma Studio
```
