-- CreateEnum
CREATE TYPE "public"."ChoreFrequency" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY');

-- CreateTable
CREATE TABLE "public"."Chore" (
    "id" TEXT NOT NULL,
    "houseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "frequency" "public"."ChoreFrequency" NOT NULL,
    "assignedToId" TEXT,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Chore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ChoreCompletion" (
    "id" TEXT NOT NULL,
    "choreId" TEXT NOT NULL,
    "completedById" TEXT NOT NULL,
    "note" TEXT,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChoreCompletion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Chore_houseId_isArchived_idx" ON "public"."Chore"("houseId", "isArchived");

-- CreateIndex
CREATE INDEX "Chore_houseId_frequency_idx" ON "public"."Chore"("houseId", "frequency");

-- CreateIndex
CREATE INDEX "ChoreCompletion_choreId_completedAt_idx" ON "public"."ChoreCompletion"("choreId", "completedAt");

-- AddForeignKey
ALTER TABLE "public"."Chore" ADD CONSTRAINT "Chore_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "public"."House"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Chore" ADD CONSTRAINT "Chore_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChoreCompletion" ADD CONSTRAINT "ChoreCompletion_choreId_fkey" FOREIGN KEY ("choreId") REFERENCES "public"."Chore"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChoreCompletion" ADD CONSTRAINT "ChoreCompletion_completedById_fkey" FOREIGN KEY ("completedById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
