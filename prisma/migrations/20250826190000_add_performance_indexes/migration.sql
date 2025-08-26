-- Add performance indexes for GET /api/deals endpoint
-- This migration adds indexes to optimize query performance with multiple filters

-- Composite index for the most common query pattern: active deals from approved merchants
-- This covers: startTime, endTime, merchant.status, and createdAt for sorting
CREATE INDEX "idx_deals_active_approved_created" ON "Deal" ("startTime", "endTime", "createdAt" DESC);

-- Index for category filtering (often used with other filters)
CREATE INDEX "idx_deals_category" ON "Deal" ("category");

-- Composite index for category + active deals
CREATE INDEX "idx_deals_category_active" ON "Deal" ("category", "startTime", "endTime");

-- Full-text search indexes for title and description
-- Using GIN indexes for better performance with ILIKE queries
CREATE INDEX "idx_deals_title_gin" ON "Deal" USING GIN (to_tsvector('english', "title"));
CREATE INDEX "idx_deals_description_gin" ON "Deal" USING GIN (to_tsvector('english', "description"));

-- Index for merchant status (used in JOIN condition)
CREATE INDEX "idx_merchant_status" ON "Merchant" ("status");

-- Composite index for merchant status + coordinates (for geospatial queries)
CREATE INDEX "idx_merchant_status_coordinates" ON "Merchant" ("status", "latitude", "longitude");

-- Index for merchant ID (used in foreign key relationship)
CREATE INDEX "idx_deals_merchant_id" ON "Deal" ("merchantId");

-- Composite index for the most complex query: category + active + merchant status
CREATE INDEX "idx_deals_complex_query" ON "Deal" ("category", "startTime", "endTime", "merchantId", "createdAt" DESC);

-- Index for search optimization (trigram indexes for ILIKE queries)
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX "idx_deals_title_trgm" ON "Deal" USING GIN ("title" gin_trgm_ops);
CREATE INDEX "idx_deals_description_trgm" ON "Deal" USING GIN ("description" gin_trgm_ops);

-- Additional optimized indexes for common query patterns
CREATE INDEX "idx_deals_merchant_status_active" ON "Deal" ("merchantId", "startTime", "endTime");
CREATE INDEX "idx_deals_category_merchant" ON "Deal" ("category", "merchantId");
