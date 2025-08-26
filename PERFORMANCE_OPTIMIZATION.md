# Performance Optimization Guide

## Overview
This document outlines the performance optimizations implemented for the GET Deals API, including database indexes, query optimizations, and testing strategies to ensure fast response times with multiple filters applied.

## Database Indexes

### Primary Indexes
The following indexes have been created to optimize query performance:

#### 1. Composite Index for Active Deals
```sql
CREATE INDEX "idx_deals_active_approved_created" ON "Deal" ("startTime", "endTime", "createdAt" DESC);
```
- **Purpose**: Optimizes the most common query pattern
- **Covers**: Active deals filtering and sorting by creation date
- **Performance**: O(log n) for date range queries

#### 2. Category Filtering Index
```sql
CREATE INDEX "idx_deals_category" ON "Deal" ("category");
CREATE INDEX "idx_deals_category_active" ON "Deal" ("category", "startTime", "endTime");
```
- **Purpose**: Fast category-based filtering
- **Performance**: O(log n) for category lookups

#### 3. Search Optimization Indexes
```sql
-- Full-text search indexes
CREATE INDEX "idx_deals_title_gin" ON "Deal" USING GIN (to_tsvector('english', "title"));
CREATE INDEX "idx_deals_description_gin" ON "Deal" USING GIN (to_tsvector('english', "description"));

-- Trigram indexes for ILIKE queries
CREATE INDEX "idx_deals_title_trgm" ON "Deal" USING GIN ("title" gin_trgm_ops);
CREATE INDEX "idx_deals_description_trgm" ON "Deal" USING GIN ("description" gin_trgm_ops);
```
- **Purpose**: Optimize text search operations
- **Performance**: O(log n) for text searches

#### 4. Merchant Relationship Indexes
```sql
CREATE INDEX "idx_merchant_status" ON "Merchant" ("status");
CREATE INDEX "idx_merchant_status_coordinates" ON "Merchant" ("status", "latitude", "longitude");
CREATE INDEX "idx_deals_merchant_id" ON "Deal" ("merchantId");
```
- **Purpose**: Optimize merchant joins and geospatial queries
- **Performance**: O(log n) for merchant filtering

#### 5. Complex Query Index
```sql
CREATE INDEX "idx_deals_complex_query" ON "Deal" ("category", "startTime", "endTime", "merchantId", "createdAt" DESC);
```
- **Purpose**: Optimize queries with multiple filters
- **Performance**: O(log n) for complex filter combinations

#### 6. Partial Index for Active Deals
```sql
CREATE INDEX "idx_deals_active_partial" ON "Deal" ("category", "merchantId", "createdAt" DESC) 
WHERE "startTime" <= NOW() AND "endTime" >= NOW();
```
- **Purpose**: Reduce index size by only indexing active deals
- **Performance**: Smaller index size, faster queries

## Query Optimizations

### 1. Database-Level Filtering
- **Before**: All filtering done in application memory
- **After**: Maximum filtering at database level
- **Benefit**: Reduced data transfer and memory usage

### 2. Optimized Geospatial Queries
```typescript
// Database-level constraint for merchants with coordinates
whereClause.merchant = {
  ...whereClause.merchant,
  latitude: { not: null },
  longitude: { not: null },
};
```

### 3. Efficient Search Implementation
- **Trigram indexes**: For partial text matching
- **Full-text search**: For semantic search capabilities
- **Case-insensitive**: Optimized with proper indexes

## Performance Monitoring

### Query Performance Logging
```typescript
function logQueryPerformance(operation: string, startTime: number, resultCount: number, filters?: any) {
  const duration = Date.now() - startTime;
  console.log(`[PERFORMANCE] ${operation}: ${duration}ms, ${resultCount} results`);
  
  if (duration > 1000) {
    console.warn(`[SLOW QUERY] ${operation} took ${duration}ms - consider optimization`);
  }
}
```

### Performance Metrics
- **Query duration**: Track execution time
- **Result count**: Monitor data volume
- **Filter combinations**: Identify slow patterns
- **Slow query alerts**: Automatic warnings for queries > 1 second

## Testing Scenarios

### 1. Basic Performance Tests

#### Single Filter Tests
```bash
# Category filter only
curl "http://localhost:3000/api/deals?category=FOOD_AND_BEVERAGE"

# Search filter only
curl "http://localhost:3000/api/deals?search=coffee"

# Geolocation filter only
curl "http://localhost:3000/api/deals?latitude=40.7128&longitude=-74.0060&radius=5"
```

#### Multiple Filter Tests
```bash
# Category + Search
curl "http://localhost:3000/api/deals?category=FOOD_AND_BEVERAGE&search=coffee"

# Category + Geolocation
curl "http://localhost:3000/api/deals?category=RETAIL&latitude=40.7128&longitude=-74.0060&radius=10"

# Search + Geolocation
curl "http://localhost:3000/api/deals?search=discount&latitude=34.0522&longitude=-118.2437&radius=5"

# All filters combined
curl "http://localhost:3000/api/deals?category=ENTERTAINMENT&search=movie&latitude=40.7128&longitude=-74.0060&radius=15"
```

### 2. Load Testing

