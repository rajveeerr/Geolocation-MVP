/*
  Warnings:

  - You are about to drop the column `category` on the `Deal` table. All the data in the column will be lost.
  - You are about to drop the column `dealType` on the `Deal` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `UserPointEvent` table. All the data in the column will be lost.
  - Added the required column `categoryId` to the `Deal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dealTypeId` to the `Deal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pointEventTypeId` to the `UserPointEvent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "MerchantStatus" ADD VALUE 'SUSPENDED';

-- DropIndex
DROP INDEX "UserPointEvent_userId_type_idx";

-- AlterTable
ALTER TABLE "Deal" DROP COLUMN "category",
DROP COLUMN "dealType",
ADD COLUMN     "categoryId" INTEGER NOT NULL,
ADD COLUMN     "dealTypeId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "UserPointEvent" DROP COLUMN "type",
ADD COLUMN     "pointEventTypeId" INTEGER NOT NULL;

-- DropEnum
DROP TYPE "DealCategoryEnum";

-- DropEnum
DROP TYPE "DealTypeEnum";

-- DropEnum
DROP TYPE "PointEventTypeEnum";

-- CreateIndex
CREATE INDEX "UserPointEvent_userId_pointEventTypeId_idx" ON "UserPointEvent"("userId", "pointEventTypeId");

-- AddForeignKey
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "DealCategoryMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_dealTypeId_fkey" FOREIGN KEY ("dealTypeId") REFERENCES "DealTypeMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPointEvent" ADD CONSTRAINT "UserPointEvent_pointEventTypeId_fkey" FOREIGN KEY ("pointEventTypeId") REFERENCES "PointEventTypeMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
