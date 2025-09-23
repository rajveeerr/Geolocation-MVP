-- Migration: add_deal_image_urls (revised)
-- Purpose:
-- 1. Ensure the User referralCode unique index exists without causing duplicate name errors.
--    Earlier migration created a PARTIAL index (WHERE referralCode IS NOT NULL). Prisma
--    now attempts to create a full unique index. We normalize by dropping any existing
--    index with that name first, then recreating the standard unique index.
-- 2. Add the new imageUrls column to Deal for multiple image support.

-- 1. Recreate unique index for referralCode (idempotent style)
DROP INDEX IF EXISTS "User_referralCode_key"; -- Drop partial or previous version
CREATE UNIQUE INDEX "User_referralCode_key" ON "User"("referralCode");

-- 2. Add imageUrls array column to Deal if it does not exist yet
ALTER TABLE "Deal" ADD COLUMN IF NOT EXISTS "imageUrls" TEXT[];

-- (No data backfill needed; existing deals will just have NULL which application code should handle.)