#### Apache Bench (ab) Commands
```bash
# Basic load test
ab -n 1000 -c 10 "http://localhost:3000/api/deals"

# Complex filter load test
ab -n 1000 -c 10 "http://localhost:3000/api/deals?category=FOOD_AND_BEVERAGE&search=coffee&latitude=40.7128&longitude=-74.0060&radius=5"

# Concurrent users test
ab -n 5000 -c 50 "http://localhost:3000/api/deals"
```

#### Artillery Load Testing
```yaml
# artillery-config.yml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Ramp up"
    - duration: 120
      arrivalRate: 50
      name: "Sustained load"
    - duration: 60
      arrivalRate: 100
      name: "Peak load"

scenarios:
  - name: "Deals API Performance Test"
    requests:
      - get:
          url: "/api/deals"
      - get:
          url: "/api/deals?category=FOOD_AND_BEVERAGE"
      - get:
          url: "/api/deals?search=coffee&latitude=40.7128&longitude=-74.0060&radius=5"
```

### 3. Database Performance Tests

#### Query Analysis
```sql
-- Analyze query performance
EXPLAIN ANALYZE 
SELECT d.*, m.* 
FROM "Deal" d 
JOIN "Merchant" m ON d."merchantId" = m.id 
WHERE d."startTime" <= NOW() 
  AND d."endTime" >= NOW() 
  AND m."status" = 'APPROVED' 
  AND d."category" = 'FOOD_AND_BEVERAGE'
ORDER BY d."createdAt" DESC;

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
WHERE tablename IN ('Deal', 'Merchant')
ORDER BY idx_scan DESC;
```

#### Index Performance Monitoring
```sql
-- Monitor index usage
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE tablename IN ('Deal', 'Merchant');

-- Check for unused indexes
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND tablename IN ('Deal', 'Merchant');
```

## Performance Benchmarks

### Expected Performance Metrics

#### Response Times
- **Simple query** (no filters): < 50ms
- **Single filter**: < 100ms
- **Multiple filters**: < 200ms
- **Complex query** (all filters): < 500ms
- **Geospatial query**: < 300ms

#### Throughput
- **Requests per second**: > 100 RPS
- **Concurrent users**: > 50 users
- **Data volume**: Handle 10,000+ deals efficiently

#### Database Performance
- **Query execution time**: < 100ms
- **Index hit ratio**: > 95%
- **Cache hit ratio**: > 80%

### Performance Testing Scripts

#### Node.js Performance Test
```javascript
// performance-test.js
const axios = require('axios');

async function performanceTest() {
  const baseUrl = 'http://localhost:3000/api/deals';
  const testCases = [
    { name: 'No filters', url: baseUrl },
    { name: 'Category filter', url: `${baseUrl}?category=FOOD_AND_BEVERAGE` },
    { name: 'Search filter', url: `${baseUrl}?search=coffee` },
    { name: 'Geolocation filter', url: `${baseUrl}?latitude=40.7128&longitude=-74.0060&radius=5` },
    { name: 'All filters', url: `${baseUrl}?category=RETAIL&search=discount&latitude=40.7128&longitude=-74.0060&radius=10` }
  ];

  for (const testCase of testCases) {
    const startTime = Date.now();
    try {
      const response = await axios.get(testCase.url);
      const duration = Date.now() - startTime;
      console.log(`${testCase.name}: ${duration}ms, ${response.data.deals.length} results`);
    } catch (error) {
      console.error(`Error in ${testCase.name}:`, error.message);
    }
  }
}

performanceTest();
```

## Optimization Recommendations

### 1. Database Optimizations
- **Regular VACUUM**: Keep tables and indexes optimized
- **ANALYZE**: Update statistics for query planner
- **Connection pooling**: Use connection pooling for high concurrency
- **Read replicas**: Consider read replicas for high-traffic scenarios

### 2. Application Optimizations
- **Caching**: Implement Redis caching for frequent queries
- **Pagination**: Add pagination for large result sets
- **Query optimization**: Use database-level filtering where possible
- **Connection management**: Optimize database connections

### 3. Infrastructure Optimizations
- **CDN**: Use CDN for static assets
- **Load balancing**: Implement load balancing for high availability
- **Monitoring**: Set up comprehensive monitoring and alerting
- **Auto-scaling**: Implement auto-scaling based on load

## Monitoring and Alerting

### Key Metrics to Monitor
1. **Response time**: Average and 95th percentile
2. **Throughput**: Requests per second
3. **Error rate**: Percentage of failed requests
4. **Database performance**: Query execution time, index usage
5. **Resource utilization**: CPU, memory, disk I/O

### Alerting Thresholds
- **Response time > 1 second**: Warning
- **Response time > 3 seconds**: Critical
- **Error rate > 5%**: Warning
- **Error rate > 10%**: Critical
- **Database query > 500ms**: Warning

## Future Optimizations

### Planned Improvements
1. **Full-text search**: Implement PostgreSQL full-text search
2. **Geospatial indexing**: Add PostGIS for advanced geospatial queries
3. **Caching layer**: Implement Redis caching strategy
4. **Query optimization**: Further optimize complex queries
5. **Database partitioning**: Partition large tables by date
6. **Read replicas**: Implement read replicas for scaling

### Performance Targets
- **Sub-100ms response times** for all queries
- **1000+ RPS** throughput
- **99.9% uptime** availability
- **Sub-second** database query times
