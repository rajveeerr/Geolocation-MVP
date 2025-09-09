-- CreateEnum
CREATE TYPE "DealType" AS ENUM ('STANDARD', 'HAPPY_HOUR', 'RECURRING');

-- DropIndex
DROP INDEX "idx_deals_active_approved_created";

-- DropIndex
DROP INDEX "idx_deals_category";

-- DropIndex
DROP INDEX "idx_deals_category_active";

-- DropIndex
DROP INDEX "idx_deals_category_merchant";

-- DropIndex
DROP INDEX "idx_deals_complex_query";

-- DropIndex
DROP INDEX "idx_deals_description_trgm";

-- DropIndex
DROP INDEX "idx_deals_merchant_id";

-- DropIndex
DROP INDEX "idx_deals_merchant_status_active";

-- DropIndex
DROP INDEX "idx_deals_title_trgm";

-- DropIndex
DROP INDEX "idx_merchant_status";

-- DropIndex
DROP INDEX "idx_merchant_status_coordinates";

-- AlterTable
ALTER TABLE "Deal" ADD COLUMN     "dealType" "DealType" NOT NULL DEFAULT 'STANDARD',
ADD COLUMN     "recurringDays" TEXT;

-- CreateTable
CREATE TABLE "UserDeal" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "dealId" INTEGER NOT NULL,
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserDeal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserDeal_userId_dealId_key" ON "UserDeal"("userId", "dealId");

-- AddForeignKey
ALTER TABLE "UserDeal" ADD CONSTRAINT "UserDeal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDeal" ADD CONSTRAINT "UserDeal_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
