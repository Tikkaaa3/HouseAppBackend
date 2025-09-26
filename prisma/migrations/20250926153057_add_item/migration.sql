-- CreateTable
CREATE TABLE "public"."Item" (
    "id" TEXT NOT NULL,
    "houseId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Item_houseId_isArchived_idx" ON "public"."Item"("houseId", "isArchived");

-- CreateIndex
CREATE UNIQUE INDEX "Item_houseId_name_key" ON "public"."Item"("houseId", "name");

-- AddForeignKey
ALTER TABLE "public"."Item" ADD CONSTRAINT "Item_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "public"."House"("id") ON DELETE CASCADE ON UPDATE CASCADE;
