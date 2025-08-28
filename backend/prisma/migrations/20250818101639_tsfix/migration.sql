/*
  Warnings:

  - The `status` column on the `Market` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Made the column `bio` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `firstName` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `lastName` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `username` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "MarketStatus" AS ENUM ('OPEN', 'CLOSED', 'SETTLED', 'CANCELLED', 'UPCOMING');

-- AlterTable
ALTER TABLE "Market" DROP COLUMN "status",
ADD COLUMN     "status" "MarketStatus" NOT NULL DEFAULT 'OPEN';

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "bio" SET NOT NULL,
ALTER COLUMN "firstName" SET NOT NULL,
ALTER COLUMN "lastName" SET NOT NULL,
ALTER COLUMN "username" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Market_status_idx" ON "Market"("status");
