import { Router } from "express";
import { postAddItem, getItemList, deleteItem } from "./items.controller";
import { requireAuth } from "../../middleware/auth";

const r = Router();

r.get("/", requireAuth, getItemList);
r.post("/", requireAuth, postAddItem);
r.delete("/:id", requireAuth, deleteItem);

export default r;
