# Search API Documentation

## Overview
The GET Deals API has been enhanced with search capabilities to allow users to find deals by searching through titles and descriptions. This feature works alongside existing category and geolocation filtering to provide comprehensive deal discovery.

## Search Functionality

### Search Scope
- **Title Search**: Searches through deal titles
- **Description Search**: Searches through deal descriptions
- **Case-Insensitive**: Search is not case-sensitive
- **Partial Matching**: Finds deals containing the search term anywhere in the text

### Search Logic
- Uses PostgreSQL's `ILIKE` operator for case-insensitive pattern matching
- Searches both title and description fields simultaneously
- Returns deals that match the search term in either field
- Combines with other filters (category, geolocation) seamlessly

## API Endpoints

### GET /api/deals (Enhanced)
Fetches active deals with optional search, category, and geolocation filtering.

#### Query Parameters
- `search` (optional): Keyword to search in titles and descriptions
- `category` (optional): Filter deals by category
- `latitude` (optional): User's latitude in decimal degrees
- `longitude` (optional): User's longitude in decimal degrees  
- `radius` (optional): Search radius in kilometers

#### Search Validation Rules
- **Minimum length**: 2 characters
- **Maximum length**: 100 characters
- **Trimmed**: Leading and trailing whitespace are automatically removed
- **Required**: Must be a non-empty string

#### Examples

**Search for coffee deals:**
```bash
GET /api/deals?search=coffee
```

**Search for food deals in a specific category:**
```bash
GET /api/deals?search=food&category=FOOD_AND_BEVERAGE
```

**Search for deals near a location:**
```bash
GET /api/deals?search=discount&latitude=40.7128&longitude=-74.0060&radius=5
```

**Complex search with all filters:**
```bash
GET /api/deals?search=50%&category=RETAIL&latitude=34.0522&longitude=-118.2437&radius=10
```

#### Response Format
```json
{
  "deals": [
    {
      "id": 1,
      "title": "50% off Coffee",
      "description": "Half price coffee all day at our downtown location",
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
    "category": "FOOD_AND_BEVERAGE",
    "search": "coffee"
  }
}
```

## Search Examples

### Common Search Patterns

**Percentage discounts:**
```bash
GET /api/deals?search=50%
GET /api/deals?search=discount
```

**Food-related searches:**
```bash
GET /api/deals?search=pizza
GET /api/deals?search=restaurant
GET /api/deals?search=delivery
```

**Service-related searches:**
```bash
GET /api/deals?search=massage
GET /api/deals?search=spa
GET /api/deals?search=training
```

**Product-related searches:**
```bash
GET /api/deals?search=shoes
GET /api/deals?search=electronics
GET /api/deals?search=furniture
```

## Filter Combination Logic

### Supported Combinations
The API supports combining search with all other filters:

1. **Search only**: `?search=coffee`
2. **Search + Category**: `?search=food&category=FOOD_AND_BEVERAGE`
3. **Search + Geolocation**: `?search=discount&latitude=40.7128&longitude=-74.0060&radius=5`
4. **All filters**: `?search=50%&category=RETAIL&latitude=40.7128&longitude=-74.0060&radius=5`

### Filter Order of Application
1. **Database-level filters**: Category and search (applied at database level)
2. **Application-level filters**: Geolocation (applied after database query)
3. **Sorting**: Distance sorting (when geolocation is used)

## Validation Rules

### Search Term Validation
- **Minimum length**: 2 characters
- **Maximum length**: 100 characters
- **Type**: Must be a string
- **Content**: Cannot be empty after trimming whitespace

### Error Responses

**Search term too short:**
```json
{
  "error": "Search term must be at least 2 characters long."
}
```

**Search term too long:**
```json
{
  "error": "Search term must be no more than 100 characters long."
}
```

**Invalid search parameter:**
```json
{
  "error": "Search parameter must be a valid string."
}
```

## Performance Considerations

### Database Optimization
- **Indexing**: Consider adding full-text search indexes for large datasets
- **Query efficiency**: Search is applied at the database level for optimal performance
- **Combined queries**: Multiple filters are combined efficiently in a single query

