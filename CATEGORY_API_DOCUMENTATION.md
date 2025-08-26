# Category Filtering API Documentation

## Overview
The GET Deals API has been enhanced with category filtering capabilities to allow users to find deals within specific categories. This feature works alongside the existing geolocation filtering to provide more targeted search results.

## Database Schema Changes
The `Deal` model now includes a `category` field:
- `category`: DealCategory enum (required) - Categorizes the deal type
- Default value: `OTHER`

## Available Categories
The system supports the following deal categories:

| Category Value | Display Label | Description |
|----------------|---------------|-------------|
| `FOOD_AND_BEVERAGE` | Food & Beverage | Restaurants, cafes, bars, food delivery |
| `RETAIL` | Retail | Clothing, electronics, general merchandise |
| `ENTERTAINMENT` | Entertainment | Movies, events, activities, gaming |
| `HEALTH_AND_FITNESS` | Health & Fitness | Gyms, wellness, medical services |
| `BEAUTY_AND_SPA` | Beauty & Spa | Salons, spas, beauty services |
| `AUTOMOTIVE` | Automotive | Car services, dealerships, auto parts |
| `TRAVEL` | Travel | Hotels, flights, vacation packages |
| `EDUCATION` | Education | Courses, training, educational services |
| `TECHNOLOGY` | Technology | Software, gadgets, tech services |
| `HOME_AND_GARDEN` | Home & Garden | Furniture, gardening, home improvement |
| `OTHER` | Other | Miscellaneous deals |

## API Endpoints

### 1. GET /api/deals (Enhanced)
Fetches active deals with optional category and geolocation filtering.

#### Query Parameters
- `category` (optional): Filter deals by category
- `latitude` (optional): User's latitude in decimal degrees
- `longitude` (optional): User's longitude in decimal degrees  
- `radius` (optional): Search radius in kilometers

#### Examples

**Get all deals (no filtering):**
```bash
GET /api/deals
```

**Get deals in Food & Beverage category:**
```bash
GET /api/deals?category=FOOD_AND_BEVERAGE
```

**Get retail deals within 5km of a location:**
```bash
GET /api/deals?category=RETAIL&latitude=40.7128&longitude=-74.0060&radius=5
```

**Get entertainment deals within 10km:**
```bash
GET /api/deals?category=ENTERTAINMENT&latitude=34.0522&longitude=-118.2437&radius=10
```

#### Response Format
```json
{
  "deals": [
    {
      "id": 1,
      "title": "50% off Coffee",
      "description": "Half price coffee all day",
      "imageUrl": "https://example.com/coffee.jpg",
      "discountPercentage": 50,
      "discountAmount": null,
      "category": "FOOD_AND_BEVERAGE",
      "startTime": "2024-01-01T00:00:00.000Z",
      "endTime": "2024-12-31T23:59:59.000Z",
      "redemptionInstructions": "Show this deal to the cashier",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "merchantId": 1,
      "merchant": {
        "businessName": "Coffee Shop",
        "address": "123 Main St, New York, NY",
        "logoUrl": "https://example.com/logo.png",
        "latitude": 40.7128,
        "longitude": -74.0060
      },
      "distance": 2.5
    }
  ],
  "total": 1,
  "filters": {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "radius": 5,
    "category": "FOOD_AND_BEVERAGE"
  }
}
```

### 2. GET /api/deals/categories (New)
Returns all available deal categories with their display labels.

#### Response
```json
{
  "categories": [
    { "value": "FOOD_AND_BEVERAGE", "label": "Food & Beverage" },
    { "value": "RETAIL", "label": "Retail" },
    { "value": "ENTERTAINMENT", "label": "Entertainment" },
    { "value": "HEALTH_AND_FITNESS", "label": "Health & Fitness" },
    { "value": "BEAUTY_AND_SPA", "label": "Beauty & Spa" },
    { "value": "AUTOMOTIVE", "label": "Automotive" },
    { "value": "TRAVEL", "label": "Travel" },
    { "value": "EDUCATION", "label": "Education" },
    { "value": "TECHNOLOGY", "label": "Technology" },
    { "value": "HOME_AND_GARDEN", "label": "Home & Garden" },
    { "value": "OTHER", "label": "Other" }
  ],
  "total": 11
}
```

### 3. POST /api/deals (Enhanced)
Create a new deal with category specification.

#### Request Body
```json
{
  "title": "50% off Coffee",
  "description": "Half price coffee all day",
  "startTime": "2024-01-01T00:00:00.000Z",
  "endTime": "2024-12-31T23:59:59.000Z",
  "redemptionInstructions": "Show this deal to the cashier",
  "discountPercentage": 50,
  "category": "FOOD_AND_BEVERAGE"
}
```

