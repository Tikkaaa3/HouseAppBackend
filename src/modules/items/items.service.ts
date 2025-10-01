import { prisma } from "../../config/prisma";
import { Item } from "@prisma/client";
type Obj = {
  houseId: string;
  q?: string;
  category?: string;
  archived?: boolean;
};

type AddInput = {
  houseId: string;
  name: string;
  category: string;
  unit: string;
  tags?: string[];
};

type UpdateInput = {
  id: string;
  houseId: string;
  name?: string;
  category?: string;
  unit?: string;
  tags?: string[];
};

type RemoveInput = { houseId: string; id: string };

export async function list(obj: Obj): Promise<Item[]> {
  const q = obj.q?.trim() || undefined;
  const category = obj.category?.trim() || undefined;
  const archived = obj.archived ?? false;
  const houseId = obj.houseId;
  const where: any = { houseId, isArchived: archived };
  if (q) where.name = { contains: q, mode: "insensitive" };
  if (category) where.category = category;
  const items = await prisma.item.findMany({
    where,
    orderBy: { name: "asc" },
  });
  return items;
}

export async function addItem(input: AddInput): Promise<Item> {
  const name = input.name.trim();
  if (!name) throw new Error("invalid_name");
  const category = input.category.trim();
  if (!category) throw new Error("invalid_category");
  const unit = input.unit.trim();
  if (!unit) throw new Error("invalid_unit");
  const tags = input.tags ?? [];
  let existing = await prisma.item.findUnique({
    where: { houseId_name: { houseId: input.houseId, name } },
  });
  if (existing && existing.isArchived == true) {
    existing = await prisma.item.update({
      where: { id: existing.id },
      data: { isArchived: false },
    });
    return existing;
  }
  if (existing) throw new Error("item_exists");
  const created = await prisma.item.create({
    data: {
      houseId: input.houseId,
      name,
      category,
      unit,
      tags,
      isArchived: false,
    },
  });
  return created;
}

export async function removeItem(input: RemoveInput): Promise<void> {
  const item = await prisma.item.findUnique({
    where: { id: input.id },
  });
  if (!item || item.houseId !== input.houseId)
    throw new Error("item_not_found");
  if (item.isArchived) return;

  await prisma.item.update({
    where: { id: input.id },
    data: { isArchived: true },
  });
  return;
}

export async function updateItem(input: UpdateInput): Promise<Item> {
  const existing = await prisma.item.findUnique({ where: { id: input.id } });
  if (!existing || existing.houseId !== input.houseId) {
    throw new Error("item_not_found");
  }

  const name = input.name !== undefined ? input.name.trim() : undefined;
  const category =
    input.category !== undefined ? input.category.trim() : undefined;
  const unit = input.unit !== undefined ? input.unit.trim() : undefined;
  const tags = input.tags; // may be undefined

  const data: Partial<Pick<Item, "name" | "category" | "unit" | "tags">> = {};

  if (name !== undefined) {
    if (!name) throw new Error("invalid_name");
    if (name !== existing.name) {
      const dup = await prisma.item.findUnique({
        where: { houseId_name: { houseId: input.houseId, name } },
      });
      if (dup && dup.id !== existing.id) throw new Error("item_exists");
    }
    data.name = name;
  }

  if (category !== undefined) {
    if (!category) throw new Error("invalid_category");
    data.category = category;
  }

  if (unit !== undefined) {
    if (!unit) throw new Error("invalid_unit");
    data.unit = unit;
  }

  if (tags !== undefined) {
    if (!Array.isArray(tags)) throw new Error("invalid_tags");
    data.tags = tags;
  }

  if (Object.keys(data).length === 0) {
    throw new Error("no_fields");
  }

  const updated = await prisma.item.update({
    where: { id: existing.id },
    data,
  });

  return updated;
}
