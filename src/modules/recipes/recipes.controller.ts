import { searchRecipes, suggestRecipes } from "./recipes.service";
import { Request, Response } from "express";
import { RecipeType } from "@prisma/client";
import {
  createRecipe,
  getRecipe,
  updateRecipe,
  deleteRecipe,
  addIngredient,
  updateIngredient,
  removeIngredient,
} from "./recipes.service";

export async function postCreateRecipe(req: Request, res: Response) {
  try {
    if (!req.user.houseId)
      return res.status(409).json({ error: "not_in_house" });

    const title =
      typeof req.body.title === "string" ? req.body.title.trim() : "";
    const type = req.body.type as RecipeType;
    const tags = Array.isArray(req.body.tags)
      ? (req.body.tags as string[])
      : undefined;
    const notes =
      typeof req.body.notes === "string" ? req.body.notes : undefined;
    const text = typeof req.body.text === "string" ? req.body.text : undefined;

    const recipe = await createRecipe({
      houseId: req.user.houseId,
      title,
      type,
      tags,
      notes,
      text,
    });

    return res.status(201).json(recipe);
  } catch (e: any) {
    const m = String(e.message);
    if (m === "invalid_title" || m === "invalid_type" || m === "invalid_tags") {
      return res.status(400).json({ error: m });
    }
    return res.status(500).json({ error: "create_recipe_failed" });
  }
}

export async function getRecipeById(req: Request, res: Response) {
  try {
    if (!req.user.houseId)
      return res.status(409).json({ error: "not_in_house" });

    const recipeId = String(req.params.id || "").trim();
    if (!recipeId) return res.status(400).json({ error: "invalid_recipe_id" });

    const recipe = await getRecipe({
      houseId: req.user.houseId,
      recipeId,
    });

    return res.status(200).json(recipe);
  } catch (e: any) {
    const m = String(e.message);
    if (m === "recipe_not_found") return res.status(404).json({ error: m });
    return res.status(500).json({ error: "get_recipe_failed" });
  }
}

export async function patchUpdateRecipe(req: Request, res: Response) {
  try {
    if (!req.user.houseId)
      return res.status(409).json({ error: "not_in_house" });

    const recipeId = String(req.params.id || "").trim();
    if (!recipeId) return res.status(400).json({ error: "invalid_recipe_id" });

    const payload: {
      title?: string;
      type?: RecipeType;
      tags?: string[];
      notes?: string | null;
      text?: string | null;
    } = {};

    if (typeof req.body.title === "string") payload.title = req.body.title;
    if (typeof req.body.type === "string")
      payload.type = req.body.type as RecipeType;
    if (req.body.tags !== undefined) {
      if (!Array.isArray(req.body.tags))
        return res.status(400).json({ error: "invalid_tags" });
      payload.tags = req.body.tags;
    }
    if (req.body.notes !== undefined) {
      if (req.body.notes !== null && typeof req.body.notes !== "string")
        return res.status(400).json({ error: "invalid_notes" });
      payload.notes = req.body.notes;
    }
    if (req.body.text !== undefined) {
      if (req.body.text !== null && typeof req.body.text !== "string")
        return res.status(400).json({ error: "invalid_text" });
      payload.text = req.body.text;
    }

    if (Object.keys(payload).length === 0) {
      return res.status(400).json({ error: "no_fields" });
    }

    const recipe = await updateRecipe({
      houseId: req.user.houseId,
      recipeId,
      ...payload,
    });

    return res.status(200).json(recipe);
  } catch (e: any) {
    const m = String(e.message);
    if (
      m === "invalid_title" ||
      m === "invalid_type" ||
      m === "invalid_tags" ||
      m === "no_fields"
    ) {
      return res.status(400).json({ error: m });
    }
    if (m === "recipe_not_found") return res.status(404).json({ error: m });
    return res.status(500).json({ error: "update_recipe_failed" });
  }
}

export async function deleteRecipeById(req: Request, res: Response) {
  try {
    if (!req.user.houseId)
      return res.status(409).json({ error: "not_in_house" });

    const recipeId = String(req.params.id || "").trim();
    if (!recipeId) return res.status(400).json({ error: "invalid_recipe_id" });

    await deleteRecipe({ houseId: req.user.houseId, recipeId });
    return res.sendStatus(204);
  } catch (e: any) {
    const m = String(e.message);
    if (m === "recipe_not_found") return res.status(404).json({ error: m });
    return res.status(500).json({ error: "delete_recipe_failed" });
  }
}

