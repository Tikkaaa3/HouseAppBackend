import { prisma } from "../../config/prisma";
import { Recipe, RecipeType, Prisma } from "@prisma/client";

export async function createRecipe(input: {
  houseId: string;
  title: string;
  type: RecipeType;
  tags?: string[];
  notes?: string | null;
  text?: string | null;
}): Promise<Recipe> {
  const title = input.title?.trim();
  if (!title) throw new Error("invalid_title");

  if (!Object.values(RecipeType).includes(input.type)) {
    throw new Error("invalid_type");
  }

  const tags = Array.isArray(input.tags) ? input.tags : [];
  const notes = input.notes != null ? String(input.notes).trim() || null : null;
  const text = input.text != null ? String(input.text).trim() || null : null;

  const created = await prisma.recipe.create({
    data: {
      houseId: input.houseId,
      title,
      type: input.type,
      tags,
      notes,
      text,
    },
  });
  return created;
}

export async function getRecipe(input: {
  houseId: string;
  recipeId: string;
}): Promise<
  Recipe & {
    ingredients: Array<{
      id: string;
      quantity: Prisma.Decimal;
      unitOverride: string | null;
      item: {
        id: string;
        name: string;
        unit: string;
        category: string;
        tags: string[];
      };
    }>;
  }
> {
  const r = await prisma.recipe.findUnique({
    where: { id: input.recipeId },
    include: {
      ingredients: {
        include: { item: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!r || r.houseId !== input.houseId) throw new Error("recipe_not_found");
  return r as any;
}

export async function updateRecipe(input: {
  houseId: string;
  recipeId: string;
  title?: string;
  type?: RecipeType;
  tags?: string[];
  notes?: string | null;
  text?: string | null;
}): Promise<Recipe> {
  const existing = await prisma.recipe.findUnique({
    where: { id: input.recipeId },
  });
  if (!existing || existing.houseId !== input.houseId)
    throw new Error("recipe_not_found");

  const data: Partial<
    Pick<Recipe, "title" | "type" | "tags" | "notes" | "text">
  > = {};

  if (input.title !== undefined) {
    const t = input.title.trim();
    if (!t) throw new Error("invalid_title");
    data.title = t;
  }

  if (input.type !== undefined) {
    if (!Object.values(RecipeType).includes(input.type))
      throw new Error("invalid_type");
    data.type = input.type;
  }

  if (input.tags !== undefined) {
    if (!Array.isArray(input.tags)) throw new Error("invalid_tags");
    data.tags = input.tags;
  }

  if (input.notes !== undefined) {
    data.notes =
      input.notes != null ? String(input.notes).trim() || null : null;
  }

  if (input.text !== undefined) {
    data.text = input.text != null ? String(input.text).trim() || null : null;
  }

  if (Object.keys(data).length === 0) throw new Error("no_fields");

  const updated = await prisma.recipe.update({
    where: { id: input.recipeId },
    data,
  });
  return updated;
}

export async function deleteRecipe(input: {
  houseId: string;
  recipeId: string;
}): Promise<void> {
  const existing = await prisma.recipe.findUnique({
    where: { id: input.recipeId },
  });
  if (!existing || existing.houseId !== input.houseId)
    throw new Error("recipe_not_found");
  await prisma.recipe.delete({ where: { id: input.recipeId } });
}

export async function addIngredient(input: {
  houseId: string;
  recipeId: string;
  itemId: string;
  quantity: string | number;
  unitOverride?: string | null;
}) {
  const recipe = await prisma.recipe.findUnique({
    where: { id: input.recipeId },
  });
  if (!recipe || recipe.houseId !== input.houseId)
    throw new Error("recipe_not_found");

  const item = await prisma.item.findUnique({ where: { id: input.itemId } });
  if (!item || item.houseId !== input.houseId)
    throw new Error("item_not_found");

  const qtyStr = String(input.quantity).trim();
  if (!qtyStr || isNaN(Number(qtyStr))) throw new Error("invalid_quantity");
  const qty = new Prisma.Decimal(qtyStr);
  if (qty.lte(0)) throw new Error("invalid_quantity");
  const unitOverride = input.unitOverride?.trim() || null;

  const existing = await prisma.recipeIngredient.findUnique({
    where: {
      recipeId_itemId: { recipeId: input.recipeId, itemId: input.itemId },
    },
  });

  if (existing) {
    const merged = existing.quantity.plus(qty);
    return prisma.recipeIngredient.update({
      where: { id: existing.id },
      data: { quantity: merged, unitOverride },
    });
  }

  return prisma.recipeIngredient.create({
    data: {
      recipeId: input.recipeId,
      itemId: input.itemId,
      quantity: qty,
      unitOverride,
    },
  });
}

export async function updateIngredient(input: {
  houseId: string;
  recipeId: string;
  ingredientId: string;
  quantity?: string | number;
  unitOverride?: string | null;
}) {
  const ing = await prisma.recipeIngredient.findUnique({
    where: { id: input.ingredientId },
    include: { recipe: true },
  });
  if (
    !ing ||
    ing.recipeId !== input.recipeId ||
    ing.recipe.houseId !== input.houseId
  )
    throw new Error("ingredient_not_found");

  const data: { quantity?: Prisma.Decimal; unitOverride?: string | null } = {};

  if (input.quantity !== undefined) {
    const qs = String(input.quantity).trim();
    if (!qs || isNaN(Number(qs))) throw new Error("invalid_quantity");
    const q = new Prisma.Decimal(qs);
    if (q.lte(0)) throw new Error("invalid_quantity");
    data.quantity = q;
  }

  if (input.unitOverride !== undefined) {
    data.unitOverride = input.unitOverride ? input.unitOverride.trim() : null;
  }

  if (!Object.keys(data).length) throw new Error("no_fields");

  return prisma.recipeIngredient.update({ where: { id: ing.id }, data });
}

export async function removeIngredient(input: {
  houseId: string;
  recipeId: string;
  ingredientId: string;
}): Promise<void> {
  const ing = await prisma.recipeIngredient.findUnique({
    where: { id: input.ingredientId },
    include: { recipe: true },
  });
  if (
    !ing ||
    ing.recipeId !== input.recipeId ||
    ing.recipe.houseId !== input.houseId
  )
    throw new Error("ingredient_not_found");

  await prisma.recipeIngredient.delete({ where: { id: input.ingredientId } });
}

export async function searchRecipes(input: {
  houseId: string;
  q?: string;
  type?: RecipeType;
  tagsAny?: string[];
  hasItemId?: string;
  archived?: boolean;
  page?: number;
  pageSize?: number;
}) {
  const page = Math.max(1, input.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, input.pageSize ?? 20));
  const skip = (page - 1) * pageSize;

  const where: Prisma.RecipeWhereInput = {
    houseId: input.houseId,
    ...(input.archived ? {} : {}),
  };

  if (input.q?.trim()) {
    const q = input.q.trim();
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { text: { contains: q, mode: "insensitive" } },
      { tags: { has: q } },
    ];
  }

  if (input.type) where.type = input.type;

  if (input.tagsAny && input.tagsAny.length > 0) {
    where.tags = { hasSome: input.tagsAny };
  }

  if (input.hasItemId) {
    where.ingredients = {
      some: { itemId: input.hasItemId },
    };
  }

  const [rows, total] = await Promise.all([
    prisma.recipe.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip,
      take: pageSize,
      select: {
        id: true,
        title: true,
        type: true,
        tags: true,
        text: true,
        updatedAt: true,
        createdAt: true,
      },
    }),
    prisma.recipe.count({ where }),
  ]);

  return {
    page,
    pageSize,
    total,
    items: rows,
  };
}

