-- AlterTable
ALTER TABLE "UserActivity" ADD COLUMN     "deviceType" VARCHAR(100),
ADD COLUMN     "ipAddress" VARCHAR(45),
ADD COLUMN     "location" VARCHAR(100),
ADD COLUMN     "userAgent" TEXT;
