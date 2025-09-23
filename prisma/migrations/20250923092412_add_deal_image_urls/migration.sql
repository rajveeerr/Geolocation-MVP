/*
  Adjusted migration: original auto-generated script attempted to recreate
  existing unique index "User_referralCode_key" which already exists from
  migration 20250911130000_add_referral_code, causing error 42P07.
  We keep only the Deal table modification.
*/
-- AlterTable
ALTER TABLE "Deal" DROP COLUMN "imageUrl",
ADD COLUMN     "imageUrls" TEXT[];
