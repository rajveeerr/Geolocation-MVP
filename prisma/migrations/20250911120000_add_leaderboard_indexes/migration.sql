-- Add indexes to support leaderboard queries on UserPointEvent
CREATE INDEX IF NOT EXISTS "UserPointEvent_createdAt_idx" ON "UserPointEvent" ("createdAt");
CREATE INDEX IF NOT EXISTS "UserPointEvent_createdAt_userId_idx" ON "UserPointEvent" ("createdAt","userId");
