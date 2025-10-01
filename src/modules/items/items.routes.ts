import { Router } from "express";
import {
  postAddItem,
  getItemList,
  deleteItem,
  patchUpdateItem,
} from "./items.controller";
import { requireAuth } from "../../middleware/auth";

const r = Router();

r.get("/", requireAuth, getItemList);
r.post("/", requireAuth, postAddItem);
r.patch("/:id", requireAuth, patchUpdateItem);
r.delete("/:id", requireAuth, deleteItem);

export default r;
