-- AlterTable
ALTER TABLE "Deal" ADD COLUMN     "kickbackEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "offerTerms" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarUrl" TEXT;

-- CreateTable
CREATE TABLE "DealMenuItem" (
    "dealId" INTEGER NOT NULL,
    "menuItemId" INTEGER NOT NULL,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DealMenuItem_pkey" PRIMARY KEY ("dealId","menuItemId")
);

-- CreateTable
CREATE TABLE "KickbackEvent" (
    "id" SERIAL NOT NULL,
    "merchantId" INTEGER NOT NULL,
    "dealId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "amountEarned" DOUBLE PRECISION NOT NULL,
    "sourceAmountSpent" DOUBLE PRECISION NOT NULL,
    "inviteeCount" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KickbackEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DealMenuItem_menuItemId_idx" ON "DealMenuItem"("menuItemId");

-- CreateIndex
CREATE INDEX "DealMenuItem_dealId_idx" ON "DealMenuItem"("dealId");

-- CreateIndex
CREATE INDEX "KickbackEvent_merchantId_createdAt_idx" ON "KickbackEvent"("merchantId", "createdAt");

-- CreateIndex
CREATE INDEX "KickbackEvent_userId_idx" ON "KickbackEvent"("userId");

-- CreateIndex
CREATE INDEX "KickbackEvent_dealId_idx" ON "KickbackEvent"("dealId");

-- CreateIndex
CREATE INDEX "KickbackEvent_userId_createdAt_idx" ON "KickbackEvent"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "DealMenuItem" ADD CONSTRAINT "DealMenuItem_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealMenuItem" ADD CONSTRAINT "DealMenuItem_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KickbackEvent" ADD CONSTRAINT "KickbackEvent_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KickbackEvent" ADD CONSTRAINT "KickbackEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KickbackEvent" ADD CONSTRAINT "KickbackEvent_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
