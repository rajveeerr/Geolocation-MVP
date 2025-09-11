-- Drop old covering index if it existed in earlier development iterations
DROP INDEX IF EXISTS "UserPointEvent_createdAt_userId_points_idx";
