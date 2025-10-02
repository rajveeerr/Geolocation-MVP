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
INSERT INTO "DealCategoryMaster" ("name", "description", "sortOrder", "active") VALUES
('Food & Beverage', 'Restaurants, cafes, bars, and food-related businesses', 1, true),
('Retail', 'Stores, shopping centers, and retail businesses', 2, true),
('Entertainment', 'Movies, games, events, and entertainment venues', 3, true),
('Health & Fitness', 'Gyms, spas, wellness centers, and healthcare', 4, true),
('Beauty & Spa', 'Salons, beauty treatments, and personal care', 5, true),
('Automotive', 'Car services, repairs, and automotive businesses', 6, true),
('Travel', 'Hotels, travel agencies, and tourism services', 7, true),
('Education', 'Schools, training centers, and educational services', 8, true),
('Technology', 'Tech services, electronics, and digital products', 9, true),
('Home & Garden', 'Furniture, home improvement, and gardening', 10, true),
('Other', 'Miscellaneous businesses and services', 99, true);

-- Insert default deal types (migrate from enum)
INSERT INTO "DealTypeMaster" ("name", "description", "active") VALUES
('Standard', 'Regular deals and promotions', true),
('Happy Hour', 'Time-limited special offers, typically during off-peak hours', true),
('Recurring', 'Deals that repeat on specific days or times', true);

-- Insert default point event types (migrate from enum)
INSERT INTO "PointEventTypeMaster" ("name", "description", "points", "active") VALUES
('Signup', 'Points awarded for user registration', 50, true),
('First Check-in Deal', 'Bonus points for first check-in at a deal', 25, true),
('Check-in', 'Points awarded for each deal check-in', 10, true);
