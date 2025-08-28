-- AlterTable
ALTER TABLE "Bet" ADD COLUMN     "payout" DECIMAL(10,2);

-- AlterTable
ALTER TABLE "Market" ADD COLUMN     "calendar" TIMESTAMP(3),
ADD COLUMN     "participantImages" JSONB,
ADD COLUMN     "resolvedOutcome" TEXT,
ALTER COLUMN "odds" DROP NOT NULL;
