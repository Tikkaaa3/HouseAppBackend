import { Prisma, ShoppingList, ShoppingListItem } from "@prisma/client";
import { prisma } from "../../config/prisma";

export async function createList(input: {
  houseId: string;
  title: string;
}): Promise<ShoppingList> {
  const title = input.title?.trim();
  if (!title) throw new Error("invalid_title");

  const existing = await prisma.shoppingList.findUnique({
    where: { houseId_title: { houseId: input.houseId, title } },
  });

  if (existing) {
    if (existing.isArchived) {
      const revived = await prisma.shoppingList.update({
        where: { id: existing.id },
        data: { isArchived: false },
      });
      return revived;
    }
    throw new Error("list_exists");
  }

  return prisma.shoppingList.create({
    data: { houseId: input.houseId, title },
  });
}

export async function addLine(input: {
  houseId: string;
  listId: string;
  itemId: string;
  quantity: string | number;
  unitOverride?: string | null;
  note?: string | null;
}): Promise<ShoppingListItem> {
  const list = await prisma.shoppingList.findUnique({
    where: { id: input.listId },
  });
  if (!list || list.houseId !== input.houseId)
    throw new Error("list_not_found");
  if (list.isArchived) throw new Error("list_archived");

  const item = await prisma.item.findUnique({ where: { id: input.itemId } });
  if (!item || item.houseId !== input.houseId)
    throw new Error("item_not_found");

  const qtyStr = String(input.quantity).trim();
  if (!qtyStr || isNaN(Number(qtyStr))) throw new Error("invalid_quantity");
  const qty = new Prisma.Decimal(qtyStr);
  if (qty.lte(0)) throw new Error("invalid_quantity");

  const unitOverride = input.unitOverride?.trim() || null;
  const note = input.note?.trim() || null;

  const existingLine = await prisma.shoppingListItem.findUnique({
    where: { listId_itemId: { listId: input.listId, itemId: input.itemId } },
  });

  if (existingLine) {
    const mergedQty = existingLine.quantity.plus(qty);
    return prisma.shoppingListItem.update({
      where: { id: existingLine.id },
      data: { quantity: mergedQty, unitOverride, note },
    });
  }

  return prisma.shoppingListItem.create({
    data: {
      listId: input.listId,
      itemId: input.itemId,
      quantity: qty,
      unitOverride,
      note,
    },
  });
}

export async function listLists(input: {
  houseId: string;
  archived?: boolean;
}) {
  const archived = input.archived ?? false;
  return prisma.shoppingList.findMany({
    where: { houseId: input.houseId, isArchived: archived },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      isArchived: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { items: true } },
    },
  });
}

export async function getList(input: {
  houseId: string;
  listId: string;
}): Promise<
  ShoppingList & {
    items: (ShoppingListItem & {
      item: {
        id: string;
        name: string;
        unit: string;
        category: string;
        tags: string[];
      };
    })[];
  }
> {
  const list = await prisma.shoppingList.findUnique({
    where: { id: input.listId },
    include: {
      items: {
        include: { item: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!list || list.houseId !== input.houseId)
    throw new Error("list_not_found");
  return list;
}

export async function removeLine(input: {
  houseId: string;
  listId: string;
  lineId: string;
}): Promise<void> {
  const line = await prisma.shoppingListItem.findUnique({
    where: { id: input.lineId },
    include: { list: true },
  });
  if (
    !line ||
    line.listId !== input.listId ||
    line.list.houseId !== input.houseId
  ) {
    throw new Error("line_not_found");
  }
  await prisma.shoppingListItem.delete({ where: { id: input.lineId } });
}

export async function archiveList(input: {
  houseId: string;
  listId: string;
}): Promise<void> {
  const list = await prisma.shoppingList.findUnique({
    where: { id: input.listId },
  });
  if (!list || list.houseId !== input.houseId) {
    throw new Error("list_not_found");
  }

  await prisma.$transaction(async (tx) => {
    await tx.shoppingListItem.deleteMany({ where: { listId: input.listId } });

    await tx.shoppingList.update({
      where: { id: input.listId },
      data: { isArchived: true },
    });
  });
}
