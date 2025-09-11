-- CreateEnum
CREATE TYPE "PointEventType" AS ENUM ('SIGNUP', 'FIRST_CHECKIN_DEAL', 'CHECKIN');

-- CreateTable
CREATE TABLE "UserPointEvent" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "dealId" INTEGER,
    "type" "PointEventType" NOT NULL,
    "points" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserPointEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CheckIn" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "dealId" INTEGER NOT NULL,
    "merchantId" INTEGER NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "distanceMeters" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CheckIn_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserPointEvent_userId_type_idx" ON "UserPointEvent"("userId", "type");

-- CreateIndex
CREATE INDEX "UserPointEvent_userId_dealId_idx" ON "UserPointEvent"("userId", "dealId");

-- CreateIndex
CREATE INDEX "CheckIn_userId_dealId_idx" ON "CheckIn"("userId", "dealId");

-- CreateIndex
CREATE INDEX "CheckIn_merchantId_idx" ON "CheckIn"("merchantId");

-- AddForeignKey
ALTER TABLE "UserPointEvent" ADD CONSTRAINT "UserPointEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPointEvent" ADD CONSTRAINT "UserPointEvent_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckIn" ADD CONSTRAINT "CheckIn_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckIn" ADD CONSTRAINT "CheckIn_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
