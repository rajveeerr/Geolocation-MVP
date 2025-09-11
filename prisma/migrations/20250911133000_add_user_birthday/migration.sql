-- Add optional birthday column to User
ALTER TABLE "User" ADD COLUMN "birthday" TIMESTAMP;
-- Index for month/day lookup (expression index could be better, but simple index on birthday helps range scans)
CREATE INDEX IF NOT EXISTS "User_birthday_idx" ON "User"("birthday");
