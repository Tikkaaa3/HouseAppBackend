import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import {
  postCreateList,
  postAddLine,
  getListById,
  deleteLine,
  postArchiveList,
} from "./shopping.controller";

const r = Router();

r.post("/shopping-lists", requireAuth, postCreateList);
r.get("/shopping-lists/:id", requireAuth, getListById);
r.post("/shopping-lists/:id/items", requireAuth, postAddLine);
r.delete("/shopping-lists/:listId/items/:lineId", requireAuth, deleteLine);
r.post("/shopping-lists/:listId/archive", requireAuth, postArchiveList);

export default r;
