-- CreateEnum
CREATE TYPE "DealCategoryEnum" AS ENUM ('FOOD_AND_BEVERAGE', 'RETAIL', 'ENTERTAINMENT', 'HEALTH_AND_FITNESS', 'BEAUTY_AND_SPA', 'AUTOMOTIVE', 'TRAVEL', 'EDUCATION', 'TECHNOLOGY', 'HOME_AND_GARDEN', 'OTHER');

-- CreateEnum
CREATE TYPE "DealTypeEnum" AS ENUM ('STANDARD', 'HAPPY_HOUR', 'RECURRING');

-- CreateEnum
CREATE TYPE "PointEventTypeEnum" AS ENUM ('SIGNUP', 'FIRST_CHECKIN_DEAL', 'CHECKIN');

-- CreateTable
CREATE TABLE "DealCategoryMaster" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "icon" VARCHAR(100),
    "color" VARCHAR(7),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DealCategoryMaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DealTypeMaster" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DealTypeMaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PointEventTypeMaster" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "points" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PointEventTypeMaster_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DealCategoryMaster_name_key" ON "DealCategoryMaster"("name");

-- CreateIndex
CREATE UNIQUE INDEX "DealTypeMaster_name_key" ON "DealTypeMaster"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PointEventTypeMaster_name_key" ON "PointEventTypeMaster"("name");

-- CreateIndex
CREATE INDEX "DealCategoryMaster_active_sortOrder_idx" ON "DealCategoryMaster"("active", "sortOrder");

-- CreateIndex
CREATE INDEX "DealTypeMaster_active_idx" ON "DealTypeMaster"("active");

-- CreateIndex
CREATE INDEX "PointEventTypeMaster_active_idx" ON "PointEventTypeMaster"("active");

-- Insert default categories (migrate from enum)
INSERT INTO "DealCategoryMaster" ("name", "description", "sortOrder", "active", "updatedAt") VALUES
('Food & Beverage', 'Restaurants, cafes, bars, and food-related businesses', 1, true, CURRENT_TIMESTAMP),
('Retail', 'Stores, shopping centers, and retail businesses', 2, true, CURRENT_TIMESTAMP),
('Entertainment', 'Movies, games, events, and entertainment venues', 3, true, CURRENT_TIMESTAMP),
('Health & Fitness', 'Gyms, spas, wellness centers, and healthcare', 4, true, CURRENT_TIMESTAMP),
('Beauty & Spa', 'Salons, beauty treatments, and personal care', 5, true, CURRENT_TIMESTAMP),
('Automotive', 'Car services, repairs, and automotive businesses', 6, true, CURRENT_TIMESTAMP),
('Travel', 'Hotels, travel agencies, and tourism services', 7, true, CURRENT_TIMESTAMP),
('Education', 'Schools, training centers, and educational services', 8, true, CURRENT_TIMESTAMP),
('Technology', 'Tech services, electronics, and digital products', 9, true, CURRENT_TIMESTAMP),
('Home & Garden', 'Furniture, home improvement, and gardening', 10, true, CURRENT_TIMESTAMP),
('Other', 'Miscellaneous businesses and services', 99, true, CURRENT_TIMESTAMP);

-- Insert default deal types (migrate from enum)
INSERT INTO "DealTypeMaster" ("name", "description", "active", "updatedAt") VALUES
('Standard', 'Regular deals and promotions', true, CURRENT_TIMESTAMP),
('Happy Hour', 'Time-limited special offers, typically during off-peak hours', true, CURRENT_TIMESTAMP),
('Recurring', 'Deals that repeat on specific days or times', true, CURRENT_TIMESTAMP);

-- Insert default point event types (migrate from enum)
INSERT INTO "PointEventTypeMaster" ("name", "description", "points", "active", "updatedAt") VALUES
('Signup', 'Points awarded for user registration', 50, true, CURRENT_TIMESTAMP),
('First Check-in Deal', 'Bonus points for first check-in at a deal', 25, true, CURRENT_TIMESTAMP),
('Check-in', 'Points awarded for each deal check-in', 10, true, CURRENT_TIMESTAMP);
