-- Add self-referential referral tracking columns
ALTER TABLE "User" ADD COLUMN "referredByUserId" INTEGER;

-- Index for lookups by referrer
CREATE INDEX "User_referredByUserId_idx" ON "User"("referredByUserId");

-- Add FK constraint (deferred optional)
ALTER TABLE "User" ADD CONSTRAINT "User_referredByUserId_fkey" FOREIGN KEY ("referredByUserId") REFERENCES "User"(id) ON DELETE SET NULL ON UPDATE CASCADE;
