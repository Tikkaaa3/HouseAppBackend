-- CreateTable
CREATE TABLE "public"."ShoppingList" (
    "id" TEXT NOT NULL,
    "houseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShoppingList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ShoppingListItem" (
    "id" TEXT NOT NULL,
    "listId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "unitOverride" TEXT,
    "note" TEXT,
    "isChecked" BOOLEAN NOT NULL DEFAULT false,
    "checkedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShoppingListItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ShoppingList_houseId_isArchived_idx" ON "public"."ShoppingList"("houseId", "isArchived");

-- CreateIndex
CREATE UNIQUE INDEX "ShoppingList_houseId_title_key" ON "public"."ShoppingList"("houseId", "title");

-- CreateIndex
CREATE INDEX "ShoppingListItem_listId_isChecked_idx" ON "public"."ShoppingListItem"("listId", "isChecked");

-- CreateIndex
CREATE UNIQUE INDEX "ShoppingListItem_listId_itemId_key" ON "public"."ShoppingListItem"("listId", "itemId");

-- AddForeignKey
ALTER TABLE "public"."ShoppingList" ADD CONSTRAINT "ShoppingList_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "public"."House"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ShoppingListItem" ADD CONSTRAINT "ShoppingListItem_listId_fkey" FOREIGN KEY ("listId") REFERENCES "public"."ShoppingList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ShoppingListItem" ADD CONSTRAINT "ShoppingListItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "public"."Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
