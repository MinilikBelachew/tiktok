/*
  Warnings:

  - You are about to drop the column `bankDetails` on the `Withdrawal` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Withdrawal" DROP COLUMN "bankDetails",
ADD COLUMN     "accountName" VARCHAR(100),
ADD COLUMN     "accountNumber" VARCHAR(50),
ADD COLUMN     "bankName" VARCHAR(100),
ADD COLUMN     "routingNumber" VARCHAR(20),
ADD COLUMN     "swiftCode" VARCHAR(20);
