import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import {
  postCreateRecipe,
  getRecipeById,
  patchUpdateRecipe,
  deleteRecipeById,
  postAddIngredient,
  patchIngredient,
  deleteIngredient,
  getRecipesSearch,
  postSuggestRecipes,
} from "./recipes.controller";

const r = Router();

r.post("/recipes", requireAuth, postCreateRecipe);
r.get("/recipes", requireAuth, getRecipesSearch);
r.get("/recipes/:id", requireAuth, getRecipeById);
r.patch("/recipes/:id", requireAuth, patchUpdateRecipe);
r.delete("/recipes/:id", requireAuth, deleteRecipeById);
r.post("/recipes/:id/ingredients", requireAuth, postAddIngredient);
r.patch("/recipes/:id/ingredients/:ingredientId", requireAuth, patchIngredient);
r.delete(
  "/recipes/:id/ingredients/:ingredientId",
  requireAuth,
  deleteIngredient,
);

r.post("/recipes/suggest", requireAuth, postSuggestRecipes);

export default r;