export async function suggestRecipes(input: {
  houseId: string;
  availableItemIds: string[];
  type?: RecipeType;
  limit?: number;
  missing?: number;
}) {
  const ids = Array.from(new Set(input.availableItemIds)).filter(Boolean);
  if (!ids.length) return [];

  const links = await prisma.recipeIngredient.findMany({
    where: {
      itemId: { in: ids },
      recipe: {
        houseId: input.houseId,
        ...(input.type ? { type: input.type } : {}),
      },
    },
    select: { recipeId: true, itemId: true },
  });

  const matchedByRecipe = new Map<string, Set<string>>();
  for (const l of links) {
    if (!matchedByRecipe.has(l.recipeId))
      matchedByRecipe.set(l.recipeId, new Set());
    matchedByRecipe.get(l.recipeId)!.add(l.itemId);
  }

  const totals = await prisma.recipeIngredient.groupBy({
    by: ["recipeId"],
    where: {
      recipe: {
        houseId: input.houseId,
        ...(input.type ? { type: input.type } : {}),
      },
    },
    _count: { itemId: true },
  });

  const allowedMissing = input.missing ?? 0;

  const ranked = totals
    .map((t) => {
      const matched = matchedByRecipe.get(t.recipeId)?.size || 0;
      const total = t._count.itemId;
      const missing = total - matched;
      const matchPct = total ? matched / total : 0;
      return { recipeId: t.recipeId, matched, total, missing, matchPct };
    })
    .filter((x) => x.missing <= allowedMissing)
    .sort((a, b) => a.missing - b.missing || b.matchPct - a.matchPct)
    .slice(0, input.limit ?? 20);

  if (!ranked.length) return [];

  const byId = new Map(ranked.map((r) => [r.recipeId, r]));
  const recipes = await prisma.recipe.findMany({
    where: { id: { in: ranked.map((r) => r.recipeId) } },
    include: {
      ingredients: { include: { item: true }, orderBy: { createdAt: "asc" } },
    },
  });

  const ordered = ranked.map((r) => {
    const rec = recipes.find((x) => x.id === r.recipeId)!;
    return {
      ...rec,
      match: {
        matched: r.matched,
        total: r.total,
        missing: r.missing,
        matchPct: r.matchPct,
      },
    };
  });

  return ordered;
}