export async function postAddIngredient(req: Request, res: Response) {
  try {
    if (!req.user.houseId)
      return res.status(409).json({ error: "not_in_house" });
    const recipeId = String(req.params.id || "").trim();
    if (!recipeId) return res.status(400).json({ error: "invalid_recipe_id" });

    const itemId =
      typeof req.body.itemId === "string" ? req.body.itemId.trim() : "";
    const quantity = req.body.quantity;
    const unitOverride =
      req.body.unitOverride === null
        ? null
        : typeof req.body.unitOverride === "string"
          ? req.body.unitOverride
          : undefined;

    const ing = await addIngredient({
      houseId: req.user.houseId,
      recipeId,
      itemId,
      quantity,
      unitOverride,
    });

    return res.status(201).json(ing);
  } catch (e: any) {
    const m = String(e.message);
    if (m === "invalid_quantity" || m === "invalid_recipe_id")
      return res.status(400).json({ error: m });
    if (m === "recipe_not_found" || m === "item_not_found")
      return res.status(404).json({ error: m });
    return res.status(500).json({ error: "add_ingredient_failed" });
  }
}

export async function patchIngredient(req: Request, res: Response) {
  try {
    if (!req.user.houseId)
      return res.status(409).json({ error: "not_in_house" });
    const recipeId = String(req.params.id || "").trim();
    const ingredientId = String(req.params.ingredientId || "").trim();
    if (!recipeId || !ingredientId)
      return res.status(400).json({ error: "invalid_id" });

    const payload: {
      quantity?: string | number;
      unitOverride?: string | null;
    } = {};
    if (req.body.quantity !== undefined) payload.quantity = req.body.quantity;
    if (req.body.unitOverride !== undefined) {
      if (
        req.body.unitOverride !== null &&
        typeof req.body.unitOverride !== "string"
      )
        return res.status(400).json({ error: "invalid_unit" });
      payload.unitOverride = req.body.unitOverride;
    }
    if (!Object.keys(payload).length)
      return res.status(400).json({ error: "no_fields" });

    const ing = await updateIngredient({
      houseId: req.user.houseId,
      recipeId,
      ingredientId,
      ...payload,
    });
    return res.status(200).json(ing);
  } catch (e: any) {
    const m = String(e.message);
    if (m === "invalid_quantity" || m === "no_fields")
      return res.status(400).json({ error: m });
    if (m === "ingredient_not_found") return res.status(404).json({ error: m });
    return res.status(500).json({ error: "update_ingredient_failed" });
  }
}

export async function deleteIngredient(req: Request, res: Response) {
  try {
    if (!req.user.houseId)
      return res.status(409).json({ error: "not_in_house" });
    const recipeId = String(req.params.id || "").trim();
    const ingredientId = String(req.params.ingredientId || "").trim();
    if (!recipeId || !ingredientId)
      return res.status(400).json({ error: "invalid_id" });

    await removeIngredient({
      houseId: req.user.houseId,
      recipeId,
      ingredientId,
    });
    return res.sendStatus(204);
  } catch (e: any) {
    const m = String(e.message);
    if (m === "ingredient_not_found") return res.status(404).json({ error: m });
    return res.status(500).json({ error: "remove_ingredient_failed" });
  }
}

export async function getRecipesSearch(req: Request, res: Response) {
  try {
    if (!req.user.houseId)
      return res.status(409).json({ error: "not_in_house" });

    const q = typeof req.query.q === "string" ? req.query.q.trim() : undefined;

    const type =
      typeof req.query.type === "string" &&
      ["MEAL", "DESSERT"].includes(req.query.type)
        ? (req.query.type as RecipeType)
        : undefined;

    const tagsAny =
      typeof req.query.tags === "string" && req.query.tags.length
        ? req.query.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : undefined;

    const hasItemId =
      typeof req.query.hasItemId === "string"
        ? req.query.hasItemId.trim()
        : undefined;

    const page = req.query.page ? Number(req.query.page) : undefined;
    const pageSize = req.query.pageSize
      ? Number(req.query.pageSize)
      : undefined;

    const result = await searchRecipes({
      houseId: req.user.houseId,
      q,
      type,
      tagsAny,
      hasItemId,
      page,
      pageSize,
    });

    return res.status(200).json(result);
  } catch {
    return res.status(500).json({ error: "search_recipes_failed" });
  }
}

export async function postSuggestRecipes(req: Request, res: Response) {
  try {
    if (!req.user.houseId)
      return res.status(409).json({ error: "not_in_house" });

    const items = Array.isArray(req.body.items) ? req.body.items : [];
    if (!items.length) return res.status(400).json({ error: "no_items" });

    const type =
      typeof req.body.type === "string" &&
      ["MEAL", "DESSERT"].includes(req.body.type)
        ? (req.body.type as RecipeType)
        : undefined;

    const limit = req.body.limit != null ? Number(req.body.limit) : undefined;
    const missing =
      req.body.missing != null ? Number(req.body.missing) : undefined;

    const recipes = await suggestRecipes({
      houseId: req.user.houseId,
      availableItemIds: items.map(String),
      type,
      limit,
      missing, // NEW
    });

    return res.status(200).json(recipes);
  } catch {
    return res.status(500).json({ error: "suggest_recipes_failed" });
  }
}