#### Response
```json
{
  "message": "Deal created successfully",
  "deal": {
    "id": 1,
    "title": "50% off Coffee",
    "description": "Half price coffee all day",
    "category": "FOOD_AND_BEVERAGE",
    "discountPercentage": 50,
    "startTime": "2024-01-01T00:00:00.000Z",
    "endTime": "2024-12-31T23:59:59.000Z",
    "redemptionInstructions": "Show this deal to the cashier",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "merchantId": 1
  }
}
```

## Filtering Logic

### Category Filtering
- **Database-level filtering**: Category filtering is applied at the database level for optimal performance
- **Case-sensitive**: Category values must match exactly
- **Optional parameter**: If not provided, all categories are returned
- **Combined with geolocation**: Category filtering works alongside geolocation filtering

### Filter Combination
The API supports combining multiple filters:
1. **Category only**: `?category=FOOD_AND_BEVERAGE`
2. **Geolocation only**: `?latitude=40.7128&longitude=-74.0060&radius=5`
3. **Both**: `?category=RETAIL&latitude=40.7128&longitude=-74.0060&radius=5`

## Validation Rules

### Category Validation
- **Valid categories**: Must be one of the predefined category values
- **Case sensitivity**: Category values are case-sensitive
- **Required for creation**: Category is required when creating deals (defaults to 'OTHER' if not provided)

### Error Responses

**Invalid category:**
```json
{
  "error": "Invalid category. Must be one of: FOOD_AND_BEVERAGE, RETAIL, ENTERTAINMENT, HEALTH_AND_FITNESS, BEAUTY_AND_SPA, AUTOMOTIVE, TRAVEL, EDUCATION, TECHNOLOGY, HOME_AND_GARDEN, OTHER"
}
```

**Missing required fields:**
```json
{
  "error": "Title, description, start time, and end time are required."
}
```

## Database Migration
The database migration `20250826180807_add_deal_categories` adds the category field to the Deal table.

### Migration SQL
```sql
-- CreateEnum
CREATE TYPE "DealCategory" AS ENUM ('FOOD_AND_BEVERAGE', 'RETAIL', 'ENTERTAINMENT', 'HEALTH_AND_FITNESS', 'BEAUTY_AND_SPA', 'AUTOMOTIVE', 'TRAVEL', 'EDUCATION', 'TECHNOLOGY', 'HOME_AND_GARDEN', 'OTHER');

-- AlterTable
ALTER TABLE "Deal" ADD COLUMN     "category" "DealCategory" NOT NULL DEFAULT 'OTHER';
```

## Implementation Notes

### Performance Considerations
- **Database indexing**: Consider adding an index on the category field for large datasets
- **Query optimization**: Category filtering is applied at the database level
- **Combined filters**: Multiple filters are applied efficiently in a single query

### Best Practices
1. **Category selection**: Choose the most appropriate category for your deal
2. **Default handling**: Use 'OTHER' for deals that don't fit specific categories
3. **Frontend integration**: Use the categories endpoint to populate dropdown menus
4. **Filter combination**: Combine category and geolocation filters for better user experience

## Example Usage Scenarios

### Frontend Category Dropdown
```javascript
// Fetch available categories
async function loadCategories() {
  const response = await fetch('/api/deals/categories');
  const data = await response.json();
  
  const categorySelect = document.getElementById('category-select');
  data.categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category.value;
    option.textContent = category.label;
    categorySelect.appendChild(option);
  });
}
```

### Filtered Deal Search
```javascript
// Search deals with category and location filters
async function searchDeals(category, lat, lon, radius) {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (lat) params.append('latitude', lat);
  if (lon) params.append('longitude', lon);
  if (radius) params.append('radius', radius);
  
  const response = await fetch(`/api/deals?${params}`);
  const data = await response.json();
  
  return data.deals;
}

// Example: Find food deals within 5km
const foodDeals = await searchDeals('FOOD_AND_BEVERAGE', 40.7128, -74.0060, 5);
```

### Deal Creation with Category
```javascript
// Create a new deal with category
async function createDeal(dealData) {
  const response = await fetch('/api/deals', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      title: '50% off Coffee',
      description: 'Half price coffee all day',
      category: 'FOOD_AND_BEVERAGE',
      startTime: '2024-01-01T00:00:00.000Z',
      endTime: '2024-12-31T23:59:59.000Z',
      redemptionInstructions: 'Show this deal to the cashier',
      discountPercentage: 50
    })
  });
  
  return response.json();
}
```

## Migration Guide

### For Existing Deals
Existing deals will automatically be assigned the 'OTHER' category when the migration is applied.

### Updating Existing Deals
To update existing deals with appropriate categories, you can use a database script:

```sql
-- Example: Update food-related deals
UPDATE "Deal" 
SET category = 'FOOD_AND_BEVERAGE' 
WHERE title ILIKE '%coffee%' OR title ILIKE '%food%' OR title ILIKE '%restaurant%';
```

## Future Enhancements
- **Subcategories**: Support for more granular categorization
- **Category analytics**: Track popular categories and trends
- **Dynamic categories**: Allow merchants to suggest new categories
- **Category-based recommendations**: Suggest deals based on user preferences