### Search Performance Tips
1. **Use specific terms**: More specific search terms yield better results
2. **Combine with categories**: Use category filters to narrow search scope
3. **Limit radius**: Use geolocation filters to reduce search area
4. **Avoid very short terms**: Terms shorter than 2 characters are rejected

## Implementation Details

### Database Query Structure
```sql
-- Example of the generated query
SELECT * FROM "Deal" 
WHERE "startTime" <= NOW() 
  AND "endTime" >= NOW()
  AND "merchantId" IN (
    SELECT "id" FROM "Merchant" WHERE "status" = 'APPROVED'
  )
  AND (
    "title" ILIKE '%search_term%' 
    OR "description" ILIKE '%search_term%'
  )
  AND "category" = 'FOOD_AND_BEVERAGE'
ORDER BY "createdAt" DESC;
```

### Search Algorithm
- **Pattern matching**: Uses PostgreSQL's `ILIKE` operator
- **Case-insensitive**: Automatically handles different letter cases
- **Partial matching**: Finds terms anywhere in the text
- **OR logic**: Matches if term is found in either title or description

## Best Practices

### For Frontend Implementation
1. **Debounce search**: Implement debouncing to avoid excessive API calls
2. **Minimum length**: Enforce minimum search term length in UI
3. **Loading states**: Show loading indicators during search
4. **Error handling**: Display appropriate error messages for invalid searches

### For Search Terms
1. **Use keywords**: Focus on key terms rather than full sentences
2. **Avoid special characters**: Simple alphanumeric terms work best
3. **Consider synonyms**: Users might search for "food" instead of "restaurant"
4. **Test variations**: Try different search terms to understand user behavior

## Example Usage Scenarios

### Frontend Search Implementation
```javascript
// Search deals with debouncing
let searchTimeout;

function searchDeals(searchTerm) {
  clearTimeout(searchTimeout);
  
  searchTimeout = setTimeout(async () => {
    if (searchTerm.length < 2) {
      // Don't search for very short terms
      return;
    }
    
    const params = new URLSearchParams();
    params.append('search', searchTerm);
    
    try {
      const response = await fetch(`/api/deals?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        displaySearchResults(data.deals);
      } else {
        showError(data.error);
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  }, 300); // 300ms debounce
}
```

### Advanced Search with Filters
```javascript
// Advanced search with multiple filters
async function advancedSearch(options) {
  const params = new URLSearchParams();
  
  if (options.search) params.append('search', options.search);
  if (options.category) params.append('category', options.category);
  if (options.latitude) params.append('latitude', options.latitude);
  if (options.longitude) params.append('longitude', options.longitude);
  if (options.radius) params.append('radius', options.radius);
  
  const response = await fetch(`/api/deals?${params}`);
  const data = await response.json();
  
  return data.deals;
}

// Example usage
const results = await advancedSearch({
  search: 'coffee',
  category: 'FOOD_AND_BEVERAGE',
  latitude: 40.7128,
  longitude: -74.0060,
  radius: 5
});
```

### Search Analytics
```javascript
// Track search patterns for analytics
function trackSearch(searchTerm, filters, resultsCount) {
  analytics.track('deal_search', {
    search_term: searchTerm,
    filters: filters,
    results_count: resultsCount,
    timestamp: new Date().toISOString()
  });
}
```

## Future Enhancements

### Planned Improvements
- **Full-text search**: PostgreSQL full-text search for better relevance
- **Fuzzy matching**: Handle typos and similar terms
- **Search suggestions**: Auto-complete and search suggestions
- **Search analytics**: Track popular search terms and patterns
- **Advanced operators**: Support for AND, OR, NOT operators
- **Search highlighting**: Highlight matching terms in results
- **Search ranking**: Rank results by relevance
- **Multi-language support**: Search in multiple languages

### Performance Optimizations
- **Search indexing**: Add specialized search indexes
- **Caching**: Cache frequent search results
- **Pagination**: Implement search result pagination
- **Async search**: Background search processing for large datasets
